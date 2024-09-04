
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class JournalCascadeGenerator extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);

    this.object = {
      folder: '',
      character: '',
      mainText: 'description',
      type: 'character',
      includeSpells: true,
      useLinks: true,
      selects: CONFIG.exaltedthird.selects,
      filterByPrerequisiteCharms: false,
    }

    this.object.folders = game.collections.get("Item")?._formatFolderSelectOptions()
      .reduce((acc, folder) => {
        acc[folder.id] = folder.name;
        return acc;
      }, {}) ?? {};

    this.object.characters = game.actors
      .filter(actor => actor.type === 'character')
      .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      .reduce((acc, actor) => {
        acc[actor.id] = actor.name;
        return acc;
      }, {});

    // this.tabs = [
    //   {
    //     tab: "charm",
    //     label: "Ex3.Charm",
    //     svg: "icons/svg/explosion.svg",
    //   },
    // ];
  }

  static DEFAULT_OPTIONS = {
    window: {
      title: "Generate Charm Journals",
    },
    tag: "form",
    form: {
      handler: JournalCascadeGenerator.myFormHandler,
      submitOnClose: false,
      submitOnChange: true,
      closeOnSubmit: false
    },
    classes: [`solar-background`],
    position: { width: 550 },
  };

  static PARTS = {
    // tabs: {
    //   id: "tabs",
    //   classes: ["tabs", "tabs-left"],
    //   template: "templates/generic/tab-navigation.hbs",
    // },
    form: {
      template: "systems/exaltedthird/templates/dialogues/journal-cascade-generator.html",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  async _prepareContext(_options) {
    return {
      data: this.object,
      buttons: [
        { type: "submit", icon: "fa-solid fa-save", label: "Ex3.Generate" }
      ],
      // tabs: [
      //   {
      //     tab: "charm",
      //     label: "Ex3.Charm",
      //     svg: "icons/svg/explosion.svg",
      //   },
      // ]
    };
  }

  static async myFormHandler(event, form, formData) {
    // Do things with the returned FormData
    const formObject = foundry.utils.expandObject(formData.object);

    for (let key in formObject.object) {
      this.object[key] = formObject.object[key];
    }

    if (event.type === 'submit') {
      await this.generateJournals();
      ui.notifications.notify(`Generation Complete`);
    }
    this.render();
  }

  async generateJournals() {
    if (!this.object.folder && !this.object.character) {
      return;
    }
    if (this.object.type === 'folder') {
      if (!this.object.folder) {
        return;
      }
      const mainFolder = game.folders.get(this.object.folder);
      const folders = mainFolder.getSubfolders(true);
      const folderIds = folders.map(folder => folder.id);
      folderIds.push(this.object.folder);
      let charms = game.items.filter(item => item.type === 'charm' && item.folder && folderIds.includes(item.folder.id));

      let spells = game.items.filter(item => item.type === 'spell' && item.folder && folderIds.includes(item.folder.id));

      const folderCharms = charms.sort(function (a, b) {
        const sortValueA = a.system.requirement;
        const sortValueB = b.system.requirement;
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      });

      const folder = await Folder.create({ name: `${mainFolder.name} Cards`, type: 'JournalEntry' });

      const charmsMap = await this.createCharmMap(folderCharms, charms);
      const spellsMap = await this.createSpellsMap(spells);

      for (let [name, charmsList] of Object.entries(charmsMap)) {
        this.createCharmJournal(charmsList, name, folder, charms);
      }

      if (this.object.includeSpells) {
        for (let [name, spellsList] of Object.entries(spellsMap)) {
          this.createSpellJournal(spellsList, name, folder);
        }
      }
    }
    if (this.object.type === 'character') {
      if (!this.object.character) {
        return;
      }
      const fullCharacter = game.actors.get(this.object.character);
      const itemIds = fullCharacter.items.map(item => {
        const sourceId = item.flags?.core?.sourceId || ''; // Handle cases where sourceId is undefined
        const sections = sourceId.split('.'); // Split the sourceId by periods
        return sections.length > 1 ? sections.pop() : '';
      }).filter(section => section.trim() !== '');

      const nonAbilityCharms = game.items.filter(charm => charm.system.charmtype === 'martialarts' || charm.system.charmtype === 'evocation').filter(charm => {
        if (charm.system.charmtype === 'martialarts') {
          if (charm.system.parentitemid) {
            return Object.values(fullCharacter.items.filter(item => item.type === 'customability' || item.system.abilitytype === 'martialart')).some(martialArt => {
              const sourceId = martialArt.flags?.core?.sourceId || '';
              const sections = sourceId.split('.');
              return sections.includes(charm.system.parentitemid) && charm.system.requirement <= martialArt.system.points
            });
          }
          return false;
        }
        if (charm.system.charmtype === 'evocation') {
          if (charm.system.parentitemid) {
            return itemIds.includes(charm.system.parentitemid);
          }
          return false;
        }
        return false;
      });
      let charms = game.items.filter(item => item.type === 'charm' && item.system.charmtype === fullCharacter.system.details.exalt);

      let spells = game.items.filter(item => item.type === 'spell');

      let characterCharms = charms.filter(charm => (charm.system.essence <= fullCharacter.system.essence.value && fullCharacter.system.attributes[charm.system.ability] && charm.system.requirement <= fullCharacter.system.attributes[charm.system.ability].value) || fullCharacter.system.abilities[charm.system.ability] && charm.system.requirement <= fullCharacter.system.abilities[charm.system.ability].value);

      const archetypeCharm = charms.filter(charm => (charm.system.essence <= fullCharacter.system.essence.value && fullCharacter.system.attributes[charm.system.archetype.ability] && charm.system.requirement <= fullCharacter.system.attributes[charm.system.archetype.ability].value) || fullCharacter.system.abilities[charm.system.archetype.ability] && charm.system.requirement <= fullCharacter.system.abilities[charm.system.archetype.ability].value);

      characterCharms = characterCharms.concat(archetypeCharm);
      characterCharms = characterCharms.concat(nonAbilityCharms);

      characterCharms = characterCharms.sort(function (a, b) {
        const sortValueA = a.system.requirement;
        const sortValueB = b.system.requirement;
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      });

      const characterSpells = spells.filter(spell => {
        if (spell.system.circle === 'terrestrial' && fullCharacter.system.settings.sorcerycircle !== 'none') {
          return true;
        }
        if (spell.system.circle === 'celestial' && fullCharacter.system.settings.sorcerycircle !== 'terrestrial' && fullCharacter.system.settings.sorcerycircle !== 'none') {
          return true;
        }
        if (spell.system.circle === 'solar' && fullCharacter.system.settings.sorcerycircle === 'solar') {
          return true;
        }
        if (spell.system.circle === 'ivory' && fullCharacter.system.settings.necromancycircle !== 'none') {
          return true;
        }
        if (spell.system.circle === 'shadow' && fullCharacter.system.settings.necromancycircle !== 'ivory' && fullCharacter.system.settings.necromancycircle !== 'none') {
          return true;
        }
        if (spell.system.circle === 'void' && fullCharacter.system.settings.necromancycircle === 'void') {
          return true;
        }
        return false;
      });
      const charmsMap = await this.createCharmMap(characterCharms, charms);

      const spellsMap = await this.createSpellsMap(characterSpells);

      const folder = await Folder.create({ name: `${fullCharacter.name} Cards`, type: 'JournalEntry' });

      for (let [name, charmsList] of Object.entries(charmsMap)) {
        this.createCharmJournal(charmsList, name, folder, charms);
      }
      if (this.object.includeSpells) {
        for (let [name, spellsList] of Object.entries(spellsMap)) {
          this.createSpellJournal(spellsList, name, folder);
        }
      }
    }
  }

  async createCharmMap(charms, fullCharms) {
    const charmsMap = {};
    charms.forEach(charm => {
      let abilityKey = charm.system.ability;
      if ((charm.system.charmtype === "martialarts" || charm.system.charmtype === "evocation") && charm.system.parentitemid) {
        let parentItem = game.items.get(charm.system.parentitemid);
        if (parentItem) {
          abilityKey = parentItem.name;
        }
      }
      if (!charmsMap[abilityKey]) {
        charmsMap[abilityKey] = [];
      }
      if (charm.system.charmprerequisites) {
        for (const prereq of charm.system.charmprerequisites) {
          const charmPrereq = game.items.get(prereq.id);
          if (charmPrereq?.uuid) {
            prereq.uuid = charmPrereq.uuid;
          }
        }
      }
      charm.system.leadsTo = fullCharms.filter(globalCharm => globalCharm.system.charmprerequisites.map(prereqCharm => prereqCharm.id).includes(charm.id));
      charmsMap[abilityKey].push(charm);

      if (charm.system.archetype.ability) {
        const charmCopy = JSON.parse(JSON.stringify(charm));
        if (!charmsMap[charmCopy.system.archetype.ability]) {
          charmsMap[charmCopy.system.archetype.ability] = [];
        }
        if (charmCopy.system.archetype.charmprerequisites) {
          for (const prereq of charmCopy.system.archetype.charmprerequisites) {
            const charmPrereq = game.items.get(prereq.id);
            if (charmPrereq?.uuid) {
              prereq.uuid = charmPrereq.uuid;
            }
          }
        }
        charmCopy.system.leadsTo = fullCharms.filter(globalCharm => globalCharm.system.archetype.charmprerequisites.map(prereqCharm => prereqCharm.id).includes(charmCopy.id));
        charmCopy.useArchetype = true;
        charmCopy.uuid = charm.uuid;
        charmsMap[charmCopy.system.archetype.ability].push(charmCopy);
      }
    });
    return charmsMap;
  }

  async createSpellsMap(spells) {
    const spellsMap = {};
    spells.forEach(spell => {
      if (!spellsMap[spell.system.circle]) {
        spellsMap[spell.system.circle] = [];
      }
      spellsMap[spell.system.circle].push(spell);
    });
    return spellsMap;
  }

  async createSpellJournal(spells, name, folder) {
    const spellsMap = {
      'terrestrial': [],
      'celestial': [],
      'solar': [],
      'ivory': [],
      'shadow': [],
      'voice': [],
      'other': [],
    };
    spells.forEach(spell => {
      if (spellsMap[spell.system.circle]) {
        spellsMap[spell.system.circle].push(spell);
      }
      else {
        spellsMap['other'].push(spell);
      }
    });

    const pages = [];
    for (let [circle, spellsList] of Object.entries(spellsMap)) {
      if (spellsList.length > 0) {
        let spellsListHtml = '';
        for (const spell of spellsList) {
          let templateData = {
            spell: spell,
            descriptionText: this.object.mainText,
            useLinks: this.object.useLinks,
          }
          const spellHtml = await renderTemplate("systems/exaltedthird/templates/journal/spell-cascade-journal.html", templateData);
          spellsListHtml += spellHtml;
        }
        let fullListHtml = this.object.mainText === 'summary' ? `<div class="journal-charm-cards grid grid-2col">${spellsListHtml}</div>` : `<div class="journal-charm-cards">${spellsListHtml}</div>`;
        var listingCircle = circle.charAt(0).toUpperCase() + circle.slice(1);
        pages.push(
          {
            name: `${listingCircle} Circle`,
            type: 'text',
            text: {
              content: fullListHtml,
              format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
            }
          }
        );
      }
    }
    if (this.object.type === 'character') {
      const fullCharacter = game.actors.get(this.object.character);
      const characterSpells = fullCharacter.items.filter(item => item.type === 'spell' && item.system.ability === name);
      if (characterSpells.length > 0) {
        let spellListHtml = '';
        for (const spell of characterSpells) {
          let templateData = {
            spell: spell,
            descriptionText: this.object.mainText,
            useLinks: this.object.useLinks,
          }
          const charmHtml = await renderTemplate("systems/exaltedthird/templates/journal/spell-cascade-journal.html", templateData);
          spellListHtml += charmHtml;
        }
        let fullListHtml = this.object.mainText === 'summary' ? `<div class="journal-charm-cards grid grid-2col">${spellListHtml}</div>` : `<div class="journal-charm-cards">${spellListHtml}</div>`;
        pages.push(
          {
            name: `Known by Character`,
            type: 'text',
            text: {
              content: fullListHtml,
              format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
            }
          }
        );
      }
    }

    const journalData = {
      name: name.capitalize(),
      pages: pages,
      folder: folder,
    };

    await JournalEntry.create(journalData);
  }

  async createCharmJournal(charms, name, folder, fullCharms) {
    const charmsMap = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      other: [],
    };
    // const noPrereqs = charms.filter(charm => !charm.system.prerequisites || charm.system.prerequisites === 'None');
    charms.forEach(charm => {
      if (charmsMap[charm.system.essence]) {
        charmsMap[charm.system.essence].push(charm);
      }
      else {
        charmsMap['other'].push(charm);
      }
    });

    const pages = [];

    for (let [essenceValue, charmsList] of Object.entries(charmsMap)) {
      if (charmsList.length > 0) {
        let charmsListHtml = '';
        for (const charm of charmsList) {
          let templateData = {
            charm: charm,
            descriptionText: this.object.mainText,
            useLinks: this.object.useLinks,
          }
          const charmHtml = await renderTemplate("systems/exaltedthird/templates/journal/charm-cascade-journal.html", templateData);
          charmsListHtml += charmHtml;
        }
        let fullListHtml = this.object.mainText === 'summary' ? `<div class="journal-charm-cards grid grid-2col">${charmsListHtml}</div>` : `<div class="journal-charm-cards">${charmsListHtml}</div>`;
        pages.push(
          {
            name: `Essence ${essenceValue}`,
            type: 'text',
            text: {
              content: fullListHtml,
              format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
            }
          }
        );
      }
    }
    if (this.object.type === 'character') {
      const fullCharacter = game.actors.get(this.object.character);
      const characterCharms = fullCharacter.items.filter(item => item.type === 'charm' && item.system.ability === name);
      if (characterCharms.length > 0) {
        let charmsListHtml = '';
        for (const charm of characterCharms) {
          if (charm.system.charmprerequisites) {
            for (const prereq of charm.system.charmprerequisites) {
              const charmPrereq = game.items.get(prereq.id);
              if (charmPrereq?.uuid) {
                prereq.uuid = charmPrereq.uuid;
              }
            }
          }
          charm.system.leadsTo = fullCharms.filter(globalCharm => globalCharm.system.charmprerequisites.map(prereqCharm => prereqCharm.id).includes(charm.id));
          let templateData = {
            charm: charm,
            descriptionText: this.object.mainText,
            useLinks: this.object.useLinks,
          }
          const charmHtml = await renderTemplate("systems/exaltedthird/templates/journal/charm-cascade-journal.html", templateData);
          charmsListHtml += charmHtml;
        }
        let fullListHtml = this.object.mainText === 'summary' ? `<div class="journal-charm-cards grid grid-2col">${charmsListHtml}</div>` : `<div class="journal-charm-cards">${charmsListHtml}</div>`;
        pages.push(
          {
            name: `Known by Character`,
            type: 'text',
            text: {
              content: fullListHtml,
              format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
            }
          }
        );
      }
    }

    const journalData = {
      name: name.capitalize(),
      pages: pages,
      folder: folder,
    };

    await JournalEntry.create(journalData);
  }
}

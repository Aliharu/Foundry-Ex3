export default class JournalCascadeGenerator extends FormApplication {
  constructor(app, options, object, data) {
    super(object, options);
    this.object.folders = game.folders.filter(folder => folder.type === 'Item').sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    this.object.characters = game.actors.filter(actor => actor.type === 'character').sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    this.object.folder = '';
    this.object.character = '';
    this.object.mainText = 'description';
    this.object.type = 'character';
    this.object.includeSpells = true;
    this.object.useLinks = true;
    this.object.filterByPrerequisiteCharms = false;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dialog", `solar-background`],
      popOut: true,
      template: "systems/exaltedthird/templates/dialogues/journal-cascade-generator.html",
      id: "ex3-journal-cascade-generate",
      title: 'Generate Charm Journals',
      width: 550,
      resizable: true,
      submitOnChange: true,
      closeOnSubmit: false
    });
  }

  getData() {
    return {
      data: this.object,
    };
  }

  async _updateObject(event, formData) {
    mergeObject(this, formData);
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

      if(this.object.includeSpells) {
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
      let charms = game.items.filter(item => item.type === 'charm' && item.system.charmtype === fullCharacter.system.details.exalt);

      let spells = game.items.filter(item => item.type === 'spell');

      let characterCharms = charms.filter(charm => (charm.system.essence <= fullCharacter.system.essence.value && fullCharacter.system.attributes[charm.system.ability] && charm.system.requirement <= fullCharacter.system.attributes[charm.system.ability].value) || fullCharacter.system.abilities[charm.system.ability] && charm.system.requirement <= fullCharacter.system.abilities[charm.system.ability].value);

      const archetypeCharm = charms.filter(charm => (charm.system.essence <= fullCharacter.system.essence.value && fullCharacter.system.attributes[charm.system.archetype.ability] && charm.system.requirement <= fullCharacter.system.attributes[charm.system.archetype.ability].value) || fullCharacter.system.abilities[charm.system.archetype.ability] && charm.system.requirement <= fullCharacter.system.abilities[charm.system.archetype.ability].value);

      characterCharms = characterCharms.concat(archetypeCharm);
      characterCharms = characterCharms.sort(function (a, b) {
        const sortValueA = a.system.requirement;
        const sortValueB = b.system.requirement;
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      });

      const characterSpells = spells.filter(spell => {
        if(spell.system.circle === 'terrestrial' && fullCharacter.system.settings.sorcerycircle !== 'none') {
          return true;
        }
        if(spell.system.circle === 'celestial' && fullCharacter.system.settings.sorcerycircle !== 'terrestrial' && fullCharacter.system.settings.sorcerycircle !== 'none') {
          return true;
        }
        if(spell.system.circle === 'solar' && fullCharacter.system.settings.sorcerycircle === 'solar') {
          return true;
        }
        if(spell.system.circle === 'ivory' && fullCharacter.system.settings.necromancycircle !== 'none') {
          return true;
        }
        if(spell.system.circle === 'shadow' && fullCharacter.system.settings.necromancycircle !== 'ivory' && fullCharacter.system.settings.necromancycircle !== 'none') {
          return true;
        }
        if(spell.system.circle === 'void' && fullCharacter.system.settings.necromancycircle === 'void') {
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
      if(this.object.includeSpells) {
        for (let [name, spellsList] of Object.entries(spellsMap)) {
          this.createSpellJournal(spellsList, name, folder);
        }
      }
    }
  }

  async createCharmMap(charms, fullCharms) {
    const charmsMap = {};
    charms.forEach(charm => {
      if (!charmsMap[charm.system.ability]) {
        charmsMap[charm.system.ability] = [];
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
      charmsMap[charm.system.ability].push(charm);
    });

    charms.forEach(charm => {
      if(charm.system.archetype.ability) {
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
      other: [],
    };
    spells.forEach(spell => {
      if(spellsMap[spell.system.circle]) {
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
    if(this.object.type === 'character') {
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
      if(charmsMap[charm.system.essence]) {
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
    if(this.object.type === 'character') {
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

  activateListeners(html) {
    super.activateListeners(html);

    html.on("click", "#generate", ev => {
      this.generateJournals();
    });

    html.on("change", "#cascade-type", ev => {
      this.render();
    });
  }
}
export default class JournalCascadeGenerator extends FormApplication {
  constructor(app, options, object, data) {
    super(object, options);
    this.object.folders = game.folders.filter(folder => folder.type === 'Item');
    this.object.characters = game.actors.filter(actor => actor.type === 'character');
    this.object.folder = '';
    this.object.character = '';
    this.object.mainText = 'description';
    this.object.type = 'character';
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

      const folderCharms = charms.sort(function (a, b) {
        const sortValueA = a.system.requirement;
        const sortValueB = b.system.requirement;
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      });

      const folder = await Folder.create({ name: `${mainFolder.name} Cards`, type: 'JournalEntry' });

      const charmsMap = await this.createCharmMap(folderCharms, charms);

      for (let [name, charmsList] of Object.entries(charmsMap)) {
        this.createJournal(charmsList, name, folder, charms);
      }
    }
    if (this.object.type === 'character') {
      if (!this.object.character) {
        return;
      }
      const fullCharacter = game.actors.get(this.object.character);
      let charms = game.items.filter(item => item.type === 'charm' && item.system.charmtype === fullCharacter.system.details.exalt);

      const characterCharms = charms.filter(charm => (charm.system.essence <= fullCharacter.system.essence.value && fullCharacter.system.attributes[charm.system.ability] && charm.system.requirement <= fullCharacter.system.attributes[charm.system.ability].value) || fullCharacter.system.abilities[charm.system.ability] && charm.system.requirement <= fullCharacter.system.abilities[charm.system.ability].value).sort(function (a, b) {
        const sortValueA = a.system.requirement;
        const sortValueB = b.system.requirement;
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      });

      const charmsMap = await this.createCharmMap(characterCharms, charms);

      const folder = await Folder.create({ name: `${fullCharacter.name} Cards`, type: 'JournalEntry' });

      for (let [name, charmsList] of Object.entries(charmsMap)) {
        this.createJournal(charmsList, name, folder, charms);
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
    return charmsMap;
  }

  async createJournal(charms, name, folder, fullCharms) {
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
            descriptionText: this.object.mainText
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
            descriptionText: this.object.mainText
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

Hooks.on("renderJournalDirectory", (app, html, data) => {
  const button = $(`<button class="item-search"><i class="fas fa-suitcase"></i>${game.i18n.localize("Ex3.CharmCardJournals")}</button>`);
  html.find(".directory-footer").append(button);

  button.click(ev => {
    game.journalCascade = new JournalCascadeGenerator().render(true);
  })
})
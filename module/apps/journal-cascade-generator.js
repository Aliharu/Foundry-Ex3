export default class JournalCascadeGenerator extends FormApplication {
  constructor(app, options, object, data) {
    super(object, options);
    this.object.folders = game.folders.filter(folder => folder.type === 'Item');
    this.object.characters = game.actors.filter(actor => actor.type === 'character');
    this.object.folder = 'blWZUTd5wOpfIru1';
    this.object.character = 'nTPDVqWdPI5PEjJW';
    this.object.mainText = 'description';
    this.object.type = 'character';
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dialog", `solar-background`],
      popOut: true,
      template: "systems/exaltedthird/templates/dialogues/journal-cascade-generator.html",
      id: "ex3-journal-cascade-generate",
      title: 'Generate Charm Journals',
      width: 550,
      height: 150,
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
      let charms = game.items.filter(item => item.type === 'charm' && item.folder && folderIds.includes(item.folder.id));
      const mainFolder = game.folders.get(this.object.folder);
      const folders = mainFolder.getSubfolders(true);
      const folderIds = folders.map(folder => folder.id);
      folderIds.push(this.object.folder);

      charms = charms.sort(function (a, b) {
        const sortValueA = a.system.ability;
        const sortValueB = b.system.ability;
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      });

      const folder = await Folder.create({ name: mainFolder.name, type: 'JournalEntry' });

      const charmsMap = {};
      charms.forEach(charm => {
        if (!charmsMap[charm.system.ability]) {
          charmsMap[charm.system.ability] = [];
        }
        charmsMap[charm.system.ability].push(charm);
      });

      for (let [name, charmsList] of Object.entries(charmsMap)) {
        this.createJournal(charmsList, name.capitalize(), folder);
      }
    }
    if (this.object.type === 'character') {
      if (!this.object.character) {
        return;
      }
      const fullCharacter = game.actors.get(this.object.character);
      let charms = game.items.filter(item => item.type === 'charm' && item.system.charmtype === fullCharacter.system.details.exalt && item.system.essence <= fullCharacter.system.essence.value);

      charms = charms.sort(function (a, b) {
        const sortValueA = a.system.ability;
        const sortValueB = b.system.ability;
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      });

      const charmsMap = {};
      charms.forEach(charm => {
        if ((fullCharacter.system.attributes[charm.system.ability] && charm.system.requirement <= fullCharacter.system.attributes[charm.system.ability].value) || fullCharacter.system.abilities[charm.system.ability] && charm.system.requirement <= fullCharacter.system.abilities[charm.system.ability].value) {
          if (!charmsMap[charm.system.ability]) {
            charmsMap[charm.system.ability] = [];
          }
          charmsMap[charm.system.ability].push(charm);
        }
      });

      const folder = await Folder.create({ name: fullCharacter.name, type: 'JournalEntry' });

      for (let [name, charmsList] of Object.entries(charmsMap)) {
        this.createJournal(charmsList, name.capitalize(), folder);
      }
    }
  }

  async createJournal(charms, name, folder) {
    const charmsMap = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };
    // const noPrereqs = charms.filter(charm => !charm.system.prerequisites || charm.system.prerequisites === 'None');
    charms.forEach(charm => {
      charmsMap[charm.system.essence].push(charm);
    });

    const pages = [];

    for (let [essenceValue, charmsList] of Object.entries(charmsMap)) {
      if(charmsList.length > 0) {
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

    const journalData = {
      name: name,
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
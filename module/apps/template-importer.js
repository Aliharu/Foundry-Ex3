const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class TemplateImporter extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(type) {
    super(type);

    this.data = {
      test: '',
      type: type,
      charmType: 'other',
      templateType: '',
      listingName: '',
      spellCircle: 'terrestrial',
      itemType: 'armor',
      folder: '',
      folders: [],
      errorText: '',
      errorSection: '',
      showError: false,
      textBox: ''
    };

    let collection;
    if (this.data.type === 'qc' || this.data.type === 'adversary') {
      collection = game.collections.get("Actor");
    }
    else {
      collection = game.collections.get("Item");
    }

    this.data.folders = collection?._formatFolderSelectOptions()
      .reduce((acc, folder) => {
        acc[folder.id] = folder.name;
        return acc;
      }, {}) ?? {};
    this.data.folders[''] = "Ex3.None";
  }

  static DEFAULT_OPTIONS = {
    window: {
      title: "Template Importer", resizable: true, controls: [
        {
          icon: 'fa-solid fa-question',
          label: "Help",
          action: "showHelpDialog",
        },
      ]
    },
    tag: "form",
    form: {
      handler: TemplateImporter.myFormHandler,
      submitOnClose: false,
      submitOnChange: true,
      closeOnSubmit: false
    },
    classes: [`leaves-background`],
    position: { width: 860, height: 1047 },
    actions: {
      showHelpDialog: TemplateImporter.showHelpDialog,
    }
  };

  async close(options={}) {
    const applyChanges = await foundry.applications.api.DialogV2.confirm({
      window: { title: `${game.i18n.localize("Ex3.Close")}?` },
      content: "<p>Any unsaved changed will be lost</p>",
      classes: [`${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      modal: true
    });
    if (applyChanges) {
      super.close();
    }
  }

  static async myFormHandler(event, form, formData) {
    // Do things with the returned FormData
    const formObject = foundry.utils.expandObject(formData.object);
    if (formObject.type) {
      let collection;
      if (formObject.type === 'qc' || formObject.type === 'adversary') {
        collection = game.collections.get("Actor");
      }
      else {
        collection = game.collections.get("Item");
      }

      this.data.folders = collection?._formatFolderSelectOptions()
        .reduce((acc, folder) => {
          acc[folder.id] = folder.name;
          return acc;
        }, {}) ?? {};
      this.data.folders[''] = "Ex3.None";
      // this.data.type = formObject.type;
    }
    for (let key in formObject) {
      if (formObject.hasOwnProperty(key) && this.data.hasOwnProperty(key)) {
        this.data[key] = formObject[key];
      }
    }

    if (event.type === 'submit') {
      this.data.showError = false;
      await this.importTemplate(event);
      if(!this.data.showError) {
        ui.notifications.notify(`Import Complete`);
      }
    }

    this.render();
  }

  static PARTS = {
    form: {
      template: "systems/exaltedthird/templates/dialogues/template-importer.html",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  async _prepareContext(_options) {
    this.data.charmTypes = CONFIG.exaltedthird.exaltcharmtypes;
    this.data.selects = CONFIG.exaltedthird.selects;
    const hintMap = { 'charm': 'CharmImportHint', 'spell': 'SpellImportHint', 'adversary': 'AdversaryImportHint', 'qc': 'QCImportHint', 'other': 'OtherImportHint' }
    this.data.templateHint = game.i18n.localize(`Ex3.${hintMap[this.data.type]}`);
    this.data.buttons = [
      { type: "submit", icon: "fa-solid fa-save", label: "Ex3.Import" }
    ]
    return this.data;
  }

  async importTemplate(event) {
    switch (this.data.type) {
      case 'charm':
        await this.createCharms();
        break;
      case 'spell':
        await this.createSpell();
        break;
      case 'other':
        await this.createOther();
        break;
      case 'qc':
        await this.createQuickCharacter();
        break;
      case 'adversary':
        await this.createAdversary();
        break;
    }
  }

  async _getFolder() {
    var folderId = this.data.folder;
    var folder = null;

    if (folderId) {
      folder = game.folders.get(folderId);
    }
    return folder;
  }

  async createCharms() {
    if (!this.data.textBox) {
      ui.notifications.notify(`No Text Found`);
      return;
    }
    let textArray = this.data.textBox.split(/\r?\n/);
    let folder = await this._getFolder();

    let index = 0;
    const charmsList = [];
    while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
      let charmData = {
        type: 'charm',
        system: {
          charmtype: this.data.charmType,
          listingname: this.data.listingName,
          cost: {
            "motes": 0,
            "commitmotes": 0,
            "initiative": 0,
            "anima": 0,
            "willpower": 0,
            "aura": "",
            "health": 0,
            "healthtype": "bashing",
            "silverxp": 0,
            "goldxp": 0,
            "whitexp": 0
          },
          archetype: {
            ability: "",
            prerequisites: "",
            charmprerequisites: []
          },
        }
      };
      charmData.name = textArray[index];
      index++;
      if (!textArray[index].includes('Cost')) {
        index = this.goldenCalibrationCharm(charmData, textArray, index);
      }
      else {
        index = this.standardCharm(charmData, textArray, index);
      }

      if (charmData.system.duration.toLowerCase() === 'one scene') {
        charmData.system.endtrigger = 'endscene';
      }
      if (charmData.system.duration.toLowerCase() === 'one turn' || charmData.system.duration.toLowerCase() === 'until next turn') {
        charmData.system.endtrigger = 'startturn';
      }
      if (charmData.system.duration.toLowerCase() !== 'permanent' && charmData.system.duration.toLowerCase() !== 'instant') {
        charmData.system.cost.commitmotes = charmData.system.cost.motes;
        charmData.system.activatable = true;
        charmData.system.cost.motes = 0;
      }
      var description = '';
      while (textArray[index] && index !== textArray.length) {
        description += textArray[index];
        description += " ";
        index++;
        if ((textArray[index + 1] && textArray[index + 1].includes('Cost:'))) {
          index--;
          break;
        }
        if (textArray[index + 2] && textArray[index + 2].includes('Cost:') && textArray[index + 2].includes('Duration:')) {
          index--;
          break;
        }
        if (textArray[index + 2] && (textArray[index + 1].includes('Permanent')) && (textArray[index + 2].includes('Prerequisites:'))) {
          index--;
          break;
        }
      }
      charmData.system.description = description.replace('- ', '');
      if (folder) {
        charmData.folder = folder;
      }

      if (charmData.system.keywords.toLowerCase().includes('archetype')) {
        const keywordList = charmData.system.keywords.split(',');
        for (const keyword of keywordList) {
          if (keyword.toLowerCase().includes('archetype')) {
            const archetypeAbility = this.getTextInsideParentheses(keyword);
            charmData.system.archetype.ability = archetypeAbility.toLowerCase();
          }
        }

        const index = charmData.system.description.indexOf("Archetype:");

        // Check if "Archetype" was found
        if (index !== -1) {
          // Use substring to get the text after "Archetype"
          const textAfterArchetype = charmData.system.description.substring(index + "Archetype".length + 1);
          charmData.system.archetype.prerequisites = textAfterArchetype.trim(); // Trim whitespace
          const archetypePrereqCharms = Object.values(game.items.filter(item => item.type === 'charm' && this.data.charmType === item.system.charmtype && textAfterArchetype.toLowerCase().includes(item.name.toLowerCase())));
          for (const archetypePrereqCharm of archetypePrereqCharms) {
            charmData.system.archetype.charmprerequisites.push(
              {
                id: archetypePrereqCharm.id,
                name: archetypePrereqCharm.name
              }
            );
          }
        } else {
          // Return an empty string if "Archetype" was not found
          return '';
        }
      }
      charmsList.push(await Item.create(charmData));
      index++;
    }
    if (charmsList) {
      this.updatePrereqs(charmsList);
    }
  }

  standardCharm(charmData, textArray, index) {
    var costAndRequirement = textArray[index];
    index++;
    if (!textArray[index].includes('Type:')) {
      costAndRequirement += textArray[index];
    }
    costAndRequirement = costAndRequirement.replace('Cost: ', '').replace('Mins: ', '').split(';');
    var costArray = costAndRequirement[0].split(/,|or/);
    charmData.system.costdisplay = costAndRequirement[0];
    this.charmCost(costArray, charmData);
    var requirementArray = costAndRequirement[1].toLowerCase().split(',');
    this.charmRequirements(requirementArray, charmData);
    charmData.system.type = textArray[index].replace('Type: ', '');
    index++;
    charmData.system.keywords = textArray[index].replace('Keywords: ', '');
    index++;
    charmData.system.duration = textArray[index].replace('Duration: ', '');
    index++;
    if (textArray[index].includes('Prerequisite Charms:')) {
      charmData.system.prerequisites = textArray[index].replace('Prerequisite Charms: ', '');
      index++;
    }
    return index;
  }

  goldenCalibrationCharm(charmData, textArray, index) {
    var typeAndRequirement = textArray[index];
    typeAndRequirement = typeAndRequirement.split(' ');
    charmData.system.type = typeAndRequirement[0];
    if (typeAndRequirement[0] === 'Permanent') {
      charmData.system.duration = 'Permanent'
    }
    charmData.system.ability = typeAndRequirement[1].toLowerCase();
    charmData.system.requirement = typeAndRequirement[2].replace(/[^0-9]/g, '');
    charmData.system.essence = typeAndRequirement[4].replace(/[^0-9]/g, '');
    index++;
    if (textArray[index].includes('Cost:')) {
      var costDuration = textArray[index].replace('Cost: ', '').split('Duration:');
      charmData.system.duration = costDuration[1];
      var costArray = costDuration[0].split(',');
      charmData.system.costdisplay = costDuration[0];
      this.charmCost(costArray, charmData);
      index++;
    }
    if (textArray[index].includes('Keywords:')) {
      charmData.system.keywords = textArray[index].replace('Keywords: ', '');
      index++;
    }
    charmData.system.prerequisites = textArray[index].replace('Prerequisites: ', '');
    index++;
    return index;
  }

  charmCost(costArray, charmData) {
    for (let costString of costArray) {
      costString = costString.trim();
      if (costString.includes('m')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.motes = parseInt(num) || 0;
      }
      if (costString.includes('i')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.initiative = parseInt(num) || 0;
      }
      if (costString.includes('a')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.anima = parseInt(num) || 0;
      }
      if (costString.includes('Penumbra')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.penumbra = parseInt(num) || 0;
      }
      if (costString.includes('wp')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.willpower = parseInt(num) || 0;
      }
      if (costString.includes('hl')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.health = parseInt(num) || 0;
        if (costString.includes('ahl')) {
          charmData.system.cost.healthtype = 'aggravated';
        }
        if (costString.includes('lhl')) {
          charmData.system.cost.healthtype = 'lethal';
        }
      }
      if (costString.includes('Fire')) {
        charmData.system.cost.aura = 'fire';
      }
      if (costString.includes('Earth')) {
        charmData.system.cost.aura = 'earth';
      }
      if (costString.includes('Air')) {
        charmData.system.cost.aura = 'air';
      }
      if (costString.includes('Water')) {
        charmData.system.cost.aura = 'water';
      }
      if (costString.includes('Wood')) {
        charmData.system.cost.aura = 'wood';
      }
      if (costString.includes('gxp')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.goldxp = parseInt(num) || 0;
      }
      else if (costString.includes('sxp')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.silverxp = parseInt(num) || 0;
      }
      else if (costString.includes('wxp')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.whitexp = parseInt(num) || 0;
      }
      else if (costString.includes('xp')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.xp = parseInt(num) || 0;
      }
    }
  }

  charmRequirements(requirementArray, charmData) {
    var abilityRequirement = requirementArray[0].trim().split(' ');

    charmData.system.ability = abilityRequirement[0].replace(' ', '');
    charmData.system.requirement = abilityRequirement[1].replace(/[^0-9]/g, '');

    if (abilityRequirement[0].replace(' ', '') === 'martial') {
      charmData.system.ability = 'martialarts';
      charmData.system.requirement = abilityRequirement[2].replace(/[^0-9]/g, '');
    }
    if (abilityRequirement[0].replace(' ', '') === 'any') {
      charmData.system.ability = abilityRequirement[1].replace(' ', '');
      charmData.system.requirement = abilityRequirement[3].replace(/[^0-9]/g, '');
    }
    if (requirementArray.length === 1) {
      var essenceRequirement = requirementArray[0].trim().split(' ');
      if (this.data.charmType === 'evocation') {
        charmData.system.ability = 'evocation';
      }
      else {
        charmData.system.ability = 'universal';
      }
      charmData.system.requirement = 0;
      charmData.system.essence = essenceRequirement[1].replace(/[^0-9]/g, '');
    }
    if (requirementArray.length === 2) {
      var essenceRequirement = requirementArray[1].trim().split(' ');
      charmData.system.essence = essenceRequirement[1].replace(/[^0-9]/g, '');
    }
  }

  async updatePrereqs(charmsList) {
    const filteredCharms = charmsList.filter(charm => charm.system.prerequisites && charm.system.prerequisites !== 'None');
    for (const charm of filteredCharms) {
      const charmData = foundry.utils.duplicate(charm);
      const splitPrereqs = charm.system.prerequisites.split(',');
      const newPrereqs = [];
      for (const prereq of splitPrereqs) {
        const existingCharm = game.items.filter(item => item.type === 'charm' && item.system.charmtype === charm.system.charmtype && item.name.trim() === prereq.trim())[0];
        if (existingCharm) {
          charmData.system.charmprerequisites.push(
            {
              id: existingCharm.id,
              name: existingCharm.name
            }
          );
        }
        else {
          newPrereqs.push(prereq);
        }
      }
      if (charm.system.charmprerequisites) {
        charmData.system.prerequisites = newPrereqs.join(", ");
        await charm.update(charmData);
      }
    }
  }

  async createSpell() {
    let textArray = this.data.textBox.split(/\r?\n/);
    let folder = await this._getFolder();

    let index = 0;
    while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
      let spellData = {
        type: 'spell',
        system: {
          circle: this.data.spellCircle,
        }
      };
      spellData.name = textArray[index];
      index++;
      let costArray = textArray[index].replace('Cost: ', '').split(',');
      index++;
      for (let costString of costArray) {
        costString = costString.trim();
        if (costString.includes('sm') || costString.includes('nm')) {
          let num = costString.replace(/[^0-9]/g, '');
          spellData.system.cost = parseInt(num) || 0;
        }
        if (costString.includes('wp')) {
          let num = costString.replace(/[^0-9]/g, '');
          spellData.system.willpower = parseInt(num) || 0;
        }
      }

      spellData.system.keywords = textArray[index].replace('Keywords: ', '');
      index++;
      spellData.system.duration = textArray[index].replace('Duration: ', '');
      index++;
      let description = '';
      while (textArray[index] && index !== textArray.length) {
        description += textArray[index];
        description += " ";
        index++;
        if ((textArray[index + 1] && textArray[index + 1].includes('Cost:'))) {
          index--;
          break;
        }
      }
      spellData.system.description = description;
      if (folder) {
        spellData.folder = folder;
      }
      await Item.create(spellData);
      index++;
    }
  }

  async createOther() {
    const martialArtsWeapons = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/martialArtsWeapons.json', {}, { int: 30000 });
    let textArray = this.data.textBox.split(/\r?\n/);
    let index = 0;

    let folder = await this._getFolder();
    const weaponTags = CONFIG.exaltedthird.weapontags;
    const armorTags = CONFIG.exaltedthird.armortags;
    while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
      var itemData = {
        type: this.data.itemType,
        system: {
        }
      };
      if (this.data.itemType === 'hearthstone') {
        itemData.system.itemtype = 'hearthstone';
        itemData.type = 'item';
        itemData.img = 'systems/exaltedthird/assets/icons/emerald.svg';
      }
      var weightType = '';
      itemData.name = textArray[index];
      index++;
      var description = '';
      if (this.data.itemType === 'armor' || this.data.itemType === 'weapon') {
        itemData.system.traits = {};
        if (this.data.itemType === 'armor') {
          itemData.system.traits.armortags = {
            "value": [],
            "custom": ""
          }
        }
        if (this.data.itemType === 'weapon') {
          itemData.system.traits.weapontags = {
            "value": [],
            "custom": ""
          }
        }
      }
      while (textArray[index] && index !== textArray.length) {
        if (textArray[index].includes('Tags:')) {
          var tagString = textArray[index].toLowerCase().replace('tags:', '');
          var tagSplit = tagString.split(/,|;/);
          var itemTags = [];
          for (let tag of tagSplit) {
            if (tag.includes('(')) {
              var rangeTag = tag.match(/\(([^)]+)\)/)[1]?.replace(/\s+/g, '').replace('-', '').trim();
              if (weaponTags[rangeTag] && this.data.itemType === 'weapon') {
                itemTags.push(rangeTag);
              }
              else if (armorTags[rangeTag] && this.data.itemType === 'armor') {
                itemTags.push(rangeTag);
              }
              tag = tag.replace(/\(([^)]+)\)/g, '');
            }
            tag = tag.replace(/\s+/g, '').replace('-', '').trim();
            if (weaponTags[tag] && this.data.itemType === 'weapon') {
              itemTags.push(tag);
            }
            else if (armorTags[tag] && this.data.itemType === 'armor') {
              itemTags.push(tag);
            }
          }
          if (this.data.itemType === 'armor') {
            itemData.system.traits.armortags.value = itemData.system.traits.armortags.value.concat(itemTags);
          }
          if (this.data.itemType === 'weapon') {
            itemData.system.traits.weapontags.value = itemData.system.traits.weapontags.value.concat(itemTags);
          }
          if (itemTags.includes("melee") || itemTags.includes("brawl")) {
            itemData.system.weapontype = 'melee';
          }
          else if (itemTags.includes("archery")) {
            itemData.system.weapontype = 'ranged';
          }
          else if (itemTags.includes("thrown")) {
            itemData.system.weapontype = 'thrown';
          }
          else if (itemTags.includes("siege")) {
            itemData.system.weapontype = 'siege';
          }
        }
        if (textArray[index].includes('Attunement:')) {
          if (this.data.itemType === 'armor') {
            itemData.system.traits.armortags.value.push('artifact');
            itemData.system.hasevocations = true;
          }
          if (this.data.itemType === 'weapon') {
            itemData.system.traits.weapontags.value.push('artifact');
            itemData.system.hasevocations = true;
          }
        }
        if (textArray[index].includes('Type:')) {
          if (textArray[index].toLowerCase().includes('light')) {
            weightType = 'light';
          }
          else if (textArray[index].toLowerCase().includes('medium')) {
            weightType = 'medium';
          }
          else if (textArray[index].toLowerCase().includes('heavy')) {
            weightType = 'heavy';
          }
        }
        if (textArray[index].toLowerCase().includes("hearthstone slot(s):")) {
          var slotsSplit = textArray[index].split(':');
          if (slotsSplit[1] && slotsSplit[1].trim() !== 'None') {
            itemData.system.hearthstones = {
              value: 0,
              max: slotsSplit[1].replace(/[^0-9]/g, ''),
            }
          }
        }
        description += textArray[index];
        description += " ";

        index++;
      }
      if (this.data.itemType === 'martialArt') {
        itemData.img = "systems/exaltedthird/assets/icons/punch-blast.svg";
        itemData.type = 'customability';
        itemData.system.abilitytype = 'martialart';
        if (martialArtsWeapons[itemData.name]) {
          itemData.system.traits = {
            weapons: {
              "value": martialArtsWeapons[itemData.name],
              "custom": ""
            }
          }
        }
        const armorMatches = description.match(/Armor:(.*)/);
        if (armorMatches) {
          const extractedText = armorMatches[1].trim().toLowerCase();
          if (extractedText.includes("all")) {
            itemData.system.armorallowance = "heavy";
          }
          else if (extractedText.includes("medium")) {
            itemData.system.armorallowance = "medium";
          }
          else if (extractedText.includes("light")) {
            itemData.system.armorallowance = "light";
          }
          else {
            itemData.system.armorallowance = "none";
          }
        }

        const natureMatches = description.match(/Nature:(.*)/);
        if (natureMatches) {
          const extractedText = natureMatches[1].trim().toLowerCase();
          itemData.system.siderealmartialart = true;
          if (extractedText.includes('still') && extractedText.includes('flowing')) {
            itemData.system.nature = 'both';
          }
          else if (extractedText.includes('still')) {
            itemData.system.nature = 'still';
          }
          else if (extractedText.includes('flowing')) {
            itemData.system.nature = 'flowing';
          }
        }
      }
      itemData.system.description = description;
      if (folder) {
        itemData.folder = folder;
      }
      const item = await Item.create(itemData);
      if ((item.type === 'weapon' || item.type === 'armor') && weightType) {
        await item.update({ [`system.weighttype`]: weightType });
      }
      index++;
    }
  }

  async createQuickCharacter() {
    var actorData = this._getStatBlock(false);
    var folder = await this._getFolder();
    const itemData = [
    ];
    let index = 1;
    var textArray = this.data.textBox.split(/\r?\n/);
    this.errorSection = 'Initial Info';
    try {
      actorData.name = textArray[0].trim();
      actorData.prototypeToken.name = textArray[0].trim();
      var actorDescription = '';
      while (!textArray[index].includes('Caste:') && !textArray[index].includes('Aspect:') && !textArray[index].includes('Essence:') && !textArray[index].includes('Intimacies:')) {
        actorDescription += textArray[index];
        index++;
      }
      actorData.system.biography = actorDescription;
      if (textArray[index].includes('Intimacies')) {
        this.errorSection = 'Intimacies';
        var intimacyStrength = 'defining';
        while (!textArray[index].includes('Caste:') && !textArray[index].includes('Aspect:') && !textArray[index].includes('Essence:')) {
          intimacyString += textArray[index];
          index++;
        }
        var intimaciesArray = intimacyString.replace('Intimacies:', '').replace('/', '').split(';');
        for (const intimacy of intimaciesArray) {
          if (intimacy) {
            intimacyArray = intimacy.split(':');
            var intimacyType = 'tie';
            if (intimacyArray[0].includes('Principle')) {
              intimacyType = 'principle';
            }
            else if (intimacyArray[0].includes('Tie')) {
              intimacyType = 'tie';
            }
            if (intimacyArray.length > 1) {
              intimacyStrength = intimacyArray[0].replace('Principle', '').replace('Tie', '').replace('“', '').replace('”', '').trim().toLowerCase();
              itemData.push(
                {
                  type: 'intimacy',
                  img: CONFIG.exaltedthird.itemIcons['intimacy'],
                  name: intimacyArray[1].trim(),
                  system: {
                    description: intimacyArray[1].trim(),
                    intimacytype: intimacyType,
                    strength: intimacyArray[0].replace('Principle', '').replace('Tie', '').replace('“', '').replace('”', '').trim().toLowerCase()
                  }
                }
              );
            }
            else {
              itemData.push(
                {
                  type: 'intimacy',
                  img: CONFIG.exaltedthird.itemIcons['intimacy'],
                  name: intimacyArray[0].trim(),
                  system: {
                    description: intimacyArray[0].trim(),
                    intimacytype: intimacyType,
                    strength: intimacyStrength
                  }
                }
              );
            }
          }
        }
      }
      if (textArray[index].includes('Caste') || textArray[index].includes('Aspect')) {
        this.errorSection = 'Exalt Info';
        this._getExaltSpecificData(textArray, index, actorData, false);
        index++;
      }
      if (textArray[index].includes('Spirit Shape')) {
        var lunarArray = textArray[index].split(';');
        actorData.system.details.spiritshape = `${lunarArray[0].trim().replace('Spirit Shape:', '')}`;
        var tellArray = lunarArray[1].split(':')
        actorData.system.details.exalt = 'lunar';
        actorData.system.details.tell = tellArray[1].trim();
        index++;
      }
      this.errorSection = 'Health/WP/Essence stats';
      var statArray = textArray[index].replace(/ *\([^)]*\) */g, "").replace('Cost: ', '').split(';');
      actorData.system.essence.value = parseInt(statArray[0].replace(/[^0-9]/g, ''));
      actorData.system.willpower.value = parseInt(statArray[1].replace(/[^0-9]/g, ''));
      actorData.system.willpower.max = parseInt(statArray[1].replace(/[^0-9]/g, ''));
      actorData.system.pools.joinbattle.value = parseInt(statArray[2].replace(/[^0-9]/g, ''));
      index++;
      if (textArray[index].includes('Health Levels')) {
        this._getHealthLevels(textArray, index, actorData);
        index++;
      }
      else {
        var motesArray = textArray[index].replace(/ *\([^)]*\) */g, "").split(';');
        if (motesArray.length === 1) {
          actorData.system.motes.personal.value = parseInt(motesArray[0].replace(/[^0-9]/g, ''));
          actorData.system.motes.personal.max = parseInt(motesArray[0].replace(/[^0-9]/g, ''));
        }
        else {
          actorData.system.motes.personal.value = parseInt(motesArray[0].replace(/[^0-9]/g, ''));
          actorData.system.motes.personal.max = parseInt(motesArray[0].replace(/[^0-9]/g, ''));
          actorData.system.motes.peripheral.value = parseInt(motesArray[1].replace(/[^0-9]/g, ''));
          actorData.system.motes.peripheral.max = parseInt(motesArray[1].replace(/[^0-9]/g, ''));
        }
        index++;
        this._getHealthLevels(textArray, index, actorData);
        index++;
      }

      var intimacyString = '';
      var intimacyArray = [];
      if (textArray[index].includes('Intimacies')) {
        this.errorSection = 'Intimacies';
        var intimacyStrength = 'defining';
        while (!textArray[index].includes('Actions:') && !textArray[index].includes('Speed Bonus:') && !(/Actions \([^)]*\)/g).test(textArray[index]) && !textArray[index].includes('Guile:')) {
          intimacyString += textArray[index];
          index++;
        }
        var intimaciesArray = intimacyString.replace('Intimacies:', '').replace('/', '').split(';');
        for (const intimacy of intimaciesArray) {
          if (intimacy) {
            intimacyArray = intimacy.split(':');
            var intimacyType = 'tie';
            if (intimacyArray[0].includes('Principle')) {
              intimacyType = 'principle';
            }
            else if (intimacyArray[0].includes('Tie')) {
              intimacyType = 'tie';
            }
            if (intimacyArray.length > 1) {
              intimacyStrength = intimacyArray[0].replace('Principle', '').replace('Tie', '').replace('“', '').replace('”', '').trim().toLowerCase();
              itemData.push(
                {
                  type: 'intimacy',
                  img: CONFIG.exaltedthird.itemIcons['intimacy'],
                  name: intimacyArray[1].trim(),
                  system: {
                    description: intimacyArray[1].trim(),
                    intimacytype: intimacyType,
                    strength: intimacyArray[0].replace('Principle', '').replace('Tie', '').replace('“', '').replace('”', '').trim().toLowerCase()
                  }
                }
              );
            }
            else {
              itemData.push(
                {
                  type: 'intimacy',
                  img: CONFIG.exaltedthird.itemIcons['intimacy'],
                  name: intimacyArray[0].trim(),
                  system: {
                    description: intimacyArray[0].trim(),
                    intimacytype: intimacyType,
                    strength: intimacyStrength
                  }
                }
              );
            }
          }
        }
      }
      if (textArray[index].includes('Speed Bonus')) {
        this.errorSection = 'Speed Bonus';
        actorData.system.speed.value = parseInt(textArray[index].replace(/[^0-9]/g, ''));
        index++;
      }
      // if(textArray[index].includes('Primary Actions')) {
      //   let primaryActionsArray = textArray[index].replace("Primary Actions: ", "").split(',');
      //   if(!textArray[index+1].includes("Secondary Actions")) {
      //     index++;
      //     primaryActionsArray = [...primaryActionsArray, ...textArray[index].split(',')]
      //   }
      //   index++;
      //   for(const primaryAction of primaryActionsArray) {
      //     itemData.push(
      //       {
      //         type: 'action',
      //         img: CONFIG.exaltedthird.itemIcons['action'],
      //         name: primaryAction,
      //         system: {
      //           value: CONFIG.exaltedthird.tripleActionStatblocks[this.data.templateType]?.primary || 0
      //         }
      //       }
      //     );
      //   }
      // }
      var actionsString = '';
      while (!textArray[index].includes('Guile') && textArray[index].toLowerCase() !== 'combat' && textArray[index].toLowerCase() !== 'combat:') {
        actionsString += textArray[index];
        index++;
      }
      var actionsArray = actionsString.replace('Actions:', '').replace('/', '').replace(/ *\([^)]*\) */g, "").split(';');
      for (const action of actionsArray) {
        this.errorSection = 'Actions';
        if (!/^\s*$/.test(action)) {
          var actionSplit = action.trim().replace('dice', '').replace('.', '').split(':');
          var name = actionSplit[0].replace(" ", "");
          if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'socialinfluence') {
            actorData.system.pools.social.value = parseInt(actionSplit[1].trim());
          }
          else if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'commandsoldiers') {
            actorData.system.pools.command.value = parseInt(actionSplit[1].trim());
          }
          else if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'shapesorcery') {
            actorData.system.pools.sorcery.value = parseInt(actionSplit[1].trim());
          }
          else if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'readmotives') {
            actorData.system.pools.readintentions.value = parseInt(actionSplit[1].trim());
          }
          else if (actorData.system.pools[name.toLocaleLowerCase()]) {
            actorData.system.pools[name.toLocaleLowerCase()].value = parseInt(actionSplit[1].trim());
          }
          else {
            itemData.push(
              {
                type: 'action',
                img: CONFIG.exaltedthird.itemIcons['action'],
                name: name,
                system: {
                  value: parseInt(actionSplit[1].trim())
                }
              }
            );
          }
        }
      }
      if (textArray[index].toLowerCase().includes('resolve')) {
        this.errorSection = 'Social Stats';
        var socialArray = textArray[index].replace(/ *\([^)]*\) */g, "").split(',');
        if (textArray[index].toLowerCase().includes('appearance')) {
          actorData.system.appearance.value = parseInt(socialArray[0].trim().split(" ")[1]);
          actorData.system.resolve.value = parseInt(socialArray[1].trim().split(" ")[1]);
          actorData.system.guile.value = parseInt(socialArray[2].trim().split(" ")[1]);
        }
        else {
          actorData.system.resolve.value = parseInt(socialArray[0].trim().split(" ")[1]);
          actorData.system.guile.value = parseInt(socialArray[1].trim().split(" ")[1]);
        }
        index++
      }

      if (textArray[index].trim().toLowerCase() === 'combat' || textArray[index].trim().toLowerCase() === 'combat:') {
        index++;
      }
      while (textArray[index].includes('Attack')) {
        this.errorSection = 'Attacks';
        var attackString = textArray[index];
        if (!textArray[index + 1].includes('Attack') && !textArray[index + 1].includes('Combat Movement') && !textArray[index + 1].includes('Evasion:')) {
          attackString += textArray[index + 1];
          index++;
        }
        var attackArray = attackString.replace('Attack ', '').split(':');
        var attackName = attackArray[0].replace('(', '').replace(')', '');
        var damage = 1;
        var overwhelming = 1;
        var accuracy = 0;
        var weaponDescription = ''
        var accuracySplit = attackArray[1].trim().replace(')', '').split('(');
        accuracy = parseInt(accuracySplit[0].replace(/[^0-9]/g, ''));
        if (!attackString.toLowerCase().includes('grapple')) {
          var damageSplit = accuracySplit[1].split('Damage');
          if (!accuracySplit[1].includes('Damage')) {
            damageSplit = accuracySplit[1].split('damage');
          }
          if (damageSplit[1].includes('/')) {
            var damageSubSplit = damageSplit[1].split('/');
            damage = parseInt(damageSubSplit[0].replace(/[^0-9]/g, ''));
            overwhelming = parseInt(damageSubSplit[1].replace(/[^0-9]/g, ''));
          }
          else if (damageSplit[1].includes(',')) {
            var damageSubSplit = damageSplit[1].split(',');
            damage = parseInt(damageSubSplit[0].replace(/[^0-9]/g, ''));
            if (damageSplit[1].includes('minimum')) {
              overwhelming = parseInt(damageSubSplit[1].replace(/[^0-9]/g, ''));
            }
          }
          else if (damageSplit[1].includes(';')) {
            damage = parseInt(damageSplit[1].split(';')[0].replace(/[^0-9]/g, ''))
            weaponDescription = damageSplit[1].split(';')[1];
          }
          else {
            damage = parseInt(damageSplit[1].replace(/[^0-9]/g, ''));
          }
        }
        else {
          damage = 0;
          overwhelming = 0;
          var grappleSplit = attackArray[1].split('(');
          var grappleValue = parseInt(grappleSplit[1].replace(/[^0-9]/g, ''));
          actorData.system.pools.grapple.value = grappleValue;
        }
        index++;
        itemData.push(
          {
            type: 'weapon',
            img: CONFIG.exaltedthird.itemIcons['weapon'],
            name: attackName.trim(),
            system: {
              description: weaponDescription,
              witheringaccuracy: accuracy,
              witheringdamage: damage,
              overwhelming: overwhelming,
            }
          }
        );
      }
      if (textArray[index].includes('Combat Movement:')) {
        this.errorSection = 'Combat Movement';
        var combatMovementArray = textArray[index].split(':');
        actorData.system.pools.movement.value = parseInt(combatMovementArray[1].replace(/ *\([^)]*\) */g, "").replace(/[^0-9]/g, ''));
        index++;
      }

      this.errorSection = 'Combat Defenses';
      var defenseLine = textArray[index].replace(/ *\([^)]*\) */g, "");
      if (defenseLine.includes(',')) {
        var defenseArray = defenseLine.split(',');
        actorData.system.evasion.value = parseInt(defenseArray[0].replace(/[^0-9]/g, ''));
        actorData.system.parry.value = parseInt(defenseArray[1].replace(/[^0-9]/g, ''));
      }
      else if (defenseLine.includes(';')) {
        var defenseArray = defenseLine.split(';');
        actorData.system.evasion.value = parseInt(defenseArray[0].replace(/[^0-9]/g, ''));
        actorData.system.parry.value = parseInt(defenseArray[1].replace(/[^0-9]/g, ''));
      }
      index++;

      var soakArray = textArray[index].replace('Soak/Hardness:', '').replace(/ *\([^)]*\) */g, "").split('/');

      actorData.system.soak.value = parseInt(soakArray[0].replace(/[^0-9]/g, ''));
      actorData.system.hardness.value = parseInt(soakArray[1].replace(/[^0-9]/g, ''));

      if (textArray[index].includes('(')) {
        const match = textArray[index].match(/\(([^)]+)\)/);
        if (match) {
          itemData.push(
            {
              type: 'armor',
              img: CONFIG.exaltedthird.itemIcons['armor'],
              name: match[1],
            }
          );
        }
      }

      index++;
      itemData.push(...this._getItemData(textArray, index, actorData));
      actorData.items = itemData;
      if (folder) {
        actorData.folder = folder;
      }
      await Actor.create(actorData);
    }
    catch (error) {
      console.log(error);
      console.log(textArray);
      console.log(index);
      this.data.error = textArray[index];
      this.data.showError = true;
    }
  }

  async createAdversary() {
    var actorData = this._getStatBlock(true);
    var folder = await this._getFolder();
    const itemData = [
    ];
    let index = 1;
    var readingItems = false;
    var textArray = this.data.textBox.split(/\r?\n/);
    try {
      actorData.name = textArray[0].trim();
      actorData.prototypeToken.name = textArray[0].trim();
      var actorDescription = '';
      var addingIntimacies = false;
      var intimacyString = '';
      this.errorSection = 'Initial Data';
      while (!textArray[index].includes('Caste:') && !textArray[index].includes('Aspect:') && !textArray[index].includes('Attributes:')) {
        if (textArray[index].includes('Intimacies:')) {
          addingIntimacies = true;
          this.errorSection = 'Intimacies';
        }
        if (textArray[index].includes('Secrets:')) {
          addingIntimacies = false;
          var intimacyArray = intimacyString.split(/,|;/);
          var intimacyStrength = 'minor';
          for (let intimacy of intimacyArray) {
            if (intimacy.includes('Defining:')) {
              intimacyStrength = 'defining';
              intimacy = intimacy.replace('Defining:', '');
            }
            if (intimacy.includes('Major:')) {
              intimacyStrength = 'major';
              intimacy = intimacy.replace('Major:', '');
            }
            if (intimacy.includes('Minor:')) {
              intimacyStrength = 'minor';
              intimacy = intimacy.replace('Minor:', '');
            }
            itemData.push(
              {
                type: 'intimacy',
                img: CONFIG.exaltedthird.itemIcons['intimacy'],
                name: intimacy.trim(),
                system: {
                  description: intimacy.trim(),
                  strength: intimacyStrength
                }
              }
            );
          }
        }
        if (addingIntimacies) {
          intimacyString += textArray[index].replace('Intimacies:', '');
        }
        else {
          actorDescription += textArray[index];
        }
        index++;
      }
      actorData.system.biography = actorDescription;
      if (textArray[index].includes('Caste') || textArray[index].includes('Aspect')) {
        this.errorSection = 'Exalt Data';
        this._getExaltSpecificData(textArray, index, actorData, false);
        index++;
      }
      if (textArray[index].includes('Spirit Shape')) {
        var lunarArray = textArray[index].split(';');
        actorData.system.details.spiritshape = `${lunarArray[0].trim().replace('Spirit Shape:', '')}`;
        var tellArray = lunarArray[1].split(':')
        actorData.system.details.exalt = 'lunar';
        actorData.system.details.tell = tellArray[1].trim();
        index++;
      }
      var attributeString = textArray[index].replace('Attributes:', '');
      this.errorSection = 'Attributes';
      index++
      while (!textArray[index].includes("Essence") && !textArray[index].includes("Willpower")) {
        attributeString += " ";
        attributeString += textArray[index];
        index++
      }
      var attributeArray = attributeString.split(/,|;/);
      for (const attribute of attributeArray) {
        if (attribute) {
          var attributeSpecificArray = attribute.trim().split(' ');
          var trimmedName = attributeSpecificArray[0].trim().toLowerCase();
          var value = parseInt(attributeSpecificArray[1].replace(/[^0-9]/g, ''));
          if (value > 5) {
            actorData.system.settings.usetenattributes = true;
          }
          actorData.system.attributes[trimmedName].value = value;
        }
      }
      this.errorSection = 'Essence/Willpower';
      if (textArray[index].includes("Essence")) {
        actorData.system.essence.value = parseInt(textArray[index].split(':')[1].replace(/[^0-9]/g, ''));
        index++;
      }
      actorData.system.willpower.value = parseInt(textArray[index].split(':')[1].replace(/[^0-9]/g, ''));
      actorData.system.willpower.max = parseInt(textArray[index].split(':')[1].replace(/[^0-9]/g, ''));
      index++;
      //Join Battle dice should be auto calculated so itsn ot needed
      index++;
      if (textArray[index].toLowerCase().includes('personal')) {
        var personalMotesValue = textArray[index].split(':')[1];
        if (personalMotesValue.toLowerCase().includes('committed')) {
          var personalSplitArray = personalMotesValue.split('(');
          actorData.system.motes.personal.value = parseInt(personalSplitArray[0].split('/')[0].replace(/[^0-9]/g, ''));
          if (personalSplitArray[0].split('/').length > 2) {
            actorData.system.motes.personal.max = parseInt(personalSplitArray[0].split('/')[1].replace(/[^0-9]/g, ''));
            actorData.system.motes.personal.committed = parseInt(personalSplitArray[0].split('/')[1].replace(/[^0-9]/g, '')) - parseInt(personalSplitArray[0].split('/')[0].replace(/[^0-9]/g, ''));
          }
          else {
            actorData.system.motes.personal.max = parseInt(personalSplitArray[0].replace(/[^0-9]/g, ''));
            actorData.system.motes.personal.committed = parseInt(personalSplitArray[1].replace(/[^0-9]/g, ''));
          }
        }
        else {
          actorData.system.motes.personal.value = parseInt(personalMotesValue.replace(/[^0-9]/g, ''));
          actorData.system.motes.personal.max = parseInt(personalMotesValue.replace(/[^0-9]/g, ''));
        }
        index++;
      }
      if (textArray[index].toLowerCase().includes('peripheral')) {
        var peripheralMotesValue = textArray[index].split(':')[1];
        if (peripheralMotesValue.toLowerCase().includes('committed')) {
          var peripheralSplitArray = peripheralMotesValue.split('(');
          actorData.system.motes.peripheral.value = parseInt(peripheralSplitArray[0].split('/')[0].replace(/[^0-9]/g, ''));
          if (peripheralSplitArray[0].split('/').length > 2) {
            actorData.system.motes.peripheral.max = parseInt(peripheralSplitArray[0].split('/')[1].replace(/[^0-9]/g, ''));
            actorData.system.motes.peripheral.committed = parseInt(peripheralSplitArray[0].split('/')[1].replace(/[^0-9]/g, '')) - parseInt(peripheralSplitArray[0].split('/')[0].replace(/[^0-9]/g, ''));
          }
          else {
            actorData.system.motes.peripheral.max = parseInt(peripheralSplitArray[0].replace(/[^0-9]/g, ''));
            actorData.system.motes.peripheral.committed = parseInt(peripheralSplitArray[1].replace(/[^0-9]/g, ''));
          }
        }
        else {
          actorData.system.motes.peripheral.value = parseInt(peripheralMotesValue.replace(/[^0-9]/g, ''));
          actorData.system.motes.peripheral.max = parseInt(peripheralMotesValue.replace(/[^0-9]/g, ''));
        }
        index++;
      }
      this.errorSection = 'Health';
      this._getHealthLevels(textArray, index, actorData);
      index++;
      this.errorSection = 'Abilities';
      var abilityString = textArray[index].replace('Abilities:', '');
      index++;
      while (!textArray[index].includes("Merits") && !textArray[index].includes("Attack")) {
        abilityString += " ";
        abilityString += textArray[index];
        index++
      }
      abilityString = abilityString.replace(/,(?=[^()]*\))/g, '');
      var abilityArray = abilityString.split(/,|;/);
      for (let ability of abilityArray) {
        if (ability) {
          var createSpecialty = false;
          var specialtyText = ''
          if (ability.includes('(')) {
            createSpecialty = true;
            specialtyText = ability.match(/\(([^)]+)\)/)[1];
            ability = ability.replace(/\([^()]*\)/g, "").replace("  ", " ");
          }
          if (ability.toLowerCase().includes('craft')) {
            trimmedName = 'craft';
            var value = parseInt(ability.replace(/[^0-9]/g, ''));
          }
          else if (ability.toLowerCase().includes('martial arts')) {
            trimmedName = 'martialarts';
            var value = parseInt(ability.replace(/[^0-9]/g, ''));
          }
          else {
            var abilitySpecificArray = ability.trim().split(' ');
            trimmedName = abilitySpecificArray[0].trim().toLowerCase();
            var value = parseInt(abilitySpecificArray[1].replace(/[^0-9]/g, ''));
          }
          if (value > 5) {
            actorData.system.settings.usetenabilities = true;
          }
          actorData.system.abilities[trimmedName].value = value;
          if (createSpecialty) {
            itemData.push(
              {
                type: 'specialty',
                img: CONFIG.exaltedthird.itemIcons['specialty'],
                name: specialtyText.trim(),
                system: {
                  ability: trimmedName,
                }
              }
            );
          }
        }
      }
      this.errorSection = 'Merits';
      if (!textArray[index].includes("Attack")) {
        var meritString = textArray[index].replace('Merits:', '');
        index++;
        while (!textArray[index].includes("Attack") && !textArray[index].includes("Specialties")) {
          meritString += textArray[index];
          index++;
        }
        meritString = meritString.replace(/,(?=[^()]*\))/g, '');
        var meritArray = meritString.split(',');
        var languages = [
          "low realm",
          "high realm",
          "old realm",
          "dragontongue",
          "riverspeak",
          "skytongue",
          "flametongue",
          "foresttongue",
          "seatongue",
          "guild cant",
          "local tongue",
        ]
        for (let merit of meritArray) {
          if (merit) {
            var meritValue = parseInt(merit.replace(/[^0-9]/g, ''));
            var meritName = merit.match(/[^0-9+]+/g)[0];
            var lowerCaseMerit = merit.toLowerCase();
            if (lowerCaseMerit.includes('language')) {
              var newLanguageArray = [];
              for (let language of languages) {
                if (lowerCaseMerit.includes(language)) {
                  newLanguageArray.push(language.replace(/ /g, ''));
                }
              }
              actorData.system.traits.languages.value = newLanguageArray;
            }
            itemData.push(
              {
                type: 'merit',
                img: CONFIG.exaltedthird.itemIcons['merit'],
                name: meritName.trim(),
                system: {
                  points: meritValue ? meritValue : 0,
                }
              }
            );
          }
        }
      }
      if (textArray[index].includes('Specialties')) {
        this.errorSection = 'Specialties';
        if (!textArray[index].includes("Attack")) {
          var specialtiesString = textArray[index].replace('Specialties:', '');
          index++;
          while (!textArray[index].includes("Attack")) {
            specialtiesString += " ";
            specialtiesString += textArray[index];
            index++;
          }
          specialtiesString = specialtiesString.replace(/,(?=[^()]*\))/g, '');
          var specialtyArray = specialtiesString.split(/,|;/);
          for (let ability of specialtyArray) {
            if (ability) {
              var specialtyText = ''
              specialtyText = ability.match(/\(([^)]+)\)/)[1];
              ability = ability.replace(/\([^()]*\)/g, "").replace("  ", " ");
              if (ability.toLowerCase().includes('craft')) {
                trimmedName = 'craft';
              }
              else if (ability.toLowerCase().includes('martial arts')) {
                trimmedName = 'martialarts';
              }
              else {
                var abilitySpecificArray = ability.trim().split(' ');
                trimmedName = abilitySpecificArray[0].trim().toLowerCase();
              }
              itemData.push(
                {
                  type: 'specialty',
                  img: CONFIG.exaltedthird.itemIcons['specialty'],
                  name: specialtyText.trim(),
                  system: {
                    ability: trimmedName,
                  }
                }
              );
            }
          }

        }
      }
      this.errorSection = 'Attacks';
      const weaponTags = CONFIG.exaltedthird.weapontags;
      while (textArray[index].includes('Attack')) {
        var attackString = textArray[index];
        if (!textArray[index + 1].includes('Attack') && !textArray[index + 1].includes('Combat')) {
          attackString += textArray[index + 1];
          index++;
        }
        var itemTags = [];
        if (attackString.includes('Tags:')) {
          var tagString = attackString.match(/Tags:(.*$)/)[1] || '';
          var tagSplit = tagString.split(/,|;/);
          for (let tag of tagSplit) {
            if (tag.includes('(')) {
              var rangeTag = tag.match(/\(([^)]+)\)/)[1]?.replace(/\s+/g, '').replace('-', '').trim().toLowerCase();
              if (weaponTags[rangeTag]) {
                itemTags.push(rangeTag);
              }
              tag = tag.replace(/\(([^)]+)\)/g, '');
            }
            tag = tag.replace(/\s+/g, '').replace('-', '').trim().toLowerCase();
            if (weaponTags[tag]) {
              itemTags.push(tag);
            }
          }
        }
        var weaponDescription = ''
        var tagSplit = attackString.replace('Attack ', '').split(';');
        var attackArray = tagSplit[0].split(':');
        var attackName = attackArray[0].replace('(', '').replace(')', '');
        var damage = 1;
        var overwhelming = 1;
        var accuracy = 0;
        var accuracySplit = attackArray[1].trim().replace(')', '').split('(');
        accuracy = parseInt(accuracySplit[0].replace(/[^0-9]/g, ''));
        if (!attackString.toLowerCase().includes('grapple')) {
          var damageSplit = accuracySplit[1].split('Damage');
          if (damageSplit[1].includes('/')) {
            var damageSubSplit = damageSplit[1].split('/');
            damage = parseInt(damageSubSplit[0].replace(/[^0-9]/g, ''));
            overwhelming = parseInt(damageSubSplit[1].replace(/[^0-9]/g, ''));
          }
          else if (damageSplit[1].includes(',')) {
            var damageSubSplit = damageSplit[1].split(',');
            damage = parseInt(damageSubSplit[0].replace(/[^0-9]/g, ''));
            if (damageSplit[1].includes('minimum')) {
              overwhelming = parseInt(damageSubSplit[1].replace(/[^0-9]/g, ''));
            }
          }
          else if (damageSplit[1].includes(';')) {
            damage = parseInt(damageSplit[1].split(';')[0].replace(/[^0-9]/g, ''))
            weaponDescription = damageSplit[1].split(';')[1];
          }
          else {
            damage = parseInt(damageSplit[1].replace(/[^0-9]/g, ''));
          }
        }
        index++;
        itemData.push(
          {
            type: 'weapon',
            img: CONFIG.exaltedthird.itemIcons['weapon'],
            name: attackName.trim(),
            system: {
              description: weaponDescription,
              witheringaccuracy: accuracy,
              witheringdamage: damage,
              overwhelming: overwhelming,
              ability: "none",
              attribute: "none",
              traits: {
                weapontags: {
                  value: itemTags,
                  custom: "",
                }
              }
            }
          }
        );
      }
      this.errorSection = 'Combat Stats';
      var combatString = textArray[index].replace('Combat:', '');
      index++;
      while (!textArray[index].includes("Social")) {
        combatString += textArray[index];
        index++;
      }
      var createArmor = false;
      var armorName = '';
      var armorValue = 0;
      var armorHardness = 0;
      var armorPenalty = 0;
      var combatArray = combatString.split(/,|;/);
      for (let combatStat of combatArray) {
        var armorStat = 0;
        var combatName = combatStat.match(/[^0-9+]+/g)[0];
        if (combatStat.includes('(') && (combatName.toLowerCase().trim() === 'soak' || combatName.toLowerCase().trim() === 'hardness')) {
          var armor = combatStat.match(/\(([^)]+)\)/)[1];
          armorStat = parseInt(armor.replace(/[^0-9]/g, ''));
          if (combatName.toLowerCase().trim() === 'soak' || combatName.toLowerCase().trim() === 'hardness' || combatName.toLowerCase().trim() === 'evasion') {
            if (combatName.toLowerCase().trim() === 'soak' || combatName.toLowerCase().trim() === 'hardness') {
              if (armor.includes('/')) {
                var armorSplit = armor.split('/');
                armorValue = parseInt(armorSplit[0].replace(/[^0-9]/g, ''));
                armorHardness = parseInt(armorSplit[1].replace(/[^0-9]/g, ''));
              }
              else {
                armorValue = armorStat;
              }
            }
            createArmor = true;
            armorName = armor;
          }
          combatStat = combatStat.replace(/\([^()]*\)/g, "").replace("  ", " ");
        }
        var combatValue = parseInt(combatStat.replace(/[^0-9]/g, ''));
        if (combatName.toLowerCase().trim() === 'soak') {
          actorData.system.soak.value = combatValue;
          actorData.system.naturalsoak.value = combatValue;
        }
        if (combatName.toLowerCase().trim() === 'hardness') {
          actorData.system.hardness.value = combatValue;
        }
        if (combatName.toLowerCase().trim() === 'evasion') {
          actorData.system.evasion.value = combatValue;
          if (armorStat) {
            armorPenalty = armorStat;
          }
        }
        if (combatName.toLowerCase().trim() === 'parry') {
          actorData.system.parry.value = combatValue;
        }
      }
      if (createArmor) {
        itemData.push(
          {
            type: 'armor',
            img: CONFIG.exaltedthird.itemIcons['armor'],
            name: armorName.trim(),
            system: {
              soak: armorValue,
              hardness: armorHardness,
              penalty: armorPenalty,
            }
          }
        );
        actorData.system.armoredsoak.value = armorValue;
        if (armorValue) {
          actorData.system.naturalsoak.value = actorData.system.naturalsoak.value - armorValue;
        }
      }
      if (textArray[index].includes('Social')) {
        this.errorSection = 'Social Stats';
        var socialArray = textArray[index].replace('Social:', '').split(',');
        for (var socialAbility of socialArray) {
          var attributeSpecificArray = socialAbility.trim().split(' ');
          if (attributeSpecificArray[0].toLocaleLowerCase().includes('resolve')) {
            actorData.system.resolve.value = parseInt(attributeSpecificArray[1].replace(/[^0-9]/g, ''));
          }
          if (attributeSpecificArray[0].toLocaleLowerCase().includes('guile')) {
            actorData.system.guile.value = parseInt(attributeSpecificArray[1].replace(/[^0-9]/g, ''));
          }
        }
        index++;
      }
      readingItems = true;
      itemData.push(...this._getItemData(textArray, index, actorData));
      readingItems = false;
      actorData.items = itemData;
      if (folder) {
        actorData.folder = folder;
      }
      actorData.system.settings.editmode = false;
      const actor = await Actor.create(actorData);
      if (actorData.system.creaturetype === 'exalt') {
        await actor.calculateDerivedStats('resonance');
      }
      await actor.calculateDerivedStats('classifications');
    }
    catch (error) {
      console.log(error);
      console.log(textArray);
      console.log(index);
      if (!readingItems) {
        this.data.error = textArray[index];
      }
      this.data.showError = true;
    }
  }

  _getHealthLevels(textArray, index, actorData) {
    var healthArray = textArray[index].replace('Health Levels: ', '').replace('/incap.', '').split('/');
    for (const health of healthArray) {
      if (health.includes('0x')) {
        actorData.system.health.levels.zero.value = parseInt(health.replace('0x', '').replace(/[^0-9]/g, ''));
      }
      if (health.includes('1x')) {
        actorData.system.health.levels.one.value = parseInt(health.replace('1x', '').replace(/[^0-9]/g, ''));
      }
      if (health.includes('2x')) {
        actorData.system.health.levels.two.value = parseInt(health.replace('2x', '').replace(/[^0-9]/g, ''));
      }
      if (health.includes('4x')) {
        actorData.system.health.levels.four.value = parseInt(health.replace('4x', '').replace(/[^0-9]/g, ''));
      }
    }
  }

  _getExaltSpecificData(textArray, index, actorData, isAdversary) {
    if (!isAdversary) {
      actorData.system.creaturetype = 'exalt';
    }
    actorData.system.settings.showanima = true;
    actorData.system.details.caste = textArray[index].replace('Caste: ', '').replace('Aspect: ', '').toLowerCase().replace(/\s+/g, "").trim();
    if (['earth', 'water', 'air', 'fire', 'wood'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'dragonblooded';
      actorData.system.settings.hasaura = true;
    }
    if (['nomoon', 'fullmoon', 'changingmoon', 'casteless'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'lunar';
    }
    if (['dawn', 'zenith', 'twilight', 'night', 'eclipse'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'solar';
    }
    if (['serenity', 'battles', 'endings', 'journeys', 'secrets'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'sidereal';
    }
    if (['dusk', 'midnight', 'daybreak', 'moonshadow', 'day'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'abyssal';
    }
    if (['adamant', 'jade', 'moonsilver', 'orichalcum', 'starmetal', 'soulsteel'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'alchemical';
    }
    if (['spring', 'summer', 'fall', 'winter'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'getimian';
    }
    if (['azimuth', 'ascendant', 'horizon', 'nadir', 'penumbra'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'infernal';
    }
    if (['blood', 'breath', 'flesh', 'marrow', 'soil'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'liminal';
    }
  }

  _getItemData(textArray, index, actorData) {
    this.errorSection = 'Items';
    var itemData = [];
    if (textArray[index] === '') {
      index++;
    }
    var itemType = 'charm';
    var newItem = true;
    var itemName = '';
    var itemDescription = '';
    var charmSystemData = {
      description: '',
      ability: 'other',
      cost: {
        "motes": 0,
        "initiative": 0,
        "anima": 0,
        "willpower": 0,
        "aura": "",
        "health": 0,
        "healthtype": "bashing",
        "silverxp": 0,
        "goldxp": 0,
        "whitexp": 0
      }

    };
    var spellSystemData = {
      description: '',
    };
    try {
      while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
        if (textArray[index] && index !== (textArray.length - 1)) {
          if (newItem) {
            if (textArray[index].trim().toLowerCase() === 'merits') {
              itemType = 'merit';
              index++;
              newItem = true;
            }
            else if (textArray[index].trim().toLowerCase() === 'intimacies') {
              itemType = 'intimacy';
              index++;
              newItem = true;
            }
            else if (textArray[index].trim().toLowerCase().includes('charms') || textArray[index].trim().toLowerCase() === 'war' || textArray[index].trim().toLowerCase().includes('evocations') || textArray[index].trim().toLowerCase() === 'anima') {
              charmSystemData.listingname = textArray[index].trim();
              if (textArray[index].trim().toLowerCase().includes('offensive')) {
                charmSystemData.ability = 'offensive';
              }
              else if (textArray[index].trim().toLowerCase().includes('defensive')) {
                charmSystemData.ability = 'defensive';
              }
              else if (textArray[index].trim().toLowerCase().includes('social')) {
                charmSystemData.ability = 'social';
              }
              else if (textArray[index].trim().toLowerCase().includes('mobility') || textArray[index].trim().toLowerCase().includes('movement')) {
                charmSystemData.ability = 'mobility';
              }
              else if (textArray[index].trim().toLowerCase().includes('evocations')) {
                charmSystemData.ability = 'evocation';
              }
              else if (textArray[index].trim().toLowerCase().includes('craft')) {
                charmSystemData.ability = 'craft';
              }
              else if (textArray[index].trim().toLowerCase() === 'war' || textArray[index].trim().toLowerCase() === 'warfare charms' || textArray[index].trim().toLowerCase() === 'war charms') {
                charmSystemData.ability = 'war';
              }
              else {
                charmSystemData.ability = 'other';
              }
              itemType = 'charm';
              index++;
              newItem = true;
            }
            else if (textArray[index].trim().toLowerCase().includes('new merit:')) {
              itemType = 'merit';
              newItem = true;
            }
            else if (textArray[index].trim().toLowerCase() === 'sorcery' || textArray[index].trim().toLowerCase() === 'necromancy') {
              itemType = 'spell';
              index++;
              newItem = true;
              charmSystemData.ability = 'occult';
            }
            else if (textArray[index].trim().toLowerCase() === 'shapeshifting') {
              itemType = 'shape';
              index++;
              newItem = true;
              itemDescription += textArray[index].trim();
              itemDescription += '\n';
            }
            else if (textArray[index].trim().toLowerCase() === 'escort' || textArray[index].trim().toLowerCase().includes('protectors:')) {
              itemType = 'escort';
              index++;
              newItem = true;
              actorData.system.settings.showescort = true;
            }
            else if (textArray[index].trim().toLowerCase() === 'special abilities' || textArray[index].trim().toLowerCase() === 'special attacks' || textArray[index].trim().toLowerCase() === 'traits' || textArray[index].trim().toLowerCase() === 'excellencies') {
              itemType = 'specialability';
              index++;
              newItem = true;
            }
          }
          if (index > textArray.length - 1) {
            break;
          }
          if (textArray[index].trim() === '') {
            index++;
          }
          if (index > textArray.length - 1) {
            break;
          }
          if (newItem) {
            if (itemType === 'intimacy') {
              var intimacyArray = textArray[index].split(':');
              var intimacyType = 'tie';
              if (intimacyArray[0].includes('Principle')) {
                intimacyType = 'principle';
              }
              else if (intimacyArray[0].includes('Tie')) {
                intimacyType = 'tie';
              }
              itemData.push(
                {
                  type: itemType,
                  img: CONFIG.exaltedthird.itemIcons[itemType],
                  name: intimacyArray[1].trim(),
                  system: {
                    description: intimacyArray[1].trim(),
                    intimacytype: intimacyType,
                    strength: intimacyArray[0].replace('Principle', '').replace('Tie', '').trim().toLowerCase()
                  }
                }
              );
            }
            //First line
            else if (itemType === 'specialability' || itemType === 'merit') {
              var titleArray = textArray[index].split(':');
              itemName = titleArray[0].trim();
              if (titleArray[0].toLowerCase().includes('new merit')) {
                itemName = titleArray[1].trim();
              }
              else if (titleArray.length === 2) {
                itemDescription += titleArray[1].trim();
              }
              if (itemType === 'merit' && itemName === 'Legendary Size') {
                actorData.system.sizecategory = 'legendary';
              }
              if (itemType === 'merit' && itemName === 'Tiny Creature') {
                actorData.system.sizecategory = 'tiny';
              }
              if (itemType === 'merit' && itemName === 'Minuscule Size') {
                actorData.system.sizecategory = 'minuscule';
              }
              newItem = false;
            }
            else if (itemType === 'quality' || itemType === 'escort') {
              itemDescription += textArray[index].trim();
              newItem = false;
            }
            else if (itemType === 'spell') {
              if (textArray[index].toLowerCase().includes('shaping ritual')) {
                var titleArray = textArray[index].split(':');
                itemName = titleArray[0].trim();
                if (titleArray.length === 2) {
                  itemDescription += titleArray[1].trim();
                }
                itemType = 'ritual';
              }
              else if (!textArray[index].includes('(')) {
                var titleArray = textArray[index].split(':');
                itemName = titleArray[0].trim();
                if (titleArray.length === 2) {
                  itemDescription += titleArray[1].trim();
                }
                itemType = 'ritual';
              }
              else if (!(/\d+(\.\d+)?sm/g).test(textArray[index]) && !textArray[index].includes('Ritual')) {
                itemType = 'charm';
              }
              else {
                itemType = 'spell';
                var titleArray = (textArray[index] + textArray[index + 1]).split('(');
                itemName = titleArray[0].trim();
                var contentArray = titleArray[1].split('):');
                var spellDataArray = contentArray[0].trim().split(';');
                itemDescription += contentArray[1].trim();
                var costArray = spellDataArray[0].replace(/\[(.+?)\]/g, '').trim().split(',');
                for (let costString of costArray) {
                  costString = costString.trim();
                  if (costString.includes('sm')) {
                    var num = costString.replace(/[^0-9]/g, '');
                    spellSystemData.cost = parseInt(num) || 0;
                  }
                  if (costString.includes('wp')) {
                    var num = costString.replace(/[^0-9]/g, '');
                    spellSystemData.willpower = parseInt(num) || 0;
                  }
                }
                index++;
                spellSystemData.duration = spellDataArray[1]?.trim() || '';
                spellSystemData.keywords = spellDataArray[2]?.trim() || '';
              }
              newItem = false;
            }
            if (itemType === 'charm') {
              var titleArray = textArray[index] + textArray[index + 1];
              itemName = titleArray.substring(0, titleArray.indexOf('('));
              var contentArray = titleArray.substring(titleArray.indexOf('(') + 1).split('):');
              var charmDataArray = contentArray[0].trim().split(';');
              itemDescription += contentArray[1].trim();
              var costArray = charmDataArray[0].replace(/\[(.+?)\]/g, '').trim().split(',');
              for (var i = 0; i < costArray.length; i++) {
                var costString = costArray[i].trim();
                if (costString.includes('m')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.motes = parseInt(num) || 0;
                }
                if (costString.includes('i')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.initiative = parseInt(num) || 0;
                }
                if (costString.includes('a')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.anima = parseInt(num) || 0;
                }
                if (costString.includes('Penumbra')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.penumbra = parseInt(num) || 0;
                }
                if (costString.includes('wp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.willpower = parseInt(num) || 0;
                }
                if (costString.includes('hl')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.health = parseInt(num) || 0;
                  if (costString.includes('ahl')) {
                    charmSystemData.cost.healthtype = 'aggravated';
                  }
                  if (costString.includes('lhl')) {
                    charmSystemData.cost.healthtype = 'lethal';
                  }
                }
                if (costString.includes('Fire')) {
                  charmSystemData.cost.aura = 'fire';
                }
                if (costString.includes('Earth')) {
                  charmSystemData.cost.aura = 'earth';
                }
                if (costString.includes('Air')) {
                  charmSystemData.cost.aura = 'air';
                }
                if (costString.includes('Water')) {
                  charmSystemData.cost.aura = 'water';
                }
                if (costString.includes('Wood')) {
                  charmSystemData.cost.aura = 'wood';
                }
                if (costString.includes('gxp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.goldxp = parseInt(num) || 0;
                }
                else if (costString.includes('sxp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.silverxp = parseInt(num) || 0;
                }
                else if (costString.includes('wxp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.whitexp = parseInt(num) || 0;
                }
                else if (costString.includes('xp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.xp = parseInt(num) || 0;
                }
              }
              charmSystemData.type = charmDataArray[1]?.trim() || '';
              charmSystemData.duration = charmDataArray[2]?.trim() || '';
              if (charmSystemData.type === 'Permanent') {
                charmSystemData.duration = 'Permanent';
              }
              else {
                charmSystemData.duration = charmDataArray[2]?.trim() || '';
              }
              charmSystemData.keywords = charmDataArray[3]?.trim() || '';
              if (charmSystemData.keywords.toLowerCase().includes('eclipse')) {
                charmSystemData.charmtype = 'eclipse';
              }
              index++;
              newItem = false;
            }
          }
          else {
            itemDescription += ` ${textArray[index].trim()}`;
          }
        }
        else {
          if (index === textArray.length - 1) {
            itemDescription += ` ${textArray[index].trim()}`;
          }
          newItem = true;
          // Create Items
          if (itemType === 'specialability' || itemType === 'merit' || itemType === 'ritual') {
            itemData.push(
              {
                type: itemType,
                img: CONFIG.exaltedthird.itemIcons[itemType],
                name: itemName,
                system: {
                  description: itemDescription.trim(),
                }
              }
            );
            if (itemType === 'ritual') {
              itemType = 'spell';
            }
          }
          else if (itemType === 'charm') {
            charmSystemData.description = itemDescription.trim();
            itemData.push(
              {
                type: itemType,
                img: CONFIG.exaltedthird.itemIcons[itemType],
                name: itemName,
                system: charmSystemData,
              }
            );
            if (charmSystemData.ability === 'occult') {
              itemType = 'spell';
            }
          }
          else if (itemType === 'spell') {
            spellSystemData.description = itemDescription.trim();
            itemData.push(
              {
                type: itemType,
                img: CONFIG.exaltedthird.itemIcons[itemType],
                name: itemName,
                system: spellSystemData,
              }
            );
          }
          else if (itemType === 'quality') {
            actorData.system.qualities += itemDescription.trim();
          }
          else if (itemType === 'escort') {
            actorData.system.escort += itemDescription.trim();
          }
          charmSystemData = {
            description: '',
            ability: charmSystemData.ability,
            listingname: charmSystemData.listingname,
            cost: {
              "motes": 0,
              "initiative": 0,
              "anima": 0,
              "willpower": 0,
              "aura": "",
              "health": 0,
              "healthtype": "bashing",
              "silverxp": 0,
              "goldxp": 0,
              "penumbra": 0,
              "whitexp": 0
            }
          };
          spellSystemData = {
            description: '',
          };
          itemName = '';
          itemDescription = '';
        }
        index++;
      }
      return itemData;
    } catch (error) {
      console.log(error);
      console.log(textArray);
      console.log(index);
      this.data.errorSection = itemType;
      this.data.error = textArray[index];
      this.data.showError = true;
    }
  }

  _getStatBlock(adversary = false) {
    return new Actor.implementation({
      name: 'New Character',
      type: adversary ? 'character' : 'npc'
    }).toObject();
  }

  getTextInsideParentheses(inputString) {
    // Regular expression to match text inside parentheses
    const regex = /\(([^)]+)\)/;

    // Use match() to find text inside parentheses
    const matches = inputString.match(regex);

    // Check if any matches were found
    if (matches) {
      // Extracted text inside parentheses is in the first capturing group
      const textInsideParentheses = matches[1];
      return textInsideParentheses;
    } else {
      // Return an empty string if no matches were found
      return '';
    }
  }

  static async showHelpDialog(event, target) {
    const html = await renderTemplate("systems/exaltedthird/templates/dialogues/help-dialogue.html");
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("Ex3.ReadMe"), resizable: true },
      content: html,
      buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
      classes: [`${game.settings.get("exaltedthird", "sheetStyle")}-background`],
    }).render(true);
  }
}
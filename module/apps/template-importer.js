export default class TemplateImporter extends Application {
  constructor(app, options, object, data) {
    super(app)
    this.type = 'charm';
    this.charmType = 'other';
    this.spellCircle = 'terrestrial';
    this.itemType = 'armor';
    this.folder = '';
    this.errorText = '';
    this.errorSection = '';
    this.showError = false;
    this.textBox = '';
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "ex3-template-importer";
    options.template = "systems/exaltedthird/templates/dialogues/template-importer.html"
    options.resizable = true;
    options.height = 900;
    options.width = 860;
    options.minimizable = true;
    options.title = "Template Importer"
    return options;
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    const helpButton = {
      label: game.i18n.localize('Ex3.Help'),
      class: 'help-dialogue',
      icon: 'fas fa-question',
      onclick: async () => {
        let confirmed = false;
        const html = await renderTemplate("systems/exaltedthird/templates/dialogues/help-dialogue.html");
        new Dialog({
          title: `ReadMe`,
          content: html,
          buttons: {
            cancel: { label: "Close", callback: () => confirmed = false }
          }
        }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
      },
    };
    buttons = [helpButton, ...buttons];
    return buttons;
  }

  getData() {
    let data = super.getData();
    data.type = this.type;
    data.charmType = this.charmType;
    data.spellCircle = this.spellCircle;
    data.itemType = this.itemType;
    data.folder = this.folder;
    data.textBox = this.textBox;
    data.showError = this.showError;
    data.error = this.error;
    data.errorSection = this.errorSection;
    if (this.type === 'charm') {
      data.templateHint = game.i18n.localize("Ex3.CharmImportHint");
    }
    if (this.type === 'spell') {
      data.templateHint = game.i18n.localize("Ex3.SpellImportHint");
    }
    if (this.type === 'adversary') {
      data.templateHint = game.i18n.localize("Ex3.AdversaryImportHint");
    }
    if (this.type === 'qc') {
      data.templateHint = game.i18n.localize("Ex3.QCImportHint");
    }
    if (this.type === 'other') {
      data.templateHint = game.i18n.localize("Ex3.OtherImportHint");
    }
    return data;
  }

  async createCharm(html) {
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    var charmType = html.find('#charmType').val();
    var folderName = html.find('#folder').val();
    var folder = null;

    if(folderName) {
      folder = game.folders.find(folder => {
        return folder.name === folderName && folder.type === 'Item';
      });
  
      if(!folder) {
        folder = await Folder.create({ name: folderName, type: 'Item' });
      }
    }

    var index = 0;
    while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
      var charmData = {
        type: 'charm',
        system: {
          charmtype: charmType,
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
          }
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

      if(charmData.system.duration.toLowerCase() === 'one scene') {
        charmData.system.endtrigger = 'endscene';
      }
      if(charmData.system.duration.toLowerCase() === 'one turn' || charmData.system.duration.toLowerCase() === 'until next turn') {
        charmData.system.endtrigger = 'startturn';
      }
      if(charmData.system.duration.toLowerCase() !== 'permanent' && charmData.system.duration.toLowerCase() !== 'instant') {
        charmData.system.cost.commitmotes = charmData.system.cost.motes;
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
      charmData.system.description = description;
      if(folder) {
        charmData.folder = folder;
      }
      await Item.create(charmData);
      index++;
    }
  }

  standardCharm(charmData, textArray, index) {
    var costAndRequirement = textArray[index];
    index++;
    if (!textArray[index].includes('Type:')) {
      costAndRequirement += textArray[index];
    }
    costAndRequirement = costAndRequirement.replace('Cost: ', '').replace('Mins: ', '').split(';');
    var costArray = costAndRequirement[0].split(',');
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
        charmData.system.cost.motes = parseInt(num);
      }
      if (costString.includes('i')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.initiative = parseInt(num);
      }
      if (costString.includes('a')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.anima = parseInt(num);
      }
      if (costString.includes('wp')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.willpower = parseInt(num);
      }
      if (costString.includes('hl')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.health = parseInt(num);
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
        charmData.system.cost.goldxp = parseInt(num);
      }
      else if (costString.includes('sxp')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.silverxp = parseInt(num);
      }
      else if (costString.includes('wxp')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.whitexp = parseInt(num);
      }
      else if (costString.includes('xp')) {
        var num = costString.replace(/[^0-9]/g, '');
        charmData.system.cost.xp = parseInt(num);
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
      charmData.system.ability = 'evocation';
      charmData.system.essence = essenceRequirement[1].replace(/[^0-9]/g, '');
    }
    if (requirementArray.length === 2) {
      var essenceRequirement = requirementArray[1].trim().split(' ');
      charmData.system.essence = essenceRequirement[1].replace(/[^0-9]/g, '');
    }
  }

  async createSpell(html) {
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    var spellCircle = html.find('#spellCircle').val();

    var index = 0;
    var folderName = html.find('#folder').val();
    var folder = null;

    if(folderName) {
      folder = game.folders.find(folder => {
        return folder.name === folderName && folder.type === 'Item';
      });
  
      if(!folder) {
        folder = await Folder.create({ name: folderName, type: 'Item' });
      }
    }
    while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
      var spellData = {
        type: 'spell',
        system: {
          circle: spellCircle,
        }
      };
      spellData.name = textArray[index];
      index++;
      var costArray = textArray[index].replace('Cost: ', '').split(',');
      index++;
      for (let costString of costArray) {
        costString = costString.trim();
        if (costString.includes('sm')) {
          var num = costString.replace(/[^0-9]/g, '');
          spellData.system.cost = parseInt(num);
        }
        if (costString.includes('wp')) {
          var num = costString.replace(/[^0-9]/g, '');
          spellData.system.willpower = parseInt(num);
        }
      }

      spellData.system.keywords = textArray[index].replace('Keywords: ', '');
      index++;
      spellData.system.duration = textArray[index].replace('Duration: ', '');
      index++;
      var description = '';
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
      if(folder) {
        spellData.folder = folder;
      }
      await Item.create(spellData);
      index++;
    }
  }

  
  async createOther(html) {
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    var itemType = html.find('#itemType').val();
    var index = 0;

    var folderName = html.find('#folder').val();
    var folder = null;

    if(folderName) {
      folder = game.folders.find(folder => {
        return folder.name === folderName && folder.type === 'Item';
      });
  
      if(!folder) {
        folder = await Folder.create({ name: folderName, type: 'Item' });
      }
    }
    const weaponTags = CONFIG.exaltedthird.weapontags;
    const armorTags = CONFIG.exaltedthird.armortags;
    while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
      var itemData = {
        type: itemType,
        system: {
        }
      };
      itemData.name = textArray[index];
      index++;
      var description = '';
      while (textArray[index] && index !== textArray.length) {
        if(textArray[index].includes('Tags:')) {
          var tagString = textArray[index].toLowerCase().replace('tags:' , '');
          var tagSplit = tagString.split(/,|;/);
          var itemTags = [];
          for(let tag of tagSplit) {
            if(tag.includes('(')) {
              var rangeTag = tag.match(/\(([^)]+)\)/)[1]?.replace(/\s+/g, '').replace('-', '').trim();
              console.log(rangeTag);
              if(weaponTags[rangeTag] && itemType === 'weapon') {
                itemTags.push(rangeTag);
              }
              else if(armorTags[rangeTag] && itemType === 'armor') {
                itemTags.push(rangeTag);
              }
              tag = tag.replace(/\(([^)]+)\)/g, '');
            }
            tag = tag.replace(/\s+/g, '').replace('-', '').trim();
            if(weaponTags[tag] && itemType === 'weapon') {
              itemTags.push(tag);
            }
            else if(armorTags[tag] && itemType === 'armor') {
              itemTags.push(tag);
            }
          }
          itemData.system.traits = {};
          if(itemType === 'armor') {
            itemData.system.traits.armortags = {
              "value": [],
              "custom": ""
            }
            itemData.system.traits.armortags.value = itemTags;
          }
          if(itemType === 'weapon') {
            itemData.system.traits.weapontags = {
              "value": [],
              "custom": ""
            }
            itemData.system.traits.weapontags.value = itemTags;
          }
        } else {
          description += textArray[index];
          description += " ";
        }

        index++;
      }
      itemData.system.description = description;
      if(folder) {
        itemData.folder = folder;
      }
      await Item.create(itemData);
      index++;
    }
  }

  _getStatBlock(adversary = false) {
    if (adversary) {
      return {
        type: 'character',
        system: {
          "attributes": {
            "strength": {
              "favored": false,
              "value": 1,
              "name": "Ex3.Strength"
            },
            "charisma": {
              "favored": false,
              "value": 1,
              "name": "Ex3.Charisma"
            },
            "perception": {
              "favored": false,
              "value": 1,
              "name": "Ex3.Perception"
            },
            "dexterity": {
              "favored": false,
              "value": 1,
              "name": "Ex3.Dexterity"
            },
            "manipulation": {
              "favored": false,
              "value": 1,
              "name": "Ex3.Manipulation"
            },
            "intelligence": {
              "favored": false,
              "value": 1,
              "name": "Ex3.Intelligence"
            },
            "stamina": {
              "favored": false,
              "value": 1,
              "name": "Ex3.Stamina"
            },
            "appearance": {
              "favored": false,
              "value": 1,
              "name": "Ex3.Appearance"
            },
            "wits": {
              "favored": false,
              "value": 1,
              "name": "Ex3.Wits"
            }
          },
          "abilities": {
            "archery": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Archery"
            },
            "athletics": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Athletics"
            },
            "awareness": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Awareness"
            },
            "brawl": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Brawl"
            },
            "bureaucracy": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Bureaucracy"
            },
            "craft": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Craft"
            },
            "dodge": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Dodge"
            },
            "integrity": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Integrity"
            },
            "investigation": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Investigation"
            },
            "larceny": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Larceny"
            },
            "linguistics": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Linguistics"
            },
            "lore": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Lore"
            },
            "martialarts": {
              "favored": false,
              "value": 0,
              "name": "Ex3.MartialArts"
            },
            "medicine": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Medicine"
            },
            "melee": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Melee"
            },
            "occult": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Occult"
            },
            "performance": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Performance"
            },
            "presence": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Presence"
            },
            "resistance": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Resistance"
            },
            "ride": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Ride"
            },
            "sail": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Sail"
            },
            "socialize": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Socialize"
            },
            "stealth": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Stealth"
            },
            "survival": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Survival"
            },
            "thrown": {
              "favored": false,
              "value": 0,
              "name": "Ex3.Thrown"
            },
            "war": {
              "favored": false,
              "value": 0,
              "name": "Ex3.War"
            }
          },
          "health": {
            "levels": {
              "zero": {
                "value": 1,
                "penalty": 0
              },
              "one": {
                "value": 2,
                "penalty": 1
              },
              "two": {
                "value": 2,
                "penalty": 2
              },
              "four": {
                "value": 1,
                "penalty": 4
              },
              "inc": {
                "value": 1,
                "penalty": "inc"
              }
            },
            "bashing": 0,
            "lethal": 0,
            "aggravated": 0,
            "value": 0,
            "max": 0
          },
          "willpower": {
            "value": 0,
            "total": 5,
            "max": 5,
            "min": 0
          },
          "speed": {
            "value": 0,
            "min": 0
          },
          "essence": {
            "value": 1,
            "min": 0,
            "max": 10
          },
          "motes": {
            "personal": {
              "value": 0,
              "total": 0,
              "max": 0,
              "committed": 0
            },
            "peripheral": {
              "value": 0,
              "total": 0,
              "max": 0,
              "committed": 0
            }
          },
          "evasion": {
            "value": 0
          },
          "parry": {
            "value": 0
          },
          "soak": {
            "value": 1
          },
          "armoredsoak": {
            "value": 0
          },
          "naturalsoak": {
            "value": 1
          },
          "hardness": {
            "value": 0,
            "min": 0
          },
          "resolve": {
            "value": 0
          },
          "guile": {
            "value": 0
          },
          "appearance": {
            "value": 0
          },
          "anima": {
            "value": 0,
            "max": 3,
            "level": "Dim",
            "passive": "",
            "active": "",
            "iconic": ""
          },
          "sorcery": {
            "motes": 0
          },
          "savedRolls": {},
          "legendarysize": false,
          "traits": {
            "languages": {
              "value": [],
              "custom": ""
            }
          },
          "details": {
            "exalt": "other",
            "caste": "",
            "color": "#000000",
            "tell": "",
            "spiritshape": "",
            "aura": "none",
            "ideal": "",
            "supernal": "",
            "cthonic": "",
            "penumbra": {
              "value": 0,
              "max": 10,
              "min": 0
            }
          },
          "creaturetype": "mortal",
          "qualities": '',
          "escort": '',
          "settings": {
            "charmmotepool": "peripheral",
            "showwarstrider": false,
            "showship": false,
            "showescort": false,
            "usetenattributes": false,
            "editmode": false,
          },
        }
      };
    };
    return {
      type: 'npc',
      system: {
        "pools": {
          "command": {
            "name": "Ex3.Command",
            "value": 0
          },
          "grapple": {
            "name": "Ex3.GrappleControl",
            "value": 0
          },
          "joinbattle": {
            "name": "Ex3.JoinBattle",
            "value": 0
          },
          "movement": {
            "name": "Ex3.Movement",
            "value": 0
          },
          "readintentions": {
            "name": "Ex3.ReadIntentions",
            "value": 0
          },
          "social": {
            "name": "Ex3.Social",
            "value": 0
          },
          "sorcery": {
            "name": "Ex3.Sorcery",
            "value": 0
          }
        },
        "health": {
          "levels": {
            "zero": {
              "value": 1,
              "penalty": 0
            },
            "one": {
              "value": 2,
              "penalty": 1
            },
            "two": {
              "value": 2,
              "penalty": 2
            },
            "four": {
              "value": 1,
              "penalty": 4
            },
            "inc": {
              "value": 1,
              "penalty": "inc"
            }
          },
          "bashing": 0,
          "lethal": 0,
          "aggravated": 0,
          "value": 0,
          "max": 0
        },
        "willpower": {
          "value": 0,
          "total": 5,
          "max": 5,
          "min": 0
        },
        "speed": {
          "value": 0,
          "min": 0
        },
        "essence": {
          "value": 1,
          "min": 0,
          "max": 10
        },
        "motes": {
          "personal": {
            "value": 0,
            "total": 0,
            "max": 0,
            "committed": 0
          },
          "peripheral": {
            "value": 0,
            "total": 0,
            "max": 0,
            "committed": 0
          }
        },
        "evasion": {
          "value": 0
        },
        "parry": {
          "value": 0
        },
        "soak": {
          "value": 1
        },
        "armoredsoak": {
          "value": 0
        },
        "naturalsoak": {
          "value": 1
        },
        "hardness": {
          "value": 0,
          "min": 0
        },
        "resolve": {
          "value": 0
        },
        "guile": {
          "value": 0
        },
        "appearance": {
          "value": 0
        },
        "anima": {
          "value": 0,
          "max": 3,
          "level": "Dim",
          "passive": "",
          "active": "",
          "iconic": ""
        },
        "sorcery": {
          "motes": 0
        },
        "savedRolls": {},
        "legendarysize": false,
        "traits": {
          "languages": {
            "value": [],
            "custom": ""
          }
        },
        "details": {
          "exalt": "other",
          "caste": "",
          "color": "#000000",
          "tell": "",
          "aura": "none",
          "ideal": "",
          "supernal": "",
          "penumbra": {
            "value": 0,
            "max": 10,
            "min": 0
          }
        },
        "creaturetype": "mortal",
        "qualities": '',
        "escort": '',
        "settings": {
          "charmmotepool": "peripheral",
          "showwarstrider": false,
          "showship": false,
          "showescort": false,
          "usetenattributes": false,
          "editmode": false,
        },
      }
    };
  }

  async createQuickCharacter(html) {
    var actorData = this._getStatBlock(false);
    const itemData = [
    ];
    let index = 1;
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    this.errorSection = 'Initial Info';
    try {
      actorData.name = textArray[0].trim();
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
                  img: this.getImageUrl('intimacy'),
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
                  img: this.getImageUrl('intimacy'),
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
                  img: this.getImageUrl('intimacy'),
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
                  img: this.getImageUrl('intimacy'),
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
                img: this.getImageUrl('action'),
                name: name,
                system: {
                  value: parseInt(actionSplit[1].trim())
                }
              }
            )
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
        if (!textArray[index + 1].includes('Attack') && !textArray[index + 1].includes('Combat Movement')) {
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
          overwhelming= 0;
          var grappleSplit = attackArray[1].split('(');
          var grappleValue = parseInt(grappleSplit[1].replace(/[^0-9]/g, ''));
          actorData.system.pools.grapple.value = grappleValue;
        }
        index++;
        itemData.push(
          {
            type: 'weapon',
            img: this.getImageUrl('weapon'),
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

      if (soakArray[1].includes('(')) {
        var hardnessArray = soakArray[1].replace(')', '').split('(');
        actorData.system.hardness.value = parseInt(hardnessArray[0].replace(/[^0-9]/g, ''));
        itemData.push(
          {
            type: 'armor',
            img: this.getImageUrl('armor'),
            name: hardnessArray[1].trim(),
          }
        );
      }
      else {
        actorData.system.hardness.value = parseInt(soakArray[1].replace(/[^0-9]/g, ''));
      }
      index++;
      itemData.push(...this._getItemData(textArray, index, actorData));
      actorData.items = itemData;
      await Actor.create(actorData);
    }
    catch (error) {
      console.log(error);
      console.log(textArray);
      console.log(index);
      this.error = textArray[index];
      this.showError = true;
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
    actorData.system.details.caste = textArray[index].replace('Caste: ', '').replace('Aspect: ', '').toLowerCase().replace(/\s+/g, "").trim();
    if (['earth', 'water', 'air', 'fire', 'wood'].includes(actorData.system.details.caste)) {
      actorData.system.details.exalt = 'dragonblooded';
    }
    if (['nomood', 'fullmoon', 'changingmoon', 'casteless'].includes(actorData.system.details.caste)) {
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
            if (textArray[index].trim().toLowerCase() === 'intimacies') {
              itemType = 'intimacy';
              index++;
              newItem = true;
            }
            if (textArray[index].trim().toLowerCase().includes('charms') || textArray[index].trim().toLowerCase() === 'war' || textArray[index].trim().toLowerCase().includes('evocations') || textArray[index].trim().toLowerCase() === 'anima') {
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
            if (textArray[index].trim().toLowerCase().includes('new merit:')) {
              itemType = 'merit';
              newItem = true;
            }
            if (textArray[index].trim().toLowerCase() === 'sorcery' || textArray[index].trim().toLowerCase() === 'necromancy') {
              itemType = 'spell';
              index++;
              newItem = true;
              charmSystemData.ability = 'occult';
            }
            if (textArray[index].trim().toLowerCase() === 'shapeshifting') {
              itemType = 'quality';
              index++;
              newItem = true;
              itemDescription += textArray[index].trim();
              itemDescription += '\n';
            }
            if (textArray[index].trim().toLowerCase() === 'escort') {
              itemType = 'escort';
              index++;
              newItem = true;
              actorData.system.settings.showescort = true;
            }
            if (textArray[index].trim().toLowerCase() === 'special abilities' || textArray[index].trim().toLowerCase() === 'special attacks' || textArray[index].trim().toLowerCase() === 'traits') {
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
                  img: this.getImageUrl(itemType),
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
                actorData.system.legendarysize = true;
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
                    spellSystemData.cost = parseInt(num);
                  }
                  if (costString.includes('wp')) {
                    var num = costString.replace(/[^0-9]/g, '');
                    spellSystemData.willpower = parseInt(num);
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
                  charmSystemData.cost.motes = parseInt(num);
                }
                if (costString.includes('i')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.initiative = parseInt(num);
                }
                if (costString.includes('a')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.anima = parseInt(num);
                }
                if (costString.includes('wp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.willpower = parseInt(num);
                }
                if (costString.includes('hl')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.health = parseInt(num);
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
                  charmSystemData.cost.goldxp = parseInt(num);
                }
                else if (costString.includes('sxp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.silverxp = parseInt(num);
                }
                else if (costString.includes('wxp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.whitexp = parseInt(num);
                }
                else if (costString.includes('xp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  charmSystemData.cost.xp = parseInt(num);
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
                img: this.getImageUrl(itemType),
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
                img: this.getImageUrl(itemType),
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
                img: this.getImageUrl(itemType),
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
      this.errorSection = itemType;
      this.error = textArray[index];
      this.showError = true;
    }
  }

  async createAdversary(html) {
    var actorData = this._getStatBlock(true);
    const itemData = [
    ];
    let index = 1;
    var readingItems = false;
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    try {
      actorData.name = textArray[0].trim();
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
                img: this.getImageUrl('intimacy'),
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
                img: this.getImageUrl('specialty'),
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
        while (!textArray[index].includes("Attack")) {
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
                img: this.getImageUrl('merit'),
                name: meritName.trim(),
                system: {
                  points: meritValue ? meritValue : 0,
                }
              }
            );
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
        if(attackString.includes('Tags:')) {
          var tagString = attackString.match(/Tags:(.*$)/)[1] || ''; 
          var tagSplit = tagString.split(/,|;/);
          for(let tag of tagSplit) {
            if(tag.includes('(')) {
              var rangeTag = tag.match(/\(([^)]+)\)/)[1]?.replace(/\s+/g, '').replace('-', '').trim().toLowerCase();
              if(weaponTags[rangeTag]) {
                itemTags.push(rangeTag);
              }
              tag = tag.replace(/\(([^)]+)\)/g, '');
            }
            tag = tag.replace(/\s+/g, '').replace('-', '').trim().toLowerCase();
            if(weaponTags[tag]) {
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
            img: this.getImageUrl('weapon'),
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
            img: this.getImageUrl('armor'),
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
      await Actor.create(actorData);
    }
    catch (error) {
      console.log(error);
      console.log(textArray);
      console.log(index);
      if (!readingItems) {
        this.error = textArray[index];
      }
      this.showError = true;
    }
  }

  getImageUrl(type) {
    if (type === 'intimacy') {
      return "systems/exaltedthird/assets/icons/hearts.svg";
    }
    if (type === 'spell') {
      return "systems/exaltedthird/assets/icons/magic-swirl.svg";
    }
    if (type === 'ritual') {
      return "icons/svg/book.svg";
    }
    if (type === 'merit') {
      return "icons/svg/coins.svg"
    }
    if (type === 'weapon') {
      return "icons/svg/sword.svg";
    }
    if (type === 'armor') {
      return "systems/exaltedthird/assets/icons/breastplate.svg";
    }
    if (type === 'charm') {
      return "icons/svg/explosion.svg";
    }
    if (type === 'specialability') {
      return "icons/svg/aura.svg";
    }
    if (type === 'craftproject') {
      return "systems/exaltedthird/assets/icons/anvil-impact.svg";
    }
  }

  activateListeners(html) {
    html.on("change", "#charmType", ev => {
      this.charmType = ev.currentTarget.value;
      this.render();
    });

    html.on("change", "#itemType", ev => {
      this.itemType = ev.currentTarget.value;
      this.render();
    });

    html.on("change", "#folder", ev => {
      this.folder = ev.currentTarget.value;
      this.render();
    });

    html.on("change", ".radio", ev => {
      if (document.getElementById("charm-radio").checked) {
        this.type = "charm";
      } else if (document.getElementById("spell-radio").checked) {
        this.type = "spell";
      } else if (document.getElementById("qc-radio").checked) {
        this.type = "qc";
      }
      else if (document.getElementById("adversary-radio").checked) {
        this.type = "adversary";
      }
      else if (document.getElementById("other-radio").checked) {
        this.type = "other";
      }
      this.render();
    });

    html.find("#import-template").on("click", async (event) => {
      this.textBox = html.find('#template-text').val();
      this.showError = false;
      if (this.type === 'charm') {
        this.createCharm(html);
      } else if (this.type === 'spell') {
        this.createSpell(html);
      } else if (this.type === 'qc') {
        this.createQuickCharacter(html);
      }
      else if (this.type === 'adversary') {
        this.createAdversary(html);
      }
      else if (this.type === 'other') {
        this.createOther(html);
      }
      this.render();
    });
  }
}

Hooks.on("renderItemDirectory", (app, html, data) => {
  const button = $(`<button class="tempalte-importer">${game.i18n.localize("Ex3.CharmImport")}</button>`);
  html.find(".directory-footer").append(button);

  button.click(ev => {
    game.templateImporter.type = "charm";
    game.templateImporter.render(true);
  })
})

Hooks.on("renderActorDirectory", (app, html, data) => {
  const button = $(`<button class="tempalte-importer">${game.i18n.localize("Ex3.NPCImport")}</button>`);
  html.find(".directory-footer").append(button);

  button.click(ev => {
    game.templateImporter.type = "qc";
    game.templateImporter.render(true);
  })
})

Hooks.on('init', () => {
  if (!game.templateImporter)
    game.templateImporter = new TemplateImporter();
})
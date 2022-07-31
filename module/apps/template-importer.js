export default class TemplateImporter extends Application {
  constructor(app, options, object, data) {
    super(app)
    this.type = 'charm';
    this.errorText = '';
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

  getData() {
    let data = super.getData();
    data.type = this.type;
    data.textBox = this.textBox;
    data.showError = this.showError;
    data.error = this.error;
    if (this.type === 'charm') {
      data.templateHint = game.i18n.localize("Ex3.CharmImportHint");
    }
    if (this.type === 'spell') {
      data.templateHint = game.i18n.localize("Ex3.SpellImportHint");
    }
    if (this.type === 'character') {
      data.templateHint = game.i18n.localize("Ex3.CharacterImportHint");
    }
    if (this.type === 'qc') {
      data.templateHint = game.i18n.localize("Ex3.QCImportHint");
    }
    return data;
  }

  async createCharm(html) {
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    var charmData = {
      type: 'charm',
      system: {
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
      }
    };
    charmData.name = textArray[0];
    var costAndRequirement = textArray[1].replace('Cost: ', '').replace('Mins: ', '').split(';');
    var costArray = costAndRequirement[0].split(',');
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
    var requirementArray = costAndRequirement[1].toLowerCase().split(',');
    var abilityRequirement = requirementArray[0].trim().split(' ');
    var essenceRequirement = requirementArray[1].trim().split(' ');

    charmData.system.ability = abilityRequirement[0].replace(' ', '');
    charmData.system.requirement = abilityRequirement[1].replace(/[^0-9]/g, '');
    charmData.system.essence = essenceRequirement[1].replace(/[^0-9]/g, '');

    charmData.system.type = textArray[2].replace('Type: ', '');
    charmData.system.keywords = textArray[3].replace('Keywords: ', '');
    charmData.system.duration = textArray[4].replace('Duration: ', '');
    charmData.system.prerequisites = textArray[5].replace('Prerequisite Charms: ', '');

    var description = '';
    for (let i = 6; i < textArray.length; i++) {
      description += textArray[i];
      description += " ";
    }
    charmData.system.description = description;
    await Item.create(charmData);

  }

  async createSpell(html) {
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    var spellData = {
      type: 'spell',
      system: {

      }
    };
    spellData.name = textArray[0];
    var costArray = textArray[1].replace('Cost: ', '').split(',');
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

    spellData.system.keywords = textArray[2].replace('Keywords: ', '');
    spellData.system.duration = textArray[3].replace('Duration: ', '');

    var description = '';
    for (let i = 4; i < textArray.length; i++) {
      description += textArray[i];
      description += " ";
    }
    spellData.system.description = description;
    await Item.create(spellData);
  }

  async createQuickCharacter(html) {
    var actorData = {
      type: 'npc',
      system: {
        "pools": {
          "administration": {
            "name": "Ex3.Administration",
            "value": 0
          },
          "command": {
            "name": "Ex3.Command",
            "value": 0
          },
          "craft": {
            "name": "Ex3.Craft",
            "value": 0
          },
          "strength": {
            "name": "Ex3.FeatsofStrength",
            "value": 0
          },
          "investigation": {
            "name": "Ex3.Investigation",
            "value": 0
          },
          "joinbattle": {
            "name": "Ex3.JoinBattle",
            "value": 0
          },
          "larceny": {
            "name": "Ex3.Larceny",
            "value": 0
          },
          "medicine": {
            "name": "Ex3.Medicine",
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
          "resistpoison": {
            "name": "Ex3.ResistPoison",
            "value": 0
          },
          "sail": {
            "name": "Ex3.Sail",
            "value": 0
          },
          "senses": {
            "name": "Ex3.Senses",
            "value": 0
          },
          "social": {
            "name": "Ex3.Social",
            "value": 0
          },
          "sorcery": {
            "name": "Ex3.Sorcery",
            "value": 0
          },
          "strategy": {
            "name": "Ex3.Strategy",
            "value": 0
          },
          "stealth": {
            "name": "Ex3.Stealth",
            "value": 0
          },
          "tracking": {
            "name": "Ex3.Tracking",
            "value": 0
          },
          "other": {
            "name": "Ex3.Other",
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
          "exalt": "solar",
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
          "showescort": false
        },
      }
    };
    const itemData = [
    ];
    let index = 1;
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    try {

      actorData.name = textArray[0].trim();
      if (textArray[index].includes('Caste') || textArray[index].includes('Aspect')) {
        actorData.system.creaturetype = 'exalt';
        actorData.system.details.caste = textArray[index].replace('Caste: ', '').replace('Aspect: ', '').trim();
        index++;
      }
      if (textArray[index].includes('Spirit Shape')) {
        var lunarArray = textArray[index].split(';');
        actorData.system.qualities += `${lunarArray[0].trim()} \n`;
        var tellArray = lunarArray[1].split(':')
        actorData.system.details.exalt = 'lunar';
        actorData.system.details.tell = tellArray[1].trim();
        index++;
      }
      var statArray = textArray[index].replace(/ *\([^)]*\) */g, "").replace('Cost: ', '').split(';');
      actorData.system.essence.value = parseInt(statArray[0].replace(/[^0-9]/g, ''));
      actorData.system.willpower.value = parseInt(statArray[1].replace(/[^0-9]/g, ''));
      actorData.system.willpower.max = parseInt(statArray[1].replace(/[^0-9]/g, ''));
      actorData.system.pools.joinbattle.value = parseInt(statArray[2].replace(/[^0-9]/g, ''));
      index++;
      if (textArray[index].includes('Health Levels')) {
        var healthArray = textArray[index].replace('Health Levels: ', '').replace('/incap.', '').split('/');
        for (const health of healthArray) {
          if (health.includes('0x')) {
            actorData.system.health.levels.zero.value = parseInt(health[0].replace('0x', '').replace(/[^0-9]/g, ''));
          }
          if (health.includes('1x')) {
            actorData.system.health.levels.one.value = parseInt(health[0].replace('1x', '').replace(/[^0-9]/g, ''));
          }
          if (health.includes('2x')) {
            actorData.system.health.levels.two.value = parseInt(health[0].replace('2x', '').replace(/[^0-9]/g, ''));
          }
        }
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
        }
        index++;
      }
      var actionsString = '';
      while (!textArray[index].includes('Guile')) {
        actionsString += textArray[index];
        index++;
      }
      var actionsArray = actionsString.replace('Actions:', '').replace('/', '').replace(/ *\([^)]*\) */g, "").split(';');
      for (const action of actionsArray) {
        var actionSplit = action.trim().replace('dice', '').replace('.', '').split(':');
        var name = actionSplit[0].replace(" ", "");
        if (name.toLocaleLowerCase().includes('resistpoison')) {
          actorData.system.pools.resistpoison.value = parseInt(actionSplit[1].trim());
        }
        else if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'socialinfluence') {
          actorData.system.pools.social.value = parseInt(actionSplit[1].trim());
        }
        else if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'featsofstrength') {
          actorData.system.pools.strength.value = parseInt(actionSplit[1].trim());
        }
        else if (actorData.system.pools[name.toLocaleLowerCase()]) {
          actorData.system.pools[name.toLocaleLowerCase()].value = parseInt(actionSplit[1].trim());
        }
        else {
          itemData.push(
            {
              type: 'action',
              name: name,
              system: {
                value: parseInt(actionSplit[1].trim())
              }
            }
          )
        }
      }
      var socialArray = textArray[index].replace(/ *\([^)]*\) */g, "").split(',');
      actorData.system.appearance.value = parseInt(socialArray[0].trim().split(" ")[1]);
      actorData.system.resolve.value = parseInt(socialArray[1].trim().split(" ")[1]);
      actorData.system.guile.value = parseInt(socialArray[2].trim().split(" ")[1]);
      index++
      if (textArray[index].trim().toLowerCase() === 'combat') {
        index++;
      }
      while (textArray[index].includes('Attack')) {
        var attackArray = textArray[index].replace('Attack ', '').split(':');
        var attackName = attackArray[0].replace('(', '').replace(')', '');
        var damage = 1;
        var overwhelming = 1;
        var accuracy = 0;
        var accuracySplit = attackArray[1].trim().replace(')', '').split('(');
        accuracy = parseInt(accuracySplit[0].replace(/[^0-9]/g, ''));
        if (!textArray[index].includes('Grapple')) {
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
          else {
            damage = parseInt(damageSplit[1].replace(/[^0-9]/g, ''))
          }
        }
        index++;
        itemData.push(
          {
            type: 'weapon',
            name: attackName.trim(),
            system: {
              witheringaccuracy: accuracy,
              witheringdamage: damage,
              overwhelming: overwhelming,
            }
          }
        );
      }
      var combatMovementArray = textArray[index].split(':');
      actorData.system.pools.movement.value = parseInt(combatMovementArray[1].replace(/ *\([^)]*\) */g, "").replace(/[^0-9]/g, ''));
      index++;

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
            name: hardnessArray[1].trim(),
          }
        );
      }
      else {
        actorData.system.hardness.value = parseInt(soakArray[1].replace(/[^0-9]/g, ''));
      }
      index++;
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
      while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
        if (textArray[index]) {
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
          if (textArray[index].trim().toLowerCase() === 'offensive charms') {
            itemType = 'charm';
            index++;
            newItem = true;
            charmSystemData.ability = 'offensive';
          }
          if (textArray[index].trim().toLowerCase() === 'defensive charms') {
            itemType = 'charm';
            index++;
            newItem = true;
            charmSystemData.ability = 'defensive';
          }
          if (textArray[index].trim().toLowerCase() === 'social charms') {
            itemType = 'charm';
            index++;
            newItem = true;
            charmSystemData.ability = 'social';
          }
          if (textArray[index].trim().toLowerCase() === 'evocations') {
            itemType = 'charm';
            index++;
            newItem = true;
            charmSystemData.ability = 'evocation';
          }
          if (textArray[index].trim().toLowerCase() === 'miscellaneous charms') {
            itemType = 'charm';
            index++;
            newItem = true;
            charmSystemData.ability = 'other';
          }
          if (textArray[index].trim().toLowerCase() === 'sorcery') {
            itemType = 'spell';
            index++;
            newItem = true;
            charmSystemData.ability = 'occult';
          }
          if (textArray[index].trim().toLowerCase() === 'war' || textArray[index].trim().toLowerCase() === 'warfare charms') {
            itemType = 'charm';
            index++;
            newItem = true;
            charmSystemData.ability = 'war';
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
            itemDescription += textArray[index].trim();
            itemDescription += '\n';
          }
          if (textArray[index].trim().toLowerCase() === 'special abilities') {
            itemType = 'specialability';
            index++;
            newItem = true;
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
                  name: intimacyArray[1].trim(),
                  system: {
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
              if (titleArray.length === 2) {
                itemDescription += titleArray[1].trim();
              }
              if(itemType === 'merit' && itemName === 'Legendary Size') {
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
                itemType = 'initiation';
              }
              else if (!(/\d+(\.\d+)?sm/g).test(textArray[index]) && !textArray[index].includes('Ritual')) {
                itemType = 'charm';
              }
              else {
                itemType = 'spell';
                var contentArray = textArray[index].split('(');
                itemName = contentArray[0].trim();
                var spellDataArray = contentArray[1].replace(')', '').replace(':', '').trim().split(';');
                var costArray = spellDataArray[0].split(',');
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

                spellSystemData.duration = spellDataArray[1]?.trim() || '';
                spellSystemData.keywords = spellDataArray[2]?.trim() || '';
              }
              newItem = false;
            }
            if (itemType === 'charm') {
              var contentArray = textArray[index].split('(');
              itemName = contentArray[0].trim();
              var charmDataArray = contentArray[1].replace(')', '').replace(':', '').split(';');
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

              newItem = false;
            }
          }
          else {
            itemDescription += ` ${textArray[index].trim()}`;
          }
        }
        else {
          newItem = true;
          // Create Items
          if (itemType === 'specialability' || itemType === 'merit' || itemType === 'initiation') {
            itemData.push(
              {
                type: itemType,
                name: itemName,
                system: {
                  description: itemDescription.trim(),
                }
              }
            );
            if (itemType === 'initiation') {
              itemType = 'spell';
            }
          }
          else if (itemType === 'charm') {
            charmSystemData.description = itemDescription.trim();
            itemData.push(
              {
                type: itemType,
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

      //Combat
      actorData.items = itemData;
      console.log(actorData);
      // await Actor.create(actorData);
    }
    catch (error) {
      console.log(textArray[index]);
      this.error = textArray[index];
      this.showError = true;
      this.render();
    }
  }


  activateListeners(html) {
    html.on("change", ".radio", ev => {
      if (document.getElementById("charm-radio").checked) {
        this.type = "charm";
      } else if (document.getElementById("spell-radio").checked) {
        this.type = "spell";
      } else if (document.getElementById("qc-radio").checked) {
        this.type = "qc";
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
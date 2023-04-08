export default class NPCGenerator extends FormApplication {
  constructor(app, options, object, data) {
    super(object, options);
    this.object.preset = 'custom';
    this.object.poolNumbers = 'full';
    this.object.character = {
      name: '',
      npcType: "mortal",
      exalt: "other",
      essence: 1,
      skills: {
        agility: {
          label: 'Ex3.Agility',
          value: "weak"
        },
        body: {
          label: 'Ex3.Body',
          value: "weak"
        },
        combat: {
          label: 'Ex3.Combat',
          value: "weak"
        },
        perception: {
          label: 'Ex3.Perception',
          value: "weak"
        },
        mind: {
          label: 'Ex3.Mind',
          value: "weak"
        },
        social: {
          label: 'Ex3.Social',
          value: "weak"
        },
        strength: {
          label: 'Ex3.Strength',
          value: "weak"
        },
        willpower: {
          label: 'Ex3.Willpower',
          value: "weak"
        },
      },
      intimacies: [],
      equipment: {
        armor: {
          "weight": "none",
          "artifact": false,
        },
        primaryWeapon: {
          "type": "random",
          "weaponType": "melee",
          "weight": "light",
          "artifact": false,
        },
        secondaryWeapon: {
          "type": "random",
          "weaponType": "melee",
          "weight": "light",
          "artifact": false,
        },
      },
      traits: {
        commander: { label: 'Ex3.Commander', value: false },
        legendarySize: { label: 'Ex3.LegendarySize', value: false },
        poisoner: { label: 'Ex3.Poisoner', value: false },
        sorcerer: { label: 'Ex3.Sorcerer', value: false },
        strikingAppearance: { label: 'Ex3.StrikingAppearance', value: false },
        stealthy: { label: 'Ex3.Stealthy', value: false },
        wealthy: { label: 'Ex3.Wealthy', value: false },
      }
    }
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dialog"],
      popOut: true,
      template: "systems/exaltedthird/templates/dialogues/npc-generator.html",
      id: "ex3-npc-generator",
      title: `NPC Generator`,
      width: 860,
      height: 900,
      resizable: true,
      submitOnChange: true,
      closeOnSubmit: false
    });
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
    return {
      data: this.object,
    };
  }

  async _updateObject(event, formData) {
    mergeObject(this, formData);
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.on("change", ".rerender", ev => {
      this.render();
    });


    html.find("#generate").on("click", async (event) => {
      this.createNPC();
    });
  }

  async createNPC() {
    //Skills
    //Weak, Skilled, Exceptional, Legendary 
    var actorData = this._getBaseStatBlock();
    const itemData = [
    ];
    actorData.items = itemData;
    const weaponsList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/weapons.json', {}, { int: 30000 });
    await Actor.create(actorData);
  }

  _getBaseStatBlock() {
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
          "value": 5,
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
          "value": 2
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
}
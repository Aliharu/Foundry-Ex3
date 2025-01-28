const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const attributeAbilityMap = {
  "weak": 1,
  "skilled": 3,
  "exceptional": 4,
  "legendary": 5,
}

export default class CharacterBuilder extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options, data) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    this.object = {};
    if (data.character) {
      this.object = data;
      if (!this.object.characterType) {
        this.object.characterType = 'character';
      }
      if (!this.object.character.classificationType) {
        this.object.character.classificationType = 'exalt';
      }
      if(!this.object.character.languages) {
        this.object.character.languages = Object.entries(CONFIG.exaltedthird.languages).reduce((obj, e) => {
          let [k, v] = e;
          obj[k] = { label: v, chosen: false };
          return obj;
        }, {});
        this.object.character.customLanguages = "";
      }
    }
    else {
      this.object.template = 'custom';
      this.object.characterType = 'character';
      this.object.poolNumbers = 'mid';
      this.object.availableCastes = {};
      this.object.abilityList = CONFIG.exaltedthird.abilities;
      this.object.signList = CONFIG.exaltedthird.siderealSigns;
      this.object.creationData = {
        physical: 'primary',
        social: 'secondary',
        mental: 'tertiary',
        available: {
          attributes: {
            physical: 0,
            social: 0,
            mental: 0,
          },
          abilities: 0,
          favoredAttributes: 2,
          casteAbilities: 5,
          favoredAbilities: 5,
          specialties: 0,
          merits: 0,
          charms: 0,
          intimacies: 4,
          bonusPoints: 0,
          willpower: 0,
          charmSlots: 3,
        },
        spent: {
          attributes: {
            physical: 0,
            social: 0,
            mental: 0,
          },
          abilities: 0,
          abovethree: 0,
          favoredAttributes: 0,
          casteAbilities: 0,
          favoredAbilities: 0,
          specialties: 0,
          merits: 0,
          charms: 0,
          intimacies: 0,
          charmSlots: 0,
          bonusPoints: {
            cost: {
              attributes: "4 per dot, 3 per teriary dot",
              abilities: "1 per dot, 2 per non-favored",
              specialties: "1",
              merits: "1",
              charms: "4, 5 per non-favored",
              willpower: "2",
            },
            abilities: 0,
            attributes: 0,
            specialties: 0,
            merits: 0,
            charms: 0,
            willpower: 0,
            total: 0,
            other: 0,
          },
        },
      },
        this.object.character = {
          name: '',
          defaultName: 'New Character',
          classificationType: "exalt",
          exalt: "mortal",
          caste: "",
          exigent: "",
          supernal: "",
          tell: "",
          spiritShape: "",
          birthSign: "",
          exaltSign: "",
          essence: 1,
          willpower: 5,
          oxBodies: 0,
          charmSlots: 15,
          bonusMerits: {
            source: "",
            value: 0,
          },
          maidenCharms: {
            journeys: 0,
            serenity: 0,
            battles: 0,
            secrets: 0,
            endings: 0,
          },
          showAttributeCharms: true,
          showAbilityCharms: true,
          attributes: {
            strength: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Strength',
              type: 'physical',
              upgrade: 0,
            },
            charisma: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Charisma',
              type: 'social',
              upgrade: 0,
            },
            perception: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Perception',
              type: 'mental',
              upgrade: 0,
            },
            dexterity: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Dexterity',
              type: 'physical',
              upgrade: 0,
            },
            manipulation: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Manipulation',
              type: 'social',
              upgrade: 0,
            },
            intelligence: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Intelligence',
              type: 'mental',
              upgrade: 0,
            },
            stamina: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Stamina',
              type: 'physical',
              upgrade: 0,
            },
            appearance: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Appearance',
              type: 'social',
              upgrade: 0,
            },
            wits: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Wits',
              type: 'mental',
              upgrade: 0,
            }
          },
          abilities: {
            archery: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Archery",
              maiden: "battles",
            },
            athletics: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Athletics",
              maiden: "endings",
            },
            awareness: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Awareness",
              maiden: "endings",
            },
            brawl: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Brawl",
              maiden: "battles",
            },
            bureaucracy: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Bureaucracy",
              maiden: "endings",
            },
            craft: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Craft",
              maiden: "serenity",
            },
            dodge: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Dodge",
              maiden: "serenity",
            },
            integrity: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Integrity",
              maiden: "endings",
            },
            investigation: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Investigation",
              maiden: "secrets",
            },
            larceny: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Larceny",
              maiden: "secrets",
            },
            linguistics: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Linguistics",
              maiden: "serenity",
            },
            lore: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Lore",
              maiden: "secrets",
            },
            martialarts: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.MartialArts",
              maiden: "battles",
            },
            medicine: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Medicine",
              maiden: "endings",
            },
            melee: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Melee",
              maiden: "battles",
            },
            occult: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Occult",
              maiden: "secrets",
            },
            performance: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Performance",
              maiden: "serenity",
            },
            presence: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Presence",
              maiden: "battles",
            },
            resistance: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Resistance",
              maiden: "journeys",
            },
            ride: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Ride",
              maiden: "journeys",
            },
            sail: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Sail",
              maiden: "journeys",
            },
            socialize: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Socialize",
              maiden: "serenity",
            },
            stealth: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Stealth",
              maiden: "secrets",
            },
            survival: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Survival",
              maiden: "journeys",
            },
            thrown: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Thrown",
              maiden: "journeys",
            },
            war: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.War",
              maiden: "battles",
            }
          },
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
          },
          sizeCategory: 'standard',
          battlegroup: false,
          battlegroupStats: {
            size: 1,
            might: 0,
            drill: 0,
          },
          traits: {
            commander: { label: 'Ex3.Commander', value: false },
            godOrDemon: { label: 'Ex3.God/Demon', value: false },
            poisoner: { label: 'Ex3.Poisoner', value: false },
            motePool: { label: 'Ex3.MotePool', value: false },
            spirit: { label: 'Ex3.Spirit', value: false },
            strikingAppearance: { label: 'Ex3.StrikingAppearance', value: false },
            stealthy: { label: 'Ex3.Stealthy', value: false },
            wealthy: { label: 'Ex3.Wealthy', value: false },
          },
          charms: {},
          spells: {},
          specialties: {},
          merits: {},
          specialAbilities: {},
          crafts: {},
          evocations: {},
          otherCharms: {},
          martialArts: {},
          martialArtsCharms: {},
          weapons: {},
          armors: {},
          items: {},
          randomWeapons: {},
          armor: {
            "type": "none",
            "weight": "any",
            "artifact": false,
          },
          intimacies: {},
          sorcerer: 'none',
          necromancer: 'none',
          ritual: {
            name: '',
          },
          necromancyRitual: {
            name: '',
          },
          randomSpells: 0,
          languages: Object.entries(CONFIG.exaltedthird.languages).reduce((obj, e) => {
            let [k, v] = e;
            obj[k] = { label: v, chosen: false };
            return obj;
          }, {}),
          customLanguages: "",
        }
    }
    // Populate choices
    // const choices = Object.entries(CONFIG.exaltedthird.languages).reduce((obj, e) => {
    //   let [k, v] = e;
    //   obj[k] = { label: v, chosen: false };
    //   return obj;
    // }, {});
    for (let [key, ability] of Object.entries(this.object.character.abilities)) {
      for (const [maiden, list] of Object.entries(CONFIG.exaltedthird.maidenabilities)) {
        if (list.includes(key)) {
          ability.maiden = maiden;
        }
      }
    }
    this.object.unifiedCharacterCreation = game.settings.get("exaltedthird", "unifiedCharacterCreation");
    this.onChange();
  }

  static DEFAULT_OPTIONS = {
    window: {
      title: "Character Builder",
      resizable: true, controls: [
        {
          icon: 'fa-solid fa-dice-d6',
          label: "Save",
          action: "saveCharacter",
        },
        {
          icon: 'fa-solid fa-question',
          label: "Help",
          action: "showHelpDialog",
        },
      ]
    },
    tag: "form",
    form: {
      handler: CharacterBuilder.myFormHandler,
      submitOnClose: false,
      submitOnChange: true,
      closeOnSubmit: false
    },
    classes: [`solar-background`],
    position: { width: 875, height: 1100 },
    actions: {
      showHelpDialog: CharacterBuilder.showHelpDialog,
      saveCharacter: CharacterBuilder.saveCharacter,
      randomAttributes: CharacterBuilder.randomAttributes,
      randomAbilities: CharacterBuilder.randomAbilities,
      addItem: CharacterBuilder.addItem,
      randomName: CharacterBuilder.randomName,
      randomItem: CharacterBuilder.randomItem,
      importItem: CharacterBuilder.importItem,
      deleteItem: CharacterBuilder.deleteItem,
      deleteSublistCharm: CharacterBuilder.deleteSublistCharm,
      lowerCharmCount: CharacterBuilder.lowerCharmCount,
      addCharmCount: CharacterBuilder.addCharmCount,
    },
    dragDrop: [{ dragSelector: null, dropSelector: '[data-drop]' }],
  };

  static PARTS = {
    header: { template: 'systems/exaltedthird/templates/dialogues/character-builder/character-builder-header.html' },
    tabs: { template: 'systems/exaltedthird/templates/dialogues/tabs.html' },
    overview: { template: 'systems/exaltedthird/templates/dialogues/character-builder/character-builder-overview.html' },
    attributes: { template: 'systems/exaltedthird/templates/dialogues/character-builder/character-builder-attributes.html' },
    abilities: { template: 'systems/exaltedthird/templates/dialogues/character-builder/character-builder-abilities.html' },
    merits: { template: 'systems/exaltedthird/templates/dialogues/character-builder/character-builder-merits.html' },
    charms: { template: 'systems/exaltedthird/templates/dialogues/character-builder/character-builder-charms.html' },
    social: { template: 'systems/exaltedthird/templates/dialogues/character-builder/character-builder-social.html' },
    equipment: { template: 'systems/exaltedthird/templates/dialogues/character-builder/character-builder-equipment.html' },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.callbacks = {
        drop: this._onDropItem.bind(this),
      };
      return new DragDrop(d);
    });
  }

  #dragDrop;

  // Optional: Add getter to access the private property

  /**
   * Returns an array of DragDrop instances
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  async _prepareContext(_options) {
    if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'overview';

    return {
      data: this.object,
      selects: CONFIG.exaltedthird.selects,
      tab: this.tabGroups['primary'],
      tabs: [
        {
          id: "overview",
          group: "primary",
          label: "Ex3.Overview",
          cssClass: this.tabGroups['primary'] === 'overview' ? 'active' : '',
        },
        {
          id: "attributes",
          group: "primary",
          label: "Ex3.Attributes",
          cssClass: this.tabGroups['primary'] === 'attributes' ? 'active' : '',
        },
        {
          id: "abilities",
          group: "primary",
          label: "Ex3.Abilities",
          cssClass: this.tabGroups['primary'] === 'abilities' ? 'active' : '',
        },
        {
          id: "merits",
          group: "primary",
          label: "Ex3.Merits",
          cssClass: this.tabGroups['primary'] === 'merits' ? 'active' : '',
        },
        {
          id: "charms",
          group: "primary",
          label: "Ex3.Charms",
          cssClass: this.tabGroups['primary'] === 'charms' ? 'active' : '',
        },
        {
          id: "social",
          group: "primary",
          label: "Ex3.Social",
          cssClass: this.tabGroups['primary'] === 'social' ? 'active' : '',
        },
        {
          id: "equipment",
          group: "primary",
          label: "Ex3.Equipment",
          cssClass: this.tabGroups['primary'] === 'equipment' ? 'active' : '',
        },
      ],
      buttons: [
        { type: "submit", icon: "fa-solid fa-user-plus", label: "Ex3.Generate" }
      ],
    };
  }

  async _preparePartContext(partId, context) {
    context.tab = context.tabs.find(item => item.id === partId);
    return context;
  }

  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));

    this.element.querySelectorAll('.resource-value-step').forEach(element => {
      element.addEventListener('click', async (ev) => {
        this._onDotCounterChange(ev);
      });
    });

    this.element.querySelectorAll('.item-row').forEach(element => {
      element.addEventListener('click', (ev) => {
        const li = $(ev.currentTarget).next();
        li.toggle("fast");
      });
    });
  }

  static async myFormHandler(event, form, formData) {
    const formObject = foundry.utils.expandObject(formData.object);
    const resetFavored = this.object.character.caste !== formObject.object.character.caste || (formObject.object.character.exigent && this.object.character.exigent !== formObject.object.character.exigent);
    foundry.utils.mergeObject(this, formData.object);

    if (resetFavored) {
      for (let [key, attribute] of Object.entries(this.object.character.attributes)) {
        if (CONFIG.exaltedthird.casteabilitiesmap[this.object.character.caste.toLowerCase()]?.includes(key)) {
          if(this.object.character.exalt === 'alchemcial') {
            attribute.favored = true;
          }
          attribute.caste = true;
        }
        else {
          attribute.favored = false;
          attribute.caste = false;
        }
      }
      for (let [key, ability] of Object.entries(this.object.character.abilities)) {
        if (CONFIG.exaltedthird.casteabilitiesmap[this.object.character.caste.toLowerCase()]?.includes(key)) {
          if (this.object.character.exalt !== 'solar' && this.object.character.exalt !== 'abyssal') {
            ability.favored = true;
          }
          ability.caste = true;
        }
        else if (this.object.character.exalt === 'exigent' && CONFIG.exaltedthird.casteabilitiesmap[this.object.character.exigent.toLowerCase()]?.includes(key)) {
          ability.favored = true;
          ability.caste = true;
        }
        else {
          ability.favored = false;
          ability.caste = false;
        }
      }
    }

    if (event.type === 'submit') {
      const itemData = [
      ];
      var actorData = this._getBaseStatblock();

      await this.getBaseCharacterData(actorData, itemData);
      this._getCharacterCharms(itemData);
      await this._getCharacterSpells(itemData);
      await this._getCharacterEquipment(actorData, itemData);

      actorData.items = itemData;
      if (Actor.canUserCreate(game.user)) {
        let actor = await Actor.create(actorData);
        await actor.calculateAllDerivedStats();
      }
      else {
        game.socket.emit('system.exaltedthird', {
          type: 'createGeneratedCharacter',
          id: game.user.id,
          data: actorData,
        });
      }
      ChatMessage.create({
        user: game.user.id,
        content: `${actorData.name} created using the character creator`,
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      });
      ui.notifications.notify(`Generation Complete`);
    } else {
      await this.onChange();
    }
  }

  onChange() {
    if (CONFIG.exaltedthird.castes[this.object.character.exalt]) {
      this.object.availableCastes = CONFIG.exaltedthird.castes[this.object.character.exalt];
    }
    if (this.object.character.exalt === 'lunar' || this.object.character.exigent === 'architect' || this.object.character.exalt === 'alchemical') {
      this.object.character.showAttributeCharms = true;
      this.object.character.showAbilityCharms = false;
    }
    else if (this.object.character.exalt === 'puppeteer') {
      this.object.character.showAttributeCharms = false;
      this.object.character.showAbilityCharms = false;
    }
    else if (this.object.character.exalt === 'exigent' || this.object.character.exalt === 'other') {
      this.object.character.showAttributeCharms = true;
      this.object.character.showAbilityCharms = true;
      this.object.character.caste = "";
    }
    else if (this.object.character.exalt === 'mortal') {
      this.object.character.showAttributeCharms = false;
      this.object.character.showAbilityCharms = false;
    }
    else {
      this.object.character.showAttributeCharms = false;
      this.object.character.showAbilityCharms = true;
    }

    const oxBodyAvailable = [
      'alchemical',
      'solar',
      'lunar',
      'abyssal',
      'sidereal',
      'dragonblooded',
      'janest',
      'sovereign',
      'architect',
      'puppeteer'
    ]

    this.object.oxBodyEnabled = this.object.character.classificationType === 'exalt' && (oxBodyAvailable.includes(this.object.character.exalt) || oxBodyAvailable.includes(this.object.character.exigent));

    this.object.character.maidenCharms = {
      journeys: this._getMaidenCharmsNumber('journeys'),
      serenity: this._getMaidenCharmsNumber('serenity'),
      battles: this._getMaidenCharmsNumber('battles'),
      secrets: this._getMaidenCharmsNumber('secrets'),
      endings: this._getMaidenCharmsNumber('endings'),
    }

    this._calculateSpentExperience();

    const categories = [...Object.entries(this.object.character.abilities), ...Object.entries(this.object.character.attributes)];

    for (const [key, category] of categories) {
      category.charms = Object.values(this.object.character.charms).filter(charm => charm.system.ability === key);
    }
    this.render();
  }

  _calculateSpentExperience() {
    const casteAbilitiesMap = CONFIG.exaltedthird.casteabilitiesmap;

    var pointsAvailableMap = {
      primary: 8,
      secondary: 6,
      tertiary: 4,
    }
    if (this.object.character.exalt === 'lunar') {
      pointsAvailableMap = {
        primary: 9,
        secondary: 7,
        tertiary: 5,
      }
    }
    if (this.object.character.exalt === 'mortal') {
      pointsAvailableMap = {
        primary: 6,
        secondary: 4,
        tertiary: 3,
      }
    }
    this.object.creationData.available = {
      attributes: {
        physical: pointsAvailableMap[this.object.creationData.physical],
        social: pointsAvailableMap[this.object.creationData.social],
        mental: pointsAvailableMap[this.object.creationData.mental],
      },
      abilities: 28,
      favoredAttributes: 0,
      favoredAbilities: 5,
      casteAbilities: 0,
      bonusPoints: 15,
      charms: 15,
      specialties: 4,
      merits: 10,
      intimacies: 4,
      willpower: 5,
      experience: 55,
      charmSlots: 5,
    }
    if (this.object.character.exalt === 'solar' || this.object.character.exalt === 'abyssal') {
      this.object.creationData.available.casteAbilities = 5;
    }
    if (this.object.character.exalt === 'solar' || this.object.character.exalt === 'lunar' || this.object.character.exalt === 'abyssal') {
      if (this.object.character.essence >= 2) {
        this.object.creationData.available.charms = 20;
        this.object.creationData.available.merits = 13;
        this.object.creationData.available.bonusPoints = 18;
      }
    }
    if (this.object.character.exalt === 'lunar') {
      this.object.creationData.available.favoredAttributes = 2;
      this.object.creationData.available.favoredAbilities = 0;
      if (this.object.character.essence >= 2) {
        this.object.creationData.available.charms = 20;
        this.object.creationData.available.merits = 13;
        this.object.creationData.available.bonusPoints = 18;
      }
    }
    if(this.object.character.exalt === 'alchemical') {
      this.object.creationData.available.favoredAttributes = 1;
      this.object.creationData.available.favoredAbilities = 0;
      this.object.creationData.available.charmSlots = (17 + (this.object.character.essence * 3)) - 15;
    }
    if (this.object.character.exalt === 'dragonblooded') {
      this.object.creationData.available = {
        attributes: {
          physical: pointsAvailableMap[this.object.creationData.physical],
          social: pointsAvailableMap[this.object.creationData.social],
          mental: pointsAvailableMap[this.object.creationData.mental],
        },
        abilities: 28,
        favoredAttributes: 0,
        favoredAbilities: 5,
        bonusPoints: 18,
        charms: 15,
        excellencies: 5,
        specialties: 5,
        merits: 18,
        intimacies: 4,
        willpower: 5,
      }
      if (this.object.character.essence === 1) {
        this.object.creationData.available.specialties = 3;
        this.object.creationData.available.charms = 15;
        this.object.creationData.available.merits = 10;
        this.object.creationData.available.bonusPoints = 15;
      }
    }
    if (this.object.character.exalt === 'sidereal' || this.object.character.exalt === 'alchemical') {
      if (this.object.character.essence >= 2) {
        this.object.creationData.available.charms = 20;
        this.object.creationData.available.merits = 13;
        this.object.creationData.available.bonusPoints = 18;
      }
    }
    if (this.object.character.exigent === 'architect') {
      this.object.creationData.available.favoredAttributes = 1;
    }
    if (this.object.character.exalt === 'mortal') {
      this.object.creationData.available = {
        attributes: {
          physical: pointsAvailableMap[this.object.creationData.physical],
          social: pointsAvailableMap[this.object.creationData.social],
          mental: pointsAvailableMap[this.object.creationData.mental],
        },
        abilities: 28,
        favoredAttributes: 0,
        favoredAbilities: 5,
        bonusPoints: 21,
        charms: 0,
        specialties: 4,
        merits: 7,
        intimacies: 4,
        willpower: 3,
      }
    }
    this.object.creationData.available.merits += this.object.character.bonusMerits.value;
    this.object.creationData.spent = {
      attributes: {
        physical: 0,
        social: 0,
        mental: 0,
      },
      abilities: 0,
      abilitiesAboveThree: 0,
      favoredAttributes: 0,
      favoredAbilities: 0,
      casteAbilities: 0,
      specialties: 0,
      merits: 0,
      charms: 0,
      excellencies: 0,
      abovethree: 0,
      bonusPoints: {
        cost: {
          attributes: "4 per dot, 3 per teriary dot",
          abilities: "1 per dot, 2 per non-favored",
          specialties: "1",
          merits: "1",
          charms: "4, 5 per non-favored",
          willpower: "2",
        },
        abilities: 0,
        attributes: 0,
        specialties: 0,
        merits: 0,
        charms: 0,
        willpower: 0,
        total: 0,
        other: this.object.creationData.spent.bonusPoints.other,
      },
      experience: {
        abilities: 0,
        attributes: 0,
        specialties: 0,
        merits: 0,
        charms: 0,
        willpower: 0,
        total: 0,
      },
    }
    var attributesSpent = {
      physical: {
        favored: 0,
        unFavored: 0,
      },
      mental: {
        favored: 0,
        unFavored: 0,
      },
      social: {
        favored: 0,
        unFavored: 0,
      }
    }

    let useFavoredAbilities = true;
    let useFavoredAttributes = false;

    if(this.object.character.exalt === 'lunar' || this.object.character.exalt === 'alchemical') {
      useFavoredAbilities = false;
      useFavoredAttributes = true;
      this.object.creationData.spent.bonusPoints.cost.attributes = '4 per dot, 3 per caste/favored dot';
      this.object.creationData.spent.bonusPoints.cost.Abilities = '2 per dot';
      this.object.creationData.spent.bonusPoints.cost.charms = '4, 5 per non-favored (Always 4 if casteless)'
    }
    if(this.object.character.exalt === 'alchemical') {
      this.object.creationData.spent.bonusPoints.cost.charms = '1 for caste/favored, 2 for non-favored, 5 for spells (4 if intelligence is caste/favored), 5 for Martial Arts, 4 for Evocations';
    }

    let favoredCharms = 0;
    let nonFavoredCharms = 0;

    for (let [key, attr] of Object.entries(this.object.character.attributes)) {
      this.object.creationData.spent.attributes[attr.type] += (attr.value - 1);

      if (attr.favored) {
        if (!casteAbilitiesMap[this.object.character.caste.toLowerCase()]?.includes(key)) {
          this.object.creationData.spent.favoredAttributes++;
        }
        attributesSpent[attr.type].favored += (attr.value - 1);
      }
      else {
        attributesSpent[attr.type].unFavored += (attr.value - 1);
      }
    }
    let favoredAttributesSpent = 0;
    let unFavoredAttributesSpent = 0;
    let tertiaryAttributes = 0;
    let nonTertiaryAttributes = 0;
    let threeOrBelowFavored = 0;
    let threeOrBelowNonFavored = 0;
    let aboveThreeFavored = 0;
    let aboveThreeUnFavored = 0;
    for (let [key, attribute] of Object.entries(this.object.creationData.spent.attributes)) {
      if (this.object.creationData[key] === 'tertiary' && !useFavoredAttributes) {
        tertiaryAttributes += Math.max(0, this.object.creationData.spent.attributes[key] - this.object.creationData.available.attributes[key]);
      }
      else {
        nonTertiaryAttributes += Math.max(0, this.object.creationData.spent.attributes[key] - this.object.creationData.available.attributes[key]);
      }
      unFavoredAttributesSpent += Math.max(0, attributesSpent[key].unFavored - this.object.creationData.available.attributes[key]);
      favoredAttributesSpent += Math.max(0, attributesSpent[key].favored - Math.max(0, this.object.creationData.available.attributes[key] - attributesSpent[key].unFavored));
    }
    for (let [key, ability] of Object.entries(this.object.character.abilities)) {
      if (ability.favored && !ability.caste && ability.value === 0 && key !== 'martialarts') {
        ability.value = 1;
      }
      this.object.creationData.spent.abovethree += Math.max(0, (ability.value - 3));
      if (ability.favored) {
        aboveThreeFavored += Math.max(0, (ability.value - 3));
        this.object.creationData.spent.bonusPoints.abilities += Math.max(0, (ability.value - 3));
        threeOrBelowFavored += Math.min(3, ability.value);
      }
      else {
        this.object.creationData.spent.bonusPoints.abilities += (Math.max(0, (ability.value - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, ability.value);
        aboveThreeUnFavored += Math.max(0, (ability.value - 3));
      }

      if (this.object.character.exigent !== 'janest') {
        if (!casteAbilitiesMap[this.object.character.caste.toLowerCase()]?.includes(key) && ability.favored && key !== 'martialarts') {
          this.object.creationData.spent.favoredAbilities++;
        }
        else if (casteAbilitiesMap[this.object.character.caste.toLowerCase()]?.includes(key) && ability.favored && key !== 'martialarts') {
          this.object.creationData.spent.casteAbilities++;
        }
      } else {
        if (!casteAbilitiesMap[this.object.character.exigent.toLowerCase()]?.includes(key) && ability.favored && key !== 'martialarts') {
          this.object.creationData.spent.favoredAbilities++;
        }
      }
    }
    for (let craft of Object.values(this.object.character.crafts)) {
      this.object.creationData.spent.abovethree += Math.max(0, (craft.system.points - 3));
      if (this.object.character.abilities.craft.favored) {
        this.object.creationData.spent.bonusPoints.abilities += Math.max(0, (craft.system.points - 3));
        threeOrBelowFavored += Math.min(3, craft.system.points);
        aboveThreeFavored += Math.max(0, (craft.system.points - 3));
      }
      else {
        this.object.creationData.spent.bonusPoints.abilities += (Math.max(0, (craft.system.points - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, craft.system.points);
        aboveThreeUnFavored += Math.max(0, (craft.system.points - 3));
      }
    }
    for (let martialArt of Object.values(this.object.character.martialArts)) {
      this.object.creationData.spent.abovethree += Math.max(0, (martialArt.system.points - 3));
      if (this.object.character.abilities.martialarts.favored) {
        this.object.creationData.spent.bonusPoints.abilities += Math.max(0, (martialArt.system.points - 3));
        threeOrBelowFavored += Math.min(3, martialArt.system.points);
        aboveThreeFavored += Math.max(0, (martialArt.system.points - 3));
      }
      else {
        this.object.creationData.spent.bonusPoints.abilities += (Math.max(0, (martialArt.system.points - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, martialArt.system.points);
        aboveThreeUnFavored += Math.max(0, (martialArt.system.points - 3));
      }
    }
    this.object.creationData.spent.abilities = threeOrBelowFavored + threeOrBelowNonFavored;
    var nonfavoredBPBelowThree = Math.max(0, (threeOrBelowNonFavored - 28));
    var favoredBPBelowThree = Math.max(0, (threeOrBelowFavored - Math.max(0, 28 - threeOrBelowNonFavored)));
    this.object.creationData.spent.bonusPoints.abilities += favoredBPBelowThree + (nonfavoredBPBelowThree * 2);

    this.object.creationData.spent.specialties = Object.entries(this.object.character.specialties).length;
    for (let merit of Object.values(this.object.character.merits)) {
      this.object.creationData.spent.merits += merit.system.points;
    }

    let alchemicalCharmBonusPointDiscount = 0;

    for (const [key, charm] of Object.entries(this.object.character.charms)) {
      if (this.object.character.attributes[charm.system.ability] && this.object.character.attributes[charm.system.ability].favored) {
        favoredCharms += charm.itemCount;
      } else if (this.object.character.abilities[charm.system.ability] && this.object.character.abilities[charm.system.ability].favored) {
        favoredCharms += charm.itemCount;
      }
      else if (CONFIG.exaltedthird.maidens.includes(charm.system.ability) && charm.system.ability === this.object.character.caste) {
        favoredCharms += charm.itemCount
      }
      else if (charm.system.ability === 'universal') {
        favoredCharms += charm.itemCount
      }
      else if (this.object.character.caste === 'casteless') {
        favoredCharms += charm.itemCount
      }
      else {
        nonFavoredCharms += charm.itemCount;
      }
      alchemicalCharmBonusPointDiscount += 3;
    }

    for (const [key, charm] of Object.entries(this.object.character.evocations)) {
      favoredCharms += charm.itemCount;
    }

    for (const [key, charm] of Object.entries(this.object.character.otherCharms)) {
      nonFavoredCharms += charm.itemCount;
    }

    for (const [key, charm] of Object.entries(this.object.character.martialArtsCharms)) {
      if (this.object.character.abilities.martialarts.favored) {
        favoredCharms += charm.itemCount;
      }
      else {
        nonFavoredCharms += charm.itemCount;
      }
    }

    if (this.object.character.abilities.occult.favored) {
      favoredCharms += Math.max(0, Object.entries(this.object.character.spells).length - 1);
    }
    else {
      nonFavoredCharms += Math.max(0, Object.entries(this.object.character.spells).length - 1);
    }

    if (this.object.character.exalt === 'dragonblooded') {
      this.object.creationData.spent.excellencies = Math.min(5, Object.values(this.object.character.charms).filter(charm => charm.system.keywords.toLowerCase().includes('excellency') && this.object.character.abilities[charm.system.ability]?.favored).length);
      favoredCharms = Math.max(0, favoredCharms - this.object.creationData.spent.excellencies);
    }

    this.object.creationData.spent.charms = nonFavoredCharms + favoredCharms;


    var totalNonFavoredCharms = Math.max(0, (nonFavoredCharms - this.object.creationData.available.charms));
    var totalFavoredCharms = Math.max(0, (favoredCharms - Math.max(0, this.object.creationData.available.charms - nonFavoredCharms)));

    this.object.creationData.spent.intimacies = Object.entries(this.object.character.intimacies).length;

    if (this.object.character.exalt === 'lunar') {
      this.object.creationData.spent.bonusPoints.attributes += (favoredAttributesSpent * 3) + (unFavoredAttributesSpent * 4);
    } else {
      this.object.creationData.spent.bonusPoints.attributes += (tertiaryAttributes * 3) + (nonTertiaryAttributes * 4);
    }
    this.object.creationData.spent.bonusPoints.charmSlots = 0;
    if (this.object.character.exalt === 'alchemical') {
      this.object.creationData.spent.bonusPoints.charmSlots = (this.object.character.charmSlots - 15) * 3;
    }
    this.object.creationData.spent.bonusPoints.willpower += (Math.max(0, (this.object.character.willpower - this.object.creationData.available.willpower))) * 2;
    this.object.creationData.spent.bonusPoints.merits += (Math.max(0, (this.object.creationData.spent.merits - this.object.creationData.available.merits)));
    this.object.creationData.spent.bonusPoints.specialties += (Math.max(0, (this.object.creationData.spent.specialties - this.object.creationData.available.specialties)));
    this.object.creationData.spent.bonusPoints.charms += totalNonFavoredCharms * 5;
    this.object.creationData.spent.bonusPoints.charms += totalFavoredCharms * 4;
    this.object.creationData.spent.bonusPoints.total = this.object.creationData.spent.bonusPoints.willpower + this.object.creationData.spent.bonusPoints.merits + this.object.creationData.spent.bonusPoints.specialties + this.object.creationData.spent.bonusPoints.abilities + this.object.creationData.spent.bonusPoints.attributes + this.object.creationData.spent.bonusPoints.charms + this.object.creationData.spent.bonusPoints.charmSlots + this.object.creationData.spent.bonusPoints.other;
    if(this.object.character.exalt === 'alchemical') {
      this.object.creationData.spent.bonusPoints.total -= alchemicalCharmBonusPointDiscount;
    }
    this.object.creationData.spent.experience.attributes += (favoredAttributesSpent * 8) + (unFavoredAttributesSpent * 10);
    this.object.creationData.spent.experience.abilities += (favoredBPBelowThree * 4) + (nonfavoredBPBelowThree * 5);
    this.object.creationData.spent.experience.abilities += (aboveThreeFavored * 4) + (aboveThreeUnFavored * 5);
    this.object.creationData.spent.experience.charms += totalNonFavoredCharms * 12;
    this.object.creationData.spent.experience.charms += totalFavoredCharms * 10;
    this.object.creationData.spent.experience.specialties += (Math.max(0, (this.object.creationData.spent.specialties - this.object.creationData.available.specialties))) * 2;
    this.object.creationData.spent.experience.merits += (Math.max(0, (this.object.creationData.spent.merits - this.object.creationData.available.merits))) * 2;
    this.object.creationData.spent.experience.willpower += (Math.max(0, (this.object.character.willpower - this.object.creationData.available.willpower))) * 6;
    this.object.creationData.spent.experience.total = this.object.creationData.spent.experience.willpower + this.object.creationData.spent.experience.merits + this.object.creationData.spent.experience.specialties + this.object.creationData.spent.experience.abilities + this.object.creationData.spent.experience.attributes + this.object.creationData.spent.experience.charms;
  }

  _getMaidenCharmsNumber(maiden) {
    const abilityList = CONFIG.exaltedthird.maidenabilities[maiden];
    return (Object.values(this.object.character.charms)?.filter(numberCharm => abilityList.includes(numberCharm.system.ability)).length || 0)
  }

  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


  _onDotCounterChange(event) {
    event.preventDefault()
    const index = Number(event.currentTarget.dataset.index);
    if (this.object.character[event.currentTarget.dataset.type][event.currentTarget.dataset.name].value === 1 && index === 0) {
      if (this.object.character[event.currentTarget.dataset.type][event.currentTarget.dataset.name].favored && !this.object.character[event.currentTarget.dataset.type][event.currentTarget.dataset.name].caste) {
        ui.notifications.notify(`Favored abilities must have at least 1 dot assigned to them.`);
      } else {
        this.object.character[event.currentTarget.dataset.type][event.currentTarget.dataset.name].value = 0;
      }
    }
    else {
      this.object.character[event.currentTarget.dataset.type][event.currentTarget.dataset.name].value = index + 1;
    }
    this.onChange();
  }

  async close(options = {}) {
    const applyChanges = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("Ex3.Close") },
      content: "<p>Any unsaved changed will be lost</p>",
      classes: [`${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      modal: true
    });
    if (applyChanges) {
      super.close();
    }
  }

  static async randomAttributes(event, target) {
    let attributeValues = {};
    let attributeTypes = [
      'primary',
      'secondary',
      'tertiary'
    ];
    let attributeList = {
      primary: [
        5, 4, 2
      ],
      secondary: [
        4, 3, 2
      ],
      tertiary: [
        3, 2, 2
      ],
    };
    if (this.object.character.exalt === 'lunar') {
      attributeList = {
        primary: [
          5, 4, 3
        ],
        secondary: [
          4, 4, 2
        ],
        tertiary: [
          3, 3, 2
        ],
      };
    }
    if (this.object.character.exalt === 'mortal') {
      attributeList = {
        primary: [
          4, 3, 2
        ],
        secondary: [
          3, 2, 2
        ],
        tertiary: [
          3, 2, 1
        ],
      };
    }

    let physicalAttribute = attributeTypes.splice(Math.floor(Math.random() * attributeTypes.length), 1)[0];
    let socialAttribute = attributeTypes.splice(Math.floor(Math.random() * attributeTypes.length), 1)[0];
    let mentalAttribute = attributeTypes.splice(Math.floor(Math.random() * attributeTypes.length), 1)[0];

    attributeValues['physical'] = attributeList[physicalAttribute];
    attributeValues['social'] = attributeList[socialAttribute];
    attributeValues['mental'] = attributeList[mentalAttribute];

    for (const attribute of Object.values(this.object.character.attributes)) {
      attribute.value = attributeValues[attribute.type].splice(Math.floor(Math.random() * attributeValues[attribute.type].length), 1)[0];
    }

    this.object.creationData.physical = physicalAttribute;
    this.object.creationData.social = socialAttribute;
    this.object.creationData.mental = mentalAttribute;
    this.onChange();
  }

  static async randomAbilities(event, target) {
    const abilitiesRandom = CONFIG.exaltedthird.abilitiesList;

    const favoredOrCasteAbilities = [];
    const otherAbilities = [];
    abilitiesRandom.forEach(ability => {
      if (this.object.character.abilities[ability].favored || this.object.character.abilities[ability].caste) {
        favoredOrCasteAbilities.push(ability);
      } else {
        otherAbilities.push(ability);
      }
    });

    const shuffledFavoredOrCasteAbilities = this._shuffleArray(favoredOrCasteAbilities);
    const shuffledOtherAbilities = this._shuffleArray(otherAbilities);
    const shuffledAbilitiesList = shuffledFavoredOrCasteAbilities.concat(shuffledOtherAbilities);
    let abilityValues = [
      5, 5, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];

    for (let i = 0; i < shuffledAbilitiesList.length; i++) {
      this.object.character.abilities[shuffledAbilitiesList[i]].value = (abilityValues[i] || 0)
    }
    this.onChange();
  }

  static async randomName(event, target) {
    const nameFormats = [
      { option: "common", weight: 10 },
    ];
    if (this.object.character.exalt === 'dragonblooded') {
      nameFormats.push(
        {
          option: "dynast", weight: 20
        }
      );
    }
    else {
      nameFormats.push(
        {
          option: "dynast", weight: 3
        }
      );
    }
    const totalWeight = nameFormats.reduce((acc, option) => acc + option.weight, 0);
    // Generate a random number between 0 and the total weight
    const randomWeight = Math.random() * totalWeight;

    // Iterate over the nameFormats until the cumulative weight surpasses the random weight
    let cumulativeWeight = 0;
    let selectedOption;
    for (const option of nameFormats) {
      cumulativeWeight += option.weight;
      if (randomWeight <= cumulativeWeight) {
        selectedOption = option.option;
        break;
      }
    }
    if (this.object.character.exalt === 'abyssal') {
      selectedOption = 'abyssal';
    }
    switch (selectedOption) {
      case "common":
        this.object.character.name = await this.getCommonName();
        break;
      case "dynast":
        this.object.character.name = await this.getDynastName();
        break;
      case "abyssal":
        this.object.character.name = await this.getAbyssalName();
        break;
    }
    this.onChange();
  }

  static async addItem(event, target) {
    const type = target.dataset.type;
    let listIndex = 0;
    let indexAdd = "0";
    let indexType = type;
    if (type === 'weapons') {
      indexType = 'randomWeapons';
    }
    for (const key of Object.keys(this.object.character[indexType])) {
      if (key !== listIndex.toString()) {
        break;
      }
      listIndex++;
    }
    indexAdd = listIndex.toString();

    if (type === 'specialties') {
      this.object.character.specialties[indexAdd] = {
        name: 'Specialty',
        system: {
          ability: 'archery',
        }
      };
    }
    else if (type === 'weapons') {
      this.object.character.randomWeapons[indexAdd] = {
        type: "random",
        weaponType: "any",
        weight: "any",
        artifact: false,
      };
    }
    else if (type === 'intimacies') {
      this.object.character[type][indexAdd] = {
        name: 'Name',
        system: {
          strength: 'minor',
          intimacytype: 'tie',
        }
      };
    }
    else {
      this.object.character[type][indexAdd] = {
        name: 'Name',
        system: {
          points: 0,
        }
      };
    }
    this.onChange();
  }

  static async importItem(event, target) {
    const type = target.dataset.type;
    const itemType = target.dataset.item;
    const ritualType = target.dataset.ritual;

    let items = await this._getItemList(target);

    const sectionList = {};

    if (itemType === 'spell') {
      if (items.some(item => item.system.circle === 'terrestrial')) {
        sectionList['terrestrial'] = {
          name: game.i18n.localize("Ex3.Terrestrial"),
          list: items.filter(item => item.system.circle === 'terrestrial')
        }
      }
      if (items.some(item => item.system.circle === 'celestial')) {
        sectionList['celestial'] = {
          name: game.i18n.localize("Ex3.Celestial"),
          list: items.filter(item => item.system.circle === 'celestial')
        }
      }
      if (items.some(item => item.system.circle === 'solar')) {
        sectionList['solar'] = {
          name: game.i18n.localize("Ex3.Solar"),
          list: items.filter(item => item.system.circle === 'solar')
        }
      }
      if (items.some(item => item.system.circle === 'ivory')) {
        sectionList['ivory'] = {
          name: game.i18n.localize("Ex3.Ivory"),
          list: items.filter(item => item.system.circle === 'ivory')
        }
      }
      if (items.some(item => item.system.circle === 'shadow')) {
        sectionList['shadow'] = {
          name: game.i18n.localize("Ex3.Shadow"),
          list: items.filter(item => item.system.circle === 'shadow')
        }
      }
      if (items.some(item => item.system.circle === 'void')) {
        sectionList['void'] = {
          name: game.i18n.localize("Ex3.Void"),
          list: items.filter(item => item.system.circle === 'void')
        }
      }
    }
    else if (itemType === 'merit') {
      if (items.some(item => item.system.merittype === 'innate')) {
        sectionList['innate'] = {
          name: game.i18n.localize("Ex3.Innate"),
          list: items.filter(item => item.system.merittype === 'innate')
        };
      }
      if (items.some(item => item.system.merittype === 'flaw')) {
        sectionList['flaw'] = {
          name: game.i18n.localize("Ex3.Flaw"),
          list: items.filter(item => item.system.merittype === 'flaw')
        };
      }
      if (items.some(item => item.system.merittype === 'purchased')) {
        sectionList['purchased'] = {
          name: game.i18n.localize("Ex3.Purchased"),
          list: items.filter(item => item.system.merittype === 'purchased')
        };
      }
      if (items.some(item => item.system.merittype === 'story')) {
        sectionList['story'] = {
          name: game.i18n.localize("Ex3.Story"),
          list: items.filter(item => item.system.merittype === 'story')
        };
      }
      if (items.some(item => item.system.merittype === 'thaumaturgy')) {
        sectionList['thaumaturgy'] = {
          name: game.i18n.localize("Ex3.Thaumaturgy"),
          list: items.filter(item => item.system.merittype === 'thaumaturgy')
        };
      }
      if (items.some(item => item.system.merittype === 'sorcery' && !item.system.archetypename)) {
        sectionList['sorcery'] = {
          name: game.i18n.localize("Ex3.Sorcery"),
          list: items.filter(item => item.system.merittype === 'sorcery' && !item.system.archetypename)
        };
      }
      for (const merit of items.filter(item => item.system.merittype === 'sorcery' && item.system.archetypename).sort(function (a, b) {
        const sortValueA = a.system.archetypename.toLowerCase();
        const sortValueB = b.system.archetypename.toLowerCase();
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      })) {
        if (merit.system.archetypename) {
          if (!sectionList[merit.system.archetypename]) {
            sectionList[merit.system.archetypename] = { name: merit.system.archetypename, list: [] };
          }
          sectionList[merit.system.archetypename].list.push(merit);
        }
      }
    }
    else if (itemType === 'customability') {

      sectionList['martialarts'] = {
        name: game.i18n.localize("Ex3.MartialArts"),
        list: items.filter(item => !item.system.siderealmartialart)
      }
      if (items.some(item => item.system.siderealmartialart)) {
        sectionList['sideralmartialarts'] = {
          name: game.i18n.localize("Ex3.SiderealMartialArts"),
          list: items.filter(item => item.system.siderealmartialart)
        }
      }
      if (items.some(item => item.system.armorallowance === 'none')) {
        sectionList['none'] = {
          name: game.i18n.localize("Ex3.NoArmor"),
          list: items.filter(item => item.system.armorallowance === 'none')
        }
      }
      if (items.some(item => item.system.armorallowance === 'light')) {
        sectionList['light'] = {
          name: game.i18n.localize("Ex3.LightArmor"),
          list: items.filter(item => item.system.armorallowance === 'light')
        }
      }
      if (items.some(item => item.system.armorallowance === 'medium')) {
        sectionList['medium'] = {
          name: game.i18n.localize("Ex3.MediumArmor"),
          list: items.filter(item => item.system.armorallowance === 'medium')
        }
      }
      if (items.some(item => item.system.armorallowance === 'heavy')) {
        sectionList['heavy'] = {
          name: game.i18n.localize("Ex3.HeavyArmor"),
          list: items.filter(item => item.system.armorallowance === 'heavy')
        }
      }
    }
    else if (itemType === 'item') {
      if (items.some(item => item.system.itemtype === 'item')) {
        sectionList['items'] = {
          name: game.i18n.localize("Ex3.Items"),
          list: items.filter(item => item.system.itemtype === 'item')
        }
      }
      if (items.some(item => item.system.itemtype === 'artifact')) {
        sectionList['artifacts'] = {
          name: game.i18n.localize("Ex3.Artifacts"),
          list: items.filter(item => item.system.itemtype === 'artifact')
        }
      }
      if (items.some(item => item.system.itemtype === 'hearthstone')) {
        sectionList['hearthstones'] = {
          name: game.i18n.localize("Ex3.Hearthstones"),
          list: items.filter(item => item.system.itemtype === 'hearthstone')
        }
      }
    }
    else if (itemType === 'weapon') {
      const weights = ['light', 'medium', 'heavy', 'siege'];
      const weightLabels = ['Ex3.MundaneLight', 'Ex3.MundaneMedium', 'Ex3.MundaneHeavy', 'Ex3.MundaneSiege'];
      const artifactWeightLabels = ['Ex3.ArtifactLight', 'Ex3.ArtifactMedium', 'Ex3.ArtifactHeavy', 'Ex3.ArtifactSiege'];
      for (let i = 0; i < weights.length; i++) {
        if (items.some(item => item.system.weighttype === weights[i])) {
          if (items.some(item => item.system.weighttype === weights[i] && item.system.traits.weapontags.value.includes('artifact'))) {
            sectionList[`artifact${weights[i]}`] = {
              name: game.i18n.localize(artifactWeightLabels[i]),
              list: items.filter(item => item.system.weighttype === weights[i] && item.system.traits.weapontags.value.includes('artifact'))
            }
          }
          if (items.some(item => item.system.weighttype === weights[i] && !item.system.traits.weapontags.value.includes('artifact'))) {
            sectionList[weights[i]] = {
              name: game.i18n.localize(weightLabels[i]),
              list: items.filter(item => item.system.weighttype === weights[i] && !item.system.traits.weapontags.value.includes('artifact'))
            }
          }
        }
      }
    }
    else if (itemType === 'armor') {
      const weights = ['light', 'medium', 'heavy'];
      const weightLabels = ['Ex3.MundaneLight', 'Ex3.MundaneMedium', 'Ex3.MundaneHeavy'];
      const artifactWeightLabels = ['Ex3.ArtifactLight', 'Ex3.ArtifactMedium', 'Ex3.ArtifactHeavy'];
      for (let i = 0; i < weights.length; i++) {
        if (items.some(item => item.system.weighttype === weights[i])) {
          if (items.some(item => item.system.weighttype === weights[i] && item.system.traits.armortags.value.includes('artifact'))) {
            sectionList[`artifact${weights[i]}`] = {
              name: game.i18n.localize(artifactWeightLabels[i]),
              list: items.filter(item => item.system.weighttype === weights[i] && item.system.traits.armortags.value.includes('artifact'))
            }
          }
          if (items.some(item => item.system.weighttype === weights[i] && !item.system.traits.armortags.value.includes('artifact'))) {
            sectionList[weights[i]] = {
              name: game.i18n.localize(weightLabels[i]),
              list: items.filter(item => item.system.weighttype === weights[i] && !item.system.traits.armortags.value.includes('artifact'))
            }
          }
        }
      }
    }
    else if (itemType === 'ritual') {
      sectionList['rituals'] = {
        name: game.i18n.localize("Ex3.Rituals"),
        list: items.filter(item => !item.system.archetypename)
      };
      for (const ritual of items.filter(item => item.system.archetypename).sort(function (a, b) {
        const sortValueA = a.system.archetypename.toLowerCase();
        const sortValueB = b.system.archetypename.toLowerCase();
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      })) {
        if (ritual.system.archetypename) {
          if (!sectionList[ritual.system.archetypename]) {
            sectionList[ritual.system.archetypename] = { name: ritual.system.archetypename, list: [] };
          }
          sectionList[ritual.system.archetypename].list.push(ritual);
        }
      }
    } else if(itemType === 'specialability') {
      sectionList['specialAbilities'] = {
        name: game.i18n.localize("Ex3.SpecialAbilities"),
        list: items
      }
    }
    else {
      for (const charm of items.sort(function (a, b) {
        const sortValueA = a.system.listingname.toLowerCase() || a.system.ability;
        const sortValueB = b.system.listingname.toLowerCase() || b.system.ability;
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      })) {
        if (charm.system.listingname) {
          if (!sectionList[charm.system.listingname]) {
            sectionList[charm.system.listingname] = { name: charm.system.listingname, list: [] };
          }
          sectionList[charm.system.listingname].list.push(charm);
        }
        else {
          if (!sectionList[charm.system.ability]) {
            sectionList[charm.system.ability] = { name: CONFIG.exaltedthird.charmabilities[charm.system.ability] || 'Ex3.Other', visible: true, list: [] };
          }
          sectionList[charm.system.ability].list.push(charm);
          // if(charm.system.archetype.ability) {
          //   if (!sectionList[charm.system.archetype.ability]) {
          //     sectionList[charm.system.archetype.ability] = { name: CONFIG.exaltedthird.charmabilities[charm.system.archetype.ability] || 'Ex3.Other', visible: true, list: [] };
          //   }
          //   sectionList[charm.system.archetype.ability].list.push(charm);
          // }
        }
      }
    }
    const template = "systems/exaltedthird/templates/dialogues/import-item.html";
    const html = await renderTemplate(template, { 'sectionList': sectionList });

    await foundry.applications.api.DialogV2.wait({
      window: {
        title: "Import Item",
      },
      position: {
        height: 800,
        width: 650,
      },
      content: html,
      buttons: [{
        class: "closeImportItem",
        label: "Close",
        action: "closeImportItem",
      }],
      render: (event, html) => {
        html.querySelectorAll('.add-item').forEach(element => {
          element.addEventListener('click', async (ev) => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = items.find((item) => item._id === li.data("item-id"));
            if (!item.flags?.core?.sourceId) {
              item.updateSource({ "flags.core.sourceId": item.uuid });
            }
            if (!item._stats?.compendiumSource) {
              item.updateSource({ "_stats.compendiumSource": item.uuid });
            }
            const newItem = foundry.utils.duplicate(item);
            newItem.itemCount = 1;
            await this.getEnritchedHTML(newItem);
            if (item.type === 'ritual') {
              if (ritualType === 'sorcery') {
                this.object.character.ritual = newItem;
              } else {
                this.object.character.necromancyRitual = newItem;
              }
            }
            else {
              if (newItem) {
                let listIndex = 0;
                let indexAdd = "0";
                for (const key of Object.keys(this.object.character[type])) {
                  if (key !== listIndex.toString()) {
                    break;
                  }
                  listIndex++;
                }
                indexAdd = listIndex.toString();
                this.object.character[type][indexAdd] = newItem;
              }
            }

            this.onChange();
            const closeImportItem = html.querySelector('.closeImportItem');
            if (closeImportItem) {
              closeImportItem.click();
            }
          });
        });

        html.querySelectorAll('.collapsable').forEach(element => {
          element.addEventListener('click', (ev) => {
            const li = $(ev.currentTarget).next();
            li.toggle("fast");
          });
        });
      },
      classes: ['exaltedthird-dialog', `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
    });
  }

  static async deleteItem(event, target) {
    const type = target.dataset.type;
    const ritual = target.dataset.ritual;
    if (type === 'ritual') {
      if (ritual === 'sorcery') {
        this.object.character.ritual = {
          name: '',
        }
      } else {
        this.object.character.necromancyRitual = {
          name: '',
        }
      }
    }
    else {
      delete this.object.character[type][target.dataset.index];
    }
    this.onChange();
  }

  async _onDropItem(event) {
    let data;

    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (data.type !== "Item") return;
    } catch (err) {
      return false;
    }

    data.id = data.uuid.split('.')[1];
    if (data.uuid.includes('Compendium')) {
      return ui.notifications.error(`Error: You cannot drop compendium items into box.`);
      // let tmp = data.uuid.split('.');
      // data.pack = tmp[1] + '.' + tmp[2];
      // data.id = tmp[4];
    }

    let itemObject;
    if (data.pack) {
      // Case 1 - Import from a Compendium pack
      itemObject = await this.importItemFromCollection(data.pack, data.id);
      if (!itemObject) {
        return ui.notifications.error(`Error: Could not find item, you cannot drop embeded items into box.`);
      };
    }
    else {
      // Case 2 - Import from World entity
      itemObject = await game.items.get(data.id);
      if (!itemObject) {
        return ui.notifications.error(`Error: Could not find item, you cannot drop embeded items into box.`);
      };
    }

    if (!itemObject.flags?.core?.sourceId) {
      itemObject.updateSource({ "flags.core.sourceId": itemObject.uuid });
    }

    const newItem = foundry.utils.duplicate(itemObject);
    if (newItem.type === 'charm') {
      newItem.itemCount = 0;
    }

    switch (newItem.type) {
      case 'charm':
        if (newItem.system.charmtype === 'evocation') {
          this.object.character.evocations[Object.entries(this.object.character.evocations).length] = newItem;
        }
        else if (newItem.system.charmtype === 'otherCharm') {
          this.object.character.otherCharms[Object.entries(this.object.character.otherCharms).length] = newItem;
        }
        else if (newItem.system.charmtype === 'martialarts') {
          this.object.character.martialArtsCharms[Object.entries(this.object.character.martialArtsCharms).length] = newItem;
        }
        else {
          this.object.character.charms[Object.entries(this.object.character.charms).length] = newItem;
          if (this.object.character.abilities[newItem.system.ability]) {
            this.object.character.abilities[newItem.system.ability].charms[Object.entries(this.object.character.abilities[newItem.system.ability].charms).length] = newItem;
          }
          if (this.object.character.attributes[newItem.system.ability]) {
            this.object.character.attributes[newItem.system.ability].charms[Object.entries(this.object.character.attributes[newItem.system.ability].charms).length] = newItem;
          }
        }

        break;
      case 'spell':
        this.object.character.spells[Object.entries(this.object.character.spells).length] = newItem;
        break;
      case 'specialty':
        this.object.character.specialties[Object.entries(this.object.character.specialties).length] = {
          name: newItem.name,
          system: {
            ability: newItem.system.ability,
          }
        };
        break;
      case 'merit':
        this.object.character.merits[Object.entries(this.object.character.merits).length] = newItem;
        break;
      case 'weapon':
        this.object.character.weapons[Object.entries(this.object.character.weapons).length] = newItem;
        break;
      case 'armor':
        this.object.character.armors[Object.entries(this.object.character.armors).length] = newItem;
        break;
      case 'customability':
        if (newItem.system.abilitytype === 'martialart') {
          this.object.character.martialArts[Object.entries(this.object.character.martialArts).length] = newItem;
        }
        if (newItem.system.abilitytype === 'craft') {
          this.object.character.crafts[Object.entries(this.object.character.crafts).length] = newItem;
        }
        break;
    }

    this.onChange();
  }

  importItemFromCollection(collection, entryId) {
    const pack = game.packs.get(collection);
    if (pack.documentName !== "Item") return;
    return pack.getDocument(entryId).then((ent) => {
      return ent;
    });
  }

  static async deleteSublistCharm(event, target) {
    const sublistkey = target.dataset.sublistkey;
    const type = target.dataset.type;
    const charm = this.object.character[type][sublistkey].charms[target.dataset.index];

    let index = null;
    for (const [key, value] of Object.entries(this.object.character.charms)) {
      if (value === charm) {
        index = key;
        break;
      }
    }
    if (index) {
      delete this.object.character.charms[index];
      this.onChange();
    }
  }

  static async lowerCharmCount(event, target) {
    const type = target.dataset.type;
    const index = target.dataset.index;
    if (this.object.character[type][index].itemCount > 0) {
      this.object.character[type][index].itemCount--;
    }
    this.onChange();
  }

  static async addCharmCount(event, target) {
    const type = target.dataset.type;
    const index = target.dataset.index;
    this.object.character[type][index].itemCount++;
    this.onChange();
  }

  static async randomItem(event, target) {
    const type = target.dataset.type;

    if (type === 'merits' && game.items.filter(item => item.type === 'merit').length <= 0) {
      const mutationsList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/mutations.json', {}, { int: 30000 });
      const meritList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/merits.json', {}, { int: 30000 });
      const fullMeritList = mutationsList.concat(meritList);

      var merit = fullMeritList[Math.floor(Math.random() * fullMeritList.length)];
      var meritRating = merit.dotValues[Math.floor(Math.random() * merit.dotValues.length)];

      this.object.character.merits[Object.entries(this.object.character.merits).length] = {
        name: merit.name,
        enritchedHTML: merit.pageref,
        system: {
          points: meritRating,
          description: merit.pageref
        }
      };
    }
    else {
      const items = await this._getItemList(target);
      var item = items[Math.floor(Math.random() * items.length)];
      if (item) {
        if (!item.flags?.core?.sourceId) {
          item.updateSource({ "flags.core.sourceId": item.uuid });
        }
        const newItem = foundry.utils.duplicate(item);
        newItem.itemCount = 1;
        await this.getEnritchedHTML(newItem);

        if (item.type === 'ritual') {
          if (item.system.ritualtype === 'necromancy') {
            this.object.character.necromancyRitual = newItem;
          } else {
            this.object.character.ritual = newItem;
          }
        }
        else {
          if (newItem) {
            let listIndex = 0;
            let indexAdd = "0";
            for (const key of Object.keys(this.object.character[type])) {
              if (key !== listIndex.toString()) {
                break;
              }
              listIndex++;
            }
            indexAdd = listIndex.toString();
            this.object.character[type][indexAdd] = newItem;
          }
        }
      }
    }
    this.onChange();
  }

  async _getItemList(target) {
    const type = target.dataset.type;
    const itemType = target.dataset.item;
    const itemRitual = target.dataset.ritual;
    let items = game.items.filter(charm => charm.type === itemType);
    if (itemRitual) {
      items = items.filter(item => item.system.ritualtype === itemRitual);
    }
    let archetypeCharms = [];
    if (itemType === 'evocation' || itemType === 'martialArtCharm' || itemType === 'otherCharm') {
      items = game.items.filter(charm => charm.type === 'charm');
    }
    if (type === 'martialArts') {
      items = game.items.filter(item => item.type === 'customability' && item.system.abilitytype === 'martialart' && (!item.system.siderealmartialart || this.object.character.essence >= 3));
    }
    if (itemType === 'charm' || itemType === 'evocation' || itemType === 'martialArtCharm' || itemType === 'otherCharm') {
      items = items.filter(charm => charm.system.essence <= this.object.character.essence || charm.system.ability === this.object.character.supernal);
      if (itemType === 'charm') {
        if (this.object.character.exalt === 'exigent') {
          items = items.filter(charm => charm.system.charmtype === this.object.character.exigent || charm.system.charmtype === 'universal');
        } else {
          items = items.filter(charm => charm.system.charmtype === this.object.character.exalt || charm.system.charmtype === 'universal');
        }
        archetypeCharms = items.filter(charm => charm.system.archetype.ability || charm.system.archetype.charmprerequisites.length > 0);
        if (target.dataset.ability) {
          items = items.filter(charm => charm.system.ability === target.dataset.ability);
          archetypeCharms = archetypeCharms.filter(charm => {
            if(!charm.system.archetype.ability) {
              return true;
            }
            if (charm.system.archetype.ability === "combat") {
              return ['archery', 'brawl', 'melee', 'thrown', 'war'].includes(target.dataset.ability);
            }
            return charm.system.archetype.ability === target.dataset.ability;
          });
        }
        if (this.object.characterType === 'character') {
          items = items.filter(charm => {
            if (this.object.character.attributes[charm.system.ability]) {
              return charm.system.requirement <= this.object.character.attributes[charm.system.ability].value + (this.object.character.attributes[charm.system.ability].upgrade || 0);
            }
            if (this.object.character.abilities[charm.system.ability]) {
              return charm.system.requirement <= this.object.character.abilities[charm.system.ability].value;
            }
            if (CONFIG.exaltedthird.maidens.includes(charm.system.ability)) {
              return charm.system.requirement <= this._getHighestMaidenAbility(charm.system.ability);
            }
            return true;
          });
          archetypeCharms = archetypeCharms.filter(charm => {
            if(!charm.system.archetype.ability) {
              return true;
            }
            if (charm.system.archetype.ability === "combat") {
              return charm.system.requirement <= Math.max(this.object.character.abilities['archery'].value, this.object.character.abilities['brawl'].value, this.object.character.abilities['melee'].value, this.object.character.abilities['thrown'].value, this.object.character.abilities['war'].value);
            }
            if(charm.system.archetype.ability === 'physicalAttribute') {
              return charm.system.requirement <= Math.max(this.object.character.attributes['strength'].value + (this.object.character.attributes['strength'].upgrade || 0), this.object.character.attributes['dexterity'].value + (this.object.character.attributes['dexterity'].upgrade || 0), this.object.character.attributes['stamina'].value + (this.object.character.attributes['stamina'].upgrade || 0));
            }
            if(charm.system.archetype.ability === 'mentalAttribute') {
              return charm.system.requirement <= Math.max(this.object.character.attributes['perception'].value + (this.object.character.attributes['perception'].upgrade || 0), this.object.character.attributes['intelligence'].value + (this.object.character.attributes['intelligence'].upgrade || 0), this.object.character.attributes['wits'].value + (this.object.character.attributes['wits'].upgrade || 0));
            }
            if(charm.system.archetype.ability === 'socialAttribute') {
              return charm.system.requirement <= Math.max(this.object.character.attributes['charisma'].value + (this.object.character.attributes['charisma'].upgrade || 0), this.object.character.attributes['manipulation'].value + (this.object.character.attributes['manipulation'].upgrade || 0), this.object.character.attributes['appearance'].value + (this.object.character.attributes['appearance'].upgrade || 0));
            }
            if (this.object.character.attributes[charm.system.archetype.ability]) {
              return charm.system.requirement <= this.object.character.attributes[charm.system.archetype.ability].value + (this.object.character.attributes[charm.system.archetype.ability].upgrade || 0);
            }
            if (this.object.character.abilities[charm.system.archetype.ability]) {
              return charm.system.requirement <= this.object.character.abilities[charm.system.archetype.ability].value;
            }
            if (CONFIG.exaltedthird.maidens.includes(charm.system.archetype.ability)) {
              return charm.system.requirement <= this._getHighestMaidenAbility(charm.system.archetype.ability);
            }
            return true;
          });
        }
      }
      else if (itemType === 'martialArtCharm') {
        items = items.filter(charm => charm.system.charmtype === 'martialarts');
        items = items.filter(charm => {
          if (charm.system.charmtype === 'martialarts') {
            if (charm.system.parentitemid) {
              return Object.values(this.object.character.martialArts).some(martialArt => martialArt._id === charm.system.parentitemid && charm.system.requirement <= martialArt.system.points);
            }
            return false;
          }
          return true;
        });
      }
      else if (itemType === 'otherCharm') {
        items = items.filter(charm => charm.system.charmtype === 'other' || charm.system.charmtype === 'eclipse' || charm.system.charmtype === 'universal');
      }
      else {
        items = items.filter(charm => charm.system.charmtype === 'evocation');
        items = items.filter(charm => {
          var returnVal = false;
          if (charm.system.parentitemid) {
            if (Object.values(this.object.character.weapons).some(weapon => weapon._id === charm.system.parentitemid)) {
              returnVal = true;
            }
            if (Object.values(this.object.character.armors).some(armor => armor._id === charm.system.parentitemid)) {
              returnVal = true;
            }
            if (Object.values(this.object.character.items).some(item => item._id === charm.system.parentitemid)) {
              returnVal = true;
            }
          }
          return returnVal;
        });
      }
    }
    if (itemType === 'spell') {
      items = items.filter(spell => {
        if (spell.system.circle === 'terrestrial' && this.object.character.sorcerer !== 'none') {
          return true;
        }
        if (spell.system.circle === 'celestial' && this.object.character.sorcerer !== 'terrestrial' && this.object.character.sorcerer !== 'none') {
          return true;
        }
        if (spell.system.circle === 'solar' && this.object.character.sorcerer === 'solar') {
          return true;
        }
        if (spell.system.circle === 'ivory' && this.object.character.necromancer !== 'none') {
          return true;
        }
        if (spell.system.circle === 'shadow' && this.object.character.necromancer !== 'ivory' && this.object.character.necromancer !== 'none') {
          return true;
        }
        if (spell.system.circle === 'void' && this.object.character.necromancer === 'void') {
          return true;
        }
        return false;
      });
    }
    if (itemType === "merit") {
      items = items.filter(merit => {
        if (merit.system.merittype !== "sorcery") {
          return true;
        }
        if (this.object.character.ritual?.system?.archetypename) {
          if (!merit.system.archetypename || merit.system.archetypename.toLowerCase() === this.object.character.ritual?.system?.archetypename.toLowerCase()) {
            return true;
          }
        }
        return false;
      });
    }
    const itemIds = [
      ...Object.values(this.object.character.charms).map(charm => charm._id),
      ...Object.values(this.object.character.martialArts).map(charm => charm._id),
      ...Object.values(this.object.character.martialArtsCharms).map(charm => charm._id),
      ...Object.values(this.object.character.evocations).map(charm => charm._id),
      ...Object.values(this.object.character.otherCharms).map(charm => charm._id),
      ...Object.values(this.object.character.spells).map(spell => spell._id),
      ...Object.values(this.object.character.weapons).map(weapon => weapon._id),
      ...Object.values(this.object.character.armors).map(armor => armor._id),
      ...Object.values(this.object.character.items).map(item => item._id),
      ...Object.values(this.object.character.specialAbilities).map(item => item._id),
      ...Object.values(this.object.character.merits).map(merit => merit._id),
    ];
    if (itemType === 'charm') {
      items = items.filter(charm => {
        if (charm.system.numberprerequisites.number > 0) {
          let existingCharms = 0;
          if (charm.system.numberprerequisites.ability === "combat") {
            existingCharms = (Object.values(this.object.character.charms)?.filter(numberCharm => ['archery', 'brawl', 'melee', 'thrown', 'war'].includes(numberCharm.system.ability)).length || 0);
          }
          else if (['physicalAttribute', 'mentalAttribute', 'socialAttribute'].includes(charm.system.numberprerequisites.ability)) {
            if (charm.system.numberprerequisites.ability === 'physicalAttribute') {
              existingCharms = (Object.values(this.object.character.charms)?.filter(numberCharm => ['strength', 'dexterity', 'stamina'].includes(numberCharm.system.ability)).length || 0);
            }
            if (charm.system.numberprerequisites.ability === 'mentalAttribute') {
              existingCharms = (Object.values(this.object.character.charms)?.filter(numberCharm => ['intelligence', 'wits', 'perception'].includes(numberCharm.system.ability)).length || 0);
            }
            if (charm.system.numberprerequisites.ability === 'socialAttribute') {
              existingCharms = (Object.values(this.object.character.charms)?.filter(numberCharm => ['charisma', 'appearance', 'manipulation'].includes(numberCharm.system.ability)).length || 0);
            }
          }
          else if (CONFIG.exaltedthird.maidens.includes(charm.system.ability)) {
            existingCharms = this._getMaidenCharmsNumber(charm.system.numberprerequisites.ability);
          }
          else {
            existingCharms = (Object.values(this.object.character.charms)?.filter(numberCharm => numberCharm.system.ability === charm.system.numberprerequisites.ability).length || 0);
          }
          if (existingCharms < charm.system.numberprerequisites.number) {
            return false;
          }
        }
        return charm.system.charmprerequisites.length === 0 || itemIds.includes(charm._id) || charm.system.charmprerequisites.every(prerequisite => itemIds.includes(prerequisite.id));
      });
      if (archetypeCharms) {
        archetypeCharms = archetypeCharms.filter(charm => {
          return !items.includes(charm) && (charm.system.archetype.charmprerequisites.length === 0 || itemIds.includes(charm._id) || charm.system.archetype.charmprerequisites.every(prerequisite => itemIds.includes(prerequisite.id)));
        });
        items = items.concat(archetypeCharms);
      }
    }
    items = items.filter(item => !itemIds.includes(item._id));
    for (var item of items) {
      await this.getEnritchedHTML(item);
    }
    return items;
  }

  _getHighestMaidenAbility(maiden) {
    const abilityList = CONFIG.exaltedthird.maidenabilities[maiden];
    let highestValue = 0;
    for (const ability of abilityList) {
      if ((this.object.character.abilities[ability]?.value || 0) > highestValue) {
        highestValue = (this.object.character.abilities[ability]?.value || 0);
      }
    }
    return highestValue;
  }

  async getEnritchedHTML(item) {
    item.enritchedHTML = await TextEditor.enrichHTML(item.system.description, { async: true, secrets: true, relativeTo: item });
  }


  static async saveCharacter(event, target) {
    ChatMessage.create({
      user: game.user.id,
      content: `<div>In progress character <b>${this.object.character.name || this.object.character.defaultName}</b> has been saved to this chat message</div><div><button class="resume-character">${game.i18n.localize('Ex3.Resume')}</button></div>`,
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      flags: {
        "exaltedthird": {
          character: this.object,
        }
      },
    });
  }

  static async showHelpDialog(event, target) {
    const html = await renderTemplate("systems/exaltedthird/templates/dialogues/dialog-help.html", { 'link': 'https://github.com/Aliharu/Foundry-Ex3/wiki/Character-Creator' });
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("Ex3.ReadMe"), resizable: true },
      content: html,
      buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
      classes: [`${game.settings.get("exaltedthird", "sheetStyle")}-background`],
    }).render(true);
  }

  async getCommonName() {
    let newName = '';
    const randomName = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/randomNames.json', {}, { int: 30000 });
    const nameFormats = [
      { option: 1, weight: 4 },
      { option: 2, weight: 16 },
      { option: 3, weight: 8 },
      { option: 4, weight: 4 },
      { option: 5, weight: 2 },
      { option: 6, weight: 1 },
      { option: 7, weight: 8 },
    ];
    const totalWeight = nameFormats.reduce((acc, option) => acc + option.weight, 0);

    // Generate a random number between 0 and the total weight
    const randomWeight = Math.random() * totalWeight;

    // Iterate over the nameFormats until the cumulative weight surpasses the random weight
    let cumulativeWeight = 0;
    let selectedOption;
    let optionsSection;
    let optionsSectionIndex;
    for (const option of nameFormats) {
      cumulativeWeight += option.weight;
      if (randomWeight <= cumulativeWeight) {
        selectedOption = option.option;
        break;
      }
    }
    switch (selectedOption) {
      case 1:
        optionsSection = randomName.noun[Math.floor(Math.random() * randomName.noun.length)];
        newName = optionsSection[Math.floor(Math.random() * optionsSection.length)];
        break;
      case 2:
        optionsSection = randomName.adjective[Math.floor(Math.random() * randomName.adjective.length)];
        newName += optionsSection[Math.floor(Math.random() * optionsSection.length)];
        optionsSection = randomName.noun[Math.floor(Math.random() * randomName.noun.length)];
        newName += (' ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
        break;
      case 3:
        optionsSection = randomName.adjective[Math.floor(Math.random() * randomName.adjective.length)];
        newName += optionsSection[Math.floor(Math.random() * optionsSection.length)];
        for (let i = 0; i < 2; i++) {
          optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
          optionsSection = randomName.noun[optionsSectionIndex];
          newName += (' ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
          randomName.noun.splice(optionsSectionIndex, 1);
        }
        break;
      case 4:
        optionsSection = randomName.adjective[Math.floor(Math.random() * randomName.adjective.length)];
        newName += optionsSection[Math.floor(Math.random() * optionsSection.length)];
        optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
        optionsSection = randomName.noun[optionsSectionIndex];
        newName += (' ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
        randomName.noun.splice(optionsSectionIndex, 1);
        optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
        optionsSection = randomName.noun[optionsSectionIndex];
        newName += (' of the ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
        break;
      case 5:
        optionsSection = randomName.adjective[Math.floor(Math.random() * randomName.adjective.length)];
        newName += optionsSection[Math.floor(Math.random() * optionsSection.length)];
        optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
        optionsSection = randomName.noun[optionsSectionIndex];
        newName += (' ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
        randomName.noun.splice(optionsSectionIndex, 1);
        optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
        optionsSection = randomName.noun[optionsSectionIndex];
        newName += (' of the ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
        randomName.noun.splice(optionsSectionIndex, 1);
        optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
        optionsSection = randomName.noun[optionsSectionIndex];
        newName += (' ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
        break;
      case 6:
        optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
        optionsSection = randomName.noun[optionsSectionIndex];
        newName += optionsSection[Math.floor(Math.random() * optionsSection.length)];
        randomName.noun.splice(optionsSectionIndex, 1);
        optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
        optionsSection = randomName.noun[optionsSectionIndex];
        newName += (' and ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
        randomName.noun.splice(optionsSectionIndex, 1);
        optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
        optionsSection = randomName.noun[optionsSectionIndex];
        newName += (' ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
        break;
      case 7:
        optionsSection = randomName.verb[Math.floor(Math.random() * randomName.verb.length)];
        newName += optionsSection[Math.floor(Math.random() * optionsSection.length)];
        optionsSectionIndex = Math.floor(Math.random() * randomName.noun.length);
        optionsSection = randomName.noun[optionsSectionIndex];
        newName += (' ' + optionsSection[Math.floor(Math.random() * optionsSection.length)]);
        break;
    }
    return newName;
  }

  async getDynastName() {
    const randomName = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/randomDynastNames.json', {}, { int: 30000 });
    return `${randomName.house[Math.floor(Math.random() * randomName.house.length)]} ${randomName.name1[Math.floor(Math.random() * randomName.name1.length)]}${randomName.name2[Math.floor(Math.random() * randomName.name2.length)]}`;
  }

  async getAbyssalName() {
    const randomName = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/randomAbyssalTitles.json', {}, { int: 30000 });
    return `The ${randomName.name1[Math.floor(Math.random() * randomName.name1.length)]} ${randomName.name2[Math.floor(Math.random() * randomName.name2.length)]} ${randomName.name3[Math.floor(Math.random() * randomName.name3.length)]} ${randomName.name4[Math.floor(Math.random() * randomName.name4.length)]}`;
  }

  async getBaseCharacterData(actorData, itemData) {
    actorData.name = this.object.character.name || this.object.character.defaultName;
    actorData.prototypeToken.name = this.object.character.name || this.object.character.defaultName;
    actorData.system.essence.value = this.object.character.essence;
    actorData.system.details.exalt = this.object.character.exalt;
    actorData.system.details.caste = this.object.character.caste;
    if (this.object.characterType === 'npc') {
      this.getNpcData(actorData, itemData);
    }
    else {
      this.getCharacterData(actorData, itemData);
    }
    if (this.object.character.supernal) {
      actorData.system.details.supernal = this.object.character.supernal;
      actorData.system.details.apocalyptic = this.object.character.supernal;
    }
    actorData.system.details.tell = this.object.character.tell;
    actorData.system.details.spiritshape = this.object.character.spiritShape;
    actorData.system.details.birthsign = this.object.character.birthSign;
    actorData.system.details.exaltsign = this.object.character.exaltSign;
    actorData.system.details.caste = this.object.character.caste;
    actorData.system.willpower.max = this.object.character.willpower;
    actorData.system.willpower.value = this.object.character.willpower;

    if (actorData.system.details.exalt === 'exigent') {
      actorData.system.details.caste = this.object.character.exigent;
    }
    else {
      actorData.system.details.caste = this.object.character.caste;
    }

    if (actorData.system.details.exalt === 'dragonblooded') {
      actorData.system.settings.hasaura = true;
      actorData.system.settings.martialartsmastery = 'terrestrial';
    }
    if (actorData.system.details.exalt === 'sidereal') {
      actorData.system.settings.showmaidens = true;
      actorData.system.settings.smaenlightenment = true;
    }
    if (this.object.character.classificationType !== 'exalt' || actorData.system.details.exalt === 'mortal') {
      actorData.system.settings.showanima = false;
    }
    if (actorData.system.details.exalt === 'solar' || actorData.system.details.exalt === 'abyssal' || actorData.system.details.exalt === 'infernal') {
      actorData.system.settings.martialartsmastery = 'mastery';
    }

    if(this.object.character.exalt === 'alchemical') {
      actorData.system.charmslots.value = this.object.character.charmSlots;
    }
    actorData.system.settings.sorcerycircle = this.object.character.sorcerer;
    actorData.system.settings.necromancycircle = this.object.character.necromancer;

    if (this.object.character.oxBodies > 0) {
      const oxBodyChart = CONFIG.exaltedthird.oxBody;
      var oxBodyValue = this.object.character.attributes.stamina.value + this.object.character.attributes.stamina.upgrade;
      if (oxBodyChart[this.object.character.exalt]) {
        if (oxBodyValue < 3) {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exalt].zero.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exalt].zero.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exalt].zero.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exalt].zero.four * this.object.character.oxBodies);
        }
        else if (oxBodyValue < 5) {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exalt].three.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exalt].three.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exalt].three.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exalt].three.four * this.object.character.oxBodies);
        }
        else if(oxBodyValue < 6 || !oxBodyChart[this.object.character.exalt].six) {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exalt].five.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exalt].five.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exalt].five.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exalt].five.four * this.object.character.oxBodies);
        }
        else {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exalt].six.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exalt].six.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exalt].six.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exalt].six.four * this.object.character.oxBodies);
        }
      }
      if (oxBodyChart[this.object.character.exigent]) {
        if (oxBodyValue < 3) {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exigent].zero.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exigent].zero.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exigent].zero.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exigent].zero.four * this.object.character.oxBodies);
        }
        else if (oxBodyValue < 5) {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exigent].three.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exigent].three.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exigent].three.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exigent].three.four * this.object.character.oxBodies);
        }
        else {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exigent].five.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exigent].five.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exigent].five.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exigent].five.four * this.object.character.oxBodies);
        }
      }
    }

    // Obtain choices
    const chosenLanguages = [];
    for ( let [k, v] of Object.entries(this.object.character.languages)) {
      if(v.chosen) {
        chosenLanguages.push(k);
      }
    }

    actorData.system.traits.languages.value = chosenLanguages;
    actorData.system.traits.languages.custom = this.object.character.customLanguages; 

    for (let craft of Object.values(this.object.character.crafts)) {
      itemData.push({
        type: 'customability',
        name: craft.name,
        flags: {
          core: {
            sourceId: craft.flags?.core?.sourceId
          }
        },
        system: {
          points: craft.system.points,
          abilitytype: "craft",
          favored: this.object.character.abilities.craft.favored,
        }
      });
    }

    for (let martialArt of Object.values(this.object.character.martialArts)) {
      if (this.object.characterType === 'npc') {
        itemData.push(
          {
            type: 'action',
            name: martialArt.name,
            system: {
              value: martialArt.system.points || this._getCharacterPool(this.object.character.skills.combat.value),
            }
          }
        );
      } else {
        itemData.push({
          type: 'customability',
          name: martialArt.name,
          flags: {
            core: {
              sourceId: martialArt.flags?.core?.sourceId
            }
          },
          system: {
            points: martialArt.system.points,
            abilitytype: "martialart",
            favored: this.object.character.abilities.martialarts.favored,
          }
        });
      }
    }

    for (let [key, merit] of Object.entries(this.object.character.merits)) {
      itemData.push({
        type: 'merit',
        name: merit.name,
        flags: {
          core: {
            sourceId: merit.flags?.core?.sourceId
          }
        },
        system: {
          points: merit.system.points,
          description: merit.system.description
        }
      });
    }
    for (const specialAbility of Object.values(this.object.character.specialAbilities)) {
      itemData.push(foundry.utils.duplicate(specialAbility));
    }
    if (this.object.characterType === 'character') {
      for (let [key, specialty] of Object.entries(this.object.character.specialties)) {
        itemData.push({
          type: 'specialty',
          name: specialty.name,
          flags: {
            core: {
              sourceId: specialty.flags?.core?.sourceId
            }
          },
          system: {
            ability: specialty.system.ability,
          }
        });
      }
    }

    for (let [key, specialty] of Object.entries(this.object.character.intimacies)) {
      itemData.push({
        type: 'intimacy',
        name: specialty.name,
        system: {
          strength: specialty.system.strength,
          intimacytype: specialty.system.intimacytype
        }
      });
    }
  }

  async getCharacterData(actorData, itemData) {
    for (let [key, attribute] of Object.entries(this.object.character.attributes)) {
      actorData.system.attributes[key].value = attribute.value;
      actorData.system.attributes[key].favored = attribute.favored;
      actorData.system.attributes[key].upgrade = attribute.upgrade;
      if (this.object.character.exalt === 'lunar') {
        if (attribute.favored && (attribute.value >= 3 || (Object.entries(attribute.charms).length > 0))) {
          actorData.system.attributes[key].excellency = true;
        }
        else if (attribute.value >= 5 || (Object.entries(attribute.charms).length >= 3)) {
          actorData.system.attributes[key].excellency = true;
        }
      }
      if (this.object.character.exalt === 'alchemical') {
        if ((attribute.favored && attribute.value >= 3) || ((Object.entries(attribute.charms).length > 0) || attribute.upgrade > 0)) {
          actorData.system.attributes[key].excellency = true;
        }
      }
    }

    for (let [key, ability] of Object.entries(this.object.character.abilities)) {
      actorData.system.abilities[key].value = ability.value;
      actorData.system.abilities[key].favored = ability.favored;
      if (((Object.entries(ability.charms).length > 0) || (ability.favored && ability.value > 0)) && (CONFIG.exaltedthird.abilityExalts.includes(this.object.character.exalt) || this.object.character.exigent === 'janest')) {
        actorData.system.abilities[key].excellency = true;
      }
      if (Object.values(ability.charms).some(charm => charm.system.ability === key && charm.system.keywords.toLowerCase().includes('excellency'))) {
        actorData.system.abilities[key].excellency = true;
      }
    }
    if (this.object.character.exigent === 'janest') {
      actorData.system.abilities.athletics.excellency = true;
      actorData.system.abilities.awareness.excellency = true;
      actorData.system.abilities.presence.excellency = true;
      actorData.system.abilities.resistance.excellency = true;
      actorData.system.abilities.survival.excellency = true;
    }

    actorData.system.charcreation.physical = this.object.creationData.physical;
    actorData.system.charcreation.mental = this.object.creationData.mental;
    actorData.system.charcreation.social = this.object.creationData.social;
  }

  async getNpcData(actorData, itemData) {
    const poisons = [
      '3i/round, (L in Crash) 5 rounds, -2, Damage or ingestion',
      '2L/day, 7 days -0, Ingestion',
      '1i/round, (B in Crash) 10 rounds, -2, Damage',
      '2L/hour, 5 hours, -4, Ingestion',
      '2i/round, (L in Crash), 3 rounds, -3, Damage',
      '1L/minute, 10 minutes, -5, Damage',
    ]

    if (this.object.character.traits.commander.value) {
      actorData.system.pools.command.value = this._getCharacterPool(this.object.character.skills.combat.value);
    }
    actorData.system.pools.grapple.value = this._getCharacterPool(this.object.character.skills.strength.value);
    actorData.system.pools.joinbattle.value = this._getCharacterPool(this.object.character.skills.perception.value);
    actorData.system.pools.movement.value = this._getCharacterPool(this.object.character.skills.agility.value);
    actorData.system.pools.readintentions.value = this._getCharacterPool(this.object.character.skills.perception.value);
    actorData.system.pools.resistance.value = this._getCharacterPool(this.object.character.skills.body.value);
    actorData.system.pools.social.value = this._getCharacterPool(this.object.character.skills.social.value);
    actorData.system.naturalsoak.value = this._getCharacterPool(this.object.character.skills.body.value);

    if (this.object.character.sorcerer !== "none") {
      actorData.system.pools.sorcery.value = this._getCharacterPool(this.object.character.skills.mind.value);
    }
    actorData.system.pools.social.value = this._getCharacterPool(this.object.character.skills.social.value);

    actorData.system.parry.value = this._getStaticValue(this.object.character.skills.combat.value);
    actorData.system.evasion.value = this._getStaticValue(this.object.character.skills.agility.value);
    actorData.system.resolve.value = this._getStaticValue(this.object.character.skills.mind.value);
    actorData.system.guile.value = this._getStaticValue(this.object.character.skills.social.value);
    actorData.system.sizecategory = this.object.character.sizeCategory;

    actorData.system.appearance.value = 2;
    if (this.object.character.traits.strikingAppearance.value) {
      actorData.system.appearance.value = 4;
    }
    if (this.object.character.traits.poisoner.value) {
      actorData.system.qualities = `Poison: ${poisons[Math.floor(Math.random() * poisons.length)]}`;
    }

    if (this.object.character.skills.body.value === 'weak') {
      actorData.system.health.levels.one.value = 1;
    }
    if (this.object.character.skills.body.value === 'exceptional' || this.object.character.skills.body.value === 'legendary') {
      actorData.system.health.levels.one.value = 3;
    }
    if (this.object.character.skills.body.value === 'legendary') {
      actorData.system.health.levels.zero.value = 2;
    }
    actorData.system.battlegroup = this.object.character.battlegroup;
    if (this.object.character.battlegroup) {
      actorData.system.health.levels.zero.value = actorData.system.health.levels.zero.value + actorData.system.health.levels.one.value + actorData.system.health.levels.two.value + actorData.system.health.levels.four.value + this.object.character.battlegroupStats.size;
    }
    actorData.system.might.value = this.object.character.battlegroupStats.might;
    actorData.system.drill.value = this.object.character.battlegroupStats.drill;
    actorData.system.size.value = this.object.character.battlegroupStats.size;

    itemData.push(
      {
        type: 'action',
        name: 'Senses',
        system: {
          value: this._getCharacterPool(this.object.character.skills.perception.value)
        }
      }
    )
    itemData.push(
      {
        type: 'action',
        name: 'Mental Resistance',
        system: {
          value: this._getCharacterPool(this.object.character.skills.mind.value)
        }
      }
    )
    if (this.object.character.traits.stealthy.value) {
      itemData.push(
        {
          type: 'action',
          name: 'Stealth',
          system: {
            value: this._getCharacterPool(this.object.character.skills.agility.value)
          }
        }
      )
    }
    const animaList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/animaEffectsList.json', {}, { int: 30000 });
    if (animaList[this.object.character.caste]) {
      actorData.system.anima.passive = animaList[this.object.character.caste][0];
      actorData.system.anima.active = animaList[this.object.character.caste][1];
      actorData.system.anima.iconic = animaList[this.object.character.caste][2];
    }
    actorData.system.creaturetype = this.object.character.classificationType;
    if (this.object.character.traits.motePool.value) {
      actorData.system.motes.personal.max = actorData.system.essence.value * 10;
      actorData.system.motes.personal.value = actorData.system.essence.value * 10;
      if (this.object.character.traits.spirit.value) {
        actorData.system.motes.personal.value += 50;
        actorData.system.motes.personal.max += 50;
      }
    }
    itemData.push(
      {
        type: 'weapon',
        img: "systems/exaltedthird/assets/icons/fist.svg",
        name: 'Grapple',
        system: {
          witheringaccuracy: 4 + this._getCharacterPool(this.object.character.skills.combat.value),
          witheringdamage: 0,
          overwhelming: 0,
          defense: 0,
          weapontype: 'melee',
          weighttype: 'light',
          ability: "none",
          attribute: "none",
        }
      }
    );
  }

  _getStaticValue(level) {
    const pools = {
      low: {
        weak: 0,
        skilled: 1,
        exceptional: 3,
        legendary: 5,
      },
      mid: {
        weak: 1,
        skilled: 2,
        exceptional: 4,
        legendary: 6,
      },
      high: {
        weak: 1,
        skilled: 3,
        exceptional: 5,
        legendary: 7,
      }
    }
    return pools[this.object.poolNumbers][level];
  }

  _getCharacterPool(level) {
    const pools = {
      low: {
        weak: 1,
        skilled: 4,
        exceptional: 8,
        legendary: 12,
      },
      mid: {
        weak: 2,
        skilled: 5,
        exceptional: 9,
        legendary: 13,
      },
      high: {
        weak: 2,
        skilled: 6,
        exceptional: 10,
        legendary: 14,
      }
    }
    return pools[this.object.poolNumbers][level];
  }

  async _getCharacterEquipment(actorData, itemData) {
    const weaponsList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/weaponsList.json', {}, { int: 30000 });
    const armorList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/armorList.json', {}, { int: 30000 });

    for (const weapon of Object.values(this.object.character.weapons)) {
      const weaponCopy = foundry.utils.duplicate(weapon);
      if (this.object.characterType === 'npc') {
        weaponCopy.system.witheringaccuracy += this._getCharacterPool(this.object.character.skills.combat.value);
        weaponCopy.system.witheringdamage += attributeAbilityMap[this.object.character.skills.strength.value];
      }
      itemData.push(weaponCopy);
    }

    for (const randomWeapon of Object.values(this.object.character.randomWeapons)) {
      if (randomWeapon.type === 'random') {
        var randomWeaponList = weaponsList;
        if (randomWeapon.artifact) {
          randomWeaponList = randomWeaponList.filter(weapon => weapon.attunement > 0);
        }
        else {
          randomWeaponList = randomWeaponList.filter(weapon => weapon.attunement === 0);
        }
        if (randomWeapon.weight !== 'any') {
          randomWeaponList = randomWeaponList.filter(weapon => weapon.weighttype === randomWeapon.weight);
        }
        if (randomWeapon.weaponType !== 'any') {
          randomWeaponList = randomWeaponList.filter(weapon => weapon.weapontype === randomWeapon.weaponType);
        }
        var weapon = this._getRandomWeapon(randomWeaponList);
        if (this.object.characterType === 'npc') {
          weapon.system.witheringaccuracy += this._getCharacterPool(this.object.character.skills.combat.value);
        }
        itemData.push(
          weapon
        );
      }
      if (randomWeapon.type === 'set') {
        itemData.push(
          this._getSetWeapon(randomWeapon.weaponType, randomWeapon.weight, randomWeapon.artifact)
        );
      }
    }

    var armor;
    if (this.object.character.armor.type === 'random') {
      var filteredArmorList = armorList;
      if (this.object.character.armor.artifact) {
        filteredArmorList = filteredArmorList.filter(armor => armor.attunement > 0);
      }
      else {
        filteredArmorList = filteredArmorList.filter(armor => armor.attunement === 0);
      }
      if (this.object.character.armor.weight !== 'any') {
        filteredArmorList = filteredArmorList.filter(armor => armor.weighttype === this.object.character.armor.weight);
      }
      armor = this._getRandomArmor(filteredArmorList)
      itemData.push(
        armor
      );
    }
    else if (this.object.character.armor.type === 'set') {
      armor = this._getSetArmor(this.object.character.armor.weight, this.object.character.armor.artifact)
      itemData.push(
        armor
      );
    }
    for (const armor of Object.values(this.object.character.armors)) {
      itemData.push(foundry.utils.duplicate(armor));
    }
    for (const item of Object.values(this.object.character.items)) {
      itemData.push(foundry.utils.duplicate(item));
    }
    itemData.push(
      {
        type: 'weapon',
        img: 'systems/exaltedthird/assets/icons/fist.svg',
        name: 'Unarmed',
        system: {
          witheringaccuracy: 4 + (this.object.characterType === 'npc' ? this._getCharacterPool(this.object.character.skills.combat.value) : 0),
          witheringdamage: 7 + (this.object.characterType === 'npc' ? attributeAbilityMap[this.object.character.skills.strength.value] : 0),
          overwhelming: 1,
          defense: 0,
          weapontype: 'melee',
          weighttype: 'light',
          ability: "melee",
          attribute: "dexterity",
        }
      }
    );
  }

  _getCharacterCharms(itemData) {
    if (this.object.character.exalt !== 'mortal' && this.object.character.exalt !== 'dragonblooded') {
      itemData.push({
        type: 'charm',
        img: CONFIG.exaltedthird.excellencyIcons[this.object.character.exalt] || 'icons/magic/light/explosion-star-large-orange.webp',
        name: 'Dice Excellency',
        system: {
          description: 'Add 1 die to a roll for 1 mote.',
          ability: 'universal',
          listingname: 'Excellency',
          essence: 1,
          requirement: 1,
          cost: {
            motes: 1
          },
          diceroller: {
            bonusdice: "1"
          }
        }
      });
      itemData.push({
        type: 'charm',
        img: CONFIG.exaltedthird.excellencyIcons[this.object.character.exalt] || 'icons/magic/light/explosion-star-large-orange.webp',
        name: 'Static Excellency',
        system: {
          description: 'Add 1 to a static value for 2 motes.',
          ability: 'universal',
          listingname: 'Excellency',
          requirement: 1,
          essence: 1,
          cost: {
            motes: 2
          },
          diceroller: {
            opposedbonuses: {
              enabled: true,
              defense: "1",
              resolve: "1",
              guile: "1",
            }
          }
        }
      });
    }


    if (this.object.character.exalt === 'lunar' || this.object.character.exigent === 'architect' || this.object.character.exalt === 'alchemical') {
      itemData.push({
        type: 'charm',
        img: CONFIG.exaltedthird.excellencyIcons[this.object.character.exalt] || 'icons/magic/light/explosion-star-large-orange.webp',
        name: 'Soak Excellency',
        system: {
          description: 'Add 1 to a soak for 1 mote.',
          ability: 'universal',
          listingname: 'Excellency',
          requirement: 1,
          essence: 1,
          cost: {
            motes: 1
          },
          diceroller: {
            opposedbonuses: {
              enabled: true,
              soak: "1",
            }
          }
        }
      });
      itemData.push({
        type: 'charm',
        img: CONFIG.exaltedthird.excellencyIcons[this.object.character.exalt] || 'icons/magic/light/explosion-star-large-orange.webp',
        name: 'Damage Excellency',
        system: {
          description: 'Add 1 damage to an attack for 1 mote.',
          ability: 'universal',
          listingname: 'Excellency',
          requirement: 1,
          essence: 1,
          cost: {
            motes: 1
          },
          diceroller: {
            damage: {
              bonusdice: "1",
            }
          }
        }
      });
    }

    if(this.object.character.exalt === 'alchemical') {
      itemData.push({
        type: 'charm',
        img: CONFIG.exaltedthird.excellencyIcons[this.object.character.exalt] || 'icons/magic/light/explosion-star-large-orange.webp',
        name: 'Success Excellency',
        system: {
          description: 'Add 1 success to a roll for 2 motes.',
          ability: 'universal',
          listingname: 'Excellency',
          essence: 1,
          requirement: 1,
          cost: {
            motes: 2
          },
          diceroller: {
            bonussuccesses: "1"
          }
        }
      });
    }

    if (this.object.character.exalt === 'sidereal') {
      itemData.push({
        type: 'charm',
        img: 'icons/magic/light/explosion-star-glow-blue-purple.webp',
        name: 'Mote TN Excellency',
        system: {
          description: 'Lower Target Number by 1',
          ability: 'universal',
          listingname: 'Excellency',
          requirement: 1,
          essence: 1,
          cost: {
            motes: 1
          },
          diceroller: {
            decreasetargetnumber: 1,
          },
          "triggers": {
            "dicerollertriggers": {
              "0": {
                "name": "Essence 3 TN WP Cost",
                "triggerTime": "beforeRoll",
                "bonuses": {
                  "0": {
                    "effect": "willpower-spend",
                    "value": "1"
                  }
                },
                "requirements": {
                  "0": {
                    "requirement": "formula",
                    "value": "essence >= 3"
                  },
                  "1": {
                    "requirement": "charmAddedAmount",
                    "value": "3"
                  }
                }
              }
            }
          },
        }
      });
    }

    for (const charm of Object.values(this.object.character.charms)) {
      itemData.push(foundry.utils.duplicate(charm));
    }

    for (const evocation of Object.values(this.object.character.evocations)) {
      itemData.push(foundry.utils.duplicate(evocation));
    }

    for (const otherCharm of Object.values(this.object.character.otherCharms)) {
      itemData.push(foundry.utils.duplicate(otherCharm));
    }

    for (const martialArtsCharm of Object.values(this.object.character.martialArtsCharms)) {
      itemData.push(foundry.utils.duplicate(martialArtsCharm));
    }

    var baseCharms = game.items.filter((charm) => charm.type === 'charm' && (charm.system.essence <= this.object.character.essence || this.object.character.supernal === charm.system.ability));

    baseCharms = baseCharms.filter((charm) => charm.system.charmtype === this.object.character.exalt || charm.system.charmtype === 'martialarts');
  }

  async _getCharacterSpells(itemData) {
    if (this.object.character.ritual.name) {
      if (this.object.character.ritual._id) {
        itemData.push(await foundry.utils.duplicate(this.object.character.ritual));
      }
      else {
        itemData.push(
          {
            name: this.object.character.ritual.name,
            type: 'ritual',
          }
        );
      }
    }
    if (this.object.character.necromancyRitual.name) {
      if (this.object.character.necromancyRitual._id) {
        itemData.push(await foundry.utils.duplicate(this.object.character.necromancyRitual));
      }
      else {
        itemData.push(
          {
            name: this.object.character.necromancyRitual.name,
            type: 'ritual',
          }
        );
      }
    }
    for (const spell of Object.values(this.object.character.spells)) {
      itemData.push(await foundry.utils.duplicate(spell));
    }

    var spells = game.items.filter((spell) => spell.type === 'spell');
    if (this.object.character.sorcerer === 'terrestrial') {
      spells = spells.filter((spell) => spell.system.circle === 'terrestrial');
    }
    if (this.object.character.sorcerer === 'celestial') {
      spells = spells.filter((spell) => spell.system.circle === 'terrestrial' || spell.system.circle === 'celestial');
    }
    if (this.object.character.sorcerer === 'solar') {
      spells = spells.filter((spell) => spell.system.circle === 'terrestrial' || spell.system.circle === 'celestial' || spell.system.circle === 'solar');
    }
    if (this.object.character.necromancer === 'ivory') {
      spells = spells.filter((spell) => spell.system.circle === 'ivory');
    }
    if (this.object.character.necromancer === 'shadow') {
      spells = spells.filter((spell) => spell.system.circle === 'ivory' || spell.system.circle === 'shadow');
    }
    if (this.object.character.necromancer === 'void') {
      spells = spells.filter((spell) => spell.system.circle === 'ivory' || spell.system.circle === 'shadow' || spell.system.circle === 'void');
    }
    if (spells) {
      var loopBreaker = 0;
      for (var i = 0; i < this.object.character.randomSpells; i++) {
        loopBreaker = 0;
        if (i === spells.length) {
          break;
        }
        var spell = await foundry.utils.duplicate(spells[Math.floor(Math.random() * spells.length)]);
        while (itemData.find(e => e.name === spell.name) && loopBreaker < 50) {
          spell = await foundry.utils.duplicate(spells[Math.floor(Math.random() * spells.length)]);
          loopBreaker++;
        }
        itemData.push(spell);
      }
    }
  }

  _getRandomWeapon(weaponList) {
    var weapon = weaponList[Math.floor(Math.random() * weaponList.length)];
    return {
      type: 'weapon',
      img: "icons/svg/sword.svg",
      name: weapon.name,
      system: {
        witheringaccuracy: weapon.witheringaccuracy,
        witheringdamage: weapon.witheringdamage + ((weapon.traits.weapontags.value.includes('flame') || weapon.traits.weapontags.value.includes('crossbow')) ? 4 : (this.object.characterType === 'npc' ? attributeAbilityMap[this.object.character.skills.strength.value] : 0)),
        overwhelming: weapon.overwhelming,
        defense: weapon.defense,
        traits: weapon.traits,
        weighttype: weapon.weighttype,
        weapontype: weapon.weapontype,
        attunement: weapon.attunement,
        ability: "none",
        attribute: "none",
      }
    }
  }

  _getRandomArmor(munadneArmorList, isArtifact) {
    var armor = munadneArmorList[Math.floor(Math.random() * munadneArmorList.length)];
    return {
      type: 'armor',
      img: "systems/exaltedthird/assets/icons/breastplate.svg",
      name: armor.name,
      system: {
        attunement: armor.attunement,
        weighttype: armor.weighttype,
        soak: armor.soak,
        penalty: armor.penalty,
        hardness: armor.hardness,
        traits: armor.traits
      }
    }
  }

  _getSetWeapon(weaponType, weight, isArtifact) {
    const weaponData = {
      name: 'Weapon Attack',
      type: 'weapon',
      img: "icons/svg/sword.svg",
      system: {}
    }
    weaponData.system.weighttype = weight;
    weaponData.system.weapontype = weaponType;
    const equipmentChart = CONFIG.exaltedthird.weaponStats;
    const artifactEquipmentChart = CONFIG.exaltedthird.artifactWeaponStats;
    if (isArtifact) {
      weaponData.system.witheringaccuracy = artifactEquipmentChart[weaponData.system.weighttype].accuracy;
      weaponData.system.witheringdamage = artifactEquipmentChart[weaponData.system.weighttype].damage;
      weaponData.system.overwhelming = artifactEquipmentChart[weaponData.system.weighttype].overwhelming;
      weaponData.system.attunement = artifactEquipmentChart[weaponData.system.weighttype].attunement;
    }
    else {
      weaponData.system.witheringaccuracy = equipmentChart[weaponData.system.weighttype].accuracy;
      weaponData.system.witheringdamage = equipmentChart[weaponData.system.weighttype].damage;
      weaponData.system.overwhelming = equipmentChart[weaponData.system.weighttype].overwhelming;
      weaponData.system.attunement = 0;
    }
    if (weaponType === 'ranged') {
      weaponData.system.defense = 0;
    }
    else if (weaponType === 'thrown') {
      weaponData.system.defense = 0;
    }
    else {
      if (isArtifact) {
        weaponData.system.defense = artifactEquipmentChart[weaponData.system?.weighttype].defense;
      }
      else {
        weaponData.system.defense = equipmentChart[weaponData.system?.weighttype].defense;
      }
    }
    if (this.object.characterType === 'npc') {
      weaponData.system.witheringaccuracy += this._getCharacterPool(this.object.character.skills.combat.value);
    }
    return weaponData;
  }

  _getSetArmor(weight, isArtifact) {
    const armorData = {
      name: 'Armor',
      type: 'armor',
      img: "systems/exaltedthird/assets/icons/breastplate.svg",
      system: {}
    }
    armorData.system.weighttype = weight;

    const equipmentChart = CONFIG.exaltedthird.armorStats;
    const artifactEquipmentChart = CONFIG.exaltedthird.artifactArmorStats;
    if (isArtifact) {
      armorData.system.attunement = artifactEquipmentChart[armorData.system.weighttype].attunement;
      armorData.system.soak = artifactEquipmentChart[armorData.system.weighttype].soak;
      armorData.system.hardness = artifactEquipmentChart[armorData.system.weighttype].hardness;
      armorData.system.penalty = artifactEquipmentChart[armorData.system.weighttype].penalty;
    }
    else {
      armorData.system.soak = equipmentChart[armorData.system.weighttype].soak;
      armorData.system.hardness = equipmentChart[armorData.system.weighttype].hardness;
      armorData.system.penalty = equipmentChart[armorData.system.weighttype].penalty;
      armorData.system.attunement = 0;
    }

    return armorData;
  }


  _getBaseStatblock() {
    return new Actor.implementation({
      name: 'New Character',
      type: this.object.characterType
    }).toObject();
  }
}
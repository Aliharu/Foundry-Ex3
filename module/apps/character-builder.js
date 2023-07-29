export default class CharacterBuilder extends FormApplication {
  constructor(app, options, object, data) {
    super(object, options);
    this.object.template = 'custom';
    this.object.availableCastes = {};
    this.object.abilityList = CONFIG.exaltedthird.abilities;
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
        specialties: 0,
        merits: 0,
        charms: 0,
        intimacies: 4,
        bonusPoints: 0,
        willpower: 0,
      },
      spent: {
        attributes: {
          physical: 0,
          social: 0,
          mental: 0,
        },
        abilities: 0,
        abovethree: 0,
        specialties: 0,
        merits: 0,
        charms: 0,
        intimacies: 0,
        bonusPoints: {
          abilities: 0,
          attributes: 0,
          specialties: 0,
          merits: 0,
          charms: 0,
          willpower: 0,
          total: 0,
        },
      },
    },
      this.object.character = {
        name: '',
        defaultName: 'New Character',
        exalt: "solar",
        caste: "",
        exigent: "",
        supernal: "",
        essence: 1,
        willpower: 5,
        showAttributeCharms: true,
        showAbilityCharms: true,
        attributes: {
          strength: {
            excellency: false,
            value: 1,
            randomCharms: 0,
            charms: {},
            name: 'Ex3.Strength',
            type: 'physical',
          },
          charisma: {
            excellency: false,
            value: 1,
            randomCharms: 0,
            charms: {},
            name: 'Ex3.Charisma',
            type: 'social',
          },
          perception: {
            excellency: false,
            value: 1,
            randomCharms: 0,
            charms: {},
            name: 'Ex3.Perception',
            type: 'mental',
          },
          dexterity: {
            excellency: false,
            value: 1,
            randomCharms: 0,
            charms: {},
            name: 'Ex3.Dexterity',
            type: 'physical',
          },
          manipulation: {
            excellency: false,
            value: 1,
            randomCharms: 0,
            charms: {},
            name: 'Ex3.Manipulation',
            type: 'social',
          },
          intelligence: {
            excellency: false,
            value: 1,
            randomCharms: 0,
            charms: {},
            name: 'Ex3.Intelligence',
            type: 'mental',
          },
          stamina: {
            excellency: false,
            value: 1,
            randomCharms: 0,
            charms: {},
            name: 'Ex3.Stamina',
            type: 'physical',
          },
          appearance: {
            excellency: false,
            value: 1,
            randomCharms: 0,
            charms: {},
            name: 'Ex3.Appearance',
            type: 'social',
          },
          wits: {
            excellency: false,
            value: 1,
            randomCharms: 0,
            charms: {},
            name: 'Ex3.Wits',
            type: 'mental',
          }
        },
        abilities: {
          archery: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Archery",
          },
          athletics: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Athletics",
          },
          awareness: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Awareness",
          },
          brawl: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Brawl",
          },
          bureaucracy: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Bureaucracy",
          },
          craft: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Craft",
          },
          dodge: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Dodge",
          },
          integrity: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Integrity",
          },
          investigation: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Investigation",
          },
          larceny: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Larceny",
          },
          linguistics: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Linguistics",
          },
          lore: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Lore",
          },
          martialarts: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.MartialArts",
          },
          medicine: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Medicine",
          },
          melee: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Melee",
          },
          occult: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Occult",
          },
          performance: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Performance",
          },
          presence: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Presence",
          },
          resistance: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Resistance",
          },
          ride: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Ride",
          },
          sail: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Sail",
          },
          socialize: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Socialize",
          },
          stealth: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Stealth",
          },
          survival: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Survival",
          },
          thrown: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.Thrown",
          },
          war: {
            excellency: false,
            value: 0,
            randomCharms: 0,
            charms: {},
            name: "Ex3.War",
          }
        },
        charms: {},
        spells: {},
        specialties: {},
        merits: {},
        crafts: {},
        evocations: {},
        martialArts: {},
        weapons: {},
        armors: {},
        randomWeapons: {},
        armor: {},
        intimacies: {},
        sorcerer: 'none',
        randomSpells: 0,
      }

    this.onChange(null);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      popOut: true,
      template: "systems/exaltedthird/templates/dialogues/character-builder.html",
      id: "ex3-character-builder",
      title: `Character Builder`,
      width: 875,
      height: 1100,
      resizable: true,
      submitOnChange: true,
      closeOnSubmit: false,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "overview" }]
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

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.resource-value-step').click(this._onDotCounterChange.bind(this))

    html.on("change", "input", async ev => {
      await this.onChange(ev);
    });

    html.on("change", "select", async ev => {
      await this.onChange(ev);
    });

    html.on("change", "#template", async ev => {
      const templateNPCs = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/NPCTemplates.json', {}, { int: 30000 });
      var oldName = this.object.character.name;
      this.object.character = templateNPCs[this.object.template];
      this.object.character.name = oldName;
      this.render();
    });


    html.find("#randomAttributes").on("click", async (ev) => {
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

      await this.onChange(ev);
    });

    html.find("#randomAbilities").on("click", async (ev) => {
      let abilityValues = [
        5, 5, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]
      for (const ability of Object.values(this.object.character.abilities)) {
        ability.value = abilityValues.splice(Math.floor(Math.random() * abilityValues.length), 1)[0];
      }

      await this.onChange(ev);
    });

    html.find("#randomName").on("click", async (event) => {
      this.randomName();
    });

    html.find("#generate").on("click", async (event) => {
      this.createCharacter();
    });

    html.find(".add-item").on("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      if (type === 'specialties') {
        this.object.character.specialties[Object.entries(this.object.character['specialties']).length] = {
          name: 'Specialty',
          system: {
            ability: 'archery',
          }
        };
      }
      else if (type === 'weapons') {
        this.object.character.randomWeapons[Object.entries(this.object.character['randomWeapons']).length] = {
          type: "random",
          weaponType: "any",
          weight: "any",
          artifact: false,
        };
      }
      else if (type === 'intimacies') {
        this.object.character[type][Object.entries(this.object.character[type]).length] = {
          name: 'Name',
          system: {
            strength: 'minor',
            intimacytype: 'tie',
          }
        };
      }
      else if (type === 'martialArts') {
        this.object.character[type][Object.entries(this.object.character[type]).length] = {
          name: CONFIG.exaltedthird.martialarts[Math.floor(Math.random() * CONFIG.exaltedthird.martialarts.length)],
          system: {
            value: 0,
          }
        };
      }
      else if (type === 'merits') {
        this.object.character[type][Object.entries(this.object.character[type]).length] = {
          name: 'Name',
          system: {
            points: 0,
          }
        };
      }
      else {
        this.object.character[type][Object.entries(this.object.character[type]).length] = {
          name: 'Name',
          system: {
            value: 0,
          }
        };
      }
      await this.onChange(event);
    });

    html.find(".import-item").on("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      const itemType = event.currentTarget.dataset.item;
      let items = game.items.filter(charm => charm.type === itemType);
      if(itemType === 'evocation') {
        items = game.items.filter(charm => charm.type === 'charm');
      }
      if (itemType === 'charm' || itemType === 'evocation') {
        items = items.filter(charm => charm.system.essence <= this.object.character.essence || charm.system.ability === this.object.character.supernal);
        if(itemType === 'charm') {
          if (this.object.exalt === 'exigent') {
            items = items.filter(charm => charm.system.charmtype === this.object.character.exigent || charm.system.charmtype === 'martialarts');
          } else {
            items = items.filter(charm => charm.system.charmtype === this.object.character.exalt || charm.system.charmtype === 'martialarts');
          }
          if (event.currentTarget.dataset.ability) {
            items = items.filter(charm => charm.system.ability === event.currentTarget.dataset.ability);
          }
          items = items.filter(charm => {
            if (this.object.character.attributes[charm.system.ability]) {
              return charm.system.requirement <= this.object.character.attributes[charm.system.ability].value;
            }
            if (this.object.character.abilities[charm.system.ability]) {
              return charm.system.requirement <= this.object.character.abilities[charm.system.ability].value;
            }
            return true;
          });
        }
        else {
          items = items.filter(charm => charm.system.charmtype === 'evocation');
        }
        const charmIds = Object.values(this.object.character.charms).map(charm => charm._id);
        items = items.filter(charm => {
          return charm.system.charmprerequisites.length === 0 || charmIds.includes(charm._id) || charm.system.charmprerequisites.some(prerequisite => charmIds.includes(prerequisite.id));
        });
        items = items.filter(charm => !charmIds.includes(charm._id));
      }
      if (itemType === 'spell') {
        if (this.object.character.sorcerer === 'terrestrial') {
          items = items.filter((spell) => spell.system.circle === 'terrestrial');
        }
        if (this.object.character.sorcerer === 'celestial') {
          items = items.filter((spell) => spell.system.circle === 'terrestrial' || spell.system.circle === 'celestial');
        }
        if (this.object.character.sorcerer === 'solar') {
          items = items.filter((spell) => spell.system.circle === 'terrestrial' || spell.system.circle === 'celestial' || spell.system.circle === 'solar');
        }
        if (this.object.character.sorcerer === 'ivory') {
          items = items.filter((spell) => spell.system.circle === 'ivory');
        }
        if (this.object.character.sorcerer === 'shadow') {
          items = items.filter((spell) => spell.system.circle === 'ivory' || spell.system.circle === 'shadow');
        }
        if (this.object.character.sorcerer === 'void') {
          items = items.filter((spell) => spell.system.circle === 'ivory' || spell.system.circle === 'shadow' || spell.system.circle === 'void');
        }
      }
      for (var item of items) {
        this.getEnritchedHTML(item);
      }
      const template = "systems/exaltedthird/templates/dialogues/import-item.html";
      const html = await renderTemplate(template, { 'items': items });
      new Dialog({
        title: `Import Item`,
        content: html,
        buttons: {
          closeImportItem: { label: "Close" }
        },
        render: (html) => {
          html.find('.add-item').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = items.find((item) => item._id === li.data("item-id"));
            this.object.character[type][Object.entries(this.object.character[type]).length] = item;
            if (item.type === 'charm') {
              if (this.object.character.abilities[item.system.ability]) {
                this.object.character.abilities[item.system.ability].charms[Object.entries(this.object.character.abilities[item.system.ability].charms).length] = item;
              }
              if (this.object.character.attributes[item.system.ability]) {
                this.object.character.attributes[item.system.ability].charms[Object.entries(this.object.character[type]).length] = item;
              }
            }
            this.onChange(ev);
            html.find('.closeImportItem').trigger('click');
          });

          html.find('.item-row').click(ev => {
            const li = $(ev.currentTarget).next();
            li.toggle("fast");
          });
        },
      }, {
        height: 800,
        width: 650,
        resizable: true, classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`]
      }).render(true);
    });

    html.find(".random-item").on("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      if(type === 'merits') {
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
      await this.onChange(event);
    });

    html.find(".delete-item").on("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      const index = event.currentTarget.dataset.index;
      delete this.object.character[type][index];
      await this.onChange(event);
    });


    html.find('.item-row').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });
  }

  async getEnritchedHTML(item) {
    item.enritchedHTML = await TextEditor.enrichHTML(item.system.description, { async: true, secrets: true, relativeTo: item });
  }

  async onChange(ev) {
    const casteAbilitiesMap = CONFIG.exaltedthird.casteabilitiesmap;
    if (CONFIG.exaltedthird.castes[this.object.character.exalt]) {
      this.object.availableCastes = CONFIG.exaltedthird.castes[this.object.character.exalt];
    }
    if (this.object.character.exalt === 'lunar' || this.object.character.exigent === 'architect') {
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
    }
    else if (this.object.character.exalt === 'mortal') {
      this.object.character.showAttributeCharms = false;
      this.object.character.showAbilityCharms = false;
    }
    else {
      this.object.character.showAttributeCharms = false;
      this.object.character.showAbilityCharms = true;
    }
    if (ev?.target?.name === 'object.character.caste') {
      for (let [key, attribute] of Object.entries(this.object.character.attributes)) {
        if (casteAbilitiesMap[this.object.character.caste.toLowerCase()]?.includes(key)) {
          attribute.favored = true;
        }
        else {
          attribute.favored = false;
        }
      }
      for (let [key, ability] of Object.entries(this.object.character.abilities)) {
        if (casteAbilitiesMap[this.object.character.caste.toLowerCase()]?.includes(key)) {
          ability.favored = true;
        }
        else {
          ability.favored = false;
        }
      }
    }

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
      bonusPoints: 15,
      charms: 15,
      specialties: 4,
      merits: 10,
      intimacies: 4,
      willpower: 5,
    }
    if (this.object.character.exalt === 'solar' || this.object.character.exalt === 'lunar') {
      if (this.object.character.essence >= 2) {
        this.object.creationData.available.charms = 20;
        this.object.creationData.available.merits = 13;
        this.object.creationData.available.bonusPoints = 18;
      }
    }
    if (this.object.character.exalt === 'lunar') {
      if (this.object.character.essence >= 2) {
        this.object.creationData.available.charms = 20;
        this.object.creationData.available.merits = 13;
        this.object.creationData.available.bonusPoints = 18;
      }
    }
    if (this.object.character.exalt === 'dragonblooded') {
      this.object.creationData.available = {
        attributes: {
          physical: pointsAvailableMap[this.object.creationData.physical],
          social: pointsAvailableMap[this.object.creationData.social],
          mental: pointsAvailableMap[this.object.creationData.mental],
        },
        abilities: 28,
        bonusPoints: 18,
        charms: 20,
        specialties: 3,
        merits: 18,
        intimacies: 4,
        willpower: 5,
      }
      if (this.object.character.essence === 1) {
        this.object.creationData.available.charms = 15;
        this.object.creationData.available.merits = 10;
        this.object.creationData.available.bonusPoints = 15;
      }
    }
    if (this.object.character.exalt === 'sidereal') {
      if (this.object.character.essence >= 2) {
        this.object.creationData.available.charms = 20;
        this.object.creationData.available.merits = 13;
        this.object.creationData.available.bonusPoints = 18;
      }
    }
    if (this.object.character.exalt === 'mortal') {
      this.object.creationData.available = {
        attributes: {
          physical: pointsAvailableMap[this.object.creationData.physical],
          social: pointsAvailableMap[this.object.creationData.social],
          mental: pointsAvailableMap[this.object.creationData.mental],
        },
        abilities: 28,
        bonusPoints: 21,
        charms: 0,
        specialties: 4,
        merits: 7,
        intimacies: 4,
        willpower: 3,
      }
    }
    this.object.creationData.spent = {
      attributes: {
        physical: 0,
        social: 0,
        mental: 0,
      },
      abilities: 0,
      abilitiesAboveThree: 0,
      specialties: 0,
      merits: 0,
      charms: 0,
      abovethree: 0,
      bonusPoints: {
        abilities: 0,
        attributes: 0,
        specialties: 0,
        merits: 0,
        charms: 0,
        willpower: 0,
        total: 0,
      },
    }
    for (let attr of Object.values(this.object.character.attributes)) {
      this.object.creationData.spent.attributes[attr.type] += (attr.value - 1);
      this.object.creationData.spent.charms += attr.randomCharms;
    }
    for (let name of Object.keys(this.object.creationData.spent.attributes)) {
      if (this.object.creationData[name] === 'tertiary' || this.object.character.exalt === 'lunar') {
        this.object.creationData.spent.bonusPoints.attributes += (Math.max(0, this.object.creationData.spent.attributes[name] - this.object.creationData.available.attributes[name]) * 3);
      }
      else {
        this.object.creationData.spent.bonusPoints.attributes += (Math.max(0, this.object.creationData.spent.attributes[name] - this.object.creationData.available.attributes[name]) * 4);
      }
    }
    var threeOrBelowFavored = 0;
    var threeOrBelowNonFavored = 0;
    for (let ability of Object.values(this.object.character.abilities)) {
      this.object.creationData.spent.abovethree += Math.max(0, (ability.value - 3));
      if (ability.favored) {
        this.object.creationData.spent.bonusPoints.abilities += Math.max(0, (ability.value - 3));
        threeOrBelowFavored += Math.min(3, ability.value);
      }
      else {
        this.object.creationData.spent.bonusPoints.abilities += (Math.max(0, (ability.value - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, ability.value);
      }
      this.object.creationData.spent.charms += ability.randomCharms;
    }
    for (let craft of Object.values(this.object.character.crafts)) {
      this.object.creationData.spent.abovethree += Math.max(0, (craft.system.value - 3));
      if (this.object.character.abilities.craft.favored) {
        this.object.creationData.spent.bonusPoints.abilities += Math.max(0, (craft.system.value - 3));
        threeOrBelowFavored += Math.min(3, craft.system.value);
      }
      else {
        this.object.creationData.spent.bonusPoints.abilities += (Math.max(0, (craft.system.value - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, craft.system.value);
      }
    }
    for (let martialArt of Object.values(this.object.character.martialArts)) {
      this.object.creationData.spent.abovethree += Math.max(0, (martialArt.system.value - 3));
      if (this.object.character.abilities.martialarts.favored) {
        this.object.creationData.spent.bonusPoints.abilities += Math.max(0, (martialArt.system.value - 3));
        threeOrBelowFavored += Math.min(3, martialArt.system.value);
      }
      else {
        this.object.creationData.spent.bonusPoints.abilities += (Math.max(0, (martialArt.system.value - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, martialArt.system.value);
      }
    }
    this.object.creationData.spent.abilities = threeOrBelowFavored + threeOrBelowNonFavored;
    var nonfavoredBPBelowThree = Math.max(0, (threeOrBelowNonFavored - 28));
    var favoredBPBelowThree = Math.max(0, (threeOrBelowFavored - Math.max(0, 28 - nonfavoredBPBelowThree)));
    this.object.creationData.spent.bonusPoints.abilities += favoredBPBelowThree + (nonfavoredBPBelowThree * 2);

    this.object.creationData.spent.specialties = Object.entries(this.object.character.specialties).length;
    for (let merit of Object.values(this.object.character.merits)) {
      this.object.creationData.spent.merits += merit.system.points;
    }
    this.object.creationData.spent.charms += Object.entries(this.object.character.charms).length;
    this.object.creationData.spent.charms += Object.entries(this.object.character.evocations).length;
    this.object.creationData.spent.intimacies = Object.entries(this.object.character.intimacies).length;
    this.object.creationData.spent.charms += Math.max(0, Object.entries(this.object.character.spells).length - 1) + this.object.character.randomSpells;
    this.object.creationData.spent.bonusPoints.willpower += (Math.max(0, (this.object.character.willpower - this.object.creationData.available.willpower))) * 2;
    this.object.creationData.spent.bonusPoints.merits += (Math.max(0, (this.object.creationData.spent.merits - this.object.creationData.available.merits)));
    this.object.creationData.spent.bonusPoints.specialties += (Math.max(0, (this.object.creationData.spent.specialties - this.object.creationData.available.specialties)));
    this.object.creationData.spent.bonusPoints.charms += (Math.max(0, (this.object.creationData.spent.charms - this.object.creationData.available.charms))) * 4;
    this.object.creationData.spent.bonusPoints.total = this.object.creationData.spent.bonusPoints.willpower + this.object.creationData.spent.bonusPoints.merits + this.object.creationData.spent.bonusPoints.specialties + this.object.creationData.spent.bonusPoints.abilities + this.object.creationData.spent.bonusPoints.attributes + this.object.creationData.spent.bonusPoints.charms;

    await this.render();
  }


  _onDotCounterChange(event) {
    event.preventDefault()
    const index = Number(event.currentTarget.dataset.index);
    if (this.object.character[event.currentTarget.dataset.type][event.currentTarget.dataset.name].value === 1 && index === 0) {
      this.object.character[event.currentTarget.dataset.type][event.currentTarget.dataset.name].value = 0;
    }
    else {
      this.object.character[event.currentTarget.dataset.type][event.currentTarget.dataset.name].value = index + 1;
    }
    this.onChange(event);
  }

  async randomName() {
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
    this.render();
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

  async createCharacter() {

    const itemData = [
    ];
    var actorData = this._getBaseStatblock();

    await this.getbaseCharacterData(actorData, itemData);

    actorData.system.willpower.max = this.object.character.willpower;
    actorData.system.willpower.value = this.object.character.willpower;

    actorData.system.soak.value += 0;
    actorData.system.naturalsoak.value = 0;

    var charms = game.items.filter((charm) => charm.type === 'charm' && charm.system.essence <= this.object.character.essence);

    if (this.object.character.exalt !== 'other') {
      charms = charms.filter((charm) => charm.system.charmtype === this.object.character.exalt);
    }
    const charmIds = [];
    if (charms) {
      for (var i = 0; i < this.object.character.numberTraits.randomCharms.value; i++) {
        const availableCharms = charms.filter(charm => {
          return charm.system.charmprerequisites.length === 0 || charmIds.includes(charm._id) || charm.system.charmprerequisites.some(prerequisite => charmIds.includes(prerequisite.id));
        });
        if (availableCharms.length === 0) {
          break;
        }
        var charm = duplicate(availableCharms[Math.floor(Math.random() * availableCharms.length)]);
        charmIds.push(charm._id);
        itemData.push(charm);
      }
    }

    actorData.items = itemData;
    await Actor.create(actorData);
  }

  async getbaseCharacterData(actorData, itemData) {
    actorData.name = this.object.character.name || this.object.character.defaultName;
    actorData.system.essence.value = this.object.character.essence;
    actorData.system.details.exalt = this.object.character.exalt;

    if (actorData.system.details.exalt === 'dragonblooded') {
      actorData.system.settings.hasaura = true;
    }
    if (actorData.system.details.exalt === 'mortal') {
      actorData.system.settings.showanima = false;
    }
    itemData.push({
      type: 'charm',
      img: 'icons/magic/light/explosion-star-large-orange.webp',
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
          bonusdice: 1
        }
      }
    });
    itemData.push({
      type: 'charm',
      img: 'icons/magic/light/explosion-star-large-orange.webp',
      name: 'Success Excellency',
      system: {
        description: 'Add 1 success to a roll for 2 motes.',
        ability: 'universal',
        listingname: 'Excellency',
        requirement: 1,
        essence: 1,
        cost: {
          motes: 2
        },
        diceroller: {
          bonussuccesses: 1
        }
      }
    });
    itemData.push({
      type: 'charm',
      img: 'icons/magic/light/explosion-star-large-orange.webp',
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
            defense: 1,
            resolve: 1,
            guile: 1,
          }
        }
      }
    });
    if (this.object.character.exalt === 'lunar' || this.object.character.exigent === 'architect') {
      itemData.push({
        type: 'charm',
        img: 'icons/magic/light/explosion-star-large-orange.webp',
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
              soak: 1,
            }
          }
        }
      });
      itemData.push({
        type: 'charm',
        img: 'icons/magic/light/explosion-star-large-orange.webp',
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
              bonusdice: 1,
            }
          }
        }
      });
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
    if (this.object.character.sorcerer === 'ivory') {
      spells = spells.filter((spell) => spell.system.circle === 'ivory');
    }
    if (this.object.character.sorcerer === 'shadow') {
      spells = spells.filter((spell) => spell.system.circle === 'ivory' || spell.system.circle === 'shadow');
    }
    if (this.object.character.sorcerer === 'void') {
      spells = spells.filter((spell) => spell.system.circle === 'ivory' || spell.system.circle === 'shadow' || spell.system.circle === 'void');
    }
    if (spells) {
      var loopBreaker = 0;
      for (var i = 0; i < this.object.character.randomSpells.value; i++) {
        loopBreaker = 0;
        if (i === spells.length) {
          break;
        }
        var spell = duplicate(spells[Math.floor(Math.random() * spells.length)]);
        while (itemData.find(e => e.name === spell.name) && loopBreaker < 50) {
          spell = duplicate(spells[Math.floor(Math.random() * spells.length)]);
          loopBreaker++;
        }
        itemData.push(spell);
      }
    }
    const weaponsList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/weaponsList.json', {}, { int: 30000 });
    const armorList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/armorList.json', {}, { int: 30000 });

    if (this.object.character.equipment.primaryWeapon.weight === 'medium') {
      actorData.system.parry.value++;
    }
    if (this.object.character.equipment.primaryWeapon.weight === 'heavy' && !this.object.character.equipment.primaryWeapon.artifact) {
      actorData.system.parry.value--;
    }

    if (this.object.character.equipment.primaryWeapon.type === 'random') {
      var primaryWeaponList = weaponsList;
      if (this.object.character.equipment.primaryWeapon.artifact) {
        primaryWeaponList = primaryWeaponList.filter(weapon => weapon.attunement > 0);
      }
      else {
        primaryWeaponList = primaryWeaponList.filter(weapon => weapon.attunement === 0);
      }
      if (this.object.character.equipment.primaryWeapon.weight !== 'any') {
        primaryWeaponList = primaryWeaponList.filter(weapon => weapon.weighttype === this.object.character.equipment.primaryWeapon.weight);
      }
      if (this.object.character.equipment.primaryWeapon.weaponType !== 'any') {
        primaryWeaponList = primaryWeaponList.filter(weapon => weapon.weapontype === this.object.character.equipment.primaryWeapon.weaponType);
      }
      var weapon = this._getRandomWeapon(primaryWeaponList);
      actorData.system.parry.value += weapon.system.defense;
      itemData.push(
        weapon
      );
    }
    if (this.object.character.equipment.primaryWeapon.type === 'set') {
      itemData.push(
        this._getSetWeapon(this.object.character.equipment.primaryWeapon.weaponType, this.object.character.equipment.primaryWeapon.weight, this.object.character.equipment.primaryWeapon.artifact)
      );
    }
    if (this.object.character.equipment.secondaryWeapon.type === 'random') {
      var secondaryWeaponList = weaponsList;
      if (this.object.character.equipment.secondaryWeapon.artifact) {
        secondaryWeaponList = secondaryWeaponList.filter(weapon => weapon.attunement > 0);
      }
      else {
        secondaryWeaponList = secondaryWeaponList.filter(weapon => weapon.attunement === 0);
      }
      if (this.object.character.equipment.secondaryWeapon.weight !== 'any') {
        secondaryWeaponList = secondaryWeaponList.filter(weapon => weapon.weighttype === this.object.character.equipment.secondaryWeapon.weight);
      }
      if (this.object.character.equipment.secondaryWeapon.weaponType !== 'any') {
        secondaryWeaponList = secondaryWeaponList.filter(weapon => weapon.weapontype === this.object.character.equipment.secondaryWeapon.weaponType);
      }
      itemData.push(
        this._getRandomWeapon(secondaryWeaponList)
      );
    }
    if (this.object.character.equipment.secondaryWeapon.type === 'set') {
      itemData.push(
        this._getSetWeapon(this.object.character.equipment.secondaryWeapon.weaponType, this.object.character.equipment.secondaryWeapon.weight, this.object.character.equipment.secondaryWeapon.artifact)
      );
    }
    var armor;
    if (this.object.character.equipment.armor.type === 'random') {
      var filteredArmorList = armorList;
      if (this.object.character.equipment.armor.artifact) {
        filteredArmorList = filteredArmorList.filter(armor => armor.attunement > 0);
      }
      else {
        filteredArmorList = filteredArmorList.filter(armor => armor.attunement === 0);
      }
      if (this.object.character.equipment.armor.weight !== 'any') {
        filteredArmorList = filteredArmorList.filter(armor => armor.weighttype === this.object.character.equipment.armor.weight);
      }
      armor = this._getRandomArmor(filteredArmorList)
      itemData.push(
        armor
      );
      actorData.system.soak.value = armor.system.soak;
      actorData.system.armoredsoak.value = armor.system.soak;
      actorData.system.evasion.value -= armor.system.penalty;
      actorData.system.hardness.value = armor.system.hardness;
    }
    else if (this.object.character.equipment.armor.type === 'set') {
      armor = this._getSetArmor(this.object.character.equipment.armor.weight, this.object.character.equipment.armor.artifact)
      itemData.push(
        armor
      );
      actorData.system.soak.value = armor.system.soak;
      actorData.system.armoredsoak.value = armor.system.soak;
      actorData.system.evasion.value -= armor.system.penalty;
      actorData.system.hardness.value = armor.system.hardness;
    }
    itemData.push(
      {
        type: 'weapon',
        img: "icons/svg/sword.svg",
        name: 'Unarmed',
        system: {
          witheringaccuracy: 4,
          witheringdamage: 7,
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

  _getRandomWeapon(weaponList) {
    var weapon = weaponList[Math.floor(Math.random() * weaponList.length)];
    return {
      type: 'weapon',
      img: "icons/svg/sword.svg",
      name: weapon.name,
      system: {
        witheringaccuracy: weapon.witheringaccuracy,
        witheringdamage: weapon.witheringdamage + ((weapon.traits.weapontags.value.includes('flame') || weapon.traits.weapontags.value.includes('crossbow')) ? 4 : (this.object.character.strength.value)),
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
    const equipmentChart = {
      light: {
        accuracy: 4,
        damage: 7,
        defense: 0,
        overwhelming: 1,
        attunement: 5,
      },
      medium: {
        accuracy: 2,
        damage: 9,
        defense: 1,
        overwhelming: 1,
        attunement: 5,
      },
      heavy: {
        accuracy: 0,
        damage: 11,
        defense: -1,
        overwhelming: 1,
        attunement: 5,
      },
      siege: {
        accuracy: -3,
        damage: 15,
        defense: 0,
        overwhelming: 3,
        attunement: 5,
      },
    };
    const artifactEquipmentChart = {
      light: {
        accuracy: 5,
        damage: 10,
        defense: 0,
        overwhelming: 3,
        attunement: 5,
      },
      medium: {
        accuracy: 3,
        damage: 12,
        defense: 1,
        overwhelming: 4,
        attunement: 5,
      },
      heavy: {
        accuracy: 1,
        damage: 14,
        defense: 0,
        overwhelming: 5,
        attunement: 5,
      },
      siege: {
        accuracy: -2,
        damage: 20,
        defense: 0,
        overwhelming: 5,
        attunement: 5,
      },
    };
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

    const equipmentChart = {
      light: {
        attunement: 0,
        soak: 3,
        hardness: 0,
        penalty: 0,
      },
      medium: {
        attunement: 0,
        soak: 5,
        hardness: 0,
        penalty: 1,
      },
      heavy: {
        attunement: 0,
        soak: 7,
        hardness: 0,
        penalty: 2,
      },
    };
    const artifactEquipmentChart = {
      light: {
        attunement: 4,
        soak: 5,
        hardness: 4,
        penalty: 0,
      },
      medium: {
        attunement: 5,
        soak: 8,
        hardness: 7,
        penalty: 1,
      },
      heavy: {
        attunement: 6,
        soak: 11,
        hardness: 10,
        penalty: 2,
      },
    };
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

  _getStaticValue(level) {
    return 0;
  }


  _getBaseStatblock() {
    return {
      type: 'character',
      system: {

      }
    };
  }
}
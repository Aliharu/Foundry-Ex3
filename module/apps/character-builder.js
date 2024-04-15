export default class CharacterBuilder extends FormApplication {
  constructor(app, options, object, data) {
    super(object, options);
    if (data.character) {
      this.object = data;
    }
    else {
      this.object.template = 'custom';
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
          tell: "",
          spiritShape: "",
          birthSign: "",
          exaltSign: "",
          essence: 1,
          willpower: 5,
          oxBodies: 0,
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
            },
            charisma: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Charisma',
              type: 'social',
            },
            perception: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Perception',
              type: 'mental',
            },
            dexterity: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Dexterity',
              type: 'physical',
            },
            manipulation: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Manipulation',
              type: 'social',
            },
            intelligence: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Intelligence',
              type: 'mental',
            },
            stamina: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Stamina',
              type: 'physical',
            },
            appearance: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Appearance',
              type: 'social',
            },
            wits: {
              excellency: false,
              value: 1,
              charms: {},
              name: 'Ex3.Wits',
              type: 'mental',
            }
          },
          abilities: {
            archery: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Archery",
            },
            athletics: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Athletics",
            },
            awareness: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Awareness",
            },
            brawl: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Brawl",
            },
            bureaucracy: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Bureaucracy",
            },
            craft: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Craft",
            },
            dodge: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Dodge",
            },
            integrity: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Integrity",
            },
            investigation: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Investigation",
            },
            larceny: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Larceny",
            },
            linguistics: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Linguistics",
            },
            lore: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Lore",
            },
            martialarts: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.MartialArts",
            },
            medicine: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Medicine",
            },
            melee: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Melee",
            },
            occult: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Occult",
            },
            performance: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Performance",
            },
            presence: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Presence",
            },
            resistance: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Resistance",
            },
            ride: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Ride",
            },
            sail: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Sail",
            },
            socialize: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Socialize",
            },
            stealth: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Stealth",
            },
            survival: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Survival",
            },
            thrown: {
              excellency: false,
              value: 0,
              charms: {},
              name: "Ex3.Thrown",
            },
            war: {
              excellency: false,
              value: 0,
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
          randomSpells: 0,
        }
    }
    for(let [key, ability] of Object.entries(this.object.character.abilities)) {
      for(const [maiden, list] of Object.entries(CONFIG.exaltedthird.maidenabilities)) {
        if(list.includes(key)) {
          ability.maiden = maiden;
        }
      }
    }
    this.object.unifiedCharacterCreation = game.settings.get("exaltedthird", "unifiedCharacterCreation");
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

  _getHeaderButtons() {
    let buttons = [
      {
        label: "Close",
        class: "close",
        icon: "fas fa-times",
        onclick: () => {
          let applyChanges = false;
          new Dialog({
            title: 'Close?',
            content: 'Any unsaved changed will be lost',
            buttons: {
              delete: {
                icon: '<i class="fas fa-check"></i>',
                label: 'Close',
                callback: () => applyChanges = true
              },
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel'
              },
            },
            default: "cancel",
            close: html => {
              if (applyChanges) {
                this.close();
              }
            }
          }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
        }
      }
    ];
    const saveButton = {
      label: game.i18n.localize('Ex3.Save'),
      class: 'save',
      icon: 'fas fa-dice-d6',
      onclick: async () => {
        ChatMessage.create({
          user: game.user.id,
          content: `<div>In progress character <b>${this.object.character.name || this.object.character.defaultName}</b> has been saved to this chat message</div><div><button class="resume-character">${game.i18n.localize('Ex3.Resume')}</button></div>`,
          type: CONST.CHAT_MESSAGE_TYPES.OTHER,
          flags: {
            "exaltedthird": {
              character: this.object,
            }
          },
        });
      },
    };
    const helpButton = {
      label: game.i18n.localize('Ex3.Help'),
      class: 'generator-help',
      icon: 'fas fa-question',
      onclick: async () => {
        let confirmed = false;
        const html = await renderTemplate("systems/exaltedthird/templates/dialogues/dialog-help.html", { 'link': 'https://github.com/Aliharu/Foundry-Ex3/wiki/Character-Creator' });
        new Dialog({
          title: `ReadMe`,
          content: html,
          buttons: {
            cancel: { label: "Close", callback: () => confirmed = false }
          }
        }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
      },
    };
    buttons = [saveButton, helpButton, ...buttons];
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
            points: 0,
          }
        };
      }
      await this.onChange(event);
    });

    html.find(".import-item").on("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      const itemType = event.currentTarget.dataset.item;

      let items = this._getItemList(event);

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
            if (!item.flags?.core?.sourceId) {
              item.updateSource({ "flags.core.sourceId": item.uuid });
            }
            const newItem = duplicate(item);
            newItem.itemCount = 1;
            this.getEnritchedHTML(newItem);
            if (item.type === 'ritual') {
              this.object.character.ritual = newItem;
            }
            else {
              this.object.character[type][Object.entries(this.object.character[type]).length] = newItem;
            }

            this.onChange(ev);
            html.find('.closeImportItem').trigger('click');
          });

          html.find('.collapsable').click(ev => {
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
        const items = this._getItemList(event);
        var item = items[Math.floor(Math.random() * items.length)];
        if (item) {
          if (!item.flags?.core?.sourceId) {
            item.updateSource({ "flags.core.sourceId": item.uuid });
          }
          const newItem = duplicate(item);
          newItem.itemCount = 1;
          this.getEnritchedHTML(newItem);

          if (item.type === 'ritual') {
            this.object.character.ritual = newItem;
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
      await this.onChange(event);
    });

    html.find(".delete-item").on("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      if (type === 'ritual') {
        this.object.character.ritual = {
          name: '',
        }
      }
      else {
        delete this.object.character[type][event.currentTarget.dataset.index];
      }
      await this.onChange(event);
    });

    html.find(".delete-sublist-charm").on("click", async (event) => {
      const sublistkey = event.currentTarget.dataset.sublistkey;
      const type = event.currentTarget.dataset.type;
      const charm = this.object.character[type][sublistkey].charms[event.currentTarget.dataset.index];

      let index = null;
      for (const [key, value] of Object.entries(this.object.character.charms)) {
        if (value === charm) {
          index = key;
          break;
        }
      }
      if (index) {
        delete this.object.character.charms[index];
        await this.onChange(event);
      }
    });

    html.find(".delete-ability-item").on("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      if (type === 'ritual') {
        this.object.character.ritual = {
          name: '',
        }
      }
      else {
        delete this.object.character[type][event.currentTarget.dataset.index];
      }
      await this.onChange(event);
    });


    html.find(".lower-charm-count").on("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      const index = event.currentTarget.dataset.index;
      if (this.object.character[type][index].itemCount > 0) {
        this.object.character[type][index].itemCount--;
      }
      await this.onChange(event);
    });

    html.find(".add-charm-count").on("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      const index = event.currentTarget.dataset.index;
      this.object.character[type][index].itemCount++;
      await this.onChange(event);
    });

    html.find('.item-row').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    const itemToItemAssociation = new DragDrop({
      dragSelector: null,
      dropSelector: null,
      permissions: { dragstart: true, drop: true },
      callbacks: { drop: this._onDropItem.bind(this) },
    });
    itemToItemAssociation.bind(html[0]);
  }

  _getItemList(event) {
    const type = event.currentTarget.dataset.type;
    const itemType = event.currentTarget.dataset.item;
    let items = game.items.filter(charm => charm.type === itemType);
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
        if (this.object.exalt === 'exigent') {
          items = items.filter(charm => charm.system.charmtype === this.object.character.exigent);
        } else {
          items = items.filter(charm => charm.system.charmtype === this.object.character.exalt);
        }
        archetypeCharms = items.filter(charm => charm.system.archetype.ability);
        if (event.currentTarget.dataset.ability) {
          items = items.filter(charm => charm.system.ability === event.currentTarget.dataset.ability);
          archetypeCharms = archetypeCharms.filter(charm => {
            if (charm.system.archetype.ability === "combat") {
              return ['archery', 'brawl', 'melee', 'thrown', 'war'].includes(event.currentTarget.dataset.ability);
            }
            return charm.system.archetype.ability === event.currentTarget.dataset.ability;
          });
        }
        items = items.filter(charm => {
          if (this.object.character.attributes[charm.system.ability]) {
            return charm.system.requirement <= this.object.character.attributes[charm.system.ability].value;
          }
          if (this.object.character.abilities[charm.system.ability]) {
            return charm.system.requirement <= this.object.character.abilities[charm.system.ability].value;
          }
          if (CONFIG.exaltedthird.maidens.includes(charm.system.ability)) {
            return charm.system.requirement <= this._getHighestMaidenAbility(charm.system.ability);
          }
          return true;
        });
        archetypeCharms = archetypeCharms.filter(charm => charm.system.archetype.ability).filter(charm => {
          if (charm.system.archetype.ability === "combat") {
            return charm.system.requirement <= Math.max(this.object.character.abilities['archery'].value, this.object.character.abilities['brawl'].value, this.object.character.abilities['melee'].value, this.object.character.abilities['thrown'].value, this.object.character.abilities['war'].value);
          }
          if (this.object.character.attributes[charm.system.archetype.ability]) {
            return charm.system.requirement <= this.object.character.attributes[charm.system.archetype.ability].value;
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
        items = items.filter(charm => charm.system.charmtype === 'other' || charm.system.charmtype === 'eclipse');
      }
      else {
        items = items.filter(charm => charm.system.charmtype === 'evocation');
        items = items.filter(charm => {
          var returnVal = false;
          if (charm.system.parentitemid) {
            if (Object.values(this.object.character.weapons).some(weapon => weapon._id === charm.system.parentitemid)) {
              returnVal = true;
            }
            if (Object.values(this.object.character.armor).some(armor => armor._id === charm.system.parentitemid)) {
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
      this.getEnritchedHTML(item);
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

  _getMaidenCharmsNumber(maiden) {
    const abilityList = CONFIG.exaltedthird.maidenabilities[maiden];
    return (Object.values(this.object.character.charms)?.filter(numberCharm => abilityList.includes(numberCharm.system.ability)).length || 0)
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

    const newItem = duplicate(itemObject);

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

    this.onChange(null);
  }

  importItemFromCollection(collection, entryId) {
    const pack = game.packs.get(collection);
    if (pack.documentName !== "Item") return;
    return pack.getDocument(entryId).then((ent) => {
      return ent;
    });
  }

  async getEnritchedHTML(item) {
    item.enritchedHTML = await TextEditor.enrichHTML(item.system.description, { async: true, secrets: true, relativeTo: item });
  }

  async onChange(ev) {
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

    const oxBodyAvailable = [
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

    this.object.oxBodyEnabled = (oxBodyAvailable.includes(this.object.character.exalt) || oxBodyAvailable.includes(this.object.character.exigent));

    this.object.character.maidenCharms = {
      journeys: this._getMaidenCharmsNumber('journeys'),
      serenity: this._getMaidenCharmsNumber('serenity'),
      battles: this._getMaidenCharmsNumber('battles'),
      secrets: this._getMaidenCharmsNumber('secrets'),
      endings: this._getMaidenCharmsNumber('endings'),
    }

    this._calculateSpentExperience(ev);

    const categories = [...Object.entries(this.object.character.abilities), ...Object.entries(this.object.character.attributes)];

    for (const [key, category] of categories) {
      category.charms = Object.values(this.object.character.charms).filter(charm => charm.system.ability === key);
    }

    await this.render();
  }

  _calculateSpentExperience(ev) {
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
    }
    if (this.object.character.exalt === 'solar' || this.object.character.exalt === 'abyssal') {
      this.object.creationData.available.casteAbilities = 5;
    }
    if (ev?.target?.name === 'object.character.caste') {
      for (let [key, attribute] of Object.entries(this.object.character.attributes)) {
        if (casteAbilitiesMap[this.object.character.caste.toLowerCase()]?.includes(key)) {
          attribute.favored = true;
          attribute.caste = true;
        }
        else {
          attribute.favored = false;
          attribute.caste = false;
        }
      }
      for (let [key, ability] of Object.entries(this.object.character.abilities)) {
        if (casteAbilitiesMap[this.object.character.caste.toLowerCase()]?.includes(key)) {
          if (this.object.character.exalt !== 'solar' && this.object.character.exalt !== 'abyssal') {
            ability.favored = true;
          }
          ability.caste = true;
        }
        else {
          ability.favored = false;
          ability.caste = false;
        }
      }
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
    if (this.object.character.exalt === 'sidereal') {
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
        abilities: 0,
        attributes: 0,
        specialties: 0,
        merits: 0,
        charms: 0,
        willpower: 0,
        total: 0,
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
    var favoredCharms = 0;
    var nonFavoredCharms = 0;
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
    var favoredAttributesSpent = 0;
    var unFavoredAttributesSpent = 0;
    var tertiaryAttributes = 0;
    var nonTertiaryAttributes = 0;
    var threeOrBelowFavored = 0;
    var threeOrBelowNonFavored = 0;
    var aboveThreeFavored = 0;
    var aboveThreeUnFavored = 0;
    for (let [key, attribute] of Object.entries(this.object.creationData.spent.attributes)) {
      if (this.object.creationData[key] === 'tertiary') {
        tertiaryAttributes += Math.max(0, this.object.creationData.spent.attributes[key] - this.object.creationData.available.attributes[key]);
      }
      else {
        nonTertiaryAttributes += Math.max(0, this.object.creationData.spent.attributes[key] - this.object.creationData.available.attributes[key]);
      }
      unFavoredAttributesSpent += Math.max(0, attributesSpent[key].unFavored - this.object.creationData.available.attributes[key]);
      favoredAttributesSpent += Math.max(0, attributesSpent[key].favored - Math.max(0, this.object.creationData.available.attributes[key] - attributesSpent[key].unFavored));
    }
    for (let [key, ability] of Object.entries(this.object.character.abilities)) {
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

      if (!casteAbilitiesMap[this.object.character.caste.toLowerCase()]?.includes(key) && ability.favored && key !== 'martialarts') {
        this.object.creationData.spent.favoredAbilities++;
      }
      else if (casteAbilitiesMap[this.object.character.caste.toLowerCase()]?.includes(key) && ability.favored && key !== 'martialarts') {
        this.object.creationData.spent.casteAbilities++;
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

    for (const [key, charm] of Object.entries(this.object.character.charms)) {
      if (this.object.character.attributes[charm.system.ability] && this.object.character.attributes[charm.system.ability].favored) {
        favoredCharms += charm.itemCount;
      } else if (this.object.character.abilities[charm.system.ability] && this.object.character.abilities[charm.system.ability].favored) {
        favoredCharms += charm.itemCount;
      }
      else if (CONFIG.exaltedthird.maidens.includes(charm.system.ability) && charm.system.ability === this.object.character.caste) {
        favoredCharms += charm.itemCount
      }
      else {
        nonFavoredCharms += charm.itemCount;
      }
    }
    favoredCharms += Object.entries(this.object.character.evocations).length;
    nonFavoredCharms += Object.entries(this.object.character.otherCharms).length;
    if (this.object.character.abilities.martialarts.favored) {
      favoredCharms += Object.entries(this.object.character.martialArtsCharms).length;
    }
    else {
      nonFavoredCharms += Object.entries(this.object.character.martialArtsCharms).length;
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
    this.object.creationData.spent.bonusPoints.willpower += (Math.max(0, (this.object.character.willpower - this.object.creationData.available.willpower))) * 2;
    this.object.creationData.spent.bonusPoints.merits += (Math.max(0, (this.object.creationData.spent.merits - this.object.creationData.available.merits)));
    this.object.creationData.spent.bonusPoints.specialties += (Math.max(0, (this.object.creationData.spent.specialties - this.object.creationData.available.specialties)));
    this.object.creationData.spent.bonusPoints.charms += totalNonFavoredCharms * 5;
    this.object.creationData.spent.bonusPoints.charms += totalFavoredCharms * 4;
    this.object.creationData.spent.bonusPoints.total = this.object.creationData.spent.bonusPoints.willpower + this.object.creationData.spent.bonusPoints.merits + this.object.creationData.spent.bonusPoints.specialties + this.object.creationData.spent.bonusPoints.abilities + this.object.creationData.spent.bonusPoints.attributes + this.object.creationData.spent.bonusPoints.charms;

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
    this._getCharacterCharms(itemData);
    await this._getCharacterSpells(itemData);
    await this._getCharacterEquipment(actorData, itemData);

    actorData.items = itemData;
    if (game.user.isGM) {
      var actor = await Actor.create(actorData);
      actor.calculateAllDerivedStats();
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
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    });
  }

  async getbaseCharacterData(actorData, itemData) {
    actorData.name = this.object.character.name || this.object.character.defaultName;
    actorData.prototypeToken.name = this.object.character.name || this.object.character.defaultName;
    actorData.system.essence.value = this.object.character.essence;
    actorData.system.details.exalt = this.object.character.exalt;
    actorData.system.details.caste = this.object.character.caste;
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
    }
    if (actorData.system.details.exalt === 'mortal') {
      actorData.system.settings.showanima = false;
    }

    if (this.object.character.oxBodies > 0) {
      const oxBodyChart = CONFIG.exaltedthird.oxBody;
      if (oxBodyChart[this.object.character.exalt]) {
        if (this.object.character.attributes.stamina.value < 3) {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exalt].zero.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exalt].zero.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exalt].zero.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exalt].zero.four * this.object.character.oxBodies);
        }
        else if (this.object.character.attributes.stamina.value < 5) {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exalt].three.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exalt].three.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exalt].three.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exalt].three.four * this.object.character.oxBodies);
        }
        else {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exalt].five.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exalt].five.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exalt].five.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exalt].five.four * this.object.character.oxBodies);
        }
      }
      if (oxBodyChart[this.object.character.exigent]) {
        if (this.object.character.attributes.stamina.value < 3) {
          actorData.system.health.levels.zero.value += (oxBodyChart[this.object.character.exigent].zero.zero * this.object.character.oxBodies);
          actorData.system.health.levels.one.value += (oxBodyChart[this.object.character.exigent].zero.one * this.object.character.oxBodies);
          actorData.system.health.levels.two.value += (oxBodyChart[this.object.character.exigent].zero.two * this.object.character.oxBodies);
          actorData.system.health.levels.four.value += (oxBodyChart[this.object.character.exigent].zero.four * this.object.character.oxBodies);
        }
        else if (this.object.character.attributes.stamina.value < 5) {
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

    actorData.system.settings.sorcerycircle = this.object.character.sorcerer;
    actorData.system.settings.necromancycircle = this.object.character.necromancer;

    for (let [key, attribute] of Object.entries(this.object.character.attributes)) {
      actorData.system.attributes[key].value = attribute.value;
      actorData.system.attributes[key].favored = attribute.favored;
      if (this.object.character.exalt === 'lunar') {
        if (attribute.favored && (attribute.value >= 3 || (Object.entries(attribute.charms).length > 0))) {
          actorData.system.attributes[key].excellency = true;
        }
        else if (attribute.value >= 5 || (Object.entries(attribute.charms).length >= 3)) {
          actorData.system.attributes[key].excellency = true;
        }
      }
    }

    for (let [key, ability] of Object.entries(this.object.character.abilities)) {
      actorData.system.abilities[key].value = ability.value;
      actorData.system.abilities[key].favored = ability.favored;
      if (((Object.entries(ability.charms).length > 0) || (ability.favored && ability.value > 0)) && (this.object.character.exalt === 'solar' || this.object.character.exalt === 'sidereal')) {
        actorData.system.abilities[key].excellency = true;
      }
      if (Object.values(ability.charms).some(charm => charm.system.ability === key && charm.system.keywords.toLowerCase().includes('excellency'))) {
        actorData.system.abilities[key].excellency = true;
      }
    }

    actorData.system.charcreation.physical = this.object.creationData.physical;
    actorData.system.charcreation.mental = this.object.creationData.mental;
    actorData.system.charcreation.social = this.object.creationData.social;

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

  async _getCharacterEquipment(actorData, itemData) {
    const weaponsList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/weaponsList.json', {}, { int: 30000 });
    const armorList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/armorList.json', {}, { int: 30000 });

    for (const weapon of Object.values(this.object.character.weapons)) {
      itemData.push(duplicate(weapon));
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
      itemData.push(duplicate(armor));
    }
    for (const item of Object.values(this.object.character.items)) {
      itemData.push(duplicate(item));
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

  _getCharacterCharms(itemData) {
    if (this.object.character.exalt !== 'mortal' && this.object.character.exalt !== 'dragonblooded') {
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
            bonusdice: "1"
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
              defense: "1",
              resolve: "1",
              guile: "1",
            }
          }
        }
      });
    }


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
              soak: "1",
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
              bonusdice: "1",
            }
          }
        }
      });
    }

    if (this.object.character.exalt === 'sidereal') {
      itemData.push({
        type: 'charm',
        img: 'icons/magic/light/explosion-star-large-orange.webp',
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
          }
        }
      });
    }

    for (const charm of Object.values(this.object.character.charms)) {
      itemData.push(duplicate(charm));
    }

    for (const evocation of Object.values(this.object.character.evocations)) {
      itemData.push(duplicate(evocation));
    }

    for (const otherCharm of Object.values(this.object.character.otherCharms)) {
      itemData.push(duplicate(otherCharm));
    }

    for (const martialArtsCharm of Object.values(this.object.character.martialArtsCharms)) {
      itemData.push(duplicate(martialArtsCharm));
    }

    var baseCharms = game.items.filter((charm) => charm.type === 'charm' && (charm.system.essence <= this.object.character.essence || this.object.character.supernal === charm.system.ability));

    baseCharms = baseCharms.filter((charm) => charm.system.charmtype === this.object.character.exalt || charm.system.charmtype === 'martialarts');
  }

  async _getCharacterSpells(itemData) {
    if (this.object.character.ritual.name) {
      if (this.object.character.ritual._id) {
        itemData.push(await duplicate(this.object.character.ritual));
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
    for (const spell of Object.values(this.object.character.spells)) {
      itemData.push(await duplicate(spell));
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
        var spell = await duplicate(spells[Math.floor(Math.random() * spells.length)]);
        while (itemData.find(e => e.name === spell.name) && loopBreaker < 50) {
          spell = await duplicate(spells[Math.floor(Math.random() * spells.length)]);
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
        witheringdamage: weapon.witheringdamage + ((weapon.traits.weapontags.value.includes('flame') || weapon.traits.weapontags.value.includes('crossbow')) ? 4 : (this.object.character.attributes.strength.value)),
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
      type: 'character'
    }).toObject();
  }
}
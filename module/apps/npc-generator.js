export default class NPCGenerator extends FormApplication {
  constructor(app, options, object, data) {
    super(object, options);
    this.object.template = 'custom';
    this.object.poolNumbers = 'mid';
    this.object.availableCastes = {};
    this.object.character = {
      name: '',
      defaultName: 'New NPC',
      npcType: "mortal",
      exalt: "other",
      caste: "",
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
      homebrew: {
        specialAbilities: 0,
      },
      equipment: {
        primaryWeapon: {
          "type": "random",
          "weaponType": "any",
          "weight": "any",
          "artifact": false,
        },
        secondaryWeapon: {
          "type": "random",
          "weaponType": "any",
          "weight": "any",
          "artifact": false,
        },
        armor: {
          "type": "random",
          "weight": "any",
          "artifact": false,
        }
      },
      sorcerer: 'none',
      battlegroup: false,
      battlegroupStats: {
        size: 1,
        might: 0,
        drill: 0,
      },
      numberTraits: {
        randomCharms: { label: 'Ex3.RandomCharms', value: 0 },
        randomMutations: { label: 'Ex3.RandomMutations', value: 0 },
        randomSpells: { label: 'Ex3.RandomSpells', value: 0 },
      },
      traits: {
        commander: { label: 'Ex3.Commander', value: false },
        godOrDemon: { label: 'Ex3.God/Demon', value: false },
        legendarySize: { label: 'Ex3.LegendarySize', value: false },
        poisoner: { label: 'Ex3.Poisoner', value: false },
        martialArtist: { label: 'Ex3.MartialArtist', value: false },
        motePool: { label: 'Ex3.MotePool', value: false },
        spirit: { label: 'Ex3.Spirit', value: false },
        strikingAppearance: { label: 'Ex3.StrikingAppearance', value: false },
        stealthy: { label: 'Ex3.Stealthy', value: false },
        wealthy: { label: 'Ex3.Wealthy', value: false },
      }
    }
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      popOut: true,
      template: "systems/exaltedthird/templates/dialogues/npc-generator.html",
      id: "ex3-npc-generator",
      title: `Random NPC Generator`,
      width: 750,
      height: 1100,
      resizable: true,
      submitOnChange: true,
      closeOnSubmit: false
    });
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    const helpButton = {
      label: game.i18n.localize('Ex3.Help'),
      class: 'npc-generator-help',
      icon: 'fas fa-question',
      onclick: async () => {
        let confirmed = false;
        const html = await renderTemplate("systems/exaltedthird/templates/dialogues/npc-generator-help.html");
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

    html.on("change", "#exalt", async ev => {
      if(CONFIG.exaltedthird.castes[this.object.character.exalt]) {
        this.object.availableCastes = CONFIG.exaltedthird.castes[this.object.character.exalt];
      }
      this.render();
    });

    html.on("change", "#template", async ev => {
      const templateNPCs = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/NPCTemplates.json', {}, { int: 30000 });
      var oldName = this.object.character.name;
      this.object.character = templateNPCs[this.object.template];
      this.object.character.name = oldName;
      this.render();
    });

    html.on("change", ".rerender", ev => {
      this.render();
    });


    html.find("#generate").on("click", async (event) => {
      this.createNPC();
    });
  }

  async createNPC() {
    const martialArts = [
      "Snake Style",
      "Tiger Style",
      "Single Point Shining Into the Void Style",
      "White Reaper Style",
      "Ebon Shadow Style",
      "Crane Style",
      "Silver-Voiced Nightingale Style",
      "Righteous Devil Style",
      "Black Claw Style",
      "Dreaming Pearl Courtesan Style",
      "Steel Devil Style",
      "Air Dragon Style",
      "Earth Dragon Style",
      "Fire Dragon Style",
      "Water Dragon Style",
      "Wood Dragon Style",
      "Golden Janissary Style",
      "Mantis Style",
      "White Veil Style",
      "Centipede Style",
      "Falcon Style",
      "Laughing Monster Style",
      "Swaying Grass Style",
      "Throne Shadow Style",
      "Violet Bier of Sorrows Style"
    ];
    const poisons = [
      '3i/round, (L in Crash) 5 rounds, -2, Damage or ingestion',
      '2L/day, 7 days -0, Ingestion',
      '1i/round, (B in Crash) 10 rounds, -2, Damage',
      '2L/hour, 5 hours, -4, Ingestion',
      '2i/round, (L in Crash), 3 rounds, -3, Damage',
      '1L/minute, 10 minutes, -5, Damage',
    ]
    const attributeAbilityMap = {
      "weak": 1,
      "skilled": 3,
      "exceptional": 4,
      "legendary": 5,
    }

    var charmToPoolMap = {
      archery: 'combat',
      athletics: 'strength',
      awareness: 'perception',
      brawl: 'combat',
      bureaucracy: 'mind',
      craft: 'mind',
      dodge: 'agility',
      integrity: 'mind',
      investigation: 'social',
      larceny: 'agility',
      linguistics: 'mind',
      lore: 'mind',
      medicine: 'mind',
      melee: 'combat',
      occult: 'mind',
      performance: 'social',
      presence: 'social',
      resistance: 'body',
      ride: 'agility',
      sail: 'agility',
      socialize: 'social',
      stealth: 'agility',
      survival: 'body',
      thrown: 'combat',
      war: 'combat',
      strength: 'strength',
      dexterity: 'agility',
      stamina: 'body',
      appearance: 'social',
      charisma: 'social',
      manipulation: 'social',
      wits: 'mind',
      perception: 'perception',
      intelligence: 'mind',
    }

    const willpowerMap = {
      "weak": 3,
      "skilled": 5,
      "exceptional": 7,
      "legendary": 10,
    }

    const itemData = [
    ];
    //Skills
    //Weak, Skilled, Exceptional, Legendary 
    var actorData = this._getBaseStatBlock();

    actorData.name = this.object.character.name || this.object.character.defaultName;
    actorData.system.essence.value = this.object.character.essence;
    actorData.system.creaturetype = this.object.character.npcType;
    actorData.system.details.exalt = this.object.character.exalt;

    //Do Motes
    if(this.object.character.traits.motePool.value) {
      actorData.system.motes.personal.max = actorData.system.essence.value * 10;
      actorData.system.motes.personal.value = actorData.system.essence.value * 10;
      if (this.object.character.traits.spirit.value) {
        actorData.system.motes.personal.value += 50;
        actorData.system.motes.personal.max += 50;
      }
    }
    if (this.object.character.npcType === 'exalt') {
      actorData.system.motes.personal.value = this.calculateMaxExaltedMotes('personal', actorData.system.details.exalt, actorData.system.essence.value) - actorData.system.motes.peripheral.committed;
      actorData.system.motes.personal.max = this.calculateMaxExaltedMotes('personal', actorData.system.details.exalt, actorData.system.essence.value);
      actorData.system.motes.peripheral.value = this.calculateMaxExaltedMotes('peripheral', actorData.system.details.exalt, actorData.system.essence.value - actorData.system.motes.peripheral.committed);
      actorData.system.motes.peripheral.max = this.calculateMaxExaltedMotes('peripheral', actorData.system.details.exalt, actorData.system.essence.value);
      if(actorData.system.details.exalt === 'dragonblooded') {
        actorData.system.settings.hasaura = true;
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
      if(this.object.character.exalt === 'lunar') {
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
    }
    if (this.object.character.traits.commander.value) {
      actorData.system.pools.command.value = this._getCharacterPool(this.object.character.skills.combat.value);
    }
    actorData.system.pools.grapple.value = this._getCharacterPool(this.object.character.skills.strength.value);
    actorData.system.pools.joinbattle.value = this._getCharacterPool(this.object.character.skills.perception.value);
    actorData.system.pools.movement.value = this._getCharacterPool(this.object.character.skills.agility.value);
    actorData.system.pools.readintentions.value = this._getCharacterPool(this.object.character.skills.perception.value);
    actorData.system.pools.social.value = this._getCharacterPool(this.object.character.skills.social.value);
    if (this.object.character.sorcerer !== 'none') {
      actorData.system.pools.sorcery.value = this._getCharacterPool(this.object.character.skills.mind.value);
    }
    actorData.system.pools.social.value = this._getCharacterPool(this.object.character.skills.social.value);

    actorData.system.parry.value = this._getStaticValue(this.object.character.skills.combat.value);
    actorData.system.evasion.value = this._getStaticValue(this.object.character.skills.agility.value);
    actorData.system.resolve.value = this._getStaticValue(this.object.character.skills.mind.value);
    actorData.system.guile.value = this._getStaticValue(this.object.character.skills.social.value);

    actorData.system.willpower.max = willpowerMap[this.object.character.skills.willpower.value];
    actorData.system.willpower.value = willpowerMap[this.object.character.skills.willpower.value];
    actorData.system.legendarysize = this.object.character.traits.legendarySize.value;

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
        name: 'Resistance',
        system: {
          value: this._getCharacterPool(this.object.character.skills.body.value)
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
    if (this.object.character.traits.martialArtist.value) {
      const randomMartialArts = martialArts[Math.floor(Math.random() * martialArts.length)]
      itemData.push(
        {
          type: 'action',
          name: randomMartialArts,
          system: {
            value: this._getCharacterPool(this.object.character.skills.combat.value)
          }
        }
      )
    }
    const animaList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/animaEffectsList.json', {}, { int: 30000 });
    const weaponsList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/weaponsList.json', {}, { int: 30000 });
    const mutationsList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/mutations.json', {}, { int: 30000 });
    const armorList = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/armorList.json', {}, { int: 30000 });
    const sorcerousRituals = await foundry.utils.fetchJsonWithTimeout('systems/exaltedthird/module/data/sorcerousRituals.json', {}, { int: 30000 });

    let bigString = '';

    for(const ritual of sorcerousRituals) {
      bigString += ritual.name;
      bigString += '\n';
      bigString += ritual.pageref;
      bigString += '\n\n';
    }

    if(animaList[this.object.character.caste]) {
      actorData.system.anima.passive = animaList[this.object.character.caste][0];
      actorData.system.anima.active = animaList[this.object.character.caste][1];
      actorData.system.anima.iconic = animaList[this.object.character.caste][2];
    }
    else {
      actorData.system.settings.showanima = false;
    }

    if (this.object.character.traits.martialArtist.value) {
      const randomMartialArts = martialArts[Math.floor(Math.random() * martialArts.length)]
      itemData.push(
        {
          type: 'action',
          name: randomMartialArts,
          system: {
            value: this._getCharacterPool(this.object.character.skills.combat.value)
          }
        }
      )
    }


    if (this.object.character.sorcerer !== 'none') {
      const itemRituals = game.items.filter((item) => item.type === 'ritual');

      if (itemRituals) {
        var ritual = duplicate(itemRituals[Math.floor(Math.random() * itemRituals.length)]);
        itemData.push(ritual);
      }
      else {
        const randomRitual = sorcerousRituals[Math.floor(Math.random() * sorcerousRituals.length)];
        itemData.push(
          {
            type: 'ritual',
            name: randomRitual.name,
            system: {
              description: `Page Reference ${randomRitual.pageref}`,
            }
          }
        )
      }
    }

    if (this.object.character.equipment.primaryWeapon.weight === 'medium') {
      actorData.system.parry.value++;
    }
    if (this.object.character.equipment.primaryWeapon.weight === 'heavy' && !this.object.character.equipment.primaryWeapon.artifact) {
      actorData.system.parry.value--;
    }

    if (this.object.character.equipment.primaryWeapon.type === 'random') {
      var primaryWeaponList = weaponsList;
      if(this.object.character.equipment.primaryWeapon.artifact) {
        primaryWeaponList = primaryWeaponList.filter(weapon => weapon.attunement > 0);
      }
      else {
        primaryWeaponList = primaryWeaponList.filter(weapon => weapon.attunement === 0);
      }
      if(this.object.character.equipment.primaryWeapon.weight !== 'any') {
        primaryWeaponList = primaryWeaponList.filter(weapon => weapon.weighttype === this.object.character.equipment.primaryWeapon.weight);
      }
      if(this.object.character.equipment.primaryWeapon.weaponType !== 'any') {
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
      if(this.object.character.equipment.secondaryWeapon.artifact) {
        secondaryWeaponList = secondaryWeaponList.filter(weapon => weapon.attunement > 0);
      }
      else {
        secondaryWeaponList = secondaryWeaponList.filter(weapon => weapon.attunement === 0);
      }
      if(this.object.character.equipment.secondaryWeapon.weight !== 'any') {
        secondaryWeaponList = secondaryWeaponList.filter(weapon => weapon.weighttype === this.object.character.equipment.secondaryWeapon.weight);
      }
      if(this.object.character.equipment.secondaryWeapon.weaponType !== 'any') {
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
      if(this.object.character.equipment.armor.artifact) {
        filteredArmorList = filteredArmorList.filter(armor => armor.attunement > 0);
      }
      else {
        filteredArmorList = filteredArmorList.filter(armor => armor.attunement === 0);
      }
      if(this.object.character.equipment.armor.weight !== 'any') {
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
          witheringaccuracy: 4 + this._getCharacterPool(this.object.character.skills.combat.value),
          witheringdamage: 7 + attributeAbilityMap[this.object.character.skills.strength.value],
          overwhelming: 1,
          defense: 0,
          weapontype: 'melee',
          weighttype: 'light',
          ability: "none",
          attribute: "none",
        }
      }
    );
    itemData.push(
      {
        type: 'weapon',
        img: "icons/svg/sword.svg",
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
    actorData.system.soak.value += attributeAbilityMap[this.object.character.skills.body.value];
    actorData.system.naturalsoak.value = attributeAbilityMap[this.object.character.skills.body.value];

    for (var i = 0; i < this.object.character.numberTraits.randomMutations.value; i++) {
      var mutation = mutationsList[Math.floor(Math.random() * mutationsList.length)];
      var meritRating = mutation.dotValues[Math.floor(Math.random() * mutation.dotValues.length)]
      itemData.push(
        {
          type: 'merit',
          img: "icons/svg/aura.svg",
          name: mutation.name,
          system: {
            description: mutation.pageref,
            points: meritRating,
          }
        }
      );
    }
    if (this.object.character.traits.wealthy.value) {
      itemData.push(
        {
          type: 'merit',
          img: "icons/svg/coins.svg",
          name: 'Resources',
          system: {
            points: 3,
          }
        }
      );
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
      for (var i = 0; i < this.object.character.numberTraits.randomSpells.value; i++) {
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

    var charms = game.items.filter((charm) => charm.type === 'charm'
      && charm.system.ability !== 'evocation'
      && charm.system.charmtype !== 'martialarts'
      && this.object.character.skills[charmToPoolMap[charm.system.ability]]?.value !== 'weak'
      && charm.system.essence <= this.object.character.essence && charm.system.requirement <= (attributeAbilityMap[this.object.character.skills[charmToPoolMap[charm.system.ability]]?.value] || 0));

    charms = charms.filter(charm => (charm.system.ability !== 'thrown' || itemData.find(item => item.system.weapontype === 'thrown')));
    charms = charms.filter(charm => (charm.system.ability !== 'melee' || itemData.find(item => item.system.weapontype === 'melee')));
    charms = charms.filter(charm => (charm.system.ability !== 'archery' || itemData.find(item => item.system.weapontype === 'ranged')));
    if (this.object.character.exalt !== 'other') {
      charms = charms.filter((charm) => charm.system.charmtype === this.object.character.exalt);
    }
    const charmIds = [];
    if (charms) {
      for (var i = 0; i < this.object.character.numberTraits.randomCharms.value; i++) {
        const availableCharms = charms.filter(charm => {
          return charm.system.charmprerequisites.length === 0 || charmIds.includes(charm._id) || charm.system.charmprerequisites.some(prerequisite => charmIds.includes(prerequisite.id));
        });
        if(availableCharms.length === 0) {
          break;
        }
        var charm = duplicate(availableCharms[Math.floor(Math.random() * availableCharms.length)]);
        charmIds.push(charm._id);
        itemData.push(charm);
      }
    }
    if(this.object.character.traits.godOrDemon.value) {
      itemData.push({
        type: 'charm',
        img: "icons/svg/explosion.svg",
        name: "Hurry Home",
        system: {
          description: "The Spirit dissapear on their next turn, returns to a specific location such as their sactum or their summoners side.",
          type: 'Simple',
          duration: "Instant",
          ability: "other",
          essence: 1,
          cost: {
            motes: 10,
            willpower: 1,
          }
        },
      });
      itemData.push({
        type: 'charm',
        img: "icons/svg/explosion.svg",
        name: "Materialize",
        system: {
          description: "The spirit materializes.",
          type: 'Simple',
          duration: "Instant",
          ability: "other",
          essence: 1,
          cost: {
            motes: Math.floor(actorData.system.motes.personal.value / 2),
            willpower: 1,
          }
        },
      });
      itemData.push({
        type: 'charm',
        img: "icons/svg/explosion.svg",
        name: "Measure the Wind",
        system: {
          description: "The spirit discerns the nature of being based on a prequisite or when they take a certain action in the spririt's precense.",
          type: 'Simple',
          duration: "Instant",
          ability: "other",
          essence: 1,
          cost: {
            motes: 5,
          }
        },
      });
    }

    actorData.items = itemData;
    await Actor.create(actorData);
  }

  _getRandomWeapon(weaponList) {
    const attributeAbilityMap = {
      "weak": 1,
      "skilled": 3,
      "exceptional": 4,
      "legendary": 5,
    }
    var weapon = weaponList[Math.floor(Math.random() * weaponList.length)];
    return {
      type: 'weapon',
      img: "icons/svg/sword.svg",
      name: weapon.name,
      system: {
        witheringaccuracy: weapon.witheringaccuracy + this._getCharacterPool(this.object.character.skills.combat.value),
        witheringdamage: weapon.witheringdamage + ((weapon.traits.weapontags.value.includes('flame') || weapon.traits.weapontags.value.includes('crossbow')) ? 4 : attributeAbilityMap[this.object.character.skills.strength.value]),
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
    weaponData.system.witheringaccuracy += this._getCharacterPool(this.object.character.skills.combat.value);
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

  calculateMaxExaltedMotes(moteType, exaltType, essenceLevel) {
    var maxMotes = 0;
    if (moteType === 'personal') {
      if (exaltType === 'solar' || exaltType === 'abyssal') {
        maxMotes = 10 + (essenceLevel * 3);
      }
      if (exaltType === 'dragonblooded') {
        maxMotes = 11 + essenceLevel;
      }
      if (exaltType === 'lunar') {
        maxMotes = 15 + essenceLevel;
      }
      if (exaltType === 'exigent') {
        maxMotes = 11 + essenceLevel;
      }
      if (exaltType === 'sidereal') {
        maxMotes = 9 + (essenceLevel * 2);
      }
      if (exaltType === 'liminal') {
        maxMotes = 10 + (essenceLevel * 3);
      }
      if (exaltType === 'other') {
        maxMotes = 10 * essenceLevel;
      }
      if (exaltType === 'dreamsouled') {
        maxMotes = 11 + essenceLevel;
      }
      if (exaltType === 'hearteater' || exaltType === 'umbral') {
        maxMotes = 11 + (essenceLevel * 2);
      }
    }
    else {
      if (exaltType === 'solar' || exaltType === 'abyssal') {
        maxMotes = 26 + (essenceLevel * 7);
      }
      if (exaltType === 'dragonblooded') {
        maxMotes = 23 + (essenceLevel * 4);
      }
      if (exaltType === 'lunar') {
        maxMotes = 34 + (essenceLevel * 4);
      }
      if (exaltType === 'exigent') {
        maxMotes = 23 + (essenceLevel * 4);
      }
      if (exaltType === 'sidereal') {
        maxMotes = 25 + (essenceLevel * 6);
      }
      if (exaltType === 'liminal') {
        maxMotes = 23 + (essenceLevel * 4);
      }
      if (exaltType === 'dreamsouled') {
        maxMotes = 23 + (essenceLevel * 4);
      }
      if (exaltType === 'hearteater' || exaltType === 'umbral') {
        maxMotes = 27 + (essenceLevel * 6);
      }
    }
    return maxMotes
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
        "size": {
          "value": 0,
          "min": 0
        },
        "drill": {
          "value": 0,
          "min": 0
        },
        "might": {
          "value": 0,
          "min": 0
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
          "hasaura": false,
        },
      }
    };
  }
}
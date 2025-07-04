import RollForm from "../apps/dice-roller.js";
import { prepareItemTraits } from "../item/item.js";
import { getNumberFormula } from "../utils/utils.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class ExaltedThirdActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this;
    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
  }

  async _preUpdate(updateData, options, user) {
    if ((await super._preUpdate(updateData, options, user)) === false) return false;
    const exalt = updateData.system?.details?.exalt || this.system.details.exalt;
    const essenceLevel = updateData.system?.essence?.value || this.system.essence.value;
    const creatureType = updateData.system?.creaturetype || this.system.creaturetype;
    const caste = updateData.system?.details?.caste || this.system.details.caste;
    const casteAbilitiesMap = CONFIG.exaltedthird.casteabilitiesmap;
    if (this.type === 'npc') {
      if (updateData.system?.battlegroup && !this.system.battlegroup) {
        if (updateData.system?.health?.levels) {
          updateData.system.health.levels.zero.value = this.system.health.levels.zero.value + this.system.health.levels.one.value + this.system.health.levels.two.value + this.system.health.levels.three.value + this.system.health.levels.four.value + 1;
        } else {
          updateData.system.health = {
            "levels": {
              "zero": {
                "value": this.system.health.levels.zero.value + this.system.health.levels.one.value + this.system.health.levels.two.value + this.system.health.levels.three.value + this.system.health.levels.four.value + 1,
              }
            }
          };
        }
      }
    }
    if (exalt !== this.system.details.exalt || essenceLevel !== this.system.essence.value || creatureType !== this.system.creaturetype) {
      if (this.type === 'character') {
        updateData.system.motes = {
          personal: {
            max: this.calculateMaxExaltedMotes('personal', exalt, essenceLevel),
            value: (this.calculateMaxExaltedMotes('personal', exalt, essenceLevel) - this.system.motes.personal.committed),
            committed: this.system.motes.personal.committed
          },
          peripheral: {
            max: this.calculateMaxExaltedMotes('peripheral', exalt, essenceLevel),
            value: (this.calculateMaxExaltedMotes('peripheral', exalt, essenceLevel) - this.system.motes.peripheral.committed),
            committed: this.system.motes.peripheral.committed
          }
        };
      }
      else {
        if (creatureType === 'exalt') {
          let peripheralmotes = this.calculateMaxExaltedMotes('peripheral', exalt, essenceLevel);
          let personalMotes = this.calculateMaxExaltedMotes('personal', exalt, essenceLevel);
          updateData.system.motes = {
            personal: {
              max: personalMotes,
              value: (personalMotes - (updateData.system?.motes?.personal?.committed || this.system.motes.personal.committed)),
              committed: updateData.system?.motes?.personal?.committed || this.system.motes.personal.committed
            },
            peripheral: {
              max: peripheralmotes,
              value: (peripheralmotes - (updateData.system?.motes?.peripheral?.committed || this.system.motes.peripheral.committed)),
              committed: updateData.system?.motes?.peripheral?.committed || this.system.motes.peripheral.committed
            }
          };
        }
      }
      if (exalt) {
        let hasAura = false;
        const martialArtsMastery = {
          'dragonblooded': 'terrestrial',
          'abyssal': 'mastery',
          'solar': 'mastery',
          'infernal': 'mastery',
          'lunar': 'standard',
          'sidereal': 'standard',
          'alchemical': 'standard',
          'liminal': "terrestrial",
          'getimian': 'standard',
          'umbral': "standard",
          'dreamsouled': 'terrestrial',
          'hearteater': 'standard',
        }
        if (exalt === 'dragonblooded') {
          hasAura = true;
        }
        if (updateData.system?.settings) {
          updateData.system.settings.hasaura = hasAura;
        }
        else {
          updateData.system.settings = {
            hasaura: hasAura
          }
        }
        if (martialArtsMastery[exalt]) {
          updateData.system.settings.martialartsmastery = martialArtsMastery[exalt];
        }
        if (exalt === 'sidereal') {
          updateData.system.settings.smaenlightenment = true;
        } else {
          updateData.system.settings.smaenlightenment = false;
        }
        updateData.system.traits = {
          resonance: this.calculateResonance(exalt),
          dissonance: this.calculateDissonance(exalt),
          classifications: this.calculateClassifications(exalt, creatureType || 'exalt'),
        };
      }
    }

    if (caste !== this.system.details.caste && this.type === 'character') {
      const lowecaseCaste = caste.toLowerCase();
      const attributes = updateData.system?.attributes || this.system.attributes;
      const abilities = updateData.system?.abilities || this.system.abilities;
      for (let [key, attribute] of Object.entries(attributes)) {
        if (casteAbilitiesMap[lowecaseCaste]?.includes(key)) {
          attributes[key].favored = true;
          attributes[key].caste = true;
        }
        else {
          attributes[key].caste = false;
        }
        if (exalt === 'lunar') {
          const attributeValue = attributes[key]?.value || this.system.attributes[key].value;
          if (attributes[key].favored && (attributeValue >= 3 || this.items.some(charm => charm.type === 'charm' && charm.system.ability === key))) {
            attributes[key].excellency = true;
          }
          else if (attributeValue >= 5 || this.items.some(charm => charm.type === 'charm' && charm.system.ability === key)) {
            attributes[key].excellency = true;
          }
        }
      }
      for (let [key, ability] of Object.entries(abilities)) {
        const abilityValue = abilities[key]?.value || this.system.abilities[key]?.value;

        if (casteAbilitiesMap[lowecaseCaste]?.includes(key)) {
          abilities[key].favored = true;
          abilities[key].caste = true;
        }
        else {
          abilities[key].caste = false;
        }
        if ((this.items.some(charm => charm.type === 'charm' && charm.system.ability === key) || (ability.favored && abilityValue > 0)) && CONFIG.exaltedthird.abilityExalts.includes(caste)) {
          abilities[key].excellency = true;
        }
        if (this.items.some(charm => charm.type === 'charm' && charm.system.ability === key && charm.system.keywords.toLowerCase().includes('excellency'))) {
          abilities[key].excellency = true;
        }
      }
      if (this.system.details.exalt === 'exigent') {
        if (updateData.system?.settings) {
          updateData.system.settings.exigenttype = CONFIG.exaltedthird.exigentTiers[caste];
        }
        else {
          updateData.system.settings = {
            hasaura: CONFIG.exaltedthird.exigentTiers[caste]
          }
        }
        updateData.system.traits = {
          resonance: this.calculateResonance('exigent', caste),
          dissonance: this.calculateDissonance('exigent', caste),
        };
      }
      updateData.system.attributes = attributes;
      updateData.system.abilities = abilities;
    }
  }

  canAquireItem(item) {
    const itemIds = this.items.map(item => {
      const sourceId = item.flags?.core?.sourceId || ''; // Handle cases where sourceId is undefined
      const sections = sourceId.split('.'); // Split the sourceId by periods
      return sections.length > 1 ? sections.pop() : '';
    }).filter(section => section.trim() !== '');
    let charmsList = this.items.filter(item => item.type === 'charm');

    if (itemIds.includes(item._id)) {
      return false;
    }

    const itemType = item.type;

    if (itemType !== 'charm' && itemType !== 'spell') {
      return false;
    }

    if (itemType === 'charm') {
      if (!(item.system.essence <= this.system.essence.value || item.system.ability === this.system.details.supernal)) {
        return false;
      }

      if (item.system.charmtype === 'martialarts') {
        if (item.system.parentitemid) {
          const hasMartialArt = this.items.some(martialArt => {
            if (martialArt.type !== 'customability' && martialArt.system.abilitytype !== 'martialart') return false;
            const sourceId = martialArt._source?._stats?.compendiumSource || '';
            const sections = sourceId.split('.');
            return sections.includes(item.system.parentitemid) && item.system.requirement <= martialArt.system.points;
          });
          if (!hasMartialArt) return false;
        } else {
          return false;
        }
      }
      else if (item.system.charmtype === 'evocation') {
        if (!item.system.parentitemid || !itemIds.includes(item.system.parentitemid)) {
          return false;
        }
      } else {
        if (this.system.details.exalt === 'exigent' && item.system.charmtype !== this.system.details.caste.toLowerCase()) {
          return false;
        }

        if (this.system.details.exalt !== 'exigent' && item.system.charmtype !== this.system.details.exalt) {
          return false;
        }
      }

      let validAbilityRequirement = true;
      let alternateAbilityRequirementMet = true;

      if (item.system.numberprerequisites.number > 0) {
        if (item.system.numberprerequisites.ability === "combat") {
          if (item.system.numberprerequisites.ability === 'physicalAttribute' && (charmsList.filter(numberCharm => ['archery', 'brawl', 'melee', 'thrown', 'war'].includes(numberCharm.system.ability)).length || 0) < item.system.numberprerequisites.number) {
            validAbilityRequirement = false;
          }
        }
        else if (['physicalAttribute', 'mentalAttribute', 'socialAttribute'].includes(item.system.numberprerequisites.ability)) {
          if (item.system.numberprerequisites.ability === 'physicalAttribute' && (charmsList.filter(numberCharm => ['strength', 'dexterity', 'stamina'].includes(numberCharm.system.ability)).length || 0) < item.system.numberprerequisites.number) {
            validAbilityRequirement = false;
          }
          if (item.system.numberprerequisites.ability === 'mentalAttribute' && (charmsList.filter(numberCharm => ['intelligence', 'wits', 'perception'].includes(numberCharm.system.ability)).length || 0) < item.system.numberprerequisites.number) {
            validAbilityRequirement = false;
          }
          if (item.system.numberprerequisites.ability === 'socialAttribute' && (charmsList.filter(numberCharm => ['charisma', 'appearance', 'manipulation'].includes(numberCharm.system.ability)).length || 0) < item.system.numberprerequisites.number) {
            validAbilityRequirement = false;
          }
        }
        else if (CONFIG.exaltedthird.maidens.includes(item.system.ability)) {
          if (item.system.numberprerequisites.number > this._getMaidenCharmsNumber(item.system.numberprerequisites.ability)) {
            validAbilityRequirement = false;
          }
        } else {
          const charmCount = this.items.filter(
            numberCharm => numberCharm.type === 'charm' && numberCharm.system.ability === item.system.numberprerequisites.ability
          ).length;
          if (charmCount < item.system.numberprerequisites.number) {
            validAbilityRequirement = false;
          }
        }
      }

      if (item.system.charmprerequisites.length > 0) {
        if (!item.system.charmprerequisites.every(prerequisite => itemIds.includes(prerequisite.id))) {
          validAbilityRequirement = false;
        }
      }

      if (this.system.attributes[item.system.ability] && item.system.requirement > (this.system.attributes[item.system.ability].value + (this.system.attributes[item.system.ability].upgrade || 0))) {
        validAbilityRequirement = false;
      }

      if (item.system.ability !== 'martialarts' && this.system.abilities[item.system.ability] && item.system.requirement > this.system.abilities[item.system.ability].value) {
        validAbilityRequirement = false;
      }

      if (CONFIG.exaltedthird.maidens.includes(item.system.ability) && item.system.requirement > this._getHighestMaidenAbility(item.system.ability)) {
        validAbilityRequirement = false;
      }

      if (validAbilityRequirement) {
        return true;
      }

      if (item.system.archetype.ability || item.system.archetype.charmprerequisites.length > 0) {
        if (item.system.archetype.ability) {
          if (item.system.archetype.ability === "combat" && item.system.requirement > Math.max(this.system.abilities['archery'].value, this.system.abilities['brawl'].value, this.system.abilities['melee'].value, this.system.abilities['thrown'].value, this.system.abilities['war'].value)) {
            return false;
          }
          if (this.system.attributes[item.system.archetype.ability] && item.system.requirement > this.system.attributes[item.system.archetype.ability].value) {
            return false;
          }
          if (this.system.abilities[item.system.archetype.ability] && item.system.requirement > this.system.abilities[item.system.archetype.ability].value) {
            return false;
          }
          if (CONFIG.exaltedthird.maidens.includes(item.system.archetype.ability) && item.system.requirement > this._getHighestMaidenAbility(item.system.archetype.ability)) {
            return false;
          }
        }
        if (item.system.archetype.charmprerequisites.length > 0) {
          if (!item.system.archetype.charmprerequisites.every(prerequisite => itemIds.includes(prerequisite.id))) {
            return false;
          }
        }
        return true;
      }
    }



    if (itemType === 'spell') {
      const circle = item.system.circle;
      const sorcery = this.system.settings.sorcerycircle;
      const necromancy = this.system.settings.necromancycircle;

      if (circle === 'terrestrial' && sorcery !== 'none') return true;
      if (circle === 'celestial' && sorcery !== 'terrestrial' && sorcery !== 'none') return true;
      if (circle === 'solar' && sorcery === 'solar') return true;
      if (circle === 'ivory' && necromancy !== 'none') return true;
      if (circle === 'shadow' && necromancy !== 'ivory' && necromancy !== 'none') return true;
      if (circle === 'void' && necromancy === 'void') return true;

      return false;
    }

    return false;
  }

  _determineMartialArtsMastery(styleId) {
    if (this.system.details.exalt === 'sidereal') {
      const style = game.items.find(item => item.id === styleId);
      if (!style) {
        return this.system.settings.martialartsmastery === 'mastery';
      }
      const allItems = this.items;

      // Get all character's active charms
      const activeCharms = allItems.filter(item =>
        item.type === 'charm' && item.system?.active
      );

      for (let charm of activeCharms) {
        const isForm = charm.system.keywords.toLowerCase().includes("form");

        if (!isForm) continue;

        // Case 1: Form charm from the same style
        if (charm.system.parentitemid === styleId) {
          return true;
        }

        // Case 2: Form charm whose parent is a sidereal martial art
        const parent = game.items.find(i => i.id === charm.system.parentitemid);
        if (parent.system?.siderealmartialart === true) {
          return true;
        }
      }

      // Case 3: Character has all charms from this style
      const characterStyleCharms = allItems.filter(item =>
        item.type === 'charm' && item.system?.parentitemid === styleId
      );

      const globalStyleCharms = game.items.filter(item =>
        item.type === 'charm' && item.system?.parentitemid === styleId
      );

      if (characterStyleCharms.length === globalStyleCharms.length && characterStyleCharms.length > 0) {
        return true;
      }
    }
    return this.system.settings.martialartsmastery === 'mastery';
  }

  _getHighestMaidenAbility(maiden) {
    const abilityList = CONFIG.exaltedthird.maidenabilities[maiden];
    let highestValue = 0;
    for (const ability of abilityList) {
      if ((this.system.abilities[ability]?.value || 0) > highestValue) {
        highestValue = (this.system.abilities[ability]?.value || 0);
      }
    }
    return highestValue;
  }

  _getMaidenCharmsNumber(maiden) {
    return (this.items.filter(numberCharm => numberCharm.type === 'charm' && CONFIG.exaltedthird.maidenabilities[maiden].includes(numberCharm.system.ability)).length || 0)
  }

  spendMotes(moteCost, actorData, motePool = '', muteMotes = 0) {
    let newLevel = actorData.system.anima.level;
    let newValue = actorData.system.anima.value;
    let newPeripheralMotes = actorData.system.motes.peripheral.value;
    let newPersonalMotes = actorData.system.motes.personal.value;
    let newGloryMotes = actorData.system.motes.glorymotecap.value;
    let feverGain = 0;

    if (game.settings.get("exaltedthird", "gloryOverwhelming")) {
      let animaLevels = ["Dim", "Glowing", "Burning", "Bonfire"];

      if (actorData.system.anima.max === 4) {
        animaLevels = ["Dim", "Glowing", "Burning", "Bonfire", "Transcendent"];
      }
      newGloryMotes = Math.max(0, actorData.system.motes.glorymotecap.value - moteCost);
      if (moteCost >= 5) {
        feverGain = Math.max(1, Math.floor(moteCost / 5) - actorData.system.anima.value);
      }
      moteCost = moteCost - muteMotes;
      // Define the mote cost to advance between levels
      const levelCosts = {
        Dim: 5,
        Glowing: 10,
        Burning: 15,
        Bonfire: 15,
      };

      // Get the current level index
      let currentIndex = animaLevels.indexOf(newLevel);

      // Spend motes to move up levels
      while (moteCost > 0 && currentIndex < animaLevels.length - 1) {
        const costToNextLevel = levelCosts[animaLevels[currentIndex]] || Infinity;

        if (moteCost >= costToNextLevel) {
          moteCost -= costToNextLevel;
          currentIndex++;
        } else {
          break;
        }
      }

      // Update the new level and new value
      newLevel = animaLevels[currentIndex];
      newValue = currentIndex;
    } else {
      if (!motePool) {
        motePool = actorData.system.settings.charmmotepool;
      }
      let spentPersonal = 0;
      let spentPeripheral = 0;
      if (motePool === 'personal') {
        let remainingPersonal = actorData.system.motes.personal.value - moteCost;
        if (remainingPersonal < 0) {
          spentPersonal = moteCost + remainingPersonal;
          spentPeripheral = Math.min(actorData.system.motes.peripheral.value, Math.abs(remainingPersonal));
        }
        else {
          spentPersonal = moteCost;
        }
      }
      else {
        let remainingPeripheral = actorData.system.motes.peripheral.value - moteCost;
        if (remainingPeripheral < 0) {
          spentPeripheral = moteCost + remainingPeripheral;
          spentPersonal = Math.min(actorData.system.motes.personal.value, Math.abs(remainingPeripheral));
        }
        else {
          spentPeripheral = moteCost;
        }
      }
      newPeripheralMotes = Math.max(0, actorData.system.motes.peripheral.value - spentPeripheral);
      newPersonalMotes = Math.max(0, actorData.system.motes.personal.value - spentPersonal);

      if ((spentPeripheral - muteMotes) > 4) {
        for (let i = 0; i < Math.floor(spentPeripheral - muteMotes / 5); i++) {
          if (newLevel === "Dim") {
            newLevel = "Glowing";
            newValue = 1;
          }
          else if (newLevel === "Glowing") {
            newLevel = "Burning";
            newValue = 2;
          }
          else if (newLevel === "Burning") {
            newLevel = "Bonfire";
            newValue = 3;
          }
          else if (actorData.system.anima.max === 4) {
            newLevel = "Transcendent";
            newValue = 4;
          }
        }
      }
    }

    return {
      newPersonalMotes: newPersonalMotes,
      newPeripheralMotes: newPeripheralMotes,
      newGloryMotes: newGloryMotes,
      feverGain: feverGain,
      newAnimaLevel: newLevel,
      newAnimaValue: newValue,
    }
  }

  restoreMotes(amount) {
    let missingPersonal = (this.system.motes.personal.max - this.system.motes.personal.committed) - this.system.motes.personal.value;
    let missingPeripheral = (this.system.motes.peripheral.max - this.system.motes.peripheral.committed) - this.system.motes.peripheral.value;
    let restorePersonal = 0;
    let restorePeripheral = 0;
    if (missingPeripheral >= amount) {
      restorePeripheral = amount;
    }
    else {
      if (missingPeripheral > 0) {
        restorePeripheral = missingPeripheral;
      }
      let maxPersonalRestore = amount - restorePeripheral;
      if (missingPersonal > maxPersonalRestore) {
        restorePersonal = maxPersonalRestore;
      }
      else {
        restorePersonal = missingPersonal;
      }
    }

    this.update({
      "system.motes.personal.value": this.system.motes.personal.value += restorePersonal,
      "system.motes.peripheral.value": this.system.motes.peripheral.value += restorePeripheral,
    });
  }

  async displayEmbeddedItem(itemId) {
    // Render the chat card template
    let item = this.items.find(x => x.id === itemId);
    if (!item) {
      return ui.notifications.error(`${this.name} does not have an embedded item id ${itemId}!`);
    }
    const token = this.token;
    const templateData = {
      actor: this,
      tokenId: token?.uuid || null,
      item: item.system
    };
    const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this, token }),
    };


    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }

  calculateMaxExaltedMotes(moteType, exaltType, essenceLevel) {
    var maxMotes = 0;
    if (moteType === 'personal') {
      // if (exaltType === 'solar' || exaltType === 'abyssal' || exaltType === 'infernal') {
      //   maxMotes = 10 + (essenceLevel * 3);
      // }
      // if (exaltType === 'dragonblooded') {
      //   maxMotes = 11 + essenceLevel;
      // }
      // if (exaltType === 'lunar' || exaltType === 'getimian') {
      //   maxMotes = 15 + essenceLevel;
      // }
      // if (exaltType === 'sovereign') {
      //   maxMotes = 4 + essenceLevel;
      // }
      // if (exaltType === 'exigent') {
      //   if (this.system.settings?.exigenttype === 'celestial') {
      //     maxMotes = 11 + (essenceLevel * 2);
      //   }
      //   else {
      //     maxMotes = 11 + essenceLevel;
      //   }
      // }
      // if (exaltType === 'sidereal') {
      //   maxMotes = 9 + (essenceLevel * 2);
      // }
      // if (exaltType === 'liminal') {
      //   maxMotes = 10 + (essenceLevel * 3);
      // }
      // if (exaltType === 'other') {
      //   maxMotes = 10 * essenceLevel;
      // }
      // if (exaltType === 'dreamsouled' || this.system.details?.caste?.toLowerCase() === 'architect' || this.system.details?.caste?.toLowerCase() === 'puppeteer') {
      //   maxMotes = 11 + essenceLevel;
      // }
      // if (exaltType === 'alchemical' || this.system.details?.caste.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
      //   maxMotes = 11 + (essenceLevel * 2);
      // }
      if (this.system.settings?.exigenttype === 'celestial' || this.system.details?.caste.toLowerCase() === 'strawmaiden') {
        maxMotes = CONFIG.exaltedthird.exaltMotePools.personal.base['default'] + (essenceLevel * CONFIG.exaltedthird.exaltMotePools.personal.essenceLevelMultiplier['celestialExigent']);
      } else {
        maxMotes = (CONFIG.exaltedthird.exaltMotePools.personal.base[exaltType] ?? CONFIG.exaltedthird.exaltMotePools.personal.base['default']) + (essenceLevel * (CONFIG.exaltedthird.exaltMotePools.personal.essenceLevelMultiplier[exaltType] ?? CONFIG.exaltedthird.exaltMotePools.personal.essenceLevelMultiplier['default']));
      }
    }
    else if (moteType === 'glorymotecap') {
      if (['lunar'].includes(exaltType)) {
        maxMotes = 34 + (essenceLevel * 2);
      }
      else if (['dragonblooded', 'sovereign', 'liminal', 'dreamsouled'].includes(exaltType)) {
        maxMotes = 26 + (essenceLevel * 2);
      }
      else {
        maxMotes = 25 + (essenceLevel * 5);
      }
    }
    else {
      // if (exaltType === 'solar' || exaltType === 'abyssal' || exaltType === 'infernal') {
      //   maxMotes = 26 + (essenceLevel * 7);
      // }
      // if (exaltType === 'dragonblooded') {
      //   maxMotes = 23 + (essenceLevel * 4);
      // }
      // if (exaltType === 'lunar') {
      //   maxMotes = 34 + (essenceLevel * 4);
      // }
      // if (exaltType === 'sovereign') {
      //   maxMotes = 30 + (essenceLevel * 4);
      // }
      // if (exaltType === 'exigent') {
      //   if (this.system.settings?.exigenttype === 'celestial') {
      //     maxMotes = 27 + (essenceLevel * 6);
      //   }
      //   else {
      //     maxMotes = 23 + (essenceLevel * 4);
      //   }
      // }
      // if (exaltType === 'sidereal' || exaltType === 'getimian') {
      //   maxMotes = 25 + (essenceLevel * 6);
      // }
      // if (exaltType === 'liminal') {
      //   maxMotes = 23 + (essenceLevel * 4);
      // }
      // if (exaltType === 'dreamsouled' || this.system.details?.caste?.toLowerCase() === 'architect' || this.system.details?.caste?.toLowerCase() === 'puppeteer') {
      //   maxMotes = 23 + (essenceLevel * 4);
      // }
      // if (exaltType === 'alchemical' || this.system.details?.caste?.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
      //   maxMotes = 27 + (essenceLevel * 6);
      // }
      if (this.system.settings?.exigenttype === 'celestial' || this.system.details?.caste.toLowerCase() === 'strawmaiden') {
        maxMotes = CONFIG.exaltedthird.exaltMotePools.peripheral.base['celestialExigent'] + (essenceLevel * CONFIG.exaltedthird.exaltMotePools.peripheral.essenceLevelMultiplier['celestialExigent']);
      } else {
        maxMotes = (CONFIG.exaltedthird.exaltMotePools.peripheral.base[exaltType] ?? CONFIG.exaltedthird.exaltMotePools.peripheral.base['default']) + (essenceLevel * (CONFIG.exaltedthird.exaltMotePools.peripheral.essenceLevelMultiplier[exaltType] ?? CONFIG.exaltedthird.exaltMotePools.peripheral.essenceLevelMultiplier['default']));
      }
    }
    return maxMotes
  }

  async calculateCommitMotes(type) {
    var commitMotes = 0;
    for (const item of this.items.filter((i) => i.type === 'weapon' || i.type === 'armor' || i.type === 'item')) {
      if (item.type === 'item' || item.system.equipped) {
        commitMotes += item.system.attunement;
      }
    }
    this.update({ [`system.motes.${type}.committed`]: commitMotes });
  }

  async calculateCharacterMotes() {
    await this.calculateCommitMotes('peripheral');
    const actorData = foundry.utils.duplicate(this);
    actorData.system.motes.personal.value = this.calculateMaxExaltedMotes('personal', actorData.system.details.exalt, actorData.system.essence.value) - actorData.system.motes.peripheral.committed;
    actorData.system.motes.personal.max = this.calculateMaxExaltedMotes('personal', actorData.system.details.exalt, actorData.system.essence.value);
    actorData.system.motes.peripheral.value = this.calculateMaxExaltedMotes('peripheral', actorData.system.details.exalt, actorData.system.essence.value - actorData.system.motes.peripheral.committed);
    actorData.system.motes.peripheral.max = this.calculateMaxExaltedMotes('peripheral', actorData.system.details.exalt, actorData.system.essence.value);
    this.update(actorData);
  }

  async calculateAllDerivedStats() {
    await this.calculateCharacterMotes();
    if (this.type === 'character') {
      await this.calculateDerivedStats('parry');
      await this.calculateDerivedStats('evasion');
      await this.calculateDerivedStats('guile');
      await this.calculateDerivedStats('resolve');
      await this.calculateDerivedStats('naturalSoak');
    }
    await this.calculateDerivedStats('armoredSoak');
    await this.calculateDerivedStats('soak');
    await this.calculateDerivedStats('hardness');
    await this.calculateDerivedStats('resonance');
    await this.calculateDerivedStats('classifications');
  }

  async calculateDerivedStats(type) {
    const actorData = foundry.utils.duplicate(this);
    let armoredSoakValue = 0;

    let staticAttributeValue = (actorData.system.attributes?.[actorData.system.settings.staticcapsettings?.[type]?.attribute]?.value || 0) + (actorData.system.attributes?.[actorData.system.settings.staticcapsettings?.[type]?.attribute]?.upgrade || 0);
    let staticAbilityValue = this.getCharacterAbilityValue(actorData.system.settings.staticcapsettings[type]?.ability);

    if (type === 'naturalSoak') {
      actorData.system.naturalsoak.value = actorData.system.attributes[actorData.system.settings.staticcapsettings.soak.attribute]?.value;
    }
    if (type === 'soak' || type === 'armoredSoak' || type === 'all') {
      for (let armor of this.armor) {
        if (armor.system.equipped) {
          armoredSoakValue = armoredSoakValue + armor.system.soak;
        }
      }
      if (type === 'armoredSoak' || type === 'all') {
        actorData.system.armoredsoak.value = armoredSoakValue;
      }
    }
    if (type === 'soak' || type === 'all') {
      if (this.type === 'npc') {
        actorData.system.soak.value = actorData.system.naturalsoak.value + armoredSoakValue;
      } else {
        actorData.system.soak.value = staticAttributeValue + armoredSoakValue;
      }
    }
    let specialtyBonus = actorData.system?.settings?.staticcapsettings[type]?.specialty ? 1 : 0;
    if (type === 'parry' || type === 'all') {
      actorData.system.parry.value = Math.ceil((staticAttributeValue + staticAbilityValue + specialtyBonus) / 2);
      let weaponParryBonus = 0;
      for (let weapon of this.weapons) {
        if (weapon.system.equipped && weapon.system.defense > weaponParryBonus) {
          weaponParryBonus = weapon.system.defense;
        }
      }
      actorData.system.parry.value += weaponParryBonus;
    }
    if (type === 'evasion' || type === 'all') {
      var newEvasionValue = Math.ceil((staticAttributeValue + staticAbilityValue + specialtyBonus) / 2);
      for (let armor of this.armor) {
        if (armor.system.equipped) {
          newEvasionValue = newEvasionValue - Math.abs(armor.system.penalty);
        }
      }
      actorData.system.evasion.value = newEvasionValue;
    }
    if (type === 'resolve' || type === 'all') {
      actorData.system.resolve.value = Math.ceil((staticAttributeValue + staticAbilityValue + specialtyBonus) / 2);
    }
    if (type === 'guile' || type === 'all') {
      actorData.system.guile.value = Math.ceil((staticAttributeValue + staticAbilityValue + specialtyBonus) / 2);
    }
    if (type === 'resonance' || type === 'all') {
      actorData.system.traits.resonance = this.calculateResonance(this.system.details.exalt);
      actorData.system.traits.dissonance = this.calculateDissonance(this.system.details.exalt);
    }
    if (type === 'classifications' || type === 'all') {
      actorData.system.traits.classifications = this.calculateClassifications(this.system.details.exalt, this.system.creaturetype || 'exalt');
    }
    if (type === 'hardness' || type === 'all') {
      let hardness = 0
      for (let armor of this.armor) {
        if (armor.system.equipped) {
          if (armor.system.hardness > hardness) {
            hardness = armor.system.hardness;
          }
        }
        actorData.system.hardness.value = hardness;
      }
    }
    await this.update(actorData);
  }

  calculateResonance(exaltType, caste = null) {
    if (!caste) {
      caste = this.system.details.caste?.toLowerCase();
    }
    let resonance = {
      value: [],
      custom: "",
    }
    const resonanceChart = {
      "abyssal": ['soulsteel'],
      "alchemical": [],
      "dragonblooded": ['blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "dreamsouled": [],
      "getimian": ['starmetal'],
      "hearteater": ['adamant'],
      "infernal": ['orichalcum'],
      "liminal": [],
      "lunar": ['moonsilver'],
      "mortal": [],
      "other": [],
      "sidereal": ['starmetal'],
      "soverign": [],
      "solar": ['adamant', 'orichalcum', 'moonsilver', 'starmetal', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "umbral": ['soulsteel'],
      //Exigents
      "strawmaiden": ['orichalcum', 'greenjade'],
      "puppeteer": [],
      "knives": [],
      "wounds": ['soulsteel', 'redjade'],
      "marchlord": [],
    }

    if (exaltType === 'exigent' || exaltType === 'marchlord') {
      resonance.value = resonanceChart[caste] ?? [];
      if (caste === 'puppeteer') {
        resonance.custom = 'Artifact Puppets';
      }
      if (caste === 'knives') {
        resonance.custom = 'Artifact Knives';
      }
    }
    else if (exaltType === 'alchemical') {
      if (caste === 'jade') {
        resonance.value = ['blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'];
      } else if (caste) {
        resonance.value = [caste];
      }
    }
    else {
      resonance.value = resonanceChart[exaltType] ?? [];
    }
    return resonance;
  }

  calculateDissonance(exaltType, caste = null) {
    if (!caste) {
      caste = this.system.details.caste;
    }
    let dissonance = {
      value: [],
      custom: "",
    }
    const dissonanceChart = {
      "abyssal": [],
      "alchemical": [],
      "dragonblooded": ['soulsteel'],
      "dreamsouled": ['adamant', 'orichalcum', 'starmetal', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "getimian": ['adamant', 'orichalcum', 'moonsilver', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "hearteater": [],
      "infernal": [],
      "liminal": ['adamant', 'orichalcum', 'moonsilver', 'starmetal', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "lunar": [],
      "mortal": [],
      "other": [],
      "sidereal": ['adamant', 'orichalcum', 'moonsilver', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "solar": [],
      "soverign": ['orichalcum', 'moonsilver', 'starmetal', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "umbral": [],
      "strawmaiden": ['soulsteel'],
      "puppeteer": ['adamant', 'orichalcum', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "knives": ['orichalcum', 'moonsilver', 'soulsteel', 'blackjade', 'greenjade', 'redjade', 'whitejade'],
      "wounds": ['adamant', 'orichalcum', 'moonsilver', 'blackjade', 'bluejade', 'whitejade'],
      'north': ['adamant', 'orichalcum', 'soulsteel', 'blackjade', 'greenjade', 'redjade', 'starmetal'],
      'south': ['adamant', 'orichalcum', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'starmetal'],
      'east': ['adamant', 'orichalcum', 'soulsteel', 'blackjade', 'bluejade', 'redjade', 'starmetal'],
      'west': ['adamant', 'orichalcum', 'soulsteel', 'bluejade', 'greenjade', 'redjade', 'starmetal'],
    }

    if (exaltType === 'exigent' || exaltType === 'marchlord') {
      dissonance.value = dissonanceChart[caste] ?? [];
    }
    else {
      dissonance.value = dissonanceChart[exaltType] ?? [];
    }
    return dissonance;
  }

  calculateClassifications(exaltType, creatureType = 'exalt') {
    let classifications = {
      value: [],
      custom: "",
    }

    if (this.type === 'character' || creatureType === 'exalt') {
      if (exaltType === 'abyssal' || exaltType === 'infernal') {
        classifications.value = ['creatureofdarkness', 'enemyoffate'];
      }
      if (exaltType === 'mortal') {
        classifications.value = ['mortal'];
      }
    } else {
      const creatureTypeClassifications = {
        undead: ['creatureofdarkness', 'enemyoffate', 'undead'],
        demon: ['creatureofdarkness', 'demon', 'enemyoffate', 'spirit'],
        elemental: ['spirit'],
        mortal: ['mortal'],
        fae: ['fae', 'enemyoffate'],
        god: ['spirit'],
      };
      classifications.value = creatureTypeClassifications[creatureType] ?? [];
    }

    return classifications;
  }

  async rollEmbeddedItem(itemId, personal = false) {

    const actorData = foundry.utils.duplicate(this);

    let item = this.items.find(x => x.id == itemId);

    if (!item) {
      return ui.notifications.error(`${this.name} does not have an embedded item id ${itemId}!`);
    }

    if (item.type === 'charm') {
      if (item.system.cost.motes > 0) {
        if (system.motes.peripheral.value > 0 && !personal) {
          system.motes.peripheral.value = Math.max(0, system.motes.peripheral.value - item.system.cost.motes);
        }
        else {
          system.motes.personal.value = Math.max(0, system.motes.personal.value - item.system.cost.motes);
        }
      }
      system.willpower.value = Math.max(0, system.willpower.value - item.system.cost.willpower);
      if (this.type === 'character') {
        system.craft.experience.silver.value = Math.max(0, system.craft.experience.silver.value - item.system.cost.silverxp);
        system.craft.experience.gold.value = Math.max(0, system.craft.experience.gold.value - item.system.cost.goldxp);
        system.craft.experience.white.value = Math.max(0, system.craft.experience.white.value - item.system.cost.whitexp);
      }
      if (system.details.aura === item.system.cost.aura || item.system.cost.aura === 'any') {
        system.details.aura = "none";
      }
      if (item.system.cost.initiative > 0) {
        let combat = game.combat;
        if (combat) {
          let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.id);
          if (combatant) {
            var newInitiative = combatant.initiative - item.system.cost.initiative;
            if (combatant.initiative > 0 && newInitiative <= 0) {
              newInitiative -= 5;
            }
            combat.setInitiative(combatant.id, newInitiative);
          }
        }
      }
      if (item.system.cost.anima > 0) {
        var newLevel = system.anima.level;
        var newValue = system.anima.value;
        for (var i = 0; i < item.system.cost.anima; i++) {
          if (newLevel === "Transcendent") {
            newLevel = "Bonfire";
            newValue = 3;
          }
          else if (newLevel === "Bonfire") {
            newLevel = "Burning";
            newValue = 2;
          }
          else if (newLevel === "Burning") {
            newLevel = "Glowing";
            newValue = 1;
          }
          if (newLevel === "Glowing") {
            newLevel = "Dim";
            newValue = 0;
          }
        }
        system.anima.level = newLevel;
        system.anima.value = newValue;
      }
      if (item.system.cost.health > 0) {
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(system.health.levels)) {
          totalHealth += health_level.value;
        }
        if (item.system.cost.healthtype === 'bashing') {
          system.health.bashing = Math.min(totalHealth - system.health.aggravated - system.health.lethal, system.health.bashing + item.system.cost.health);
        }
        else if (item.system.cost.healthtype === 'lethal') {
          system.health.lethal = Math.min(totalHealth - system.health.bashing - system.health.aggravated, system.health.lethal + item.system.cost.health);
        }
        else {
          system.health.aggravated = Math.min(totalHealth - system.health.bashing - system.health.lethal, system.health.aggravated + item.system.cost.health);
        }
      }
    }

    this.displayEmbeddedItem(itemId);

    this.update(actorData);
  }

  async savedRoll(name) {
    const roll = Object.values(this.system.savedRolls).find(x => x.name === name);
    if (!roll) {
      return ui.notifications.error(`${this.name} does not have a saved roll named ${name}!`);
    }

    if (data.rollType === 'useOpposingCharms') {
      game.opposingCharmForm = await new RollForm(this, { classes: [" exaltedthird exaltedthird-dialog dice-roller", this.getSheetBackground()] }, {}, { rollId: roll.id, skipDialog: true }).roll();
    } else {
      game.rollForm = await new RollForm(this, { classes: [" exaltedthird exaltedthird-dialog dice-roller", this.getSheetBackground()] }, {}, { rollId: roll.id, skipDialog: true }).roll();
    }
  }

  getSavedRoll(name) {
    const roll = Object.values(this.system.savedRolls).find(x => x.name === name);
    if (!roll) {
      return ui.notifications.error(`${this.name} does not have a saved roll named ${name}!`);
    }
    return new RollForm(this, { classes: [" exaltedthird exaltedthird-dialog dice-roller", this.getSheetBackground()] }, {}, { rollId: roll.id });
  }
  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    // Make modifications to data here. For example:

    const data = actorData.system;

    // this._prepareBaseActorData(data);
    let totalHealth = 0;
    let currentPenalty = 0;
    let totalWarstriderHealth = 0;
    let totalShipHealth = 0;
    let currentWarstriderPenalty = 0;
    let currentShipPenalty = 0;

    let staticActorData = actorData._source;

    if (actorData.system.lunarform?.enabled) {
      const lunar = game.actors.get(actorData.system.lunarform?.actorid);
      if (lunar) {
        staticActorData = lunar._source;
        data.aboveParryCap = Math.max(0, data.parry.value - lunar.system.parry.value);
        data.aboveEvasionCap = Math.max(0, data.evasion.value - lunar.system.evasion.value);
      }
    }
    if (staticActorData.type === "character" || staticActorData.system.creaturetype === 'exalt') {
      data.parry.cap = this._getStaticCap(staticActorData, 'parry', staticActorData.system.parry.value);
      if (data.parry.cap !== '') {
        data.evasion.padding = true;
        data.defenseCapPadding = true;
      }
      data.evasion.cap = this._getStaticCap(staticActorData, 'evasion', staticActorData.system.evasion.value);
      if (data.evasion.cap !== '') {
        data.evasion.padding = false;
        if (data.parry.cap === '') {
          data.parry.padding = true;
        }
        data.defenseCapPadding = true;
      }
      data.guile.cap = this._getStaticCap(staticActorData, 'guile', staticActorData.system.guile.value);
      if (data.guile.cap !== '') {
        data.resolve.padding = true;
        data.socialCapPadding = true;
      }
      data.resolve.cap = this._getStaticCap(staticActorData, 'resolve', staticActorData.system.resolve.value);
      if (data.resolve.cap !== '') {
        if (data.guile.cap === '') {
          data.guile.padding = true;
        }
        data.resolve.padding = false;
        data.socialCapPadding = true;
      }
      data.soak.cap = this._getStaticCap(staticActorData, 'soak', actorData.type === "character" ? (data.attributes?.stamina?.value || 0) : staticActorData.system.soak.value);


      // if (staticActorData.type === "character" && data.attributes.stamina.excellency) {
      // var newValueLow = Math.floor(data.attributes.stamina.value / 2);
      // var highestAttributeNumber = 1;
      // for (let [name, attribute] of Object.entries(staticActorData.system.attributes)) {
      //   if (attribute.value > highestAttributeNumber) {
      //     highestAttributeNumber = attribute.value;
      //   }
      // }
      // var newValueHigh = Math.floor((data.attributes.stamina.value + highestAttributeNumber) / 2);
      // data.soak.cap = `(+${newValueLow}-${newValueHigh} for ${newValueLow}-${newValueHigh}m)`;
      // }
    }

    if (data.battlegroup) {
      totalHealth = data.health.levels.zero.value + data.size.value;
      data.health.max = totalHealth;
      if ((data.health.bashing + data.health.lethal + data.health.aggravated) > data.health.max) {
        data.health.aggravated = data.health.max - data.health.lethal;
        if (data.health.aggravated <= 0) {
          data.health.aggravated = 0
          data.health.lethal = data.health.max;
        }
      }
      data.health.value = data.health.max - data.health.aggravated - data.health.lethal - data.health.bashing;
      data.health.penalty = 0;
    }
    else {
      for (let [key, healthLevel] of Object.entries(data.health.levels)) {
        if ((data.health.bashing + data.health.lethal + data.health.aggravated) > totalHealth) {
          currentPenalty = healthLevel.penalty;
        }
        totalHealth += healthLevel.value;
      }
      data.health.max = totalHealth;
      if ((data.health.bashing + data.health.lethal + data.health.aggravated) > data.health.max) {
        data.health.aggravated = data.health.max - data.health.lethal;
        if (data.health.aggravated <= 0) {
          data.health.aggravated = 0;
          data.health.lethal = data.health.max;
        }
      }
      data.health.value = data.health.max - data.health.aggravated - data.health.lethal - data.health.bashing;
      data.health.penalty = currentPenalty;
    }


    for (let [key, healthLevel] of Object.entries(data.warstrider.health.levels)) {
      if ((data.warstrider.health.bashing + data.warstrider.health.lethal + data.warstrider.health.aggravated) > totalWarstriderHealth) {
        currentWarstriderPenalty = healthLevel.penalty;
      }
      totalWarstriderHealth += healthLevel.value;
    }
    data.warstrider.health.max = totalWarstriderHealth;
    if ((data.warstrider.health.bashing + data.warstrider.health.lethal + data.warstrider.health.aggravated) > data.warstrider.health.max) {
      data.warstrider.health.aggravated = data.warstrider.health.max - data.warstrider.health.lethal;
      if (data.warstrider.health.aggravated <= 0) {
        data.warstrider.health.aggravated = 0;
        data.warstrider.health.lethal = data.health.max;
      }
    }
    data.warstrider.health.value = data.warstrider.health.max - data.warstrider.health.aggravated - data.warstrider.health.lethal - data.warstrider.health.bashing;
    data.warstrider.health.penalty = currentWarstriderPenalty;


    for (let [key, healthLevel] of Object.entries(data.ship.health.levels)) {
      if ((data.ship.health.bashing + data.ship.health.lethal + data.ship.health.aggravated) > totalShipHealth) {
        currentShipPenalty = healthLevel.penalty;
      }
      totalShipHealth += healthLevel.value;
    }
    data.ship.health.max = totalShipHealth;
    if ((data.ship.health.bashing + data.ship.health.lethal + data.ship.health.aggravated) > data.ship.health.max) {
      data.ship.health.aggravated = data.ship.health.max - data.ship.health.lethal;
      if (data.ship.health.aggravated <= 0) {
        data.ship.health.aggravated = 0;
        data.ship.health.lethal = data.health.max;
      }
    }
    data.ship.health.value = data.ship.health.max - data.ship.health.aggravated - data.ship.health.lethal - data.ship.health.bashing;
    data.ship.health.penalty = currentShipPenalty;

    if (actorData.type !== "npc") {
      data.experience.standard.remaining = data.experience.standard.total - data.experience.standard.value;
      data.experience.exalt.remaining = data.experience.exalt.total - data.experience.exalt.value;
    }

    let currentParryPenalty = 0;
    let currentEvasionPenalty = 0;
    let currentOnslaughtPenalty = 0;
    let currentDefensePenalty = 0;

    for (const effect of actorData.effects.filter((effect) => !effect.disabled)) {
      for (const change of effect.changes) {
        if (change.key === 'system.evasion.value' && change.value < 0 && change.mode === 2) {
          currentEvasionPenalty += (change.value * -1);
        }
        if (change.key === 'system.parry.value' && change.value < 0 && change.mode === 2) {
          currentParryPenalty += (change.value * -1);
        }
      }
      if (effect.flags.exaltedthird?.statusId === 'onslaught') {
        currentOnslaughtPenalty += (effect.changes[0].value * -1);
      }
      if (effect.flags.exaltedthird?.statusId === 'defensePenalty') {
        currentDefensePenalty += (effect.changes[0].value * -1);
      }
    }
    if (actorData.effects.some(e => e.statuses.has('prone'))) {
      currentParryPenalty += 1;
      currentEvasionPenalty += 2;
    }
    if (actorData.effects.some(e => e.statuses.has('surprised'))) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }
    if (actorData.effects.some(e => e.statuses.has('grappled')) || actorData.effects.some(e => e.statuses.has('grappling'))) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }
    currentParryPenalty += Math.max(0, (actorData.system.health.penalty === 'inc' ? 4 : data.health.penalty) - data.health.penaltymod);
    currentEvasionPenalty += Math.max(0, (actorData.system.health.penalty === 'inc' ? 4 : data.health.penalty) - data.health.penaltymod);
    data.currentParryPenalty = currentParryPenalty;
    data.currentEvasionPenalty = currentEvasionPenalty;
    data.currentOnslaughtPenalty = currentOnslaughtPenalty;
    data.currentDefensePenalty = currentDefensePenalty;

    if (actorData.type === 'character') {
      for (let [key, attr] of Object.entries(actorData.system.attributes)) {
        attr.name = CONFIG.exaltedthird.attributes[key];
      }
      for (let [key, ability] of Object.entries(actorData.system.abilities)) {
        ability.name = CONFIG.exaltedthird.abilities[key];
      }
    }
    else {
      for (let [key, pool] of Object.entries(actorData.system.pools)) {
        pool.name = CONFIG.exaltedthird.npcpools[key];
      }
    }

    // Initialize containers.
    const customAbilities = [];
    const gear = [];
    const weapons = [];
    const armor = [];
    const merits = [];
    const intimacies = [];
    const rituals = [];
    const specialties = [];
    const specialAbilities = [];
    const craftProjects = [];
    const modifiers = [];
    const actions = [];
    const destinies = [];
    const shapes = [];
    const activeItems = [];
    const charms = {};
    const rollCharms = {};
    const defenseCharms = {};

    const spells = {
      terrestrial: { name: 'Ex3.Terrestrial', visible: false, list: [], collapse: true },
      celestial: { name: 'Ex3.Celestial', visible: false, list: [], collapse: true },
      solar: { name: 'Ex3.Solar', visible: false, list: [], collapse: true },
      ivory: { name: 'Ex3.Ivory', visible: false, list: [], collapse: true },
      shadow: { name: 'Ex3.Shadow', visible: false, list: [], collapse: true },
      void: { name: 'Ex3.Void', visible: false, list: [], collapse: true },
    }

    // Iterate through items, allocating to containers
    for (let i of actorData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'customability') {
        prepareItemTraits('customability', i);
        customAbilities.push(i);
      }
      else if (i.type === 'weapon') {
        prepareItemTraits('weapon', i);
        weapons.push(i);
      }
      else if (i.type === 'armor') {
        prepareItemTraits('armor', i);
        armor.push(i);
      }
      else if (i.type === 'merit') {
        merits.push(i);
      }
      else if (i.type === 'intimacy') {
        intimacies.push(i);
      }
      else if (i.type === 'ritual') {
        rituals.push(i);
      }
      else if (i.type === 'specialty') {
        specialties.push(i);
      }
      else if (i.type === 'specialability') {
        specialAbilities.push(i);
      }
      else if (i.type === 'craftproject') {
        craftProjects.push(i);
      }
      else if (i.type === 'modifier') {
        modifiers.push(i);
      }
      else if (i.type === 'destiny') {
        destinies.push(i);
      }
      else if (i.type === 'shape') {
        shapes.push(i);
      }
      else if (i.type === 'spell') {
        if (i.system.circle !== undefined) {
          spells[i.system.circle].list.push(i);
          spells[i.system.circle].visible = true;
          spells[i.system.circle].collapse = this.spells ? this.spells[i.system.circle].collapse : true;
        }
      }
      else if (i.type === 'action') {
        actions.push(i);
      }
      if (i.system.active) {
        activeItems.push(i);
      }
    }

    let actorCharms = actorData.items.filter((item) => item.type === 'charm');
    actorCharms = actorCharms.sort(function (a, b) {
      const sortValueA = a.system.listingname.toLowerCase() || a.system.ability;
      const sortValueB = b.system.listingname.toLowerCase() || b.system.ability;
      if (sortValueA === sortValueB) {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      }
      return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
    });

    for (let i of actorCharms) {
      if (i.system.diceroller.enabled) {
        if (i.system.listingname) {
          if (!rollCharms[i.system.listingname]) {
            rollCharms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
          }
          rollCharms[i.system.listingname].list.push(i);
        }
        else {
          if (!rollCharms[i.system.ability]) {
            rollCharms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [] };
          }
          rollCharms[i.system.ability].list.push(i);
        }
      }
      if (i.system.diceroller.opposedbonuses.enabled) {
        if (i.system.listingname) {
          if (!defenseCharms[i.system.listingname]) {
            defenseCharms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
          }
          defenseCharms[i.system.listingname].list.push(i);
        }
        else {
          if (!defenseCharms[i.system.ability]) {
            defenseCharms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [] };
          }
          defenseCharms[i.system.ability].list.push(i);
        }
      }
      if (i.system.listingname) {
        if (charms[i.system.listingname]) {
        }
        else {
          charms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [], collapse: this.charms ? this.charms[i.system.listingname]?.collapse : true };
        }
        charms[i.system.listingname].list.push(i);
      }
      else {
        if (charms[i.system.ability]) {
        }
        else {
          charms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [], collapse: this.charms ? this.charms[i.system.ability]?.collapse : true };
        }
        charms[i.system.ability].list.push(i);
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.customabilities = customAbilities;
    actorData.activeitems = activeItems;
    actorData.weapons = weapons;
    actorData.armor = armor;
    actorData.merits = merits;
    actorData.rituals = rituals;
    actorData.intimacies = intimacies;
    actorData.specialties = specialties;
    actorData.charms = charms;
    actorData.rollcharms = rollCharms;
    actorData.defensecharms = defenseCharms;
    actorData.spells = spells;
    actorData.specialabilities = specialAbilities;
    actorData.projects = craftProjects;
    actorData.modifiers = modifiers;
    actorData.actions = actions.sort((actionA, actionB) => actionA.name < actionB.name ? -1 : actionA.name > actionB.name ? 1 : 0);
    actorData.destinies = destinies;
    actorData.shapes = shapes;
  }

  getCharacterDiceCapValue(ability, attribute, hasSpecialty) {
    let diceCap = 0;
    let abilityValue = 0;
    let targetNumber = 0;
    let attributeValue = this.system.attributes[attribute]?.value || 0;
    if (this.system.settings.dicecap.iscustom) {
      let returnValue = 0;
      if (this.system.settings.dicecap.useattribute && this.system.attributes[attribute]?.excellency) {
        returnValue += this.system.attributes[attribute].value;
      }
      if (this.system.settings.dicecap.useability && (this.system.abilities[ability]?.excellency || this.object.customabilities.some(ma => ma._id === ability && ma.system.excellency))) {
        returnValue += this.getCharacterAbilityValue(ability);
      }
      if (this.system.settings.dicecap.usespecialty && this.object.specialty) {
        returnValue += 1;
      }
      if (this.system.settings.dicecap.other) {
        returnValue += getNumberFormula(this.system.settings.dicecap.other, this);
      }
      return {
        dice: returnValue,
        targetNumber: targetNumber,
        cost: returnValue,
      };
    }
    if (ability === 'willpower' || ability === 'fever') {
      return null;
    }
    if (this.items.filter(item => item.type === 'customability').some(ca => ca._id === ability)) {
      abilityValue = this.customabilities.find(x => x._id === ability).system?.points || 0;
    }
    if (this.system.abilities[ability]) {
      abilityValue = this.system.abilities[ability]?.value || 0;
    }

    switch (this.system.details.exalt) {
      case 'abyssal':
      case 'solar':
      case 'infernal':
        diceCap = abilityValue + attributeValue;
        break;
      case 'alchemical':
        diceCap = Math.min(10, attributeValue + this.system.essence.value);
        break;
      case 'dragonblooded':
        diceCap = abilityValue + (hasSpecialty ? 1 : 0);
        break;
      case 'lunar':
        diceCap = attributeValue + this._getHighestAttributeNumber(attribute, this.system.attributes, true);
        break;
      case 'sidereal':
        diceCap = Math.min(5, Math.max(3, this.system.essence.value));
        if (abilityValue === 5) {
          if (this.system.essence.value >= 3) {
            targetNumber = 3;
          }
          else {
            targetNumber = 2;
          }
        }
        else if (abilityValue >= 3) {
          targetNumber = 1;
        }
        break;
      case 'umbral':
        diceCap = Math.min(10, abilityValue + this.system.penumbra.value);
        break;
      case 'liminal':
        if (this.system.anima.value >= 1) {
          diceCap = attributeValue + this.system.essence.value;
        }
        else {
          diceCap = attributeValue;
        }
        break;
      case 'sovereign':
        diceCap = Math.min(Math.max(this.system.essence.value, 3) + this.system.anima.value, 10);
        break;
      default:
        return null;
    }

    return {
      dice: diceCap,
      targetNumber: targetNumber,
      cost: diceCap,
    };
  }

  async restoreHealth(amount, healAggravated = false) {
    let bashingLevels = this.system.health.bashing;
    let lethalLevels = this.system.health.lethal;
    let aggravatedLevels = this.system.health.aggravated;

    if (amount) {
      if (healAggravated) {
        if (aggravatedLevels) {
          aggravatedLevels = Math.max(0, aggravatedLevels - amount);
        }
        amount -= aggravatedLevels;
      }
      if (amount > 0) {
        if (lethalLevels) {
          lethalLevels = Math.max(0, lethalLevels - amount);
        }
      }
      amount -= lethalLevels;
      if (amount > 0) {
        if (bashingLevels) {
          bashingLevels = Math.max(0, bashingLevels - amount);
        }
      }
    }
    await this.update({
      [`system.health.bashing`]: bashingLevels,
      [`system.health.lethal`]: lethalLevels,
      [`system.health.aggravated`]: aggravatedLevels,
    });
  }

  getNpcDiceCapValue(pool) {
    if (this.system.creaturetype !== 'exalt') {
      return null;
    }
    var dicePool = 0;
    if (parseInt(pool)) {
      dicePool = pool;
    } else {
      if (this.actions && this.actions.some(action => action._id === pool)) {
        dicePool = this.actions.find(x => x._id === pool).system.value;
      }
      else if (this.system.pools[pool]) {
        dicePool = this.system.pools[pool].value;
      }
    }
    var diceTier = "zero";
    var diceMap = {
      'zero': 0,
      'two': 2,
      'three': 3,
      'seven': 7,
      'eleven': 11,
    };
    if (dicePool <= 2) {
      diceTier = "two";
    }
    else if (dicePool <= 6) {
      diceTier = "three";
    }
    else if (dicePool <= 10) {
      diceTier = "seven";
    }
    else {
      diceTier = "eleven";
    }
    if (['abyssal', 'solar', 'infernal', 'alchemical'].includes(this.system.details.exalt)) {
      diceMap = {
        'zero': 0,
        'two': 2,
        'three': 5,
        'seven': 7,
        'eleven': 10,
      };
    }
    if (this.system.details.exalt === 'getimian') {
      diceMap = {
        'zero': 0,
        'two': 2,
        'three': 5,
        'seven': 6,
        'eleven': 10,
      };
    }
    if (this.system.details.exalt === "dragonblooded") {
      diceMap = {
        'zero': 0,
        'two': 0,
        'three': 2,
        'seven': 4,
        'eleven': 6,
      };
    }
    if (this.system.details.exalt === "liminal") {
      diceMap = {
        'zero': 0,
        'two': 1,
        'three': 2,
        'seven': 4,
        'eleven': 5,
      };
    }
    if (this.system.details.exalt === "sidereal") {
      dicePool = this.system.essence.value;
    }
    else if (this.system.details.exalt === "lunar") {
      diceMap = {
        'zero': 0,
        'two': 1,
        'three': 2,
        'seven': 4,
        'eleven': 5,
      };
      if (diceTier === 'two') {
        dicePool = 1;
      }
      dicePool = diceTier === 'seven' ? (diceMap[diceTier] * 2) - 1 : diceMap[diceTier] * 2;
    } else {
      dicePool = diceMap[diceTier];
    }
    return {
      dice: dicePool,
      targetNumber: 0,
      cost: dicePool,
    };
  }

  _getHighestAttributeNumber(usedAttribute, attributes, syncedLunar = false) {
    var highestAttributeNumber = 0;
    var highestAttribute = "strength";
    for (let [name, attribute] of Object.entries(attributes)) {
      if (attribute.value > highestAttributeNumber && (!syncedLunar || name !== usedAttribute)) {
        highestAttributeNumber = attribute.value;
        highestAttribute = name;
      }
    }
    return highestAttributeNumber;
  }

  _getStaticCap(actorData, type, value) {
    if (actorData.type === "character") {
      const attributeValue = actorData.system.attributes[actorData.system.settings.staticcapsettings[type].attribute]?.value || 0;
      const abilityValue = actorData.system.abilities[actorData.system.settings.staticcapsettings[type].ability]?.value || 0;
      if (actorData.system.settings.dicecap.iscustom) {
        let returnValue = 0;
        if (actorData.system.settings.dicecap.useattribute && actorData.system.attributes[actorData.system.settings.staticcapsettings[type].attribute]?.excellency) {
          returnValue += attributeValue;
        }
        if (actorData.system.settings.dicecap.useability && actorData.system.abilities[actorData.system.settings.staticcapsettings[type].ability]?.excellency) {
          returnValue += abilityValue;
        }
        if (actorData.system.settings.dicecap.usespecialty) {
          returnValue += (actorData.system.settings.staticcapsettings[type]?.specialty || 0);
        }
        if (actorData.system.settings.dicecap.other) {
          returnValue += getNumberFormula(actorData.system.settings.dicecap.other, this);
        }
        returnValue = Math.floor(returnValue / 2);
        return `+${returnValue} for ${returnValue * 2}m`;
      }
      if (!actorData.system.abilities[actorData.system.settings.staticcapsettings[type].ability]?.excellency && !actorData.system.attributes[actorData.system.settings.staticcapsettings[type].attribute]?.excellency) {
        return '';
      }
      if (actorData.system.details.exalt === 'alchemical') {
        value = Math.min(10, attributeValue + abilityValue);
      }
      value = Math.floor(((attributeValue) + (abilityValue)) / 2);
      switch (actorData.system.details.exalt) {
        case 'dragonblooded':
          value = Math.floor(((abilityValue) + (actorData.system.settings.staticcapsettings[type]?.specialty || 0)) / 2);
          return `+${value} for ${value * 2}m`
        case 'sidereal':
          let baseSidCap = Math.min(5, Math.max(3, actorData.system.essence.value));
          return `+${baseSidCap} for ${baseSidCap * 2}m`
        case 'solar':
        case 'abyssal':
        case 'infernal':
          return `+${value} for ${value * 2}m`;
        case 'alchemical':
          let baseAlchCap = Math.floor(Math.min(10, attributeValue + actorData.system.essence.value) / 2);
          if (type === 'soak') {
            return `+${baseAlchCap} for ${baseAlchCap}m`;
          }
          return `+${baseAlchCap} for ${baseAlchCap * 2}m`;
        case 'lunar':
          let highestAttributeNumber = 0;
          for (let [name, attribute] of Object.entries(actorData.system.attributes)) {
            if (attribute.value > highestAttributeNumber) {
              highestAttributeNumber = attribute.value;
            }
          }
          let newValueLow = Math.floor(attributeValue / 2);
          let newValueHigh = Math.floor((attributeValue + highestAttributeNumber) / 2);
          if (type === 'soak') {
            return `+${newValueLow} for ${newValueLow}m`
          }
          return `+${newValueLow}-${newValueHigh} for ${newValueLow * (type === 'soak' ? 1 : 2)}-${newValueHigh * (type === 'soak' ? 1 : 2)}m`
        case 'liminal':
          value = Math.floor(((actorData.system.attributes[actorData.system.settings.staticcapsettings[type].attribute]?.value || 0) + (actorData.system.anima.value > 0 ? actorData.system.essence.value : 0)) / 2);
          return `+${value} for ${value * 2}m`
        case 'hearteater':
          value = Math.floor((abilityValue + 1) / 2);
          return `+${value} for ${value * 2}m`;
        case 'dreamsouled':
          value = Math.floor(abilityValue / 2);
          return `+${value} for ${value * 2}m`;
        case 'umbral':
          value = Math.floor(Math.min(10, abilityValue + actorData.system.penumbra.value) / 2);
          return `+${value} for ${value * 2}m`
        default:
          return ''
      }
    }
    else if (actorData.system.creaturetype === 'exalt') {
      let caps
      let bonus = 0
      if (actorData.system.details.exalt === 'lunar') {
        if (value <= 1) return `+0 for 0m; +1 for ${type === 'soak' ? 1 : 2}m`
        else if (value <= 3) return `+1 for ${type === 'soak' ? 1 : 2}m; +2 for ${type === 'soak' ? 2 : 4}m`
        else if (value <= 5) return `+2 for ${type === 'soak' ? 2 : 4}m; +4 for ${type === 'soak' ? 4 : 8}m`
        else return `+2 for ${type === 'soak' ? 2 : 4}m; +5 for ${type === 'soak' ? 5 : 10}m`
      }
      else {
        switch (actorData.system.details.exalt) {
          case 'dragonblooded':
            caps = [0, 1, 2, 3]
            break
          case 'sidereal':
            return `(+${actorData.system.essence.value} for ${actorData.system.essence.value * 2}m)`
          case 'solar':
            caps = [0, 1, 3, 5]
            break
          case 'abyssal':
            caps = [0, 1, 3, 5]
            break
          case 'infernal':
            caps = [0, 1, 3, 5]
            break
          case 'getimian':
            caps = [0, 1, 3, 5]
            break
          case 'alchemical':
            const baseAlchBonus = Math.ceil(actorData.system.essence.value / 2);
            caps = [0, baseAlchBonus, baseAlchBonus + 1, baseAlchBonus + 2]
            break
          case 'liminal':
            if (actorData.system.anima.value > 1) bonus = Math.floor(actorData.system.essence.value / 2)
            caps = [0 + bonus, 1 + bonus, 2 + bonus, 2 + bonus]
            break
          default:
            return ''
        }

        if (value <= 1) return `+${caps[0]} for ${caps[0] * 2}m`
        else if (value <= 3) return `+${caps[1]} for ${caps[1] * 2}m`
        else if (value <= 5) return `+${caps[2]} for ${caps[2] * 2}m`
        else return `+${caps[3]} for ${caps[3] * 2}m`
      }
    }

    return "";
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = { ...super.getRollData() };
    let currentParryPenalty = 0;
    let currentEvasionPenalty = 0;
    let currentOnslaughtPenalty = 0;
    let currentDefensePenalty = 0;
    let totalHealth = 0;
    let currentPenalty = 0;
    let coverBonus = 0;

    if (this.system.battlegroup) {
      currentPenalty = 0;
    }
    else {
      for (let [key, healthLevel] of Object.entries(this.system.health.levels)) {
        if ((this.system.health.bashing + this.system.health.lethal + this.system.health.aggravated) > totalHealth) {
          currentPenalty = healthLevel.penalty;
        }
        totalHealth += healthLevel.value;
      }
    }

    for (const effect of this.effects.filter((effect) => !effect.disabled)) {
      for (const change of effect.changes) {
        if (change.key === 'system.evasion.value' && change.value < 0 && change.mode === 2) {
          currentEvasionPenalty += (change.value * -1);
        }
        if (change.key === 'system.parry.value' && change.value < 0 && change.mode === 2) {
          currentParryPenalty += (change.value * -1);
        }
      }
      if (effect.flags.exaltedthird?.statusId === 'onslaught') {
        currentOnslaughtPenalty += (effect.changes[0].value * -1);
      }
      if (effect.flags.exaltedthird?.statusId === 'defensePenalty') {
        currentDefensePenalty += (effect.changes[0].value * -1);
      }
    }
    if (this.effects.some(e => e.statuses.has('prone'))) {
      currentParryPenalty += 1;
      currentEvasionPenalty += 2;
    }
    if (this.effects.some(e => e.statuses.has('surprised'))) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }

    if (this.effects.some(e => e.statuses.has('lightcover'))) {
      coverBonus += 1;
    }
    if (this.effects.some(e => e.statuses.has('heavycover'))) {
      coverBonus += 2;
    }
    if (this.effects.some(e => e.statuses.has('fullcover'))) {
      coverBonus += 3;
    }
    currentParryPenalty += Math.max(0, (currentPenalty === 'inc' ? 4 : currentPenalty) - data.health.penaltymod);
    currentEvasionPenalty += Math.max(0, (currentPenalty === 'inc' ? 4 : currentPenalty) - data.health.penaltymod);

    data.nonsurprisedevasionpenalty = { 'value': currentEvasionPenalty };
    data.nonsurprisedparrypenalty = { 'value': currentParryPenalty };

    if (this.effects.some(e => e.statuses.has('grappled') || this.effects.some(e => e.statuses.has('grappling')))) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }

    let armorPenalty = 0;

    for (let armor of this.items.filter(item => item.type === 'armor' && item.system.equipped)) {
      armorPenalty += Math.abs(armor.system.penalty);
    }

    data.onslaught = { 'value': currentOnslaughtPenalty };
    data.evasionpenalty = { 'value': currentEvasionPenalty };
    data.parrypenalty = { 'value': currentParryPenalty };
    data.defensepenalty = { 'value': currentDefensePenalty };
    data.woundpenalty = { 'value': currentPenalty };
    data.armorpenalty = { 'value': armorPenalty };
    data.mountspeedbonus = { 'value': this.system.mount.speedbonus.value };
    data.shipmomentum = { 'value': this.system.ship.momentum.value };
    data.shipspeed = { 'value': this.system.ship.speed.value };
    data.shipmaneuverability = { 'value': this.system.ship.maneuverability.value };
    data.shiphull = { 'value': this.system.ship.health.max };
    data.shiphullpenalty = { 'value': this.system.ship.health.penalty };

    data.cover = { 'value': coverBonus };
    data.initiative = { 'value': 0 };

    if (!data.size) {
      data.size = {
        value: 0,
        min: 0,
      }
    }

    const tokenId = this.token?.id || this.getActiveTokens()[0]?.id;
    if (game.combat && tokenId) {
      let combatant = game.combat.combatants.find(c => c?.tokenId === tokenId);
      data.initiative = { 'value': combatant?.initiative || 0 };
    }

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    for (const customAbility of this.items.filter(item => item.type === 'customability')) {
      if (!data[customAbility.system.formulaKey]) {
        const customAbilityformulaKey = customAbility.system.formulaKey || customAbility.name.replace(/\s/g, '').toLowerCase();
        data[customAbilityformulaKey] = { 'value': customAbility.system.points };
      }
    }

    for (const modifier of this.items.filter(item => item.type === 'modifier')) {
      if (!data[modifier.system.formulaKey]) {
        const modifierformulaKey = modifier.system.formulaKey || modifier.name.replace(/\s/g, '').toLowerCase();
        data[modifierformulaKey] = { 'value': modifier.system.value };
      }
    }

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    if (data.attributes) {
      for (let [k, v] of Object.entries(data.attributes)) {
        data[k] = foundry.utils.deepClone(v);
        data[`${k}upgrade`] = { 'value': v.upgrade };
      }
    }
  }

  _getNpcRollData(data) {
    if (this.type !== 'npc') return;
  }

  async actionRoll(data) {
    if (!data.actorCombatant && game.combat && !this.isToken && game.combat.combatants.filter(c => c.actorId === this.id).length > 1) {
      // const activeTokens = this.getActiveTokens();
      const combatant = await foundry.applications.api.DialogV2.wait({
        window: { title: game.i18n.localize("Ex3.SelectInitiativeTrack"), resizable: true },
        content: '',
        classes: [this.getSheetBackground(), 'button-select-dialog'],
        modal: true,
        buttons: game.combat.combatants.filter(c => c.actorId === this.id).sort((a, b) => (a.initiative || -100) - (b.initiative || -100)).map((combatant, index) => ({
          action: `${index}`,
          label: `${combatant.initiative}i`,
          callback: (event, button, dialog) => combatant
        }))
      });
      data.actorCombatant = combatant;
    }
    let message = data.rollType !== 'useOpposingCharms' ? await this.sendTargetingChatMessage(data) : null;
    if (message) {
      data.preMessageId = message.id;
    }
    if (data.rollType === 'useOpposingCharms') {
      game.opposingCharmForm = await new RollForm(this, { classes: [" exaltedthird exaltedthird-dialog dice-roller", this.getSheetBackground()], position: { width: 846, height: 642 } }, {}, data).render(true);
    } else {
      game.rollForm = await new RollForm(this, { classes: [" exaltedthird exaltedthird-dialog dice-roller", this.getSheetBackground()], position: { width: 763 } }, {}, data).render(true);
    }
  }

  getSheetBackground() {
    if (this.system.settings.sheetbackground === 'default') {
      return `${game.settings.get("exaltedthird", "sheetStyle")}-background`;
    }
    return `${this.system.settings.sheetbackground}-background`;
  }

  async sendTargetingChatMessage(data) {
    const imageUrl = CONFIG.exaltedthird.rollTypeTargetImages[data.attackType] || CONFIG.exaltedthird.rollTypeTargetImages[data.rollType] || CONFIG.exaltedthird.rollTypeTargetImages[data.ability] || "systems/exaltedthird/assets/icons/d10.svg";
    const rollTypeLabel = CONFIG.exaltedthird.rollTypeTargetLabels[data.attackType] || CONFIG.exaltedthird.rollTypeTargetLabels[data.rollType] || CONFIG.exaltedthird.rollTypeTargetLabels[data.ability] || "Ex3.Roll";
    if (game.user.targets && game.user.targets.size > 0) {
      for (const target of Array.from(game.user.targets)) {
        const messageContent = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/chat/targeting-card.html", {
          actor: this,
          targetActor: target.actor,
          imgUrl: imageUrl,
          rollType: rollTypeLabel,
        });
        return await ChatMessage.create({
          user: game.user.id,
          content: messageContent,
          style: CONST.CHAT_MESSAGE_STYLES.OTHER,
          flags: {
            "exaltedthird": {
              rollerUuid: this.uuid,
              targetActorId: target.actor.id,
              targetTokenId: target.id,
            }
          },
        });
      }
    } else if (CONFIG.exaltedthird.targetableRollTypes.includes(data.rollType)) {
      const messageContent = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/chat/targeting-card.html", {
        actor: this,
        targetActor: null,
        imgUrl: imageUrl,
        rollType: rollTypeLabel,
      });
      return await ChatMessage.create({
        user: game.user.id,
        content: messageContent,
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        flags: {
          "exaltedthird": {
            rollerUuid: this.uuid,
            targetActorId: null,
            targetTokenId: null,
          }
        },
      });
    } else if (game.settings.get("exaltedthird", "nonTargetRollCards")) {
      const messageContent = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/chat/pre-roll-card.html", {
        actor: this,
        imgUrl: imageUrl,
        rollType: rollTypeLabel,
      });
      return await ChatMessage.create({
        user: game.user.id,
        content: messageContent,
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        flags: {
          "exaltedthird": {
            rollerUuid: this.uuid,
            targetActorId: null,
            targetTokenId: null,
          }
        },
      });
    }
  }

  getCharacterAbilityValue(ability) {
    if (this.type === 'npc') {
      return 0;
    }
    if (this.items.filter(item => item.type === 'customability').some(ca => ca._id === ability)) {
      return this.items.filter(item => item.type === 'customability').find(x => x._id === ability).system.points;
    }
    if (this.system.abilities[ability]) {
      return this.system.abilities[ability]?.value || 0;
    }
    if (ability === 'willpower') {
      return this.system.willpower.max;
    }
    if (ability === 'fever') {
      return this.system.fever.value;
    }
    return 0;
  }

  alterDefensePenalty(direction = "increase", statusId = "defensePenalty") {
    let icon = 'systems/exaltedthird/assets/icons/slashed-shield.svg';
    let label = "Defense Penalty";
    if (label === 'onslaught') {
      icon = 'systems/exaltedthird/assets/icons/surrounded-shield.svg';
    }
    const existingPenalty = this.effects.find(i => i.flags.exaltedthird?.statusId === statusId);

    if (direction === "increase") {
      if (existingPenalty) {
        let changes = foundry.utils.duplicate(existingPenalty.changes);
        changes[0].value = changes[0].value - 1;
        changes[1].value = changes[1].value - 1;
        existingPenalty.update({ changes });
      }
      else {
        this.createEmbeddedDocuments('ActiveEffect', [{
          name: label,
          icon: icon,
          origin: this.uuid,
          disabled: false,
          duration: {
            rounds: 10,
          },
          flags: {
            "exaltedthird": {
              statusId: statusId,
            }
          },
          changes: [
            {
              "key": "system.evasion.value",
              "value": -1,
              "mode": 2
            },
            {
              "key": "system.parry.value",
              "value": -1,
              "mode": 2
            }
          ]
        }]);
      }
    } else {
      if (existingPenalty) {
        let changes = foundry.utils.duplicate(existingPenalty.changes);
        if (changes[0].value < -1) {
          changes[0].value = parseInt(changes[0].value) + 1;
          changes[1].value = parseInt(changes[1].value) + 1;
          existingPenalty.update({ changes });
        }
        else {
          existingPenalty.delete();
        }
      }
    }
  }

  async _displayCard(item, cardType = "") {
    const token = this.token
    if (cardType === 'Spent' && (item.system.cost?.commitmotes || 0) > 0 || item.system.activatable) {
      if (item.system.active) {
        cardType = "Deactivate";
      }
      else {
        cardType = "Activate";
      }
    }
    const templateData = {
      actor: this,
      tokenId: token?.uuid || null,
      item: item,
      cardType: cardType,
    };
    const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this, token }),
    };
    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }
}

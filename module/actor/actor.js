import { animaTokenMagic, RollForm } from "../apps/dice-roller.js";
import { prepareItemTraits } from "../item/item.js";

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
    await super._preUpdate(updateData, options, user);
    const exalt = updateData.system?.details?.exalt || this.system.details.exalt;
    const essenceLevel = updateData.system?.essence?.value || this.system.essence.value;
    const casteAbilitiesMap = CONFIG.exaltedthird.casteabilitiesmap;
    if (updateData.system?.battlegroup && !this.system.battlegroup) {
      updateData.system.health = {
        "levels": {
          "zero": {
            "value": this.system.health.levels.zero.value + this.system.health.levels.one.value + this.system.health.levels.two.value + this.system.health.levels.three.value + this.system.health.levels.four.value + 1,
          }
        }
      };
    }
    if (updateData.system?.details?.exalt || updateData.system?.essence?.value || updateData.system?.creaturetype) {
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
        if (updateData.system?.details?.exalt) {
          updateData.system.traits = {
            resonance: this.calculateResonance(updateData.system?.details?.exalt),
            dissonance: this.calculateDissonance(updateData.system?.details?.exalt),
          };
        }
      }
      else {
        var personalMotes = essenceLevel * 10;
        var peripheralmotes = 0;
        if (updateData.system?.creaturetype === 'god' || updateData.system?.creaturetype === 'undead' || updateData.system?.creaturetype === 'demon') {
          personalMotes += 50;
        }
        if ((updateData.system?.creaturetype || this.system.creaturetype) === 'exalt') {
          peripheralmotes = this.calculateMaxExaltedMotes('peripheral', updateData.system?.details?.exalt || this.system.details.exalt, essenceLevel);
          personalMotes = this.calculateMaxExaltedMotes('personal', updateData.system?.details?.exalt || this.system.details.exalt, essenceLevel);
        }
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
      if (updateData.system?.details?.exalt) {
        let hasAura = false;
        if (updateData.system?.details?.exalt === 'dragonblooded') {
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
      }
    }
    if (updateData.system?.details?.caste && this.type === 'character') {
      const lowecaseCaste = updateData.system?.details?.caste.toLowerCase();
      const attributes = updateData.system?.attributes || this.system.attributes;
      const abilities = updateData.system?.abilities || this.system.abilities;
      for (let [key, attribute] of Object.entries(this.system.attributes)) {
        if (casteAbilitiesMap[lowecaseCaste]?.includes(key)) {
          attributes[key].favored = true;
          attributes[key].caste = true;
        }
        else {
          attributes[key].caste = false;
        }
      }
      for (let [key, ability] of Object.entries(this.system.abilities)) {
        if (casteAbilitiesMap[lowecaseCaste]?.includes(key)) {
          abilities[key].favored = true;
          abilities[key].caste = true;
        }
        else {
          abilities[key].caste = false;
        }
      }
      updateData.system.attributes = attributes;
      updateData.system.abilities = abilities;
    }
  }

  spendMotes(moteCost, actorData) {
    var newLevel = actorData.system.anima.level;
    var newValue = actorData.system.anima.value;

    var spentPersonal = 0;
    var spentPeripheral = 0;
    if (actorData.system.settings.charmmotepool === 'personal') {
      var remainingPersonal = actorData.system.motes.personal.value - moteCost;
      if (remainingPersonal < 0) {
        spentPersonal = moteCost + remainingPersonal;
        spentPeripheral = Math.min(actorData.system.motes.peripheral.value, Math.abs(remainingPersonal));
      }
      else {
        spentPersonal = moteCost;
      }
    }
    else {
      var remainingPeripheral = actorData.system.motes.peripheral.value - moteCost;
      if (remainingPeripheral < 0) {
        spentPeripheral = moteCost + remainingPeripheral;
        spentPersonal = Math.min(actorData.system.motes.personal.value, Math.abs(remainingPeripheral));
      }
      else {
        spentPeripheral = moteCost;
      }
    }
    var newPeripheralMotes = Math.max(0, actorData.system.motes.peripheral.value - spentPeripheral);
    var newPersonalMotes = Math.max(0, actorData.system.motes.personal.value - spentPersonal);

    if (spentPeripheral > 4) {
      for (var i = 0; i < Math.floor(spentPeripheral / 5); i++) {
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

    return {
      newPersonalMotes: newPersonalMotes,
      newPeripheralMotes: newPeripheralMotes,
      newAnimaLevel: newLevel,
      newAnimaValue: newValue,
    }
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
    const html = await renderTemplate("systems/exaltedthird/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this, token }),
    };


    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }

  calculateMaxExaltedMotes(moteType, exaltType, essenceLevel) {
    var maxMotes = 0;
    if (moteType === 'personal') {
      if (exaltType === 'solar' || exaltType === 'abyssal' || exaltType === 'infernal') {
        maxMotes = 10 + (essenceLevel * 3);
      }
      if (exaltType === 'dragonblooded') {
        maxMotes = 11 + essenceLevel;
      }
      if (exaltType === 'lunar' || exaltType === 'alchemical' || exaltType === 'getimian') {
        maxMotes = 15 + essenceLevel;
      }
      if (exaltType === 'sovereign') {
        maxMotes = 4 + essenceLevel;
      }
      if (exaltType === 'exigent') {
        if (this.system.settings?.exigenttype === 'celestial') {
          maxMotes = 11 + (essenceLevel * 2);
        }
        else {
          maxMotes = 11 + essenceLevel;
        }
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
      if (exaltType === 'dreamsouled' || this.system.details?.caste?.toLowerCase() === 'architect' || this.system.details?.caste?.toLowerCase() === 'puppeteer') {
        maxMotes = 11 + essenceLevel;
      }
      if (this.system.details?.caste?.toLowerCase() === 'janest' || this.system.details?.caste.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
        maxMotes = 11 + (essenceLevel * 2);
      }
    }
    else {
      if (exaltType === 'solar' || exaltType === 'abyssal' || exaltType === 'infernal') {
        maxMotes = 26 + (essenceLevel * 7);
      }
      if (exaltType === 'dragonblooded') {
        maxMotes = 23 + (essenceLevel * 4);
      }
      if (exaltType === 'lunar') {
        maxMotes = 34 + (essenceLevel * 4);
      }
      if (exaltType === 'sovereign') {
        maxMotes = 30 + (essenceLevel * 4);
      }
      if (exaltType === 'exigent') {
        if (this.system.settings?.exigenttype === 'celestial') {
          maxMotes = 27 + (essenceLevel * 6);
        }
        else {
          maxMotes = 23 + (essenceLevel * 4);
        }
      }
      if (exaltType === 'sidereal' || exaltType === 'alchemical' || exaltType === 'getimian') {
        maxMotes = 25 + (essenceLevel * 6);
      }
      if (exaltType === 'liminal') {
        maxMotes = 23 + (essenceLevel * 4);
      }
      if (exaltType === 'dreamsouled' || this.system.details?.caste?.toLowerCase() === 'architect' || this.system.details?.caste?.toLowerCase() === 'puppeteer') {
        maxMotes = 23 + (essenceLevel * 4);
      }
      if (this.system.details?.caste?.toLowerCase() === 'janest' || this.system.details?.caste?.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
        maxMotes = 27 + (essenceLevel * 6);
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
    const actorData = duplicate(this);
    actorData.system.motes.personal.value = this.calculateMaxExaltedMotes('personal', actorData.system.details.exalt, actorData.system.essence.value) - actorData.system.motes.peripheral.committed;
    actorData.system.motes.personal.max = this.calculateMaxExaltedMotes('personal', actorData.system.details.exalt, actorData.system.essence.value);
    actorData.system.motes.peripheral.value = this.calculateMaxExaltedMotes('peripheral', actorData.system.details.exalt, actorData.system.essence.value - actorData.system.motes.peripheral.committed);
    actorData.system.motes.peripheral.max = this.calculateMaxExaltedMotes('peripheral', actorData.system.details.exalt, actorData.system.essence.value);
    this.update(actorData);
  }

  async calculateAllDerivedStats() {
    await this.calculateCharacterMotes();
    await this.calculateDerivedStats('parry');
    await this.calculateDerivedStats('evasion');
    await this.calculateDerivedStats('guile');
    await this.calculateDerivedStats('resolve');
    await this.calculateDerivedStats('hardness');
    await this.calculateDerivedStats('soak');
    await this.calculateDerivedStats('natural-soak');
    await this.calculateDerivedStats('armored-soak');
    await this.calculateDerivedStats('resonance');
  }

  async calculateDerivedStats(type) {
    const actorData = duplicate(this);
    var armoredSoakValue = 0;

    var staticAttributeValue = actorData.system.attributes[actorData.system.settings.staticcapsettings[type]?.attribute]?.value || 0;
    var staticAbilityValue = 0;
    if(actorData.system.settings.staticcapsettings[type]?.ability && actorData.system.settings.staticcapsettings[type]?.ability !== 'none') {
      if (this.items.filter(item => item.type === 'customability').some(ca => ca._id === actorData.system.settings.staticcapsettings[type].ability)) {
        staticAbilityValue = this.items.filter(item => item.type === 'customability').find(x => x._id === actorData.system.settings.staticcapsettings[type].ability).system.points;
      }
      else {
        staticAbilityValue = actorData.system.abilities[actorData.system.settings.staticcapsettings[type].ability].value;
      }
    }
    if (type === 'natural-soak') {
      actorData.system.naturalsoak.value = actorData.system.attributes[actorData.system.settings.staticcapsettings.soak.attribute]?.value;
    }
    if (type === 'soak' || type === 'armored-soak' || type === 'all') {
      for (let armor of this.armor) {
        if (armor.system.equipped) {
          armoredSoakValue = armoredSoakValue + armor.system.soak;
        }
      }
      if (type === 'armored-soak' || type === 'all') {
        actorData.system.armoredsoak.value = armoredSoakValue;
      }
      if (type === 'soak' || type === 'all') {
        actorData.system.soak.value = staticAttributeValue + armoredSoakValue;
      }
    }
    let specialtyBonus = actorData.system?.settings?.staticcapsettings[type]?.specialty ? 1 : 0;
    if (type === 'parry' || type === 'all') {
      actorData.system.parry.value = Math.ceil((staticAttributeValue + staticAbilityValue + specialtyBonus) / 2);
      for (let weapon of this.weapons) {
        if (weapon.system.equipped) {
          actorData.system.parry.value = actorData.system.parry.value + weapon.system.defense;
        }
      }
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
    this.update(actorData);
  }

  calculateResonance(exaltType) {
    var resonance = {
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
      "sidereal": ['starmetal'],
      "soverign": [],
      "solar": ['adamant', 'orichalcum', 'moonsilver', 'starmetal', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "umbral": ['soulsteel'],
    }

    if (exaltType === 'exigent') {
      if (this.system.details.caste?.toLowerCase() === 'janest' || this.system.details.caste?.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
        resonance.value = ['orichalcum', 'greenjade'];
      }
      if (this.system.details.caste?.toLowerCase() === 'puppeteer') {
        resonance.value = [];
        resonance.custom = 'Artifact Puppets';
      }
    }
    else {
      resonance.value = resonanceChart[exaltType];
    }
    return resonance;
  }

  calculateDissonance(exaltType) {
    var dissonance = {
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
      "lunar": "",
      "sidereal": ['adamant', 'orichalcum', 'moonsilver', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "solar": [],
      "soverign": ['orichalcum', 'moonsilver', 'starmetal', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "umbral": [],
    }

    if (exaltType === 'exigent') {
      if (this.system.details?.caste?.toLowerCase() === 'janest' || this.system.details.caste?.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
        dissonance.value = ['soulsteel'];
      }
      if (this.system.details?.caste?.toLowerCase() === 'puppeteer') {
        dissonance.value = ['adamant', 'orichalcum', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'];
      }
    }
    else {
      dissonance.value = dissonanceChart[exaltType];
    }
    return dissonance;
  }

  async rollEmbeddedItem(itemId, personal = false) {

    const actorData = duplicate(this);

    let item = this.items.find(x => x.id == itemId);

    if (!item) {
      return ui.notifications.error(`${this.name} does not have an embedded item id ${itemId}!`);
    }

    if (item.type === 'charm') {
      if (item.system.cost.motes > 0) {
        if (data.data.motes.peripheral.value > 0 && !personal) {
          data.data.motes.peripheral.value = Math.max(0, data.data.motes.peripheral.value - item.system.cost.motes);
        }
        else {
          data.data.motes.personal.value = Math.max(0, data.data.motes.personal.value - item.system.cost.motes);
        }
      }
      data.data.willpower.value = Math.max(0, data.data.willpower.value - item.system.cost.willpower);
      if (this.type === 'character') {
        data.data.craft.experience.silver.value = Math.max(0, data.data.craft.experience.silver.value - item.system.cost.silverxp);
        data.data.craft.experience.gold.value = Math.max(0, data.data.craft.experience.gold.value - item.system.cost.goldxp);
        data.data.craft.experience.white.value = Math.max(0, data.data.craft.experience.white.value - item.system.cost.whitexp);
      }
      if (data.data.details.aura === item.system.cost.aura || item.system.cost.aura === 'any') {
        data.data.details.aura = "none";
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
        var newLevel = data.data.anima.level;
        var newValue = data.data.anima.value;
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
        data.data.anima.level = newLevel;
        data.data.anima.value = newValue;
      }
      if (item.system.cost.health > 0) {
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(data.data.health.levels)) {
          totalHealth += health_level.value;
        }
        if (item.system.cost.healthtype === 'bashing') {
          data.data.health.bashing = Math.min(totalHealth - data.data.health.aggravated - data.data.health.lethal, data.data.health.bashing + item.system.cost.health);
        }
        else if (item.system.cost.healthtype === 'lethal') {
          data.data.health.lethal = Math.min(totalHealth - data.data.health.bashing - data.data.health.aggravated, data.data.health.lethal + item.system.cost.health);
        }
        else {
          data.data.health.aggravated = Math.min(totalHealth - data.data.health.bashing - data.data.health.lethal, data.data.health.aggravated + item.system.cost.health);
        }
      }
    }
    if (item.type === 'spell') {
      data.data.sorcery.motes = 0;
    }

    this.displayEmbeddedItem(itemId);

    this.update(actorData);
  }

  async savedRoll(name) {
    const roll = Object.values(this.system.savedRolls).find(x => x.name === name);
    if (!roll) {
      return ui.notifications.error(`${this.name} does not have a saved roll named ${name}!`);
    }
    game.rollForm = await new RollForm(this, { event: this.event }, {}, { rollId: roll.id, skipDialog: true }).roll();
  }

  getSavedRoll(name) {
    const roll = Object.values(this.system.savedRolls).find(x => x.name === name);
    if (!roll) {
      return ui.notifications.error(`${this.name} does not have a saved roll named ${name}!`);
    }
    return new RollForm(this, { event: this.event }, {}, { rollId: roll.id });
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
      for (let [key, health_level] of Object.entries(data.health.levels)) {
        if ((data.health.bashing + data.health.lethal + data.health.aggravated) > totalHealth) {
          currentPenalty = health_level.penalty;
        }
        totalHealth += health_level.value;
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


    for (let [key, health_level] of Object.entries(data.warstrider.health.levels)) {
      if ((data.warstrider.health.bashing + data.warstrider.health.lethal + data.warstrider.health.aggravated) > totalWarstriderHealth) {
        currentWarstriderPenalty = health_level.penalty;
      }
      totalWarstriderHealth += health_level.value;
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


    for (let [key, health_level] of Object.entries(data.ship.health.levels)) {
      if ((data.ship.health.bashing + data.ship.health.lethal + data.ship.health.aggravated) > totalShipHealth) {
        currentShipPenalty = health_level.penalty;
      }
      totalShipHealth += health_level.value;
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

    var currentParryPenalty = 0;
    var currentEvasionPenalty = 0;
    var currentOnslaughtPenalty = 0;
    var currentDefensePenalty = 0;

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
    if (actorData.system.health.penalty !== 'inc') {
      currentParryPenalty += Math.max(0, data.health.penalty - data.health.penaltymod);
      currentEvasionPenalty += Math.max(0, data.health.penalty - data.health.penaltymod);
    }
    data.currentParryPenalty = currentParryPenalty;
    data.currentEvasionPenalty = currentEvasionPenalty;
    data.currentOnslaughtPenalty = currentOnslaughtPenalty;
    data.currentDefensePenalty = currentDefensePenalty;

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
    actorData.actions = actions.sort((actionA, actionB) => actionA.name < actionB.name ? -1 : actionA.name > actionB.name ? 1 : 0);
    actorData.destinies = destinies;
    actorData.shapes = shapes;
  }

  _getStaticCap(actorData, type, value) {
    if (actorData.type === "character") {
      if (!actorData.system.abilities[actorData.system.settings.staticcapsettings[type].ability]?.excellency && !actorData.system.attributes[actorData.system.settings.staticcapsettings[type].attribute]?.excellency) {
        return '';
      }
      const attributeValue = actorData.system.attributes[actorData.system.settings.staticcapsettings[type].attribute]?.value || 0;
      const abilityValue = actorData.system.abilities[actorData.system.settings.staticcapsettings[type].ability]?.value || 0;
      value = Math.floor(((attributeValue) + (abilityValue)) / 2);
      switch (actorData.system.details.exalt) {
        case 'dragonblooded':
          value = Math.floor(((abilityValue) + (actorData.system.settings.staticcapsettings[type]?.specialty || 0)) / 2);
          return `(+${value} for ${value * 2}m)`
        case 'sidereal':
          var baseSidCap = Math.min(5, Math.max(3, actorData.system.essence.value));
          return `(+${baseSidCap} for ${baseSidCap * 2}m)`
        case 'solar':
          return `(+${value} for ${value * 2}m)`
        case 'abyssal':
          return `(+${value} for ${value * 2}m)`
        case 'lunar':
          var highestAttributeNumber = 0;
          for (let [name, attribute] of Object.entries(actorData.system.attributes)) {
            if (attribute.value > highestAttributeNumber) {
              highestAttributeNumber = attribute.value;
            }
          }
          var newValueLow = Math.floor(attributeValue / 2);
          var newValueHigh = Math.floor((attributeValue + highestAttributeNumber) / 2);
          if (type === 'soak') {
            return `(+${newValueLow} for ${newValueLow * 2}m)`
          }
          return `(+${newValueLow}-${newValueHigh} for ${newValueLow * (type === 'soak' ? 1 : 2)}-${newValueHigh * (type === 'soak' ? 1 : 2)}m)`
        case 'liminal':
          value = Math.floor(((actorData.system.attributes[actorData.system.settings.staticcapsettings[type].attribute]?.value || 0) + (actorData.system.anima.value > 0 ? actorData.system.essence.value : 0)) / 2);
          return `(+${value} for ${value * 2}m)`
        case 'hearteater':
          value = Math.floor((abilityValue + 1) / 2);
          return `(+${value} for ${value * 2}m)`;
        case 'dreamsouled':
          value = Math.floor(abilityValue / 2);
          return `(+${value} for ${value * 2}m)`;
        case 'umbral':
          value = Math.floor(Math.min(10, abilityValue + actorData.system.penumbra.value) / 2);
          return `(+${value} for ${value * 2}m)`
        default:
          return ''
      }
    }
    else if (actorData.system.creaturetype === 'exalt') {
      let caps
      let bonus = 0
      if (actorData.system.details.exalt === 'lunar') {
        if (value <= 1) return `(+0 for 0m; +1 for ${type === 'soak' ? 1 : 2}m)`
        else if (value <= 3) return `(+1 for ${type === 'soak' ? 1 : 2}m; +2 for ${type === 'soak' ? 2 : 4}m)`
        else if (value <= 5) return `(+2 for ${type === 'soak' ? 2 : 4}m; +4 for ${type === 'soak' ? 4 : 8}m)`
        else return `(+2 for ${type === 'soak' ? 2 : 4}m; +5 for ${type === 'soak' ? 5 : 10}m)`
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
            caps = [0, 1, 3, 5]
            break
          case 'liminal':
            if (actorData.system.anima.value > 1) bonus = Math.floor(actorData.system.essence.value / 2)
            caps = [0 + bonus, 1 + bonus, 2 + bonus, 2 + bonus]
            break
          default:
            return ''
        }

        if (value <= 1) return `(+${caps[0]} for ${caps[0] * 2}m)`
        else if (value <= 3) return `(+${caps[1]} for ${caps[1] * 2}m)`
        else if (value <= 5) return `(+${caps[2]} for ${caps[2] * 2}m)`
        else return `(+${caps[3]} for ${caps[3] * 2}m)`
      }
    }

    return "";
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = { ...super.getRollData() };
    var currentParryPenalty = 0;
    var currentEvasionPenalty = 0;
    var currentOnslaughtPenalty = 0;
    var currentDefensePenalty = 0;
    var totalHealth = 0;
    var currentPenalty = 0;

    if (this.system.battlegroup) {
      currentPenalty = 0;
    }
    else {
      for (let [key, health_level] of Object.entries(this.system.health.levels)) {
        if ((this.system.health.bashing + this.system.health.lethal + this.system.health.aggravated) > totalHealth) {
          currentPenalty = health_level.penalty;
        }
        totalHealth += health_level.value;
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
    if (this.effects.some(e => e.statuses.has('grappled') || this.effects.some(e => e.statuses.has('grappling')))) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }
    if (currentPenalty !== 'inc') {
      currentParryPenalty += Math.max(0, currentPenalty - data.health.penaltymod);
      currentEvasionPenalty += Math.max(0, currentPenalty - data.health.penaltymod);
    }

    let armorPenalty = 0;

    for (let armor of this.items.filter(item => item.type === 'armor' && item.system.equipped)) {
      armorPenalty += Math.abs(armor.system.penalty);
    }

    data.woundpenalty = { 'value': currentPenalty };
    data.evasionpenalty = { 'value': currentEvasionPenalty };
    data.onslaught = { 'value': currentOnslaughtPenalty };
    data.parrypenalty = { 'value': currentParryPenalty };
    data.defensepenalty = { 'value': currentDefensePenalty };
    data.armorpenalty = {'value': armorPenalty};
    if (!data.size) {
      data.size = {
        value: 0,
        min: 0,
      }
    }

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

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
      }
    }
  }

  _getNpcRollData(data) {
    if (this.type !== 'npc') return;
  }

}


export async function addDefensePenalty(actor, label = "Defense Penalty") {
  var icon = 'systems/exaltedthird/assets/icons/slashed-shield.svg';
  var statusId = 'defensePenalty';
  if (label === 'Onslaught') {
    icon = 'systems/exaltedthird/assets/icons/surrounded-shield.svg';
    statusId = 'onslaught';
  }
  const existingPenalty = actor.effects.find(i => i.flags.exaltedthird?.statusId === statusId);
  if (existingPenalty) {
    let changes = duplicate(existingPenalty.changes);
    changes[0].value = changes[0].value - 1;
    changes[1].value = changes[1].value - 1;
    existingPenalty.update({ changes });
  }
  else {
    actor.createEmbeddedDocuments('ActiveEffect', [{
      name: label,
      icon: icon,
      origin: actor.uuid,
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
          "key": "data.evasion.value",
          "value": -1,
          "mode": 2
        },
        {
          "key": "data.parry.value",
          "value": -1,
          "mode": 2
        }
      ]
    }]);
  }
}

export async function subtractDefensePenalty(actor, label = "Defense Penalty") {
  var icon = 'systems/exaltedthird/assets/icons/slashed-shield.svg';
  var statusId = 'defensePenalty';
  if (label === 'Onslaught') {
    icon = 'systems/exaltedthird/assets/icons/surrounded-shield.svg';
    statusId = 'onslaught';
  }
  const existingPenalty = actor.effects.find(i => i.flags.exaltedthird?.statusId === statusId);
  if (existingPenalty) {
    let changes = duplicate(existingPenalty.changes);
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

export async function spendEmbeddedItem(actor, item) {
  const actorData = await duplicate(actor);
  let updateActive = null;

  if (item.type === 'charm') {
    if (item.system.active) {
      updateActive = false;
      if (actorData.system.settings.charmmotepool === 'personal') {
        if (item.system.cost.commitmotes > 0) {
          actorData.system.motes.personal.committed -= item.system.cost.commitmotes;
        }
      }
      else {
        if (item.system.cost.commitmotes > 0) {
          actorData.system.motes.peripheral.committed -= item.system.cost.commitmotes;
        }
      }
    }
    else {
      var newLevel = actorData.system.anima.level;
      var newValue = actorData.system.anima.value;
      if (item.system.cost.anima > 0) {
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
      }
      if (item.system.cost.motes > 0 || item.system.cost.commitmotes > 0) {
        var spendingMotes = item.system.cost.motes + item.system.cost.commitmotes;
        var spentPersonal = 0;
        var spentPeripheral = 0;
        if (actorData.system.settings.charmmotepool === 'personal') {
          var remainingPersonal = actorData.system.motes.personal.value - spendingMotes;
          if (remainingPersonal < 0) {
            spentPersonal = spendingMotes + remainingPersonal;
            spentPeripheral = Math.min(actorData.system.motes.peripheral.value, Math.abs(remainingPersonal));
          }
          else {
            spentPersonal = spendingMotes;
          }
          if (item.system.cost.commitmotes > 0) {
            actorData.system.motes.personal.committed += item.system.cost.commitmotes;
          }
        }
        else {
          var remainingPeripheral = actorData.system.motes.peripheral.value - spendingMotes;
          if (remainingPeripheral < 0) {
            spentPeripheral = spendingMotes + remainingPeripheral;
            spentPersonal = Math.min(actorData.system.motes.personal.value, Math.abs(remainingPeripheral));
          }
          else {
            spentPeripheral = spendingMotes;
          }
          if (item.system.cost.commitmotes > 0) {
            actorData.system.motes.peripheral.committed += item.system.cost.commitmotes;
          }
        }
        actorData.system.motes.peripheral.value = Math.max(0, actorData.system.motes.peripheral.value - spentPeripheral);
        actorData.system.motes.personal.value = Math.max(0, actorData.system.motes.personal.value - spentPersonal);

        if (spentPeripheral > 4 && !item.system.keywords.toLowerCase().includes('mute')) {
          for (var i = 0; i < Math.floor(spentPeripheral / 5); i++) {
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
        if (item.system.cost.commitmotes > 0) {
          updateActive = true;
        }
      }
      actorData.system.anima.level = newLevel;
      actorData.system.anima.value = newValue;
      actorData.system.willpower.value = Math.max(0, actorData.system.willpower.value - item.system.cost.willpower);
      if (actor.type === 'character') {
        actorData.system.craft.experience.silver.value = Math.max(0, actorData.system.craft.experience.silver.value - item.system.cost.silverxp);
        actorData.system.craft.experience.gold.value = Math.max(0, actorData.system.craft.experience.gold.value - item.system.cost.goldxp);
        actorData.system.craft.experience.white.value = Math.max(0, actorData.system.craft.experience.white.value - item.system.cost.whitexp);
      }
      if (actorData.system.details.aura === item.system.cost.aura || item.system.cost.aura === 'any') {
        actorData.system.details.aura = "none";
      }
      if (item.system.cost.health > 0) {
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(actorData.system.health.levels)) {
          totalHealth += health_level.value;
        }
        if (item.system.cost.healthtype === 'bashing') {
          actorData.system.health.bashing = Math.min(totalHealth - actorData.system.health.aggravated - actorData.system.health.lethal, actorData.system.health.bashing + item.system.cost.health);
        }
        else if (item.system.cost.healthtype === 'lethal') {
          actorData.system.health.lethal = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.aggravated, actorData.system.health.lethal + item.system.cost.health);
        }
        else {
          actorData.system.health.aggravated = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.lethal, actorData.system.health.aggravated + item.system.cost.health);
        }
      }
      if (actorData.system.settings.charmmotepool === 'personal') {
        actorData.system.motes.personal.value = Math.min(actorData.system.motes.personal.max, actorData.system.motes.personal.value + item.system.restore.motes);
      }
      else {
        actorData.system.motes.peripheral.value = Math.min(actorData.system.motes.peripheral.max, actorData.system.motes.peripheral.value + item.system.restore.motes);
      }
      actorData.system.willpower.value = Math.min(actorData.system.willpower.max, actorData.system.willpower.value + item.system.restore.willpower);
      if (item.system.restore.health > 0) {
        const bashingHealed = item.system.restore.health - actorData.system.health.lethal;
        actorData.system.health.lethal = Math.max(0, actorData.system.health.lethal - item.system.restore.health);
        if (bashingHealed > 0) {
          actorData.system.health.bashing = Math.max(0, actorData.system.health.bashing - bashingHealed);
        }
      }
      const tokenId = actor.token?.id || actor.getActiveTokens()[0]?.id;
      if (game.combat && tokenId) {
        let combatant = game.combat.combatants.find(c => c?.tokenId === tokenId);
        if (combatant) {
          var newInitiative = combatant.initiative;
          if (item.system.cost.initiative > 0) {
            newInitiative -= item.system.cost.initiative;
          }
          if (combatant.initiative > 0 && newInitiative <= 0) {
            newInitiative -= 5;
          }
          newInitiative += item.system.restore.initiative;
          game.combat.setInitiative(combatant.id, newInitiative);
        }
      }
      await animaTokenMagic(actor, newValue);
    }
  }
  else if (item.type === 'spell') {
    if (item.system.active) {
      updateActive = false;
    }
    else {
      if (item.system.activatable) {
        updateActive = true;
      }
      actorData.system.sorcery.motes = 0;
    }
  }
  else {
    updateActive = !item.system.active;
  }
  await actor.update(actorData);
  if (updateActive !== null) {
    await item.update({
      [`system.active`]: updateActive,
    });
    for (const effect of actor.allApplicableEffects()) {
      if (effect._sourceName === item.name) {
        effect.update({ disabled: !updateActive });
      }
    }
    for (const effect of item.effects) {
      effect.update({ disabled: !updateActive });
    }
  }
}

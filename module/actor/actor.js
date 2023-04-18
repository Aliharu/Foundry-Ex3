import { RollForm } from "../apps/dice-roller.js";
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
    if (updateData.system?.battlegroup && !this.system.battlegroup) {
      updateData.system.health = {
        "levels": {
          "zero": {
            "value": this.system.health.levels.zero.value + this.system.health.levels.one.value + this.system.health.levels.two.value + this.system.health.levels.four.value + 1,
          }
        }
      };
    }
    if(updateData.system?.details?.exalt || updateData.system?.essence?.value || updateData.system?.creaturetype) {
      if(this.type === 'character') {
        updateData.system.motes = {
          personal: {
            max: this.calculateMaxExaltedMotes('personal', exalt, essenceLevel),
            value: (this.calculateMaxExaltedMotes('personal', exalt, essenceLevel)  - this.system.motes.personal.committed),
          },
          peripheral: {
            max: this.calculateMaxExaltedMotes('peripheral', exalt, essenceLevel),
            value: (this.calculateMaxExaltedMotes('peripheral', exalt, essenceLevel) - this.system.motes.peripheral.committed),
          }
        };
        if(updateData.system?.details?.exalt) {
          updateData.system.traits = {
            resonance: this.calculateResonance(updateData.system?.details?.exalt),
            dissonance: this.calculateDissonance(updateData.system?.details?.exalt),
          };
        }
      }
      else {
        var personalMotes = essenceLevel * 10;
        var peripheralmotes = 0;
        if (updateData.system?.creaturetype === 'god' || updateData.system?.creaturetype === 'undead'  || updateData.system?.creaturetype === 'demon') {
          personalMotes += 50;
        }
        if((updateData.system?.creaturetype || this.system.creaturetype) === 'exalt') {
          peripheralmotes = this.calculateMaxExaltedMotes('peripheral', this.system.details.exalt, essenceLevel);
          personalMotes = this.calculateMaxExaltedMotes('personal', this.system.details.exalt, essenceLevel);
        }
        updateData.system.motes = {
          personal: {
            max: personalMotes,
            value: (personalMotes  - this.system.motes.personal.committed),
          },
          peripheral: {
            max: peripheralmotes,
            value: (peripheralmotes - this.system.motes.peripheral.committed),
          }
        };
      }
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
      if (exaltType === 'dreamsouled' || this.system.details?.caste?.toLowerCase() === 'sovereign' || this.system.details?.caste?.toLowerCase() === 'architect' || this.system.details?.caste?.toLowerCase() === 'puppeteer') {
        maxMotes = 11 + essenceLevel;
      }
      if (this.system.details?.caste?.toLowerCase() === 'janest' || this.system.details?.caste.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
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
      if (exaltType === 'dreamsouled' || this.system.details?.caste?.toLowerCase() === 'sovereign' || this.system.details?.caste?.toLowerCase() === 'architect' || this.system.details?.caste?.toLowerCase() === 'puppeteer') {
        maxMotes = 23 + (essenceLevel * 4);
      }
      if (this.system.details?.caste?.toLowerCase() === 'janest' || this.system.details?.caste?.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
        maxMotes = 27 + (essenceLevel * 6);
      }
    }
    return maxMotes
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
      "solar": ['adamant', 'orichalcum', 'moonsilver', 'starmetal', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'],
      "umbral": ['soulsteel'],
    }

    if (exaltType === 'exigent') {
      if (this.system.details.caste?.toLowerCase() === 'janest' || this.system.details.caste?.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
        resonance.value = ['orichalcum', 'greenjade'];
      }
      if (this.system.details.caste?.toLowerCase() === 'sovereign') {
        resonance.value = [];
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
      "umbral": [],
    }

    if (exaltType === 'exigent') {
      if (this.system.details?.caste?.toLowerCase() === 'janest' || this.system.details.caste?.toLowerCase() === 'strawmaiden' || exaltType === 'hearteater' || exaltType === 'umbral') {
        dissonance.value = ['soulsteel'];
      }
      if (this.system.details?.caste?.toLowerCase() === 'sovereign') {
        dissonance.value = ['orichalcum', 'moonsilver', 'starmetal', 'soulsteel', 'blackjade', 'bluejade', 'greenjade', 'redjade', 'whitejade'];
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

    if (actorData.type === "character" || actorData.system.creaturetype === 'exalt') {
      data.parry.cap = this._getStaticCap(actorData, 'parry', data.parry.value);
      if (data.parry.cap !== '') {
        data.evasion.padding = true;
        data.defenseCapPadding = true;
      }
      data.evasion.cap = this._getStaticCap(actorData, 'evasion', data.evasion.value);
      if (data.evasion.cap !== '') {
        data.evasion.padding = false;
        if (data.parry.cap === '') {
          data.parry.padding = true;
        }
        data.defenseCapPadding = true;
      }
      data.guile.cap = this._getStaticCap(actorData, 'parry', data.guile.value);
      if (data.guile.cap !== '') {
        data.resolve.padding = true;
        data.socialCapPadding = true;
      }
      data.resolve.cap = this._getStaticCap(actorData, 'resolve', data.resolve.value);
      if (data.resolve.cap !== '') {
        if (data.guile.cap === '') {
          data.guile.padding = true;
        }
        data.resolve.padding = false;
        data.socialCapPadding = true;
      }
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
      data.experience.standard.spent = data.experience.standard.total - data.experience.standard.value;
      data.experience.exalt.spent = data.experience.exalt.total - data.experience.exalt.value;
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
    if (actorData.effects.some(e => e.flags?.core?.statusId === 'prone')) {
      currentParryPenalty += 1;
      currentEvasionPenalty += 2;
    }
    if (actorData.effects.some(e => e.flags?.core?.statusId === 'surprised')) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }
    if (actorData.effects.some(e => e.flags?.core?.statusId === 'grappled') || actorData.effects.some(e => e.flags?.core?.statusId === 'grappling')) {
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
    const gear = [];
    const weapons = [];
    const armor = [];
    const merits = [];
    const intimacies = [];
    const initiations = [];
    const martialarts = [];
    const crafts = [];
    const specialties = [];
    const specialAbilities = [];
    const craftProjects = [];
    const actions = [];
    const destinies = [];
    const activeCharms = [];
    const charms = {};
    const rollCharms = {};
    const defenseCharms = {};

    const spells = {
      terrestrial: { name: 'Ex3.Terrestrial', visible: false, list: [] },
      celestial: { name: 'Ex3.Celestial', visible: false, list: [] },
      solar: { name: 'Ex3.Solar', visible: false, list: [] },
      ivory: { name: 'Ex3.Ivory', visible: false, list: [] },
      shadow: { name: 'Ex3.Shadow', visible: false, list: [] },
      void: { name: 'Ex3.Void', visible: false, list: [] },
    }

    // Iterate through items, allocating to containers
    for (let i of actorData.items) {

      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'weapon') {
        prepareItemTraits('weapon', i);
        weapons.push(i);
      }
      else if (i.type === 'armor') {
        prepareItemTraits('armor', i);
        armor.push(i);
      }
      else if (i.type === 'charm') {
        if(i.system.active) {
          activeCharms.push(i);
        }
      }
      else if (i.type === 'merit') {
        merits.push(i);
      }
      else if (i.type === 'intimacy') {
        intimacies.push(i);
      }
      else if (i.type === 'martialart') {
        martialarts.push(i);
      }
      else if (i.type === 'craft') {
        crafts.push(i);
      }
      else if (i.type === 'initiation') {
        initiations.push(i);
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
      else if (i.type === 'spell') {
        if (i.system.circle !== undefined) {
          spells[i.system.circle].list.push(i);
          spells[i.system.circle].visible = true;
        }
      }
      else if (i.type === 'action') {
        actions.push(i);
      }
    }

    let actorCharms = actorData.items.filter((item) => item.type === 'charm');
    actorCharms = actorCharms.sort(function (a, b) {
      const sortValueA = a.system.listingname.toLowerCase() || a.system.ability;
      const sortValueB = b.system.listingname.toLowerCase() || b.system.ability;
      return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
    });

    for (let i of actorCharms) {
      if(i.system.diceroller.enabled) {
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
      if(i.system.diceroller.opposedbonuses.enabled) {
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
          charms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
        }
        charms[i.system.listingname].list.push(i);
      }
      else {
        if (charms[i.system.ability]) {
        }
        else {
          charms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [] };
        }
        charms[i.system.ability].list.push(i);
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.activecharms = activeCharms;
    actorData.weapons = weapons;
    actorData.armor = armor;
    actorData.merits = merits;
    actorData.martialarts = martialarts;
    actorData.crafts = crafts;
    actorData.initiations = initiations;
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
  }

  _getStaticCap(actorData, type, value) {
    if (actorData.type === "character") {
      switch (actorData.system.details.exalt) {
        case 'dragonblooded':
          var newValue = Math.floor(value / 2);
          return `(+${newValue} for ${newValue * 2}m)`
        case 'sidereal':
          var baseSidCap = Math.min(5, Math.max(3, actorData.system.essence.value));
          return `(+${baseSidCap} for ${baseSidCap * 2}m)`
        case 'solar':
          return `(+${value} for ${value * 2}m)`
        case 'abyssal':
          return `(+${value} for ${value * 2}m)`
        case 'lunar':
          var newValue = Math.floor(value / 2);
          return `(+${newValue} for ${newValue * 2}m)`
        case 'liminal':
          var newValue = Math.floor(value / 2);
          return `(+${newValue} for ${newValue * 2}m)`
        default:
          return ''
      }
    }
    else if (actorData.system.creaturetype === 'exalt') {
      let caps
      let bonus = 0
      if (actorData.system.details.exalt === 'lunar') {
        if (value <= 1) return `(+0 for 0m; +1 for 2m)`
        else if (value <= 3) return `(+1 for 2m; +2 for 4m)`
        else if (value <= 5) return `(+2 for 4m; +4 for 8m)`
        else return `(+2 for 4m; +5 for 10m)`
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
    const data = {...super.getRollData()};
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
    if (this.effects.some(e => e.flags?.core?.statusId === 'prone')) {
      currentParryPenalty += 1;
      currentEvasionPenalty += 2;
    }
    if (this.effects.some(e => e.flags?.core?.statusId === 'surprised')) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }
    if (this.effects.some(e => e.flags?.core?.statusId === 'grappled') || this.effects.some(e => e.flags?.core?.statusId === 'grappling')) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }
    if (currentPenalty !== 'inc') {
      currentParryPenalty += Math.max(0, currentPenalty - data.health.penaltymod);
      currentEvasionPenalty += Math.max(0, currentPenalty - data.health.penaltymod);
    }

    data.woundpenalty = {'value': currentPenalty};
    data.evasionpenalty = {'value': currentEvasionPenalty};
    data.onslaught = {'value': currentOnslaughtPenalty};
    data.parrypenalty = {'value': currentParryPenalty};
    data.defensepenalty = {'value': currentDefensePenalty};

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
      label: label,
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

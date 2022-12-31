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
    await new RollForm(this, { event: this.event }, {}, { rollId: roll.id, skipDialog: true }).roll();
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
          data.health.lethal = data.health.max
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


    const charms = {
      offensive: { name: 'Ex3.Offensive', visible: false, list: [] },
      offsensive: { name: 'Ex3.Offensive', visible: false, list: [] },
      defensive: { name: 'Ex3.Defensive', visible: false, list: [] },
      social: { name: 'Ex3.Social', visible: false, list: [] },
      mobility: { name: 'Ex3.Mobility', visible: false, list: [] },
      strength: { name: 'Ex3.Strength', visible: false, list: [] },
      dexterity: { name: 'Ex3.Dexterity', visible: false, list: [] },
      stamina: { name: 'Ex3.Stamina', visible: false, list: [] },
      charisma: { name: 'Ex3.Charisma', visible: false, list: [] },
      manipulation: { name: 'Ex3.Manipulation', visible: false, list: [] },
      appearance: { name: 'Ex3.Appearance', visible: false, list: [] },
      perception: { name: 'Ex3.Perception', visible: false, list: [] },
      intelligence: { name: 'Ex3.Intelligence', visible: false, list: [] },
      wits: { name: 'Ex3.Wits', visible: false, list: [] },
      archery: { name: 'Ex3.Archery', visible: false, list: [] },
      athletics: { name: 'Ex3.Athletics', visible: false, list: [] },
      awareness: { name: 'Ex3.Awareness', visible: false, list: [] },
      brawl: { name: 'Ex3.Brawl', visible: false, list: [] },
      bureaucracy: { name: 'Ex3.Bureaucracy', visible: false, list: [] },
      craft: { name: 'Ex3.Craft', visible: false, list: [] },
      dodge: { name: 'Ex3.Dodge', visible: false, list: [] },
      integrity: { name: 'Ex3.Integrity', visible: false, list: [] },
      investigation: { name: 'Ex3.Investigation', visible: false, list: [] },
      larceny: { name: 'Ex3.Larceny', visible: false, list: [] },
      linguistics: { name: 'Ex3.Linguistics', visible: false, list: [] },
      lore: { name: 'Ex3.Lore', visible: false, list: [] },
      martialarts: { name: 'Ex3.MartialArts', visible: false, list: [] },
      medicine: { name: 'Ex3.Medicine', visible: false, list: [] },
      melee: { name: 'Ex3.Melee', visible: false, list: [] },
      occult: { name: 'Ex3.Occult', visible: false, list: [] },
      performance: { name: 'Ex3.Performance', visible: false, list: [] },
      presence: { name: 'Ex3.Presence', visible: false, list: [] },
      resistance: { name: 'Ex3.Resistance', visible: false, list: [] },
      ride: { name: 'Ex3.Ride', visible: false, list: [] },
      sail: { name: 'Ex3.Sail', visible: false, list: [] },
      socialize: { name: 'Ex3.Socialize', visible: false, list: [] },
      stealth: { name: 'Ex3.Stealth', visible: false, list: [] },
      survival: { name: 'Ex3.Survival', visible: false, list: [] },
      thrown: { name: 'Ex3.Thrown', visible: false, list: [] },
      war: { name: 'Ex3.War', visible: false, list: [] },
      evocation: { name: 'Ex3.Evocation', visible: false, list: [] },
      universal: { name: 'Ex3.Universal', visible: false, list: [] },
      other: { name: 'Ex3.Other', visible: false, list: [] },
    }

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
      else if (i.type === 'charm') {
        if (i.system.listingname) {
          if (charms[i.system.listingname]) {
          }
          else {
            charms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
          }
          charms[i.system.listingname].list.push(i);
        }
        else if (i.system.martialart) {
          if (charms[i.system.martialart]) {
          }
          else {
            charms[i.system.martialart] = { name: i.system.martialart, visible: true, list: [] };
          }
          charms[i.system.martialart].list.push(i);
        }
        else {
          if (i.system.ability === 'martial' || i.system.ability === 'martialarts') {
            charms['martialarts'].list.push(i);
            charms['martialarts'].visible = true;
          }
          else if (i.system.ability === 'essence') {
            charms['evocation'].list.push(i);
            charms['evocation'].visible = true;
          }
          else if (i.system.ability !== undefined) {
            charms[i.system.ability].list.push(i);
            charms[i.system.ability].visible = true;
          }
        }
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

    // Assign and return
    actorData.gear = gear;
    actorData.weapons = weapons;
    actorData.armor = armor;
    actorData.merits = merits;
    actorData.martialarts = martialarts;
    actorData.crafts = crafts;
    actorData.initiations = initiations;
    actorData.intimacies = intimacies;
    actorData.specialties = specialties;
    actorData.charms = charms;
    actorData.spells = spells;
    actorData.specialabilities = specialAbilities;
    actorData.projects = craftProjects;
    actorData.actions = actions;
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


  async _preUpdate(updateData, options, user) {
    await super._preUpdate(updateData, options, user);
    if (updateData.system.battlegroup && !this.system.battlegroup) {
      updateData.system.health = {
        "levels": {
          "zero": {
            "value": this.system.health.levels.zero.value + this.system.health.levels.one.value + this.system.health.levels.two.value + this.system.health.levels.four.value + 1,
          }
        }
      };
    }
  }
}


export async function addDefensePenalty(actor, label = "Defense Penalty") {
  var icon = 'systems/exaltedthird/assets/icons/slashed-shield.svg';
  if (label === 'Onslaught') {
    icon = 'systems/exaltedthird/assets/icons/surrounded-shield.svg';
  }
  const existingPenalty = actor.effects.find(i => i.label == label);
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
      "changes": [
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

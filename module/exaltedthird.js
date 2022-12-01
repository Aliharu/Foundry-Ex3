// Import Modules
import { exaltedthird } from "./config.js";

import { ExaltedThirdActor } from "./actor/actor.js";
import { ExaltedThirdActorSheet } from "./actor/actor-sheet.js";
import { ExaltedThirdItem } from "./item/item.js";
import { ExaltedThirdItemSheet } from "./item/item-sheet.js";

import { RollForm } from "./apps/dice-roller.js";
import TraitSelector from "./apps/trait-selector.js";
import { registerSettings } from "./settings.js";
import ItemSearch from "./apps/item-search.js";
import Importer from "./apps/importer.js";
import TemplateImporter from "./apps/template-importer.js";
import { ExaltedCombatTracker } from "./combat/combat-tracker.js";
import { ExaltedCombatant } from "./combat/combat.js";

Hooks.once('init', async function () {

  registerSettings();

  game.exaltedthird = {
    applications: {
      TraitSelector,
      ItemSearch,
      TemplateImporter,
      Importer,
    },
    entities: {
      ExaltedThirdActor,
      ExaltedThirdItem
    },
    config: exaltedthird,
    rollItemMacro: rollItemMacro,
    roll: roll,
    RollForm
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  // CONFIG.Combat.initiative = {
  //   formula: "1d10cs>=7",
  // };

  // Define custom Entity classes
  CONFIG.exaltedthird = exaltedthird;
  CONFIG.statusEffects = exaltedthird.statusEffects;

  CONFIG.Actor.documentClass = ExaltedThirdActor;
  CONFIG.Item.documentClass = ExaltedThirdItem;

  CONFIG.Combat.documentClass = ExaltedCombat;
  CONFIG.Combatant.documentClass = ExaltedCombatant;
  CONFIG.ui.combat = ExaltedCombatTracker;

  game.socket.on('system.exaltedthird', handleSocket);

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("exaltedthird", ExaltedThirdActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("exaltedthird", ExaltedThirdItemSheet, { makeDefault: true });

  // Pre-load templates
  loadTemplates([
    "systems/exaltedthird/templates/dialogues/ability-base.html",
    "systems/exaltedthird/templates/dialogues/add-roll-charm.html",
    "systems/exaltedthird/templates/dialogues/accuracy-roll.html",
    "systems/exaltedthird/templates/dialogues/damage-roll.html",
    "systems/exaltedthird/templates/actor/active-effects.html",
    "systems/exaltedthird/templates/actor/equipment-list.html",
    "systems/exaltedthird/templates/actor/combat-tab.html",
    "systems/exaltedthird/templates/actor/charm-list.html",
    "systems/exaltedthird/templates/actor/social-tab.html",
  ]);

  Combatant.prototype._getInitiativeFormula = function () {
    const actor = this.actor;
    var initDice = 0;
    if (this.actor.type != 'npc') {
      initDice = actor.system.attributes.wits.value + actor.system.abilities.awareness.value + 2;
    }
    else {
      initDice = actor.system.pools.joinbattle.value;
    }
    let roll = new Roll(`${initDice}d10cs>=7 + 3`).evaluate({ async: false });
    let diceRoll = roll.total;
    let bonus = 0;
    for (let dice of roll.dice[0].results) {
      if (dice.result >= 10) {
        bonus++;
      }
    }
    return `${diceRoll + bonus}`;
  }

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('numLoop', function (num, options) {
    let ret = ''

    for (let i = 0, j = num; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  });

  Handlebars.registerHelper('numLoopCertainStart', function (num, startNum, options) {
    let ret = ''

    for (let i = startNum, j = num + startNum; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  });
});

function handleSocket({type, id, data}) {
  if (!game.user.isGM) return;

  // if the logged in user is the active GM with the lowest user id
  const isResponsibleGM = game.users
    .some(user => user.isGM && user.active)

  if (!isResponsibleGM) return;

  if(type === 'updateInitiative') {
    game.combat.setInitiative(id, data);
  }
  if(type === 'healthDamage') {
    const targetedActor = game.canvas.tokens.get(id).actor;
    if(targetedActor) {
      const targetActorData = duplicate(targetedActor);
      targetActorData.system.health = data;
      targetedActor.update(targetActorData);
    }
  }
  if(type === 'addOnslaught') {
    const targetedActor = game.canvas.tokens.get(id).actor;
    const onslaught = targetedActor.effects.find(i => i.label == "Onslaught");
    if (onslaught) {
        let changes = duplicate(onslaught.changes);
        if (targetedActor.system.evasion.value > 0) {
            changes[0].value = changes[0].value - 1;
        }
        if (targetedActor.system.parry.value > 0) {
            changes[1].value = changes[1].value - 1;
        }
        onslaught.update({ changes });
    }
    else {
      targetedActor.createEmbeddedDocuments('ActiveEffect', [{
            label: 'Onslaught',
            icon: 'systems/exaltedthird/assets/icons/surrounded-shield.svg',
            origin: targetedActor.uuid,
            disabled: false,
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
}


Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotEquals', function (arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifGreater', function (arg1, arg2, options) {
  return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('le', function (a, b) {
  var next = arguments[arguments.length - 1];
  return (a <= b) ? next.fn(this) : next.inverse(this);
});

$(document).ready(() => {
  const diceIconSelector = '#chat-controls .chat-control-icon .fa-dice-d20';

  $(document).on('click', diceIconSelector, ev => {
    ev.preventDefault();
    new RollForm(null, { event: ev }, {}, { rollType: 'base' }).render(true);
  });
});

Hooks.on('updateCombat', (async (combat, update, diff, userId) => {
  // Handle non-gm users.

  if(!game.user.isGM) return;

  if (combat.current === undefined) {
    combat = game.combat;
  }

  if (update && update.round) {
    for (var combatant of combat.combatants) {
      const actorData = duplicate(combatant.actor)
      var missingPersonal = (combatant.actor.system.motes.personal.max - combatant.actor.system.motes.personal.committed) - combatant.actor.system.motes.personal.value;
      var missingPeripheral = (combatant.actor.system.motes.peripheral.max - combatant.actor.system.motes.peripheral.committed) - combatant.actor.system.motes.peripheral.value;
      var restorePersonal = 0;
      var restorePeripheral = 0;
      if (missingPeripheral >= 5) {
        restorePeripheral = 5;
      }
      else {
        if (missingPeripheral > 0) {
          restorePeripheral = missingPeripheral;
        }
        var maxPersonalRestore = 5 - restorePeripheral;
        if (missingPersonal > maxPersonalRestore) {
          restorePersonal = maxPersonalRestore;
        }
        else {
          restorePersonal = missingPersonal;
        }
      }
      actorData.system.motes.personal.value += restorePersonal;
      actorData.system.motes.peripheral.value += restorePeripheral;
      combatant.actor.update(actorData);
    }
  }
  if (update && (update.round || update.turn)) {
    if (combat.current.combatantId) {
      var currentCombatant = combat.combatants.get(combat.current.combatantId);
      const onslaught = currentCombatant.actor.effects.find(i => i.label == "Onslaught");
      if (onslaught) {
        onslaught.delete();
      }
      const fullDefense = currentCombatant.actor.effects.find(i => i.label == "Full Defense");
      if (fullDefense) {
        fullDefense.delete();
      }
    }
  }
}));

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createexaltedthirdMacro(data, slot));

  $("#chat-log").on("click", " .item-row", ev => {
    const li = $(ev.currentTarget).next();
    li.toggle("fast");
  });

});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createexaltedthirdMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.exaltedthird.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "exaltedthird.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}

/**
 * 
 * @param {ExaltedThirdActor} actor 
 * @param {object} object 
 * @param {object} data 
 * @returns {Promise}
 */
function roll(actor, object, data) {
  return new RollForm(actor, object, {}, data).roll();
}

export class ExaltedCombat extends Combat {
  async resetTurnsTaken() {
    const updates = this.combatants.map(c => {
      return {
        _id: c.id,
        [`flags.acted`]: c.isDefeated
          ? true
          : false,
      };
    });
    return this.updateEmbeddedDocuments("Combatant", updates);
  }

  async _preCreate(...[data, options, user]) {
    this.turn = null;
    return super._preCreate(data, options, user);
  }

  async startCombat() {
    await this.resetTurnsTaken();
    return this.update({ round: 1, turn: null });
  }

  // _sortCombatants(a,b) {
  //   const ia = (Number.isNumeric(a.initiative) && !a.flags.acted) ? a.initiative : -Infinity;
  //   const ib = (Number.isNumeric(b.initiative) && !b.flags.acted) ? b.initiative : -Infinity;
  //   return (ib - ia) || (a.id > b.id ? 1 : -1);
  // }

  async nextRound() {
    await this.resetTurnsTaken();
    let advanceTime = Math.max(this.turns.length - (this.turn || 0), 0) * CONFIG.time.turnTime;
    advanceTime += CONFIG.time.roundTime;
    return this.update({ round: this.round + 1, turn: null }, { advanceTime });
  }

  // Foundry's combat.turn keeps jumping arround the place so this is unusable
  // async nextTurn() {
  //   let round = this.round;
  //   const currentPerson = this.turns[this.turn];
  //   if(!currentPerson.flags.acted) {
  //     await this.toggleTurnOver(currentPerson.id);
  //   }
  //   const nextTurn = this.turns.filter(t => t.flags.acted === false && t.initiative !== undefined).sort((a, b) => {
  //     return a.initiative > b.initiative ? 1 : -1;
  //   });
  //   if(nextTurn.length === 0) {
  //     return this.nextRound();
  //   }
  //   const updateData = {round, turn: 0};
  //   const updateOptions = {advanceTime: CONFIG.time.turnTime, direction: 1};
  //   // Hooks.callAll("combatTurn", this, updateData, updateOptions);
  //   return this.update(updateData, updateOptions);
  // }

  async previousRound() {
    await this.resetTurnsTaken();
    const round = Math.max(this.round - 1, 0);
    let advanceTime = 0;
    if (round > 0)
      advanceTime -= CONFIG.time.roundTime;
    return this.update({ round, turn: null }, { advanceTime });
  }

  async resetAll() {
    await this.resetTurnsTaken();
    this.combatants.forEach(c => c.updateSource({ initiative: null }));
    return this.update({ turn: null, combatants: this.combatants.toObject() }, { diff: false });
  }

  async toggleTurnOver(id) {
    const combatant = this.getEmbeddedDocument("Combatant", id);
    await combatant?.toggleCombatantTurnOver();
    const turn = this.turns.findIndex(t => t.id === id);
    return this.update({ turn });
    // return this.nextTurn();
  }


  async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
    const combatant = this.combatants.get(ids[0]);
    if (combatant.token.actor) {
      if (combatant.token.actor.type === "npc") {
        new RollForm(combatant.token.actor, {}, {}, { rollType: 'joinBattle', pool: 'joinbattle' }).render(true);
      }
      else {
        new RollForm(combatant.token.actor, {}, {}, { rollType: 'joinBattle', ability: 'awareness', attribute: 'wits' }).render(true);
      }
    }
    else {
      super.rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt);
    }
  }

  async rollAll(options) {
    const ids = this.combatants.reduce((ids, c) => {
      if (c.isOwner && (c.initiative === null)) ids.push(c.id);
      return ids;
    }, []);
    await super.rollInitiative(ids, options);
    return this.update({ turn: null });
  }

  async rollNPC(options = {}) {
    const ids = this.combatants.reduce((ids, c) => {
      if (c.isOwner && c.isNPC && (c.initiative === null)) ids.push(c.id);
      return ids;
    }, []);
    await super.rollInitiative(ids, options);
    return this.update({ turn: null });
  }
}
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

Hooks.once('init', async function() {

  registerSettings();

  game.exaltedthird = {
    applications: {
      TraitSelector,
      ItemSearch,
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

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("exaltedthird", ExaltedThirdActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("exaltedthird", ExaltedThirdItemSheet, { makeDefault: true });

  // Pre-load templates
  loadTemplates([
    "systems/exaltedthird/templates/dialogues/ability-base.html",
    "systems/exaltedthird/templates/dialogues/accuracy-roll.html",
    "systems/exaltedthird/templates/dialogues/damage-roll.html",
    "systems/exaltedthird/templates/actor/active-effects.html",
    "systems/exaltedthird/templates/actor/equipment-list.html",
    "systems/exaltedthird/templates/actor/combat-tab.html",
    "systems/exaltedthird/templates/actor/charm-list.html",
    "systems/exaltedthird/templates/actor/social-tab.html",
  ]);

  Combatant.prototype._getInitiativeFormula = function() {
    const actor = this.actor;
    var initDice = 0;
    if (this.actor.type != 'npc') {
      initDice = actor.data.data.attributes.wits.value + actor.data.data.abilities.awareness.value + 2;
    }
    else {
      initDice = actor.data.data.pools.joinbattle.value;
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
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  }); 

  Handlebars.registerHelper('numLoop', function (num, options) {
    let ret = ''

    for (let i = 0, j = num; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  })
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotEquals', function (arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifGreater', function(arg1, arg2, options) {
  return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
});

$(document).ready(() => {
  const diceIconSelector = '#chat-controls .chat-control-icon .fa-dice-d20';

  $(document).on('click', diceIconSelector, ev => {
    ev.preventDefault();
    new RollForm(null, {event:ev}, {}, {rollType: 'base'}).render(true);
  });
});

Hooks.on('updateCombat', (async (combat, update, diff, userId) => {
  // Handle non-gm users.

  if (combat.current === undefined) {
    combat = game.combat;
  }

  if (update && update.round) {
    for(var combatant of combat.data.combatants) {
      const actorData = duplicate(combatant.actor)
      var missingPersonal = (actorData.data.motes.personal.max - actorData.data.motes.personal.committed) - actorData.data.motes.personal.value;
      var missingPeripheral = (actorData.data.motes.peripheral.max - actorData.data.motes.peripheral.committed) - actorData.data.motes.peripheral.value;
      var restorePersonal = 0;
      var restorePeripheral = 0;
      if(missingPeripheral >= 5) {
        restorePeripheral = 5;
      }
      else {
        if(missingPeripheral > 0) {
          restorePeripheral = missingPeripheral;
        }
        var maxPersonalRestore = 5 - restorePeripheral;
        if(missingPersonal > maxPersonalRestore) {
          restorePersonal = maxPersonalRestore;
        }
        else {
          restorePersonal = missingPersonal;
        }
      }
      actorData.data.motes.personal.value += restorePersonal;
      actorData.data.motes.peripheral.value += restorePeripheral;
      combatant.actor.update(actorData);
    }
  }
  if(update && (update.round || update.turn)) {
    if(combat.current.combatantId) {
      var currentCombatant = combat.data.combatants.get(combat.current.combatantId);
      const onslaught = currentCombatant.actor.effects.find(i => i.data.label == "Onslaught");
      if(onslaught) {
          onslaught.delete();
      }
    }
  }
}));

Hooks.once("ready", async function() {
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
function roll(actor,object,data){
  return new RollForm(actor,object,{},data).roll();
}
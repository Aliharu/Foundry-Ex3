// Import Modules
import { exaltedthird } from "./config.js";

import { addDefensePenalty, ExaltedThirdActor, spendEmbeddedItem } from "./actor/actor.js";
import { ExaltedThirdActorSheet } from "./actor/actor-sheet.js";
import { ExaltedThirdItem } from "./item/item.js";
import { ExaltedThirdItemSheet } from "./item/item-sheet.js";
import * as Chat from "./chat.js";

import { RollForm } from "./apps/dice-roller.js";
import TraitSelector from "./apps/trait-selector.js";
import { registerSettings } from "./settings.js";
import ItemSearch from "./apps/item-search.js";
import Importer from "./apps/importer.js";
import TemplateImporter from "./apps/template-importer.js";
import { ExaltedCombatTracker } from "./combat/combat-tracker.js";
import { ExaltedCombatant } from "./combat/combat.js";
import ExaltedActiveEffect from "./active-effect.js";
import ExaltedActiveEffectConfig from "./active-effect-config.js";
import NPCGenerator from "./apps/npc-generator.js";

Hooks.once('init', async function () {

  registerSettings();

  game.exaltedthird = {
    applications: {
      NPCGenerator,
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
    weaponAttack: weaponAttack,
    triggerItem: triggerItem,
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
  CONFIG.ActiveEffect.documentClass = ExaltedActiveEffect;
  DocumentSheetConfig.registerSheet(ActiveEffect, "exaltedthird", ExaltedActiveEffectConfig, { makeDefault: true });

  CONFIG.ActiveEffect.sheetClass = ExaltedActiveEffectConfig;
  CONFIG.ActiveEffect.legacyTransferral = false;

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
    "systems/exaltedthird/templates/dialogues/added-charm-list.html",
    "systems/exaltedthird/templates/actor/active-effects.html",
    "systems/exaltedthird/templates/actor/effects-tab.html",
    "systems/exaltedthird/templates/actor/equipment-list.html",
    "systems/exaltedthird/templates/actor/header-exalt-data.html",
    "systems/exaltedthird/templates/actor/combat-tab.html",
    "systems/exaltedthird/templates/actor/charm-list.html",
    "systems/exaltedthird/templates/actor/social-tab.html",
    "systems/exaltedthird/templates/actor/biography-tab.html",
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

  Handlebars.registerHelper('healthCheck', function (health, type, options) {
    let healthLevels = options.data.root.system.health.levels;
    if (type === 'warstrider') {
      healthLevels = options.data.root.system.warstrider.health.levels;
    }
    else if (type === 'ship') {
      healthLevels = options.data.root.system.ship.health.levels;
    }
    if (health < healthLevels.zero.value) {
      return '0'
    }
    else if (health < healthLevels.zero.value + healthLevels.one.value) {
      return '1'
    }
    else if (health < healthLevels.zero.value + healthLevels.one.value + healthLevels.two.value) {
      return '2'
    }
    else if (health < healthLevels.zero.value + healthLevels.one.value + healthLevels.two.value + healthLevels.four.value) {
      return '4'
    }
    return 'i'
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

  Handlebars.registerHelper("enrichedHTMLItems", function (sheetData, type, itemID) {
    return sheetData.itemDescriptions[itemID];
  });

  Handlebars.registerHelper("getAbilityDisplay", function (actor, abilityName) {
    const customAbility = actor.items.find(ability => ability._id === abilityName);
    if (customAbility) {
      return customAbility.name;
    }
    return abilityName;
  });

  Handlebars.registerHelper('ifInSet', function(elem, list, options) {
    return (list.has(elem)) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("charmCostDisplay", function (cost) {
    let costString = '';
    if (cost.motes > 0 || cost.commitmotes > 0) {
      costString += `${cost.motes || cost.commitmotes}m, `
    }
    if (cost.willpower > 0) {
      costString += `${cost.willpower}wp, `
    }
    if (cost.anima > 0) {
      costString += `${cost.anima}a, `
    }
    if (cost.initiative > 0) {
      costString += `${cost.initiative}i, `
    }
    if (cost.health > 0) {
      costString += `${cost.health}`
      if (cost.healthtype === 'bashing') {
        costString += `hl, `
      }
      if (cost.healthtype === 'lethal') {
        costString += `lhl, `
      }
      if (cost.healthtype === 'aggravated') {
        costString += `ahl, `
      }
    }
    if (cost.xp > 0) {
      costString += `${cost.xp}xp, `
    }
    if (cost.goldxp > 0) {
      costString += `${cost.goldxp}gxp, `
    }
    if (cost.whitexp > 0) {
      costString += `${cost.whitexp}wxp, `
    }
    if (costString !== '') {
      costString = `<b>${game.i18n.localize("Ex3.Cost")}</b>` + ": " + costString;
    }
    return costString;
  });
});

// Hooks.on("updateToken", (token, updateData, options) => {
//   console.log(token);
//   console.log(updateData);
// });

async function handleSocket({ type, id, data, actorId, crasherId = null }) {
  if (type === 'addOpposingCharm') {
    if (game.rollForm) {
      data.actor = canvas.tokens.placeables.find(t => t.actor.id === actorId)?.actor;
      if (!data.actor) {
        data.actor = game.actors.get(actorId);
      }
      game.rollForm.addOpposingCharm(data);
    }
  }

  if (!game.user.isGM) return;

  // if the logged in user is the active GM with the lowest user id
  const isResponsibleGM = game.users
    .some(user => user.isGM && user.active)

  if (!isResponsibleGM) return;

  const targetedActor = game.canvas.tokens.get(id)?.actor;

  if (type === 'updateInitiative') {
    game.combat.setInitiative(id, data, crasherId);
  }
  if (type === 'updateTargetData') {
    if (targetedActor) {
      await targetedActor.update(data);
    }
  }
  if (type === 'addOnslaught') {
    if (data.knockdownTriggered) {
      const token = game.canvas.tokens.get(id)
      const isProne = token.actor.effects.find(e => e.getFlag("core", "statusId") === 'prone');
      if (!isProne) {
        const newProneEffect = CONFIG.statusEffects.find(e => e.id === 'prone');
        await token.toggleEffect(newProneEffect);
      }
    }
    if (data.triggerGambit && data.triggerGambit !== 'none') {
      const token = game.canvas.tokens.get(id);
      const conditionExists = (token.actor?.effects.find(e => e.getFlag("core", "statusId") === data.triggerGambit));
      if (!conditionExists) {
        const newStatusEffect = CONFIG.statusEffects.find(e => e.id === data.triggerGambit);
        await token.toggleEffect(newStatusEffect);
      }
    }
    if (targetedActor) {
      await addDefensePenalty(targetedActor, 'Onslaught');
    }
  }
  if (type === 'triggerEffect') {
    const token = game.canvas.tokens.get(id);
    const isProne = (token.actor?.effects.find(e => e.getFlag("core", "statusId") === 'prone'));
    if (!isProne) {
      const newProneEffect = CONFIG.statusEffects.find(e => e.id === 'prone');
      await token.toggleEffect(newProneEffect);
    }
    if (data.triggerGambit && data.triggerGambit !== 'none') {
      const token = game.canvas.tokens.get(id);
      const conditionExists = (token.actor?.effects.find(e => e.getFlag("core", "statusId") === data.triggerGambit));
      if (!conditionExists) {
        const newStatusEffect = CONFIG.statusEffects.find(e => e.id === data.triggerGambit);
        await token.toggleEffect(newStatusEffect);
      }
    }
  }
  if (data.poisonAdded) {
    if (targetedActor) {
      await targetedActor.createEmbeddedDocuments('ActiveEffect', [{
        name: data.poisonAdded.poison.name || "Poison",
        icon: 'icons/skills/toxins/poison-bottle-corked-fire-green.webp',
        origin: data.poisonAdded.poisonerId,
        disabled: false,
        description: `Difficulty ${this.object.poison.difficulty}`,
        duration: {
          rounds: data.poisonAdded.poison.duration,
        },
        flags: {
          "exaltedthird": data.poisonAdded.flags
        },
        changes: [
          {
            "key": `data.damage.round.${data.poisonAdded.poison.damagetype}`,
            "value": data.poisonAdded.poison.damage,
            "mode": 0
          },
          {
            "key": `data.dicemodifier.value`,
            "value": data.poisonAdded.poison.penalty * -1,
            "mode": 2
          },
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
  if (!game.user.isGM) return;

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
      actorData.system.shieldinitiative.value = actorData.system.shieldinitiative.max;
      let totalHealth = 0;
      let bashingDamage = 0;
      let lethalDamage = 0;
      let aggravatedDamage = 0;
      let initiativeDamage = 0;
      let crasherId = null;
      let currentCombatantInitiative = combatant.initiative;
      for (let [key, health_level] of Object.entries(actorData.system.health.levels)) {
        totalHealth += health_level.value;
      }
      for (const activeEffect of combatant.actor.allApplicableEffects()) {
        if (activeEffect.duration.remaining > 0 && !activeEffect.disabled) {
          for (const change of activeEffect.changes) {
            if (change.key === 'system.damage.round.initiative.lethal' || change.key === 'system.damage.round.initiative.bashing') {
              if (currentCombatantInitiative !== null && (currentCombatantInitiative - parseInt(change.value)) <= 0 && currentCombatantInitiative > 0) {
                crasherId = activeEffect.flags?.exaltedthird?.poisonerCombatantId;
              }
              currentCombatantInitiative -= parseInt(change.value);
              initiativeDamage += parseInt(change.value);
              if (combatant.initiative !== null && combatant.initiative <= 0) {
                if (change.key === 'system.damage.round.initiative.bashing') {
                  bashingDamage += parseInt(change.value);
                }
                else {
                  lethalDamage += parseInt(change.value);
                }
              }
            }
            if (change.key === 'system.damage.round.bashing') {
              bashingDamage += parseInt(change.value);
            }
            if (change.key === 'system.damage.round.lethal') {
              lethalDamage += parseInt(change.value);
            }
            if (change.key === 'system.damage.round.aggravated') {
              aggravatedDamage += parseInt(change.value);
            }
          }
        }
      }
      if (bashingDamage || lethalDamage || aggravatedDamage) {
        actorData.system.health.aggravated = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.lethal, actorData.system.health.aggravated + aggravatedDamage);
        actorData.system.health.lethal = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.aggravated, actorData.system.health.lethal + lethalDamage);
        actorData.system.health.bashing = Math.min(totalHealth - actorData.system.health.aggravated - actorData.system.health.lethal, actorData.system.health.bashing + bashingDamage);
      }
      if (combatant.initiative !== null && combatant.initiative > 0 && initiativeDamage) {
        game.combat.setInitiative(combatant.id, currentCombatantInitiative, crasherId);
        if (crasherId) {
          const crasher = game.combat.combatants.get(crasherId);
          if (crasher && crasher.initiative) {
            game.combat.setInitiative(crasherId, crasher.initiative + 5);
          }
        }
      }
      await combatant.actor.update(actorData);
    }
  }
  if (update && (update.round !== undefined || update.turn !== undefined)) {
    if (combat.current.combatantId) {
      var currentCombatant = combat.combatants.get(combat.current.combatantId);
      if (currentCombatant?.actor) {
        const actorData = duplicate(currentCombatant.actor);
        const onslaught = currentCombatant.actor.effects.find(i => i.flags.exaltedthird?.statusId == "onslaught");
        if (onslaught) {
          if (!actorData.system.dontresetonslaught) {
            onslaught.delete();
          }
        }
        actorData.system.dontresetonslaught = false;
        const fullDefense = currentCombatant.actor.effects.find(e => e.getFlag("core", "statusId") === "fulldefense");
        if (fullDefense) {
          fullDefense.delete();
        }
        const defensePenalty = currentCombatant.actor.effects.find(i => i.flags.exaltedthird?.statusId == "defensePenalty");
        if (defensePenalty) {
          defensePenalty.delete();
        }
        if (currentCombatant.actor.system.grapplecontrolrounds.value > 0) {
          actorData.system.grapplecontrolrounds.value -= 1;
        }
        const startTurnItems = actorData.items.filter((item) => item.system.active && item.system.endtrigger === 'startturn');
        for (const item of startTurnItems) {
          item.system.active = false;
          if (item.type === 'charm') {
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
          for (const effect of currentCombatant.actor.allApplicableEffects()) {
            if (effect._sourceName === item.name) {
              effect.update({ disabled: true });
            }
          }
        }
        for (const effectItem of currentCombatant.actor.items.filter((item) => item.system.endtrigger === 'startturn')) {
          for (const effect of effectItem.effects) {
            effect.update({ disabled: true });
          }
        }
        await currentCombatant.actor.update(actorData);
      }
    }
    if (combat.previous.combatantId) {
      var previousCombatant = combat.combatants.get(combat.previous.combatantId);
      if (previousCombatant?.actor) {
        const previousActorData = duplicate(previousCombatant.actor);
        if (previousActorData.system.battlegroup) {
          previousActorData.system.commandbonus.value = 0;
        }
        const endTurnItems = previousActorData.items.filter((item) => item.system.active && item.system.endtrigger === 'endturn');
        for (const item of endTurnItems) {
          item.system.active = false;
          if (item.type === 'charm') {
            if (previousActorData.system.settings.charmmotepool === 'personal') {
              if (item.system.cost.commitmotes > 0) {
                previousActorData.system.motes.personal.committed -= item.system.cost.commitmotes;
              }
            }
            else {
              if (item.system.cost.commitmotes > 0) {
                previousActorData.system.motes.peripheral.committed -= item.system.cost.commitmotes;
              }
            }
          }
          for (const effect of previousCombatant.actor.allApplicableEffects()) {
            if (effect._sourceName === item.name) {
              effect.update({ disabled: true });
            }
          }
        }
        for (const effectItem of previousCombatant.actor.items.filter((item) => item.system.endtrigger === 'endturn')) {
          for (const effect of effectItem.effects) {
            effect.update({ disabled: true });
          }
        }
        await previousCombatant.actor.update(previousActorData);
      }
    }
  }
}));

Hooks.on("deleteCombat", (entity, deleted) => {
  for (const combatant of entity.combatants) {
    if (combatant?.actor) {
      const previousActorData = duplicate(combatant.actor);
      const endSceneItems = previousActorData.items.filter((item) => item.system.active && item.system.endtrigger === 'endscene');
      if (endSceneItems?.length) {
        for (const item of endSceneItems) {
          item.system.active = false;
          if (item.type === 'charm') {
            if (previousActorData.system.settings.charmmotepool === 'personal') {
              if (item.system.cost.commitmotes > 0) {
                previousActorData.system.motes.personal.committed -= item.system.cost.commitmotes;
              }
            }
            else {
              if (item.system.cost.commitmotes > 0) {
                previousActorData.system.motes.peripheral.committed -= item.system.cost.commitmotes;
              }
            }
          }
          for (const effect of combatant.actor.allApplicableEffects()) {
            if (effect._sourceName === item.name) {
              effect.update({ disabled: true });
            }
          }
        }
        combatant.actor.update(previousActorData);
      }
      for (const effectItem of combatant.actor.items.filter((item) => item.system.endtrigger === 'endscene')) {
        for (const effect of effectItem.effects) {
          effect.update({ disabled: true });
        }
      }
    }
  }
});

Hooks.on("chatMessage", (html, content, msg) => {
  let regExp;
  regExp = /(\S+)/g;
  let commands = content.match(regExp);
  let command = commands[0];

  if (command === "/info") {
    const chatData = {
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: '<div><b>Commands</b></div><div><b>/info</b> Display possible commands</div><div><b>/newscene</b> End any scene duration charms</div><div><b>/npc</b> NPC creator</div><div><b>/xp #</b> Give xp to player characters</div><div><b>/exaltxp #</b> Give exalt xp to player characters</div>',
    };
    ChatMessage.create(chatData);
    return false;
  }
  if (command === '/npc') {
    new NPCGenerator(null, {}, {}, {}).render(true);
    return false;
  }
  if (command === "/xp") {
    if (isNaN(parseInt(commands[1]))) {
      const chatData = {
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        content: `Invalid number input`,
      };
      ChatMessage.create(chatData);
      return false;
    }
    const actors = game.users.players.filter(c => c.character && c.character.type === 'character').map(u => u.character);

    actors.forEach((actor) => {
      const newStandardValue = (parseInt(actor.system.experience.standard.value) || 0) + parseInt(commands[1] || 0);
      const newStandardTotal = (parseInt(actor.system.experience.standard.total) || 0) + parseInt(commands[1] || 0);
      actor.update({ "system.experience.standard.value": Math.ceil(newStandardValue), "system.experience.standard.total": Math.ceil(newStandardTotal) });
    });
    const chatData = {
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: `${parseInt(commands[1] || 0)} experience granted`,
    };
    ChatMessage.create(chatData);
    return false;
  }
  if (command === "/exaltxp") {
    if (isNaN(parseInt(commands[1]))) {
      const chatData = {
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        content: `Invalid number input`,
      };
      ChatMessage.create(chatData);
      return false;
    }
    const actors = game.users.players.filter(c => c.character && c.character.type === 'character').map(u => u.character);

    actors.forEach((actor) => {
      const newExaltValue = (parseInt(actor.system.experience.exalt.value) || 0) + parseInt(commands[1] || 0);
      const newExaltTotal = (parseInt(actor.system.experience.exalt.total) || 0) + parseInt(commands[1] || 0);
      actor.update({ "system.experience.exalt.value": Math.ceil(newExaltValue), "system.experience.exalt.total": Math.ceil(newExaltTotal) });
    });
    const chatData = {
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: `${parseInt(commands[1] || 0)} exalt experience granted`,
    };
    ChatMessage.create(chatData);
    return false;
  }
  if (command === "/newscene") {
    const tokens = canvas.scene?.tokens;
    for (const token of tokens) {
      if (token.actor) {
        const actorData = duplicate(token.actor);
        const endSceneItems = actorData.items.filter((item) => item.system.active && item.system.endtrigger === 'endscene');
        for (const item of endSceneItems) {
          item.system.active = false;
          if (item.type === 'charm') {
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
          for (const effect of token.actor.allApplicableEffects()) {
            if (effect._sourceName === item.name) {
              effect.update({ disabled: true });
            }
          }
        }
        for (const effectItem of token.actor.items.filter((item) => item.system.endtrigger === 'endscene')) {
          for (const effect of effectItem.effects) {
            effect.update({ disabled: true });
          }
        }
        token.actor.update(actorData);
      }
    }
    const chatData = {
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: 'New Scene',
    };
    ChatMessage.create(chatData);
    return false;
  }
});

Hooks.on("renderChatLog", (app, html, data) => {
  Chat.addChatListeners(html);
});

//Martialart, craft, and initiation are deprecated but i don't want to delete them because it will break characters
Hooks.on("renderDialog", (dialog, html) => {
  Array.from(html.find("#document-create option")).forEach(i => {
    if (i.value == "martialrt" || i.value == "craft" || i.value == "initiation") {
      i.remove()
    }
  });
});

Hooks.on("renderTokenConfig", (dialog, html) => {
  Array.from(html.find(".bar-attribute option")).forEach(i => {
    if (i.value.includes('savedRolls')) {
      i.remove()
    }
  });
})

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to

  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (["Item", "savedRoll"].includes(data.type)) {
      createItemMacro(data, slot);
      return false;
    }
  });

  const gameMigrationVersion = game.settings.get("exaltedthird", "systemMigrationVersion");

  if (isNewerVersion("1.4.1", game.settings.get("exaltedthird", "systemMigrationVersion"))) {
    for (let item of game.items) {
      try {
        let updateData = foundry.utils.deepClone(item.toObject());
        if (updateData.type === 'weapon') {
          console.log(`Migrating Item document ${item.name}`);
          if (updateData.system.defence && updateData.system.defence > 0) {
            updateData.system.defense = updateData.system.defence;
            updateData.system.defence = 0;
          }
          if (!foundry.utils.isEmpty(updateData)) {
            await item.update(updateData, { enforceTypes: false });
          }
        }
      } catch (error) {
        error.message = `Failed migration for Item ${item.name}: ${error.message} `;
        console.error(error);
      }
      await game.settings.set("exaltedthird", "systemMigrationVersion", game.system.version);
    }
  }

  if (isNewerVersion("1.4.3", game.settings.get("exaltedthird", "systemMigrationVersion"))) {
    for (let actor of game.actors) {
      try {
        let updateData = foundry.utils.deepClone(actor.toObject());
        updateData.system.details.animacolor = updateData.system.details.color;
        if (!foundry.utils.isEmpty(updateData)) {
          await actor.update(updateData, { enforceTypes: false });
        }
      } catch (error) {
        error.message = `Failed migration for Actor ${actor.name}: ${error.message} `;
        console.error(error);
      }
    }
  }

  if (isNewerVersion("1.7.6", game.settings.get("exaltedthird", "systemMigrationVersion"))) {
    for (let actor of game.actors.filter((actor) => actor.type === 'npc' && actor.system.creaturetype !== 'exalt' && actor.system.details.exalt === 'abyssal')) {
      try {
        let updateData = foundry.utils.deepClone(actor.toObject());
        updateData.system.details.exalt = 'other';
        if (!foundry.utils.isEmpty(updateData)) {
          await actor.update(updateData, { enforceTypes: false });
        }
      } catch (error) {
        error.message = `Failed migration for Actor ${actor.name}: ${error.message} `;
        console.error(error);
      }
    }
  }

  if (isNewerVersion("1.9.2", game.settings.get("exaltedthird", "systemMigrationVersion"))) {
    for (let item of game.items) {
      try {
        if (item.type === 'charm') {
          let updateData = foundry.utils.deepClone(item.toObject());
          if (updateData.system.ability === 'martial' || updateData.system.ability === 'essence' || (updateData.system.martialart && !updateData.system.listingname)) {
            console.log(`Migrating Item document ${item.name}`);
            if (updateData.system.martialart && !updateData.system.listingname) {
              updateData.system.listingname = updateData.system.martialart;
              updateData.system.martialart = "";
            }
            if (updateData.system.ability === 'martial') {
              updateData.system.ability = 'martialarts';
            }
            if (updateData.system.ability === 'essence') {
              updateData.system.ability = 'evocation';
            }
          }
          if (!foundry.utils.isEmpty(updateData)) {
            await item.update(updateData, { enforceTypes: false });
          }
        }
      } catch (error) {
        error.message = `Failed migration for Item ${item.name}: ${error.message} `;
        console.error(error);
      }
    }
    for (let actor of game.actors.filter((actor) => actor.type === 'npc')) {
      try {
        let updateData = duplicate(actor);
        const doNotUpdate = ['command', 'grapple', 'joinbattle', 'movement', 'readintentions', 'social', 'sorcery'];
        for (let [key, pool] of Object.entries(updateData.system.pools)) {
          if (!doNotUpdate.includes(key)) {
            if (pool.value) {
              const itemData = {
                name: game.i18n.localize(pool.name),
                type: 'action',
                system: {
                  'value': pool.value,
                  'oldKey': key,
                }
              };
              actor.createEmbeddedDocuments("Item", [itemData]);
            }
            await actor.update({
              [`system.pools.-=${key}`]: null,
            });
          }
        }
      } catch (error) {
        error.message = `Failed migration for Actor ${actor.name}: ${error.message} `;
        console.error(error);
      }
    }
  }

  if (isNewerVersion("1.9.5", game.settings.get("exaltedthird", "systemMigrationVersion"))) {
    const chatData = {
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: '<div><b>Commands</b></div><div><b>/info</b> Display possible commands</div><div><b>/newscene</b> End any scene duration charms</div><div><b>/xp #</b> Give xp to player characters</div><div><b>/exaltxp #</b> Give exalt xp to player characters</div>',
    };
    ChatMessage.create(chatData);
    for (let actor of game.actors.filter((actor) => actor.type === 'npc')) {
      try {
        let updateData = duplicate(actor);
        if (updateData.system.creaturetype !== 'exalt') {
          updateData.system.details.creaturesubtype = updateData.system.details.exalt;
          updateData.system.details.exalt = 'other';
          await actor.update(updateData, { enforceTypes: false });
        }
      } catch (error) {
        error.message = `Failed migration for Actor ${actor.name}: ${error.message} `;
        console.error(error);
      }
    }
  }

  if (isNewerVersion("1.10.0", game.settings.get("exaltedthird", "systemMigrationVersion"))) {
    const chatData = {
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: 'New Command: /npc',
    };
    ChatMessage.create(chatData);
    for (let actor of game.actors.filter((actor) => actor.type === 'npc')) {
      try {
        let updateData = duplicate(actor);
        if (updateData.system.creaturetype !== 'exalt') {
          updateData.system.details.creaturesubtype = updateData.system.details.exalt;
          updateData.system.details.exalt = 'other';
          await actor.update(updateData, { enforceTypes: false });
        }
      } catch (error) {
        error.message = `Failed migration for Actor ${actor.name}: ${error.message} `;
        console.error(error);
      }
    }
  }

  if (isNewerVersion("1.11.0", game.settings.get("exaltedthird", "systemMigrationVersion"))) {
    ui.notifications.notify(`Migrating data to 1.11.0, please wait`);
    const chatData = {
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: 'As of 1.11.0, you can now select if an ability has an excellency or not.  Doing so will determine whether the dice caps show up.  You can also change what attribute/ability informs static values.  Set this value in Character creation mode.',
    };
    ChatMessage.create(chatData);
    const martialArtData = {
      system: {
        abilitytype: 'martialart'
      }
    }
    const craftData = {
      system: {
        abilitytype: 'craft'
      }
    }
    for (let item of game.items.filter((item) => item.type === 'martialart')) {
      await item.update({
        [`type`]: 'customability',
      });
      await item.update(martialArtData);
    }
    for (let item of game.items.filter((item) => item.type === 'craft')) {
      await item.update({
        [`type`]: 'customability',
      });
      await item.update(craftData);
    }
    for (let item of game.items.filter((item) => item.type === 'initiation')) {
      await item.update({
        [`type`]: 'ritual',
      });
    }
    for (let actor of game.actors) {
      try {
        for (let item of actor.items.filter((item) => item.type === 'martialart')) {
          await item.update({
            [`type`]: 'customability',
          });
          await item.update(martialArtData);
        }
        for (let item of actor.items.filter((item) => item.type === 'craft')) {
          await item.update({
            [`type`]: 'customability',
          });
          await item.update(craftData);
        }
        for (let item of actor.items.filter((item) => item.type === 'initiation')) {
          await item.update({
            [`type`]: 'ritual',
          });
        }
        let updateData = duplicate(actor);
        if (updateData.system.details.exalt !== 'other' && updateData.system.details.exalt !== 'exigent') {
          updateData.system.details.caste = updateData.system.details.caste.toLowerCase().replace(/\s+/g, "");
          await actor.update(updateData, { enforceTypes: false });
        }
      } catch (error) {
        error.message = `Failed migration for Actor ${actor.name}: ${error.message} `;
        console.error(error);
      }
    }
    for (let pack of game.packs) {
      const type = pack.metadata.type;
      if (['Actor', 'Item'].includes(type)) {
        // Unlock the pack for editing
        const wasLocked = pack.locked;
        await pack.configure({ locked: false });
        // Begin by requesting server-side data model migration and get the migrated content
        await pack.migrate();
        const documents = await pack.getDocuments();
        // Iterate over compendium entries - applying fine-tuned migration functions
        for (const doc of documents) {
          let updateData = {};
          try {
            switch (type) {
              case 'Actor':
                for (let item of actor.items.filter((item) => item.type === 'martialart')) {
                  await item.update({
                    [`type`]: 'customability',
                  });
                  await item.update(martialArtData);
                }
                for (let item of actor.items.filter((item) => item.type === 'craft')) {
                  await item.update({
                    [`type`]: 'customability',
                  });
                  await item.update(craftData);
                }
                for (let item of doc.items.filter((item) => item.type === 'initiation')) {
                  await item.update({
                    [`type`]: 'ritual',
                  });
                }
                break;
              case 'Item':
                if (doc.type === 'initiation') {
                  await doc.update({
                    [`type`]: 'ritual',
                  });
                }
                if (doc.type === 'martialart' || doc.type === 'craft') {
                  await doc.update({
                    [`type`]: 'customability',
                  });
                }
                break;
            }
            if (foundry.utils.isEmpty(updateData))
              continue;
          }
          catch (err) {
            // Handle migration failures
            err.message = `Failed ex3 system migration for document ${doc.name} in pack ${pack.collection}: ${err.message}`;
          }
        }
        // Apply the original locked status for the pack
        await pack.configure({ locked: wasLocked });
      }
    }
    await game.settings.set("exaltedthird", "systemMigrationVersion", game.system.version);
    ui.notifications.notify(`Migration Complete`);
  }

  // for(let item of game.items.filter((item) => item.system.duration.trim() === 'One scene')) {
  //   let updateData = foundry.utils.deepClone(item.toObject());
  //   updateData.system.endtrigger = 'endscene';
  //   if (!foundry.utils.isEmpty(updateData)) {
  //     await item.update(updateData, { enforceTypes: false });
  //   }
  //   console.log(item.name);
  // }

  // for(let item of game.items.filter((item) => item.system.duration.trim() === 'One turn' || item.system.duration.trim() === 'Until next turn')) {
  //   let updateData = foundry.utils.deepClone(item.toObject());
  //   updateData.system.endtrigger = 'startturn';
  //   if (!foundry.utils.isEmpty(updateData)) {
  //     await item.update(updateData, { enforceTypes: false });
  //   }
  //   console.log(item.name);
  // }

  // for (let item of game.items) {
  //   try {
  //     let updateData = foundry.utils.deepClone(item.toObject());
  //     if (updateData.type === 'charm') {
  //       var image = 'icons/svg/explosion.svg';
  //       var imageMap = {};
  //       switch (updateData.system.ability) {
  //         case 'archery':
  //           image = 'icons/skills/ranged/arrow-flying-white-blue.webp';
  //           break;
  //         case 'athletics':
  //           imageMap = { 
  //             'Attack': 'icons/skills/melee/strike-flail-destructive-yellow.webp',
  //             'Might': 'icons/magic/control/buff-strength-muscle-damage-orange.webp',
  //             'Mobility': 'icons/skills/movement/feet-winged-boots-glowing-yellow.webp',
  //             'Special': 'icons/magic/light/explosion-beam-impact-silhouette.webp',
  //             'Speed': 'icons/skills/movement/feet-winged-boots-glowing-yellow.webp',
  //           };
  //           break;
  //         case 'awareness':
  //           image = 'icons/magic/control/hypnosis-mesmerism-eye-tan.webp'
  //           break;
  //         case 'brawl':
  //           image = 'icons/skills/melee/unarmed-punch-fist-yellow-red.webp'
  //           imageMap = { 
  //             'Grappling': 'icons/skills/melee/strike-chain-whip-blue.webp',
  //           };
  //           break;
  //         case 'bureaucracy':
  //           image = 'icons/skills/trades/academics-merchant-scribe.webp'
  //           break;
  //         case 'craft':
  //           image = 'icons/skills/trades/smithing-anvil-silver-red.webp'
  //           break;
  //         case 'dodge':
  //           image = 'icons/magic/movement/trail-streak-zigzag-yellow.webp'
  //           break;
  //         case 'integrity':
  //           image = 'icons/magic/holy/meditation-chi-focus-blue.webp'
  //           break;
  //         case 'investigation':
  //           image = 'icons/skills/trades/academics-investigation-study-blue.webp'
  //           break;
  //         case 'larceny':
  //           image = 'icons/skills/trades/security-locksmith-key-gray.webp'
  //           break;
  //         case 'linguistics':
  //           image = 'icons/skills/trades/academics-scribe-quill-gray.webp'
  //           break;
  //         case 'lore':
  //           image = 'icons/skills/trades/academics-study-reading-book.webp'
  //           break;
  //         case 'medicine':
  //           image = 'icons/tools/cooking/mortar-stone-yellow.webp'
  //           imageMap = {
  //             'Poison': 'icons/skills/toxins/poison-bottle-corked-fire-green.webp'
  //           };
  //           break;
  //         case 'melee':
  //           image = 'icons/skills/melee/weapons-crossed-swords-yellow.webp'
  //           imageMap = { 
  //             'Defense': 'icons/skills/melee/shield-block-gray-orange.webp',
  //           };
  //           break;
  //         case 'occult':
  //           image = 'icons/magic/symbols/runes-star-pentagon-orange.webp'
  //           break;
  //         case 'performance':
  //           image = 'icons/skills/trades/music-notes-sound-blue.webp';
  //           break;
  //         case 'presence':
  //           image = 'icons/magic/control/silhouette-aura-energy.webp'
  //           imageMap = {
  //             'Seduction': 'icons/magic/life/heart-glowing-red.webp'
  //           };
  //           break;
  //         case 'resistance':
  //           image = 'icons/magic/defensive/shield-barrier-deflect-gold.webp'
  //           break;
  //         case 'ride':
  //           image = 'icons/environment/creatures/horse-brown.webp'
  //           break;
  //         case 'sail':
  //           image = 'icons/skills/trades/profession-sailing-ship.webp';
  //           imageMap = {
  //             'Navigation': 'icons/tools/navigation/map-marked-blue.webp'
  //           };
  //           break;
  //         case 'socialize':
  //           image = 'icons/skills/social/diplomacy-handshake-yellow.webp'
  //           break;
  //         case 'stealth':
  //           image = 'icons/magic/perception/shadow-stealth-eyes-purple.webp'
  //           break;
  //         case 'survival':
  //           image = 'icons/magic/nature/wolf-paw-glow-large-green.webp';
  //           imageMap = {
  //             'Wilderness': 'icons/magic/nature/plant-bamboo-green.webp'
  //           };
  //           break;
  //         case 'thrown':
  //           image = 'icons/skills/ranged/daggers-thrown-salvo-orange.webp'
  //           break;
  //         case 'war':
  //           image = 'icons/environment/people/charge.webp'
  //           break;
  //         case 'universal':
  //           image = 'icons/magic/light/explosion-star-large-orange.webp';
  //           break;
  //       }
  //       if(imageMap[item.folder.name]) {
  //         image = imageMap[item.folder.name];
  //       }
  //       var listingName = updateData.system.ability.charAt(0).toUpperCase() + updateData.system.ability.slice(1);
  //       if(item.folder.name !== listingName) {
  //         listingName += ` (${item.folder.name})`;
  //       }
  //       updateData.img = image;
  //       updateData.system.listingname = listingName;
  //       if (!foundry.utils.isEmpty(updateData)) {
  //         await item.update(updateData, { enforceTypes: false });
  //       }
  //     }
  //   } catch (error) {
  //     error.message = `Failed migration for Item ${item.name}: ${error.message} `;
  //     console.error(error);
  //   }
  // }



  $("#chat-log").on("click", " .item-row", ev => {
    const li = $(ev.currentTarget).next();
    li.toggle("fast");
  });

});


async function createItemMacro(data, slot) {
  if (data.type !== "Item" && data.type !== "savedRoll") return;
  if (data.type === "Item") {
    if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
      return ui.notifications.warn("You can only create macro buttons for owned Items");
    }
    const item = await Item.fromDropData(data);
    let command = `Hotbar.toggleDocumentSheet("${data.uuid}");`;
    if (item.type === 'weapon') {
      command = `//Swtich withering with (decisive, gambit, withering-split, decisive-split, gambit-split) to roll different attack types\ngame.exaltedthird.weaponAttack("${data.uuid}", 'withering');`;
    }
    if (item.type === 'charm') {
      command = `//Will add this charm to any roll you have open and if opposed any roll another player has open\n//If the charm user has no dice roller open it will instead Spend or activate the charm\ngame.exaltedthird.triggerItem("${data.uuid}");`;
    }
    let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
      if (item.type === 'weapon' || item.type === 'charm') {
        macro = await Macro.create({
          name: item.name,
          type: "script",
          img: item.img,
          command: command,
          flags: { "exaltedthird.itemMacro": true }
        });
      }
      else {
        const name = item.name || `Default`;
        macro = await Macro.create({
          name: `${game.i18n.localize("Display")} ${name}`,
          type: "script",
          img: item.img,
          command: command
        });
      }
      game.user.assignHotbarMacro(macro, slot);
    }
  }
  else {
    const command = `const formActor = await fromUuid("${data.actorId}");
        game.rollForm = new game.exaltedthird.RollForm(${data.actorId.includes('Token') ? 'formActor.actor' : 'formActor'}, {}, {}, { rollId: "${data.id}" }).render(true); `;
    const macro = await Macro.create({
      name: data.name,
      img: 'systems/exaltedthird/assets/icons/d10.svg',
      type: "script",
      command: command,
    });
    game.user.assignHotbarMacro(macro, slot);
  }
  return false;
}

function weaponAttack(itemUuid, attackType = 'withering') {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }
    game.rollForm = new RollForm(item.parent, {}, {}, { rollType: attackType, weapon: item.system }).render(true);
  });
}

function triggerItem(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }
    if (game.rollForm) {
      game.rollForm.addCharm(item);
    }
    else if (item.system.diceroller.opposedbonuses.enabled) {
      game.socket.emit('system.exaltedthird', {
        type: 'addOpposingCharm',
        data: item,
        actorId: item.actor._id,
      });
      if (item.system.cost.commitmotes > 0 && !item.system.active) {
        spendEmbeddedItem(item.parent, item);
      }
    }
    else {
      spendEmbeddedItem(item.parent, item);
    }
  });
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

  async setInitiative(id, value, crasherId = null) {
    const combatant = this.combatants.get(id, { strict: true });
    const newVal = {
      initiative: value
    };
    if (value <= 0 && combatant.initiative && combatant.initiative > 0 && crasherId) {
      newVal[`flags.crashedBy`] = crasherId;
    }
    if (value > 0) {
      newVal[`flags.crashedBy`] = null;
    }
    await combatant.update(newVal);
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
    return this.setCharacterTurn(id);
    // return this.nextTurn();
  }

  async setCharacterTurn(id) {
    const turn = this.turns.findIndex(t => t.id === id);
    return this.update({ turn });
    // return this.nextTurn();
  }

  async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
    const combatant = this.combatants.get(ids[0]);
    if (combatant.token.actor) {
      if (combatant.token.actor.type === "npc") {
        game.rollForm = new RollForm(combatant.token.actor, {}, {}, { rollType: 'joinBattle', pool: 'joinbattle' }).render(true);
      }
      else {
        game.rollForm = new RollForm(combatant.token.actor, {}, {}, { rollType: 'joinBattle', ability: 'awareness', attribute: 'wits' }).render(true);
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
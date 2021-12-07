export async function openRollDialogue(actor) {
    let confirmed = false;
    const template = "systems/exaltedthird/templates/dialogues/dice-roll.html";
    const html = await renderTemplate(template, {});
    new Dialog({
        title: `Die 10 Roller`,
        content: html,
        buttons: {
            roll: { label: "Roll it!", callback: () => confirmed = true },
            cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
            if (confirmed) {
                let doubleSuccess = parseInt(html.find('#double-success').val()) || 10;
                let dice = parseInt(html.find('#num').val()) || 0;
                let successModifier = parseInt(html.find('#success-modifier').val()) || 0;
                let targetNumber = parseInt(html.find('#target-number').val()) || 7;
                let rerollFailed = html.find('#reroll-failed').is(':checked');
                let rerollNumber = parseInt(html.find('#reroll-number').val()) || 0;
                let rerollString = '';
                let rerolls = [];

                for (let i = 1; i <= 10; i++) {
                    if (html.find(`#reroll-${i}`).is(':checked')) {
                        rerollString += `x${i}`;
                        rerolls.push(i);
                    }
                }

                let rerolledDice = 0;
                let bonus = 0;
                let total = 0;
                let get_dice = "";

                let roll = new Roll(`${dice}d10${rerollString}${rerollFailed ? "r<7" : ""}cs>=${targetNumber}`).evaluate({ async: false });
                let dice_roll = roll.dice[0].results;

                var failedDice = Math.min(dice - roll.total, rerollNumber);

                while (failedDice != 0 && (rerolledDice < rerollNumber)) {
                    rerolledDice += failedDice;
                    var failedDiceRoll = new Roll(`${failedDice}d10cs>=${targetNumber}`).evaluate({ async: false });
                    failedDice = Math.min(failedDice - failedDiceRoll.total, (rerollNumber - rerolledDice));
                    dice_roll = dice_roll.concat(failedDiceRoll.dice[0].results);
                    total += failedDiceRoll.total;
                }

                for (let dice of dice_roll) {
                    if (dice.result >= doubleSuccess) {
                        bonus++;
                        get_dice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
                    }
                    else if (dice.result >= targetNumber) { get_dice += `<li class="roll die d10 success">${dice.result}</li>`; }
                    else if (rerolls.includes(dice.result)) { get_dice += `<li class="roll die d10 discarded">${dice.result}</li>`; }
                    else if (dice.result == 1) { get_dice += `<li class="roll die d10 failure">${dice.result}</li>`; }
                    else { get_dice += `<li class="roll die d10">${dice.result}</li>`; }
                }
                total += roll.total;


                if (bonus) total += bonus;
                if (successModifier) total += successModifier;

                let the_content = `<div class="chat-card">
                                <div class="card-content">Dice Roll</div>
                                <div class="card-buttons">
                                    <div class="flexrow 1">
                                        <div>Dice Roller - Number of Successes<div class="dice-roll">
                                                <div class="dice-result">
                                                    <h4 class="dice-formula">${dice} Dice + ${successModifier} successes</h4>
                                                    <div class="dice-tooltip">
                                                        <div class="dice">
                                                            <ol class="dice-rolls">${get_dice}</ol>
                                                        </div>
                                                    </div>
                                                    <h4 class="dice-total">${total} Succeses</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                ChatMessage.create({ user: game.user.id, speaker: actor != null ? ChatMessage.getSpeaker({ actor: actor }) : null, content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: roll });
            }
        }
    }).render(true);
}

const diceDialog = class extends Dialog {
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.collapsable').click(ev => {
            const li = $(ev.currentTarget).next();
            li.toggle("fast");
        });
    }
}

function _baseAbilityDieRoll(html, actor, characterType = 'character', rollType = 'ability') {
    const data = actor.data.data;
    const actorData = duplicate(actor);
    let dice = 0;

    if (characterType === 'character') {
        let attribute = html.find('#attribute').val();
        let ability = html.find('#ability').val();
        let attributeDice = data.attributes[attribute].value;
        let abilityDice = data.abilities[ability].value;
        dice = attributeDice + abilityDice;
    }
    else if (characterType === 'npc' && rollType !== 'attack') {
        let pool = html.find('#pool').val();
        let poolDice = data.pools[pool].value;
        dice = poolDice;
    }

    if (rollType === 'attack') {
        dice += parseInt(html.find('#accuracy').val()) || 0;
    }

    let stunt = html.find('#stunt').val();
    let woundPenalty = html.find('#wound-penalty').is(':checked');
    let flurry = html.find('#flurry').is(':checked');
    let armorPenalty = html.find('#armor-penalty').is(':checked');
    let specialty = html.find('#specialty').is(':checked');
    let willpower = html.find('#willpower').is(':checked');

    let diceModifier = parseInt(html.find('#dice-modifier').val()) || 0;
    let successModifier = parseInt(html.find('#success-modifier').val()) || 0;

    let doubleSuccess = parseInt(html.find('#double-success').val()) || 11;

    let rerollFailed = html.find('#reroll-failed').is(':checked');
    let targetNumber = parseInt(html.find('#target-number').val()) || 7;
    let rerollNumber = parseInt(html.find('#reroll-number').val()) || 0;

    let rerollString = '';
    let rerolls = [];

    for (let i = 1; i <= 10; i++) {
        if (html.find(`#reroll-${i}`).is(':checked')) {
            rerollString += `x${i}`;
            rerolls.push(i);
        }
    }

    if (armorPenalty) {
        for (let armor of actor.armor) {
            if (armor.data.equiped) {
                dice = dice - Math.abs(armor.data.penalty);
            }
        }
    }
    if (stunt !== 'none') {
        dice += 2;
    }
    if (stunt === 'two') {
        actorData.data.willpower.value++;
        successModifier++;
    }
    if (stunt === 'three') {
        actorData.data.willpower.value += 2;
        successModifier += 2;
    }
    if (woundPenalty && data.health.penalty !== 'inc') {
        if (data.warstrider.equipped) {
            dice -= data.warstrider.health.penalty;
        }
        else {
            dice -= data.health.penalty;
        }
    }
    if (flurry) {
        dice -= 3;
    }
    if (diceModifier) {
        dice += diceModifier;
    }
    if (specialty) {
        dice++;
    }
    if (willpower) {
        successModifier++;
        actorData.data.willpower.value--;
    }

    actor.update(actorData);

    let roll = new Roll(`${dice}d10${rerollString}${rerollFailed ? "r<7" : ""}cs>=${targetNumber}`).evaluate({ async: false });
    let diceRoll = roll.dice[0].results;
    let getDice = "";
    let bonus = 0;
    let total = 0;
    let rerolledDice = 0;
    var failedDice = Math.min(dice - roll.total, rerollNumber);

    while (failedDice != 0 && (rerolledDice < rerollNumber)) {
        rerolledDice += failedDice;
        var failedDiceRoll = new Roll(`${failedDice}d10cs>=7`).evaluate({ async: false });
        failedDice = Math.min(failedDice - failedDiceRoll.total, (rerollNumber - rerolledDice));
        diceRoll = diceRoll.concat(failedDiceRoll.dice[0].results);
        total += failedDiceRoll.total;
    }

    for (let dice of diceRoll) {
        if (dice.result >= doubleSuccess) {
            bonus++;
            getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
        }
        else if (dice.result >= 7) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
        else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
        else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
    }

    total += roll.total;
    if (bonus) total += bonus;
    if (successModifier) total += successModifier;


    return { dice: dice, roll: roll, getDice: getDice, total: total, bonusSuccesses: successModifier };
}

export async function joinBattle(actor) {
    const characterType = actor.data.type;
    if (characterType === "npc") {
        openAbilityRollDialogue(actor, 'joinbattle', null, "joinBattle");
    }
    else {
        openAbilityRollDialogue(actor, 'awareness', 'wits', "joinBattle");
    }
}

export async function shapeSorcery(actor) {
    const characterType = actor.data.type;
    if (characterType === "npc") {
        openAbilityRollDialogue(actor, 'sorcery', null, "sorcery");
    }
    else {
        openAbilityRollDialogue(actor, 'occult', 'intelligence', "sorcery");
    }
}

export async function socialInfluence(actor, influenceType) {
    const characterType = actor.data.type;
    if (influenceType === 'socialInfluence') {
        if (characterType === "npc") {
            openAbilityRollDialogue(actor, 'social', null, "social");
        }
        else {
            openAbilityRollDialogue(actor, 'socialize', 'charisma', "social");
        }
    }
    else {
        if (characterType === "npc") {
            openAbilityRollDialogue(actor, 'readintentions', null, "readIntentions");
        }
        else {
            openAbilityRollDialogue(actor, 'socialize', 'perception', "readIntentions");
        }
    }
}

export async function openAbilityRollDialogue(actor, ability = "archery", attribute, type = "roll") {
    const data = actor.data.data;
    const characterType = actor.data.type;
    let confirmed = false;
    let stunt = 'one';
    let difficultyString = 'Ex3.Difficulty';
    if (type === 'readIntentions') {
        difficultyString = 'Ex3.Guile';
    }
    if (type === 'social') {
        difficultyString = 'Ex3.Resolve';
    }
    const hasDifficulty = type === 'roll' || type === 'readIntentions' || type === 'social';
    var difficulty = 0;
    if (characterType === "npc") {
        stunt = 'none';
        if (ability === "archery") {
            ability = "primary";
        }
    }
    const template = "systems/exaltedthird/templates/dialogues/ability-roll.html";
    if (attribute == null) {
        attribute = characterType === "npc" ? null : _getHighestAttribute(data);
    }
    if (type === 'social' || type === 'readIntentions') {
        let target = Array.from(game.user.targets)[0] || null;
        if (target) {
            if (type === 'readIntentions') {
                difficulty = target.actor.data.data.guile.value;
            }
            if (type === 'social') {
                difficulty = target.actor.data.data.resolve.value;
            }
        }
    }

    const html = await renderTemplate(template, { 'character-type': characterType, 'attribute': attribute, ability: ability, 'stunt': stunt, 'difficulty': difficulty, 'hasDifficulty': hasDifficulty, 'difficultyString': difficultyString, "showPool": true });
    // @ts-ignore
    new diceDialog({
        title: `Die Roller`,
        content: html,
        buttons: {
            roll: { label: "Roll it!", callback: () => confirmed = true },
            cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
            if (confirmed) {
                var rollResults = _baseAbilityDieRoll(html, actor, characterType, 'ability');
                let resultString = ``;
                let difficulty = parseInt(html.find('#difficulty').val()) || 0;
                if (type === "joinBattle") {
                    resultString = `<h4 class="dice-total">${rollResults.total + 3} Initiative</h4>`;
                }
                if (hasDifficulty) {
                    if (rollResults.total < difficulty) {
                        resultString = `<h4 class="dice-total">Difficulty: ${difficulty}</h4><h4 class="dice-total">Check Failed</h4>`;
                        for (let dice of rollResults.roll.dice[0].results) {
                            if (dice.result === 1 && rollResults.total === 0) {
                                resultString = `<h4 class="dice-total">Difficulty: ${difficulty}</h4><h4 class="dice-total">Botch</h4>`;
                            }
                        }
                    }
                    else {
                        const threshholdSucceses = rollResults.total - difficulty;
                        resultString = `<h4 class="dice-total">Difficulty: ${difficulty}</h4><h4 class="dice-total">${threshholdSucceses} Threshhold Succeses</h4>`;
                    }
                }
                let the_content = `
          <div class="chat-card">
              <div class="card-content">Dice Roll</div>
              <div class="card-buttons">
                  <div class="flexrow 1">
                      <div>Dice Roller - Number of Successes<div class="dice-roll">
                              <div class="dice-result">
                                  <h4 class="dice-formula">${rollResults.dice} Dice + ${rollResults.bonusSuccesses} successes</h4>
                                  <div class="dice-tooltip">
                                      <div class="dice">
                                          <ol class="dice-rolls">${rollResults.getDice}</ol>
                                      </div>
                                  </div>
                                  <h4 class="dice-total">${rollResults.total} Succeses</h4>
                                  ${resultString}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          `
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
                if (type === "joinBattle") {
                    let combat = game.combat;
                    if (combat) {
                        let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == actor.id);
                        if (combatant) {
                            combat.setInitiative(combatant.id, rollResults.total + 3);
                        }
                    }
                }
                if (type === "sorcery") {
                    const actorData = duplicate(actor);
                    actorData.data.sorcery.motes += rollResults.total;
                    actor.update(actorData);
                }
            }
        }
    }).render(true);
}

function _getHighestAttribute(data) {
    var highestAttributeNumber = 0;
    var highestAttribute = "strength";
    for (let [name, attribute] of Object.entries(data.attributes)) {
        if (attribute.value > highestAttributeNumber) {
            highestAttributeNumber = attribute.value;
            highestAttribute = name;
        }
    }
    return highestAttribute;
}

export async function openAttackDialogue(actor, attribute = "dexterity", ability = "melee", accuracy, damage, overwhelming, attackType = 'decisive') {
    const characterType = actor.data.type;
    let confirmed = false;
    accuracy = accuracy || 0;
    damage = damage || 0;
    overwhelming = overwhelming || 0;
    let soak = 0;
    let defense = 0;
    let characterInitiative = 0;
    let combat = game.combat;
    if (combat) {
        let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == actor.id);
        if (combatant && combatant.initiative) {
            if (attackType !== 'withering') {
                damage = combatant.initiative;
            }
            characterInitiative = combatant.initiative;
        }
    }
    let target = Array.from(game.user.targets)[0] || null;
    if (target) {
        if (target.actor.data.data.parry.value >= target.actor.data.data.evasion.value) {
            defense = target.actor.data.data.parry.value;
        }
        else {
            defense = target.actor.data.data.evasion.value;
        }
        if (target.actor.data.data.warstrider.equipped) {
            soak = target.actor.data.data.warstrider.soak.value;
        }
        else {
            soak = target.actor.data.data.soak.value;
        }
    }
    const template = "systems/exaltedthird/templates/dialogues/attack-roll.html";
    const html = await renderTemplate(template, { 'character-type': characterType, "attribute": attribute, "ability": ability, "stunt": characterType === "npc" ? "none" : "one" , "accuracy": accuracy, "damage": damage, 'defense': defense, 'overwhelming': overwhelming, 'soak': soak, 'attackType': attackType });
    await new Promise((resolve, reject) => {
        // @ts-ignore
        return new diceDialog({
            title: target ? `Attacking: ${target.name}` : `Attack`,
            content: html,
            buttons: {
                roll: { label: "Attack!", callback: () => confirmed = true },
                cancel: { label: "Cancel", callback: () => confirmed = false }
            },
            close: html => {
                if (confirmed) {
                    // Accuracy
                    var rollResults = _baseAbilityDieRoll(html, actor, characterType, 'attack');
                    let defense = parseInt(html.find('#defense').val()) || 0;
                    let thereshholdSuccesses = rollResults.total - defense;
                    let damageResults = ``;

                    if (thereshholdSuccesses < 0) {
                        damageResults = `<h4 class="dice-total">Attack Missed!</h4>`;
                        if (attackType !== 'withering') {
                            if (characterInitiative < 11) {
                                characterInitiative = characterInitiative - 2;
                            }
                            else {
                                characterInitiative = characterInitiative - 3;
                            }
                        }
                    }
                    else {
                        let damage = parseInt(html.find('#damage').val()) || 0;
                        let diceModifier = parseInt(html.find('#dice-modifier').val()) || 0;
                        let successModifier = parseInt(html.find('#damage-successes').val()) || 0;
                        let doubleSuccess = parseInt(html.find('#damage-double-success').val()) || 11;
                        let targetNumber = parseInt(html.find('#damage-target-number').val()) || 7;

                        let dice = damage + diceModifier;
                        let baseDamage = dice;

                        if (attackType === 'decisive') {
                            if (target && game.combat) {
                                let targetCombatant = game.combat.data.combatants.find(c => c?.actor?.data?._id == target.actor.id);
                                if (targetCombatant.actor.data.type === 'npc' || targetCombatant.actor.data.data.battlegroup) {
                                    dice += Math.floor(dice / 4);
                                    baseDamage = dice;
                                }
                            }
                        }
                        else {
                            dice += thereshholdSuccesses;
                            baseDamage = dice;
                            soak = parseInt(html.find('#soak').val()) || 0;
                            overwhelming = parseInt(html.find('#overwhelming').val()) || 0;
                            let postSoakDamage = parseInt(html.find('#postSoakDamage').val()) || 0;

                            dice -= soak;
                            if (dice < overwhelming) {
                                dice = Math.max(dice, overwhelming);
                            }
                            if (dice < 0) {
                                dice = 0;
                            }
                            dice += postSoakDamage;
                        }

                        let rerollString = '';
                        let rerolls = [];

                        for (let i = 1; i <= 10; i++) {
                            if (html.find(`#damage-reroll-${i}`).is(':checked')) {
                                rerollString += `x${i}`;
                                rerolls.push(i);
                            }
                        }
                        let roll = new Roll(`${dice}d10${rerollString}cs>=${targetNumber}`).evaluate({ async: false });
                        let diceRoll = roll.dice[0].results;
                        let getDice = "";
                        let soakResult = ``;
                        let bonus = 0;

                        for (let dice of diceRoll) {
                            if (dice.result >= doubleSuccess && (actor.data.type !== 'npc' || actor.data.data.battlegroup === false)) {
                                bonus++;
                                getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
                            }
                            else if (dice.result >= 7) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
                            else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
                            else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
                        }

                        let total = roll.total;
                        if (bonus && (actor.data.type !== 'npc' || actor.data.data.battlegroup === false)) {
                            total += bonus;
                        }
                        if (successModifier) total += successModifier;

                        let typeSpecificResults = ``;

                        if (attackType === 'decisive') {
                            typeSpecificResults = `<h4 class="dice-total">${total} Damage!</h4>`;
                            characterInitiative = 3;
                        }
                        else if (attackType === 'gambit') {
                            let gambitDifficulty = parseInt(html.find('#gambit-difficulty').val()) || 0;
                            if (characterInitiative > 0 && (characterInitiative - gambitDifficulty - 1 <= 0)) {
                                characterInitiative -= 5;
                            }
                            characterInitiative = characterInitiative - gambitDifficulty - 1;
                            var resultsText = `<h4 class="dice-total">Gambit Success</h4>`;
                            if (gambitDifficulty > total) {
                                resultsText = `<h4 class="dice-total">Gambit Failed</h4>`
                            }
                            typeSpecificResults = `<h4 class="dice-formula">${total} Successes vs ${gambitDifficulty} Difficulty!</h4>${resultsText}`;

                        }
                        else {
                            let targetResults = ``;
                            if (target && game.combat) {
                                let targetCombatant = game.combat.data.combatants.find(c => c?.actor?.data?._id == target.actor.id);
                                if (targetCombatant && targetCombatant.initiative !== null) {
                                    characterInitiative++;
                                    if (targetCombatant.actor.data.type !== 'npc' || targetCombatant.actor.data.data.battlegroup === false) {
                                        let newInitative = targetCombatant.initiative;
                                        newInitative -= total;
                                        characterInitiative += total;
                                        if (newInitative <= 0 && targetCombatant.initiative > 0) {
                                            characterInitiative += 5;
                                            targetResults = `<h4 class="dice-total">Target Crashed!</h4>`;
                                        }
                                        game.combat.setInitiative(targetCombatant.id, newInitative);
                                    }
                                }
                            }
                            soakResult = `<h4 class="dice-formula">${soak} Soak!</h4><h4 class="dice-formula">${overwhelming} Overwhelming!</h4>`;
                            typeSpecificResults = `
                            <h4 class="dice-formula">${total} Damage!</h4>
                            <h4 class="dice-total">${total} Total Damage!</h4>
                            ${targetResults}
                            `;

                        }
                        damageResults = `
                        <h4 class="dice-total">${attackType === 'gambit' ? 'Gambit' : 'Damage'}</h4>
                        <h4 class="dice-formula">${baseDamage} Dice + ${successModifier} successes</h4>
                        ${soakResult}
                        <div class="dice-tooltip">
                                            <div class="dice">
                                                <ol class="dice-rolls">${getDice}</ol>
                                            </div>
                                        </div>${typeSpecificResults}`;
                    }
                    var title = "Decisive Attack";
                    if (attackType === 'withering') {
                        title = "Withering Attack";
                    }
                    if (attackType === 'gambit') {
                        title = "Gambit";
                    }
                    var messageContent = `
              <div class="chat-card">
                  <div class="card-content">${title}</div>
                  <div class="card-buttons">
                      <div class="flexrow 1">
                          <div>
                              <div class="dice-roll">
                                  <div class="dice-result">
                                      <h4 class="dice-formula">${rollResults.dice} Dice + ${rollResults.bonusSuccesses} successes</h4>
                                      <div class="dice-tooltip">
                                          <div class="dice">
                                              <ol class="dice-rolls">${rollResults.getDice}</ol>
                                          </div>
                                      </div>
                                      <h4 class="dice-formula">${rollResults.total} Succeses - ${defense} Defense</h4>
                                      ${damageResults}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            `;
                    ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });

                    if (actor.data.type !== 'npc' || actor.data.data.battlegroup === false) {
                        let combat = game.combat;
                        if (target && combat) {
                            let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == actor.id);
                            if (combatant && combatant.initiative != null) {
                                combat.setInitiative(combatant.id, characterInitiative);
                            }
                        }
                    }
                    if (target && game.settings.get("exaltedthird", "calculateOnslaught")) {
                        const onslaught = target.actor.effects.find(i => i.data.label == "Onslaught");
                        if (onslaught) {
                            let changes = duplicate(onslaught.data.changes);
                            if (target.actor.data.data.evasion.value > 0) {
                                changes[0].value = changes[0].value - 1;
                            }
                            if (target.actor.data.data.parry.value > 0) {
                                changes[1].value = changes[1].value - 1;
                            }
                            onslaught.update({ changes });
                        }
                        else {
                            target.actor.createEmbeddedDocuments('ActiveEffect', [{
                                label: 'Onslaught',
                                icon: 'icons/svg/aura.svg',
                                origin: target.actor.uuid,
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
            }
        }).render(true);
    });
}
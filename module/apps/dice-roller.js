export class RollForm extends FormApplication {
    constructor(actor, options, object, data) {
        super(object, options);
        this.actor = actor;
        this.object.successModifier = 0;
        this.object.target = Array.from(game.user.targets)[0] || null;
        this.object.rollType = data.rollType;
        this.object.showPool = !this._isAttackRoll();
        this.object.showWithering = data.rollType === 'withering' || data.rollType === 'damage';
        this.object.hasDifficulty = data.rollType === 'ability' || data.rollType === 'readIntentions' || data.rollType === 'social' || data.rollType === 'craft';
        this.object.stunt = "none";
        this.object.goalNumber = 0;
        this.object.woundPenalty = true;
        this.object.intervals = 0;
        this.object.difficulty = data.difficulty || 0;
        this.object.isMagic = data.isMagic || false;
        this.object.diceModifier = 0;

        if (data.rollType === 'base') {
            this.object.dice = data.dice || 0;
            this.object.woundPenalty = false;
        }
        else {
            this.object.characterType = this.actor.data.type;
            this.object.conditions = this.actor.token.data.actorData.effects;
            if (this.actor.data.type === 'character') {
                this.object.stunt = "one";
                this.object.attribute = data.attribute || this._getHighestAttribute();
                this.object.ability = data.ability || "archery";
                this.object.appearance = this.actor.data.data.attributes.appearance.value;
            }

            if (this.actor.data.type === "npc") {
                if (this.object.rollType === 'action') {
                    this.object.actionRoll = true;
                    this.object.actionId = data.actionId;
                    this.object.actions = this.actor.actions;
                }
                else {
                    this.object.pool = data.pool || "administration";
                }
                this.object.appearance = this.actor.data.data.appearance.value;
            }
            if (this.object.rollType === 'social' || this.object.rollType === 'readIntentions') {
                let target = Array.from(game.user.targets)[0] || null;
                if (target) {
                    if (this.object.rollType === 'readIntentions') {
                        this.object.difficulty = target.actor.data.data.guile.value;
                    }
                    if (this.object.rollType === 'social') {
                        this.object.difficulty = target.actor.data.data.resolve.value;
                    }
                }
            }
            this.object.difficultyString = 'Ex3.Difficulty';
            if (this.object.rollType === 'readIntentions') {
                this.object.difficultyString = 'Ex3.Guile';
            }
            if (this.object.rollType === 'social') {
                this.object.difficultyString = 'Ex3.Resolve';
            }

            if (this.object.rollType === 'craft') {
                this.object.intervals = 1;
                this.object.finished = false;
                this.object.objectivesCompleted = 0;
                this.object.craftType = data.craftType;
                this.object.craftRating = data.craftRating;


                if (data.craftType === 'superior') {
                    this.object.intervals = 6;
                    this.object.difficulty = 5;
                    if (this.object.craftRating === 2) {
                        this.object.goalNumber = 30;
                    }
                    if (this.object.craftRating === 3) {
                        this.object.goalNumber = 50;
                    }
                    if (this.object.craftRating === 4) {
                        this.object.goalNumber = 75;
                    }
                    if (this.object.craftRating === 5) {
                        this.object.goalNumber = 100;
                    }
                }
                else if (data.craftType === 'legendary') {
                    this.object.intervals = 6;
                    this.object.difficulty = 5;
                    this.object.goalNumber = 200;
                }
            }

            this.object.accuracy = data.accuracy || 0;
            if(this._isAttackRoll()) {
                if (this.object.conditions.some(e => e.name === 'prone')) {
                    this.object.diceModifier -= 3;
                }
                if (this.object.conditions.some(e => e.name === 'grappled')) {
                    this.object.diceModifier -= 1;
                }
            }
            this.object.overwhelming = data.overwhelming || 0;
            this.object.soak = 0;
            this.object.defense = 0;
            this.object.characterInitiative = 0;
            this.object.gambitDifficulty = 0;
            this.object.range = 'close';

            this.object.damage = {
                damageDice: data.damage || 0,
                damageSuccessModifier: data.damageSuccessModifier || 0,
                doubleSuccess: data.doubleSuccess || (this.object.rollType === 'decisive' ? 11 : 10),
                targetNumber: data.targetNumber || 7,
                postSoakDamage: 0,
                reroll: {
                    one: { status: false, number: 1 },
                    two: { status: false, number: 2 },
                    three: { status: false, number: 3 },
                    four: { status: false, number: 4 },
                    five: { status: false, number: 5 },
                    six: { status: false, number: 6 },
                    seven: { status: false, number: 7 },
                    eight: { status: false, number: 8 },
                    nine: { status: false, number: 9 },
                    ten: { status: false, number: 10 },
                }
            };


            let combat = game.combat;
            if (combat) {
                let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == actor.id);
                if (combatant && combatant.initiative) {
                    if (this.object.rollType !== 'withering') {
                        this.object.damage.damageDice = combatant.initiative;
                    }
                    this.object.characterInitiative = combatant.initiative;
                }
            }
            var target = Array.from(game.user.targets)[0] || null;
            if (target) {
                // this.actor.token.data.actorData.effects
                if (target.actor.data.data.parry.value >= target.actor.data.data.evasion.value) {
                    this.object.defense = target.actor.data.data.parry.value;
                    if (target.data.actorData.effects.some(e => e.name === 'prone')) {
                        this.object.defense -= 1;
                    }
                }
                else {
                    this.object.defense = target.actor.data.data.evasion.value;
                    if (target.data.actorData.effects.some(e => e.name === 'prone')) {
                        this.object.defense -= 2;
                    }
                }
                if (target.actor.data.data.warstrider.equipped) {
                    this.object.soak = target.actor.data.data.warstrider.soak.value;
                }
                else {
                    this.object.soak = target.actor.data.data.soak.value;
                }
                if (target.data.actorData.effects.some(e => e.name === 'lightcover')) {
                    this.object.defense += 1;
                }
                if (target.data.actorData.effects.some(e => e.name === 'heavycover')) {
                    this.object.defense += 2;
                }
                if (target.data.actorData.effects.some(e => e.name === 'grappled') || target.data.actorData.effects.some(e => e.name === 'grappling')) {
                    this.object.defense -= 2;
                }
            }
        }

        this.object.weaponType = data.weaponType || 'melee';
        this.object.attackType = data.attackType || 'withering';

        this.object.isFlurry = false;
        this.object.armorPenalty = false;
        this.object.hasSpecialty = false;
        this.object.willpower = false;

        this.object.doubleSuccess = 10;
        this.object.rerollFailed = false;
        this.object.targetNumber = 7;
        this.object.rerollNumber = 0;

        this.object.reroll = {
            one: { status: false, number: 1 },
            two: { status: false, number: 2 },
            three: { status: false, number: 3 },
            four: { status: false, number: 4 },
            five: { status: false, number: 5 },
            six: { status: false, number: 6 },
            seven: { status: false, number: 7 },
            eight: { status: false, number: 8 },
            nine: { status: false, number: 9 },
            ten: { status: false, number: 10 },
        }
    }

    /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
    get template() {
        var template = "systems/exaltedthird/templates/dialogues/ability-roll.html";
        if (this.object.rollType === 'base') {
            template = "systems/exaltedthird/templates/dialogues/dice-roll.html";
        }
        // else if(this.object.rollType === 'accuracy') {
        //     template = "systems/exaltedthird/templates/dialogues/accuracy-roll.html";
        // }
        // else if(this.object.rollType === 'damage') {
        //     template = "systems/exaltedthird/templates/dialogues/damage-roll.html";
        // }
        else if (this.object.rollType === 'craft') {
            template = "systems/exaltedthird/templates/dialogues/craft-roll.html";
        }
        else if (this._isAttackRoll()) {
            template = "systems/exaltedthird/templates/dialogues/attack-roll.html";
        }
        else if (this.object.rollType === 'craft') {
            template = "systems/exaltedthird/templates/dialogues/craft-roll.html";
        }


        return template;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["dialog"],
            popOut: true,
            template: "systems/exaltedthird/templates/dialogues/dice-roll.html",
            id: "roll-form",
            title: `Roll`,
            width: 350,
            submitOnChange: true,
            closeOnSubmit: false
        });
    }

    getData() {
        return {
            actor: this.actor,
            data: this.object,
        };
    }

    async _updateObject(event, formData) {
        mergeObject(this, formData);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('#roll-button').click((event) => {
            this._roll();
            if (this.object.intervals <= 0) {
                this.close();
            }
        });

        html.find('#cancel').click((event) => {
            this.close();
        });

        html.find('.collapsable').click(ev => {
            const li = $(ev.currentTarget).next();
            li.toggle("fast");
        });
    }

    _roll() {
        if (this._isAttackRoll()) {
            this._attackRoll();
        }
        else if (this.object.rollType === 'base') {
            this._diceRoll();
        }
        else if (this.object.rollType === 'craft') {
            this._completeCraftProject();
        }
        else {
            this._abilityRoll();
        }
    }

    _baseAbilityDieRoll() {
        let dice = 0;

        if (this.object.rollType === 'base') {
            dice = this.object.dice;
        }
        else {
            const data = this.actor.data.data;
            const actorData = duplicate(this.actor);
            if (this.actor.data.type === 'character') {
                let attributeDice = data.attributes[this.object.attribute].value;
                let abilityDice = data.abilities[this.object.ability].value;
                dice = attributeDice + abilityDice;
            }
            else if (this.actor.data.type === 'npc' && !this._isAttackRoll()) {
                if (this.object.rollType === 'action') {
                    dice = this.actor.actions.find(x => x._id === this.object.actionId).data.value;
                }
                else {
                    let poolDice = data.pools[this.object.pool].value;
                    dice = poolDice;
                }
            }

            if (this.object.armorPenalty) {
                for (let armor of actor.armor) {
                    if (armor.data.equiped) {
                        dice = dice - Math.abs(armor.data.penalty);
                    }
                }
            }
            if (this.object.stunt !== 'none') {
                dice += 2;
            }
            if (this.object.stunt === 'two') {
                actorData.data.willpower.value++;
                this.object.successModifier++;
            }
            if (this.object.stunt === 'three') {
                actorData.data.willpower.value += 2;
                this.object.successModifier += 2;
            }
            if (this.object.woundPenalty && data.health.penalty !== 'inc') {
                if (data.warstrider.equipped) {
                    dice -= data.warstrider.health.penalty;
                }
                else {
                    dice -= data.health.penalty;
                }
            }
            if (this.object.isFlurry) {
                dice -= 3;
            }
            if (this.object.diceModifier) {
                dice += this.object.diceModifier;
            }
            if (this.object.hasSpecialty) {
                dice++;
            }
            if (this.object.willpower) {
                this.object.successModifier++;
                actorData.data.willpower.value--;
            }

            this.actor.update(actorData);
        }

        if (this._isAttackRoll()) {
            dice += this.object.accuracy || 0;
            if (this.object.weaponType !== 'melee' && (this.actor.data.type === 'npc' || this.object.rollType === 'withering')) {
                if (this.object.range !== 'short') {
                    dice += this._getRangedAccuracy();
                }
            }
        }

        let rerollString = '';
        let rerolls = [];

        for (var rerollValue in this.object.reroll) {
            if (this.object.reroll[rerollValue].status) {
                rerollString += `x${this.object.reroll[rerollValue].number}`;
                rerolls.push(this.object.reroll[rerollValue].number);
            }
        }

        let roll = new Roll(`${dice}d10${rerollString}${this.object.rerollFailed ? "r<7" : ""}cs>=${this.object.targetNumber}`).evaluate({ async: false });
        let diceRoll = roll.dice[0].results;
        let getDice = "";
        let bonus = 0;
        let total = 0;
        let rerolledDice = 0;
        var failedDice = Math.min(dice - roll.total, this.object.rerollNumber);

        while (failedDice != 0 && (rerolledDice < this.object.rerollNumber)) {
            rerolledDice += failedDice;
            var failedDiceRoll = new Roll(`${failedDice}d10cs>=${this.object.targetNumber}`).evaluate({ async: false });
            failedDice = Math.min(failedDice - failedDiceRoll.total, (this.object.rerollNumber - rerolledDice));
            diceRoll = diceRoll.concat(failedDiceRoll.dice[0].results);
            total += failedDiceRoll.total;
        }

        for (let dice of diceRoll) {
            if (dice.result >= this.object.doubleSuccess) {
                bonus++;
                getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= this.object.targetNumber) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
        }

        total += roll.total;
        if (bonus) total += bonus;
        total += this.object.successModifier;

        this.object.dice = dice;
        this.object.roll = roll;
        this.object.getDice = getDice;
        this.object.total = total;
    }

    _diceRoll() {
        this._baseAbilityDieRoll();
        let messageContent = `<div class="chat-card">
                        <div class="card-content">Dice Roll</div>
                        <div class="card-buttons">
                            <div class="flexrow 1">
                                <div>Dice Roller - Number of Successes<div class="dice-roll">
                                        <div class="dice-result">
                                            <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                                            <div class="dice-tooltip">
                                                <div class="dice">
                                                    <ol class="dice-rolls">${this.object.getDice}</ol>
                                                </div>
                                            </div>
                                            <h4 class="dice-total">${this.object.total} Succeses</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        ChatMessage.create({ user: game.user.id, speaker: this.actor != null ? ChatMessage.getSpeaker({ actor: this.actor }) : null, content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
    }

    _abilityRoll() {
        if (this.actor.data.type === "npc") {
            this.object.stunt = 'none';
            if (this.object.ability === "archery") {
                this.object.ability = "primary";
            }
        }
        if (this.object.attribute == null) {
            this.object.attribute = this.actor.data.type === "npc" ? null : this._getHighestAttribute();
        }
        if (this.object.rollType === 'social' || this.object.rollType === 'readIntentions') {
            let target = Array.from(game.user.targets)[0] || null;
            if (target) {
                if (this.object.rollType === 'readIntentions') {
                    this.object.difficulty = target.actor.data.data.guile.value;
                }
                if (this.object.rollType === 'social') {
                    this.object.difficulty = target.actor.data.data.resolve.value;
                }
            }
        }

        let goalNumberLeft = 0;
        this._baseAbilityDieRoll();
        let resultString = ``;

        if (this.object.rollType === "joinBattle") {
            resultString = `<h4 class="dice-total">${this.object.total + 3} Initiative</h4>`;
        }
        if (this.object.hasDifficulty) {
            let extendedTest = ``;
            const threshholdSucceses = this.object.total - this.object.difficulty;
            goalNumberLeft = Math.max(this.object.goalNumber - threshholdSucceses - 1, 0);
            if (this.object.goalNumber > 0) {
                extendedTest = `<h4 class="dice-total">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
            }
            if (this.object.total < this.object.difficulty) {
                resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Check Failed</h4>${extendedTest}`;
                for (let dice of this.object.roll.dice[0].results) {
                    if (dice.result === 1 && this.object.total === 0) {
                        resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Botch</h4>${extendedTest}`;
                    }
                }
            }
            else {
                resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">${threshholdSucceses} Threshhold Succeses</h4>${extendedTest}`;
            }
            this.object.goalNumber = Math.max(this.object.goalNumber - threshholdSucceses - 1, 0);
        }
        let theContent = `
  <div class="chat-card">
      <div class="card-content">Dice Roll</div>
      <div class="card-buttons">
          <div class="flexrow 1">
              <div>Dice Roller - Number of Successes<div class="dice-roll">
                      <div class="dice-result">
                          <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                          <div class="dice-tooltip">
                              <div class="dice">
                                  <ol class="dice-rolls">${this.object.getDice}</ol>
                              </div>
                          </div>
                          <h4 class="dice-total">${this.object.total} Succeses</h4>
                          ${resultString}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  `
        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: theContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
        if (this.object.rollType === "joinBattle") {
            let combat = game.combat;
            if (combat) {
                let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.actor.id);
                if (combatant) {
                    combat.setInitiative(combatant.id, this.object.total + 3);
                }
            }
        }
        if (this.object.rollType === "sorcery") {
            const actorData = duplicate(this.actor);
            actorData.data.sorcery.motes += this.object.total;
            this.actor.update(actorData);
        }
    }

    _attackRoll() {
        // Accuracy
        if (this.object.rollType !== 'damage') {
            this._accuracyRoll();
        }
        else {
            this.object.thereshholdSuccesses = 0;
        }
        if ((this.object.thereshholdSuccesses >= 0 && this.object.rollType !== 'accuracy') || this.object.rollType === 'damage') {
            this._damageRoll();
        }
    }

    _accuracyRoll() {
        this._baseAbilityDieRoll();
        this.object.thereshholdSuccesses = this.object.total - this.object.defense;
        let damageResults = ``;

        if (this.object.thereshholdSuccesses < 0) {
            damageResults = `<h4 class="dice-total">Attack Missed!</h4>`;
            if (this.object.rollType !== 'withering') {
                if (this.object.characterInitiative < 11) {
                    this.object.characterInitiative = this.object.characterInitiative - 2;
                }
                else {
                    this.object.characterInitiative = this.object.characterInitiative - 3;
                }
            }
        }
    }

    _damageRoll() {
        let baseDamage = this.object.damage.damageDice;
        let dice = this.object.damage.damageDice;
        var damageResults = ``;

        if (this.object.rollType === 'decisive') {
            if (this.object.target && game.combat) {
                let targetCombatant = game.combat.data.combatants.find(c => c?.actor?.data?._id == this.object.target.actor.id);
                if (targetCombatant.actor.data.type === 'npc' || targetCombatant.actor.data.data.battlegroup) {
                    dice += Math.floor(dice / 4);
                    baseDamage = dice;
                }
            }
        }
        else if (this.object.rollType === 'withering') {
            dice += this.object.thereshholdSuccesses;
            baseDamage = dice;

            dice -= this.object.soak;
            if (dice < this.object.overwhelming) {
                dice = Math.max(dice, this.object.overwhelming);
            }
            if (dice < 0) {
                dice = 0;
            }
            dice += this.object.damage.postSoakDamage;
        }

        let rerollString = '';
        let rerolls = [];

        for (var rerollValue in this.object.damage.reroll) {
            if (this.object.damage.reroll[rerollValue].status) {
                rerollString += `x${this.object.damage.reroll[rerollValue].number}`;
                rerolls.push(this.object.damage.reroll[rerollValue].number);
            }
        }

        let roll = new Roll(`${dice}d10${rerollString}cs>=${this.object.damage.targetNumber}`).evaluate({ async: false });
        let diceRoll = roll.dice[0].results;
        let getDice = "";
        let soakResult = ``;
        let bonus = 0;
        this.object.finalDamageDice = dice;

        for (let dice of diceRoll) {
            if (dice.result >= this.object.damage.doubleSuccess && (this.actor.data.type !== 'npc' || this.actor.data.data.battlegroup === false)) {
                bonus++;
                getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= 7) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
        }

        let total = roll.total;
        if (bonus && (this.actor.data.type !== 'npc' || this.actor.data.data.battlegroup === false)) {
            total += bonus;
        }
        total += this.object.damage.damageSuccessModifier;

        let typeSpecificResults = ``;

        if (this.object.rollType === 'decisive') {
            typeSpecificResults = `<h4 class="dice-total">${total} Damage!</h4>`;
            this.object.characterInitiative = 3;
            if (this._useLegendarySize('decisive')) {
                typeSpecificResults = typeSpecificResults + `<h4 class="dice-formula">Legendary Size</h4><h4 class="dice-formula">Damage capped at ${3 + this.actor.data.data.attributes.strength.value} + Charm damage levels</h4>`
            }
        }
        else if (this.object.rollType === 'gambit') {
            if (this.object.characterInitiative > 0 && (this.object.characterInitiative - this.object.gambitDifficulty - 1 <= 0)) {
                this.object.characterInitiative -= 5;
            }
            this.object.characterInitiative = this.object.characterInitiative - this.object.gambitDifficulty - 1;
            var resultsText = `<h4 class="dice-total">Gambit Success</h4>`;
            if (this.object.gambitDifficulty > total) {
                resultsText = `<h4 class="dice-total">Gambit Failed</h4>`
            }
            typeSpecificResults = `<h4 class="dice-formula">${total} Successes vs ${this.object.gambitDifficulty} Difficulty!</h4>${resultsText}`;

        }
        else {
            let targetResults = ``;
            if (this.object.target && game.combat) {
                let targetCombatant = game.combat.data.combatants.find(c => c?.actor?.data?._id == this.object.target.actor.id);
                if (targetCombatant && targetCombatant.initiative !== null) {
                    this.object.characterInitiative++;
                    if (targetCombatant.actor.data.type !== 'npc' || targetCombatant.actor.data.data.battlegroup === false) {
                        let newInitative = targetCombatant.initiative;
                        newInitative -= total;
                        this.object.characterInitiative += total;
                        if ((newInitative <= 0 && targetCombatant.initiative > 0)) {
                            if (this._useLegendarySize('withering')) {
                                newInitative = 1;
                            }
                            else {
                                this.object.characterInitiative += 5;
                                targetResults = `<h4 class="dice-total">Target Crashed!</h4>`;
                            }
                        }
                        game.combat.setInitiative(targetCombatant.id, newInitative);
                    }
                }
            }
            soakResult = `<h4 class="dice-formula">${this.object.soak} Soak!</h4><h4 class="dice-formula">${this.object.overwhelming} Overwhelming!</h4>`;
            typeSpecificResults = `
                                    <h4 class="dice-formula">${total} Damage!</h4>
                                    <h4 class="dice-total">${total} Total Damage!</h4>
                                    ${targetResults}
                                    `;

        }
        damageResults = `
                                <h4 class="dice-total">${this.object.rollType === 'gambit' ? 'Gambit' : 'Damage'}</h4>
                                <h4 class="dice-formula">${baseDamage} Dice + ${this.object.damage.damageSuccessModifier} successes</h4>
                                ${soakResult}
                                <div class="dice-tooltip">
                                                    <div class="dice">
                                                        <ol class="dice-rolls">${getDice}</ol>
                                                    </div>
                                                </div>${typeSpecificResults}`;

        var title = "Decisive Attack";
        if (this.object.rollType === 'withering') {
            title = "Withering Attack";
        }
        if (this.object.rollType === 'gambit') {
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
                                              <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                                              <div class="dice-tooltip">
                                                  <div class="dice">
                                                      <ol class="dice-rolls">${this.object.getDice}</ol>
                                                  </div>
                                              </div>
                                              <h4 class="dice-formula">${this.object.total} Succeses vs ${this.object.defense} Defense</h4>
                                              <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Succeses</h4>
                                              ${damageResults}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                    `;
        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });

        if (this.actor.data.type !== 'npc' || this.actor.data.data.battlegroup === false) {
            let combat = game.combat;
            if (this.object.target && combat) {
                let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.actor.id);
                if (combatant && combatant.initiative != null) {
                    combat.setInitiative(combatant.id, this.object.characterInitiative);
                }
            }
        }
        if (this.object.target && game.settings.get("exaltedthird", "calculateOnslaught")) {
            if (this._useLegendarySize('onslaught')) {
                const onslaught = this.object.target.actor.effects.find(i => i.data.label == "Onslaught");
                if (onslaught) {
                    let changes = duplicate(onslaught.data.changes);
                    if (this.object.target.actor.data.data.evasion.value > 0) {
                        changes[0].value = changes[0].value - 1;
                    }
                    if (this.object.target.actor.data.data.parry.value > 0) {
                        changes[1].value = changes[1].value - 1;
                    }
                    onslaught.update({ changes });
                }
                else {
                    this.object.target.actor.createEmbeddedDocuments('ActiveEffect', [{
                        label: 'Onslaught',
                        icon: 'icons/svg/aura.svg',
                        origin: this.object.target.actor.uuid,
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

    _completeCraftProject() {
        this._baseAbilityDieRoll();
        let resultString = ``;
        let projectStatus = ``;
        let craftFailed = false;
        let craftSuccess = false;
        let goalNumberLeft = this.object.goalNumber;
        let extendedTest = ``;
        const threshholdSucceses = this.object.total - this.object.difficulty;
        if (this.object.goalNumber > 0) {
            extendedTest = `<h4 class="dice-total">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
        }
        if (this.object.total < this.object.difficulty) {
            resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Check Failed</h4>${extendedTest}`;
            if (this.object.intervals === 1) {
                craftFailed = true;
            }
            for (let dice of this.object.roll.dice[0].results) {
                if (dice.result === 1 && this.object.total === 0) {
                    finished = true;
                    resultString = `<h4 class="dice-total">Difficulty: ${difficulty}</h4><h4 class="dice-total">Botch</h4>`;
                    craftFailed = true;
                }
            }
        }
        else {
            if (this.object.goalNumber > 0) {
                goalNumberLeft = Math.max(this.object.goalNumber - threshholdSucceses - 1, 0);
                extendedTest = `<h4 class="dice-total">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
                if (goalNumberLeft > 0 && this.object.intervals === 1) {
                    craftFailed = true;
                }
                else if (goalNumberLeft === 0) {
                    craftSuccess = true;
                }
            }
            else {
                craftSuccess = true;
            }
            resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">${threshholdSucceses} Threshhold Succeses</h4>${extendedTest}`;
        }

        if (craftFailed) {
            projectStatus = `<h4 class="dice-total">Craft Project Failed</h4>`;
        }
        if (craftSuccess) {
            const actorData = duplicate(this.actor);
            var silverXPGained = 0;
            var goldXPGained = 0;
            var whiteXPGained = 0;
            if (this.object.craftType === 'basic') {
                if (threshholdSucceses >= 3) {
                    silverXPGained = 3 * this.object.objectivesCompleted;
                }
                else {
                    silverXPGained = 2 * this.object.objectivesCompleted;
                }
                projectStatus = `<h4 class="dice-total">Craft Project Success</h4><h4 class="dice-total">${silverXPGained} Silver XP Gained</h4>`;
            }
            else if (this.object.craftType === "major") {
                if (threshholdSucceses >= 3) {
                    silverXPGained = this.object.objectivesCompleted;
                    goldXPGained = 3 * this.object.objectivesCompleted;
                }
                else {
                    silverXPGained = this.object.objectivesCompleted;
                    goldXPGained = 2 * this.object.objectivesCompleted;
                }
                projectStatus = `<h4 class="dice-total">Craft Project Success</h4><h4 class="dice-total">${silverXPGained} Silver XP Gained</h4><h4 class="dice-total">${goldXPGained} Gold XP Gained</h4>`;
            }
            else if (this.object.craftType === "superior") {
                if (this.object.objectivesCompleted > 0) {
                    whiteXPGained = (this.object.craftRating - 1) + this.object.craftRating;
                    goldXPGained = (this.object.craftRating * 2) * this.object.intervals;
                }
                projectStatus = `<h4 class="dice-total">Craft Project Success</h4><h4 class="dice-total">${goldXPGained} Gold XP Gained</h4><h4 class="dice-total">${whiteXPGained} White XP Gained</h4>`;
            }
            else if (this.object.craftType === "legendary") {
                if (this.object.objectivesCompleted > 0) {
                    whiteXPGained = 10;
                }
                projectStatus = `<h4 class="dice-total">Craft Project Success</h4><h4 class="dice-total">${whiteXPGained} White XP Gained</h4>`;
            }
            else {
                projectStatus = `<h4 class="dice-total">Craft Project Success</h4>`;
            }
            actorData.data.craft.experience.silver.value += silverXPGained;
            actorData.data.craft.experience.gold.value += goldXPGained;
            actorData.data.craft.experience.white.value += whiteXPGained;
            this.actor.update(actorData);
        }

        let messageContent = `
<div class="chat-card">
    <div class="card-content">Dice Roll</div>
    <div class="card-buttons">
        <div class="flexrow 1">
            <div>Dice Roller - Number of Successes<div class="dice-roll">
                    <div class="dice-result">
                        <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.bonusSuccesses} successes</h4>
                        <div class="dice-tooltip">
                            <div class="dice">
                                <ol class="dice-rolls">${this.object.getDice}</ol>
                            </div>
                        </div>
                        <h4 class="dice-total">${this.object.total} Succeses</h4>
                        ${resultString}
                        ${projectStatus}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`
        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
        this.object.goalNumber = goalNumberLeft;
        this.object.intervals--;
        if (this.object.intervals > 0) {
            this.render();
        }
    }

    _isAttackRoll() {
        return this.object.rollType === 'withering' || this.object.rollType === 'decisive' || this.object.rollType === 'gambit' || this.object.rollType === 'accuracy' || this.object.rollType === 'damage';
    }

    _getRangedAccuracy() {
        var ranges = {
            "bolt-close": 1,
            "bolt-medium": -1,
            "bolt-long": -4,
            "bolt-extreme": -6,

            "ranged-close": -6,
            "ranged-medium": -2,
            "ranged-long": -4,
            "ranged-extreme": -6,

            "thrown-close": 1,
            "thrown-medium": -1,
            "thrown-long": -4,
            "thrown-extreme": -6,

            "siege-close": -2,
            "siege-medium": 7,
            "siege-long": 5,
            "siege-extreme": 3,
        };

        var key = `${this.object.weaponType}-${this.object.range}`;
        var accuracyModifier = ranges[key];
        return accuracyModifier;
    }

    _useLegendarySize(effectType) {
        if (this.object.target) {
            if (effectType === 'onslaught') {
                return (this.object.target.actor.data.data.legendarysize && this.object.target.actor.data.data.warstrider.equipped) && !this.object.isMagic && !this.actor.data.data.legendarysize && !this.actor.data.data.warstrider.equipped;
            }
            if (effectType === 'withering') {
                return (this.object.target.actor.data.data.legendarysize || this.object.target.actor.data.data.warstrider.equipped) && !this.actor.data.data.legendarysize && !this.actor.data.data.warstrider.equipped && this.object.finalDamageDice < 10;
            }
            if (effectType === 'decisive') {
                return (this.object.target.actor.data.data.legendarysize || this.object.target.actor.data.data.warstrider.equipped) && !this.actor.data.data.legendarysize && !this.actor.data.data.warstrider.equipped;
            }
        }
        return false;
    }


    _getHighestAttribute() {
        var highestAttributeNumber = 0;
        var highestAttribute = "strength";
        for (let [name, attribute] of Object.entries(this.actor.data.data.attributes)) {
            if (attribute.value > highestAttributeNumber) {
                highestAttributeNumber = attribute.value;
                highestAttribute = name;
            }
        }
        return highestAttribute;
    }
}
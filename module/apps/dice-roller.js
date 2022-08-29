export class RollForm extends FormApplication {
    constructor(actor, options, object, data) {
        super(object, options);
        this.actor = actor;

        if (data.rollId) {
            this.object = duplicate(this.actor.data.data.savedRolls[data.rollId]);
            this.object.skipDialog = data.skipDialog || true;
            this.object.isSavedRoll = true;
        }
        else {
            this.object.isSavedRoll = false;
            this.object.skipDialog = data.skipDialog || true;
            this.object.crashed = false;
            this.object.dice = data.dice || 0;
            this.object.successModifier = data.successModifier || 0;
            this.object.rollType = data.rollType;
            this.object.craftType = data.craftType || 0;
            this.object.craftRating = data.craftRating || 0;
            this.object.attackType = 'withering';
            this.object.showPool = !this._isAttackRoll();
            this.object.showWithering = data.rollType === 'withering' || data.rollType === 'damage';
            this.object.hasDifficulty = data.rollType === 'ability' || data.rollType === 'readIntentions' || data.rollType === 'social' || data.rollType === 'craft';
            this.object.stunt = "none";
            this.object.goalNumber = 0;
            this.object.woundPenalty = this.object.rollType === 'base' ? false : true;
            this.object.intervals = 0;
            this.object.difficulty = data.difficulty || 0;
            this.object.isMagic = data.isMagic || false;
            this.object.diceModifier = 0;
            this.object.accuracy = data.accuracy || 0;

            this.object.overwhelming = data.overwhelming || 0;
            this.object.soak = 0;
            this.object.armoredSoak = 0;
            this.object.naturalSoak = 0;
            this.object.defense = 0;
            this.object.characterInitiative = 0;
            this.object.gambitDifficulty = 0;

            this.object.weaponType = data.weaponType || 'melee';
            this.object.attackType = data.attackType || 'withering';
            this.object.range = 'close';

            this.object.isFlurry = false;
            this.object.armorPenalty = false;
            this.object.willpower = false;

            this.object.supportedIntimacy = 0;
            this.object.opposedIntimacy = 0;

            this.object.doubleSuccess = 10;
            this.object.rerollFailed = false;
            this.object.targetNumber = 7;
            this.object.rerollNumber = 0;
            this.object.attackSuccesses = 0;

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

            this.object.damage = {
                damageDice: data.damage || 0,
                damageSuccessModifier: data.damageSuccessModifier || 0,
                doubleSuccess: data.doubleSuccess || ((this.object.rollType === 'decisive' || this.actor?.data?.data?.battlegroup) ? 11 : 10),
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
                },
                type: 'lethal',
            };
            if (this.object.rollType !== 'base') {
                this.object.characterType = this.actor.data.type;

                this.object.conditions = (this.actor.token && this.actor.token.data.actorData.effects) ? this.actor.token.data.actorData.effects : [];
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

                    if (this.object.craftType === 'superior') {
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
                    else if (this.object.craftType === 'legendary') {
                        this.object.intervals = 6;
                        this.object.difficulty = 5;
                        this.object.goalNumber = 200;
                    }
                }

                if (this._isAttackRoll()) {
                    if (this.object.conditions.some(e => e.name === 'prone')) {
                        this.object.diceModifier -= 3;
                    }
                    if (this.object.conditions.some(e => e.name === 'grappled')) {
                        this.object.diceModifier -= 1;
                    }
                }
            }
        }
        this.object.addingCharms = false;
        if (this.object.cost === undefined) {
            this.object.cost = {
                motes: 0,
                muteMotes: 0,
                willpower: 0,
                initiative: 0,
                anima: 0,
                healthbashing: 0,
                healthlethal: 0,
                healthaggravated: 0,
                silverxp: 0,
                goldxp: 0,
                whitexp: 0,
                aura: "",
            }
        }
        if (this.object.damage.type === undefined) {
            this.object.damage.type = 'lethal';
        }
        if (this.object.addedCharms === undefined) {
            this.object.addedCharms = [];
        }
        if (this.object.diceCap === undefined) {
            this.object.diceCap = this._getDiceCap();
        }
        if (this.object.rollType !== 'base') {
            this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.data.ability === this.object.ability);
            this.object.target = Array.from(game.user.targets)[0] || null;
            this.object.showDefenseOnDamage = game.settings.get("exaltedthird", "defenseOnDamage");

            let combat = game.combat;
            if (combat) {
                let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == actor.id);
                if (combatant && combatant.initiative) {
                    if (!this.object.showWithering) {
                        this.object.damage.damageDice = combatant.initiative;
                    }
                    this.object.characterInitiative = combatant.initiative;
                }
            }
            if (this.object.target) {
                if (this.object.rollType === 'social' || this.object.rollType === 'readIntentions') {
                    if (this.object.rollType === 'readIntentions') {
                        this.object.difficulty = this.object.target.actor.data.data.guile.value;
                    }
                    if (this.object.rollType === 'social') {
                        this.object.difficulty = this.object.target.actor.data.data.resolve.value;
                    }
                }
                if (this.object.target.actor.data.data.parry.value >= this.object.target.actor.data.data.evasion.value) {
                    this.object.defense = this.object.target.actor.data.data.parry.value;
                    if (this.object.target.data.actorData.effects && this.object.target.data.actorData.effects.some(e => e.name === 'prone')) {
                        this.object.defense -= 1;
                    }
                }
                else {
                    this.object.defense = this.object.target.actor.data.data.evasion.value;
                    if (this.object.target.data.actorData.effects && this.object.target.data.actorData.effects.some(e => e.name === 'prone')) {
                        this.object.defense -= 2;
                    }
                }
                if (this.object.target.actor.data.data.warstrider.equipped) {
                    this.object.soak = this.object.target.actor.data.data.warstrider.soak.value;
                }
                else {
                    this.object.soak = this.object.target.actor.data.data.soak.value;
                    this.object.armoredSoak = this.object.target.actor.data.data.armoredsoak.value;
                    this.object.naturalSoak = this.object.target.actor.data.data.naturalsoak.value;
                }
                if (this.object.target.data.actorData.effects) {
                    if (this.object.target.data.actorData.effects.some(e => e.name === 'lightcover')) {
                        this.object.defense += 1;
                    }
                    if (this.object.target.data.actorData.effects.some(e => e.name === 'heavycover')) {
                        this.object.defense += 2;
                    }
                    if (this.object.target.data.actorData.effects.some(e => e.name === 'grappled') || this.object.target.data.actorData.effects.some(e => e.name === 'grappling')) {
                        this.object.defense -= 2;
                    }
                }
            }
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
        else if (this._isAttackRoll()) {
            template = "systems/exaltedthird/templates/dialogues/attack-roll.html";
        }
        return template;
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        // Token Configuration
        if (this.object.rollType !== 'base') {
            const charmsButton = {
                label: game.i18n.localize('Ex3.AddCharm'),
                class: 'add-charm',
                id: "add-charm",
                icon: 'fas fa-bolt',
                onclick: (ev) => {
                    this.object.charmList = this.actor.charms;
                    for(var charmlist of Object.values(this.object.charmList)) {
                        for(const charm of charmlist.list) {
                            if(this.object.addedCharms.some((addedCharm) => addedCharm._id === charm._id)) {
                                charm.charmAdded = true;
                            }
                            else {
                                charm.charmAdded = false;
                            }
                        }
                    }
                    if(this.object.addingCharms) {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('Ex3.AddCharm')}`;
                    }
                    else {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('Ex3.Done')}`;
                    }
                    this.object.addingCharms = !this.object.addingCharms;
                    this.render();
                },
            };
            buttons = [charmsButton, ...buttons];
            const rollButton = {
                label: this.object.id ? game.i18n.localize('Ex3.Update') : game.i18n.localize('Ex3.Save'),
                class: 'roll-dice',
                icon: 'fas fa-dice-d6',
                onclick: (ev) => {
                    this._saveRoll(this.object);
                },
            };
            buttons = [rollButton, ...buttons];
        }

        return buttons;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["dialog"],
            popOut: true,
            template: "systems/exaltedthird/templates/dialogues/dice-roll.html",
            id: "roll-form",
            title: `Roll`,
            width: 350,
            resizable: true,
            submitOnChange: true,
            closeOnSubmit: false
        });
    }


    resolve = function (value) { return value };

    get resolve() {
        return this.resolve
    }

    set resolve(value) {
        this.resolve = value;
    }

    /**
     * Renders out the Roll form.
     * @returns {Promise} Returns True or False once the Roll or Cancel buttons are pressed.
     */
    async roll() {
        if (this.object.skipDialog) {
            await this._roll();
            return true;
        } else {
            var _promiseResolve;
            this.promise = new Promise(function (promiseResolve) {
                _promiseResolve = promiseResolve
            });
            this.resolve = _promiseResolve;
            this.render(true);
            return this.promise;
        }
    }

    async _saveRoll(rollData) {
        let html = await renderTemplate("systems/exaltedthird/templates/dialogues/save-roll.html", { 'name': this.object.name || 'New Roll' });
        new Dialog({
            title: "Save Roll",
            content: html,
            default: 'save',
            buttons: {
                save: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Save',
                    default: true,
                    callback: html => {
                        let results = document.getElementById('name').value;
                        let uniqueId = this.object.id || randomID(16);
                        rollData.name = results;
                        rollData.id = uniqueId;
                        rollData.target = null;

                        let updates = {
                            "data.savedRolls": {
                                [uniqueId]: rollData
                            }
                        };
                        this.actor.update(updates);
                        this.saved = true;
                        ui.notifications.notify(`Saved Roll`);
                        return;
                    },
                }
            }
        }).render(true);
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
                this.resolve(true);
                this.close();
            }
        });

        html.find('#save-button').click((event) => {
            this._saveRoll(this.object);
            if (this.object.intervals <= 0) {
                this.close();
            }
        });

        html.find('.add-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            this.object.addedCharms.push(item.data);
            for(var charmlist of Object.values(this.object.charmList)) {
                for(const charm of charmlist.list) {
                    if(this.object.addedCharms.some((addedCharm) => addedCharm._id === charm._id)) {
                        charm.charmAdded = true;
                    }
                }
            }
            if (item.data.data.keywords.toLowerCase().includes('mute')) {
                this.object.cost.muteMotes += item.data.data.cost.motes;
            }
            else {
                this.object.cost.motes += item.data.data.cost.motes;
            }
            this.object.cost.anima += item.data.data.cost.anima;
            this.object.cost.willpower += item.data.data.cost.willpower;
            this.object.cost.silverxp += item.data.data.cost.silverxp;
            this.object.cost.goldxp += item.data.data.cost.goldxp;
            this.object.cost.whitexp += item.data.data.cost.whitexp;
            this.object.cost.initiative += item.data.data.cost.initiative;

            if (item.data.data.cost.aura) {
                this.object.cost.aura = item.data.data.cost.aura;
            }

            if (item.data.data.cost.health > 0) {
                if (item.data.data.cost.healthtype === 'bashing') {
                    this.object.cost.healthbashing += item.data.data.cost.health;
                }
                else if (item.data.data.cost.healthtype === 'lethal') {
                    this.object.cost.healthlethal += item.data.data.cost.health;
                }
                else {
                    this.object.cost.healthaggravated += item.data.data.cost.health;
                }
            }
            this.object.diceModifier += item.data.data.diceroller.bonusdice;
            this.object.successModifier += item.data.data.diceroller.bonussuccesses;
            if (item.data.data.diceroller.doublesuccess < this.object.doubleSuccess) {
                this.object.doubleSuccess = item.data.data.diceroller.doublesuccess;
            }
            if (item.data.data.diceroller.targetnumber < this.object.damage.targetNumber) {
                this.object.targetNumber = item.data.data.diceroller.targetnumber;
            }
            for (let [rerollKey, rerollValue] of Object.entries(item.data.data.diceroller.reroll)) {
                if (rerollValue) {
                    this.object.reroll[rerollKey].status = true;
                }
            }
            if (item.data.data.diceroller.rerollfailed) {
                this.object.rerollFailed = item.data.data.diceroller.rerollfailed;
            }
            this.object.rerollNumber += item.data.data.diceroller.rerolldice;

            this.object.damage.damageDice += item.data.data.diceroller.damage.bonusdice;
            this.object.damage.damageSuccessModifier += item.data.data.diceroller.damage.bonussuccesses;
            if (item.data.data.diceroller.damage.doublesuccess < this.object.damage.doubleSuccess) {
                this.object.damage.doubleSuccess = item.data.data.diceroller.damage.doublesuccess;
            }
            if (item.data.data.diceroller.damage.targetnumber < this.object.damage.targetNumber) {
                this.object.damage.targetNumber = item.data.data.diceroller.damage.targetnumber;
            }
            this.object.overwhelming += item.data.data.diceroller.damage.overwhelming;
            this.object.damage.postSoakDamage += item.data.data.diceroller.damage.postsoakdamage;
            for (let [rerollKey, rerollValue] of Object.entries(item.data.data.diceroller.damage.reroll)) {
                if (rerollValue) {
                    this.object.damage.reroll[rerollKey].status = true;
                }
            }

            this.render();
        });

        html.find('.remove-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            const index = this.object.addedCharms.findIndex(addedItem => item.id === addedItem._id);
            if (index > -1) {
                for(var charmlist of Object.values(this.object.charmList)) {
                    for(const charm of charmlist.list) {
                        if(charm._id === item.id) {
                            charm.charmAdded = false;
                        }
                    }
                }
                this.object.addedCharms.splice(index, 1);

                if (item.data.data.keywords.toLowerCase().includes('mute')) {
                    this.object.cost.muteMotes -= item.data.data.cost.motes;
                }
                else {
                    this.object.cost.motes -= item.data.data.cost.motes;
                }
                this.object.cost.anima -= item.data.data.cost.anima;
                this.object.cost.willpower -= item.data.data.cost.willpower;
                this.object.cost.silverxp -= item.data.data.cost.silverxp;
                this.object.cost.goldxp -= item.data.data.cost.goldxp;
                this.object.cost.whitexp -= item.data.data.cost.whitexp;
                this.object.cost.initiative -= item.data.data.cost.initiative;

                if (item.data.data.cost.aura === this.object.cost.aura) {
                    this.object.cost.aura = "";
                }

                if (item.data.data.cost.health > 0) {
                    if (item.data.data.cost.healthtype === 'bashing') {
                        this.object.cost.healthbashing -= item.data.data.cost.health;
                    }
                    else if (item.data.data.cost.healthtype === 'lethal') {
                        this.object.cost.healthlethal -= item.data.data.cost.health;
                    }
                    else {
                        this.object.cost.healthaggravated -= item.data.data.cost.health;
                    }
                }
                this.object.diceModifier -= item.data.data.diceroller.bonusdice;
                this.object.successModifier -= item.data.data.diceroller.bonussuccesses;
                for (let [rerollKey, rerollValue] of Object.entries(item.data.data.diceroller.reroll)) {
                    if (rerollValue) {
                        this.object.reroll[rerollKey].status = false;
                    }
                }
                if (item.data.data.diceroller.rerollfailed) {
                    this.object.rerollFailed = false;
                }
                this.object.rerollNumber -= item.data.data.diceroller.rerolldice;

                this.object.damage.damageDice -= item.data.data.diceroller.damage.bonusdice;
                this.object.damage.damageSuccessModifier -= item.data.data.diceroller.damage.bonussuccesses;
                this.object.overwhelming -= item.data.data.diceroller.damage.overwhelming;
                this.object.damage.postSoakDamage -= item.data.data.diceroller.damage.postsoakdamage;
                for (let [rerollKey, rerollValue] of Object.entries(item.data.data.diceroller.damage.reroll)) {
                    if (rerollValue) {
                        this.object.damage.reroll[rerollKey].status = false;
                    }
                }

            }
            this.render();
        });

        html.find('#done-adding-charms').click(ev => {
            this.object.addingCharms = false;
            this.render();
        });

        html.on("change", ".update-roller", ev => {
            this.object.diceCap = this._getDiceCap();
            this.render();
        });

        html.on("change", ".update-specialties", ev => {
            this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.data.ability === this.object.ability);
            this.render();
        });

        html.find('#cancel').click((event) => {
            this.resolve(false);
            this.close();
        });

        html.find('.collapsable').click(ev => {
            const li = $(ev.currentTarget).next();
            li.toggle("fast");
        });
    }

    async _roll() {
        if (this._isAttackRoll()) {
            await this._attackRoll();
        }
        else if (this.object.rollType === 'base') {
            await this._diceRoll();
        }
        else if (this.object.rollType === 'craft') {
            await this._completeCraftProject();
        }
        else {
            await this._abilityRoll();
        }
    }

    async _baseAbilityDieRoll() {
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
                for (let armor of this.actor.armor) {
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
            if (this.object.specialty) {
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

        let roll = new Roll(`${dice}d10${rerollString}${this.object.rerollFailed ? `r<${this.object.targetNumber}` : ""}cs>=${this.object.targetNumber}`).evaluate({ async: false });
        let diceRoll = roll.dice[0].results;
        let getDice = "";
        let bonus = 0;
        let total = 0;
        let rerolledDice = 0;
        var failedDice = Math.min(dice - roll.total, this.object.rerollNumber);

        while (failedDice !== 0 && (rerolledDice < this.object.rerollNumber)) {
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
        if(this.object.rollType !== 'base') {
            this._spendMotes();
        }
    }

    async _diceRoll() {
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
                                            <h4 class="dice-total">${this.object.total} Successes</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        ChatMessage.create({ user: game.user.id, speaker: this.actor !== null ? ChatMessage.getSpeaker({ actor: this.actor }) : null, content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
    }

    async _abilityRoll() {
        if (this.actor.data.type === "npc") {
            this.object.stunt = 'none';
            if (this.object.ability === "archery") {
                this.object.ability = "primary";
            }
        }
        if (this.object.attribute == null) {
            this.object.attribute = this.actor.data.type === "npc" ? null : this._getHighestAttribute();
        }
        if (this.object.rollType === 'social') {
            this.object.difficulty = Math.max(0, this.object.difficulty + parseInt(this.object.opposedIntimacy || 0) - parseInt(this.object.supportedIntimacy || 0));
        }
        let goalNumberLeft = 0;
        this._baseAbilityDieRoll();
        let resultString = ``;

        if (this.object.rollType === "joinBattle") {
            resultString = `<h4 class="dice-total">${this.object.total + 3} Initiative</h4>`;
        }
        if (this.object.hasDifficulty) {
            let extendedTest = ``;
            const threshholdSuccesses = this.object.total - this.object.difficulty;
            goalNumberLeft = Math.max(this.object.goalNumber - threshholdSuccesses - 1, 0);
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
                resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">${threshholdSuccesses} Threshhold Successes</h4>${extendedTest}`;
            }
            this.object.goalNumber = Math.max(this.object.goalNumber - threshholdSuccesses - 1, 0);
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
                          <h4 class="dice-total">${this.object.total} Successes</h4>
                          ${resultString}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  `
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: theContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: this.object.roll,
            flags: {
                "exaltedthird": {
                    dice: this.object.dice,
                    successModifier: this.object.successModifier,
                    total: this.object.total
                }
            }
        });
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

    async _attackRoll() {
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
        else {
            if (this.object.thereshholdSuccesses < 0) {
                if (this.object.rollType !== 'withering') {
                    if (this.object.characterInitiative < 11) {
                        this.object.characterInitiative = this.object.characterInitiative - 2;
                    }
                    else {
                        this.object.characterInitiative = this.object.characterInitiative - 3;
                    }
                }
                var messageContent = `
                <div class="chat-card">
                    <div class="card-content">Attack Roll</div>
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
                                        <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
                                        <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Successes</h4>
                                        <h4 class="dice-total">Attack Missed!</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              `;
                ChatMessage.create({
                    user: game.user.id,
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    content: messageContent,
                    type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll,
                    flags: {
                        "exaltedthird": {
                            dice: this.object.dice,
                            successModifier: this.object.successModifier,
                            total: this.object.total,
                            defense: this.object.defense,
                            threshholdSuccesses: this.object.thereshholdSuccesses
                        }
                    }
                });
                this._addOnslaught();
            }
        }
        if (this.object.rollType === 'accuracy') {
            var messageContent = `
            <div class="chat-card">
                <div class="card-content">Accuracy Roll</div>
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
                                    <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
                                    <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Successes</h4>
                                    ${this.object.thereshholdSuccesses < 0 ? '<h4 class="dice-total">Attack Missed!</h4>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          `;
            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: messageContent,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                roll: this.object.roll,
                flags: {
                    "exaltedthird": {
                        dice: this.object.dice,
                        successModifier: this.object.successModifier,
                        total: this.object.total,
                        defense: this.object.defense,
                        threshholdSuccesses: this.object.thereshholdSuccesses
                    }
                }
            });
            if(this.object.thereshholdSuccesses < 0) {
                this._addOnslaught();
            }
        }
    }

    async _accuracyRoll() {
        this._baseAbilityDieRoll();
        this.object.thereshholdSuccesses = this.object.total - this.object.defense;
    }

    async _damageRoll() {
        let baseDamage = this.object.damage.damageDice;
        let dice = this.object.damage.damageDice;
        if (this.object.rollType === 'damage' && game.settings.get("exaltedthird", "defenseOnDamage")) {
            dice += this.object.attackSuccesses;
            dice -= this.object.defense;
        }
        var damageResults = ``;

        if (this._damageRollType('decisive')) {
            if (this.object.target && game.combat) {
                let targetCombatant = game.combat.data.combatants.find(c => c?.actor?.data?._id == this.object.target.actor.id);
                if (targetCombatant !== null) {
                    if (targetCombatant.actor.data.type === 'npc' || targetCombatant.actor.data.data.battlegroup) {
                        dice += Math.floor(dice / 4);
                        baseDamage = dice;
                    }
                }
            }
        }
        else if (this._damageRollType('withering')) {
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
            if (dice.result >= this.object.damage.doubleSuccess) {
                bonus++;
                getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= this.object.damage.targetNumber) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
        }

        let total = roll.total;
        if (bonus) {
            total += bonus;
        }
        total += this.object.damage.damageSuccessModifier;
        var characterDamage = total;

        let typeSpecificResults = ``;

        if (this._damageRollType('decisive')) {
            typeSpecificResults = `<h4 class="dice-total">${total} ${this.object.damage.type.capitalize()} Damage!</h4>`;
            this.object.characterInitiative = 3;
            if (this._useLegendarySize('decisive')) {
                typeSpecificResults = typeSpecificResults + `<h4 class="dice-formula">Legendary Size</h4><h4 class="dice-formula">Damage capped at ${3 + this.actor.data.data.attributes.strength.value} + Charm damage levels</h4>`;
                characterDamage = Math.min(characterDamage, 3 + this.actor.data.data.attributes.strength.value);
            }
            this.dealHealthDamage(characterDamage);
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
                                this.object.crashed = true;
                                this.object.characterInitiative += 5;
                                targetResults = `<h4 class="dice-total">Target Crashed!</h4>`;
                            }
                        }
                        game.combat.setInitiative(targetCombatant.id, newInitative);
                    }
                    else if(targetCombatant.actor.data.data.battlegroup) {
                        this.dealHealthDamage(total);
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
        var messageContent = '';
        if (this.object.rollType === 'damage') {
            messageContent = `
            <div class="chat-card">
                <div class="card-content">Damage Roll</div>
                <div class="card-buttons">
                    <div class="flexrow 1">
                        <div>
                            <div class="dice-roll">
                                <div class="dice-result">
                                    ${damageResults}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          `;
        }
        else {
            messageContent = `
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
                                    <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
                                    <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Successes</h4>
                                    ${damageResults}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          `;
        }

        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: messageContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: this.object.roll || roll,
            flags: {
                "exaltedthird": {
                    dice: this.object.dice,
                    successModifier: this.object.successModifier,
                    total: this.object.total,
                    defense: this.object.defense,
                    threshholdSuccesses: this.object.thereshholdSuccesses,
                    damage: {
                        dice: baseDamage,
                        successModifier: this.object.damage.damageSuccessModifier,
                        soak: this.object.soak,
                        totalDamage: total,
                        crashed: this.object.crashed
                    }
                }
            }
        });

        if (this.actor.data.type !== 'npc' || this.actor.data.data.battlegroup === false) {
            let combat = game.combat;
            if (this.object.target && combat) {
                let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.actor.id);
                if (combatant && combatant.initiative != null) {
                    combat.setInitiative(combatant.id, this.object.characterInitiative);
                }
            }
        }
        else if (this.actor.data.data.battlegroup) {
            let combat = game.combat;
            if (this.object.target) {
                let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.object.target.actor.id);
                if (combatant && combatant.initiative != null && combatant.initiative <= 0) {
                    this.dealHealthDamage(total);
                }
            }
        }
        this._addOnslaught();
    }

    async _addOnslaught() {
        if (this.object.target && game.settings.get("exaltedthird", "calculateOnslaught")) {
            if (!this._useLegendarySize('onslaught')) {
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

    async dealHealthDamage(characterDamage) {
        if (this.object.target && game.combat && game.settings.get("exaltedthird", "autoDecisiveDamage") && characterDamage > 0) {
            let totalHealth = 0;
            const targetActorData = duplicate(this.object.target.actor);
            for (let [key, health_level] of Object.entries(targetActorData.data.health.levels)) {
                totalHealth += health_level.value;
            }
            if (this.object.damage.type === 'bashing') {
                targetActorData.data.health.bashing = Math.min(totalHealth - targetActorData.data.health.aggravated - targetActorData.data.health.lethal, targetActorData.data.health.bashing + characterDamage);
            }
            if (this.object.damage.type === 'lethal') {
                targetActorData.data.health.lethal = Math.min(totalHealth - targetActorData.data.health.bashing - targetActorData.data.health.aggravated, targetActorData.data.health.lethal + characterDamage);
            }
            if (this.object.damage.type === 'aggravated') {
                targetActorData.data.health.aggravated = Math.min(totalHealth - targetActorData.data.health.bashing - targetActorData.data.health.lethal, targetActorData.data.health.aggravated + characterDamage);
            }
            this.object.target.actor.update(targetActorData);
        }
    }

    async _completeCraftProject() {
        this._baseAbilityDieRoll();
        let resultString = ``;
        let projectStatus = ``;
        let craftFailed = false;
        let craftSuccess = false;
        let goalNumberLeft = this.object.goalNumber;
        let extendedTest = ``;
        const threshholdSuccesses = this.object.total - this.object.difficulty;
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
                goalNumberLeft = Math.max(this.object.goalNumber - threshholdSuccesses - 1, 0);
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
            resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">${threshholdSuccesses} Threshhold Successes</h4>${extendedTest}`;
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
                if (threshholdSuccesses >= 3) {
                    silverXPGained = 3 * this.object.objectivesCompleted;
                }
                else {
                    silverXPGained = 2 * this.object.objectivesCompleted;
                }
                projectStatus = `<h4 class="dice-total">Craft Project Success</h4><h4 class="dice-total">${silverXPGained} Silver XP Gained</h4>`;
            }
            else if (this.object.craftType === "major") {
                if (threshholdSuccesses >= 3) {
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
                        <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                        <div class="dice-tooltip">
                            <div class="dice">
                                <ol class="dice-rolls">${this.object.getDice}</ol>
                            </div>
                        </div>
                        <h4 class="dice-total">${this.object.total} Successes</h4>
                        ${resultString}
                        ${projectStatus}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: messageContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: this.object.roll,
            flags: {
                "exaltedthird": {
                    dice: this.object.dice,
                    successModifier: this.object.successModifier,
                    total: this.object.total
                }
            }
        });
        this.object.goalNumber = goalNumberLeft;
        this.object.intervals--;
        if (this.object.intervals > 0) {
            this.render();
        }
    }

    _isAttackRoll() {
        return this.object.rollType === 'withering' || this.object.rollType === 'decisive' || this.object.rollType === 'gambit' || this.object.rollType === 'accuracy' || this.object.rollType === 'damage';
    }

    _damageRollType(rollType) {
        return this.object.rollType === rollType || (this.object.rollType === 'damage' && this.object.attackType === rollType);
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

    _getDiceCap() {
        var animaBonus = {
            Dim: 0,
            Glowing: 1,
            Burning: 2,
            Bonfire: 3,
            Transcendent: 4
        }
        if(this.object.rollType !== "base" && this.actor.type === "character") {
            if (this.actor.data.data.details.exalt === "solar") {
                return this.actor.data.data.abilities[this.object.ability].value + this.actor.data.data.attributes[this.object.attribute].value;
            }
            if (this.actor.data.data.details.exalt === "dragonblooded") {
                return this.actor.data.data.abilities[this.object.ability].value + (this.object.specialty ? 1 : 0);
            }
            if (this.actor.data.data.details.exalt === "lunar") {
                return `${this.actor.data.data.attributes[this.object.attribute].value} - ${this.actor.data.data.attributes[this.object.attribute].value + 5}`;
            }
            if (this.actor.data.data.details.exalt === "dreamsouled") {
                return `${this.actor.data.data.abilities[this.object.ability].value} or ${Math.min(10, this.actor.data.data.abilities[this.object.ability].value + this.actor.data.data.essence.value)} when upholding ideal`;
            }
            if (this.actor.data.data.details.exalt === "umbral") {
                return `${Math.min(10, this.actor.data.data.abilities[this.object.ability].value + this.actor.data.data.details.penumbra.value)}`;
            }
            if (this.actor.data.data.details.caste.toLowerCase() === "architect") {
                return `${this.actor.data.data.attributes[this.object.attribute].value} or ${this.actor.data.data.attributes[this.object.attribute].value + this.actor.data.data.essence.value} in cities`;
            }
            if (this.actor.data.data.details.caste.toLowerCase() === "janest" || this.actor.data.data.details.caste.toLowerCase() === 'strawmaiden') {
                return `${this.actor.data.data.abilities[this.object.ability].value} + [Relevant of Athletics, Awareness, Presence, Resistance, or Survival]`;
            }
            if (this.actor.data.data.details.caste.toLowerCase() === "sovereign") {
                return Math.min(Math.max(this.actor.data.data.essence.value, 3) + animaBonus[this.actor.data.data.anima.level], 10) ;
            }
        }
        return "";
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

    _spendMotes() {
        const actorData = duplicate(this.actor);

        var newLevel = actorData.data.anima.level;
        var newValue = actorData.data.anima.value;
        if (this.object.cost.anima > 0) {
            for (var i = 0; i < this.object.cost.anima; i++) {
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
        var spentPersonal = 0;
        var spentPeripheral = 0;
        var totalMotes = this.object.cost.motes + this.object.cost.muteMotes;
        if (actorData.data.settings.charmmotepool === 'personal') {
            var remainingPersonal = actorData.data.motes.personal.value - totalMotes;
            if (remainingPersonal < 0) {
                spentPersonal = totalMotes - actorData.data.motes.personal.value;
                spentPeripheral = Math.abs(remainingPersonal);
            }
            else {
                spentPersonal = totalMotes;
            }
        }
        else {
            var remainingPeripheral = actorData.data.motes.peripheral.value - totalMotes;
            if (remainingPeripheral < 0) {
                spentPeripheral = totalMotes - actorData.data.motes.peripheral.value;
                spentPersonal = Math.abs(remainingPeripheral);
            }
            else {
                spentPeripheral = totalMotes;
            }
        }
        actorData.data.motes.peripheral.value = Math.max(0 + actorData.data.motes.peripheral.committed, actorData.data.motes.peripheral.value - spentPeripheral);
        actorData.data.motes.personal.value = Math.max(0 + actorData.data.motes.personal.committed, actorData.data.motes.personal.value - spentPersonal);

        if ((spentPeripheral - this.object.cost.muteMotes) > 4) {
            for (var i = 0; i < Math.floor((spentPeripheral- this.object.cost.muteMotes) / 5); i++) {
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
                else if (actorData.data.anima.max === 4) {
                    newLevel = "Transcendent";
                    newValue = 4;
                }
            }
        }

        actorData.data.anima.level = newLevel;
        actorData.data.willpower.value = Math.max(0, actorData.data.willpower.value - this.object.cost.willpower);
        if (this.object.cost.initiative > 0) {
            let combat = game.combat;
            if (combat) {
                let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.actor.id);
                if (combatant) {
                    var newInitiative = combatant.initiative - this.object.cost.initiative;
                    if (combatant.initiative > 0 && newInitiative <= 0) {
                        newInitiative -= 5;
                    }
                    combat.setInitiative(combatant.id, newInitiative);
                }
            }
        }
        if (this.actor.type === 'character') {
            actorData.data.craft.experience.silver.value = Math.max(0, actorData.data.craft.experience.silver.value - this.object.cost.silverxp);
            actorData.data.craft.experience.gold.value = Math.max(0, actorData.data.craft.experience.gold.value - this.object.cost.goldxp);
            actorData.data.craft.experience.white.value = Math.max(0, actorData.data.craft.experience.white.value - this.object.cost.whitexp);
        }
        if (actorData.data.details.aura === this.object.cost.aura || this.object.cost.aura === 'any') {
            actorData.data.details.aura = "none";
        }
        if (this.object.cost.initiative > 0) {
            let combat = game.combat;
            if (combat) {
                let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.actor.id);
                if (combatant) {
                    var newInitiative = combatant.initiative - this.object.cost.initiative;
                    if (combatant.initiative > 0 && newInitiative <= 0) {
                        newInitiative -= 5;
                    }
                    combat.setInitiative(combatant.id, newInitiative);
                }
            }
        }
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(actorData.data.health.levels)) {
            totalHealth += health_level.value;
        }
        if (this.object.cost.healthbashing > 0) {
            actorData.data.health.bashing = Math.min(totalHealth - actorData.data.health.aggravated - actorData.data.health.lethal, actorData.data.health.bashing + this.object.cost.healthbashing);
        }
        if (this.object.cost.healthlethal > 0) {
            actorData.data.health.lethal = Math.min(totalHealth - actorData.data.health.bashing - actorData.data.health.aggravated, actorData.data.health.lethal + this.object.cost.healthlethal);
        }
        if (this.object.cost.healthaggravated > 0) {
            actorData.data.health.aggravated = Math.min(totalHealth - actorData.data.health.bashing - actorData.data.health.lethal, actorData.data.health.aggravated + this.object.cost.healthaggravated);
        }

        this.actor.update(actorData);
    }
}

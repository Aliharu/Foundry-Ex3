export class RollForm extends FormApplication {
    constructor(actor, options, object, data) {
        super(object, options);
        this.actor = actor;

        if (data.rollId) {
            this.object = duplicate(this.actor.system.savedRolls[data.rollId]);
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
            this.object.attackType = data.attackType || data.rollType || 'withering';
            if (this.object.rollType === 'damage' || this.object.rollType === 'accuracy') {
                this.object.attackType = 'withering';
            }
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
            this.object.showPool = !this._isAttackRoll();
            this.object.showWithering = data.rollType === 'withering' || data.rollType === 'damage';
            this.object.hasDifficulty = data.rollType === 'ability' || data.rollType === 'grappleControl' || data.rollType === 'readIntentions' || data.rollType === 'social' || data.rollType === 'craft' || data.rollType === 'working' || data.rollType === 'rout';
            this.object.stunt = "none";
            this.object.goalNumber = 0;
            this.object.woundPenalty = this.object.rollType === 'base' ? false : true;
            this.object.intervals = 0;
            this.object.difficulty = data.difficulty || 0;
            this.object.isMagic = data.isMagic || false;
            this.object.attackEffectPreset = data.attackEffectPreset || 'none';
            this.object.attackEffect = data.attackEffect || '';
            this.object.diceModifier = 0;
            this.object.accuracy = data.accuracy || 0;
            this.object.triggerSelfDefensePenalty = 0;
            this.object.triggerKnockdown = false;

            this.object.overwhelming = data.overwhelming || 0;
            this.object.soak = 0;
            this.object.armoredSoak = 0;
            this.object.naturalSoak = 0;
            this.object.defense = 0;
            this.object.characterInitiative = 0;
            this.object.gambitDifficulty = 0;
            this.object.weaponTags = {};

            this.object.weaponType = data.weaponType || 'melee';
            this.object.range = 'close';

            this.object.isFlurry = false;
            this.object.armorPenalty = false;
            this.object.willpower = false;

            this.object.supportedIntimacy = 0;
            this.object.opposedIntimacy = 0;

            this.object.doubleSuccess = 10;
            this.object.rerollFailed = false;
            this.object.rollTwice = false;
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
                doubleSuccess: data.doubleSuccess || ((this.object.rollType === 'decisive' || this.actor?.system?.battlegroup) ? 11 : 10),
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
                threshholdToDamage: false,
                resetInit: true,
                doubleRolledDamage: false,
                ignoreSoak: 0,
            };
            this.object.craft = {
                divineInsperationTechnique: false,
                holisticMiracleUnderstanding: false,
            }
            if (this.object.rollType !== 'base') {
                this.object.characterType = this.actor.type;

                this.object.conditions = (this.actor.token && this.actor.token.actorData.effects) ? this.actor.token.actorData.effects : [];
                if (this.actor.type === 'character') {
                    if (this.object.rollType === 'martialArt') {
                        this.object.martialArtRoll = true;
                        this.object.martialArtId = data.martialArtId;
                        this.object.martialarts = this.actor.martialarts;
                    }
                    if (this.object.rollType === 'craftAbilityRoll') {
                        this.object.craftRoll = true;
                        this.object.craftId = data.craftId;
                        this.object.crafts = this.actor.crafts;
                    }
                    this.object.attribute = data.attribute || this._getHighestAttribute();
                    this.object.ability = data.ability || "archery";
                    this.object.appearance = this.actor.system.attributes.appearance.value;
                }

                if (this.actor.system.settings.rollStunts) {
                    this.object.stunt = "one";
                }

                if (this.actor.type === "npc") {
                    if (this.object.rollType === 'action') {
                        this.object.actionRoll = true;
                        this.object.actionId = data.actionId;
                        this.object.actions = this.actor.actions;
                    }
                    else {
                        this.object.pool = data.pool || "administration";
                    }
                    this.object.appearance = this.actor.system.appearance.value;
                }
                if (data.weapon) {
                    this.object.weaponTags = data.weapon.traits.weapontags.selected;
                    this.object.damage.resetInit = data.weapon.resetinitiative;
                    if (this.actor.type === 'character') {
                        this.object.attribute = data.weapon.attribute || this._getHighestAttribute();
                        this.object.ability = data.weapon.ability || "archery";
                    }
                    if (this.object.rollType === 'withering' || this.object.rollType === 'accuracy' || this.object.rollType === 'damage' || this.actor.type === "npc") {
                        this.object.accuracy = data.weapon.witheringaccuracy || 0;
                        if (this.object.rollType === 'withering' || this.object.rollType === 'accuracy' || this.object.rollType === 'damage') {
                            this.object.damage.damageDice = data.weapon.witheringdamage || 0;
                            if (this.actor.type === 'character') {
                                if (this.object.weaponTags["flame"] || this.object.weaponTags["crossbow"]) {
                                    this.object.damage.damageDice += 4;
                                }
                                else {
                                    this.object.damage.damageDice += (this.actor.system.attributes[data.weapon.damageattribute]?.value || 0);
                                }
                            }
                        }
                    }
                    if (this.object.weaponTags["bashing"] && !this.object.weaponTags["lethal"]) {
                        this.object.damage.type = 'bashing';
                    }
                    if (this.object.weaponTags['aggravated']) {
                        this.object.damage.type = 'aggravated';
                    }
                    if (this.object.weaponTags["magicdamage"]) {
                        this.object.isMagic = true;
                    }
                    if (this.object.weaponTags["improvised"]) {
                        this.object.cost.initiative += 1;
                    }
                    this.object.overwhelming = data.weapon.overwhelming || 0;
                    this.object.weaponType = data.weapon.weapontype || "melee";
                    this.object.attackEffectPreset = data.weapon.attackeffectpreset || "none";
                    this.object.attackEffect = data.weapon.attackeffect || "";
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
                this.object.finesse = 1;
                this.object.ambition = 5;

                if (this.object.rollType === 'working') {
                    this.object.difficulty = 1;
                    this.object.intervals = 5;
                    this.object.goalNumber = 5;
                }
                if (this.object.rollType === 'rout') {
                    this.object.difficulty = 1;
                    if (parseInt(this.actor.system.drill.value) === 0) {
                        this.object.difficulty = 2;
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
        this.object.showSpecialAttacks = false;
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
        if (this.object.craft === undefined) {
            this.object.craft = {
                divineInsperationTechnique: false,
                holisticMiracleUnderstanding: false,
            }
        }
        if (this.object.damage.threshholdToDamage === undefined) {
            this.object.damage.threshholdToDamage = false;
        }
        if (this.object.weaponTags === undefined) {
            this.object.weaponTags = {};
        }
        if (this.object.damage.resetInit === undefined) {
            this.object.damage.resetInit = true;
        }
        if (this.object.damage.doubleRolledDamage === undefined) {
            this.object.damage.doubleRolledDamage = false;
        }
        if (this.object.damage.ignoreSoak === undefined) {
            this.object.damage.ignoreSoak = 0;
            this.object.triggerSelfDefensePenalty = 0;
            this.object.triggerKnockdown = false;
        }
        if (this.object.addedCharms === undefined) {
            this.object.addedCharms = [];
        }
        if (this.object.specialAttacksList === undefined) {
            this.object.specialAttacksList = [
                { id: 'chopping', name: "Chopping", added: false, show: false, description: 'Cost: 1i and reduce defense by 1. Increase damage by 3 on withering.  -2 hardness on decisive', img: 'systems/exaltedthird/assets/icons/battered-axe.svg' },
                { id: 'flurry', name: "Flurry", added: false, show: this._isAttackRoll(), description: 'Cost: 3 dice and reduce defense by 1.', img: 'systems/exaltedthird/assets/icons/spinning-blades.svg' },
                { id: 'piercing', name: "Piercing", added: false, show: false, description: 'Cost: 1i and reduce defense by 1.  Ignore 4 soak', img: 'systems/exaltedthird/assets/icons/fast-arrow.svg' },
                { id: 'knockdown', name: "Smashing (Knockdown)", added: false, show: false, description: 'Cost: 2i and reduce defense by 1. Knock opponent down', img: 'icons/svg/falling.svg' },
                { id: 'knockback', name: "Smashing (Knockback)", added: false, show: false, description: 'Cost: 2i and reduce defense by 1.  Knock opponent back 1 range band', img: 'systems/exaltedthird/assets/icons/hammer-drop.svg' },
            ];
        }
        if (this.object.diceCap === undefined) {
            this.object.diceCap = this._getDiceCap();
        }
        if (this.object.diceToSuccesses === undefined) {
            this.object.diceToSuccesses = 0;
        }
        if (this.object.rollTwice === undefined) {
            this.object.rollTwice = false;
        }
        if (this.object.attackEffect === undefined) {
            this.object.attackEffectPreset = data.attackEffectPreset || 'none';
            this.object.attackEffect = data.attackEffect || '';
        }
        if (this.object.rollType !== 'base') {
            this.object.opposingCharms = [];
            if (this.actor.system.battlegroup && this._isAttackRoll()) {
                this._setBattlegroupBonuses();
            }
            this._updateSpecialtyList();
            this.object.target = Array.from(game.user.targets)[0] || null;
            this.object.targetCombatant = game.combat?.combatants?.find(c => c.actorId == this.object.target?.actor.id) || null;
            this.object.showDefenseOnDamage = game.settings.get("exaltedthird", "defenseOnDamage");

            let combat = game.combat;
            if (combat) {
                let combatant = combat.combatants.find(c => c.actorId == actor.id);
                if (combatant && combatant.initiative) {
                    if (!this.object.showWithering) {
                        if (data.weapon && data.weapon.decisivedamagetype === 'static') {
                            this.object.damage.damageDice = data.weapon.staticdamage;
                        } else {
                            this.object.damage.damageDice = combatant.initiative;
                        }
                    }
                    this.object.characterInitiative = combatant.initiative;
                }
            }
            if (this.object.target) {
                if (this.object.rollType === 'social' || this.object.rollType === 'readIntentions') {
                    if (this.object.rollType === 'readIntentions') {
                        this.object.difficulty = this.object.target.actor.system.guile.value;
                    }
                    if (this.object.rollType === 'social') {
                        this.object.difficulty = this.object.target.actor.system.resolve.value;
                    }
                    if (this.object.target.actor.system.settings.defenseStunts) {
                        this.object.difficulty += 1;
                    }
                    if (this.object.target.actor.system.health.penalty !== 'inc') {
                        this.object.difficulty -= Math.max(0, this.object.target.actor.system.health.penalty - this.object.target.actor.system.health.penaltymod);
                    }
                    if (this.object.difficulty < 0) {
                        this.object.difficulty = 0;
                    }
                }
                if ((this.object.target.actor.system.parry.value >= this.object.target.actor.system.evasion.value || this.object.weaponTags["undodgeable"]) && !this.object.weaponTags["unblockable"]) {
                    this.object.defense = this.object.target.actor.system.parry.value;
                    if (this.object.target.actor.effects && this.object.target.actor.effects.some(e => e.flags?.core?.statusId === 'prone')) {
                        this.object.defense -= 1;
                    }
                }
                if ((this.object.target.actor.system.evasion.value >= this.object.target.actor.system.parry.value || this.object.weaponTags["unblockable"]) && !this.object.weaponTags["undodgeable"]) {
                    this.object.defense = this.object.target.actor.system.evasion.value;
                    if (this.object.target.actor.effects && this.object.target.actor.effects.some(e => e.flags?.core?.statusId === 'prone')) {
                        this.object.defense -= 2;
                    }
                }
                if (this.object.target.actor.system.warstrider.equipped) {
                    this.object.soak = this.object.target.actor.system.warstrider.soak.value;
                }
                else {
                    this.object.soak = this.object.target.actor.system.soak.value;
                    this.object.armoredSoak = this.object.target.actor.system.armoredsoak.value;
                    this.object.naturalSoak = this.object.target.actor.system.naturalsoak.value;
                }
                if (this.object.target.actor.system.battlegroup) {
                    this.object.defense += parseInt(this.object.target.actor.system.drill.value);
                    if (this.object.target.actor.system.might.value > 1) {
                        this.object.defense += (this.object.target.actor.system.might.value - 1);
                    }
                    else {
                        this.object.defense += this.object.target.actor.system.might.value;
                    }
                    this.object.soak += this.object.target.actor.system.size.value;
                    this.object.naturalSoak += this.object.target.actor.system.size.value;
                }
                if (this.object.target.actor.system.settings.defenseStunts) {
                    this.object.defense += 1;
                }
                if (this.object.target.actor.system.health.penalty !== 'inc') {
                    this.object.defense -= Math.max(0, this.object.target.actor.system.health.penalty - this.object.target.actor.system.health.penaltymod);
                }
                if (this.object.target.actor.effects) {
                    if (this.object.target.actor.effects.some(e => e.flags?.core?.statusId === 'lightcover')) {
                        this.object.defense += 1;
                    }
                    if (this.object.target.actor.effects.some(e => e.flags?.core?.statusId === 'heavycover')) {
                        this.object.defense += 2;
                    }
                    if (this.object.target.actor.effects.some(e => e.flags?.core?.statusId === 'fullcover')) {
                        this.object.defense += 3;
                    }
                    if (this.object.target.actor.effects.some(e => e.flags?.core?.statusId === 'fulldefense')) {
                        this.object.defense += 2;
                    }
                    if (this.object.target.actor.effects.some(e => e.flags?.core?.statusId === 'surprised')) {
                        this.object.defense -= 2;
                    }
                    if (this.object.target.actor.effects.some(e => e.flags?.core?.statusId === 'grappled') || this.object.target.actor.effects.some(e => e.flags?.core?.statusId === 'grappling')) {
                        this.object.defense -= 2;
                    }
                }
                if (this.object.defense < 0) {
                    this.object.defense = 0;
                }
                if (this.object.soak < 0) {
                    this.object.soak = 0;
                }
                if (this.object.weaponTags["bombard"]) {
                    if (!this.object.target.actor.system.battlegroup && !this.object.target.actor.system.legendarysize && !this.object.target.actor.system.warstrider.equipped) {
                        this.object.diceModifier -= 4;
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
                    for (var charmlist of Object.values(this.object.charmList)) {
                        for (const charm of charmlist.list) {
                            if (this.object.addedCharms.some((addedCharm) => addedCharm._id === charm._id)) {
                                charm.charmAdded = true;
                            }
                            else {
                                charm.charmAdded = false;
                            }
                        }
                    }
                    if (this.object.addingCharms) {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('Ex3.AddCharm')}`;
                    }
                    else {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('Ex3.Done')}`;
                    }
                    if (this._isAttackRoll()) {
                        this.object.showSpecialAttacks = true;
                        if (this.object.rollType !== 'gambit') {
                            for (var specialAttack of this.object.specialAttacksList) {
                                if ((specialAttack.id === 'knockback' || specialAttack.id === 'knockdown') && this.object.weaponTags['smashing']) {
                                    specialAttack.show = true;
                                }
                                else if (this.object.weaponTags[specialAttack.id] || specialAttack.id === 'flurry') {
                                    specialAttack.show = true;
                                }
                                else {
                                    specialAttack.added = false;
                                    specialAttack.show = false;
                                }
                            }
                        }
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
            classes: ["dialog", `solar-background`],
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

    async addOpposingCharm(charm) {
        const index = this.object.opposingCharms.findIndex(opposedCharm => charm._id === opposedCharm._id);
        if (index === -1) {
            this.object.opposingCharms.push(charm);
            if (this._isAttackRoll()) {
                this.object.defense += charm.system.diceroller.opposedbonuses.defense;
                this.object.soak += charm.system.diceroller.opposedbonuses.soak;
                this.object.targetNumber += charm.system.diceroller.opposedbonuses.increasetargetnumber;
                this.object.damage.targetNumber += charm.system.diceroller.opposedbonuses.increasedamagetargetnumber;
            }
            if (this.object.rollType === 'readIntentions') {
                this.object.difficulty += charm.system.diceroller.opposedbonuses.guile;
            }
            if (this.object.rollType === 'social') {
                this.object.difficulty += charm.system.diceroller.opposedbonuses.resolve;
            }
            this.render();
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("change", "#working-finesse", ev => {
            this.object.difficulty = parseInt(this.object.finesse);
            this.render();
        });

        html.on("change", "#working-ambition", ev => {
            this.object.goalNumber = parseInt(this.object.ambition);
            this.render();
        });

        html.on("change", "#update-damage-type", ev => {
            this.render();
        });

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


        html.find('.add-special-attack').click((ev) => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let id = li.data("item-id");
            for (var specialAttack of this.object.specialAttacksList) {
                if (specialAttack.id === id) {
                    specialAttack.added = true;
                }
            }
            if (id === 'knockback' || id === 'knockdown') {
                this.object.cost.initiative += 2;
                if (id === 'knockdown') {
                    this.object.triggerKnockdown = true;
                }
            }
            else if (id === 'flurry') {
                this.object.isFlurry = true;
            }
            else {
                this.object.cost.initiative += 1;
            }
            if (id === 'chopping' && this.object.attackType === 'withering') {
                this.object.damage.damageDice += 3;
            }
            if (id === 'piercing' && this.object.attackType === 'withering') {
                this.object.damage.ignoreSoak += 4;
            }
            this.object.triggerSelfDefensePenalty += 1;
            this.render();
        });

        html.find('.remove-special-attack').click((ev) => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let id = li.data("item-id");
            for (var specialAttack of this.object.specialAttacksList) {
                if (specialAttack.id === id) {
                    specialAttack.added = false;
                }
            }
            if (id === 'knockback' || id === 'knockdown') {
                this.object.cost.initiative -= 2;
                if (id === 'knockdown') {
                    this.object.triggerKnockdown = false;
                }
            }
            else if (id === 'flurry') {
                this.object.isFlurry = false;
            }
            else {
                this.object.cost.initiative -= 1;
            }
            if (id === 'chopping' && this.object.attackType === 'withering') {
                this.object.damage.damageDice -= 3;
            }
            if (id === 'piercing' && this.object.attackType === 'withering') {
                this.object.damage.ignoreSoak -= 4;
            }
            this.object.triggerSelfDefensePenalty = Math.max(0, this.object.triggerSelfDefensePenalty - 1);
            this.render();
        });

        html.find('.add-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            this.object.addedCharms.push(item);
            for (var charmlist of Object.values(this.object.charmList)) {
                for (const charm of charmlist.list) {
                    if (this.object.addedCharms.some((addedCharm) => addedCharm._id === charm._id)) {
                        charm.charmAdded = true;
                    }
                }
            }
            if (item.system.keywords.toLowerCase().includes('mute')) {
                this.object.cost.muteMotes += item.system.cost.motes;
            }
            else {
                this.object.cost.motes += item.system.cost.motes;
            }
            this.object.cost.anima += item.system.cost.anima;
            this.object.cost.willpower += item.system.cost.willpower;
            this.object.cost.silverxp += item.system.cost.silverxp;
            this.object.cost.goldxp += item.system.cost.goldxp;
            this.object.cost.whitexp += item.system.cost.whitexp;
            this.object.cost.initiative += item.system.cost.initiative;

            if (item.system.cost.aura) {
                this.object.cost.aura = item.system.cost.aura;
            }

            if (item.system.cost.health > 0) {
                if (item.system.cost.healthtype === 'bashing') {
                    this.object.cost.healthbashing += item.system.cost.health;
                }
                else if (item.system.cost.healthtype === 'lethal') {
                    this.object.cost.healthlethal += item.system.cost.health;
                }
                else {
                    this.object.cost.healthaggravated += item.system.cost.health;
                }
            }
            this.object.diceModifier += item.system.diceroller.bonusdice;
            this.object.successModifier += item.system.diceroller.bonussuccesses;
            if (item.system.diceroller.doublesuccess < this.object.doubleSuccess) {
                this.object.doubleSuccess = item.system.diceroller.doublesuccess;
            }
            if (item.system.diceroller.targetnumber < this.object.damage.targetNumber) {
                this.object.targetNumber = item.system.diceroller.targetnumber;
            }
            for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.reroll)) {
                if (rerollValue) {
                    this.object.reroll[rerollKey].status = true;
                }
            }
            if (item.system.diceroller.rerollfailed) {
                this.object.rerollFailed = item.system.diceroller.rerollfailed;
            }
            if (item.system.diceroller.rolltwice) {
                this.object.rollTwice = item.system.diceroller.rolltwice;
            }
            this.object.rerollNumber += item.system.diceroller.rerolldice;
            this.object.diceToSuccesses += item.system.diceroller.diceToSuccesses;

            this.object.damage.damageDice += item.system.diceroller.damage.bonusdice;
            this.object.damage.damageSuccessModifier += item.system.diceroller.damage.bonussuccesses;
            if (item.system.diceroller.damage.doublesuccess < this.object.damage.doubleSuccess) {
                this.object.damage.doubleSuccess = item.system.diceroller.damage.doublesuccess;
            }
            if (item.system.diceroller.damage.targetnumber < this.object.damage.targetNumber) {
                this.object.damage.targetNumber = item.system.diceroller.damage.targetnumber;
            }
            this.object.overwhelming += item.system.diceroller.damage.overwhelming;
            this.object.damage.postSoakDamage += item.system.diceroller.damage.postsoakdamage;
            for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.reroll)) {
                if (rerollValue) {
                    this.object.damage.reroll[rerollKey].status = true;
                }
            }
            if (item.system.diceroller.damage.threshholdtodamage) {
                this.object.damage.threshholdToDamage = item.system.diceroller.damage.threshholdtodamage;
            }
            if (item.system.diceroller.damage.doublerolleddamage) {
                this.object.damage.doubleRolledDamage = item.system.diceroller.damage.doublerolleddamage;
            }
            if (item.system.diceroller.damage.doublerolleddamage) {
                this.object.damage.doubleRolledDamage = item.system.diceroller.damage.doublerolleddamage;
            }
            if (item.system.diceroller.damage.ignoresoak > 0) {
                this.object.damage.ignoreSoak += item.system.diceroller.damage.ignoresoak;
            }
            this.render();
        });

        html.find('.remove-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            const index = this.object.addedCharms.findIndex(addedItem => item.id === addedItem._id);
            if (index > -1) {
                for (var charmlist of Object.values(this.object.charmList)) {
                    for (const charm of charmlist.list) {
                        if (charm._id === item.id) {
                            charm.charmAdded = false;
                        }
                    }
                }
                this.object.addedCharms.splice(index, 1);

                if (item.system.keywords.toLowerCase().includes('mute')) {
                    this.object.cost.muteMotes -= item.system.cost.motes;
                }
                else {
                    this.object.cost.motes -= item.system.cost.motes;
                }
                this.object.cost.anima -= item.system.cost.anima;
                this.object.cost.willpower -= item.system.cost.willpower;
                this.object.cost.silverxp -= item.system.cost.silverxp;
                this.object.cost.goldxp -= item.system.cost.goldxp;
                this.object.cost.whitexp -= item.system.cost.whitexp;
                this.object.cost.initiative -= item.system.cost.initiative;

                if (item.system.cost.aura === this.object.cost.aura) {
                    this.object.cost.aura = "";
                }

                if (item.system.cost.health > 0) {
                    if (item.system.cost.healthtype === 'bashing') {
                        this.object.cost.healthbashing -= item.system.cost.health;
                    }
                    else if (item.system.cost.healthtype === 'lethal') {
                        this.object.cost.healthlethal -= item.system.cost.health;
                    }
                    else {
                        this.object.cost.healthaggravated -= item.system.cost.health;
                    }
                }
                this.object.diceModifier -= item.system.diceroller.bonusdice;
                this.object.successModifier -= item.system.diceroller.bonussuccesses;
                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.reroll)) {
                    if (rerollValue) {
                        this.object.reroll[rerollKey].status = false;
                    }
                }
                if (item.system.diceroller.rolltwice) {
                    this.object.rollTwice = false;
                }
                if (item.system.diceroller.rerollfailed) {
                    this.object.rerollFailed = false;
                }
                this.object.rerollNumber -= item.system.diceroller.rerolldice;
                this.object.diceToSuccesses -= item.system.diceroller.diceToSuccesses;

                this.object.damage.damageDice -= item.system.diceroller.damage.bonusdice;
                this.object.damage.damageSuccessModifier -= item.system.diceroller.damage.bonussuccesses;
                this.object.overwhelming -= item.system.diceroller.damage.overwhelming;
                this.object.damage.postSoakDamage -= item.system.diceroller.damage.postsoakdamage;
                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.reroll)) {
                    if (rerollValue) {
                        this.object.damage.reroll[rerollKey].status = false;
                    }
                }
                if (item.system.diceroller.damage.threshholdtodamage) {
                    this.object.damage.threshholdToDamage = false;
                }
                if (item.system.diceroller.damage.doublerolleddamage) {
                    this.object.damage.doubleRolledDamage = false;
                }
                if (item.system.diceroller.damage.ignoresoak > 0) {
                    this.object.damage.ignoreSoak -= item.system.diceroller.damage.ignoresoak;
                }
            }
            this.render();
        });

        html.find('.remove-opposing-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let id = li.data("item-id");
            const charm = this.object.opposingCharms.find(opposedCharm => id === opposedCharm._id);
            const index = this.object.opposingCharms.findIndex(opposedCharm => id === opposedCharm._id);
            if (index > -1) {
                this.object.opposingCharms.splice(index, 1);
                if (this._isAttackRoll()) {
                    this.object.defense -= charm.system.diceroller.opposedbonuses.defense;
                    this.object.soak -= charm.system.diceroller.opposedbonuses.soak;
                    this.object.targetNumber -= charm.system.diceroller.opposedbonuses.increasetargetnumber;
                    this.object.damage.targetNumber -= charm.system.diceroller.opposedbonuses.increasedamagetargetnumber;
                }
                if (this.object.rollType === 'readIntentions') {
                    this.object.difficulty -= charm.system.diceroller.opposedbonuses.guile;
                }
                if (this.object.rollType === 'social') {
                    this.object.difficulty -= charm.system.diceroller.opposedbonuses.resolve;
                }
                this.render();
            }
            this.render();
        });

        html.find('#done-adding-charms').click(ev => {
            this.object.addingCharms = false;
            this.object.showSpecialAttacks = false;
            this.render();
        });

        html.on("change", ".update-roller", ev => {
            this.object.diceCap = this._getDiceCap();
            this.render();
        });

        html.on("change", ".update-specialties", ev => {
            this._updateSpecialtyList();
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
        else if (this.object.rollType === 'craft' || this.object.rollType === 'working') {
            await this._completeCraftProject();
        }
        else {
            await this._abilityRoll();
        }
    }

    async _updateSpecialtyList() {
        if (this.object.rollType === 'martialArt') {
            this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.system.ability === 'martialarts');
        }
        else if (this.object.rollType === 'craftAbilityRoll') {
            this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.system.ability === 'craft');
        }
        else {
            this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.system.ability === this.object.ability);
        }
    }

    async _baseAbilityDieRoll() {
        let dice = 0;

        if (this.object.rollType === 'base') {
            dice = this.object.dice;
        }
        else {
            const data = this.actor.system;
            const actorData = duplicate(this.actor);
            if (this.actor.type === 'character') {
                if (data.attributes[this.object.attribute]) {
                    dice += data.attributes[this.object.attribute]?.value || 0;
                }
                if (this.object.rollType === 'martialArt') {
                    dice += this.actor.martialarts.find(x => x._id === this.object.martialArtId).system.points;
                }
                else if (this.object.rollType === 'craftAbilityRoll') {
                    dice += this.actor.crafts.find(x => x._id === this.object.craftId).system.points;
                }
                else {
                    if (this.object.ability === 'willpower') {
                        dice += this.actor.system.willpower.max;
                    }
                    else if (data.abilities[this.object.ability]) {
                        dice += data.abilities[this.object.ability]?.value || 0;
                    }
                }
            }
            else if (this.actor.type === 'npc' && !this._isAttackRoll()) {
                if (this.object.rollType === 'action') {
                    dice = this.actor.actions.find(x => x._id === this.object.actionId).system.value;
                }
                else if (this.object.pool === 'willpower') {
                    dice = this.actor.system.willpower.max;
                } else {
                    dice = data.pools[this.object.pool].value;
                }
            }

            if (this.object.armorPenalty) {
                for (let armor of this.actor.armor) {
                    if (armor.system.equipped) {
                        dice = dice - Math.abs(armor.system.penalty);
                    }
                }
            }
            if (this.object.willpower) {
                this.object.successModifier++;
                actorData.system.willpower.value--;
            }
            if (this.object.stunt !== 'none') {
                dice += 2;
            }
            if (this.object.stunt === 'two') {
                if (actorData.system.willpower.value < actorData.system.willpower.max) {
                    actorData.system.willpower.value++;
                }
                this.object.successModifier++;
            }
            if (this.object.stunt === 'three') {
                actorData.system.willpower.value += 2;
                this.object.successModifier += 2;
            }
            if (this.object.diceToSuccesses > 0) {
                this.object.successModifier += Math.min(dice, this.object.diceToSuccesses);
                dice = Math.max(0, dice - this.object.diceToSuccesses);
            }
            if (this.object.woundPenalty && data.health.penalty !== 'inc') {
                if (data.warstrider.equipped) {
                    dice -= data.warstrider.health.penalty;
                }
                else {
                    dice -= Math.max(0, data.health.penalty - data.health.penaltymod);
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
            this.actor.update(actorData);
        }

        if (this._isAttackRoll()) {
            dice += this.object.accuracy || 0;
            if (this.object.weaponType !== 'melee' && (this.actor.type === 'npc' || this.object.attackType === 'withering')) {
                if (this.object.range !== 'short') {
                    dice += this._getRangedAccuracy();
                }
            }
        }

        let rerollString = '';
        let rerolls = [];

        for (var rerollValue in this.object.reroll) {
            if (this.object.reroll[rerollValue].status) {
                if (this.object.reroll[rerollValue].number < this.object.targetNumber) {
                    rerollString += `rr${this.object.reroll[rerollValue].number}`;
                }
                else {
                    rerollString += `x${this.object.reroll[rerollValue].number}`;
                }
                rerolls.push(this.object.reroll[rerollValue].number);
            }
        }

        let diceString = `${dice}d10${rerollString}${this.object.rerollFailed ? `r<${this.object.targetNumber}` : ""}cs>=${this.object.targetNumber}`;
        if (this.object.rollTwice) {
            diceString = `{${dice}d10${rerollString}${this.object.rerollFailed ? `r<${this.object.targetNumber}` : ""}cs>=${this.object.targetNumber}, ${dice}d10${rerollString}${this.object.rerollFailed ? `r<${this.object.targetNumber}` : ""}cs>=${this.object.targetNumber}}kh`;
        }
        let roll = new Roll(diceString).evaluate({ async: false });
        let diceRoll = roll.dice[0].results;
        let total = roll.total;
        var failedDice = Math.min(dice - roll.total, this.object.rerollNumber);
        for (let dice of diceRoll) {
            if (dice.result >= this.object.doubleSuccess && dice.result >= this.object.targetNumber) {
                total++;
            }
        }
        if (this.object.rollTwice) {
            var secondTotal = roll.dice[1].total;
            diceRoll = diceRoll.concat(roll.dice[1].results);
            for (let dice of roll.dice[1].results) {
                if (dice.result >= this.object.doubleSuccess && dice.result >= this.object.targetNumber) {
                    secondTotal++;
                }
            }
            if (secondTotal > total) {
                total = secondTotal;
                failedDice = Math.min(dice - roll.dice[1].total, this.object.rerollNumber);
            };
        }

        let rerolledDice = 0;
        while (failedDice !== 0 && (rerolledDice < this.object.rerollNumber)) {
            rerolledDice += failedDice;
            var failedDiceRoll = new Roll(`${failedDice}d10cs>=${this.object.targetNumber}`).evaluate({ async: false });
            failedDice = Math.min(failedDice - failedDiceRoll.total, (this.object.rerollNumber - rerolledDice));
            diceRoll = diceRoll.concat(failedDiceRoll.dice[0].results);
            for (let dice of failedDiceRoll.dice[0].results) {
                if (dice.result >= this.object.doubleSuccess && dice.result >= this.object.targetNumber) {
                    total++;
                }
            }
            total += failedDiceRoll.total;
        }
        total += this.object.successModifier;
        if (this.object.craft.divineInsperationTechnique || this.object.craft.holisticMiracleUnderstanding) {
            let newCraftDice = Math.floor(total / 3);
            let remainder = total % 3;
            while (newCraftDice > 0) {
                var rollSuccessTotal = 0;
                var craftDiceRoll = new Roll(`${newCraftDice}d10cs>=${this.object.targetNumber}`).evaluate({ async: false });
                diceRoll = diceRoll.concat(craftDiceRoll.dice[0].results);
                for (let dice of craftDiceRoll.dice[0].results) {
                    if (dice.result >= this.object.doubleSuccess && dice.result >= this.object.targetNumber) {
                        total++;
                        rollSuccessTotal++;
                    }
                }
                rollSuccessTotal += craftDiceRoll.total;
                total += craftDiceRoll.total;
                newCraftDice = Math.floor((rollSuccessTotal + remainder) / 3);
                remainder = rollSuccessTotal % 3;
                if (this.object.craft.holisticMiracleUnderstanding) {
                    newCraftDice * 4;
                }
            }
        }

        let getDice = "";
        for (let dice of diceRoll.sort((a, b) => b.result - a.result)) {
            if (dice.result >= this.object.doubleSuccess && dice.result >= this.object.targetNumber) {
                getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= this.object.targetNumber) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.rerolled) { getDice += `<li class="roll die d10 rerolled">${dice.result}</li>`; }
            else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
        }


        this.object.dice = dice;
        this.object.roll = roll;
        this.object.getDice = getDice;
        this.object.total = total;
        if (this.object.rollType !== 'base') {
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
        if (this.actor.type === "npc") {
            if (this.object.ability === "archery") {
                this.object.ability = "primary";
            }
        }
        if (this.object.attribute == null) {
            this.object.attribute = this.actor.type === "npc" ? null : this._getHighestAttribute();
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
            if (this.object.rollType === "grappleControl") {
                const actorData = duplicate(this.actor);
                actorData.system.grapplecontrolrounds.value += threshholdSuccesses;
                this.actor.update(actorData);
            }
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
                let combatant = combat.combatants.find(c => c.actorId == this.actor.id);
                if (combatant) {
                    combat.setInitiative(combatant.id, this.object.total + 3);
                }
            }
        }
        if (this.object.rollType === "sorcery") {
            const actorData = duplicate(this.actor);
            actorData.system.sorcery.motes += this.object.total;
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
                this._addAttackEffects();
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
            if (this.object.thereshholdSuccesses < 0) {
                this._addAttackEffects();
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
        if (this.object.rollType === 'damage' && this.object.attackType === 'withering' && game.settings.get("exaltedthird", "defenseOnDamage")) {
            dice += this.object.attackSuccesses;
            dice -= this.object.defense;
        }
        var damageResults = ``;

        if (this._damageRollType('withering') || this.object.damage.threshholdToDamage) {
            dice += this.object.thereshholdSuccesses;
            baseDamage = dice;
        }

        if (this._damageRollType('decisive')) {
            if (this.object.target && game.combat) {
                if (this.object.targetCombatant !== null) {
                    if (this.object.targetCombatant.actor.type === 'npc' || this.object.targetCombatant.actor.system.battlegroup) {
                        dice += Math.floor(dice / 4);
                        baseDamage = dice;
                    }
                }
            }
        }
        else if (this._damageRollType('withering')) {
            dice -= Math.max(0, this.object.soak - this.object.damage.ignoreSoak);
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
                if (this.object.damage.reroll[rerollValue].number < this.object.damage.targetNumber) {
                    rerollString += `rr${this.object.damage.reroll[rerollValue].number}`;
                }
                else {
                    rerollString += `x${this.object.damage.reroll[rerollValue].number}`;
                }
                rerolls.push(this.object.damage.reroll[rerollValue].number);
            }
        }

        let roll = new Roll(`${dice}d10${rerollString}cs>=${this.object.damage.targetNumber}`).evaluate({ async: false });
        let diceRoll = roll.dice[0].results;
        let getDice = "";
        let soakResult = ``;
        let bonus = 0;
        this.object.finalDamageDice = dice;

        for (let dice of diceRoll.sort((a, b) => b.result - a.result)) {
            if (dice.result >= this.object.damage.doubleSuccess && dice.result >= this.object.damage.targetNumber) {
                bonus++;
                getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= this.object.damage.targetNumber) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.rerolled) { getDice += `<li class="roll die d10 rerolled">${dice.result}</li>`; }
            else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
        }

        let total = roll.total;
        if (bonus) {
            total += bonus;
        }
        total += this.object.damage.damageSuccessModifier;
        if (this.object.damage.doubleRolledDamage) {
            total *= 2;
        }

        let typeSpecificResults = ``;

        if (this._damageRollType('decisive')) {
            typeSpecificResults = `<h4 class="dice-total">${total} ${this.object.damage.type.capitalize()} Damage!</h4>`;
            if (this.object.damage.resetInit) {
                this.object.characterInitiative = 3;
            }
            if (this._useLegendarySize('decisive')) {
                typeSpecificResults = typeSpecificResults + `<h4 class="dice-formula">Legendary Size</h4><h4 class="dice-formula">Damage capped at ${3 + this.actor.system.attributes.strength.value} + Charm damage levels</h4>`;
                total = Math.min(total, 3 + this.actor.system.attributes.strength.value);
            }
            this.dealHealthDamage(total);
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
                if (this.object.targetCombatant && this.object.targetCombatant.initiative !== null) {
                    this.object.characterInitiative++;
                    if (this.object.targetCombatant.actor.type !== 'npc' || this.object.targetCombatant.actor.system.battlegroup === false) {
                        let newInitative = this.object.targetCombatant.initiative;
                        newInitative -= total;
                        this.object.characterInitiative += total;
                        if ((newInitative <= 0 && this.object.targetCombatant.initiative > 0)) {
                            if (this._useLegendarySize('withering')) {
                                newInitative = 1;
                            }
                            else {
                                this.object.crashed = true;
                                this.object.characterInitiative += 5;
                                targetResults = `<h4 class="dice-total">Target Crashed!</h4>`;
                            }
                        }
                        if (game.user.isGM) {
                            game.combat.setInitiative(this.object.targetCombatant.id, newInitative);
                        }
                        else {
                            game.socket.emit('system.exaltedthird', {
                                type: 'updateInitiative',
                                id: this.object.targetCombatant.id,
                                data: newInitative,
                            });
                        }

                    }
                    else if (this.object.targetCombatant.actor.system.battlegroup) {
                        var sizeDamaged = this.dealHealthDamage(total, true);
                        if (sizeDamaged) {
                            targetResults = `<h4 class="dice-total">Magnitude Filled!</h4>`;
                            this.object.characterInitiative += 5;
                        }
                    }
                }
            }
            soakResult = `<h4 class="dice-formula">${this.object.soak} Soak! (Ignoring ${this.object.damage.ignoreSoak})</h4><h4 class="dice-formula">${this.object.overwhelming} Overwhelming!</h4>`;
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

        if (this.actor.type !== 'npc' || this.actor.system.battlegroup === false) {
            let combat = game.combat;
            if (this.object.target && combat) {
                let combatant = combat.combatants.find(c => c.actorId == this.actor.id);
                if (combatant && combatant.initiative != null) {
                    combat.setInitiative(combatant.id, this.object.characterInitiative);
                }
            }
        }
        else if (this.actor.system.battlegroup) {
            let combat = game.combat;
            if (this.object.target) {
                let combatant = combat.combatants.find(c => c.actorId == this.object.target.actor.id);
                if (combatant && combatant.initiative != null && combatant.initiative <= 0) {
                    this.dealHealthDamage(total);
                }
            }
        }
        this.attackSequence();
        this._addAttackEffects();
    }

    async _addAttackEffects() {
        var knockdownTriggered = false;
        var onslaughtTriggered = false;
        if (this.object.thereshholdSuccesses >= 0 && this.object.triggerKnockdown && this.object.target) {
            if (game.user.isGM) {
                const isProne = this.object.target.actor.effects.find(i => i.label == "Prone");
                if (!isProne) {
                    const newProneEffect = CONFIG.statusEffects.find(e => e.id === 'prone');
                    await this.object.target.toggleEffect(newProneEffect);
                }
            }
            else {
                knockdownTriggered = true;
            }
        }
        if(this.object.target) {
            if (game.settings.get("exaltedthird", "calculateOnslaught")) {
                if (!this._useLegendarySize('onslaught')) {
                    if (game.user.isGM) {
                        const onslaught = this.object.target.actor.effects.find(i => i.label == "Onslaught");
                        if (onslaught) {
                            let changes = duplicate(onslaught.changes);
                            changes[0].value = changes[0].value - 1;
                            changes[1].value = changes[1].value - 1;
                            onslaught.update({ changes });
                        }
                        else {
                            await this.object.target.actor.createEmbeddedDocuments('ActiveEffect', [{
                                label: 'Onslaught',
                                icon: 'systems/exaltedthird/assets/icons/surrounded-shield.svg',
                                origin: this.object.target.actor.uuid,
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
                    else {
                        onslaughtTriggered = true;
                        game.socket.emit('system.exaltedthird', {
                            type: 'addOnslaught',
                            id: this.object.target.id,
                            data: { 'knockdownTriggered': knockdownTriggered },
                        });
                    }
                }
            }
            if (!onslaughtTriggered && knockdownTriggered) {
                game.socket.emit('system.exaltedthird', {
                    type: 'addKnockdown',
                    id: this.object.target.id,
                    data: null,
                });
            }
            if (this.object.target.actor.system.grapplecontrolrounds.value > 0) {
                const targetActorData = duplicate(this.object.target.actor);
                targetActorData.system.grapplecontrolrounds.value = Math.max(0, targetActorData.system.grapplecontrolrounds.value - (this.object.thereshholdSuccesses >= 0 ? 2: 1));
                this.object.target.actor.update(targetActorData);
            }
        }
        if (this.object.triggerSelfDefensePenalty > 0) {
            const existingPenalty = this.actor.effects.find(i => i.label == "Defense Penalty");
            if (existingPenalty) {
                let changes = duplicate(existingPenalty.changes);
                changes[0].value = changes[0].value - this.object.triggerSelfDefensePenalty;
                changes[1].value = changes[1].value - this.object.triggerSelfDefensePenalty;
                existingPenalty.update({ changes });
            }
            else {
                this.actor.createEmbeddedDocuments('ActiveEffect', [{
                    label: 'Defense Penalty',
                    icon: 'systems/exaltedthird/assets/icons/slashed-shield.svg',
                    origin: this.actor.uuid,
                    disabled: false,
                    duration: {
                        rounds: 10,
                    },
                    "changes": [
                        {
                            "key": "data.evasion.value",
                            "value": (this.object.triggerSelfDefensePenalty * -1),
                            "mode": 2
                        },
                        {
                            "key": "data.parry.value",
                            "value": (this.object.triggerSelfDefensePenalty * -1),
                            "mode": 2
                        }
                    ]
                }]);
            }
        }
    }

    dealHealthDamage(characterDamage, targetBattlegroup = false) {
        if (this.object.target && game.combat && game.settings.get("exaltedthird", "autoDecisiveDamage") && characterDamage > 0) {
            let totalHealth = 0;
            const targetActorData = duplicate(this.object.target.actor);
            for (let [key, health_level] of Object.entries(targetActorData.system.health.levels)) {
                totalHealth += health_level.value;
            }
            if (this.object.damage.type === 'bashing') {
                targetActorData.system.health.bashing = Math.min(totalHealth - targetActorData.system.health.aggravated - targetActorData.system.health.lethal, targetActorData.system.health.bashing + characterDamage);
            }
            if (this.object.damage.type === 'lethal') {
                targetActorData.system.health.lethal = Math.min(totalHealth - targetActorData.system.health.bashing - targetActorData.system.health.aggravated, targetActorData.system.health.lethal + characterDamage);
            }
            if (this.object.damage.type === 'aggravated') {
                targetActorData.system.health.aggravated = Math.min(totalHealth - targetActorData.system.health.bashing - targetActorData.system.health.lethal, targetActorData.system.health.aggravated + characterDamage);
            }
            if (game.user.isGM) {
                this.object.target.actor.update(targetActorData);
            }
            else {
                game.socket.emit('system.exaltedthird', {
                    type: 'healthDamage',
                    id: this.object.target.id,
                    data: targetActorData.system.health,
                });
            }
            if (this._damageRollType('withering') && targetBattlegroup && (totalHealth - targetActorData.system.health.bashing - targetActorData.system.health.lethal - targetActorData.system.health.aggravated) <= 0) {
                return true;
            }
        }
        return false;
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
                    this.object.finished = true;
                    resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Botch</h4>`;
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
        if (this.object.rollType === 'craft') {
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
                actorData.system.craft.experience.silver.value += silverXPGained;
                actorData.system.craft.experience.gold.value += goldXPGained;
                actorData.system.craft.experience.white.value += whiteXPGained;
                this.actor.update(actorData);
            }
        }
        if (this.object.rollType === 'working') {
            if (craftFailed) {
                projectStatus = `<h4 class="dice-total">Working Failed</h4>`;
            }
            if (craftSuccess) {
                projectStatus = `<h4 class="dice-total">Working Success</h4>`;
            }
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
        if (this.object.weaponTags["flame"] && this.object.range === 'close') {
            accuracyModifier += 2;
        }
        return accuracyModifier;
    }

    _useLegendarySize(effectType) {
        if (this.object.target) {
            if (effectType === 'onslaught') {
                return (this.object.target.actor.system.legendarysize && this.object.target.actor.system.warstrider.equipped) && !this.object.isMagic && !this.actor.system.legendarysize && !this.actor.system.warstrider.equipped;
            }
            if (effectType === 'withering') {
                return (this.object.target.actor.system.legendarysize || this.object.target.actor.system.warstrider.equipped) && !this.actor.system.legendarysize && !this.actor.system.warstrider.equipped && this.object.finalDamageDice < 10;
            }
            if (effectType === 'decisive') {
                return (this.object.target.actor.system.legendarysize || this.object.target.actor.system.warstrider.equipped) && !this.actor.system.legendarysize && !this.actor.system.warstrider.equipped;
            }
        }
        return false;
    }

    _getDiceCap() {
        if (this.object.rollType !== "base") {
            if (this.actor.type === "character" && this.actor.system.abilities[this.object.ability] && this.actor.system.attributes[this.object.attribute]) {
                if (this.actor.system.details.exalt === "solar" || this.actor.system.details.exalt === "abyssal") {
                    return this.actor.system.abilities[this.object.ability].value + this.actor.system.attributes[this.object.attribute].value;
                }
                if (this.actor.system.details.exalt === "dragonblooded") {
                    return this.actor.system.abilities[this.object.ability].value + (this.object.specialty ? 1 : 0);
                }
                if (this.actor.system.details.exalt === "lunar") {
                    return `${this.actor.system.attributes[this.object.attribute].value} - ${this.actor.system.attributes[this.object.attribute].value + 5}`;
                }
                if (this.actor.system.details.exalt === "sidereal") {
                    var baseSidCap = Math.min(5, Math.max(3, this.actor.system.essence.value));
                    var tnChange = "";
                    if (this.actor.system.abilities[this.object.ability].value === 5) {
                        if (this.actor.system.essence.value >= 3) {
                            tnChange = " - TN -3";
                        }
                        else {
                            tnChange = " - TN -2";
                        }
                    }
                    else if (this.actor.system.abilities[this.object.ability].value >= 3) {
                        tnChange = " - TN -1";
                    }
                    return `${baseSidCap}${tnChange}`;
                }
                if (this.actor.system.details.exalt === "dreamsouled") {
                    return `${this.actor.system.abilities[this.object.ability].value} or ${Math.min(10, this.actor.system.abilities[this.object.ability].value + this.actor.system.essence.value)} when upholding ideal`;
                }
                if (this.actor.system.details.exalt === "umbral") {
                    return `${Math.min(10, this.actor.system.abilities[this.object.ability].value + this.actor.system.details.penumbra.value)}`;
                }
                if (this.actor.system.details.exalt === "liminal") {
                    if (this.actor.system.anima.value > 1) {
                        return `${this.actor.system.attributes[this.object.attribute].value + this.actor.system.essence.value}`;
                    }
                    else {
                        return `${this.actor.system.attributes[this.object.attribute].value}`;
                    }
                }
                if (this.actor.system.details.caste.toLowerCase() === "architect") {
                    return `${this.actor.system.attributes[this.object.attribute].value} or ${this.actor.system.attributes[this.object.attribute].value + this.actor.system.essence.value} in cities`;
                }
                if (this.actor.system.details.caste.toLowerCase() === "janest" || this.actor.system.details.caste.toLowerCase() === 'strawmaiden') {
                    return `${this.actor.system.attributes[this.object.attribute].value} + [Relevant of Athletics, Awareness, Presence, Resistance, or Survival]`;
                }
                if (this.actor.system.details.caste.toLowerCase() === "sovereign") {
                    return Math.min(Math.max(this.actor.system.essence.value, 3) + this.actor.system.anima.value, 10);
                }
            }
            else if (this.actor.system.creaturetype === 'exalt' && this.actor.system.pools[this.object.pool]) {
                var dicePool = this.actor.system.pools[this.object.pool].value;
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
                if (this.actor.system.details.exalt === "sidereal") {
                    return this.actor.system.essence.value;
                }
                if (this.actor.system.details.exalt === "solar" || this.actor.system.details.exalt === "abyssal") {
                    diceMap = {
                        'zero': 0,
                        'two': 2,
                        'three': 5,
                        'seven': 7,
                        'eleven': 10,
                    };
                }
                if (this.actor.system.details.exalt === "dragonblooded") {
                    diceMap = {
                        'zero': 0,
                        'two': 0,
                        'three': 2,
                        'seven': 4,
                        'eleven': 6,
                    };
                }
                if (this.actor.system.details.exalt === "lunar") {
                    diceMap = {
                        'zero': 0,
                        'two': 1,
                        'three': 2,
                        'seven': 4,
                        'eleven': 5,
                    };
                    if (diceTier === 'two') {
                        return 1;
                    }
                    return `${diceMap[diceTier]}, ${diceTier === 'seven' ? (diceMap[diceTier] * 2) - 1 : diceMap[diceTier] * 2}`;
                }
                if (this.actor.system.details.exalt === "liminal") {
                    diceMap = {
                        'zero': 0,
                        'two': 1,
                        'three': 2,
                        'seven': 4,
                        'eleven': 5,
                    };
                }
                return diceMap[diceTier];
            }
        }
        return "";
    }

    _setBattlegroupBonuses() {
        this.object.diceModifier += (this.actor.system.size.value + this.actor.system.might.value);
        if (this._damageRollType('withering')) {
            this.object.damage.damageDice += (this.actor.system.size.value + this.actor.system.might.value);
        }
    }

    _getHighestAttribute() {
        var highestAttributeNumber = 0;
        var highestAttribute = "strength";
        for (let [name, attribute] of Object.entries(this.actor.system.attributes)) {
            if (attribute.value > highestAttributeNumber) {
                highestAttributeNumber = attribute.value;
                highestAttribute = name;
            }
        }
        return highestAttribute;
    }

    async _spendMotes() {
        const actorData = duplicate(this.actor);
        var newLevel = actorData.system.anima.level;
        var newValue = actorData.system.anima.value;
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
        if (actorData.system.settings.charmmotepool === 'personal') {
            var remainingPersonal = actorData.system.motes.personal.value - totalMotes;
            if (remainingPersonal < 0) {
                spentPersonal = totalMotes + remainingPersonal;
                spentPeripheral = Math.min(actorData.system.motes.peripheral.value, Math.abs(remainingPersonal));
            }
            else {
                spentPersonal = totalMotes;
            }
        }
        else {
            var remainingPeripheral = actorData.system.motes.peripheral.value - totalMotes;
            if (remainingPeripheral < 0) {
                spentPeripheral = totalMotes + remainingPeripheral;
                spentPersonal = Math.min(actorData.system.motes.personal.value, Math.abs(remainingPeripheral));
            }
            else {
                spentPeripheral = totalMotes;
            }
        }
        actorData.system.motes.peripheral.value = Math.max(0, actorData.system.motes.peripheral.value - spentPeripheral);
        actorData.system.motes.personal.value = Math.max(0, actorData.system.motes.personal.value - spentPersonal);

        if ((spentPeripheral - this.object.cost.muteMotes) > 4) {
            for (var i = 0; i < Math.floor((spentPeripheral - this.object.cost.muteMotes) / 5); i++) {
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

        actorData.system.anima.level = newLevel;
        actorData.system.anima.value = newValue;

        actorData.system.willpower.value = Math.max(0, actorData.system.willpower.value - this.object.cost.willpower);
        if (this.object.cost.initiative > 0) {
            let combat = game.combat;
            if (combat) {
                let combatant = combat.combatants.find(c => c.actorId == this.actor.id);
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
            actorData.system.craft.experience.silver.value = Math.max(0, actorData.system.craft.experience.silver.value - this.object.cost.silverxp);
            actorData.system.craft.experience.gold.value = Math.max(0, actorData.system.craft.experience.gold.value - this.object.cost.goldxp);
            actorData.system.craft.experience.white.value = Math.max(0, actorData.system.craft.experience.white.value - this.object.cost.whitexp);
        }
        if (actorData.system.details.aura === this.object.cost.aura || this.object.cost.aura === 'any') {
            actorData.system.details.aura = "none";
        }
        if (this.object.cost.initiative > 0) {
            let combat = game.combat;
            if (combat) {
                let combatant = combat.combatants.find(c => c.actorId == this.actor.id);
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
        for (let [key, health_level] of Object.entries(actorData.system.health.levels)) {
            totalHealth += health_level.value;
        }
        if (this.object.cost.healthbashing > 0) {
            actorData.system.health.bashing = Math.min(totalHealth - actorData.system.health.aggravated - actorData.system.health.lethal, actorData.system.health.bashing + this.object.cost.healthbashing);
        }
        if (this.object.cost.healthlethal > 0) {
            actorData.system.health.lethal = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.aggravated, actorData.system.health.lethal + this.object.cost.healthlethal);
        }
        if (this.object.cost.healthaggravated > 0) {
            actorData.system.health.aggravated = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.lethal, actorData.system.health.aggravated + this.object.cost.healthaggravated);
        }
        if (this.actor.system.anima.value !== newValue) {
            animaTokenMagic(this.actor, newValue);
        }
        this.actor.update(actorData);
    }

    attackSequence() {
        if (this.object.target && this.actor.token && game.settings.get("exaltedthird", "attackEffects")) {
            var actorToken = canvas.tokens.placeables.filter(x => x.id === this.actor.token.id)[0];
            if (this.object.attackEffectPreset !== 'none') {
                let effectsMap = {
                    'arrow': 'jb2a.arrow.physical.white.01.05ft',
                    'bite': 'jb2a.bite.400px.red',
                    'brawl': 'jb2a.flurry_of_blows.physical.blue',
                    'claws': 'jb2a.claws.400px.red',
                    'fireball': 'jb2a.fireball.beam.orange',
                    'firebreath': 'jb2a.breath_weapons.fire.line.orange',
                    'flamepiece': 'jb2a.bullet.01.orange.05ft',
                    'glaive': 'jb2a.glaive.melee.01.white.5',
                    'goremaul': 'jb2a.maul.melee.standard.white',
                    'greatsaxe': 'jb2a.greataxe.melee.standard.white',
                    'greatsword': 'jb2a.greatsword.melee.standard.white',
                    'handaxe': 'jb2a.handaxe.melee.standard.white',
                    'lightning': 'jb2a.chain_lightning.primary.blue.05ft',
                    'quarterstaff': 'jb2a.quarterstaff.melee.01.white.3',
                    'rapier': 'jb2a.rapier.melee.01.white.4',
                    'scimitar': 'jb2a.scimitar.melee.01.white.0',
                    'shortsword': 'jb2a.shortsword.melee.01.white.0',
                    'spear': 'jb2a.spear.melee.01.white.2',
                    'sword': 'jb2a.sword.melee.01.white.4',
                    'throwdagger': 'jb2a.dagger.throw.01.white.15ft',
                }

                switch (this.object.attackEffectPreset) {
                    case 'fireball':
                        new Sequence()
                            // .effect()
                            // .file('animated-spell-effects-cartoon.fire.118')
                            // .atLocation(actorToken)
                            // .delay(300)
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .effect()
                            .file("jb2a.fireball.explosion.orange")
                            .atLocation(this.object.target)
                            .delay(2100)
                            .effect()
                            .file("jb2a.ground_cracks.orange.01")
                            .atLocation(this.object.target)
                            .belowTokens()
                            .scaleIn(0.5, 150, { ease: "easeOutExpo" })
                            .duration(5000)
                            .fadeOut(3250, { ease: "easeInSine" })
                            .name("Fireball_Impact")
                            .delay(2300)
                            .waitUntilFinished(-3250)
                            .effect()
                            .file("jb2a.impact.ground_crack.still_frame.01")
                            .atLocation(this.object.target)
                            .belowTokens()
                            .fadeIn(300, { ease: "easeInSine" })
                            .play();
                        break;
                    case 'flamepiece':
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .waitUntilFinished(-500)
                            .effect()
                            .file("jb2a.impact.010.orange")
                            .atLocation(this.object.target)
                            .play()
                        break;
                    case 'goremaul':
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .waitUntilFinished(-1100)
                            .effect()
                            .file("jb2a.impact.ground_crack.orange")
                            .atLocation(this.object.target)
                            .scale(0.5)
                            .belowTokens()
                            .play();
                        break;
                    case 'none':
                        break;
                    default:
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .play()
                        break;
                }
            }
            else if (this.object.attackEffect) {
                new Sequence()
                    .effect()
                    .file(this.object.attackEffect)
                    .atLocation(actorToken)
                    .stretchTo(this.object.target)
                    .play()
            }
        }
    }
}

export async function animaTokenMagic(actor, newAnimaValue) {
    if (game.settings.get("exaltedthird", "animaTokenMagic") && actor.token) {
        let effectColor = Number(`0x${actor.system.details.animacolor.replace('#', '')}`);
        var actorToken = canvas.tokens.placeables.filter(x => x.id === actor.token.id)[0];

        let sovereign =
            [{
                filterType: "xfire",
                filterId: "myChromaticXFire",
                time: 0,
                blend: 2,
                amplitude: 1.1,
                dispersion: 0,
                chromatic: true,
                scaleX: 1,
                scaleY: 1,
                inlay: false,
                animated:
                {
                    time:
                    {
                        active: true,
                        speed: -0.0015,
                        animType: "move"
                    }
                }
            }];

        let glowing =
            [{
                filterType: "glow",
                filterId: "superSpookyGlow",
                outerStrength: 4,
                innerStrength: 0,
                color: effectColor,
                quality: 0.5,
                padding: 10,
                animated:
                {
                    color:
                    {
                        active: true,
                        loopDuration: 3000,
                        animType: "colorOscillation",
                        val1: 0xFFFFFF,
                        val2: effectColor
                    }
                }
            }];
        let burning =
            [
                {
                    filterType: "zapshadow",
                    filterId: "myPureFireShadow",
                    alphaTolerance: 0.50
                },
                {
                    filterType: "xglow",
                    filterId: "myPureFireAura",
                    auraType: 2,
                    color: effectColor,
                    thickness: 9.8,
                    scale: 4.,
                    time: 0,
                    auraIntensity: 2,
                    subAuraIntensity: 1.5,
                    threshold: 0.40,
                    discard: true,
                    animated:
                    {
                        time:
                        {
                            active: true,
                            speed: 0.0027,
                            animType: "move"
                        },
                        thickness:
                        {
                            active: true,
                            loopDuration: 3000,
                            animType: "cosOscillation",
                            val1: 2,
                            val2: 5
                        }
                    }
                }];

        let bonfire =
            [{
                filterType: "zapshadow",
                filterId: "myZap",
                alphaTolerance: 0.45
            }, {
                filterType: "field",
                filterId: "myLavaRing",
                shieldType: 6,
                gridPadding: 1.25,
                color: effectColor,
                time: 0,
                blend: 14,
                intensity: 1,
                lightAlpha: 0,
                lightSize: 0.7,
                scale: 1,
                radius: 1,
                chromatic: false,
                discardThreshold: 0.30,
                hideRadius: 0.95,
                alphaDiscard: true,
                animated:
                {
                    time:
                    {
                        active: true,
                        speed: 0.0015,
                        animType: "move"
                    },
                    radius:
                    {
                        active: true,
                        loopDuration: 6000,
                        animType: "cosOscillation",
                        val1: 1,
                        val2: 0.8
                    },
                    hideRadius:
                    {
                        active: true,
                        loopDuration: 3000,
                        animType: "cosOscillation",
                        val1: 0.75,
                        val2: 0.4
                    }
                }
            }, {
                filterType: "xglow",
                filterId: "myBurningAura",
                auraType: 2,
                color: effectColor,
                thickness: 9.8,
                scale: 1.,
                time: 0,
                auraIntensity: 2,
                subAuraIntensity: 1,
                threshold: 0.30,
                discard: true,
                zOrder: 3000,
                animated:
                {
                    time:
                    {
                        active: true,
                        speed: 0.0027,
                        animType: "move"
                    },
                    thickness:
                    {
                        active: true,
                        loopDuration: 600,
                        animType: "cosOscillation",
                        val1: 4,
                        val2: 8
                    }
                }
            }];

        if (actorToken) {
            await TokenMagic.deleteFilters(actorToken);
            if (newAnimaValue > 0) {
                if (newAnimaValue === 1) {
                    await TokenMagic.addUpdateFilters(actorToken, glowing);
                }
                else if (newAnimaValue === 2) {
                    await TokenMagic.addUpdateFilters(actorToken, burning);
                    if (actorToken.actor.system.details.caste.toLowerCase() === "sovereign") {
                        await TokenMagic.addUpdateFilters(actorToken, sovereign);
                    }
                }
                else {
                    await TokenMagic.addUpdateFilters(actorToken, bonfire);
                    if (actorToken.actor.system.details.caste.toLowerCase() === "sovereign") {
                        await TokenMagic.addUpdateFilters(actorToken, sovereign);
                    }
                }
            }
        }
    }
}
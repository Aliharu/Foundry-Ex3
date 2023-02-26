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
            this.object.craftType = data.craftType || 0;
            this.object.craftRating = data.craftRating || 0;
            this.object.splitAttack = false;
            this.object.rollType = data.rollType;
            this.object.attackType = data.attackType || data.rollType || 'withering';
            if (this.object.rollType === 'damage' || this.object.rollType === 'accuracy') {
                this.object.attackType = 'withering';
            }
            if (data.rollType === 'withering-split') {
                this.object.rollType = 'accuracy';
                this.object.splitAttack = true;
                this.object.attackType = 'withering';
            }
            else if (data.rollType === 'decisive-split') {
                this.object.rollType = 'accuracy';
                this.object.splitAttack = true;
                this.object.attackType = 'decisive';
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
            };
            this.object.restore = {
                motes: 0,
                willpower: 0,
                health: 0,
                initiative: 0
            };
            this.object.showPool = !this._isAttackRoll();
            this.object.showWithering = this.object.attackType === 'withering' || this.object.rollType === 'damage';
            this.object.hasDifficulty = (['ability', 'grappleControl', 'readIntentions', 'social', 'craft', 'working', 'rout', 'craftAbilityRoll', 'martialArt', 'rush', 'disengage'].indexOf(data.rollType) !== -1);
            this.object.stunt = "none";
            this.object.goalNumber = 0;
            this.object.woundPenalty = this.object.rollType === 'base' ? false : true;
            this.object.intervals = 0;
            this.object.difficulty = data.difficulty || 0;
            this.object.isMagic = data.isMagic || false;
            this.object.attackEffectPreset = data.attackEffectPreset || 'none';
            this.object.attackEffect = data.attackEffect || '';
            this.object.diceModifier = 0;
            this.object.charmDiceAdded = 0;
            this.object.triggerSelfDefensePenalty = 0;
            this.object.triggerKnockdown = false;
            this.object.macroMessages = '';

            this.object.overwhelming = data.overwhelming || 0;
            this.object.soak = 0;
            this.object.armoredSoak = 0;
            this.object.naturalSoak = 0;
            this.object.defense = 0;
            this.object.characterInitiative = 0;
            this.object.gambitDifficulty = 0;
            this.object.gambit = 'none';
            this.object.weaponTags = {};

            this.object.weaponType = data.weaponType || 'melee';
            this.object.range = 'close';

            this.object.isFlurry = false;
            this.object.armorPenalty = false;
            this.object.willpower = false;

            this.object.supportedIntimacy = 0;
            this.object.opposedIntimacy = 0;
            this.object.applyAppearance = false;
            this.object.appearanceBonus = 0;

            this.object.doubleSuccess = 10;
            this.object.rerollFailed = false;
            this.object.rollTwice = false;
            this.object.targetNumber = 7;
            this.object.rerollNumber = 0;
            this.object.attackSuccesses = 0;

            this.object.reroll = {
                one: { status: false, number: 1, cap: 0 },
                two: { status: false, number: 2, cap: 0 },
                three: { status: false, number: 3, cap: 0 },
                four: { status: false, number: 4, cap: 0 },
                five: { status: false, number: 5, cap: 0 },
                six: { status: false, number: 6, cap: 0 },
                seven: { status: false, number: 7, cap: 0 },
                eight: { status: false, number: 8, cap: 0 },
                nine: { status: false, number: 9, cap: 0 },
                ten: { status: false, number: 10, cap: 0 },
            }

            this.object.damage = {
                damageDice: data.damage || 0,
                damageSuccessModifier: data.damageSuccessModifier || 0,
                doubleSuccess: data.doubleSuccess || ((this.object.attackType === 'decisive' || this.actor?.system?.battlegroup) ? 11 : 10),
                targetNumber: data.targetNumber || 7,
                postSoakDamage: 0,
                reroll: {
                    one: { status: false, number: 1, cap: 0 },
                    two: { status: false, number: 2, cap: 0 },
                    three: { status: false, number: 3, cap: 0 },
                    four: { status: false, number: 4, cap: 0 },
                    five: { status: false, number: 5, cap: 0 },
                    six: { status: false, number: 6, cap: 0 },
                    seven: { status: false, number: 7, cap: 0 },
                    eight: { status: false, number: 8, cap: 0 },
                    nine: { status: false, number: 9, cap: 0 },
                    ten: { status: false, number: 10, cap: 0 },
                },
                type: 'lethal',
                threshholdToDamage: false,
                resetInit: true,
                doubleRolledDamage: false,
                ignoreSoak: 0,
                rerollFailed: false,
                rollTwice: false,
                rerollNumber: 0,
                decisiveDamageType: 'initiative',
                decisiveDamageCalculation: 'evenSplit'
            };
            this.object.settings = {
                doubleSucccessCaps: {
                    sevens: 0,
                    eights: 0,
                    nines: 0,
                    tens: 0
                },
                excludeOnesFromRerolls: false,
                triggerOnOnes: 'none',
                triggerOnTens: 'none',
                damage: {
                    doubleSucccessCaps: {
                        sevens: 0,
                        eights: 0,
                        nines: 0,
                        tens: 0
                    },
                    excludeOnesFromRerolls: false,
                    triggerOnOnes: 'none'
                }
            }
            this.object.activateAura = 'none';
            this.object.craft = {
                divineInsperationTechnique: false,
                holisticMiracleUnderstanding: false,
            }
            if (this.object.rollType !== 'base') {
                this.object.characterType = this.actor.type;

                if (this.actor.token) {
                    this.object.conditions = (this.actor.token && this.actor.token.actorData.effects) ? this.actor.token.actorData.effects : [];
                }
                else {
                    this.object.conditions = this.actor.effects;
                }
                if (this.actor.type === 'character') {
                    if (this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()]) {
                        this.object.attribute = this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()].attribute;
                        this.object.ability = this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()].ability;
                        this.object.diceModifier += this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()].bonus;
                    }
                    else if (this._isAttackRoll()) {
                        this.object.attribute = this.actor.system.settings.rollsettings['attacks'].attribute;
                        this.object.ability = this.actor.system.settings.rollsettings['attacks'].ability;
                        this.object.diceModifier += this.actor.system.settings.rollsettings['attacks'].bonus;
                    }
                    else {
                        this.object.attribute = data.attribute || this._getHighestAttribute();
                        this.object.ability = data.ability || "archery";
                    }
                    if (this.object.rollType === 'ability' && this.object.ability === 'craft') {
                        this.object.diceModifier += this.actor.system.settings.rollsettings['craft'].bonus;
                    }
                    this.object.martialarts = this.actor.martialarts;
                    this.object.crafts = this.actor.crafts;
                    if (this.object.martialarts.some(ma => ma._id === this.object.ability)) {
                        this.object.attribute = this.actor.system.abilities['martialarts'].prefattribute;
                    }
                    if (this.object.crafts.some(craft => craft._id === this.object.ability)) {
                        this.object.attribute = this.actor.system.abilities['craft'].prefattribute;
                    }
                    this.object.appearance = this.actor.system.attributes.appearance.value;
                }

                if (this.actor.system.settings.rollStunts) {
                    this.object.stunt = "one";
                }

                if (this.actor.type === "npc") {
                    this.object.actions = this.actor.actions;
                    this.object.pool = data.pool || "administration";
                    this.object.appearance = this.actor.system.appearance.value;
                }
                if (data.weapon) {
                    this.object.weaponTags = data.weapon.traits?.weapontags?.selected || {};
                    this.object.damage.resetInit = data.weapon.resetinitiative;
                    if (this.actor.type === 'character') {
                        this.object.attribute = data.weapon.attribute || this._getHighestAttribute();
                        this.object.ability = data.weapon.ability || "archery";
                    }
                    if (this.object.attackType === 'withering' || this.actor.type === "npc") {
                        this.object.diceModifier += data.weapon.witheringaccuracy || 0;
                        if (this.object.attackType === 'withering') {
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
                    if (!this.object.showWithering && data.weapon.decisivedamagetype === 'static') {
                        this.object.damage.damageDice = data.weapon.staticdamage;
                        this.object.damage.decisiveDamageType = 'static';
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
                        if (this.object.craftRating >= 5) {
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
                if (this.object.conditions.some(e => e.name === 'blind')) {
                    this.object.diceModifier -= 3;
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
        this.object.missedAttacks = 0;
        this._migrateNewData(data);
        if (this.object.rollType !== 'base') {
            this.object.showTargets = 0;
            if (this.actor.martialarts) {
                this.object.martialarts = this.actor.martialarts;
            }
            if (this.actor.crafts) {
                this.object.crafts = this.actor.crafts;
            }
            if (this.object.craftId) {
                this.object.ability = this.object.craftId;
            }
            if (this.object.martialArtId) {
                this.object.ability = this.object.martialArtId;
            }
            if (this.object.actionId) {
                this.object.pool = this.object.actionId;
            }
            if (this.object.accuracy) {
                this.object.diceModifier += this.object.accuracy;
                this.object.accuracy = 0;
            }
            this.object.opposingCharms = [];
            if (this.actor.system.battlegroup && this._isAttackRoll()) {
                this._setBattlegroupBonuses();
            }
            if (this.object.charmList === undefined) {
                this.object.charmList = this.actor.charms;
                for (var charmlist of Object.values(this.object.charmList)) {
                    for (const charm of charmlist.list) {
                        this.getEnritchedHTML(charm);
                    }
                }
            }
            this._updateSpecialtyList();
            if (this.actor.system.dicepenalty.value) {
                this.object.diceModifier -= this.actor.system.dicepenalty.value;
            }
            let combat = game.combat;
            if (combat) {
                let combatant = this._getActorCombatant();
                if (combatant && combatant.initiative) {
                    if (!this.object.showWithering) {
                        if (data.weapon && this.object.damage.decisiveDamageType === 'initiative') {
                            this.object.damage.damageDice = combatant.initiative;
                        }
                    }
                    this.object.characterInitiative = combatant.initiative;
                    this.object.originalInitiative = combatant.initiative;
                }
            }
            this.object.targets = {}
            if (game.user.targets && game.user.targets.size > 0) {
                this.object.showTargets = game.user.targets.size;
                if (this._isAttackRoll()) {
                    this._setUpMultitargets();
                }
                else {
                    this._setupSingleTarget(Array.from(game.user.targets)[0]);
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

    _setUpMultitargets() {
        for (const target of Array.from(game.user.targets)) {
            target.rollData = {
                armoredSoak: 0,
                naturalSoak: 0,
                defenseType: game.i18n.localize('Ex3.None'),
                defense: 0,
                soak: 0,
                diceModifier: 0,
                damageModifier: 0,
            }
            if ((target.actor.system.parry.value >= target.actor.system.evasion.value || this.object.weaponTags["undodgeable"]) && !this.object.weaponTags["unblockable"]) {
                target.rollData.defenseType = game.i18n.localize('Ex3.Parry');
                target.rollData.defense = target.actor.system.parry.value;
                if (target.actor.effects && target.actor.effects.some(e => e.flags?.core?.statusId === 'prone')) {
                    target.rollData.defense -= 1;
                }
            }
            if ((target.actor.system.evasion.value >= target.actor.system.parry.value || this.object.weaponTags["unblockable"]) && !this.object.weaponTags["undodgeable"]) {
                target.rollData.defenseType = game.i18n.localize('Ex3.Evasion');
                target.rollData.defense = target.actor.system.evasion.value;
                if (target.actor.effects && target.actor.effects.some(e => e.flags?.core?.statusId === 'prone')) {
                    target.rollData.defense -= 2;
                }
            }
            if (target.actor.system.warstrider.equipped) {
                target.rollData.soak = target.actor.system.warstrider.soak.value;
            }
            else {
                target.rollData.soak = target.actor.system.soak.value;
                target.rollData.armoredSoak = target.actor.system.armoredsoak.value;
                target.rollData.naturalSoak = target.actor.system.naturalsoak.value;
            }
            if (target.actor.system.battlegroup) {
                target.rollData.defense += parseInt(target.actor.system.drill.value);
                if (target.actor.system.might.value > 1) {
                    target.rollData.defense += (target.actor.system.might.value - 1);
                }
                else {
                    target.rollData.defense += target.actor.system.might.value;
                }
                target.rollData.soak += target.actor.system.size.value;
                target.rollData.naturalSoak += target.actor.system.size.value;
            }
            if (target.actor.system.settings.defenseStunts) {
                target.rollData.defense += 1;
            }
            if (target.actor.system.health.penalty !== 'inc') {
                target.rollData.defense -= Math.max(0, target.actor.system.health.penalty - target.actor.system.health.penaltymod);
            }
            if (target.actor.effects) {
                if (target.actor.effects.some(e => e.flags?.core?.statusId === 'lightcover')) {
                    target.rollData.defense += 1;
                }
                if (target.actor.effects.some(e => e.flags?.core?.statusId === 'heavycover')) {
                    target.rollData.defense += 2;
                }
                if (target.actor.effects.some(e => e.flags?.core?.statusId === 'fullcover')) {
                    target.rollData.defense += 3;
                }
                if (target.actor.effects.some(e => e.flags?.core?.statusId === 'fulldefense')) {
                    target.rollData.defense += 2;
                }
                if (target.actor.effects.some(e => e.flags?.core?.statusId === 'surprised')) {
                    target.rollData.defense -= 2;
                }
                if (target.actor.effects.some(e => e.flags?.core?.statusId === 'grappled') || target.actor.effects.some(e => e.flags?.core?.statusId === 'grappling')) {
                    target.rollData.defense -= 2;
                }
            }
            if (target.rollData.defense < 0) {
                target.rollData.defense = 0;
            }
            if (target.rollData.soak < 0) {
                target.rollData.soak = 0;
            }
            if (this.object.weaponTags["bombard"]) {
                if (!target.actor.system.battlegroup && !target.actor.system.legendarysize && !target.actor.system.warstrider.equipped) {
                    target.rollData.diceModifier -= 4;
                }
            }
            this.object.targets[target.id] = target;
        }
    }

    _setupSingleTarget(target) {
        if (target) {
            if (this.object.rollType === 'social' || this.object.rollType === 'readIntentions') {
                if (this.object.rollType === 'readIntentions') {
                    this.object.difficulty = target.actor.system.guile.value;
                }
                if (this.object.rollType === 'social') {
                    var userAppearance = this.actor.type === 'npc' ? this.actor.system.appearance.value : this.actor.system.attributes[this.actor.system.settings.rollsettings.social.appearanceattribute].value;
                    this.object.appearanceBonus = Math.max(0, userAppearance - target.actor.system.resolve.value);
                    this.object.difficulty = target.actor.system.resolve.value;
                    this.object.targetIntimacies = target.actor.intimacies.filter((i) => i.system.visible || game.user.isGM);
                }
                if (target.actor.system.settings.defenseStunts) {
                    this.object.difficulty += 1;
                }
                if (target.actor.system.health.penalty !== 'inc') {
                    this.object.difficulty -= Math.max(0, target.actor.system.health.penalty - target.actor.system.health.penaltymod);
                }
                if (this.object.difficulty < 0) {
                    this.object.difficulty = 0;
                }
            }
        }
        this.object.target = target;
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        // Token Configuration
        if (this.object.rollType !== 'base') {
            const settingsButton = {
                label: game.i18n.localize('Ex3.Settings'),
                class: 'roller-settings',
                id: "roller-settings",
                icon: 'fas fa-cog',
                onclick: async (ev) => {
                    let confirmed = false;
                    const html = await renderTemplate("systems/exaltedthird/templates/dialogues/dice-roller-settings.html", { 'isAttack': this._isAttackRoll(), 'settings': this.object.settings, 'rerolls': this.object.reroll, 'damageRerolls': this.object.damage.reroll });
                    new Dialog({
                        title: `Dice Roll Settings`,
                        content: html,
                        buttons: {
                            roll: { label: "Save", callback: () => confirmed = true },
                        },
                        close: html => {
                            if (confirmed) {
                                this.object.settings.doubleSucccessCaps.sevens = parseInt(html.find('#sevensCap').val() || 0);
                                this.object.settings.doubleSucccessCaps.eights = parseInt(html.find('#eightsCap').val() || 0);
                                this.object.settings.doubleSucccessCaps.nines = parseInt(html.find('#ninesCap').val() || 0);
                                this.object.settings.doubleSucccessCaps.tens = parseInt(html.find('#tensCap').val() || 0);
                                this.object.settings.excludeOnesFromRerolls = html.find('#excludeOnesFromRerolls').is(":checked");
                                this.object.settings.triggerOnOnes = html.find('#triggerOnOnes').val() || 'none';
                                this.object.settings.triggerOnTens = html.find('#triggerOnTens').val() || 'none';

                                this.object.settings.damage.doubleSucccessCaps.sevens = parseInt(html.find('#damageSevensCap').val() || 0);
                                this.object.settings.damage.doubleSucccessCaps.eights = parseInt(html.find('#damageEightsCap').val() || 0);
                                this.object.settings.damage.doubleSucccessCaps.nines = parseInt(html.find('#damageNinesCap').val() || 0);
                                this.object.settings.damage.doubleSucccessCaps.tens = parseInt(html.find('#damageTensCap').val() || 0);
                                this.object.settings.damage.excludeOnesFromRerolls = html.find('#damageExcludeOnesFromRerolls').is(":checked");

                                for (let [rerollKey, rerollValue] of Object.entries(this.object.reroll)) {
                                    this.object.reroll[rerollKey].cap = parseInt(html.find(`#reroll-${this.object.reroll[rerollKey].number}-cap`).val() || 0);
                                }

                                for (let [rerollKey, rerollValue] of Object.entries(this.object.damage.reroll)) {
                                    this.object.damage.reroll[rerollKey].cap = parseInt(html.find(`#damage-reroll-${this.object.damage.reroll[rerollKey].number}-cap`).val() || 0);
                                }
                            }
                        }
                    }, { classes: ["dialog", "solar-background"] }).render(true);
                },
            };
            buttons = [settingsButton, ...buttons];
            const charmsButton = {
                label: game.i18n.localize('Ex3.AddCharm'),
                class: 'add-charm',
                id: "add-charm",
                icon: 'fas fa-bolt',
                onclick: (ev) => {
                    this.object.charmList = this.actor.charms;
                    for (var charmlist of Object.values(this.object.charmList)) {
                        for (const charm of charmlist.list) {
                            if (this.object.addedCharms.some((addedCharm) => addedCharm.id === charm._id)) {
                                var addedCharm = this.object.addedCharms.find((addedCharm) => addedCharm.id === charm._id);
                                charm.charmAdded = true;
                                charm.timesAdded = addedCharm.timesAdded || 1;
                            }
                            else {
                                charm.charmAdded = false;
                                charm.timesAdded = 0;
                            }
                            this.getEnritchedHTML(charm);
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

    async getEnritchedHTML(charm) {
        charm.enritchedHTML = await TextEditor.enrichHTML(charm.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: charm });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["dialog", `solar-background`],
            popOut: true,
            template: "systems/exaltedthird/templates/dialogues/dice-roll.html",
            id: "roll-form",
            title: `Roll`,
            width: 400,
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
        }, { classes: ["dialog", "solar-background"] }).render(true);
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

    async addCharm(item) {
        var existingAddedCharm = this.object.addedCharms.find((addedCharm) => addedCharm.id === item._id);
        if (existingAddedCharm) {
            existingAddedCharm.timesAdded++;
        }
        else {
            item.timesAdded = 1;
            item.saveId = item.id;
            this.object.addedCharms.push(item);
        }
        for (var charmlist of Object.values(this.object.charmList)) {
            for (const charm of charmlist.list) {
                var existingAddedCharm = this.object.addedCharms.find((addedCharm) => addedCharm.id === charm._id);
                if (existingAddedCharm) {
                    charm.charmAdded = true;
                    charm.timesAdded = existingAddedCharm.timesAdded;
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
        this.object.restore.motes += item.system.restore.motes;
        this.object.restore.willpower += item.system.restore.willpower;
        this.object.restore.health += item.system.restore.health;
        this.object.restore.initiative += item.system.restore.initiative;

        this.object.diceModifier += this._getFormulaValue(item.system.diceroller.bonusdice);
        this.object.successModifier += this._getFormulaValue(item.system.diceroller.bonussuccesses);
        if (!item.system.diceroller.settings.noncharmdice) {
            this.object.charmDiceAdded += this._getFormulaValue(item.system.diceroller.bonusdice);
        }
        if (!item.system.diceroller.settings.noncharmsuccesses) {
            this.object.charmDiceAdded += (this._getFormulaValue(item.system.diceroller.bonussuccesses) * 2);
        }
        if (item.system.diceroller.doublesuccess < this.object.doubleSuccess) {
            this.object.doubleSuccess = item.system.diceroller.doublesuccess;
        }
        this.object.targetNumber -= item.system.diceroller.decreasetargetnumber;
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
        this.object.rerollNumber += this._getFormulaValue(item.system.diceroller.rerolldice);
        this.object.diceToSuccesses += this._getFormulaValue(item.system.diceroller.diceToSuccesses);
        if (this._isAttackRoll()) {
            if (this.object.showTargets) {
                const targetValues = Object.values(this.object.targets);
                for (const target of targetValues) {
                    target.rollData.defense = Math.max(0, target.rollData.defense - this._getFormulaValue(item.system.diceroller.reducedifficulty));
                }
            }
            else {
                this.object.defense = Math.max(0, this.object.defense - this._getFormulaValue(item.system.diceroller.reducedifficulty));
            }
        }
        else {
            this.object.difficulty = Math.max(0, this.object.difficulty - this._getFormulaValue(item.system.diceroller.reducedifficulty));
        }

        for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.rerollcap)) {
            if (rerollValue) {
                this.object.reroll[rerollKey].cap += this._getFormulaValue(rerollValue);
            }
        }
        for (let [key, value] of Object.entries(item.system.diceroller.doublesucccesscaps)) {
            if (value) {
                this.object.settings.doubleSucccessCaps[key] += this._getFormulaValue(value);
            }
        }
        if (item.system.diceroller.excludeonesfromrerolls) {
            this.object.settings.excludeOnesFromRerolls = item.system.diceroller.excludeonesfromrerolls;
        }

        this.object.damage.damageDice += this._getFormulaValue(item.system.diceroller.damage.bonusdice);
        this.object.damage.damageSuccessModifier += this._getFormulaValue(item.system.diceroller.damage.bonussuccesses);
        if (item.system.diceroller.damage.doublesuccess < this.object.damage.doubleSuccess) {
            this.object.damage.doubleSuccess = item.system.diceroller.damage.doublesuccess;
        }
        this.object.damage.targetNumber -= item.system.diceroller.damage.decreasetargetnumber;
        this.object.overwhelming += this._getFormulaValue(item.system.diceroller.damage.overwhelming);
        this.object.damage.postSoakDamage += this._getFormulaValue(item.system.diceroller.damage.postsoakdamage);
        for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.reroll)) {
            if (rerollValue) {
                this.object.damage.reroll[rerollKey].status = true;
            }
        }
        if (item.system.diceroller.damage.rerollfailed) {
            this.object.damage.rerollFailed = item.system.diceroller.damage.rerollfailed;
        }
        if (item.system.diceroller.damage.rolltwice) {
            this.object.damage.rollTwice = item.system.diceroller.damage.rolltwice;
        }
        this.object.damage.rerollNumber += this._getFormulaValue(item.system.diceroller.damage.rerolldice);
        if (item.system.diceroller.damage.threshholdtodamage) {
            this.object.damage.threshholdToDamage = item.system.diceroller.damage.threshholdtodamage;
        }
        if (item.system.diceroller.damage.doublerolleddamage) {
            this.object.damage.doubleRolledDamage = item.system.diceroller.damage.doublerolleddamage;
        }
        if (item.system.diceroller.damage.doublerolleddamage) {
            this.object.damage.doubleRolledDamage = item.system.diceroller.damage.doublerolleddamage;
        }
        this.object.damage.ignoreSoak += this._getFormulaValue(item.system.diceroller.damage.ignoresoak);

        for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.rerollcap)) {
            if (rerollValue) {
                this.object.damage.reroll[rerollKey].cap += this._getFormulaValue(rerollValue);
            }
        }
        for (let [key, value] of Object.entries(item.system.diceroller.damage.doublesucccesscaps)) {
            if (value) {
                this.object.settings.damage.doubleSucccessCaps[key] += this._getFormulaValue(value);
            }
        }
        if (item.system.diceroller.damage.excludeonesfromrerolls) {
            this.object.settings.damage.excludeOnesFromRerolls = item.system.diceroller.damage.excludeonesfromrerolls;
        }

        if (item.system.diceroller.activateAura !== 'none') {
            this.object.activateAura = item.system.diceroller.activateAura;
        }
        if (item.system.diceroller.triggerontens !== 'none') {
            this.object.settings.triggerOnTens = item.system.diceroller.triggerontens;
        }

        this.render();
    }

    _getFormulaValue(charmValue, opposedCharmActor = null) {
        var rollerValue = 0;
        if (charmValue) {
            if (charmValue.split(' ').length === 3) {
                var negativeValue = false;
                if (charmValue.includes('-(')) {
                    charmValue = charmValue.replace(/(-\(|\))/g, '');
                    negativeValue = true;
                }
                var split = charmValue.split(' ');
                var leftVar = this._getFormulaActorValue(split[0], opposedCharmActor);
                var operand = split[1];
                var rightVar = this._getFormulaActorValue(split[2], opposedCharmActor);
                switch (operand) {
                    case '+':
                        rollerValue = leftVar + rightVar;
                        break;
                    case '-':
                        rollerValue = leftVar - rightVar;
                        break;
                    case '/>':
                        if (rightVar) {
                            rollerValue = Math.ceil(leftVar / rightVar);
                        }
                        break;
                    case '/<':
                        if (rightVar) {
                            rollerValue = Math.floor(leftVar / rightVar);
                        }
                        break;
                    case '*':
                        rollerValue = leftVar * rightVar;
                        break;
                    case '|':
                        rollerValue = Math.max(leftVar, rightVar);
                        break;
                    case 'cap':
                        rollerValue = Math.min(leftVar, rightVar);
                        break;
                }
                if (negativeValue) {
                    rollerValue *= -1;
                }
            }
            else {
                rollerValue = this._getFormulaActorValue(charmValue, opposedCharmActor);
            }
        }
        return rollerValue;
    }

    _getFormulaActorValue(formula, opposedCharmActor = null) {
        var formulaVal = 0;
        var forumlaActor = this.actor;
        if (opposedCharmActor) {
            forumlaActor = opposedCharmActor;
        }
        if (parseInt(formula)) {
            return parseInt(formula);
        }
        if (formula.includes('target-')) {
            formula = formula.replace('target-', '');
            if (this.object.target?.actor) {
                forumlaActor = this.object.target?.actor;
            }
            else if (this.object.targets) {
                const targetValues = Object.values(this.object.targets);
                forumlaActor = targetValues[0].actor;
            }
            else {
                return 0;
            }
        }
        var negativeValue = false;
        if (formula.includes('-')) {
            formula = formula.replace('-', '');
            negativeValue = true;
        }
        if (forumlaActor.getRollData()[formula]?.value) {
            formulaVal = forumlaActor.getRollData()[formula]?.value;
        }
        if (negativeValue) {
            formulaVal *= -1;
        }
        return formulaVal;
    }

    async addOpposingCharm(charm) {
        const addedCharm = this.object.opposingCharms.find(opposedCharm => charm._id === opposedCharm._id);
        if (addedCharm) {
            addedCharm.timesAdded++;
        }
        else {
            charm.timesAdded = 1;
            this.object.opposingCharms.push(charm);
        }
        this.object.targetNumber += charm.system.diceroller.opposedbonuses.increasetargetnumber;
        this.object.gambitDifficulty += this._getFormulaValue(charm.system.diceroller.opposedbonuses.increasegambitdifficulty, charm.actor);
        if (this._isAttackRoll()) {
            if (this.object.showTargets) {
                const targetValues = Object.values(this.object.targets);
                if (targetValues.length === 1) {
                    targetValues[0].rollData.defense += this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                    targetValues[0].rollData.soak += this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                    targetValues[0].rollData.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                    targetValues[0].rollData.damageModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                }
                else {
                    for (const target of targetValues) {
                        if (target.actor.id === charm.parent.id || targetValues.length === 1) {
                            target.rollData.defense += this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                            target.rollData.soak += this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                            target.rollData.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                            target.rollData.damageModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                        }
                    }
                }
            }
            else {
                this.object.defense += this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                this.object.soak += this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                this.object.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                this.object.damage.damageDice += this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
            }
            this.object.damage.targetNumber += charm.system.diceroller.opposedbonuses.increasedamagetargetnumber;
        }
        else {
            this.object.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
        }
        if (this.object.rollType === 'readIntentions') {
            this.object.difficulty += this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
        }
        if (this.object.rollType === 'social') {
            this.object.difficulty += this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
        }
        if (charm.system.diceroller.opposedbonuses.triggeronones !== 'none') {
            this.object.settings.triggerOnOnes = charm.system.diceroller.opposedbonuses.triggeronones;
        }
        this.render();
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("change", "#gambit", ev => {
            const gambitCosts = {
                'none': 0,
                'grapple': 2,
                'unhorse': 4,
                'distract': 3,
                'disarm': 3,
                'detonate': 4,
                'bind': 2,
                'goad': 3,
                'leech': 3,
                'pileon': 2,
                'riposte': 1,
                'blockvision': 3,
                'disablearm': 5,
                'disableleg': 6,
                'breachframe': 9,
                'entangle': 2,
            }
            this.object.gambitDifficulty = gambitCosts[this.object.gambit];
            this.render();
        });

        html.on("change", "#craft-type", ev => {
            this.object.intervals = 1;
            this.object.difficulty = 1;
            this.object.goalNumber = 0;
            if (this.object.craftType === 'superior') {
                this.object.intervals = 6;
                this.object.difficulty = 5;
                if (parseInt(this.object.craftRating) === 2) {
                    this.object.goalNumber = 30;
                }
                if (parseInt(this.object.craftRating) === 3) {
                    this.object.goalNumber = 50;
                }
                if (parseInt(this.object.craftRating) === 4) {
                    this.object.goalNumber = 75;
                }
                if (parseInt(this.object.craftRating) === 5) {
                    this.object.goalNumber = 100;
                }
            }
            else if (this.object.craftType === 'legendary') {
                this.object.intervals = 6;
                this.object.difficulty = 5;
                this.object.goalNumber = 200;
            }
            this.render();
        });

        html.on("change", "#craft-rating", ev => {
            if (parseInt(this.object.craftRating) === 2) {
                this.object.goalNumber = 30;
            }
            if (parseInt(this.object.craftRating) === 3) {
                this.object.goalNumber = 50;
            }
            if (parseInt(this.object.craftRating) === 4) {
                this.object.goalNumber = 75;
            }
            if (parseInt(this.object.craftRating) === 5) {
                this.object.goalNumber = 100;
            }
            this.render();
        });

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
            if (this.object.intervals <= 0 && (!this.object.splitAttack || this.object.rollType === 'damage')) {
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
            this.addCharm(item);
        });

        html.find('.remove-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            const index = this.object.addedCharms.findIndex(addedItem => item.id === addedItem.id);
            const addedCharm = this.object.addedCharms.find(addedItem => item.id === addedItem.id);
            if (index > -1) {
                for (var charmlist of Object.values(this.object.charmList)) {
                    for (const charm of charmlist.list) {
                        if (charm._id === item.id) {
                            if (addedCharm.timesAdded > 0) {
                                charm.timesAdded--;
                            }
                            if (charm.timesAdded <= 0) {
                                charm.charmAdded = false;
                            }
                        }
                    }
                }

                if (addedCharm.timesAdded > 0) {
                    addedCharm.timesAdded--;
                }
                if (addedCharm.timesAdded <= 0) {
                    this.object.addedCharms.splice(index, 1);
                }

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
                this.object.restore.motes -= item.system.restore.motes;
                this.object.restore.willpower -= item.system.restore.willpower;
                this.object.restore.health -= item.system.restore.health;
                this.object.restore.initiative -= item.system.restore.initiative;

                this.object.diceModifier -= this._getFormulaValue(item.system.diceroller.bonusdice);
                this.object.successModifier -= this._getFormulaValue(item.system.diceroller.bonussuccesses);
                if (!item.system.diceroller.settings.noncharmdice) {
                    this.object.charmDiceAdded = Math.max(0, this.object.charmDiceAdded - this._getFormulaValue(item.system.diceroller.bonusdice));
                }
                if (!item.system.diceroller.settings.noncharmsuccesses) {
                    this.object.charmDiceAdded = Math.max(0, this.object.charmDiceAdded - (this._getFormulaValue(item.system.diceroller.bonussuccesses) * 2));
                }
                this.object.targetNumber += item.system.diceroller.decreasetargetnumber;
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
                this.object.rerollNumber -= this._getFormulaValue(item.system.diceroller.rerolldice);
                this.object.diceToSuccesses -= this._getFormulaValue(item.system.diceroller.diceToSuccesses);

                if (this._isAttackRoll()) {
                    if (this.object.showTargets) {
                        const targetValues = Object.values(this.object.targets);
                        for (const target of targetValues) {
                            target.rollData.defense += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                        }
                    }
                    else {
                        this.object.defense += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                    }
                }
                else {
                    this.object.difficulty += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                }

                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.rerollcap)) {
                    if (rerollValue) {
                        this.object.reroll[rerollKey].cap -= this._getFormulaValue(rerollValue);
                    }
                }
                for (let [key, value] of Object.entries(item.system.diceroller.doublesucccesscaps)) {
                    if (value) {
                        this.object.settings.doubleSucccessCaps[key] -= this._getFormulaValue(value);
                    }
                }
                if (item.system.diceroller.excludeonesfromrerolls) {
                    this.object.settings.excludeOnesFromRerolls = false;
                }

                this.object.damage.damageDice -= this._getFormulaValue(item.system.diceroller.damage.bonusdice);
                this.object.damage.damageSuccessModifier -= this._getFormulaValue(item.system.diceroller.damage.bonussuccesses);
                this.object.damage.targetNumber += item.system.diceroller.damage.decreasetargetnumber;
                this.object.overwhelming -= this._getFormulaValue(item.system.diceroller.damage.overwhelming);
                this.object.damage.postSoakDamage -= this._getFormulaValue(item.system.diceroller.damage.postsoakdamage);
                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.reroll)) {
                    if (rerollValue) {
                        this.object.damage.reroll[rerollKey].status = false;
                    }
                }
                if (item.system.diceroller.damage.rerollfailed) {
                    this.object.damage.rerollFailed = false;
                }
                if (item.system.diceroller.damage.rolltwice) {
                    this.object.damage.rollTwice = false;
                }
                this.object.damage.rerollNumber -= this._getFormulaValue(item.system.diceroller.damage.rerolldice);
                if (item.system.diceroller.damage.threshholdtodamage) {
                    this.object.damage.threshholdToDamage = false;
                }
                if (item.system.diceroller.damage.doublerolleddamage) {
                    this.object.damage.doubleRolledDamage = false;
                }
                this.object.damage.ignoreSoak -= this._getFormulaValue(item.system.diceroller.damage.ignoresoak);
                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.rerollcap)) {
                    if (rerollValue) {
                        this.object.damage.reroll[rerollKey].cap -= this._getFormulaValue(rerollValue);
                    }
                }
                for (let [key, value] of Object.entries(item.system.diceroller.damage.doublesucccesscaps)) {
                    if (value) {
                        this.object.settings.damage.doubleSucccessCaps[key] -= this._getFormulaValue(value);
                    }
                }
                if (item.system.diceroller.damage.excludeonesfromrerolls) {
                    this.object.settings.damage.excludeOnesFromRerolls = false;
                }
                if (addedCharm.timesAdded === 0 && item.system.diceroller.activateAura === this.object.activateAura) {
                    this.object.activateAura = 'none';
                }
                if (addedCharm.timesAdded === 0 && item.system.diceroller.triggerontens === this.object.settings.triggerOnTens) {
                    this.object.settings.triggerOnTens = 'none';
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
            if (charm) {
                if (charm.timesAdded <= 1) {
                    this.object.opposingCharms.splice(index, 1);
                }
                else {
                    charm.timesAdded--;
                }
                this.object.targetNumber -= charm.system.diceroller.opposedbonuses.increasetargetnumber;
                this.object.gambitDifficulty -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.increasegambitdifficulty, charm.actor);
                if (this._isAttackRoll()) {
                    if (this.object.showTargets) {
                        const targetValues = Object.values(this.object.targets);
                        if (targetValues.length === 1) {
                            targetValues[0].rollData.defense -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                            targetValues[0].rollData.soak -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                            targetValues[0].rollData.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                            targetValues[0].rollData.damageModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                        }
                        else {
                            for (const target of targetValues) {
                                if (target.actor.id === charm.parent.id || targetValues.length === 1) {
                                    target.rollData.defense -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                                    target.rollData.soak -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                                    target.rollData.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                                    target.rollData.damageModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                                }
                            }
                        }
                    }
                    else {
                        this.object.defense -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                        this.object.soak -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                        this.object.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                        this.object.damage.damageDice -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                    }
                    this.object.damage.targetNumber -= charm.system.diceroller.opposedbonuses.increasedamagetargetnumber;
                }
                else {
                    this.object.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                }
                if (this.object.rollType === 'readIntentions') {
                    this.object.difficulty -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                }
                if (this.object.rollType === 'social') {
                    this.object.difficulty -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                }
                if (charm.system.diceroller.opposedbonuses.triggeronones !== 'none') {
                    this.object.settings.triggerOnOnes = 'none';
                }
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
            if (li.attr('id')) {
                this.object[li.attr('id')] = li.is(":hidden");
            }
            li.toggle("fast");
        });
    }

    async _roll() {
        if (this._isAttackRoll()) {
            this.object.gainedInitiative = 0;
            this.object.crashed = false;
            this.object.targetHit = false;
            if (this.object.showTargets) {
                for (const target of Object.values(this.object.targets)) {
                    this.object.target = target;
                    if (target.actor?.token?.id || target.actor.getActiveTokens()[0]) {
                        const tokenId = target.actor?.token?.id || target.actor.getActiveTokens()[0].id;
                        this.object.targetCombatant = game.combat?.combatants?.find(c => c.tokenId === tokenId) || null;
                    }
                    else {
                        this.object.targetCombatant = null;
                    }
                    this.object.soak = target.rollData.soak;
                    this.object.defense = target.rollData.defense;
                    this.object.targetSpecificDiceMod = target.rollData.diceModifier;
                    this.object.targetSpecificDamageMod = target.rollData.damageModifier;
                    await this._attackRoll();
                }
            }
            else {
                await this._attackRoll();
            }
            this._postAttackResults();
        }
        else if (this.object.rollType === 'base') {
            await this._diceRoll();
        }
        else if (this.object.rollType === 'craft' || this.object.rollType === 'working') {
            this.object.intervals -= 1;
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

    // Dovie'andi se tovya sagain.
    _rollTheDice(dice, diceModifiers, doublesRolled, numbersRerolled) {
        var total = 0;
        var results = null;
        const numbersChart = {
            1: 'one',
            2: 'two',
            3: 'three',
            4: 'four',
            5: 'five',
            6: 'six',
            7: 'seven',
            8: 'eight',
            9: 'nine',
            10: 'ten',
        }
        const doublesChart = {
            7: 'sevens',
            8: 'eights',
            9: 'nines',
            10: 'tens',
        }
        let rerolls = [];
        for (var rerollValue in diceModifiers.reroll) {
            if (diceModifiers.reroll[rerollValue].status) {
                rerolls.push(diceModifiers.reroll[rerollValue].number);
            }
        }
        var roll = new Roll(`${dice}d10cs>=${diceModifiers.targetNumber}`).evaluate({ async: false });
        results = roll.dice[0].results;
        total = roll.total;
        if (rerolls.length > 0) {
            while (results.some(dieResult => (rerolls.includes(dieResult.result) && !dieResult.rerolled && (diceModifiers.reroll[numbersChart[dieResult.result]].cap === 0 || diceModifiers.reroll[numbersChart[dieResult.result]].cap > numbersRerolled[dieResult.result])))) {
                var toReroll = 0;
                for (const diceResult of results) {
                    if (!diceResult.rerolled && rerolls.includes(diceResult.result)) {
                        if (diceModifiers.reroll[numbersChart[diceResult.result]].cap === 0 || diceModifiers.reroll[numbersChart[diceResult.result]].cap > numbersRerolled[diceResult.result]) {
                            toReroll++;
                            numbersRerolled[diceResult.result] += 1;
                            diceResult.rerolled = true;
                        }
                    }
                }
                var rerollRoll = new Roll(`${toReroll}d10cs>=${diceModifiers.targetNumber}`).evaluate({ async: false });
                results = results.concat(rerollRoll.dice[0].results);
                total += rerollRoll.total;
            }
        }
        for (let dice of results) {
            if (dice.result >= diceModifiers.doubleSuccess && dice.result >= diceModifiers.targetNumber) {
                if (diceModifiers.settings.doubleSucccessCaps[doublesChart[dice.result]] === 0 || diceModifiers.settings.doubleSucccessCaps[doublesChart[dice.result]] > doublesRolled[dice.result]) {
                    total += 1;
                    dice.doubled = true;
                    doublesRolled[dice.result] += 1;
                }
            }
            if (dice.result === 10 && diceModifiers.settings.triggerOnTens === 'rerolllDie') {
                diceModifiers.rerollNumber += 1;
            }
        }

        let rollResult = {
            roll: roll,
            results: results,
            total: total,
        };

        return rollResult;
    }

    _calculateRoll(dice, diceModifiers) {
        const doublesRolled = {
            7: 0,
            8: 0,
            9: 0,
            10: 0,
        }
        const numbersRerolled = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
        }

        let rollResults = this._rollTheDice(dice, diceModifiers, doublesRolled, numbersRerolled);
        let diceRoll = rollResults.results;
        let total = rollResults.total;
        var possibleRerolls = 0;
        if (diceModifiers.rerollFailed) {
            for (const diceResult of diceRoll.sort((a, b) => a.result - b.result)) {
                if (!diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                    possibleRerolls++;
                    diceResult.rerolled = true;
                }
            }
            var failedDiceRollResult = this._rollTheDice(possibleRerolls, diceModifiers, doublesRolled, numbersRerolled);
            diceRoll = diceRoll.concat(failedDiceRollResult.results);
            total += failedDiceRollResult.total;
        }

        possibleRerolls = 0;
        for (const diceResult of diceRoll.sort((a, b) => a.result - b.result)) {
            if (diceModifiers.rerollNumber > possibleRerolls && !diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                possibleRerolls++;
                diceResult.rerolled = true;
            }
        }

        var diceToReroll = Math.min(possibleRerolls, diceModifiers.rerollNumber);
        let rerolledDice = 0;
        while (diceToReroll > 0 && (rerolledDice < diceModifiers.rerollNumber)) {
            rerolledDice += possibleRerolls;
            var rerollNumDiceResults = this._rollTheDice(diceToReroll, diceModifiers, doublesRolled, numbersRerolled);
            diceToReroll = 0
            for (const diceResult of rerollNumDiceResults.results.sort((a, b) => a.result - b.result)) {
                if (diceModifiers.rerollNumber > possibleRerolls && !diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                    possibleRerolls++;
                    diceToReroll++;
                    diceResult.rerolled = true;
                }
            }
            diceRoll = diceRoll.concat(rerollNumDiceResults.results);
            total += rerollNumDiceResults.total;
        }
        total += diceModifiers.successModifier;
        if (this.object.craft.divineInsperationTechnique || this.object.craft.holisticMiracleUnderstanding) {
            let newCraftDice = Math.floor(total / 3);
            let remainder = total % 3;
            while (newCraftDice > 0) {
                var rollSuccessTotal = 0;
                var craftDiceRollResults = this._rollTheDice(newCraftDice, diceModifiers, doublesRolled, numbersRerolled);
                diceRoll = diceRoll.concat(craftDiceRollResults.results);
                rollSuccessTotal += craftDiceRollResults.total;
                total += craftDiceRollResults.total;
                newCraftDice = Math.floor((rollSuccessTotal + remainder) / 3);
                remainder = rollSuccessTotal % 3;
                if (this.object.craft.holisticMiracleUnderstanding) {
                    newCraftDice * 4;
                }
            }
        }

        if (diceModifiers.macros.length > 0) {
            let newResults = { ...rollResults, results: diceRoll, total };
            newResults = diceModifiers.macros.reduce((carry, macro) => macro(carry, dice, diceModifiers, doublesRolled, numbersRerolled), newResults);
            total = newResults.total;
            rollResults = newResults;
        }
        rollResults.roll.dice[0].results = diceRoll;

        let diceDisplay = "";
        for (let dice of diceRoll.sort((a, b) => b.result - a.result)) {
            if (dice.doubled) {
                diceDisplay += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= diceModifiers.targetNumber) { diceDisplay += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.rerolled) { diceDisplay += `<li class="roll die d10 rerolled">${dice.result}</li>`; }
            else if (dice.result == 1) { diceDisplay += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { diceDisplay += `<li class="roll die d10">${dice.result}</li>`; }
        }

        return {
            roll: rollResults.roll,
            diceDisplay: diceDisplay,
            total: total,
            diceRoll: diceRoll,
        };
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
                if (this.object.martialarts.some(ma => ma._id === this.object.ability)) {
                    dice += this.actor.martialarts.find(x => x._id === this.object.ability).system.points;
                }
                else if (this.object.crafts.some(craft => craft._id === this.object.ability)) {
                    dice += this.actor.crafts.find(x => x._id === this.object.ability).system.points;
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
                if (this.object.actions.some(action => action._id === this.object.pool)) {
                    dice += this.actor.actions.find(x => x._id === this.object.pool).system.value;
                }
                else if (this.object.pool === 'willpower') {
                    dice += this.actor.system.willpower.max;
                } else {
                    dice += data.pools[this.object.pool].value;
                }
            }

            if (this.object.armorPenalty) {
                for (let armor of this.actor.armor) {
                    if (armor.system.equipped) {
                        dice -= Math.abs(armor.system.penalty);
                    }
                }
            }
            if (this.object.willpower) {
                this.object.successModifier++;
                this.object.cost.willpower++;
            }
            if (this.object.stunt !== 'none') {
                dice += 2;
            }
            if (this.object.stunt === 'two') {
                if (this.object.willpower) {
                    this.object.cost.willpower--;
                }
                else if (actorData.system.willpower.value < actorData.system.willpower.max) {
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
            if (this.object.targetSpecificDiceMod) {
                dice += this.object.targetSpecificDiceMod;
            }
            if (this.object.specialty) {
                dice++;
            }
            this.actor.update(actorData);
        }

        if (this._isAttackRoll()) {
            if (this.object.weaponType !== 'melee' && (this.actor.type === 'npc' || this.object.attackType === 'withering')) {
                if (this.object.range !== 'short') {
                    dice += this._getRangedAccuracy();
                }
            }
        }

        if (dice < 0) {
            dice = 0;
        }
        this.object.dice = dice;

        var rollModifiers = {
            successModifier: this.object.successModifier,
            doubleSuccess: this.object.doubleSuccess,
            targetNumber: this.object.targetNumber,
            reroll: this.object.reroll,
            rerollFailed: this.object.rerollFailed,
            rerollNumber: this.object.rerollNumber,
            settings: this.object.settings,
            macros: [],
        }

        for (let charm of this.object.addedCharms) {
            if (!charm.system.macro) continue;
            let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.macro);
            rollModifiers.macros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                try {
                    return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                } catch (e) {
                    ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                    console.error(e);
                }
                return rollResult;
            });
        }

        const diceRollResults = this._calculateRoll(dice, rollModifiers);
        this.object.roll = diceRollResults.roll;
        this.object.displayDice = diceRollResults.diceDisplay;
        this.object.total = diceRollResults.total;
        var diceRoll = diceRollResults.diceRoll;

        if (this.object.rollTwice) {
            const secondRoll = this._calculateRoll(dice, rollModifiers);
            if (secondRoll.total > diceRollResults.total) {
                this.object.roll = secondRoll.roll;
                this.object.displayDice = secondRoll.diceDisplay;
                this.object.total = secondRoll.total;
                diceRoll = secondRoll.diceRoll;
            }
        }
        this.object.roll.dice[0].options.rollOrder = 1;

        let onesRolled = 0;
        let tensRolled = 0;
        for (let dice of diceRoll) {
            if (!dice.rerolled && dice.result === 1) {
                onesRolled++
            }
            if (!dice.rerolled && dice.result === 10) {
                tensRolled++;
            }
        }
        if (onesRolled > 0 && this.object.settings.triggerOnOnes !== 'none') {
            switch (this.object.settings.triggerOnOnes) {
                case 'soak':
                    this.object.soak += onesRolled;
                    break;
                case 'defense':
                    this.object.defense += onesRolled;
                    break;
                case 'subtractInitiative':
                    if (this.object.characterInitiative) {
                        this.object.characterInitiative -= onesRolled;
                    }
                    break;
                case 'subtractSuccesses':
                    this.object.total -= onesRolled;
                    break;
            }
        }

        if (tensRolled > 0 && this.object.settings.triggerOnTens !== 'none') {
            switch (this.object.settings.triggerOnTens) {
                case 'damage':
                    this.object.damage.damageDice += tensRolled;
                    break;
                case 'postSoakDamage':
                    this.object.damage.postSoakDamage += tensRolled;
                    break;
                case 'extraSuccess':
                    this.object.total += tensRolled;
                    break;
            }
        }

        if (!this._isAttackRoll() && this.object.rollType !== 'base') {
            this._updateCharacterResources();
        }
    }

    async _diceRoll() {
        this._baseAbilityDieRoll();
        let messageContent = `
        <div class="dice-roll">
            <div class="dice-result">
                <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes
                </h4>
                <div class="dice-tooltip">
                    <div class="dice">
                        <ol class="dice-rolls">${this.object.displayDice}</ol>
                    </div>
                </div>
                <h4 class="dice-total">${this.object.total} Successes</h4>
            </div>
        </div>`;


        messageContent = await this._createChatMessageContent(messageContent, 'Dice Roll')
        ChatMessage.create({ user: game.user.id, speaker: this.actor !== null ? ChatMessage.getSpeaker({ actor: this.actor }) : null, content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
    }

    async _abilityRoll() {
        if (this.object.attribute == null) {
            this.object.attribute = this.actor.type === "npc" ? null : this._getHighestAttribute();
        }
        if (this.object.rollType === 'social') {
            if (this.object.applyAppearance) {
                this.object.diceModifier += this.object.appearanceBonus;
            }
            this.object.difficulty = Math.max(0, this.object.difficulty + parseInt(this.object.opposedIntimacy || 0) - parseInt(this.object.supportedIntimacy || 0));
        }
        let goalNumberLeft = 0;
        await this._baseAbilityDieRoll();
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
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <ol class="dice-rolls">${this.object.displayDice}</ol>
                        </div>
                    </div>
                    <h4 class="dice-total">${this.object.total} Successes</h4>
                    ${resultString}
                </div>
            </div>`
        theContent = await this._createChatMessageContent(theContent, 'Ability Roll')
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
                let combatant = this._getActorCombatant();
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
            if (this.object.rollType === 'damage' && this.object.attackSuccesses < this.object.defense) {
                this.object.thereshholdSuccesses = this.object.attackSuccesses - this.object.defense;
                this.missAttack(false);
            }
            else {
                this._damageRoll();
            }
        }
        else {
            if (this.object.thereshholdSuccesses < 0) {
                this.missAttack();
            }
        }
        if (this.object.rollType === 'accuracy') {
            var messageContent = `
                            <div class="dice-roll">
                                <div class="dice-result">
                                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                                    <div class="dice-tooltip">
                                        <div class="dice">
                                            <ol class="dice-rolls">${this.object.displayDice}</ol>
                                        </div>
                                    </div>
                                    <h4 class="dice-formula">${this.object.total} Successes</h4>
                                </div>
                            </div>`;
            messageContent = await this._createChatMessageContent(messageContent, `Accuracy Roll ${this.object.target ? ` vs ${this.object.target.name}` : ''}`);
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
        }
        else {
            this._addAttackEffects();
            this.attackSequence();
        }
    }

    async _postAttackResults() {
        if (this.object.rollType !== 'accuracy' || !this.object.splitAttack) {
            await this._updateCharacterResources();
            if (this.object.gainedInitiative) {
                this.object.characterInitiative += this.object.gainedInitiative;
            }
            if (this.object.targetHit) {
                this.object.characterInitiative += 1;
            }
            if (this.object.crashed) {
                this.object.characterInitiative += 5;
            }
            const triggerMissedAttack = this.object.missedAttacks > 0 && (this.object.missedAttacks >= this.object.showTargets)
            if (triggerMissedAttack && this.object.rollType !== 'withering' && this.object.damage.resetInit) {
                if (this.object.characterInitiative < 11) {
                    this.object.characterInitiative = this.object.characterInitiative - 2;
                }
                else {
                    this.object.characterInitiative = this.object.characterInitiative - 3;
                }
            }
            if (this.object.attackType === 'decisive' && this.object.damage.resetInit) {
                this.object.characterInitiative = this.actor.system.baseinitiative.value;
            }
            if (this.object.attackType === 'gambit') {
                if (this.object.characterInitiative > 0 && (this.object.characterInitiative - this.object.gambitDifficulty - 1 <= 0)) {
                    this.object.characterInitiative -= 5;
                }
                this.object.characterInitiative = this.object.characterInitiative - this.object.gambitDifficulty - 1;
            }
            if (this.actor.type !== 'npc' || this.actor.system.battlegroup === false) {
                let combat = game.combat;
                if (this.object.target && combat) {
                    let combatant = this._getActorCombatant();
                    if (combatant && combatant.initiative != null) {
                        combat.setInitiative(combatant.id, this.object.characterInitiative);
                    }
                }
            }
        }
        if (this.object.splitAttack && this.object.rollType === 'accuracy') {
            this.object.rollType = 'damage';
            this.render();
        }
    }

    async missAttack(accuracyRoll = true) {
        this.object.missedAttacks++;
        if (accuracyRoll) {
            var messageContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <ol class="dice-rolls">${this.object.displayDice || ''}</ol>
                        </div>
                    </div>
                    <h4 class="dice-formula">${this.object.total || 0} Successes vs ${this.object.defense} Defense</h4>
                    <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Successes</h4>
                    <h4 class="dice-total">Attack Missed!</h4>
                </div>
            </div>`;
            messageContent = await this._createChatMessageContent(messageContent, 'Attack Roll')
            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: messageContent,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll || undefined,
                flags: {
                    "exaltedthird": {
                        dice: this.object.dice,
                        successModifier: this.object.successModifier,
                        total: this.object.total || 0,
                        defense: this.object.defense,
                        threshholdSuccesses: this.object.thereshholdSuccesses
                    }
                }
            });
        }
        else {
            var messageContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.attackSuccesses} Successes vs ${this.object.defense} Defense</h4>
                    <h4 class="dice-total">Attack Missed!</h4>
                </div>
            </div>`;
            messageContent = await this._createChatMessageContent(messageContent, 'Attack Roll')
            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: messageContent,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            });
        }
    }

    async _accuracyRoll() {
        this._baseAbilityDieRoll();
        this.object.thereshholdSuccesses = this.object.total - this.object.defense;
        this.object.attackSuccesses = this.object.total;
    }

    async _damageRoll() {
        let dice = this.object.damage.damageDice;
        if (this._damageRollType('decisive') && this.object.damage.decisiveDamageType === 'initiative') {
            dice -= this.object.cost.initiative;
            if (this.object.showTargets) {
                if (this.object.damage.decisiveDamageCalculation === 'evenSplit') {
                    dice = Math.ceil(dice / this.object.showTargets);
                }
                else if (this.object.damage.decisiveDamageCalculation === 'half') {
                    dice = Math.ceil(dice / 2);
                }
                else {
                    dice = Math.ceil(dice / 3);
                }
            }
        }
        if (this.object.rollType === 'damage' && (this.object.attackType === 'withering' || this.object.damage.threshholdToDamage)) {
            dice += Math.max(0, this.object.attackSuccesses - this.object.defense);
        }
        else if (this._damageRollType('withering') || this.object.damage.threshholdToDamage) {
            dice += this.object.thereshholdSuccesses;
        }
        if (this.object.targetSpecificDamageMod) {
            dice += this.object.targetSpecificDamageMod;
        }
        let baseDamage = dice;
        var damageResults = ``;

        if (this._damageRollType('decisive')) {
            if (this.object.target && game.combat) {
                if (this.object.targetCombatant !== null) {
                    if (this.object.targetCombatant.actor.type === 'npc' && this.object.targetCombatant.actor.system.battlegroup) {
                        dice += Math.floor(dice / 4);
                        baseDamage = dice;
                    }
                }
            }
        }
        if (this._damageRollType('withering')) {
            dice -= Math.max(0, this.object.soak - this.object.damage.ignoreSoak);
            if (dice < this.object.overwhelming) {
                dice = Math.max(dice, this.object.overwhelming);
            }
            if (dice < 0) {
                dice = 0;
            }
            dice += this.object.damage.postSoakDamage;
        }
        if (dice < 0) {
            dice = 0;
        }
        var rollModifiers = {
            successModifier: this.object.damage.damageSuccessModifier,
            doubleSuccess: this.object.damage.doubleSuccess,
            targetNumber: this.object.damage.targetNumber,
            reroll: this.object.damage.reroll,
            rerollFailed: this.object.damage.rerollFailed,
            rerollNumber: this.object.damage.rerollNumber,
            settings: this.object.settings.damage,
            macros: [],
        }

        for (let charm of this.object.addedCharms) {
            if (!charm.system.damagemacro) continue;
            let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.damagemacro);
            rollModifiers.macros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                try {
                    return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                } catch (e) {
                    ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                    console.error(e);
                }
                return rollResult;
            });
        }

        var diceRollResults = this._calculateRoll(dice, rollModifiers);
        if (this.object.damage.rollTwice) {
            const secondRoll = this._calculateRoll(dice, rollModifiers);
            if (secondRoll.total > diceRollResults.total) {
                diceRollResults = secondRoll;
            }
        }
        this.object.finalDamageDice = dice;
        diceRollResults.roll.dice[0].options.rollOrder = 1;
        if (this.object.roll) {
            diceRollResults.roll.dice[0].options.rollOrder = 2;
        }
        let total = diceRollResults.total;
        if (this.object.damage.doubleRolledDamage) {
            total *= 2;
        }
        let soakResult = ``;
        let typeSpecificResults = ``;

        if (this._damageRollType('decisive')) {
            typeSpecificResults = `<h4 class="dice-total">${total} ${this.object.damage.type.capitalize()} Damage!</h4>`;
            if (this._useLegendarySize('decisive')) {
                typeSpecificResults = typeSpecificResults + `<h4 class="dice-formula">Legendary Size</h4><h4 class="dice-formula">Damage capped at ${3 + this.actor.system.attributes.strength.value} + Charm damage levels</h4>`;
                total = Math.min(total, 3 + this.actor.system.attributes.strength.value);
            }
            this.dealHealthDamage(total);
        }
        else if (this.object.rollType === 'gambit') {
            this.object.gambitSuccess = true;
            var resultsText = `<h4 class="dice-total">Gambit Success</h4>`;
            if (this.object.gambitDifficulty > total) {
                this.object.gambitSuccess = false;
                resultsText = `<h4 class="dice-total">Gambit Failed</h4>`
            }
            typeSpecificResults = `<h4 class="dice-formula">${total} Successes vs ${this.object.gambitDifficulty} Difficulty!</h4>${resultsText}`;
        }
        else {
            let targetResults = ``;
            if (this.object.target && game.combat) {
                if (this.object.targetCombatant && this.object.targetCombatant.initiative !== null) {
                    this.object.targetHit = true;
                    if (this.object.targetCombatant.actor.type !== 'npc' || this.object.targetCombatant.actor.system.battlegroup === false) {
                        let newInitative = this.object.targetCombatant.initiative;
                        newInitative -= total;
                        this.object.gainedInitiative = Math.max(total, this.object.gainedInitiative);
                        if ((newInitative <= 0 && this.object.targetCombatant.initiative > 0)) {
                            if (this._useLegendarySize('withering')) {
                                newInitative = 1;
                            }
                            else {
                                this.object.crashed = true;
                                targetResults = `<h4 class="dice-total">Target Crashed!</h4>`;
                            }
                        }
                        this.object.newTargetInitative = newInitative;
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
                                <h4 class="dice-total" style="margin-bottom:5px;">${this.object.rollType === 'gambit' ? 'Gambit' : 'Damage'}</h4>
                                <h4 class="dice-formula">${baseDamage} Dice + ${this.object.damage.damageSuccessModifier} successes</h4>
                                ${soakResult}
                                <div class="dice-tooltip">
                                                    <div class="dice">
                                                        <ol class="dice-rolls">${diceRollResults.diceDisplay}</ol>
                                                    </div>
                                                </div>${typeSpecificResults}`;

        var title = "Decisive Attack";
        if (this.object.rollType === 'withering') {
            title = "Withering Attack";
        }
        if (this.object.rollType === 'gambit') {
            title = "Gambit";
        }
        var accuracyContent = ``;
        var messageContent = '';
        if (this.object.rollType !== 'damage') {
            accuracyContent = `
                <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                <div class="dice-tooltip">
                    <div class="dice">
                        <ol class="dice-rolls">${this.object.displayDice}</ol>
                    </div>
                </div>
                <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
                <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Successes</h4>
            `
        }
        else {
            title = 'Damage Roll';
        }

        messageContent = `
                <div class="dice-roll">
                    <div class="dice-result">
                        ${accuracyContent}
                        ${damageResults}
                    </div>
                </div>
          `;

        if (this.object.target) {
            title += ` vs ${this.object.target.actor.name}`
        }


        messageContent = await this._createChatMessageContent(messageContent, title);
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: messageContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            rolls: this.object.roll ? [this.object.roll, diceRollResults.roll] : [diceRollResults.roll],
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

        if (this.actor.system.battlegroup) {
            let combat = game.combat;
            if (this.object.target && combat) {
                if (this.object.targetCombatant && this.object.targetCombatant.initiative != null && this.object.targetCombatant.initiative <= 0) {
                    this.dealHealthDamage(total);
                }
            }
        }
    }

    async _addAttackEffects() {
        var knockdownTriggered = false;
        var onslaughtTriggered = false;
        var triggerGambit = 'none';
        const gambitChart = {
            'leech': 'bleeding',
            'unhorse': 'knockdown',
            'grapple': 'grappled',
            'disarm': 'disarmed',
            'entangle': 'entangled',
        }
        if (this.object.target) {
            if (this.object.triggerKnockdown && this.object.thereshholdSuccesses >= 0) {
                if (game.user.isGM) {
                    const isProne = (this.object.target.actor?.effects.find(e => e.getFlag("core", "statusId") === 'prone'));
                    if (!isProne) {
                        const newProneEffect = CONFIG.statusEffects.find(e => e.id === 'prone');
                        await this.object.target.toggleEffect(newProneEffect);
                    }
                }
                else {
                    knockdownTriggered = true;
                }
            }
            if (this.object.gambitSuccess) {
                if (this.object.gambit !== 'none' && gambitChart[this.object.gambit]) {
                    triggerGambit = gambitChart[this.object.gambit];
                    if (game.user.isGM) {
                        const conditionExists = (this.object.target.actor?.effects.find(e => e.getFlag("core", "statusId") === triggerGambit));
                        if (!conditionExists) {
                            const newStatusEffect = CONFIG.statusEffects.find(e => e.id === triggerGambit);
                            await this.object.target.toggleEffect(newStatusEffect);
                        }
                    }
                }
                if (this.object.gambit === 'leech') {
                    this.dealHealthDamage(1);
                }
                if (this.object.gambit === 'grapple') {
                    const grapplingExists = (this.actor?.effects.find(e => e.getFlag("core", "statusId") === 'grappling'));
                    if (!grapplingExists) {
                        var actorToken = this._getActorToken();
                        const newStatusEffect = CONFIG.statusEffects.find(e => e.id === 'grappling');
                        await actorToken.toggleEffect(newStatusEffect);
                    }
                }
            }
        }
        if (this.object.target) {
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
                                flags: {
                                    "exaltedthird": {
                                        statusId: 'onslaught',
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
                    else {
                        onslaughtTriggered = true;
                        game.socket.emit('system.exaltedthird', {
                            type: 'addOnslaught',
                            id: this.object.target.id,
                            data: { 'knockdownTriggered': knockdownTriggered, 'triggerGambit': triggerGambit },
                        });
                    }
                }
            }
            if (!onslaughtTriggered && (knockdownTriggered || triggerGambit !== 'none')) {
                game.socket.emit('system.exaltedthird', {
                    type: 'triggerEffect',
                    id: this.object.target.id,
                    data: { 'knockdownTriggered': knockdownTriggered, 'triggerGambit': triggerGambit },
                });
            }
            if (this.object.target.actor.system.grapplecontrolrounds.value > 0) {
                const targetActorData = duplicate(this.object.target.actor);
                targetActorData.system.grapplecontrolrounds.value = Math.max(0, targetActorData.system.grapplecontrolrounds.value - (this.object.thereshholdSuccesses >= 0 ? 2 : 1));
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
                    flags: {
                        "exaltedthird": {
                            statusId: 'defensePenalty',
                        }
                    },
                    changes: [
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
                if (goalNumberLeft > 0 && this.object.intervals === 0) {
                    craftFailed = true;
                }
                else if (goalNumberLeft === 0) {
                    craftSuccess = true;
                }
            }
            else {
                craftSuccess = true;
                this.object.finished = true;
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
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <ol class="dice-rolls">${this.object.displayDice}</ol>
                        </div>
                    </div>
                    <h4 class="dice-total">${this.object.total} Successes</h4>
                    ${resultString}
                    ${projectStatus}
                </div>
            </div>
        `

        this.object.finished = craftFailed || craftSuccess;
        messageContent = await this._createChatMessageContent(messageContent, 'Craft Roll');
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

    _getActorCombatant() {
        if (game.combat && (this.actor.token || this.actor.getActiveTokens()[0])) {
            const tokenId = this.actor.token?.id || this.actor.getActiveTokens()[0].id;
            return game.combat.combatants.find(c => c.tokenId === tokenId);
        }
    }

    _getActorToken() {
        if (this.actor.token || this.actor.getActiveTokens()[0]) {
            const tokenId = this.actor.token?.id || this.actor.getActiveTokens()[0].id;
            return canvas.tokens.placeables.filter(x => x.id === tokenId)[0];
        }
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

    async _createChatMessageContent(content, cardName = 'Roll') {
        var actionName = '';
        var martialArtName = '';
        var craftRollName = '';
        var abilityName = this.object.ability;
        if (this.object.rollType === 'action') {
            actionName = this.actor.actions.find(x => x._id === this.object.actionId).name;
        }
        if (this.object.martialarts && this.object.martialarts.some(ma => ma._id === this.object.ability)) {
            abilityName = this.actor.martialarts.find(x => x._id === this.object.ability).name;
        }
        else if (this.object.crafts && this.object.crafts.some(craft => craft._id === this.object.ability)) {
            abilityName = this.actor.crafts.find(x => x._id === this.object.ability).name;
        }
        var showSpecialAttacks = false
        for (var specialAttack of this.object.specialAttacksList) {
            if (specialAttack.added) {
                showSpecialAttacks = true
            }
        }
        const messageData = {
            name: cardName,
            messageContent: content,
            rollData: this.object,
            isAttack: this._isAttackRoll(),
            actionName: actionName,
            martialArtName: martialArtName,
            craftRollName: craftRollName,
            abilityName: abilityName,
            showSpecialAttacks: showSpecialAttacks,
            rollingActor: this.actor,
        }
        return await renderTemplate("systems/exaltedthird/templates/chat/roll-card.html", messageData);
    }

    _getDiceCap() {
        if (this.object.rollType !== "base") {
            if (this.actor.type === "character" && this.actor.system.attributes[this.object.attribute]) {
                if (this.object.rollType === 'damage') {
                    if (this.actor.system.details.exalt === "lunar") {
                        return `${this.actor.system.attributes['strength'].value} - ${this.actor.system.attributes['strength'].value + 5}`;
                    }
                    else {
                        return '';
                    }
                }
                var abilityValue = 0;
                if (this.object.martialarts && this.object.martialarts.some(ma => ma._id === this.object.ability)) {
                    abilityValue = this.actor.martialarts.find(x => x._id === this.object.ability).system.points;
                }
                else if (this.object.crafts && this.object.crafts.some(craft => craft._id === this.object.ability)) {
                    abilityValue = this.actor.crafts.find(x => x._id === this.object.ability).system.points;
                }
                else if (this.actor.system.abilities[this.object.ability]) {
                    abilityValue = this.actor.system.abilities[this.object.ability].value;
                }
                if (this.actor.system.details.exalt === "solar" || this.actor.system.details.exalt === "abyssal") {
                    return abilityValue + this.actor.system.attributes[this.object.attribute].value;
                }
                if (this.actor.system.details.exalt === "dragonblooded") {
                    return abilityValue + (this.object.specialty ? 1 : 0);
                }
                if (this.actor.system.details.exalt === "lunar") {
                    return `${this.actor.system.attributes[this.object.attribute].value} - ${this.actor.system.attributes[this.object.attribute].value + 5}`;
                }
                if (this.actor.system.details.exalt === "sidereal") {
                    var baseSidCap = Math.min(5, Math.max(3, this.actor.system.essence.value));
                    var tnChange = "";
                    if (abilityValue === 5) {
                        if (this.actor.system.essence.value >= 3) {
                            tnChange = " - TN -3";
                        }
                        else {
                            tnChange = " - TN -2";
                        }
                    }
                    else if (abilityValue >= 3) {
                        tnChange = " - TN -1";
                    }
                    return `${baseSidCap}${tnChange}`;
                }
                if (this.actor.system.details.exalt === "dreamsouled") {
                    return `${abilityValue} or ${Math.min(10, abilityValue + this.actor.system.essence.value)} when upholding ideal`;
                }
                if (this.actor.system.details.exalt === "umbral") {
                    return `${Math.min(10, abilityValue + this.actor.system.details.penumbra.value)}`;
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
            else if (this.actor.system.creaturetype === 'exalt') {
                var dicePool = 0;
                if (this.object.actions && this.object.actions.some(action => action._id === this.object.pool)) {
                    dicePool = this.actor.actions.find(x => x._id === this.object.pool).system.value;
                }
                else if (this.actor.system.pools[this.object.pool]) {
                    dicePool = this.actor.system.pools[this.object.pool].value;
                }
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

    _migrateNewData(data) {
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
        if (this.object.restore === undefined) {
            this.object.restore = {
                motes: 0,
                willpower: 0,
                health: 0,
                initiative: 0
            };
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
        if (this.object.damage.decisiveDamageType === undefined) {
            this.object.damage.decisiveDamageType = 'initiative';
            this.object.damage.decisiveDamageCalculation = 'evenSplit';
            this.object.gambit = 'none';
        }
        else {
            for (const addedCharm of this.object.addedCharms) {
                if (!addedCharm.timesAdded) {
                    addedCharm.timesAdded = 1;
                }
                if (addedCharm.saveId) {
                    addedCharm.id = addedCharm.saveId;
                }
                else {
                    var actorItem = this.actor.items.find((item) => item.name == addedCharm.name && item.type == 'charm');
                    if (actorItem) {
                        addedCharm.id = actorItem.id;
                    }
                }
            }
        }
        if (this.object.settings === undefined) {
            this.object.settings = {
                doubleSucccessCaps: {
                    sevens: 0,
                    eights: 0,
                    nines: 0,
                    tens: 0
                },
                excludeOnesFromRerolls: false,
                triggerOnOnes: 'none',
                triggerOnTens: 'none',
                damage: {
                    doubleSucccessCaps: {
                        sevens: 0,
                        eights: 0,
                        nines: 0,
                        tens: 0
                    },
                    excludeOnesFromRerolls: false,
                    triggerOnOnes: 'none'
                }
            }
            this.object.damage.rerollNumber = 0;
            this.object.damage.rerollFailed = false;
            this.object.damage.rollTwice = false;
            this.object.activateAura = 'none';
            for (var rerollValue in this.object.reroll) {
                this.object.reroll[rerollValue].cap = 0;
            }
            for (var rerollValue in this.object.damage.reroll) {
                this.object.damage.reroll[rerollValue].cap = 0;
            }
        }
        if (this.object.settings.triggerOnTens === undefined) {
            this.object.settings.triggerOnTens = 'none';
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
        if (this.object.charmDiceAdded === undefined) {
            this.object.charmDiceAdded = 0;
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
        if (this.object.applyAppearance === undefined) {
            this.object.applyAppearance = false;
            this.object.appearanceBonus = 0;
        }
    }

    async _updateCharacterResources() {
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
        if (this.actor.type === 'character') {
            actorData.system.craft.experience.silver.value = Math.max(0, actorData.system.craft.experience.silver.value - this.object.cost.silverxp);
            actorData.system.craft.experience.gold.value = Math.max(0, actorData.system.craft.experience.gold.value - this.object.cost.goldxp);
            actorData.system.craft.experience.white.value = Math.max(0, actorData.system.craft.experience.white.value - this.object.cost.whitexp);
        }
        if (actorData.system.details.aura === this.object.cost.aura || this.object.cost.aura === 'any') {
            actorData.system.details.aura = "none";
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
        if (this.object.activateAura !== 'none') {
            actorData.system.details.aura = this.object.activateAura;
        }
        if (actorData.system.settings.charmmotepool === 'personal') {
            actorData.system.motes.personal.value = Math.min(actorData.system.motes.personal.max, actorData.system.motes.personal.value + this.object.restore.motes);
        }
        else {
            actorData.system.motes.peripheral.value = Math.min(actorData.system.motes.peripheral.max, actorData.system.motes.peripheral.value + this.object.restore.motes);
        }
        actorData.system.willpower.value = Math.min(actorData.system.willpower.max, actorData.system.willpower.value + this.object.restore.willpower);
        if(this.object.restore.health > 0) {
            const bashingHealed = this.object.restore.health - actorData.system.health.lethal;
            actorData.system.health.lethal = Math.max(0, actorData.system.health.lethal - this.object.restore.health);
            if(bashingHealed > 0) {
                actorData.system.health.bashing = Math.max(0, actorData.system.health.bashing - bashingHealed);
            }
        }
        if (game.combat) {
            let combatant = this._getActorCombatant();
            if (combatant) {
                if (this.object.characterInitiative === undefined) {
                    this.object.characterInitiative = combatant.initiative;
                }
                if (this.object.cost.initiative > 0) {
                    this.object.characterInitiative -= this.object.cost.initiative;
                    if (combatant.initiative > 0 && this.object.characterInitiative <= 0) {
                        this.object.characterInitiative -= 5;
                    }
                }
                if(this.object.restore.initiative > 0) {
                    this.object.characterInitiative += this.object.restore.initiative;
                }
                game.combat.setInitiative(combatant.id, this.object.characterInitiative);
            }
        }
        this.actor.update(actorData);
    }

    attackSequence() {
        const actorToken = this._getActorToken();
        if (this.object.target && actorToken && game.settings.get("exaltedthird", "attackEffects")) {
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
    const tokenId = actor.token?.id || actor.getActiveTokens()[0]?.id;
    const actorToken = canvas.tokens.placeables.filter(x => x.id === tokenId)[0];
    if (game.settings.get("exaltedthird", "animaTokenMagic") && actorToken) {
        let effectColor = Number(`0x${actor.system.details.animacolor.replace('#', '')}`);
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
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class RollForm extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, options, object, data) {
        super(options);
        this.object = {};
        this.actor = actor;
        this.selects = CONFIG.exaltedthird.selects;
        this.rollableAbilities = { ...CONFIG.exaltedthird.selects.abilities };
        this.rollableAbilities['willpower'] = "Ex3.Willpower";
        this.rollablePools = CONFIG.exaltedthird.npcpools;
        this.rollablePools['willpower'] = "Ex3.Willpower";
        this.messageId = data.preMessageId;
        this.search = "";
        this.object.totalDice = 0;

        if (data.lastRoll) {
            this.object = foundry.utils.duplicate(this.actor.flags.exaltedthird.lastroll);
            this.object.skipDialog = false;
        }
        else if (data.rollId) {
            this.object = foundry.utils.duplicate(this.actor.system.savedRolls[data.rollId]);
            this.object.skipDialog = data.skipDialog || true;
            this.object.isSavedRoll = true;
        }
        else {
            this.object.isSavedRoll = false;
            this.object.skipDialog = data.skipDialog || true;
            this.object.crashed = false;
            this.object.dice = data.dice || 0;
            this.object.diceModifier = 0;
            this.object.penaltyModifier = 0;
            this.object.ignorePenalties = 0;
            this.object.successes = data.successModifier || 0;
            this.object.successModifier = data.successModifier || 0;
            this.object.craftType = data.craftType || 'basic';
            this.object.craftRating = data.craftRating || 0;
            this.object.splitAttack = false;
            this.object.rollType = data.rollType;
            this.object.targetStat = 'defense';
            this.object.specialty = '';
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
            else if (data.rollType === 'gambit-split') {
                this.object.rollType = 'accuracy';
                this.object.splitAttack = true;
                this.object.attackType = 'gambit';
            }
            this.object.cost = {
                motes: 0,
                penumbra: 0,
                muteMotes: 0,
                willpower: 0,
                initiative: 0,
                anima: 0,
                healthbashing: 0,
                healthlethal: 0,
                healthaggravated: 0,
                grappleControl: 0,
                silverxp: 0,
                goldxp: this.object.craftType === 'superior' ? 10 : 0,
                whitexp: this.object.craftType === 'legendary' ? 10 : 0,
                aura: "",
            };
            this.object.restore = {
                motes: 0,
                willpower: 0,
                health: 0,
                initiative: 0
            };
            this.object.steal = {
                motes: {
                    max: 0,
                    gained: 0,
                },
                willpower: {
                    max: 0,
                    gained: 0,
                },
                health: {
                    max: 0,
                    gained: 0,
                },
                initiative: {
                    max: 0,
                    gained: 0,
                },
            };
            this.object.targetDoesntResetOnslaught = false;
            this.object.showPool = !this._isAttackRoll();
            this.object.showWithering = this.object.attackType === 'withering' || this.object.rollType === 'damage';
            this.object.hasDifficulty = (['ability', 'command', 'grappleControl', 'readIntentions', 'social', 'craft', 'working', 'rout', 'craftAbilityRoll', 'martialArt', 'rush', 'disengage', 'prophecy', 'steady', 'simpleCraft'].indexOf(data.rollType) !== -1);
            this.object.hasIntervals = (['craft', 'prophecy', 'working',].indexOf(data.rollType) !== -1);
            this.object.stunt = "none";
            this.object.goalNumber = 0;
            this.object.woundPenalty = this.object.rollType === 'base' ? false : true;
            this.object.intervals = 0;
            this.object.difficulty = data.difficulty || 0;
            this.object.resolve = 0;
            this.object.guile = 0;
            this.object.attackEffectPreset = data.attackEffectPreset || 'none';
            this.object.attackEffect = data.attackEffect || '';
            this.object.weaponAccuracy = 0;
            this.object.charmDiceAdded = 0;
            this.object.triggerSelfDefensePenalty = 0;
            this.object.triggerTargetDefensePenalty = 0;
            this.object.onslaughtAddition = 1;
            this.object.magicOnslaughtAddition = 0;

            this.object.triggerKnockdown = false;
            this.object.triggerFullDefense = false;
            this.object.macroMessages = '';

            this.object.overwhelming = data.overwhelming || 0;
            this.object.soak = 0;
            this.object.shieldInitiative = 0;
            this.object.armoredSoak = 0;
            this.object.naturalSoak = 0;
            this.object.defense = 0;
            this.object.hardness = 0;
            this.object.characterInitiative = 0;
            this.object.gambitDifficulty = 0;
            this.object.maxCraftXP = 5;
            this.object.craftProjectId = data.craftProjectId || '';
            this.object.addedCharmsDropdown = this.object.rollType === 'useOpposingCharms';

            this.object.gambit = 'none';
            this.object.weaponTags = {};

            this.object.weaponType = data.weaponType || 'melee';
            this.object.range = 'close';

            this.object.isFlurry = false;
            this.object.isClash = false;
            this.object.armorPenalty = (this.object.rollType === 'rush' || this.object.rollType === 'disengage');
            this.object.willpower = false;
            this.object.willpowerTest = "no";

            this.object.supportedIntimacy = 0;
            this.object.opposedIntimacy = 0;
            this.object.applyAppearance = false;
            this.object.appearanceBonus = 0;

            this.object.doubleSuccess = 10;
            this.object.rerollFailed = false;
            this.object.rollTwice = false;
            this.object.rollTwiceLowest = false;
            this.object.targetNumber = 7;
            this.object.rerollNumber = 0;
            this.object.rerollNumberDescending = 0;
            this.object.rerollSuccesses = 0;
            this.object.attackSuccesses = 0;
            this.object.doubleThresholdSuccesses = 0;
            this.object.triggerMessages = [];

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
                triggerOnTens: 'none',
                triggerTensCap: 0,
                type: 'lethal',
                threshholdToDamage: false,
                cappedThreshholdToDamage: 0,
                resetInit: true,
                maxInitiativeGain: null,
                doubleRolledDamage: false,
                doublePreRolledDamage: false,
                ignoreSoak: 0,
                ignoreHardness: 0,
                gainInitiative: !this.actor?.system?.battlegroup,
                multiTargetMinimumInitiative: 0,
                rerollFailed: false,
                rollTwice: false,
                rollTwiceLowest: false,
                rerollNumber: 0,
                rerollNumberDescending: 0,
                rerollSuccesses: 0,
                decisiveDamageType: 'initiative',
                decisiveDamageCalculation: 'evenSplit',
                diceToSuccesses: 0,
                doubleThresholdSuccesses: 0,
            };
            this.object.poison = null;
            this.object.settings = {
                doubleSucccessCaps: {
                    sevens: 0,
                    eights: 0,
                    nines: 0,
                    tens: 0
                },
                excludeOnesFromRerolls: false,
                triggerOnOnes: 'none',
                alsoTriggerTwos: false,
                triggerOnesCap: 0,
                triggerOnTens: 'none',
                alsoTriggerNines: false,
                triggerTensCap: 0,
                ignoreLegendarySize: false,
                doubleThresholdSuccessCap: 0,
                damage: {
                    doubleSucccessCaps: {
                        sevens: 0,
                        eights: 0,
                        nines: 0,
                        tens: 0
                    },
                    excludeOnesFromRerolls: false,
                    triggerOnTens: 'none',
                    alsoTriggerNines: false,
                    triggerTensCap: 0,
                    triggerOnOnes: '',
                    alsoTriggerTwos: false,
                    triggerOnesCap: 0,
                    doubleThresholdSuccessCap: 0,
                }
            }
            this.object.activateAura = '';
            this.object.addStatuses = [];
            this.object.addSelfStatuses = [];
            this.object.addOppose = {
                addedBonus: {
                    dice: 0,
                    successes: 0,
                    defense: 0,
                    soak: 0,
                    guile: 0,
                    resolve: 0,
                    hardness: 0,
                    damage: 0,
                },
                manualBonus: {
                    dice: 0,
                    successes: 0,
                    defense: 0,
                    soak: 0,
                    guile: 0,
                    resolve: 0,
                    hardness: 0,
                    damage: 0,
                }
            }
            this.object.craft = {
                divineInsperationTechnique: false,
                holisticMiracleUnderstanding: false,
            };
            this.object.specificCharms = {
                divineInsperationTechnique: false,
                holisticMiracleUnderstanding: false,
                risingSunSlash: false,
                firstMovementoftheDemiurge: false,
            }
            this.object.triggers = [];
            this.object.spell = "";
            if (this.object.rollType !== 'base') {
                this.object.characterType = this.actor.type;

                if (this.actor.type === 'character') {
                    if (this._isAttackRoll()) {
                        this.object.attribute = this.actor.system.settings.rollsettings['attacks'].attribute;
                        this.object.ability = this.actor.system.settings.rollsettings['attacks'].ability;
                    }
                    else if (this.object.rollType === 'working') {
                        this.object.attribute = this.actor.system.settings.rollsettings['sorcery'].attribute;
                        this.object.ability = this.actor.system.settings.rollsettings['sorcery'].ability;
                    }
                    else if (this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()]) {
                        this.object.attribute = this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()].attribute;
                        this.object.ability = this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()].ability;
                    }
                    else {
                        this.object.attribute = data.attribute || this._getHighestAttribute(this.actor.system.attributes);
                        this.object.ability = data.ability || "archery";
                    }
                    if (this.object.rollType === 'ability' && this.object.ability === 'craft') {
                        this.object.diceModifier += this.actor.system.settings.rollsettings['craft'].bonus;
                    }
                    this.object.customabilities = this.actor.customabilities;
                    if (this.object.customabilities.some(ma => ma._id === this.object.ability && ma.system.abilitytype === 'martialart')) {
                        this.object.attribute = this.actor.system.abilities['martialarts'].prefattribute;
                    }
                    if (this.object.customabilities.some(craft => craft._id === this.object.ability && craft.system.abilitytype === 'craft')) {
                        this.object.attribute = this.actor.system.abilities['craft'].prefattribute;
                    }
                    if (this.object.customabilities.some(craft => craft._id === this.object.ability && craft.system.attribute !== 'default')) {
                        this.object.attribute = this.object.customabilities.find(craft => craft._id === this.object.ability).system.attribute;
                    }
                    this.object.appearance = this.actor.system.attributes.appearance.value;
                }
                if (this._isAttackRoll()) {
                    this.object.diceModifier += this.actor.system.settings.rollsettings['attacks'].bonus;
                    if (this.actor.system.settings.attackrollsettings[this.object.attackType]) {
                        this.object.diceModifier += this.actor.system.settings.attackrollsettings[this.object.attackType].bonus;
                        this.object.damage.damageDice += this.actor.system.settings.attackrollsettings[this.object.attackType].damage;
                        this.object.overwhelming += (this.actor.system.settings.attackrollsettings[this.object.attackType]?.overwhelming || 0);
                    }
                }
                else if (this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()]) {
                    this.object.diceModifier += this.actor.system.settings.rollsettings[this.object.rollType.toLowerCase()].bonus;
                }

                if (this.actor.system.settings.rollStunts) {
                    this.object.stunt = "one";
                }

                if (this.actor.type === "npc") {
                    this.object.actions = this.actor.actions;
                    this.object.pool = data.pool || "command";
                    this.object.appearance = this.actor.system.appearance.value;
                }
                if (data.weapon) {
                    this.object.weaponTags = data.weapon.traits?.weapontags?.selected || {};
                    this.object.damage.resetInit = data.weapon.resetinitiative;
                    this.object.poison = data.weapon.poison;
                    this.object.targetStat = data.weapon.targetstat;
                    if (this.actor.type === 'character') {
                        this.object.attribute = data.weapon.attribute || this._getHighestAttribute(this.actor.system.attributes);
                        this.object.ability = data.weapon.ability || "archery";
                    }
                    if (this.object.attackType === 'withering' || this.actor.type === "npc" || (!data.weapon.ability && !data.weapon.attribute)) {
                        this.object.diceModifier += data.weapon.witheringaccuracy || 0;
                        this.object.baseAccuracy = data.weapon.witheringaccuracy || 0;
                        this.object.weaponAccuracy = data.weapon.witheringaccuracy || 0;
                        if (this.object.attackType === 'withering') {
                            this.object.damage.damageDice += data.weapon.witheringdamage || 0;
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
                        this.object.damage.damageDice += data.weapon.staticdamage;
                        this.object.damage.decisiveDamageType = 'static';
                    }
                    if (this.object.weaponTags["bashing"] && !this.object.weaponTags["lethal"]) {
                        this.object.damage.type = 'bashing';
                    }
                    if (this.object.weaponTags['aggravated']) {
                        this.object.damage.type = 'aggravated';
                    }
                    if (this.object.weaponTags["improvised"]) {
                        this.object.cost.initiative += 1;
                    }
                    this.object.overwhelming += (data.weapon.overwhelming || 0);
                    this.object.weaponType = data.weapon.weapontype || "melee";
                    this.object.range = this.object.weaponType === 'melee' ? 'close' : 'short';
                    this.object.attackEffectPreset = data.weapon.attackeffectpreset || "none";
                    this.object.attackEffect = data.weapon.attackeffect || "";
                    this.object.weaponMacro = data.weapon.attackmacro || "";
                }
                this.object.difficultyString = 'Ex3.Difficulty';
                if (this.object.rollType === 'readIntentions') {
                    this.object.difficultyString = 'Ex3.Guile';
                }
                if (this.object.rollType === 'social') {
                    this.object.difficultyString = 'Ex3.Resolve';
                }

                if (data.initiativeCost) {
                    this.object.cost.initiative += data.initiativeCost;
                }
                if (this.object.rollType === 'craft') {
                    this.object.intervals = 1;
                    this.object.finished = false;
                    this.object.objectivesCompleted = 0;
                    this._getCraftDifficulty();
                }
                this.object.finesse = 1;
                this.object.ambition = 5;

                if (this.object.rollType === 'working') {
                    this.object.intervals = 5;
                    this.object.goalNumber = 5;
                    this.object.difficulty = 1;
                }
                if (this.object.rollType === 'prophecy') {
                    this.object.intervals = 5 + data.bonusIntervals;
                    this.object.goalNumber = data.prophecyAmbition * 5;
                    this.object.difficulty = 3;
                }
                if (this.object.rollType === 'rout') {
                    this.object.difficulty = 1;
                    if (parseInt(this.actor.system.drill.value) === 0) {
                        this.object.difficulty = 2;
                    }
                }
                if (this.object.rollType === 'command') {
                    this.object.difficulty = 1;
                }
                if (this.object.rollType === 'simpleCraft') {
                    this.object.difficulty = data.difficulty || 1;
                }
                this.object.opposeCaps = {
                    parry: this.actor.system.parry,
                    evasion: this.actor.system.evasion,
                    soak: this.actor.system.soak.cap,
                    guile: this.actor.system.parry.cap,
                    resolve: this.actor.system.resolve.cap,
                }
            }
        }
        this.object.addingCharms = false;
        this.object.showSpecialAttacks = false;
        this.object.missedAttacks = 0;
        this.object.deleteEffects = [];
        this.object.useShieldInitiative = game.settings.get("exaltedthird", "useShieldInitiative");
        this.object.bankableStunts = game.settings.get("exaltedthird", "bankableStunts");
        this.object.simplifiedCrafting = game.settings.get("exaltedthird", "simplifiedCrafting");
        this.object.useEssenceGambit = game.settings.get("exaltedthird", "useEssenceGambits");
        this.object.attributes = CONFIG.exaltedthird.attributes;
        this.object.abilities = CONFIG.exaltedthird.abilities;
        this.object.npcPools = CONFIG.exaltedthird.npcpools;
        this.object.stuntsList = {
            "none": "Ex3.NoStunt",
            "one": "Ex3.LevelOneStunt",
        };
        if (this.object.bankableStunts) {
            this.object.stuntsList['bank'] = "Ex3.BankStunt";
        } else {
            this.object.stuntsList['two'] = "Ex3.LevelTwoStunt";
            this.object.stuntsList['three'] = "Ex3.LevelThreeStunt";
        }
        this._migrateNewData(data);
        if (this.object.rollType !== 'base') {
            if (this.actor.customabilities) {
                // Add custom abilities from actor.customabilities
                for (const [id, ability] of Object.entries(this.actor.customabilities)) {
                    this.rollableAbilities[ability._id] = ability.name;
                }
            }
            if (this.actor.actions) {
                for (const [id, pool] of Object.entries(this.actor.actions)) {
                    this.rollablePools[pool._id] = pool.name;
                }
            }
            this.object.showTargets = 0;
            if (this.actor.customabilities) {
                this.object.customAbilities = this.actor.customabilities;
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
            if (this.object.charmList === undefined) {
                this.object.charmList = this.object.rollType === 'useOpposingCharms' ? this.actor.defensecharms : this.actor.rollcharms;
                if (this.object.rollType !== 'useOpposingCharms') {
                    this.object.charmList = { ...this.object.charmList, ...this.actor.spells };
                }
                if (this.object.rollType !== 'useOpposingCharms') {
                    if (this.actor.merits.some(merit => Object.keys(merit.system.triggers.dicerollertriggers)?.length > 0)) {
                        this.object.charmList['merits'] = {
                            name: game.i18n.localize("Ex3.Merits"),
                            list: this.actor.items.filter(merit => merit.type === 'merit' && Object.keys(merit.system.triggers.dicerollertriggers)?.length > 0),
                            visible: true,
                            collapse: true,
                        }
                    }
                    if (this.actor.specialabilities.some(sAbility => Object.keys(sAbility.system.triggers.dicerollertriggers)?.length > 0)) {
                        this.object.charmList['specialabilities'] = {
                            name: game.i18n.localize("Ex3.SpecialAbilities"),
                            list: this.actor.items.filter(sAbility => sAbility.type === 'specialability' && Object.keys(sAbility.system.triggers.dicerollertriggers)?.length > 0),
                            visible: true,
                            collapse: true,
                        }
                    }
                    if (this.actor.gear.some(item => Object.keys(item.system.triggers.dicerollertriggers)?.length > 0)) {
                        this.object.charmList['items'] = {
                            name: game.i18n.localize("Ex3.Items"),
                            list: this.actor.items.filter(item => item.type === 'item' && Object.keys(item.system.triggers.dicerollertriggers)?.length > 0),
                            visible: true,
                            collapse: true,
                        }
                    }
                    if (this.actor.weapons.some(item => Object.keys(item.system.triggers.dicerollertriggers)?.length > 0)) {
                        this.object.charmList['weapons'] = {
                            name: game.i18n.localize("Ex3.Weapons"),
                            list: this.actor.items.filter(item => item.type === 'weapon' && Object.keys(item.system.triggers.dicerollertriggers)?.length > 0),
                            visible: true,
                            collapse: true,
                        }
                    }
                }
                for (var [ability, charmlist] of Object.entries(this.object.charmList)) {
                    charmlist.collapse = (ability !== this.object.ability && ability !== this.object.attribute);
                    for (const charm of charmlist.list) {
                        this.getEnritchedHTML(charm);
                    }
                }
            }
            this._updateSpecialtyList();
            if (this.actor.system.dicemodifier.value) {
                this.object.diceModifier += this.actor.system.dicemodifier.value;
            }
            if (this.actor.system.penaltymodifier.value) {
                this.object.penaltyModifier += this.actor.system.penaltymodifier.value;
            }
            let combat = game.combat;
            if (combat) {
                let combatant = this._getActorCombatant();
                if (combatant && combatant.initiative !== null) {
                    if (!this.object.showWithering) {
                        if (data.weapon && this.object.damage.decisiveDamageType === 'initiative') {
                            this.object.damage.damageDice += combatant.initiative;
                        }
                    }
                    this.object.characterInitiative = combatant.initiative;
                    this.object.originalInitiative = combatant.initiative;
                }
            }
            this.object.targets = {}
            if (this.actor.token) {
                this.object.conditions = (this.actor.token && this.actor.token.actor.effects) ? this.actor.token.actor.effects : [];
            }
            else {
                this.object.conditions = this.actor.effects;
            }
            if (game.user.targets && game.user.targets.size > 0) {
                this.object.showTargets = game.user.targets.size;
                if (this._isAttackRoll() || this.object.rollType === 'social' || this.object.rollType === 'readIntentions') {
                    this._setUpMultitargets();
                }
                else {
                    this._setupSingleTarget(Array.from(game.user.targets)[0]);
                }
            }
            if (this.object.conditions.some(e => e.name === 'blind')) {
                this.object.diceModifier -= 3;
            }
            if (this._isAttackRoll()) {
                if (this.object.conditions.some(e => e.statuses.has('prone'))) {
                    this.object.diceModifier -= 3;
                }
                if (this.object.conditions.some(e => e.statuses.has('grappled'))) {
                    this.object.diceModifier -= 1;
                }
            }
            this.object.motePool = this.actor.system?.settings?.charmmotepool || 'peripheral';
            this.object.spells = this.actor.items.filter(item => item.type === 'spell' && item.system.cost).reduce((acc, spell) => {
                acc[spell.id] = spell.name;
                return acc;
            }, {}) ?? {};
            this.object.spells[''] = 'Ex3.None';
            if (data.rollType === 'sorcery') {
                const activeSpell = this.actor.items.filter(item => item.type === 'spell' && item.system.cost).find(spell => spell.system.shaping);
                if (data.spell) {
                    const fullSpell = this.actor.items.get(data.spell);
                    if (!activeSpell || activeSpell.id !== data.spell) {
                        this.object.cost.willpower += parseInt(fullSpell.system.willpower);
                    }
                    this.object.spell = data.spell;
                }
                else {
                    if (activeSpell) {
                        this.object.spell = activeSpell.id;
                    }
                }
            }

            for (var [ability, charmlist] of Object.entries(this.object.charmList)) {
                for (const charm of charmlist.list.filter(charm => (charm.system.active && this._autoAddCharm(charm)) || (charm.type === 'weapon' && data.weapon?.parent?.id === charm.id))) {
                    this.addCharm(charm, false);
                }
            }

            this._calculateAnimaGain();
        }
    }
    static DEFAULT_OPTIONS = {
        window: {
            title: "Dice Roller",
            resizable: true,
            controls: [
                {
                    icon: 'fa-solid fa-dice-d6',
                    label: "Save Roll",
                    action: "saveRoll",
                },
                {
                    icon: 'fa-solid fa-cog',
                    label: "Settings",
                    action: "editSettings",
                },
            ]
        },
        // position: { width: 730 },
        position: { width: 730, height: 600 },
        tag: "form",
        form: {
            handler: RollForm.myFormHandler,
            submitOnClose: false,
            submitOnChange: true,
            closeOnSubmit: false
        },
        classes: [`solar-background`],
        actions: {
            saveRoll: RollForm.saveRoll,
            editSettings: RollForm.editSettings,
            enableAddCharms: RollForm.enableAddCharms,
            triggerRemoveCharm: RollForm.triggerRemoveCharm,
            showGambitDialog: RollForm.showGambitDialog,
            triggerAddCharm: RollForm.triggerAddCharm,
            addSpecialAttack: RollForm.addSpecialAttack,
            removeSpecialAttack: RollForm.removeSpecialAttack,
            removeOpposingCharm: RollForm.removeOpposingCharm,
        },
    };

    static PARTS = {
        header: {
            template: "systems/exaltedthird/templates/dialogues/dice-roll/dice-roll-header.html",
        },
        tabs: { template: 'systems/exaltedthird/templates/dialogues/tabs.html' },
        dice: {
            template: "systems/exaltedthird/templates/dialogues/dice-roll/dice-tab.html",
        },
        damage: {
            template: "systems/exaltedthird/templates/dialogues/dice-roll/damage-tab.html",
        },
        targets: {
            template: "systems/exaltedthird/templates/dialogues/dice-roll/targets-tab.html",
        },
        cost: {
            template: "systems/exaltedthird/templates/dialogues/dice-roll/cost-tab.html",
        },
        charms: {
            template: "systems/exaltedthird/templates/dialogues/dice-roll/charms-tab.html",
        },
        footer: {
            template: "systems/exaltedthird/templates/dialogues/dice-roll/dice-roll-footer.html",
        },
    };

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        if (this.object.rollType === 'base') {
            options.parts = ['dice', 'footer'];
        }
        if (this.object.rollType === 'useOpposingCharms') {
            options.parts = ['tabs', 'dice', 'cost', 'charms', 'footer'];
        }
        // if(options.position?.height === 'auto') {
        //     options.position.height = 550;
        // }
    }

    resolve = function (value) { return value };

    get resolve() {
        return this.resolve
    }

    set resolve(value) {
        this.resolve = value;
    }

    async _prepareContext(_options) {
        if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'dice';
        this.selects = CONFIG.exaltedthird.selects;
        const tabs = [
            {
                id: "dice",
                group: "primary",
                label: this._isAttackRoll() ? "Ex3.Accuracy" : "Ex3.Dice",
                cssClass: this.tabGroups['primary'] === 'dice' ? 'active' : '',
            },
        ];
        if (this._isAttackRoll()) {
            tabs.push({
                id: "damage",
                group: "primary",
                label: this.object.attackType === 'gambit' ? "Ex3.Initiative" : "Ex3.Damage",
                cssClass: this.tabGroups['primary'] === 'damage' ? 'active' : '',
            });
        }
        if ((this._isAttackRoll() || this.object.hasDifficulty || this.object.showTargets) && this.object.rollType !== 'useOpposingCharms') {
            tabs.push({
                id: "targets",
                group: "primary",
                label: this.object.showTargets ? "Ex3.Targets" : "Ex3.Difficulty",
                cssClass: this.tabGroups['primary'] === 'targets' ? 'active' : '',
            });
        }
        tabs.push({
            id: "cost",
            group: "primary",
            label: "Ex3.Cost",
            cssClass: this.tabGroups['primary'] === 'cost' ? 'active' : '',
        });
        tabs.push({
            id: "charms",
            group: "primary",
            label: "Ex3.Charms",
            cssClass: this.tabGroups['primary'] === 'charms' ? 'active' : '',
        });

        const penalties = [];
        const triggers = [];
        const effectsAndTags = [];

        if (this.actor) {
            for (const condition of this.actor.allApplicableEffects()) {
                if (condition.statuses.has('prone')) {
                    penalties.push(
                        {
                            img: "icons/svg/falling.svg",
                            name: "Ex3.Prone",
                            summary: "-3 dice on attacks"
                        },
                    );
                }
                else if (condition.statuses.has('blind')) {
                    penalties.push(
                        {
                            name: "Ex3.Blind",
                            summary: "-3 dice"
                        },
                    );
                }
                else if (condition.statuses.has('grappled')) {
                    penalties.push(
                        {
                            img: "systems/exaltedthird/assets/icons/grab.svg",
                            name: "Ex3.Grappled",
                            summary: "-1 dice on attacks"
                        },
                    );
                } else {
                    effectsAndTags.push(
                        {
                            img: condition.img,
                            name: condition.name,
                        },
                    );
                }
            }
            if (this.object.woundPenalty) {
                penalties.push(
                    {
                        name: "Ex3.WoundPenalty",
                        summary: `${this.actor.system.health.penalty * -1} Dice`
                    },
                );
            }
            if (this.object.armorPenalty) {
                let armorPenaltyDice = 0
                for (let armor of this.actor.armor) {
                    if (armor.system.equipped) {
                        armorPenaltyDice -= Math.abs(armor.system.penalty);
                    }
                }
                penalties.push(
                    {
                        name: "Ex3.ArmorPenalty",
                        summary: `${armorPenaltyDice} Dice`
                    },
                );
            }
            if (this.actor.system.battlegroup) {
                effectsAndTags.push({
                    name: "Ex3.CommandBonus",
                    summary: this.actor.system.commandbonus.value
                });
                if (this._isAttackRoll()) {
                    effectsAndTags.push({
                        name: "Ex3.Size",
                        summary: this.actor.system.size.value
                    });
                    effectsAndTags.push({
                        name: "Ex3.Might",
                        summary: this.actor.system.might.value
                    });         
                }
            }
        }

        if (this._isAttackRoll()) {
            if (this.object.weaponTags["flame"]) {
                effectsAndTags.push({
                    name: "Ex3.Flame",
                    summary: "+2 Dice at Close Range"
                });
            }
            if (this.object.weaponTags["crossbow"]) {
                effectsAndTags.push({
                    name: "Ex3.Crossbow",
                    summary: "+2 Dice at Close Range"
                });
            }
            if (this.object.weaponTags["unblockable"]) {
                effectsAndTags.push({
                    name: "Ex3.Unblockable",
                    summary: "Target cannot use parry"
                });
            }
            if (this.object.weaponTags["undodgeable"]) {
                effectsAndTags.push({
                    name: "Ex3.Undodgeable",
                    summary: "Target cannot use evasion"
                });
            }
            if (this.object.weaponTags["flexible"]) {
                effectsAndTags.push({
                    name: "Ex3.Flexible",
                    summary: "Ignores Full Defense bonuses."
                });
            }
            if (this.object.weaponTags["improvised"]) {
                penalties.push(
                    {
                        name: "Ex3.ImprovisedWeapon",
                        summary: "+1 Initiative Cost"
                    },
                )
            }
            if (this.object.weaponTags["bombard"]) {
                penalties.push({
                    name: "Ex3.Bombard",
                    summary: "-4 Dice vs Non-Battlegroups"
                });
            }
            if (this.object.range !== 'short' && this.object.weaponType !== 'melee' && (this.actor.type === 'npc' || this.object.attackType === 'withering')) {
                if (this._getRangedAccuracy() < 0) {
                    penalties.push({
                        name: "Ex3.Range",
                        summary: `${this._getRangedAccuracy()} dice`
                    });
                }
                if (this._getRangedAccuracy() > 0) {
                    effectsAndTags.push({
                        name: "Ex3.Range",
                        summary: `${this._getRangedAccuracy()} dice`
                    });
                }
            }
        }
        if (this.object.isFlurry) {
            penalties.push(
                {
                    img: "systems/exaltedthird/assets/icons/spinning-blades.svg",
                    name: "Ex3.Flurry",
                    summary: "-3 Dice"
                },
            )
        }

        for (const charm of this.object.addedCharms) {
            if (charm.system.triggers) {
                for (const trigger of Object.values(charm.system.triggers.dicerollertriggers)) {
                    triggers.push({
                        name: trigger.name || "No Name Trigger"
                    });
                }
            }
        }

        const baseOpposedBonuses = {
            dice: 0,
            successes: 0,
            defense: 0,
            soak: 0,
            hardness: 0,
            resolve: 0,
            guile: 0,
            damage: 0,
        }

        const totalOpposedBonuses = {
            dice: 0,
            successes: 0,
            defense: 0,
            soak: 0,
            hardness: 0,
            resolve: 0,
            guile: 0,
            damage: 0,
        }

        if (this.object.rollType === 'useOpposingCharms') {
            if (this.actor) {
                baseOpposedBonuses.defense = Math.max(this.actor.system.parry.value, this.actor.system.evasion.value);
                baseOpposedBonuses.hardness = this.actor.system.hardness.value;
                baseOpposedBonuses.soak = this.actor.system.soak.value;
                baseOpposedBonuses.resolve = this.actor.system.resolve.value;
                baseOpposedBonuses.guile = this.actor.system.guile.value;
            }
            totalOpposedBonuses.dice = baseOpposedBonuses.dice + this.object.addOppose.manualBonus.dice + this.object.addOppose.addedBonus.dice;
            totalOpposedBonuses.successes = baseOpposedBonuses.successes + this.object.addOppose.manualBonus.successes + this.object.addOppose.addedBonus.successes;
            totalOpposedBonuses.defense = baseOpposedBonuses.defense + this.object.addOppose.manualBonus.defense + this.object.addOppose.addedBonus.defense;
            totalOpposedBonuses.soak = baseOpposedBonuses.soak + this.object.addOppose.manualBonus.soak + this.object.addOppose.addedBonus.soak;
            totalOpposedBonuses.hardness = baseOpposedBonuses.hardness + this.object.addOppose.manualBonus.hardness + this.object.addOppose.addedBonus.hardness;
            totalOpposedBonuses.damage = baseOpposedBonuses.damage + this.object.addOppose.manualBonus.damage + this.object.addOppose.addedBonus.damage;
            totalOpposedBonuses.resolve = baseOpposedBonuses.resolve + this.object.addOppose.manualBonus.resolve + this.object.addOppose.addedBonus.resolve;
            totalOpposedBonuses.guile = baseOpposedBonuses.guile + this.object.addOppose.manualBonus.guile + this.object.addOppose.addedBonus.guile;
        } else if (this.object.rollType !== 'base') {
            if (this.object.rollType === 'damage') {
                this.object.totalDice = await this._assembleDamagePool(true);
            } else {
                this.object.totalDice = await this._assembleDicePool(true);
            }
        }

        return {
            actor: this.actor,
            selects: this.selects,
            rollableAbilities: this.rollableAbilities,
            rollablePools: this.rollablePools,
            data: this.object,
            tab: this.tabGroups['primary'],
            tabs: tabs,
            isAttackRoll: this._isAttackRoll(),
            penalties: penalties,
            triggers: triggers,
            effectsAndTags: effectsAndTags,
            baseOpposedBonuses: baseOpposedBonuses,
            totalOpposedBonuses: totalOpposedBonuses,
            buttons: [
                { type: "submit", icon: "fa-solid fa-dice-d10", label: this.object.rollType === 'useOpposingCharms' ? "Ex3.Add" : "Ex3.Roll" },
                { action: "close", type: "button", icon: "fa-solid fa-xmark", label: "Ex3.Cancel" },
            ],
        };
    }

    async _preparePartContext(partId, context) {
        context.tab = context.tabs.find(item => item.id === partId);
        // if (this.object.addingCharms) {
        //     context.hideElement = (partId !== 'addCharms' ? 'hide-element' : '')
        // } else {
        //     context.hideElement = (partId === 'addCharms' ? 'hide-element' : '')
        // }
        return context;
    }

    _onSearchFilter(_event, _query, rgx, html) {
        console.log("Search");
    }

    static async myFormHandler(event, form, formData) {
        // Do things with the returned FormData
        const formObject = foundry.utils.expandObject(formData.object);
        const finesseChange = formObject.object.finesse !== undefined && this.object.finesse !== formObject.object.finesse;
        const ambitionChange = formObject.object.ambition !== undefined && this.object.ambition !== formObject.object.ambition;
        const gambitChange = formObject.object.gambit !== undefined && this.object.gambit !== formObject.object.gambit;
        const craftTypeChange = formObject.object.craftType !== undefined && this.object.craftType !== formObject.object.craftType;
        const craftRating = formObject.object.craftRating !== undefined && this.object.craftRating !== formObject.object.craftRating;
        const spellChange = formObject.object.spell !== undefined && this.object.spell !== formObject.object.spell;

        foundry.utils.mergeObject(this, formData.object);
        if (this.object.rollType !== "base") {
            this.object.diceCap = this._getDiceCap();
            this.object.TNCap = this._getTNCap();
            this.object.charmDiceAdded = this._getDiceCap(true);

            if (this.actor.type === "character" && this.actor.system.attributes[this.object.attribute]) {
                this.object.charmDiceAdded = Math.max(0, this.actor.system.attributes[this.object.attribute].value + this.actor.system.attributes[this.object.attribute].upgrade - 5);
            }

            for (const charm of this.object.addedCharms) {
                if (charm.system.diceroller) {
                    if (!charm.system.diceroller.settings.noncharmdice) {
                        this.object.charmDiceAdded = this._getFormulaValue(charm.system.diceroller.bonusdice);
                    }
                    if (!charm.system.diceroller.settings.noncharmsuccesses) {
                        if (this.actor.system.details.exalt === 'sidereal') {
                            this.object.charmDiceAdded += this._getFormulaValue(charm.system.diceroller.bonussuccesses);
                        } else {
                            this.object.charmDiceAdded += this._getFormulaValue(charm.system.diceroller.bonussuccesses) * 2;
                        }
                    }
                }

            }

            this._calculateAnimaGain();
            this._updateSpecialtyList();
            if (finesseChange) {
                this.object.difficulty = parseInt(this.object.finesse);
            }
            if (ambitionChange) {
                this.object.goalNumber = parseInt(this.object.ambition);
            }
            if (gambitChange) {
                const gambitCosts = {
                    'none': 0,
                    'grapple': 2,
                    'unhorse': 4,
                    'distract': 3,
                    'disarm': 3,
                    'detonate': 4,
                    'knockback': 3,
                    'knockdown': 3,
                    'pilfer': 2,
                    'pull': 3,
                    'revealWeakness': 2,
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
                if (this.object.gambit === 'disarm' && this.object.weaponTags['disarming']) {
                    this.object.gambitDifficulty--;
                }
                if ((this.object.gambit === 'knockback' || this.object.gambit === 'knockdown') && this.object.weaponTags['smashing']) {
                    this.object.gambitDifficulty--;
                }
            }
            if (craftTypeChange) {
                this.object.intervals = 1;
                this.object.difficulty = 1;
                this.object.goalNumber = 0;
                if (this.object.craftType === 'superior') {
                    this.object.cost.goldxp = 10;
                }
                if (this.object.craftType === 'legendary') {
                    this.object.cost.whitexp = 10;
                }
                this._getCraftDifficulty();
            }
            if (craftRating) {
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
            if (spellChange) {
                const fullSpell = this.actor.items.get(this.object.spell);
                if (fullSpell) {
                    this.object.cost.willpower = parseInt(fullSpell.system.willpower);
                }
                else {
                    this.object.cost.willpower = 0;
                }
            }
        }

        if (event.type === 'submit') {
            if (this.object.rollType === 'useOpposingCharms') {
                await this.useOpposingCharms();
            }
            else {
                if (this.actor) {
                    const rollData = this.getSavedRollData();
                    await this.actor.update({ [`flags.exaltedthird.lastroll`]: rollData });
                }
                await this._roll();
                if (this.object.intervals <= 0 && (!this.object.splitAttack || this.object.rollType === 'damage')) {
                    this.resolve(true);
                    this.close(false);
                }
                if (this.object.splitAttack && this.object.rollType === 'accuracy') {
                    this.object.rollType = 'damage';
                    this.tabGroups['primary'] = 'damage';
                }
            }
        }
        this.render();
    }

    _setUpMultitargets() {
        this.object.hasDifficulty = false;
        var userAppearance = this.actor.type === 'npc' ? this.actor.system.appearance.value : this.actor.system.attributes[this.actor.system.settings.rollsettings.social.appearanceattribute].value + this.actor.system.attributes[this.actor.system.settings.rollsettings.social.appearanceattribute].upgrade;
        for (const target of Array.from(game.user.targets)) {
            target.rollData = {
                resolve: 0,
                guile: 0,
                targetIntimacies: [],
                supportedIntimacy: '0',
                opposedIntimacy: '0',
                appearanceBonus: 0,
                armoredSoak: 0,
                naturalSoak: 0,
                defenseType: game.i18n.localize('Ex3.None'),
                defense: 0,
                hardness: 0,
                soak: 0,
                shieldInitiative: 0,
                diceModifier: 0,
                successModifier: 0,
                damageModifier: 0,
            }
            target.rollData.guile = target.actor.system.guile.value;
            target.rollData.resolve = target.actor.system.resolve.value;
            target.rollData.appearanceBonus = Math.max(0, userAppearance - target.actor.system.resolve.value);
            target.rollData.targetIntimacies = target.actor.intimacies.filter((i) => i.system.visible || game.user.isGM);
            target.rollData.attackSuccesses = 0;
            if (target.actor.system.warstrider.equipped) {
                target.rollData.soak = target.actor.system.warstrider.soak.value;
                target.rollData.hardness = target.actor.system.warstrider.hardness.value;
            }
            else {
                target.rollData.soak = target.actor.system.soak.value;
                target.rollData.armoredSoak = target.actor.system.armoredsoak.value;
                target.rollData.naturalSoak = target.actor.system.naturalsoak.value;
                target.rollData.hardness = target.actor.system.hardness.value;
            }
            target.rollData.shieldInitiative = target.actor.system.shieldinitiative.value;
            const tokenId = target.actor?.token?.id || target.actor.getActiveTokens()[0].id;
            let combatant = game.combat?.combatants?.find(c => c.tokenId === tokenId) || null;
            if (combatant && combatant.initiative && combatant.initiative <= 0) {
                target.rollData.hardness = 0;
            }
            let effectiveParry = target.actor.system.parry.value;
            let effectiveEvasion = target.actor.system.evasion.value;
            let effectiveResolve = target.actor.system.resolve.value;
            let effectiveGuile = target.actor.system.guile.value;

            if (target.actor.system.battlegroup) {
                effectiveParry += parseInt(target.actor.system.drill.value);
                effectiveEvasion += parseInt(target.actor.system.drill.value);
                if (target.actor.system.might.value > 1) {
                    effectiveParry += (target.actor.system.might.value - 1);
                    effectiveEvasion += (target.actor.system.might.value - 1);
                }
                else {
                    effectiveParry += target.actor.system.might.value;
                    effectiveEvasion += target.actor.system.might.value;
                }
                target.rollData.soak += target.actor.system.size.value;
                target.rollData.naturalSoak += target.actor.system.size.value;
            }

            if (target.actor.effects) {
                if (target.actor.effects.some(e => e.statuses.has('lightcover'))) {
                    effectiveParry += 1;
                    effectiveEvasion += 1;
                }
                if (target.actor.effects.some(e => e.statuses.has('heavycover'))) {
                    effectiveParry += 2;
                    effectiveEvasion += 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('fullcover'))) {
                    effectiveParry += 3;
                    effectiveEvasion += 3;
                }
                if (target.actor.effects.some(e => e.statuses.has('fulldefense')) && !this.object.weaponTags['flexible']) {
                    effectiveParry += 2;
                    effectiveEvasion += 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('surprised'))) {
                    effectiveParry -= 2;
                    effectiveEvasion -= 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('grappled')) || target.actor.effects.some(e => e.statuses.has('grappling'))) {
                    effectiveParry -= 2;
                    effectiveEvasion -= 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('prone'))) {
                    effectiveParry -= 1;
                }
                effectiveParry += Math.min(target.actor.system.negateparrypenalty.value, target.actor.getRollData().currentParryPenalty);
                if (target.actor.effects.some(e => e.statuses.has('prone'))) {
                    effectiveEvasion -= 2;
                }
                if (target.actor.effects.some(e => e.statuses.has('mounted'))) {
                    if (!this.object.conditions.some(e => e.statuses.has('mounted')) && this.object.range === 'close') {
                        const combinedTags = this.actor.items.filter(item => item.type === 'weapon' && item.system.equipped === true).reduce((acc, weapon) => {
                            const tags = weapon.system.traits.weapontags.value || [];
                            return acc.concat(tags);
                        }, []);
                        if (!combinedTags.includes('reaching')) {
                            effectiveEvasion += 1;
                            effectiveParry += 1;
                        }
                    }
                }
                effectiveEvasion += Math.min(target.actor.system.negateevasionpenalty.value, target.actor.getRollData().currentEvasionPenalty);
            }
            if (target.actor.system.sizecategory === 'tiny') {
                if (this.actor.system.sizecategory !== 'tiny' && this.actor.system.sizecategory !== 'minuscule') {
                    effectiveEvasion += 2;
                }
            }
            if (target.actor.system.sizecategory === 'minuscule') {
                if (this.actor.system.sizecategory !== 'minuscule') {
                    effectiveEvasion += 3;
                }
            }
            if (target.actor.system.settings.defenseStunts) {
                effectiveEvasion += 1;
                effectiveParry += 1;
                effectiveResolve += 1;
                effectiveGuile += 1;
            }
            effectiveEvasion -= Math.max(0, (target.actor.system.health.penalty === 'inc' ? 4 : target.actor.system.health.penalty) - target.actor.system.health.penaltymod);
            effectiveParry -= Math.max(0, (target.actor.system.health.penalty === 'inc' ? 4 : target.actor.system.health.penalty) - target.actor.system.health.penaltymod);

            if (this.object.targetStat === 'resolve') {
                target.rollData.defenseType = game.i18n.localize('Ex3.Resolve');
                target.rollData.defense = effectiveResolve;
            }
            else if (this.object.targetStat === 'guile') {
                target.rollData.defenseType = game.i18n.localize('Ex3.Guile');
                target.rollData.defense = effectiveGuile;
            }
            else {
                if ((effectiveParry >= effectiveEvasion || this.object.weaponTags["undodgeable"]) && !this.object.weaponTags["unblockable"]) {
                    target.rollData.defenseType = game.i18n.localize('Ex3.Parry');
                    target.rollData.defense = effectiveParry;
                }
                if ((effectiveEvasion >= effectiveParry || this.object.weaponTags["unblockable"]) && !this.object.weaponTags["undodgeable"]) {
                    target.rollData.defenseType = game.i18n.localize('Ex3.Evasion');
                    target.rollData.defense = effectiveEvasion;
                }
            }
            if (target.rollData.defense < 0) {
                target.rollData.defense = 0;
            }
            if (target.rollData.soak < 0) {
                target.rollData.soak = 0;
            }

            if (this.object.attackType === 'withering' && this.object.conditions?.some(e => e.statuses.has('mounted'))) {
                if (!target.actor.effects.some(e => e.statuses.has('mounted')) && this.object.range === 'close') {
                    const combinedTags = target.actor.items.filter(item => item.type === 'weapon' && item.system.equipped === true).reduce((acc, weapon) => {
                        const tags = weapon.system.traits.weapontags.value || [];
                        return acc.concat(tags);
                    }, []);
                    if (!combinedTags.includes('reaching')) {
                        target.rollData.diceModifier += 1;
                        if (target.actor.system.battlegroup) {
                            target.rollData.diceModifier += 1;
                        }
                    }
                }
            }
            this.object.targets[target.id] = target;
        }
    }

    _setupSingleTarget(target) {
        if (target) {
            this.object.target = target;
            this.object.newTargetData = foundry.utils.duplicate(target.actor);
            this.object.updateTargetActorData = false;
            this.object.updateTargetInitiative = false;
            if (this.object.rollType === 'command') {
                if (target.actor.system.battlegroup) {
                    if (target.actor.system.drill.value === '0') {
                        this.object.diceModifier -= 2;
                    }
                    if (target.actor.system.drill.value === '2') {
                        this.object.diceModifier += 2;
                    }
                }
            }
        }
    }

    async getEnritchedHTML(charm) {
        charm.enritchedHTML = await TextEditor.enrichHTML(charm.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: charm });
    }

    /**
     * Renders out the Roll form.
     * @returns {Promise} Returns True or False once the Roll or Cancel buttons are pressed.
     */
    async roll() {
        if (this.object.skipDialog) {
            if (this.object.rollType === 'useOpposingCharms') {
                await this.useOpposingCharms();
            } else {
                await this._roll();
            }
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

    async close(deleteMessage = true, options = {}) {
        this.resolve(false);
        if (this.messageId && deleteMessage) {
            game.messages.get(this.messageId)?.delete();
        }
        super.close();
    }

    static async saveRoll() {
        let html = await renderTemplate("systems/exaltedthird/templates/dialogues/save-roll.html", { 'name': this.object.name || 'New Roll' });

        new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize("Ex3.SaveRoll"), },
            content: html,
            classes: [this.actor ? this.actor.getSheetBackground() : `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
            buttons: [{
                action: "save",
                label: game.i18n.localize("Ex3.Save"),
                default: true,
                callback: (event, button, dialog) => button.form.elements
            }, {
                action: "cancel",
                label: game.i18n.localize("Ex3.Cancel"),
                callback: (event, button, dialog) => false
            }],
            submit: result => {
                if (result && result.name?.value) {
                    let results = result.name.value;
                    const rollData = this.getSavedRollData();

                    rollData.name = results;
                    let updates = {
                        "system.savedRolls": {
                            [rollData.id]: rollData
                        }
                    };
                    this.actor.update(updates);
                    this.saved = true;
                    ui.notifications.notify(`Saved Roll`);
                    return;
                }
            }
        }).render({ force: true });
    }

    getSavedRollData() {
        const rollData = { ...this.object };
        let uniqueId = this.object.id || foundry.utils.randomID(16);
        rollData.id = uniqueId;
        rollData.target = null;
        rollData.showTargets = false;
        rollData.targets = null;
        rollData.newTargetData = null;
        const addedCharmsConvertArray = [];
        for (let i = 0; i < this.object.addedCharms.length; i++) {
            addedCharmsConvertArray.push(foundry.utils.duplicate(this.object.addedCharms[i]));
            addedCharmsConvertArray[i].timesAdded = this.object.addedCharms[i].timesAdded;
        }
        rollData.addedCharms = addedCharmsConvertArray;

        return rollData;
    }

    static async editSettings() {
        const html = await renderTemplate("systems/exaltedthird/templates/dialogues/dice-roller-settings.html", { 'isAttack': this._isAttackRoll(), 'selfDefensePenalty': this.object.triggerSelfDefensePenalty, 'targetDefensePenalty': this.object.triggerTargetDefensePenalty, 'settings': this.object.settings, 'rerolls': this.object.reroll, 'damageRerolls': this.object.damage.reroll, 'selects': this.selects });

        new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize("Ex3.DiceRollSettings"), resizable: true },
            content: html,
            classes: [this.actor ? this.actor.getSheetBackground() : `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
            buttons: [{
                action: "choice",
                label: game.i18n.localize("Ex3.Save"),
                default: true,
                callback: (event, button, dialog) => button.form.elements
            }, {
                action: "cancel",
                label: game.i18n.localize("Ex3.Cancel"),
                callback: (event, button, dialog) => false
            }],
            position: {
                width: 500,
            },
            submit: result => {
                if (result) {
                    this.object.settings.doubleSucccessCaps.sevens = parseInt(result.sevensCap?.value || 0);
                    this.object.settings.doubleSucccessCaps.eights = parseInt(result.eightsCap?.value || 0);
                    this.object.settings.doubleSucccessCaps.nines = parseInt(result.ninesCap?.value || 0);
                    this.object.settings.doubleSucccessCaps.tens = parseInt(result.tensCap?.value || 0);
                    this.object.settings.excludeOnesFromRerolls = result.excludeOnesFromRerolls.checked;
                    this.object.settings.triggerOnOnes = result.triggerOnOnes?.value || 'none';
                    this.object.settings.triggerOnTens = result.triggerOnTens?.value || 'none';

                    this.object.settings.alsoTriggerTwos = result.alsoTriggerTwos.checked;
                    this.object.settings.alsoTriggerNines = result.alsoTriggerNines.checked;

                    this.object.settings.triggerTensCap = parseInt(result.triggerTensCap?.value || 0);
                    this.object.settings.triggerOnesCap = parseInt(result.triggerOnesCap?.value || 0);

                    this.object.triggerSelfDefensePenalty = parseInt(result.selfDefensePenalty?.value || 0);
                    this.object.triggerTargetDefensePenalty = parseInt(result.targetDefensePenalty?.value || 0);

                    this.object.settings.ignoreLegendarySize = result.ignoreLegendarySize?.checked || false;
                    this.object.settings.damage.doubleSucccessCaps.sevens = parseInt(result.damageSevensCap?.value || 0);
                    this.object.settings.damage.doubleSucccessCaps.eights = parseInt(result.damageEightsCap?.value || 0);
                    this.object.settings.damage.doubleSucccessCaps.nines = parseInt(result.damageNinesCap?.value || 0);
                    this.object.settings.damage.doubleSucccessCaps.tens = parseInt(result.damageTensCap?.value || 0);
                    this.object.settings.damage.excludeOnesFromRerolls = result.damageExcludeOnesFromRerolls?.checked || false;
                    this.object.settings.damage.triggerTensCap = parseInt(result.damageTriggerTensCap?.value || 0);
                    this.object.settings.damage.alsoTriggerNines = result.damageAlsoTriggerNines?.checked || false;

                    for (let [rerollKey, rerollValue] of Object.entries(this.object.reroll)) {
                        this.object.reroll[rerollKey].cap = parseInt(result[`reroll-${this.object.reroll[rerollKey].number}-cap`].value || 0);
                    }

                    for (let [rerollKey, rerollValue] of Object.entries(this.object.damage.reroll)) {
                        this.object.damage.reroll[rerollKey].cap = parseInt(result[`damage-reroll-${this.object.damage.reroll[rerollKey].number}-cap`]?.value || 0);
                    }
                }
            }
        }).render({ force: true });
    }

    static async showGambitDialog(event, target) {
        const html = await renderTemplate("systems/exaltedthird/templates/dialogues/gambits.html", { 'useEssenceGambit': this.object.useEssenceGambit });

        new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize("Ex3.Gambits"), resizable: true },
            content: html,
            position: {
                width: 650,
                height: 600
            },
            buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
            classes: ['exaltedthird-dialog', this.actor.getSheetBackground()],
        }).render(true);
    }

    static triggerRemoveCharm(event, target) {
        event.stopPropagation();
        let li = $(target).parents(".item");
        let item = this.actor.items.get(li.data("item-id"));
        const index = this.object.addedCharms.findIndex(addedItem => item.id === addedItem.id);
        const addedCharm = this.object.addedCharms.find(addedItem => item.id === addedItem.id);
        if (index > -1) {
            if (addedCharm.timesAdded > 0) {
                addedCharm.timesAdded--;
            }
            if (addedCharm.timesAdded <= 0) {
                this.object.addedCharms.splice(index, 1);
            }

            for (var charmlist of Object.values(this.object.charmList)) {
                for (const charm of charmlist.list) {
                    if (charm._id === item.id) {
                        charm.timesAdded = addedCharm.timesAdded;
                        if (charm.timesAdded <= 0) {
                            charm.charmAdded = false;
                        }
                    }
                }
            }

            if (item.system.cost) {
                if (item.system.keywords.toLowerCase().includes('mute')) {
                    this.object.cost.muteMotes -= item.system.cost.motes;
                }
                else {
                    this.object.cost.motes -= item.system.cost.motes;
                }
                this.object.cost.anima -= item.system.cost.anima;
                this.object.cost.penumbra -= item.system.cost.penumbra;
                this.object.cost.willpower -= item.system.cost.willpower;
                this.object.cost.silverxp -= item.system.cost.silverxp;
                this.object.cost.goldxp -= item.system.cost.goldxp;
                this.object.cost.whitexp -= item.system.cost.whitexp;
                this.object.cost.initiative -= item.system.cost.initiative;
                this.object.cost.grappleControl -= item.system.cost.grapplecontrol;

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
            }

            if (item.system.diceroller) {
                this.object.diceModifier -= this._getFormulaValue(item.system.diceroller.bonusdice);
                this.object.successModifier -= this._getFormulaValue(item.system.diceroller.bonussuccesses);
                this.object.ignorePenalties -= this._getFormulaValue(item.system.diceroller.ignorepenalties);

                this.object.triggerSelfDefensePenalty -= item.system.diceroller.selfdefensepenalty;
                this.object.triggerTargetDefensePenalty -= item.system.diceroller.targetdefensepenalty;

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
                if (this.object.showTargets) {
                    const targetValues = Object.values(this.object.targets);
                    for (const target of targetValues) {
                        target.rollData.defense += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                        target.rollData.resolve += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                        target.rollData.guile += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                        if (this.object.rollType === 'damage') {
                            target.rollData.attackSuccesses -= this._getFormulaValue(item.system.diceroller.bonussuccesses);
                        }
                    }
                }
                else {
                    this.object.difficulty += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                    this.object.defense += this._getFormulaValue(item.system.diceroller.reducedifficulty);
                    if (this.object.rollType === 'damage') {
                        this.object.attackSuccesses -= this._getFormulaValue(item.system.diceroller.bonussuccesses);
                    }
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
                if (item.system.diceroller.ignorelegendarysize) {
                    this.object.settings.ignoreLegendarySize = false;
                }
                if (item.system.diceroller.excludeonesfromrerolls) {
                    this.object.settings.excludeOnesFromRerolls = false;
                }

                this.object.damage.damageDice -= this._getFormulaValue(item.system.diceroller.damage.bonusdice);
                this.object.damage.damageSuccessModifier -= this._getFormulaValue(item.system.diceroller.damage.bonussuccesses);
                this.object.damage.targetNumber += item.system.diceroller.damage.decreasetargetnumber;
                this.object.overwhelming -= this._getFormulaValue(item.system.diceroller.damage.overwhelming);
                this.object.damage.postSoakDamage -= this._getFormulaValue(item.system.diceroller.damage.postsoakdamage);
                this.object.damage.diceToSuccesses -= this._getFormulaValue(item.system.diceroller.damage.dicetosuccesses);

                this.object.damage.ignoreSoak -= this._getFormulaValue(item.system.diceroller.damage.ignoresoak);
                this.object.damage.ignoreHardness -= this._getFormulaValue(item.system.diceroller.damage.ignorehardness);

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
                    this.object.activateAura = '';
                }
                if (addedCharm.timesAdded === 0 && item.system.diceroller.triggerontens === this.object.settings.triggerOnTens) {
                    this.object.settings.triggerOnTens = 'none';
                    this.object.settings.alsoTriggerNines = false;
                }
                this.object.settings.triggerTensCap -= this._getFormulaValue(item.system.diceroller.triggertenscap);
                if (item.system.diceroller.damage.triggerontens !== 'none') {
                    this.object.settings.damage.triggerOnTens = 'none';
                    this.object.settings.damage.alsoTriggerNines = false;
                }
                this.object.settings.damage.triggerTensCap -= this._getFormulaValue(item.system.diceroller.damage.triggertenscap);
                this.object.settings.triggerOnesCap -= this._getFormulaValue(item.system.diceroller.triggeronescap);

                if (this.object.rollType === 'useOpposingCharms') {
                    this.object.addOppose.addedBonus.dice -= this._getFormulaValue(item.system.diceroller.opposedbonuses.dicemodifier);
                    this.object.addOppose.addedBonus.successes -= this._getFormulaValue(item.system.diceroller.opposedbonuses.successmodifier);
                    this.object.addOppose.addedBonus.defense -= this._getFormulaValue(item.system.diceroller.opposedbonuses.defense);
                    this.object.addOppose.addedBonus.soak -= this._getFormulaValue(item.system.diceroller.opposedbonuses.soak);
                    this.object.addOppose.addedBonus.hardness -= this._getFormulaValue(item.system.diceroller.opposedbonuses.hardness);
                    this.object.addOppose.addedBonus.damage -= this._getFormulaValue(item.system.diceroller.opposedbonuses.damagemodifier);
                    this.object.addOppose.addedBonus.resolve -= this._getFormulaValue(item.system.diceroller.opposedbonuses.resolve);
                    this.object.addOppose.addedBonus.guile -= this._getFormulaValue(item.system.diceroller.opposedbonuses.guile);
                }
            }
        }
        this._calculateAnimaGain();
        this.render();
    }


    static triggerAddCharm(event, target) {
        event.stopPropagation();
        let li = $(target).parents(".item");
        let item = this.actor.items.get(li.data("item-id"));
        this.addCharm(item);
    }

    static addSpecialAttack(event, target) {
        event.stopPropagation();
        let li = $(target).parents(".item");
        let id = li.data("item-id");
        for (var specialAttack of this.object.specialAttacksList) {
            if (specialAttack.id === id) {
                specialAttack.added = true;
            }
        }
        if (id === 'aim') {
            this.object.diceModifier += 3;
        }
        else if (id === 'impale') {
            if (this.object.attackType === 'withering') {
                this.object.damage.damageDice += 5;
            }
            else {
                this.object.damage.damageDice += 3;
            }
        }
        else {
            if (id === 'knockback' || id === 'knockdown') {
                this.object.cost.initiative += 2;
                if (id === 'knockdown') {
                    this.object.triggerKnockdown = true;
                }
            }
            else if (id === 'flurry') {
                this.object.isFlurry = true;
            }
            else if (id === 'clash') {
                this.object.isClash = true;
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
            else if (id === 'fulldefense') {
                this.object.diceModifier -= 3;
                this.object.cost.initiative += 1;
                this.object.triggerFullDefense = true;
            }
            this.object.triggerSelfDefensePenalty += 1;
        }
        this.render();
    }

    static removeSpecialAttack(event, target) {
        event.stopPropagation();
        let li = $(target).parents(".item");
        let id = li.data("item-id");
        for (var specialAttack of this.object.specialAttacksList) {
            if (specialAttack.id === id) {
                specialAttack.added = false;
            }
        }
        if (id === 'aim') {
            this.object.diceModifier -= 3;
        }
        else if (id === 'impale') {
            if (this.object.attackType === 'withering') {
                this.object.damage.damageDice -= 5;
            }
            else {
                this.object.damage.damageDice -= 3;
            }
        }
        else {
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
            else if (id === 'fulldefense') {
                this.object.diceModifier += 3;
                this.object.cost.initiative -= 1;
                this.object.triggerFullDefense = true;
            }
            this.object.triggerSelfDefensePenalty = Math.max(0, this.object.triggerSelfDefensePenalty - 1);
        }
        this.render();
    }

    static removeOpposingCharm(event, target) {
        event.stopPropagation();
        let li = $(target).parents(".item");
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
            this.object.rerollSuccesses -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.rerollsuccesses);
            this.object.gambitDifficulty -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.increasegambitdifficulty, charm.actor);
            if (this.object.showTargets) {
                const targetValues = Object.values(this.object.targets);
                if (targetValues.length === 1) {
                    targetValues[0].rollData.guile -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                    targetValues[0].rollData.resolve -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                    targetValues[0].rollData.defense -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                    targetValues[0].rollData.soak -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                    targetValues[0].rollData.shieldInitiative -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                    targetValues[0].rollData.hardness -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                    targetValues[0].rollData.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                    targetValues[0].rollData.successModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                    targetValues[0].rollData.damageModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                    if (this.object.rollType === 'damage') {
                        targetValues[0].rollData.attackSuccesses -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                    }
                }
                else {
                    for (const target of targetValues) {
                        if (target.actor.id === charm.parent.id || targetValues.length === 1) {
                            target.rollData.guile -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                            target.rollData.resolve -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                            target.rollData.defense -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                            target.rollData.soak -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                            target.rollData.shieldInitiative -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                            target.rollData.hardness -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                            target.rollData.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                            target.rollData.successModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                            target.rollData.damageModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                            if (this.object.rollType === 'damage') {
                                target.rollData.attackSuccesses -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                            }
                        }
                    }
                }
            }
            else {
                this.object.defense -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                this.object.soak -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                this.object.shieldInitiative -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                this.object.hardness -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                this.object.diceModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                this.object.successModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                this.object.damage.damageDice -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                if (this.object.rollType === 'readIntentions') {
                    this.object.difficulty -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                }
                if (this.object.rollType === 'social') {
                    this.object.difficulty -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                }
                if (this.object.rollType === 'damage') {
                    this.object.attackSuccesses -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                }
            }
            this.object.damage.targetNumber -= charm.system.diceroller.opposedbonuses.increasedamagetargetnumber;
            if (charm.system.diceroller.opposedbonuses.triggeronones !== 'none') {
                this.object.settings.triggerOnOnes = 'none';
                this.object.settings.alsoTriggerTwos = false;
            }
            this.object.penaltyModifier -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.penaltymodifier);
            this.object.settings.triggerOnesCap -= this._getFormulaValue(charm.system.diceroller.opposedbonuses.triggeronescap);
        }
        this.render();
    }

    static enableAddCharms() {
        // this.object.charmList = this.actor.rollcharms;
        for (var [ability, charmlist] of Object.entries(this.object.charmList)) {
            if (charmlist.collapse === undefined) {
                charmlist.collapse = (ability !== this.object.ability && ability !== this.object.attribute);
            }
            for (const charm of charmlist.list) {
                if (charm.system.ability === this.object.ability || charm.system.ability === this.object.attribute) {
                    charmlist.collapse = false;
                }
                if (this.object.addedCharms.some((addedCharm) => addedCharm.id === charm._id)) {
                    charmlist.collapse = false;
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
        if (this._isAttackRoll()) {
            this.object.showSpecialAttacks = true;
            if (this.object.rollType !== 'gambit') {
                for (var specialAttack of this.object.specialAttacksList) {
                    if ((specialAttack.id === 'knockback' || specialAttack.id === 'knockdown') && this.object.weaponTags['smashing']) {
                        specialAttack.show = true;
                    }
                    else if (specialAttack.id === 'impale' && this.object.weaponTags['lance']) {
                        specialAttack.show = true;
                    }
                    else if (this.object.weaponTags[specialAttack.id] || specialAttack.id === 'flurry') {
                        specialAttack.show = true;
                    }
                    else if (specialAttack.id === 'aim' || specialAttack.id === 'fulldefense' || specialAttack.id === 'clash') {
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
    }

    getData() {
        this.selects = CONFIG.exaltedthird.selects;
        // this.rollableAbilities = CONFIG.exaltedthird.selects.abilities;
        // this.rollableAbilities['willpower'] = "Ex3.Willpower";
        return {
            actor: this.actor,
            selects: this.selects,
            rollableAbilities: this.rollableAbilities,
            rollablePools: this.rollablePools,
            data: this.object,
        };
    }

    _onRender(context, options) {
        this.element.querySelectorAll('.collapsable').forEach(element => {
            element.addEventListener('click', (ev) => {
                const li = $(ev.currentTarget).next();
                if (li.attr('id')) {
                    this.object[li.attr('id')] = li.is(":hidden");
                }
                li.toggle("fast");
            });
        });

        this.element.querySelectorAll('.charm-list-collapsable').forEach(element => {
            element.addEventListener('click', (ev) => {
                const li = $(ev.currentTarget).next();
                if (li.attr('id')) {
                    this.object.charmList[li.attr('id')].collapse = !li.is(":hidden");
                }
                li.toggle("fast");
            });
        });
    }


    _autoAddCharm(charm) {
        if (!charm.system.autoaddtorolls) {
            return false;
        }
        switch (charm.system.autoaddtorolls) {
            case 'action':
                return (this.object.rollType !== 'useOpposingCharms');
            case 'attacks':
                return this._isAttackRoll();
            case 'opposedRolls':
                return (this.object.rollType === 'useOpposingCharms');
            case 'sameAbility':
                return (charm.type === 'charm' || charm.type === 'merit') && (charm.system.ability === this.object.ability || charm.system.ability === this.object.attribute || (charm.system.attribute && charm.system.attribute === this.object.attribute));
        }
        if (this.object.rollType === charm.system.autoaddtorolls) {
            return true;
        }
        return false;
    }

    async addCharm(item, addCosts = true) {
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
            for (const charm of charmlist.list.filter(charm => charm.type !== 'charm' || charm.system.diceroller.enabled)) {
                var existingAddedCharm = this.object.addedCharms.find((addedCharm) => addedCharm._id === charm._id);
                if (existingAddedCharm) {
                    charm.charmAdded = true;
                    charm.timesAdded = existingAddedCharm.timesAdded;
                }
            }
        }
        if (item.system.cost && !item.system.activatable) {
            if (addCosts) {
                if (item.system.keywords.toLowerCase().includes('mute')) {
                    this.object.cost.muteMotes += item.system.cost.motes;
                }
                else {
                    this.object.cost.motes += item.system.cost.motes;
                }
                this.object.cost.anima += item.system.cost.anima;
                this.object.cost.penumbra += item.system.cost.penumbra;
                this.object.cost.willpower += item.system.cost.willpower;
                this.object.cost.silverxp += item.system.cost.silverxp;
                this.object.cost.goldxp += item.system.cost.goldxp;
                this.object.cost.whitexp += item.system.cost.whitexp;
                this.object.cost.initiative += item.system.cost.initiative;
                this.object.cost.grappleControl += item.system.cost.grapplecontrol;


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
            }

            this.object.restore.motes += item.system.restore.motes;
            this.object.restore.willpower += item.system.restore.willpower;
            this.object.restore.health += item.system.restore.health;
            this.object.restore.initiative += item.system.restore.initiative;
        }
        if (item.system.diceroller) {
            this.object.diceModifier += this._getFormulaValue(item.system.diceroller.bonusdice);
            this.object.successModifier += this._getFormulaValue(item.system.diceroller.bonussuccesses);
            this.object.ignorePenalties += this._getFormulaValue(item.system.diceroller.ignorepenalties);
            this.object.triggerSelfDefensePenalty += item.system.diceroller.selfdefensepenalty;
            this.object.triggerTargetDefensePenalty += item.system.diceroller.targetdefensepenalty;
            if (!item.system.diceroller.settings.noncharmdice) {
                this.object.charmDiceAdded += this._getFormulaValue(item.system.diceroller.bonusdice);
            }
            if (!item.system.diceroller.settings.noncharmsuccesses) {
                if (this.actor.system.details.exalt === 'sidereal') {
                    this.object.charmDiceAdded += this._getFormulaValue(item.system.diceroller.bonussuccesses);
                } else {
                    this.object.charmDiceAdded += (this._getFormulaValue(item.system.diceroller.bonussuccesses) * 2);
                }
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

            if (this.object.showTargets) {
                const targetValues = Object.values(this.object.targets);
                for (const target of targetValues) {
                    target.rollData.defense = Math.max(0, target.rollData.defense - this._getFormulaValue(item.system.diceroller.reducedifficulty));
                    target.rollData.resolve = Math.max(0, target.rollData.resolve - this._getFormulaValue(item.system.diceroller.reducedifficulty));
                    target.rollData.guile = Math.max(0, target.rollData.guile - this._getFormulaValue(item.system.diceroller.reducedifficulty));
                    if (this.object.rollType === 'damage') {
                        target.rollData.attackSuccesses += this._getFormulaValue(item.system.diceroller.bonussuccesses);
                    }
                }
            }
            else {
                this.object.difficulty = Math.max(0, this.object.difficulty - this._getFormulaValue(item.system.diceroller.reducedifficulty));
                this.object.defense = Math.max(0, this.object.defense - this._getFormulaValue(item.system.diceroller.reducedifficulty));
                if (this.object.rollType === 'damage') {
                    this.object.attackSuccesses += this._getFormulaValue(item.system.diceroller.bonussuccesses);
                }
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
            if (item.system.diceroller.ignorelegendarysize) {
                this.object.settings.ignoreLegendarySize = item.system.diceroller.ignorelegendarysize;
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
            this.object.damage.diceToSuccesses += this._getFormulaValue(item.system.diceroller.damage.dicetosuccesses);
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
            this.object.damage.ignoreHardness += this._getFormulaValue(item.system.diceroller.damage.ignorehardness);

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

            if (item.system.diceroller.activateAura && item.system.diceroller.activateAura !== 'none') {
                this.object.activateAura = item.system.diceroller.activateAura;
            }
            if (item.system.diceroller.triggerontens !== 'none') {
                this.object.settings.triggerOnTens = item.system.diceroller.triggerontens;
                this.object.settings.alsoTriggerNines = item.system.diceroller.alsotriggernines;
            }
            this.object.settings.triggerTensCap += this._getFormulaValue(item.system.diceroller.triggertenscap);

            if (item.system.diceroller.damage.triggerontens !== 'none') {
                this.object.settings.damage.triggerOnTens = item.system.diceroller.damage.triggerontens;
                this.object.settings.damage.alsoTriggerNines = item.system.diceroller.damage.alsotriggernines;
            }
            this.object.settings.damage.triggerTensCap += this._getFormulaValue(item.system.diceroller.damage.triggertenscap);
            if (item.system.diceroller.triggerontens !== 'none') {
                this.object.settings.triggerOnTens = item.system.diceroller.triggerontens;
            }
            if (this.object.rollType === 'useOpposingCharms') {
                this.object.addOppose.addedBonus.dice += this._getFormulaValue(item.system.diceroller.opposedbonuses.dicemodifier);
                this.object.addOppose.addedBonus.successes += this._getFormulaValue(item.system.diceroller.opposedbonuses.successmodifier);
                this.object.addOppose.addedBonus.defense += this._getFormulaValue(item.system.diceroller.opposedbonuses.defense);
                this.object.addOppose.addedBonus.soak += this._getFormulaValue(item.system.diceroller.opposedbonuses.soak);
                this.object.addOppose.addedBonus.hardness += this._getFormulaValue(item.system.diceroller.opposedbonuses.hardness);
                this.object.addOppose.addedBonus.damage += this._getFormulaValue(item.system.diceroller.opposedbonuses.damagemodifier);
                this.object.addOppose.addedBonus.resolve += this._getFormulaValue(item.system.diceroller.opposedbonuses.resolve);
                this.object.addOppose.addedBonus.guile += this._getFormulaValue(item.system.diceroller.opposedbonuses.guile);
            }
            this._calculateAnimaGain();
        }

        this._addBonuses(item, 'itemAdded', "benefit");
        //Test
        // this._addBonuses(item, 'beforeRoll', "benefit");
        this.render();
    }

    _getFormulaValue(charmValue, opposedCharmActor = null, item = null) {
        var rollerValue = 0;
        if (charmValue) {
            if (charmValue.split(' ').length === 3) {
                var negativeValue = false;
                if (charmValue.includes('-(')) {
                    charmValue = charmValue.replace(/(-\(|\))/g, '');
                    negativeValue = true;
                }
                var split = charmValue.split(' ');
                var leftVar = this._getFormulaActorValue(split[0], opposedCharmActor, item);
                var operand = split[1];
                var rightVar = this._getFormulaActorValue(split[2], opposedCharmActor, item);
                switch (operand) {
                    case '+':
                        rollerValue = leftVar + rightVar;
                        break;
                    case '-':
                        rollerValue = Math.max(0, leftVar - rightVar);
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
                rollerValue = this._getFormulaActorValue(charmValue, opposedCharmActor, item);
            }
        }
        return rollerValue;
    }

    _getBooleanFormulaValue(charmValue, opposedCharmActor = null, item = null) {
        if (typeof charmValue === 'boolean') {
            return charmValue;
        }
        if (charmValue) {
            const operandRegex = /(==|!=|<=|>=|<|>)/;

            // Check if the operand exists in the string
            if (!operandRegex.test(charmValue)) {
                return false;
            }

            // Split the formula string based on operand
            const [leftOperand, operand, rightOperand] = charmValue.split(operandRegex);

            var leftVar = this._getFormulaValue(leftOperand.trim(), opposedCharmActor, item);
            var rightVar = this._getFormulaValue(rightOperand.trim(), opposedCharmActor, item);

            // Perform operation based on operand
            switch (operand) {
                case "==":
                    return leftVar == rightVar;
                case "!=":
                    return leftVar != rightVar;
                case "<=":
                    return leftVar <= rightVar;
                case ">=":
                    return leftVar >= rightVar;
                case "<":
                    return leftVar < rightVar;
                case ">":
                    return leftVar > rightVar;
                default:
                    console.log("Invalid Operator");
                    return false;
            }
        }
        return false;
    }

    _getRerollFormulaCap(formula, damage = false, opposedCharmActor = null) {
        const rerollFaceMap = {
            '1': 'one',
            '2': 'two',
            '3': 'three',
            '4': 'four',
            '5': 'five',
            '6': 'six',
            '7': 'seven',
            '8': 'eight',
            '9': 'nine',
            '10': 'ten',
        }

        if (formula.includes('cap')) {
            var split = formula.split(' ');
            if (rerollFaceMap[split[0]]) {
                if (damage) {
                    this.object.damage.reroll[rerollFaceMap[split[0]]].status = true;
                    this.object.damage.reroll[rerollFaceMap[split[0]]].cap = this._getFormulaActorValue(split[2], opposedCharmActor);
                } else {
                    this.object.damage.reroll[rerollFaceMap[split[0]]].status = true;
                    this.object.damage.reroll[rerollFaceMap[split[0]]].cap = this._getFormulaActorValue(split[2], opposedCharmActor);
                }
            }
        }
        else {
            if (rerollFaceMap[formula]) {
                if (damage) {
                    this.object.damage.reroll[rerollFaceMap[formula]].status = true;
                } else {
                    this.object.reroll[rerollFaceMap[formula]].status = true;
                }
            }
        }
    }

    _getCappedFormula(formula, opposedCharmActor = null) {
        let value = 0;
        let cap = 0;
        if (formula.includes('cap')) {
            var split = formula.split(' ');
            value = parseInt(split[0]);
            cap = this._getFormulaActorValue(split[2], opposedCharmActor);
        }
        else {
            value = parseInt(formula);
        }
        return {
            value,
            cap
        }
    }

    _getHealthFormula(formula) {
        let numberValue = formula.replace(/[^0-9]/g, '');
        if (numberValue) {
            if (formula.includes('a')) {
                this.object.cost.healthaggravated += parseInt(numberValue);
            } else if (formula.includes('b')) {
                this.object.cost.healthbashing += parseInt(numberValue);
            } else {
                this.object.cost.healthlethal += parseInt(numberValue);
            }
        }
    }

    _getFormulaActorValue(formula, opposedCharmActor = null, item = null) {
        var formulaVal = 0;
        var forumlaActor = this.actor;
        if (opposedCharmActor) {
            forumlaActor = opposedCharmActor;
        }
        if (parseInt(formula)) {
            return parseInt(formula);
        }
        if (formula?.toLowerCase() === 'thresholdsuccesses') {
            return this.object.thresholdSuccesses || 0;
        }
        if (formula?.toLowerCase() === 'damagedealt') {
            return this.object.damageLevelsDealt || 0;
        }
        if (formula?.toLowerCase() === 'initiativedamagedealt') {
            return this.object.initiativeDamageDealt || 0;
        }
        if (formula?.toLowerCase() === 'itemadded' && item) {
            return item.timesAdded || 0;
        }
        if (formula.includes('target-')) {
            formula = formula.replace('target-', '');
            if (this.object.target?.actor) {
                forumlaActor = this.object.target?.actor;
            }
            else if (Object.values(this.object.targets)[0]) {
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

    async addMultiOpposedBonuses(data) {
        for (const charm of data.charmList) {
            charm.actor = data.actor;
            let timesAdded = charm.timesAdded;
            for (let i = 0; i < timesAdded; i++) {
                await this.addOpposedBonus(charm);
            }
        }
        if (this.object.showTargets) {
            const targetValues = Object.values(this.object.targets);
            if (targetValues.length === 1) {
                targetValues[0].rollData.diceModifier += data.dice;
                targetValues[0].rollData.successModifier += data.successes;
                targetValues[0].rollData.guile += data.guile;
                targetValues[0].rollData.resolve += data.resolve;
                targetValues[0].rollData.defense += data.defense;
                targetValues[0].rollData.soak += data.soak;
                targetValues[0].rollData.hardness += data.hardness;
                targetValues[0].rollData.damageModifier += data.damage;
                if (this.object.rollType === 'damage') {
                    targetValues[0].rollData.attackSuccesses += data.successes;
                }
            }
            else {
                for (const target of targetValues) {
                    if (target.actor.id === data.actor._id || targetValues.length === 1) {
                        target.rollData.diceModifier += data.dice;
                        target.rollData.successModifier += data.successes;
                        target.rollData.guile += data.guile;
                        target.rollData.resolve += data.resolve;
                        target.rollData.defense += data.defense;
                        target.rollData.soak += data.soak;
                        target.rollData.hardness += data.hardness;
                        target.rollData.damageModifier += data.damage;
                        if (this.object.rollType === 'damage') {
                            target.rollData.attackSuccesses += data.successes;
                        }
                    }
                }
            }
        }
        else {
            this.object.defense += data.defense;
            this.object.soak += data.soak;
            this.object.hardness += data.hardness;
            this.object.diceModifier += data.dice;
            if (this.object.rollType === 'readIntentions') {
                this.object.difficulty += data.guile;
            }
            if (this.object.rollType === 'social') {
                this.object.difficulty += data.resolve;
            }
            this.object.successModifier += data.successes;
            this.object.damage.damageDice += data.damage;
            if (this.object.rollType === 'damage') {
                this.object.attackSuccesses += data.successes;
            }
        }
        this.render();
    }

    async addOpposingCharm(charm) {
        if (this.object.rollType === 'useOpposingCharms') {
            this.addCharm(charm);
        } else {
            await this.addOpposedBonus(charm);
            this.render();
        }
    }

    async addOpposedBonus(charm) {
        const addedCharm = this.object.opposingCharms.find(opposedCharm => charm._id === opposedCharm._id);
        if (addedCharm) {
            addedCharm.timesAdded++;
        }
        else {
            charm.timesAdded = 1;
            this.object.opposingCharms.push(charm);
        }
        this.object.targetNumber += charm.system.diceroller.opposedbonuses.increasetargetnumber;
        this.object.rerollSuccesses += this._getFormulaValue(charm.system.diceroller.opposedbonuses.rerollsuccesses);
        this.object.gambitDifficulty += this._getFormulaValue(charm.system.diceroller.opposedbonuses.increasegambitdifficulty, charm.actor);
        if (this.object.showTargets) {
            const targetValues = Object.values(this.object.targets);
            if (targetValues.length === 1) {
                targetValues[0].rollData.guile += this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                targetValues[0].rollData.resolve += this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                targetValues[0].rollData.defense += this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                targetValues[0].rollData.soak += this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                targetValues[0].rollData.shieldInitiative += this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                targetValues[0].rollData.hardness += this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                targetValues[0].rollData.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                targetValues[0].rollData.successModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                targetValues[0].rollData.damageModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                if (this.object.rollType === 'damage') {
                    targetValues[0].rollData.attackSuccesses += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                }
            }
            else {
                for (const target of targetValues) {
                    if (target.actor.id === charm.parent.id || targetValues.length === 1) {
                        target.rollData.guile += this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
                        target.rollData.resolve += this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
                        target.rollData.defense += this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
                        target.rollData.soak += this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
                        target.rollData.shieldInitiative += this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
                        target.rollData.hardness += this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
                        target.rollData.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
                        target.rollData.successModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                        target.rollData.damageModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
                        if (this.object.rollType === 'damage') {
                            target.rollData.attackSuccesses += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
                        }
                    }
                }
            }
        }
        else {
            this.object.defense += this._getFormulaValue(charm.system.diceroller.opposedbonuses.defense, charm.actor);
            this.object.soak += this._getFormulaValue(charm.system.diceroller.opposedbonuses.soak, charm.actor);
            this.object.shieldInitiative += this._getFormulaValue(charm.system.diceroller.opposedbonuses.shieldinitiative, charm.actor);
            this.object.hardness += this._getFormulaValue(charm.system.diceroller.opposedbonuses.hardness, charm.actor);
            this.object.diceModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.dicemodifier, charm.actor);
            this.object.successModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
            this.object.damage.damageDice += this._getFormulaValue(charm.system.diceroller.opposedbonuses.damagemodifier, charm.actor);
            if (this.object.rollType === 'readIntentions') {
                this.object.difficulty += this._getFormulaValue(charm.system.diceroller.opposedbonuses.guile, charm.actor);
            }
            if (this.object.rollType === 'social') {
                this.object.difficulty += this._getFormulaValue(charm.system.diceroller.opposedbonuses.resolve, charm.actor);
            }
            if (this.object.rollType === 'damage') {
                this.object.attackSuccesses += this._getFormulaValue(charm.system.diceroller.opposedbonuses.successmodifier, charm.actor);
            }
        }
        this.object.damage.targetNumber += charm.system.diceroller.opposedbonuses.increasedamagetargetnumber;
        if (charm.system.diceroller.opposedbonuses.triggeronones !== 'none') {
            this.object.settings.triggerOnOnes = charm.system.diceroller.opposedbonuses.triggeronones;
            this.object.settings.alsoTriggerTwos = charm.system.diceroller.opposedbonuses.alsotriggertwos;
        }
        this.object.penaltyModifier += this._getFormulaValue(charm.system.diceroller.opposedbonuses.penaltymodifier);
        this.object.settings.triggerOnesCap += this._getFormulaValue(charm.system.diceroller.opposedbonuses.triggeronescap);
    }

    async _roll() {
        if (this._isAttackRoll()) {
            this.object.gainedInitiative = 0;
            this.object.crashed = false;
            this.object.targetHit = false;
            if (this.object.showTargets) {
                for (const target of Object.values(this.object.targets)) {
                    this.object.target = target;
                    this.object.newTargetData = foundry.utils.duplicate(target.actor);
                    this.object.updateTargetActorData = false;
                    this.object.updateTargetInitiative = false;
                    this.object.newTargetInitiative = null;
                    this.object.targetCombatant = null;
                    if (target.actor?.token?.id || target.actor.getActiveTokens()[0]) {
                        const tokenId = target.actor?.token?.id || target.actor.getActiveTokens()[0].id;
                        this.object.targetCombatant = game.combat?.combatants?.find(c => c.tokenId === tokenId) || null;
                        if (this.object.targetCombatant && this.object.targetCombatant.initiative !== null) {
                            this.object.newTargetInitiative = this.object.targetCombatant.initiative;
                        }
                    }
                    this.object.soak = target.rollData.soak;
                    this.object.shieldInitiative = target.rollData.shieldInitiative;
                    this.object.hardness = target.rollData.hardness;
                    this.object.defense = target.rollData.defense;
                    this.object.attackSuccesses = target.rollData.attackSuccesses;
                    this.object.targetSpecificDiceMod = target.rollData.diceModifier;
                    this.object.targetSpecificSuccessMod = target.rollData.successModifier;
                    this.object.targetSpecificDamageMod = target.rollData.damageModifier;

                    await this._attackRoll();
                    await this._inflictOnTarget();
                    if (this.object.updateTargetActorData) {
                        await this._updateTargetActor();
                    }
                    if (this.object.updateTargetInitiative) {
                        await this._updateTargetInitiative();
                    }
                }
            }
            else {
                await this._attackRoll();
                if (this.object.updateTargetActorData) {
                    await this._updateTargetActor();
                }
                if (this.object.updateTargetInitiative) {
                    await this._updateTargetInitiative();
                }
            }
            await this._postAttackResults();
        }
        else if (this.object.rollType === 'base') {
            await this._diceRoll();
        }
        else if (this.object.hasIntervals) {
            this.object.intervals -= 1;
            await this._completeCraftProject();
        }
        else if (this.object.showTargets && (this.object.rollType === 'social' || this.object.rollType === 'readIntentions')) {
            this.object.hasDifficulty = true;
            if (this.object.showTargets) {
                for (const target of Object.values(this.object.targets)) {
                    this.object.target = target;
                    this.object.newTargetData = foundry.utils.duplicate(target.actor);
                    this.object.updateTargetActorData = false;
                    if (this.object.rollType === 'social') {
                        this.object.difficulty = target.rollData.resolve;
                        this.object.difficulty = Math.max(0, this.object.difficulty + parseInt(target.rollData.opposedIntimacy || 0) - parseInt(target.rollData.supportedIntimacy || 0));
                    }
                    if (this.object.rollType === 'readIntentions') {
                        this.object.difficulty = target.rollData.guile;
                    }
                    this.object.opposedIntimacy = target.rollData.opposedIntimacy;
                    this.object.supportedIntimacy = target.rollData.supportedIntimacy;
                    this.object.appearanceBonus = target.rollData.appearanceBonus;
                    await this._abilityRoll();
                    await this._inflictOnTarget();
                    if (this.object.updateTargetActorData) {
                        await this._updateTargetActor();
                    }
                    if (this.object.updateTargetInitiative) {
                        await this._updateTargetInitiative();
                    }
                }
            }
        }
        else {
            await this._abilityRoll();
            if (this.object.target) {
                await this._inflictOnTarget();
            }
            if (this.object.updateTargetActorData) {
                await this._updateTargetActor();
            }
            if (this.object.updateTargetInitiative) {
                await this._updateTargetInitiative();
            }
        }
    }

    async _inflictOnTarget() {
        if (this.object.target) {
            if (this.object.steal.motes.max) {
                this.object.updateTargetActorData = true;
                const { spentPeripheral, spentPersonal } = this._lowerMotes(this.object.target.actor, this.object.steal.motes.max);
                this.object.steal.motes.gained += (spentPeripheral + spentPersonal);
                this.object.newTargetData.system.motes.peripheral.value = Math.max(0, this.object.newTargetData.system.motes.peripheral.value - spentPeripheral);
                this.object.newTargetData.system.motes.personal.value = Math.max(0, this.object.newTargetData.system.motes.personal.value - spentPersonal);
            }
            if (this.object.steal.initiative.max) {
                this.object.restore.initiative += this.object.steal.initiative.max;

                if (this.object.newTargetInitiative) {
                    this.object.updateTargetInitiative = true;
                    this.object.newTargetInitiative -= this.object.steal.initiative.max;
                    if ((this.object.newTargetInitiative <= 0 && this.object.targetCombatant.initiative > 0)) {
                        this.object.crashed = true;
                    }
                }
            }
            if (this.object.targetDoesntResetOnslaught) {
                this.object.newTargetData.system.dontresetonslaught = true;
            }
        }
    }

    async useOpposingCharms() {
        const addingCharms = [];
        for (const charm of this.object.addedCharms) {
            const newCharm = foundry.utils.duplicate(charm);
            newCharm.timesAdded = charm.timesAdded;
            addingCharms.push(newCharm);
        }
        const data = {
            charmList: addingCharms,
            dice: this.object.addOppose.manualBonus.dice,
            successes: this.object.addOppose.manualBonus.successes,
            defense: this.object.addOppose.manualBonus.defense,
            soak: this.object.addOppose.manualBonus.soak,
            guile: this.object.addOppose.manualBonus.guile,
            resolve: this.object.addOppose.manualBonus.resolve,
            hardness: this.object.addOppose.manualBonus.hardness,
            damage: this.object.addOppose.manualBonus.damage,
        }

        if (game.rollForm) {
            data.actor = this.actor;
            await game.rollForm.addMultiOpposedBonuses(data);
        }

        game.socket.emit('system.exaltedthird', {
            type: 'addMultiOpposingCharms',
            data: data,
            actorId: this.actor._id,
        });
        const messageContent = await renderTemplate("systems/exaltedthird/templates/chat/added-opposing-charms-card.html", {
            actor: this.actor,
            addingCharms: addingCharms,
        });
        ChatMessage.create({
            user: game.user.id,
            content: messageContent,
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            flags: {
                "exaltedthird": {
                    targetActorId: null,
                    targetTokenId: null,
                }
            },
        });
        await this._updateCharacterResources();
        this.close();
    }

    async _updateSpecialtyList() {
        const customAbility = this.actor.customabilities.find(x => x._id === this.object.ability);
        if (customAbility) {
            if (customAbility.system.abilitytype === 'craft') {
                this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.system.ability === 'craft');
            }
            else if (customAbility.system.abilitytype === 'martialarts') {
                this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.system.ability === 'martialarts');
            } else {
                this.object.specialtyList = []
            }
        }
        else {
            if (this.actor.type === 'npc') {
                this.object.specialtyList = this.actor.specialties;
            }
            else {
                this.object.specialtyList = this.actor.specialties.filter((specialty) => specialty.system.ability === this.object.ability);
            }
        }
        this.object.specialtyList = this.object.specialtyList.reduce((acc, specialty) => {
            acc[specialty._id] = specialty.name;
            return acc;
        }, {});
        this.object.specialtyList[''] = "Ex3.NoSpecialty";
    }

    // Dovie'andi se tovya sagain.
    async _rollTheDice(dice, diceModifiers, doublesRolled, numbersRerolled) {
        var total = 0;
        var tensTriggered = 0;
        var onesTriggered = 0;
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
        var roll = await new Roll(`${dice}d10cs>=${diceModifiers.targetNumber}`).evaluate();
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
                var rerollRoll = await new Roll(`${toReroll}d10cs>=${diceModifiers.targetNumber}`).evaluate();
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
            if ((dice.result === 10 || (dice.result === 9 && diceModifiers.settings.alsoTriggerNines)) && diceModifiers.settings.triggerOnTens === 'rerolllDie' && (diceModifiers.settings.triggerTensCap === 0 || diceModifiers.settings.triggerTensCap > tensTriggered)) {
                diceModifiers.rerollNumber += 1;
                tensTriggered += 1;
            }
            if ((dice.result === 1 || (dice.result === 2 && diceModifiers.settings.alsoTriggerTwos)) && diceModifiers.settings.triggerOnOnes === 'rerollSuccesses' && (diceModifiers.settings.triggerOnesCap === 0 || diceModifiers.settings.triggerOnesCap > onesTriggered)) {
                diceModifiers.rerollSuccesses += 1;
                onesTriggered += 1;
            }
        }

        let rollResult = {
            roll: roll,
            results: results,
            total: total,
        };

        return rollResult;
    }

    async _calculateRoll(dice, diceModifiers) {
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
        //Base Roll
        let rollResults = await this._rollTheDice(dice, diceModifiers, doublesRolled, numbersRerolled);
        let diceRoll = rollResults.results;
        let total = rollResults.total;
        var possibleRerolls = 0;
        var possibleSuccessRerolls = 0;
        diceRoll.forEach((item, index) => item.originalIndex = index);
        // Reroll Failed Number
        if (diceModifiers.rerollFailed) {
            for (const diceResult of diceRoll.sort((a, b) => a.result - b.result)) {
                if (!diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                    possibleRerolls++;
                    diceResult.rerolled = true;
                }
            }
            var failedDiceRollResult = await this._rollTheDice(possibleRerolls, diceModifiers, doublesRolled, numbersRerolled);
            diceRoll = diceRoll.concat(failedDiceRollResult.results);
            total += failedDiceRollResult.total;
        }

        possibleRerolls = 0;
        possibleSuccessRerolls = 0;
        for (const diceResult of diceRoll.sort((a, b) => a.result - b.result)) {
            if (diceModifiers.rerollNumber > possibleRerolls && !diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                possibleRerolls++;
                diceResult.rerolled = true;
            }
            if (diceModifiers.rerollSuccesses > possibleSuccessRerolls && !diceResult.rerolled && diceResult.result >= this.object.targetNumber) {
                possibleSuccessRerolls++;
                total--;
                if (diceResult.doubled) {
                    total--;
                }
                diceResult.rerolled = true;
                diceResult.successCanceled = true;
            }
        }
        // Rerolls starting at lowest number going up
        var diceToReroll = Math.min(possibleRerolls, diceModifiers.rerollNumber);
        let rerolledDice = 0;
        while (diceToReroll > 0 && (rerolledDice < diceModifiers.rerollNumber)) {
            rerolledDice += possibleRerolls;
            var rerollNumDiceResults = await this._rollTheDice(diceToReroll, diceModifiers, doublesRolled, numbersRerolled);
            diceToReroll = 0;
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
        possibleRerolls = 0;
        for (const diceResult of this._sortDice(diceRoll)) {
            if (diceModifiers.rerollNumberDescending > possibleRerolls && !diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                possibleRerolls++;
                diceResult.rerolled = true;
            }
        }
        var descendingDiceToReroll = Math.min(possibleRerolls, diceModifiers.rerollNumberDescending);
        let rerolledDescendingDice = 0;
        while (descendingDiceToReroll > 0 && (rerolledDescendingDice < diceModifiers.rerollNumberDescending)) {
            rerolledDescendingDice += possibleRerolls;
            var rerollNumDiceResults = await this._rollTheDice(descendingDiceToReroll, diceModifiers, doublesRolled, numbersRerolled);
            descendingDiceToReroll = 0
            for (const diceResult of this._sortDice(rerollNumDiceResults.results, true)) {
                if (diceModifiers.rerollNumberDescending > possibleRerolls && !diceResult.rerolled && diceResult.result < this.object.targetNumber && (!diceModifiers.settings.excludeOnesFromRerolls || diceResult.result !== 1)) {
                    possibleRerolls++;
                    descendingDiceToReroll++;
                    diceResult.rerolled = true;
                }
            }
            diceRoll = diceRoll.concat(rerollNumDiceResults.results);
            total += rerollNumDiceResults.total;
        }
        var successesToReroll = Math.min(possibleSuccessRerolls, diceModifiers.rerollSuccesses);
        let successRerolledDice = 0;
        while (successesToReroll > 0 && (successRerolledDice < diceModifiers.rerollSuccesses)) {
            successRerolledDice += possibleSuccessRerolls;
            var rerollNumDiceResults = await this._rollTheDice(successesToReroll, diceModifiers, doublesRolled, numbersRerolled);
            successesToReroll = 0
            for (const diceResult of rerollNumDiceResults.results.sort((a, b) => a.result - b.result)) {
                if (diceModifiers.rerollSuccesses > possibleSuccessRerolls && !diceResult.rerolled && diceResult.result >= this.object.targetNumber) {
                    possibleSuccessRerolls++;
                    successesToReroll++;
                    total--;
                    if (diceResult.doubled) {
                        total--;
                    }
                    diceResult.rerolled = true;
                    diceResult.successCanceled = true;
                }
            }
            diceRoll = diceRoll.concat(rerollNumDiceResults.results);
            total += rerollNumDiceResults.total;
        }
        total += diceModifiers.successModifier;
        if (this.object.specificCharms?.divineInsperationTechnique || this.object.specificCharms?.holisticMiracleUnderstanding) {
            let newCraftDice = Math.floor(total / 3);
            let remainder = total % 3;
            while (newCraftDice > 0) {
                var rollSuccessTotal = 0;
                var craftDiceRollResults = await this._rollTheDice(newCraftDice, diceModifiers, doublesRolled, numbersRerolled);
                diceRoll = diceRoll.concat(craftDiceRollResults.results);
                rollSuccessTotal += craftDiceRollResults.total;
                total += craftDiceRollResults.total;
                newCraftDice = Math.floor((rollSuccessTotal + remainder) / 3);
                remainder = rollSuccessTotal % 3;
                if (this.object.specificCharms?.holisticMiracleUnderstanding) {
                    newCraftDice * 4;
                }
            }
        }

        if (this.object.specificCharms?.firstMovementoftheDemiurge) {
            let faceCount = diceRoll.filter(d => d.active && d.success).reduce((carry, d) => ({ ...carry, [d.result]: (carry[d.result] || 0) + 1 }), {})
            let facesConsumed = {};
            let depth = 0;
            let diceCoverted = 0;
            let faces = Array.from({ length: 11 - diceModifiers.targetNumber }, (v, k) => k + diceModifiers.targetNumber);
            let failures = diceRoll.filter(d => d.active && !d.success).sort((a, b) => b.result - a.result);

            let faceCheck = () => {
                let result = faces.some(f => {
                    let facesLeft = (faceCount[f] || 0) - (facesConsumed[f] || 0)
                    return facesLeft >= 3
                })
                return result;
            };

            while (faceCheck()) {
                let transformedFailures = [];
                // for every triple-success, transform a failure into a 10
                if (!failures.length) break;

                faces.forEach(f => {
                    facesConsumed[f] = facesConsumed[f] || 0;
                    let facesLeft = (faceCount[f] || 0) - (facesConsumed[f] || 0);
                    if (facesLeft >= 3 && failures.length > 0) for (let i = 0; i < Math.min(failures.length, Math.floor(facesLeft / 3)); i++) {
                        facesConsumed[f] += 3;
                        faceCount[10]++;
                        diceCoverted++;
                        let oldDie = failures.pop();
                        oldDie.rerolled = true;
                        numbersRerolled[oldDie.result]++;
                        let transformedDie = ({
                            ...oldDie,
                            result: 10,
                            success: true,
                            count: 1,
                        })
                        total++
                        if (10 >= diceModifiers.doubleSuccess) {
                            total++
                            doublesRolled[10]++;
                            transformedDie.doubled = true;
                        }
                        transformedFailures.push(oldDie)
                        diceRoll.push(transformedDie);
                    }
                });
                // Reroll Exploding 10s if needed
                if (diceModifiers.reroll.ten && transformedFailures.length > 0) {
                    transformedFailures.forEach(f => f.rerolled = true);
                    numbersRerolled[10] += transformedFailures.length;
                    depth++
                    let moreResults = await this._rollTheDice(transformedFailures.length, diceModifiers, doublesRolled, numbersRerolled)
                    total += moreResults.total;
                    moreResults.results.forEach(r => faceCount[r.result]++);
                    diceRoll.push(...moreResults.results);
                }
            }
            if (diceCoverted) {
                (this.object.triggerMessages || []).push(`First Movement of the Demiurge: Converted ${diceCoverted} dice to 10s`);
            }
        }

        if (diceModifiers.type === 'standard' && this.object.specificCharms?.risingSunSlash) {
            let faceCount = diceRoll.filter(d => d.active && d.success).reduce((carry, d) => ({ ...carry, [d.result]: (carry[d.result] || 0) + 1 }), {});
            if (faceCount[7] && faceCount[8] && faceCount[9] && faceCount[10]) {
                total += 1;
                let moreResults = await this._rollTheDice(this.actor.system.essence.value, diceModifiers, doublesRolled, numbersRerolled)
                total += moreResults.total;
                diceRoll.push(...moreResults.results);
                (this.object.triggerMessages || []).push(`Rising Sun Slash Triggered: ${this.actor.system.essence.value} Dice and 1 Success added`);
            }
            else {
                this.object.cost.motes--;
            }
        }

        if (diceModifiers.type === 'standard' && this.object.specificCharms?.risingSunSlashGc) {
            let faceCount = diceRoll.filter(d => d.active && d.success).reduce((carry, d) => ({ ...carry, [d.result]: (carry[d.result] || 0) + 1 }), {});
            let triggerCharm = false;
            let biggestSet = 0;
            for (var face of Object.values(faceCount)) {
                if (face >= 3) {
                    triggerCharm = true;
                }
                biggestSet = face;
            }
            if (triggerCharm) {
                total += 1;
                let moreResults = await this._rollTheDice(this.actor.system.essence.value, diceModifiers, doublesRolled, numbersRerolled)
                total += moreResults.total;
                diceRoll.push(...moreResults.results);
                (this.object.triggerMessages || []).push(`Rising Sun Slash Triggered: ${this.actor.system.essence.value} Dice and 1 Success added`);
            }
            else {
                this.object.cost.motes--;
            }
        }

        if (diceModifiers.macros.length > 0) {
            let newResults = { ...rollResults, results: diceRoll, total };
            newResults = await diceModifiers.macros.reduce((carry, macro) => macro(carry, dice, diceModifiers, doublesRolled, numbersRerolled), newResults);
            total = newResults.total;
            rollResults = newResults;
        }
        // let newResults = { ...rollResults, results: diceRoll, total };
        // this._testMacro(newResults, dice, diceModifiers, doublesRolled, numbersRerolled);
        rollResults.roll.dice[0].results = diceRoll;

        let diceDisplay = "";
        diceRoll.sort((a, b) => a.originalIndex - b.originalIndex);

        for (let dice of this._sortDice(diceRoll)) {
            if (dice.successCanceled) { diceDisplay += `<li class="roll die d10 rerolled">${dice.result}</li>`; }
            else if (dice.doubled) {
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

    // _testMacro(rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) {
    //     let combatant = this._getActorCombatant();
    //     if (combatant && combatant.initiative != null && combatant.initiative >= 15) {
    //         this.object.damage.damageDice += this.actor.system.attributes.dexterity;
    //     }
    //     else {
    //         this.object.damage.damageDice += Math.ceil(this.actor.system.attributes.dexterity / 2);
    //     }
    //     let { results, roll, total } = rollResult;
    //     return { results, roll, total };
    // }

    async _baseAbilityDieRoll() {
        await this._addTriggerBonuses('beforeRoll');

        let dice = 0;
        let successes = 0;

        if (this.object.rollType === 'base') {
            dice = this.object.dice;
            successes = this.object.successModifier;
        }
        else {
            const data = this.actor.system;
            const actorData = foundry.utils.duplicate(this.actor);

            dice = await this._assembleDicePool(false);

            if (this.object.successModifier) {
                successes += this.object.successModifier;
            }

            if (this.object.diceToSuccesses > 0) {
                successes += Math.min(dice, this.object.diceToSuccesses);
            }
            if (this.object.targetSpecificSuccessMod) {
                successes += this.object.targetSpecificSuccessMod;
            }
            if (this.object.willpower) {
                successes++;
                this.object.cost.willpower++;
            }
            if (this.object.stunt === 'two') {
                if (this.object.willpower) {
                    this.object.cost.willpower--;
                }
                else if (actorData.system.willpower.value < actorData.system.willpower.max) {
                    actorData.system.willpower.value++;
                }
                successes++;
            }
            if (this.object.stunt === 'three') {
                actorData.system.willpower.value += 2;
                successes += 2;
            }
            await this.actor.update(actorData);
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

        var rollModifiers = {
            successModifier: successes,
            doubleSuccess: this.object.doubleSuccess,
            targetNumber: this.object.targetNumber,
            reroll: this.object.reroll,
            rerollFailed: this.object.rerollFailed,
            rerollNumber: this.object.rerollNumber,
            rerollNumberDescending: this.object.rerollNumberDescending,
            rerollSuccesses: this.object.rerollSuccesses || 0,
            settings: this.object.settings,
            preRollMacros: [],
            macros: [],
            type: 'standard',
        }

        for (let charm of this.object.addedCharms) {
            if (charm.system.prerollmacro) {
                let macro = new Function('rollResult', 'dice', 'rollModifiers', charm.system.prerollmacro);
                rollModifiers.preRollMacros.push((rollResult, dice, rollModifiers) => {
                    try {
                        this.object.currentMacroCharm = charm;
                        this.object.opposedCharmMacro = false;
                        return macro.call(this, rollResult, dice, rollModifiers) ?? rollResult
                    } catch (e) {
                        ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                        console.error(e);
                    }
                    return rollResult;
                });
            }
            if (charm.system.macro) {
                const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
                let macro = new AsyncFunction('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.macro);
                rollModifiers.macros.push(async (rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                    try {
                        this.object.currentMacroCharm = charm;
                        this.object.opposedCharmMacro = false;
                        return await macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                    } catch (e) {
                        ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                        console.error(e);
                    }
                    return rollResult;
                });
            }
        }

        for (let charm of this.object.opposingCharms) {
            if (charm.system.prerollmacro) {
                let macro = new Function('rollResult', 'dice', 'rollModifiers', charm.system.prerollmacro);
                rollModifiers.preRollMacros.push((rollResult, dice, rollModifiers) => {
                    try {
                        this.object.opposedCharmMacro = true;
                        this.object.currentMacroCharm = charm;
                        return macro.call(this, rollResult, dice, rollModifiers) ?? rollResult
                    } catch (e) {
                        ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                        console.error(e);
                    }
                    return rollResult;
                });
            }
            if (charm.system.macro) {
                let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.macro);
                rollModifiers.macros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                    try {
                        this.object.opposedCharmMacro = true;
                        this.object.currentMacroCharm = charm;
                        return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                    } catch (e) {
                        ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                        console.error(e);
                    }
                    return rollResult;
                });
            }
        }

        if (rollModifiers.preRollMacros.length > 0) {
            let results = {};
            results = rollModifiers.preRollMacros.reduce((carry, macro, rollModifiers) => macro(carry, dice), results);
            if (results && results.dice) {
                dice = results.dice;
            }
        }

        this.object.dice = dice;
        this.object.successes = successes;

        const diceRollResults = await this._calculateRoll(dice, rollModifiers);
        this.object.roll = diceRollResults.roll;
        this.object.displayDice = diceRollResults.diceDisplay;
        this.object.total = diceRollResults.total;
        var diceRoll = diceRollResults.diceRoll;

        if (this.object.rollTwice || this.object.rollTwiceLowest) {
            if (this.object.rollTwice && !this.object.rollTwiceLowest) {
                const secondRoll = await this._calculateRoll(dice, rollModifiers);
                if (secondRoll.total > diceRollResults.total) {
                    this.object.roll = secondRoll.roll;
                    this.object.displayDice = secondRoll.diceDisplay;
                    this.object.total = secondRoll.total;
                    diceRoll = secondRoll.diceRoll;
                }
            } else if (this.object.rollTwiceLowest && !this.object.rollTwice) {
                const secondRoll = await this._calculateRoll(dice, rollModifiers);
                if (secondRoll.total < diceRollResults.total) {
                    this.object.roll = secondRoll.roll;
                    this.object.displayDice = secondRoll.diceDisplay;
                    this.object.total = secondRoll.total;
                    diceRoll = secondRoll.diceRoll;
                }
            }
        }
        this.object.roll.dice[0].options.rollOrder = 1;

        let onesRolled = 0;
        let tensRolled = 0;
        for (let dice of diceRoll) {
            if (!dice.rerolled && (dice.result === 1 || (dice.result === 2 && this.object.settings.alsoTriggerTwos))) {
                onesRolled++
            }
            if (!dice.successCanceled && (dice.result === 10 || (dice.result === 9 && this.object.settings.alsoTriggerNines))) {
                tensRolled++;
            }
        }
        if (this.object.settings.triggerOnesCap) {
            onesRolled = Math.min(onesRolled, this.object.settings.triggerOnesCap);
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

        if (this.object.settings.triggerTensCap) {
            tensRolled = Math.min(tensRolled, this.object.settings.triggerTensCap);
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
                case 'ignoreHardness':
                    this.object.damage.ignoreHardness += tensRolled;
                    break;
                case 'restoreMote':
                    this.object.restore.motes += tensRolled;
                    break
            }
        }

        if (!this._isAttackRoll() && this.object.rollType !== 'base') {
            await this._updateCharacterResources();
        }
        if (this._isAttackRoll()) {
            this.object.thresholdSuccesses = Math.max(0, this.object.total - this.object.defense);
            this.object.attackSuccesses = this.object.total;
            if (this.object.target) {
                this.object.target.rollData.attackSuccesses = this.object.total;
            }
        }
        else {
            this.object.thresholdSuccesses = Math.max(0, this.object.total - (this.object.difficulty || 0));
        }
        await this._addTriggerBonuses('afterRoll');
    }

    async _diceRoll() {
        await this._baseAbilityDieRoll();
        let messageContent = `
        <div class="dice-roll">
            <div class="dice-result">
                <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes
                </h4>
                <div class="dice-tooltip">
                    <div class="dice">
                        <ol class="dice-rolls">${this.object.displayDice}</ol>
                    </div>
                </div>
                <h4 class="dice-total">${this.object.total} Successes</h4>
            </div>
        </div>`;


        messageContent = await this._createChatMessageContent(messageContent, 'Dice Roll');
        ChatMessage.create({ user: game.user.id, speaker: this.actor !== null ? ChatMessage.getSpeaker({ actor: this.actor }) : null, content: messageContent, style: CONST.CHAT_MESSAGE_STYLES.OTHER, rolls: [this.object.roll] });
    }

    async _abilityRoll() {
        if (this.object.attribute == null) {
            this.object.attribute = this.actor.type === "npc" ? null : this._getHighestAttribute(this.actor.system.attributes);
        }
        if (!this.object.showTargets && this.object.rollType === 'social') {
            this.object.difficulty = Math.max(0, this.object.difficulty + parseInt(this.object.opposedIntimacy || 0) - parseInt(this.object.supportedIntimacy || 0));
        }
        let goalNumberLeft = this.object.goalNumber;
        await this._baseAbilityDieRoll();
        let resultString = ``;
        let extendedTest = ``;

        if (this.object.rollType === "joinBattle") {
            if (game.combat) {
                let combatant = this._getActorCombatant();
                if (!combatant || combatant.initiative === null) {
                    resultString += `<h4 class="dice-total">${this.object.total + 3} Initiative</h4>`;
                }
            }
            else {
                resultString += `<h4 class="dice-total">${this.object.total + 3} Initiative</h4>`;
            }
        }
        if (this.object.rollType === "sorcery") {
            if (this.object.spell) {
                let crashed = false;
                if (game.combat) {
                    let combatant = this._getActorCombatant();
                    if (combatant && combatant?.initiative !== null && combatant.initiative <= 0) {
                        crashed = true;
                    }
                }
                const fullSpell = this.actor.items.get(this.object.spell);
                if (fullSpell) {
                    resultString += `<h4 class="dice-total">Spell Motes: ${this.object.previousSorceryMotes + this.object.total}/${parseInt(fullSpell.system.cost) + (crashed ? 3 : 0)}</h4>`;
                }
                if (this.object.spellCast) {
                    resultString += `<h4 class="dice-total" style="margin-top:5px">Spell Cast</h4>`;
                }
            }
        }
        const thresholdSuccesses = Math.max(0, this.object.total - (this.object.difficulty || 0));
        if (this.object.hasDifficulty) {
            if (this.object.total < this.object.difficulty) {
                resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Check Failed</h4>`;
                if (this.object.total === 0 && this.object.roll.dice[0].results.some((die) => die.result === 1)) {
                    resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Botch</h4>`;
                }
            }
            else {
                resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">${thresholdSuccesses} Threshhold Successes</h4>`;
                goalNumberLeft = Math.max(goalNumberLeft - thresholdSuccesses - 1, 0);
                if (this.object.rollType === "simpleCraft") {
                    var craftXPGained = Math.min(this.object.maxCraftXP, thresholdSuccesses + 1);
                    resultString += `<h4 class="dice-total dice-total-end">Craft XP Gained: ${craftXPGained}</h4>`;
                    if (this.object.craftProjectId) {
                        var projectItem = this.actor.items.get(this.object.craftProjectId);
                        var newXp = projectItem.system.experience.completed + craftXPGained;
                        if (projectItem) {
                            if ((newXp) > projectItem.system.experience.required) {
                                resultString += `<h4 class="dice-total dice-total-end">Project Completed</h4>`;
                            }
                            else {
                                resultString += `<h4 class="dice-total dice-total-end">${projectItem.system.experience.required - projectItem.system.experience.completed - craftXPGained} Experience Remaining</h4>`;
                            }
                            projectItem.update({
                                [`system.experience.completed`]: newXp,
                            });
                        }
                    }
                    else {
                        const actorData = foundry.utils.duplicate(this.actor);
                        actorData.system.craft.experience.simple.value += craftXPGained;
                        this.actor.update(actorData);
                    }
                }
            }
            if (this.object.goalNumber > 0) {
                extendedTest = `<h4 class="dice-total dice-total-middle" style="margin-top:5px">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
            }
            this.object.goalNumber = goalNumberLeft;
            if (this.object.rollType === "grappleControl") {
                const actorData = foundry.utils.duplicate(this.actor);
                actorData.system.grapplecontrolrounds.value += thresholdSuccesses;
                this.actor.update(actorData);
            }
            if (this.object.target && this.object.rollType === 'command') {
                if (this.object.target.actor.type === 'npc' && this.object.target.actor.system.battlegroup) {
                    this.object.newTargetData.system.commandbonus.value = thresholdSuccesses;
                    this.object.updateTargetActorData = true;
                }
            }
            if (this.object.rollType === 'steady') {
                this.object.restore.initiative += Math.min(5, thresholdSuccesses);
            }
        }
        let theContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <ol class="dice-rolls">${this.object.displayDice}</ol>
                        </div>
                    </div>
                    <h4 class="dice-total dice-total-middle">${this.object.total} Successes</h4>
                    ${resultString}
                    ${extendedTest}
                </div>
            </div>`
        let chatCardTitle = 'Ability Roll';
        if (this.object.rollType === 'social') {
            chatCardTitle = `Social action ${this.object.target ? ` on ${this.object.target.name}` : ''}`;
        }
        if (this.object.rollType === 'readIntentions') {
            chatCardTitle = `Read intentions action ${this.object.target ? ` on ${this.object.target.name}` : ''}`;
        }
        theContent = await this._createChatMessageContent(theContent, chatCardTitle)
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: theContent,
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            rolls: [this.object.roll],
            flags: {
                "exaltedthird": {
                    dice: this.object.dice,
                    successes: this.object.successes,
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
                    if (combatant.initiative === null) {
                        combat.setInitiative(combatant.id, this.object.total + 3);
                    }
                    else {
                        combat.setInitiative(combatant.id, combatant.initiative + this.object.total);
                    }
                }
            }
        }
        if (this.object.rollType === 'steady') {
            let combat = game.combat;
            if (combat) {
                let combatant = this._getActorCombatant();
                if (combatant && combatant.initiative != null) {
                    combat.setInitiative(combatant.id, combatant.initiative + thresholdSuccesses);
                }
            }
        }
    }

    async _attackRoll() {
        // Accuracy
        if (this.object.rollType !== 'damage') {
            await this._baseAbilityDieRoll();
        }
        else {
            this.object.thresholdSuccesses = 0;
        }
        if (this.object.rollType === 'damage' || (this.object.attackSuccesses >= this.object.defense && this.object.rollType !== 'accuracy')) {
            if (this.object.rollType === 'damage' && this.object.attackSuccesses < this.object.defense) {
                this.object.thresholdSuccesses = this.object.attackSuccesses - this.object.defense;
                await this.missAttack(false);
            }
            else {
                await this._damageRoll();
            }
        }
        else {
            if (this.object.attackSuccesses < this.object.defense && this.object.rollType !== 'accuracy') {
                await this.missAttack();
            }
        }
        if (this.object.rollType === 'accuracy') {
            var messageContent = `
                            <div class="dice-roll">
                                <div class="dice-result">
                                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                                    <div class="dice-tooltip">
                                        <div class="dice">
                                            <ol class="dice-rolls">${this.object.displayDice}</ol>
                                        </div>
                                    </div>
                                    <h4 class="dice-total">${this.object.total} Successes</h4>
                                    ${this.object.target ? `<div><button class="add-oppose-charms"><i class="fas fa-shield-plus"></i> ${game.i18n.localize('Ex3.AddOpposingCharms')}</button></div>` : ''}
                                </div>
                            </div>`;
            messageContent = await this._createChatMessageContent(messageContent, `Accuracy Roll ${this.object.target ? ` vs ${this.object.target.name}` : ''}`);

            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: messageContent,
                style: CONST.CHAT_MESSAGE_STYLES.OTHER,
                rolls: [this.object.roll],
                flags: {
                    "exaltedthird": {
                        dice: this.object.dice,
                        successes: this.object.successes,
                        successModifier: this.object.successModifier,
                        total: this.object.total,
                        defense: this.object.defense,
                        thresholdSuccesses: this.object.thresholdSuccesses,
                        targetActorId: this.object.target?.actor?._id,
                        targetTokenId: this.object.target?.id,
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
            if (this.object.targetHit) {
                this.object.gainedInitiative += 1;
            }
            if (this.object.crashed) {
                if (!this.object.targetCombatant?.flags.crashRecovery) {
                    this.object.gainedInitiative += 5;
                }
            }
            if (game.settings.get("exaltedthird", "automaticWitheringDamage") && this.object.gainedInitiative && this.object.damage.gainInitiative) {
                this.object.characterInitiative += this.object.gainedInitiative;
            }
            const triggerMissedAttack = this.object.missedAttacks > 0 && (this.object.missedAttacks >= this.object.showTargets)
            if (triggerMissedAttack && this.object.attackType !== 'withering' && this.object.damage.resetInit && !game.settings.get("exaltedthird", "forgivingDecisives")) {
                if (this.object.characterInitiative < 11) {
                    this.object.characterInitiative -= 2;
                }
                else {
                    this.object.characterInitiative -= 3;
                }
            }
            if (!triggerMissedAttack && this.object.attackType === 'decisive' && this.object.damage.resetInit) {
                this.object.characterInitiative = this.actor.system.baseinitiative.value;
            }
            if (this.object.attackType === 'gambit') {
                if (this.object.characterInitiative > 0 && (this.object.characterInitiative - this.object.gambitDifficulty - 1 <= 0)) {
                    this.object.characterInitiative -= 5;
                }
                this.object.characterInitiative = this.object.characterInitiative - this.object.gambitDifficulty - 1;
            }
            if (this.object.initiativeShift && this.object.characterInitiative < this.actor.system.baseinitiative.value) {
                this.object.characterInitiative = this.actor.system.baseinitiative.value;
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
    }

    async missAttack(accuracyRoll = true) {
        this.object.missedAttacks++;
        if (accuracyRoll) {
            var messageContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <ol class="dice-rolls">${this.object.displayDice || ''}</ol>
                        </div>
                    </div>
                    <h4 class="dice-formula">${this.object.total || 0} Successes vs ${this.object.defense} Defense</h4>
                    <h4 class="dice-formula">${this.object.thresholdSuccesses} Threshhold Successes</h4>
                    <h4 class="dice-total">Attack Missed!</h4>
                </div>
            </div>`;
            messageContent = await this._createChatMessageContent(messageContent, 'Attack Roll')
            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: messageContent,
                style: CONST.CHAT_MESSAGE_STYLES.OTHER,
                rolls: this.object.roll ? [this.object.roll] : [],
                flags: {
                    "exaltedthird": {
                        dice: this.object.dice,
                        successes: this.object.successes,
                        successModifier: this.object.successModifier,
                        total: this.object.total || 0,
                        defense: this.object.defense,
                        thresholdSuccesses: this.object.thresholdSuccesses
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
                style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            });
        }
    }

    async _failedDecisive(dice) {
        this.object.damageLevelsDealt = 0;
        let accuracyContent = '';
        if (this.object.rollType !== 'damage') {
            accuracyContent = `
                <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                <div class="dice-tooltip">
                    <div class="dice">
                        <ol class="dice-rolls">${this.object.displayDice}</ol>
                    </div>
                </div>
                <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
                <h4 class="dice-formula">${this.object.thresholdSuccesses} Threshhold Successes</h4>
            `
        }
        var messageContent = `
        <div class="dice-roll">
            <div class="dice-result">
                ${accuracyContent}
                <h4 class="dice-formula">${dice} Damage vs ${this.object.hardness} Hardness (Ignoring ${this.object.damage.ignoreHardness})</h4>
                <h4 class="dice-total">Hardness Stopped Decisive!</h4>
            </div>
        </div>`;
        messageContent = await this._createChatMessageContent(messageContent, 'Attack Roll')
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: messageContent,
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        });
    }

    async _damageRoll() {
        // let dice = this.object.damage.damageDice;
        var damageResults = ``;
        await this._addTriggerBonuses('beforeDamageRoll');
        var dice = await this._assembleDamagePool(false);
        let baseDamage = dice;
        if (this._damageRollType('decisive')) {
            if (this.object.target) {
                if (this.object.target.actor.type === 'npc' && this.object.target.actor.system.battlegroup) {
                    this.object.damage.damageSuccessModifier += Math.ceil(dice / 4);
                    if (this.object.doubleBGDecisiveDamageBonus) {
                        this.object.damage.damageSuccessModifier += Math.ceil(dice / 4);
                    }
                }
            }
        }
        if (this.object.damage.diceToSuccesses > 0) {
            this.object.damage.damageSuccessModifier += Math.min(dice, this.object.damage.diceToSuccesses);
        }

        if (this.object.attackType === 'decisive' && dice <= (this.object.hardness - this.object.damage.ignoreHardness)) {
            return await this._failedDecisive(dice);
        }
        var rollModifiers = {
            successModifier: this.object.damage.damageSuccessModifier,
            doubleSuccess: this.object.damage.doubleSuccess,
            targetNumber: this.object.damage.targetNumber,
            reroll: this.object.damage.reroll,
            rerollFailed: this.object.damage.rerollFailed,
            rerollNumber: this.object.damage.rerollNumber,
            rerollNumberDescending: this.object.damage.rerollNumberDescending,
            rerollSuccesses: this.object.damage.rerollSuccesses || 0,
            settings: this.object.settings.damage,
            preRollMacros: [],
            macros: [],
            type: 'damage',
        }

        for (let charm of this.object.addedCharms) {
            if (!charm.system.damagemacro) continue;
            let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.damagemacro);
            rollModifiers.macros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                try {
                    this.object.currentMacroCharm = charm;
                    this.object.opposedCharmMacro = false;
                    return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                } catch (e) {
                    ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                    console.error(e);
                }
                return rollResult;
            });
        }

        for (let charm of this.object.opposingCharms) {
            if (!charm.system.damagemacro) continue;
            let macro = new Function('rollResult', 'dice', 'diceModifiers', 'doublesRolled', 'numbersRerolled', charm.system.damagemacro);
            rollModifiers.macros.push((rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) => {
                try {
                    this.object.currentMacroCharm = charm;
                    this.object.opposedCharmMacro = true;
                    return macro.call(this, rollResult, dice, diceModifiers, doublesRolled, numbersRerolled) ?? rollResult
                } catch (e) {
                    ui.notifications.error(`<p>There was an error in your macro syntax for "${charm.name}":</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                    console.error(e);
                }
                return rollResult;
            });
        }

        var diceRollResults = await this._calculateRoll(dice, rollModifiers);
        if (this.object.damage.rollTwice || this.object.damage.rollTwiceLowest) {
            if (this.object.damage.rollTwice && !this.object.damage.rollTwiceLowest) {
                const secondRoll = await this._calculateRoll(dice, rollModifiers);
                if (secondRoll.total > diceRollResults.total) {
                    diceRollResults = secondRoll;

                }
            } else if (this.object.damage.rollTwiceLowest && !this.object.damage.rollTwice) {
                const secondRoll = await this._calculateRoll(dice, rollModifiers);
                if (secondRoll.total < diceRollResults.total) {
                    diceRollResults = secondRoll;
                }
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

        let tensRolled = 0;
        let onesRolled = 0;
        for (let dice of diceRollResults.diceRoll) {
            if (!dice.rerolled && (dice.result === 1 || (dice.result === 2 && this.object.settings.damage.alsoTriggerTwos))) {
                onesRolled++
            }
            if (!dice.successCanceled && (dice.result === 10 || (this.object.settings.damage.alsoTriggerNines && dice.result === 9))) {
                tensRolled++;
            }
        }

        if (this.object.settings.damage.triggerOnesCap) {
            onesRolled = Math.min(onesRolled, this.object.settings.damage.triggerOnesCap);
        }
        if (onesRolled > 0 && this.object.settings.damage.triggerOnOnes) {
            switch (this.object.settings.damage.triggerOnOnes) {
                case 'subtractDamageSuccesses':
                    total = Math.max(0, total - onesRolled);
                    break;
            }
        }

        if (this.object.settings.damage.triggerTensCap) {
            tensRolled = Math.min(tensRolled, this.object.settings.damage.triggerTensCap);
        }
        if (tensRolled > 0 && this.object.settings.damage.triggerOnTens !== 'none') {
            switch (this.object.settings.damage.triggerOnTens) {
                case 'subtractTargetInitiative':
                    if (this.object.newTargetInitiative) {
                        this.object.updateTargetInitiative = true;
                        this.object.newTargetInitiative--;
                        if ((this.object.newTargetInitiative <= 0 && this.object.targetCombatant.initiative > 0)) {
                            this.object.crashed = true;
                        }
                    }
                    break;
            }
        }
        if (this.object.isClash) {
            if (this._damageRollType('decisive')) {
                total += 1;
            } else {
                total += 3;
            }
            this.object.triggerTargetDefensePenalty += 2;
        }
        this.object.damageSuccesses = total;

        await this._addTriggerBonuses('afterDamageRoll');

        let soakResult = ``;
        let hardnessResult = ``;
        let typeSpecificResults = ``;
        var sizeDamaged = 0;
        this.object.attackSuccess = true;
        this.object.damageThresholdSuccesses = 0;

        if (this._damageRollType('decisive')) {

            typeSpecificResults = `<h4 class="dice-formula">${dice} Damage vs ${this.object.hardness} Hardness (Ignoring ${this.object.damage.ignoreHardness})</h4><h4 class="dice-total">${total} ${this.object.damage.type.capitalize()} Damage!</h4>`;
            if (this._useLegendarySize('decisive')) {
                typeSpecificResults += `<h4 class="dice-formula">Legendary Size</h4><h4 class="dice-formula">Damage capped at ${3 + this.actor.system.attributes.strength.value + this.object.damage.damageSuccessModifier} + Charm damage levels</h4>`;
                this.object.damageSuccesses = Math.min(this.object.damageSuccesses, 3 + this.actor.system.attributes.strength.value + this.object.damage.damageSuccessModifier);
            }
            typeSpecificResults += `
            <button
                type='button'
                class='apply-decisive-damage'
                data-tooltip='${game.i18n.localize('Ex3.ApplyDecisiveDamage')}'
                aria-label='${game.i18n.localize('Ex3.ApplyDecisiveDamage')}'
            >
                <i class='fa-solid fa-meter-droplet'></i>
                ${game.i18n.localize('Ex3.ApplyDecisiveDamage')}
            </button>
            `;
            if (game.settings.get("exaltedthird", "automaticDecisiveDamage")) {
                this.dealHealthDamage(this.object.damageSuccesses);
            }
            this.object.damageLevelsDealt = this.object.damageSuccesses;
        }
        else if (this._damageRollType('gambit')) {
            var resultsText = `<h4 class="dice-total">Gambit Success</h4>`;
            if (this.object.gambitDifficulty > this.object.damageSuccesses) {
                this.object.attackSuccess = false;
                resultsText = `<h4 class="dice-total">Gambit Failed</h4>`
            }
            typeSpecificResults = `<h4 class="dice-formula">${this.object.damageSuccesses} Successes vs ${this.object.gambitDifficulty} Difficulty!</h4>${resultsText}`;
            this.object.damageThresholdSuccesses = (this.object.damageSuccesses - this.object.gambitDifficulty);
        }
        else {
            let targetResults = ``;
            let crashed = false;
            this.object.initiativeDamageDealt = this.object.damageSuccesses;
            if (this.object.target && game.combat) {
                if (this.object.targetCombatant && this.object.newTargetInitiative !== null) {
                    this.object.targetHit = true;
                    if ((this.object.targetCombatant.actor.type !== 'npc' || this.object.targetCombatant.actor.system.battlegroup === false) && (!this.actor.system.battlegroup || this.object.targetCombatant.initiative > 0)) {
                        let newInitative = this.object.newTargetInitiative;
                        var subractTotal = this.object.damageSuccesses;
                        if (game.settings.get("exaltedthird", "automaticWitheringDamage") && this.object.useShieldInitiative && this.object.shieldInitiative > 0) {
                            var newShieldInitiative = Math.max(0, this.object.shieldInitiative - this.object.damageSuccesses);
                            this.object.newTargetData.system.shieldinitiative.value = newShieldInitiative;
                            this.object.updateTargetActorData = true;
                            subractTotal = Math.max(0, this.object.damageSuccesses - this.object.shieldInitiative);
                        }
                        newInitative -= subractTotal;
                        var attackerCombatant = this._getActorCombatant();
                        if ((newInitative <= 0 && this.object.targetCombatant.initiative > 0)) {
                            if (this._useLegendarySize('withering')) {
                                newInitative = 1;
                            }
                            else {
                                this.object.crashed = true;
                                crashed = true;
                                targetResults = `<h4 class="dice-total" style="margin-top: 5px;">Target Crashed!</h4>`;
                                if (attackerCombatant && this.object.targetCombatant.id === attackerCombatant.flags?.crashedBy) {
                                    this.object.initiativeShift = true
                                    targetResults += '<h4 class="dice-total" style="margin-top: 5px;">Initiative Shift!</h4>';
                                }
                                if (this.object.targetCombatant?.flags?.crashRecovery) {
                                    targetResults += '<h4 class="dice-total" style="margin-top: 5px;">Target in Crash Recovery, no Initiative Break!</h4>';
                                }
                            }
                        }
                        if (game.settings.get("exaltedthird", "automaticWitheringDamage")) {
                            this.object.newTargetInitiative = newInitative;
                            this.object.updateTargetInitiative = true;
                            this.object.gainedInitiative = Math.max(this.object.damageSuccesses, this.object.gainedInitiative);
                            if (this.object.damage.maxInitiativeGain) {
                                this.object.gainedInitiative = Math.min(this.object.damage.maxInitiativeGain, this.object.gainedInitiative);
                            }
                        }
                    }
                }
                if (this.object.targetCombatant?.actor?.system?.battlegroup) {
                    if (game.settings.get("exaltedthird", "automaticWitheringDamage")) {
                        sizeDamaged = this.dealHealthDamage(this.object.damageSuccesses, true);
                        if (sizeDamaged) {
                            this.object.gainedInitiative += (5 * sizeDamaged);
                        }
                    }
                    else {
                        sizeDamaged = this.calculateSizeDamage(this.object.damageSuccesses);
                    }
                    if (sizeDamaged) {
                        targetResults = `<h4 class="dice-total dice-total-middle">${sizeDamaged} Size Damage!</h4>`;
                    }
                }
                this._removeEffect();
            }
            soakResult = `<h4 class="dice-formula">${this.object.soak} Soak! (Ignoring ${this.object.damage.ignoreSoak})</h4><h4 class="dice-formula">${this.object.overwhelming} Overwhelming!</h4>`;
            var fullInitiative = this.object.damageSuccesses + 1;
            if (this.object.damage.maxInitiativeGain) {
                fullInitiative = Math.min(this.object.damage.maxInitiativeGain, fullInitiative);
            }
            if (crashed) {
                fullInitiative += 5;
            }
            if (this.object.targetCombatant?.actor?.system?.battlegroup) {
                fullInitiative = (5 * sizeDamaged) + 1;
            }
            if (!game.settings.get("exaltedthird", "automaticWitheringDamage") && this.object.gainedInitiative) {
                fullInitiative += this.object.gainedInitiative;
            }
            typeSpecificResults = `
                                    <h4 class="dice-total dice-total-middle">${this.object.damageSuccesses} Total Damage!</h4>
                                    ${this.object.damage.gainInitiative ? `<h4 class="dice-total">${fullInitiative} Initiative Gained!</h4>` : ''}
                                    ${targetResults}
                                    <button
                                        type='button'
                                        class='apply-withering-damage'
                                        data-tooltip='${game.i18n.localize('Ex3.ApplyWitheringDamage')}'
                                        aria-label='${game.i18n.localize('Ex3.ApplyWitheringDamage')}'
                                    >
                                        <i class='fa-solid fa-swords'></i>
                                        ${game.i18n.localize('Ex3.ApplyWitheringDamage')} (${this.object.damageSuccesses})
                                    </button>
                                    ${this.object.damage.gainInitiative ? `<button
                                        type='button'
                                        class='gain-attack-initiative'
                                        data-tooltip='${game.i18n.localize('Ex3.GainAttackInitiative')}'
                                        aria-label='${game.i18n.localize('Ex3.GainAttackInitiative')}'
                                    >
                                        <i class='fa-solid fa-arrow-up'></i>
                                        ${game.i18n.localize('Ex3.GainAttackInitiative')} (${fullInitiative})
                                    </button>` : ''}
                                    `;

        }
        var defenseResult = ''
        if (this.object.rollType === 'damage') {
            defenseResult = `<h4 class="dice-formula">${this.object.attackSuccesses} Accuracy Successes vs ${this.object.defense} Defense</h4>`
        }
        damageResults = `
                                <h4 class="dice-total dice-total-middle">${this._damageRollType('gambit') ? 'Gambit' : 'Damage'}</h4>
                                ${defenseResult}
                                <h4 class="dice-formula">${baseDamage} Dice + ${this.object.damage.damageSuccessModifier} successes</h4>
                                ${soakResult}
                                <div class="dice-tooltip">
                                                    <div class="dice">
                                                        <ol class="dice-rolls">${diceRollResults.diceDisplay}</ol>
                                                    </div>
                                                </div>${typeSpecificResults}`;

        var title = "Decisive Attack";
        if (this.object.attackType === 'withering') {
            title = "Withering Attack";
        }
        if (this._damageRollType('gambit')) {
            title = "Gambit";
        }
        var accuracyContent = ``;
        var messageContent = '';
        if (this.object.rollType !== 'damage') {
            accuracyContent = `
                <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                <div class="dice-tooltip">
                    <div class="dice">
                        <ol class="dice-rolls">${this.object.displayDice}</ol>
                    </div>
                </div>
                <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
                <h4 class="dice-formula">${this.object.thresholdSuccesses} Threshhold Successes</h4>
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
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            rolls: this.object.roll ? [this.object.roll, diceRollResults.roll] : [diceRollResults.roll],
            flags: {
                "exaltedthird": {
                    dice: this.object.dice,
                    successes: this.object.successes,
                    successModifier: this.object.successModifier,
                    total: this.object.total,
                    defense: this.object.defense,
                    thresholdSuccesses: this.object.thresholdSuccesses,
                    attackerTokenId: this.actor.token?.id || this.actor.getActiveTokens()[0]?.id,
                    attackerCombatantId: this._getActorCombatant()?._id || null,
                    targetId: this.object.target?.id || null,
                    damage: {
                        dice: baseDamage,
                        successModifier: this.object.damage.damageSuccessModifier,
                        soak: this.object.soak,
                        total: this.object.damageSuccesses,
                        type: this.object.damage.type,
                        crashed: this.object.crashed,
                        targetHit: this.object.targetHit,
                        gainedInitiative: fullInitiative,
                    }
                }
            }
        });

        if (this.actor.system.battlegroup) {
            if (this.object.target && game.combat) {
                if (this.object.targetCombatant && this.object.targetCombatant.initiative !== null && this.object.targetCombatant.initiative <= 0) {
                    this.dealHealthDamage(total);
                }
            }
        }
    }

    async _addAttackEffects() {
        if (this.object.triggerSelfDefensePenalty > 0) {
            const existingPenalty = this.actor.effects.find(i => i.flags.exaltedthird?.statusId == "defensePenalty");
            if (existingPenalty) {
                let changes = foundry.utils.duplicate(existingPenalty.changes);
                changes[0].value = changes[0].value - this.object.triggerSelfDefensePenalty;
                changes[1].value = changes[1].value - this.object.triggerSelfDefensePenalty;
                existingPenalty.update({ changes });
            }
            else {
                this.actor.createEmbeddedDocuments('ActiveEffect', [{
                    name: 'Defense Penalty',
                    img: 'systems/exaltedthird/assets/icons/slashed-shield.svg',
                    origin: this.actor.uuid,
                    disabled: false,
                    duration: {
                        rounds: 20,
                        // startRound: game.combat?.round || 0,
                    },
                    flags: {
                        "exaltedthird": {
                            statusId: 'defensePenalty',
                        }
                    },
                    changes: [
                        {
                            "key": "system.evasion.value",
                            "value": (this.object.triggerSelfDefensePenalty * -1),
                            "mode": 2
                        },
                        {
                            "key": "system.parry.value",
                            "value": (this.object.triggerSelfDefensePenalty * -1),
                            "mode": 2
                        }
                    ]
                }]);
            }
        }
        if (this.object.triggerFullDefense) {
            this._addStatusEffect('fulldefense', "addSelfStatuses");
        }
        if (this.object.target) {
            if (game.settings.get("exaltedthird", "calculateOnslaught")) {
                this._addOnslaught(this.object.onslaughtAddition);
                if (this.object.magicOnslaughtAddition) {
                    this._addOnslaught(this.object.magicOnslaughtAddition, true);
                }
            }
            if (this.object.attackType === 'decisive' && this.object.attackSuccess && this.object.poison && this.object.poison.apply && this.object.poison.damagetype !== 'none') {
                this.object.updateTargetActorData = true;
                this.object.newTargetData.effects.push({
                    name: this.object.poison.name || "Poison",
                    img: 'icons/skills/toxins/poison-bottle-corked-fire-green.webp',
                    origin: this.actor.uuid,
                    disabled: false,
                    duration: {
                        rounds: this.object.poison.duration,
                        startRound: game.combat?.round || 0,
                    },
                    flags: {
                        "exaltedthird": {
                            poisonerCombatantId: this._getActorCombatant()?._id || null,
                            weaponInflictedPosion: true,
                        }
                    },
                    changes: [
                        {
                            "key": `system.damage.round.${this.object.poison.damagetype}`,
                            "value": this.object.poison.damage,
                            "mode": 0
                        },
                        {
                            "key": `system.dicemodifier.value`,
                            "value": this.object.poison.penalty * -1,
                            "mode": 2
                        },
                    ]
                });
            }
            if (this.object.triggerKnockdown && this.object.thresholdSuccesses >= 0) {
                this.object.updateTargetActorData = true;
                this._addStatusEffect('prone');
            }
            if (this.object.attackSuccess) {
                this.object.updateTargetActorData = true;
                var triggerGambit = 'none';
                const gambitChart = {
                    'leech': 'bleeding',
                    'unhorse': 'prone',
                    'knockdown': 'prone',
                    'grapple': 'grappled',
                    'disarm': 'disarmed',
                    'entangle': 'entangled',
                }
                if (this.object.gambit !== 'none' && gambitChart[this.object.gambit]) {
                    triggerGambit = gambitChart[this.object.gambit];
                    this._addStatusEffect(triggerGambit);
                }
                if (this.object.gambit === 'leech') {
                    this.dealHealthDamage(1);
                }
                if (this.object.gambit === 'revealWeakness') {
                    this.object.newTargetData.effects.push({
                        name: 'Reveal Weakness',
                        img: 'systems/exaltedthird/assets/icons/hammer-break.svg',
                        origin: this.object.target.actor.uuid,
                        disabled: false,
                        duration: {
                            rounds: 5,
                        },
                        flags: {
                            "exaltedthird": {
                                statusId: 'revealWeakness',
                            }
                        },
                        changes: [
                            {
                                "key": "system.soak.value",
                                "value": (Math.ceil(this.object.target.actor.system.soak.value / 2)) * -1,
                                "mode": 2
                            }
                        ]
                    });
                }
                if (this.object.gambit === 'pull') {
                    this.object.triggerTargetDefensePenalty += this.object.damageThresholdSuccesses;
                }
                if (this.object.gambit === 'knockback') {
                    this.object.triggerTargetDefensePenalty += this.object.damageThresholdSuccesses;
                }
                if (this.object.gambit === 'grapple') {
                    this._addStatusEffect('grappling', "addSelfStatuses");
                }
                if (this.object.triggerTargetDefensePenalty) {
                    this._addTargetDefensePenalty(this.object.triggerTargetDefensePenalty);
                }
            }
            if (this.object.target.actor.system.grapplecontrolrounds.value > 0) {
                this.object.newTargetData.system.grapplecontrolrounds.value = Math.max(0, this.object.newTargetData.system.grapplecontrolrounds.value - (this.object.thresholdSuccesses >= 0 ? 2 : 1));
            }
        }
        var actorToken = this._getActorToken();
        for (const status of this.object.addSelfStatuses) {
            const effectExists = this.actor?.effects.find(e => e.statuses.has(status));
            if (!effectExists && actorToken) {
                await actorToken.actor.toggleStatusEffect(status);
            }
        }
    }

    async _removeEffect(type = 'revealWeakness') {
        this.object.updateTargetActorData = true;
        const effect = this.object.newTargetData.effects.find(i => i.flags.exaltedthird?.statusId === type);
        if (effect?._id) {
            this.object.deleteEffects.push(effect._id);
        }
        this.object.newTargetData.effects = this.object.newTargetData.effects.filter(i => i.flags.exaltedthird?.statusId !== type);
    }

    async _addTriggerBonuses(type = 'beforeRoll') {
        if (!this.object.bonusesTriggered) {
            this.object.bonusesTriggered = {
                beforeRoll: false,
                afterRoll: false,
                beforeDamageRoll: false,
                afterDamageRoll: false
            }
        }
        for (const charm of this.object.addedCharms) {
            await this._addBonuses(charm, type, "benefit");
        }
        for (const charm of this.object.opposingCharms) {
            await this._addBonuses(charm, type, "opposed");
        }
        // Triggers should only happen once, except for ones involving defense charms
        this.object.bonusesTriggered[type] = true;
    }

    async _addBonuses(charm, type, bonusType = "benefit") {
        if (!charm.system.triggers) {
            return;
        }
        const doublesChart = {
            '7': 'sevens',
            '8': 'eights',
            '9': 'nines',
            '10': 'tens',
        };
        const triggerTensMap = {
            damage: 'damage',
            extrasuccess: 'extraSuccess',
            ignorehardness: 'ignoreHardness',
            postsoakdamage: 'postSoakDamage',
            rerollldie: 'rerolllDie',
            restoremote: 'restoreMote',
        }
        const triggerOnesMap = {
            'soak': 'soak',
            'defense': 'defense',
            'rerollsuccesses': 'rerollSuccesses',
            'subtractinitiative': 'subtractInitiative',
            'subtractsuccesses': 'subtractSuccesses',
        }
        const triggerTensDamageMap = {
            subtracttargettnitiative: 'subtractTargetInitiative',
        }
        for (const trigger of Object.values(charm.system.triggers.dicerollertriggers).filter(trigger => trigger.triggerTime === type)) {
            try {
                for (let triggerAmountIndex = 1; triggerAmountIndex < (charm.timesAdded || 1) + 1; triggerAmountIndex++) {
                    if (await this._triggerRequirementsMet(charm, trigger, bonusType, triggerAmountIndex, false)) {
                        for (const bonus of Object.values(trigger.bonuses)) {
                            if ((type === 'itemAdded' || !this.object.bonusesTriggered[type] || ['defense', 'soak', 'hardness', 'guile', 'resolve'].includes(bonus.effect))) {
                                let cleanedValue = bonus.value.toLowerCase().trim();
                                if (cleanedValue === 'true' || cleanedValue === 'false') {
                                    cleanedValue = cleanedValue === "true";
                                }
                                switch (bonus.effect) {
                                    case 'diceModifier':
                                    case 'successModifier':
                                    case 'penaltyModifier':
                                    case 'ignorePenalties':
                                    case 'rerollNumber':
                                    case 'rerollNumberDescending':
                                    case 'diceToSuccesses':
                                    case 'triggerSelfDefensePenalty':
                                    case 'triggerTargetDefensePenalty':
                                    case 'onslaughtAddition':
                                    case 'magicOnslaughtAddition':
                                        this.object[bonus.effect] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'doubleSuccess':
                                        const { value, cap } = this._getCappedFormula(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        if (value) {
                                            if (value < this.object.doubleSuccess) {
                                                this.object.doubleSuccess = value;
                                            }
                                            if (doublesChart[value.toString()]) {
                                                this.object.settings.doubleSucccessCaps[doublesChart[value.toString()]] += cap;
                                            }
                                        }
                                        break;
                                    case 'decreaseTargetNumber':
                                        this.object.targetNumber -= this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'rerollDieFace':
                                        this._getRerollFormulaCap(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'fullExcellency':
                                        let excellencyResults = this.actor.type === 'character' ? this.actor.getCharacterDiceCapValue(this.object.ability, this.object.attribute, this.object.specialty) : this.actor.getNpcDiceCapValue(this.object.baseAccuracy || this.object.pool);
                                        if (excellencyResults) {
                                            this.object.diceModifier += (excellencyResults.dice - this.object.charmDiceAdded);
                                            this.object.charmDiceAdded += (excellencyResults.dice - this.object.charmDiceAdded);
                                            this.object.targetNumber = Math.max(4, this.object.targetNumber - excellencyResults.targetNumber);
                                            if (cleanedValue !== 'free') {
                                                this.object.cost.motes += excellencyResults.cost || excellencyResults.dice;
                                            }
                                        } else {
                                            ui.notifications.error(`<p>Trigger bonus Error: Full Excellency does not support this exalt type due to untrackable dice cap variables</p>`);
                                        }
                                        break;
                                    case 'excludeOnes':
                                    case 'ignoreLegendarySize':
                                        this.object.settings[bonus.effect] = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                        break;
                                    case 'rerollFailed':
                                    case 'rollTwice':
                                    case 'rollTwiceLowest':
                                        this.object[bonus.effect] = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                        break;
                                    case 'activateAura':
                                        this.object[bonus.effect] = cleanedValue;
                                        break;
                                    case 'triggerOnTens':
                                        if (triggerTensMap[cleanedValue]) {
                                            this.object.settings.triggerOnTens = triggerTensMap[cleanedValue];
                                        }
                                        break;
                                    case 'triggerNinesAndTens':
                                        if (triggerTensMap[cleanedValue]) {
                                            this.object.settings.triggerOnTens = triggerTensMap[cleanedValue];
                                            this.object.settings.alsoTriggerNines = true;
                                        }
                                        break;
                                    case 'triggerTensCap':
                                        this.object.settings.triggerTensCap += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'triggerOnOnes':
                                        if (triggerOnesMap[cleanedValue]) {
                                            this.object.settings.triggerOnOnes = triggerOnesMap[cleanedValue];
                                        }
                                        break;
                                    case 'triggerOnesAndTwos':
                                        if (triggerOnesMap[cleanedValue]) {
                                            this.object.settings.triggerOnOnes = triggerOnesMap[cleanedValue];
                                            this.object.settings.alsoTriggerTwos = true;
                                        }
                                        break;
                                    case 'triggerOnesCap':
                                        this.object.settings.triggerOnesCap += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'reduceDifficulty':
                                        if (this.object.showTargets) {
                                            const targetValues = Object.values(this.object.targets);
                                            for (const target of targetValues) {
                                                target.rollData.defense = Math.max(0, target.rollData.defense - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                                target.rollData.resolve = Math.max(0, target.rollData.resolve - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                                target.rollData.guile = Math.max(0, target.rollData.guile - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                            }
                                        }
                                        else {
                                            this.object.difficulty = Math.max(0, this.object.difficulty - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                            this.object.defense = Math.max(0, this.object.defense - this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null));
                                        }
                                        break;
                                    case 'damageDice':
                                    case 'damageSuccessModifier':
                                    case 'cappedThreshholdToDamage':
                                        this.object.damage[bonus.effect] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'rerollNumber-damage':
                                        this.object.damage.rerollNumber += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'rerollNumberDescending-damage':
                                        this.object.damage.rerollNumberDescending += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'diceToSuccesses-damage':
                                        this.object.damage.diceToSuccesses += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'doubleSuccess-damage':
                                        const { dbValue, dbCap } = this._getCappedFormula(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        if (dbValue) {
                                            if (dbValue < this.object.damage.doubleSuccess) {
                                                this.object.damage.doubleSuccess = dbValue;
                                            }
                                            if (doublesChart[dbValue.toString()]) {
                                                this.object.settings.damage.doubleSucccessCaps[doublesChart[dbValue.toString()]] += dbCap;
                                            }
                                        }
                                        break;
                                    case 'decreaseTargetNumber-damage':
                                        this.object.damage.targetNumber -= this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'rerollDieFace-damage':
                                        this._getRerollFormulaCap(cleanedValue, true, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'excludeOnes-damage':
                                        this.object.settings.damage.excludeOnesFromRerolls = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                        break;
                                    case 'rerollFailed-damage':
                                        this.object.damage.rerollFailed = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                        break;
                                    case 'rollTwice-damage':
                                        this.object.damage.rollTwice = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                        break;
                                    case 'rollTwiceLowest-damage':
                                        this.object.damage.rollTwiceLowest = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                        break;
                                    case 'triggerOnTens-damage':
                                        if (triggerTensDamageMap[cleanedValue]) {
                                            this.object.settings.damage.triggerOnTens = triggerTensDamageMap[cleanedValue];
                                        }
                                        break;
                                    case 'triggerNinesAndTens-damage':
                                        if (triggerTensDamageMap[cleanedValue]) {
                                            this.object.settings.damage.triggerOnTens = triggerTensDamageMap[cleanedValue];
                                            this.object.settings.damage.alsoTriggerNines = true;
                                        }
                                        break;
                                    case 'triggerTensCap-damage':
                                        this.object.settings.damage.triggerTensCap += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'triggerOnOnes-damage':
                                        this.object.settings.damage.triggerOnOnes = bonus.value;
                                        break;
                                    case 'triggerOnesAndTwos-damage':
                                        this.object.settings.damage.triggerOnOnes = bonus.value;
                                        this.object.settings.damage.alsoTriggerTwos = true;
                                        break;
                                    case 'triggerOnesCap-damage':
                                        this.object.settings.damage.triggerOnesCap += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'ignoreSoak':
                                    case 'ignoreHardness':
                                    case 'postSoakDamage':
                                        this.object.damage[bonus.effect] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'modifyRolledDamage':
                                        this.object.damageSuccesses += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'threshholdToDamage':
                                    case 'doubleRolledDamage':
                                    case 'doublePreRolledDamage':
                                    case 'resetInit':
                                        this.object.damage[bonus.effect] = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                        break;
                                    case 'motes-spend':
                                    case 'initiative-spend':
                                    case 'anima-spend':
                                    case 'willpower-spend':
                                    case 'penumbra-spend':
                                    case 'silverxp-spend':
                                    case 'goldxp-spend':
                                    case 'whitexp-spend':
                                        const spendKey = bonus.effect.replace('-spend', '');
                                        this.object.cost[spendKey] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'muteMotes-spend':
                                        this.object.cost.muteMotes += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'grappleControl-spend':
                                        this.object.cost.grappleControl += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'health-spend':
                                        this._getHealthFormula(cleanedValue);
                                        break;
                                    case 'aura-spend':
                                        this.object.cost.aura = cleanedValue;
                                        break;
                                    case 'motes-restore':
                                    case 'initiative-restore':
                                    case 'health-restore':
                                    case 'willpower-restore':
                                        const restoreKey = bonus.effect.replace('-restore', '');
                                        this.object.restore[restoreKey] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'motes-steal':
                                    case 'initiative-steal':
                                        const stealKey = bonus.effect.replace('-steal', '');
                                        this.object.steal[stealKey].max += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'reduceGambitDifficulty':
                                        this.object.settings.gambitDifficulty -= this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'defense':
                                    case 'soak':
                                    case 'hardness':
                                    case 'resolve':
                                    case 'guile':
                                        if (bonus.effect === 'resolve' || bonus.effect === 'guile') {
                                            this.object.difficulty += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);

                                        } else {
                                            this.object[bonus.effect] += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        }
                                        break;
                                    case 'setDamageType':
                                        this.object.damage.type = cleanedValue;
                                        break;
                                    case 'gainInitiative':
                                        this.object.damage.gainInitiative = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                        break;
                                    case 'doubleThresholdSuccesses':
                                        this.object.doubleThresholdSuccesses += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'doubleThresholdSuccesses-damage':
                                        this.object.damage.doubleThresholdSuccesses += this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charm.actor : null);
                                        break;
                                    case 'displayMessage':
                                        const result = bonus.value.replace(/\${(.*?)}/g, (_, key) => this.object[key.trim()] || `\${${key}}`);
                                        (this.object.triggerMessages || []).push(result);
                                        break;
                                    case 'specificCharm':
                                        if (this.object.specificCharms[bonus.value] !== undefined) {
                                            this.object.specificCharms[bonus.value] = true;
                                        }
                                        break;
                                    case 'otherEffect':
                                        if (bonus.value === 'targetDoesntResetOnslaught') {
                                            this.object.targetDoesntResetOnslaught = true;
                                        }
                                        break;
                                    case 'inflictStatus':
                                        if (CONFIG.exaltedthird.statusEffects.some(status => status.id === cleanedValue)) {
                                            this._addStatusEffect(cleanedValue);
                                        }
                                        break;
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                ui.notifications.error(`<p>Error in Trigger:</p><pre>${trigger?.name || 'No Name Trigger'}</pre><p>See the console (F12) for details</p>`);
                console.error(e);
            }
        }
    }

    async _triggerRequirementsMet(charm, trigger, bonusType = "benefit", triggerAmountIndex, display) {
        let fufillsRequirements = true;
        const charmActor = charm.actor || this.actor;
        for (const requirementObject of Object.values(trigger.requirements)) {
            if (!fufillsRequirements) {
                break;
            }
            let cleanedValue = requirementObject.value.toLowerCase().trim();
            if (cleanedValue === 'true' || cleanedValue === 'false') {
                cleanedValue = cleanedValue === "true";
            }
            switch (requirementObject.requirement) {
                case 'hasAura':
                    if (this.actor.system.details.aura !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'attackType':
                    if (this.object.attackType !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'charmAddedAmount':
                    if (triggerAmountIndex < this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charmActor : null)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'targetIsCrashed':
                    if (cleanedValue) {
                        if ((this.object.newTargetInitiative || 1) > 0) {
                            fufillsRequirements = false;
                        }
                    } else {
                        if ((this.object.newTargetInitiative || -1) < 0) {
                            fufillsRequirements = false;
                        }
                    }
                    break;
                case 'crashedTheTarget':
                    if (!this.object.crashed) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'martialArtsLevel':
                    if (charmActor.system.settings.martialartsmastery !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'smaEnlightenment':
                    if (!charmActor.system.settings.smaenlightenment) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'materialResonance':
                    if (!charmActor.system.traits.resonance.value.includes(cleanedValue)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'materialStandard':
                    if (charmActor.system.traits.resonance.value.includes(cleanedValue) || charmActor.system.traits.dissonance.value.includes(cleanedValue)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'materialDissonance':
                    if (!charmActor.system.traits.dissonance.value.includes(cleanedValue)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'hasClassification':
                    if (!charmActor.system.traits.classifications.value.includes(cleanedValue)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'formula':
                    if (!this._getBooleanFormulaValue(cleanedValue, bonusType === "opposed" ? charmActor : null, charm)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'thresholdSuccesses':
                    if (this.object.thresholdSuccesses < this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charmActor : null)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'hasStatus':
                    if (cleanedValue === 'anycover') {
                        if (!this.actor.effects.some(e => e.statuses.has('lightcover')) && !this.actor.effects.some(e => e.statuses.has('heavycover')) && !this.actor.effects.some(e => e.statuses.has('fullcover'))) {
                            fufillsRequirements = false;
                        }
                    } else {
                        if (!this.actor.effects.some(e => e.statuses.has(cleanedValue))) {
                            fufillsRequirements = false;
                        }
                    }
                    break;
                case 'missingStatus':
                    if (cleanedValue === 'anycover') {
                        if (this.actor.effects.some(e => e.statuses.has('lightcover')) || this.actor.effects.some(e => e.statuses.has('heavycover')) || this.actor.effects.some(e => e.statuses.has('fullcover'))) {
                            fufillsRequirements = false;
                        }
                    } else {
                        if (this.actor.effects.some(e => e.statuses.has(cleanedValue))) {
                            fufillsRequirements = false;
                        }
                    }

                    break;
                case 'targetHasStatus':
                    if (!this.object.target) {
                        fufillsRequirements = false;
                    } else {
                        if (cleanedValue === 'anycover') {
                            if (!this.object.target.actor.effects.some(e => e.statuses.has('ightcover')) && !this.object.target.actor.effects.some(e => e.statuses.has('heavycover')) && !this.object.target.actor.effects.some(e => e.statuses.has('fullcover'))) {
                                fufillsRequirements = false;
                            }
                        } else {
                            if (!this.object.target.actor.effects.some(e => e.statuses.has(cleanedValue))) {
                                fufillsRequirements = false;
                            }
                        }
                    }

                    break;
                case 'targetMissingStatus':
                    if (!this.object.target) {
                        fufillsRequirements = false;
                    }
                    else {
                        if (cleanedValue === 'anycover') {
                            if (this.object.target.actor.effects.some(e => e.statuses.has('ightcover')) || this.object.target.actor.effects.some(e => e.statuses.has('heavycover')) || this.object.target.actor.effects.some(e => e.statuses.has('fullcover'))) {
                                fufillsRequirements = false;
                            }
                        } else {
                            if (this.object.target.actor.effects.some(e => e.statuses.has(cleanedValue))) {
                                fufillsRequirements = false;
                            }
                        }
                    }
                    break;
                case 'targetIsBattlegroup':
                    if (!this.object.target) {
                        fufillsRequirements = false;
                    }
                    else if (!this.object.target.actor.system.battlegroup) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'targetHasClassification':
                    if (!this.object.target) {
                        fufillsRequirements = false;
                    }
                    if (!this.object.target.actor.system.traits.classifications.value.includes(cleanedValue)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'targetTakenTurn':
                    if (cleanedValue) {
                        if (this.object.targetCombatant?.flags?.acted !== true) {
                            fufillsRequirements = false;
                        }
                    } else {
                        if (!this.object.targetCombatant?.flags?.acted) {
                            fufillsRequirements = false;
                        }
                    }
                    break;
                case 'range':
                    if (this.object.range !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'initiativeDamageDealt':
                    if ((this.object.initiativeDamageDealt || 0) < this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charmActor : null)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'damageLevelsDealt':
                    if (this.object.damageLevelsDealt < this._getFormulaValue(cleanedValue, bonusType === "opposed" ? charmActor : null)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'rollSucceeded':
                    if (this._isAttackRoll()) {
                        if (this.object.total < this.object.defense && cleanedValue === true) {
                            fufillsRequirements = false;
                        } else if (this.object.total >= this.object.defense && cleanedValue === false) {
                            fufillsRequirements = false;
                        }
                    } else {
                        if (this.object.total < this.object.difficulty && cleanedValue === true) {
                            fufillsRequirements = false;
                        } else if (this.object.total >= this.object.difficulty && cleanedValue === false) {
                            fufillsRequirements = false;
                        }
                    }
                case 'booleanPrompt':
                    if (!display) {
                        const result = requirementObject.value.replace(/\${(.*?)}/g, (_, key) => this.object[key.trim()] || `\${${key}}`);
                        const value = await foundry.applications.api.DialogV2.confirm({
                            window: { title: game.i18n.localize('Ex3.Requirement') },
                            content: `<p>${result}</p>`,
                            classes: ["dialog", this.actor ? this.actor.getSheetBackground() : `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
                            modal: true
                        });
                        if (!value) {
                            fufillsRequirements = false;
                        }
                    }
                    break;
                case 'upgradeActive':
                    if (!Object.values(charm.system.upgrades).some(upgrade => upgrade.id === requirementObject.value && upgrade.active)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'hasItemName':
                case 'hasActiveItemName':
                    if(!charmActor.items.some(item => item.name === requirementObject.value && (requirementObject.requirement === 'hasItemName' || item.system.active))){
                        fufillsRequirements = false;
                    }
                    break;
                case 'hasActiveEffectName':
                    if(![...charmActor.allApplicableEffects()].some(effect => !effect.disabled && effect.name === requirementObject.value)) {
                        fufillsRequirements = false;
                    }
                    break;
            }
        }
        return fufillsRequirements;
    }

    _addOnslaught(number = 1, magicInflicted = false) {
        if ((this.object.target?.actor?.system?.sizecategory || 'standard') !== 'legendary' && !magicInflicted) {
            this.object.updateTargetActorData = true;
            const onslaught = this.object.newTargetData.effects.find(i => i.flags.exaltedthird?.statusId === "onslaught");
            if (onslaught) {
                onslaught.changes[0].value = onslaught.changes[0].value - number;
                onslaught.changes[1].value = onslaught.changes[1].value - number;
                onslaught.name = `${game.i18n.localize("Ex3.Onslaught")} (${onslaught.changes[0].value - number})`;
            }
            else {
                this.object.newTargetData.effects.push({
                    name: `${game.i18n.localize('Ex3.Onslaught')} (-${number})`,
                    img: 'systems/exaltedthird/assets/icons/surrounded-shield.svg',
                    origin: this.object.target.actor.uuid,
                    disabled: false,
                    duration: {
                        rounds: 5,
                        // startRound: game.combat?.round || 0,
                    },
                    flags: {
                        "exaltedthird": {
                            statusId: 'onslaught',
                        }
                    },
                    changes: [
                        {
                            "key": "system.evasion.value",
                            "value": number * -1,
                            "mode": 2
                        },
                        {
                            "key": "system.parry.value",
                            "value": number * -1,
                            "mode": 2
                        }
                    ]
                });
            }
        }
    }

    _addTargetDefensePenalty(number = 1) {
        this.object.updateTargetActorData = true;
        const existingPenalty = this.object.newTargetData.effects.find(i => i.flags.exaltedthird?.statusId == "defensePenalty");
        if (existingPenalty) {
            existingPenalty.changes[0].value = existingPenalty.changes[0].value - number;
            existingPenalty.changes[1].value = existingPenalty.changes[1].value - number;
            existingPenalty.name = `${game.i18n.localize("Ex3.DefensePenalty")} (${onslaught.changes[0].value - number})`;

        }
        else {
            this.object.newTargetData.effects.push({
                name: `${game.i18n.localize("Ex3.DefensePenalty")} (-${number})`,
                img: 'systems/exaltedthird/assets/icons/slashed-shield.svg',
                origin: this.object.target.actor.uuid,
                disabled: false,
                duration: {
                    rounds: 5,
                },
                flags: {
                    "exaltedthird": {
                        statusId: 'defensePenalty',
                    }
                },
                changes: [
                    {
                        "key": "system.evasion.value",
                        "value": number * -1,
                        "mode": 2
                    },
                    {
                        "key": "system.parry.value",
                        "value": number * -1,
                        "mode": 2
                    }
                ]
            });
        }
    }

    dealHealthDamage(characterDamage, targetBattlegroup = false) {
        let sizeDamaged = 0;
        if (this.object.target && game.combat && characterDamage > 0) {
            this.object.updateTargetActorData = true;
            let totalHealth = 0;
            if (targetBattlegroup) {
                totalHealth = this.object.newTargetData.system.health.levels.zero.value + this.object.newTargetData.system.size.value;
            }
            else {
                for (let [key, health_level] of Object.entries(this.object.newTargetData.system.health.levels)) {
                    totalHealth += health_level.value;
                }
            }
            if (targetBattlegroup) {
                var remainingHealth = totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.lethal - this.object.newTargetData.system.health.aggravated;
                while (remainingHealth <= characterDamage && this.object.newTargetData.system.size.value > 0) {
                    sizeDamaged++;
                    this.object.newTargetData.system.health.bashing = 0;
                    this.object.newTargetData.system.health.lethal = 0;
                    this.object.newTargetData.system.health.aggravated = 0;
                    characterDamage -= remainingHealth;
                    remainingHealth = totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.lethal - this.object.newTargetData.system.health.aggravated;
                    this.object.newTargetData.system.size.value -= 1;
                }
            }
            if (this.object.damage.type === 'bashing') {
                this.object.newTargetData.system.health.bashing = Math.min(totalHealth - this.object.newTargetData.system.health.aggravated - this.object.newTargetData.system.health.lethal, this.object.newTargetData.system.health.bashing + characterDamage);
            }
            if (this.object.damage.type === 'lethal') {
                this.object.newTargetData.system.health.lethal = Math.min(totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.aggravated, this.object.newTargetData.system.health.lethal + characterDamage);
            }
            if (this.object.damage.type === 'aggravated') {
                this.object.newTargetData.system.health.aggravated = Math.min(totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.lethal, this.object.newTargetData.system.health.aggravated + characterDamage);
            }
            if (targetBattlegroup && sizeDamaged) {
                return sizeDamaged;
            }
        }
        return 0;
    }

    calculateSizeDamage(damage) {
        let sizeDamaged = 0;
        if (this.object.newTargetData) {
            let totalHealth = this.object.newTargetData.system.health.levels.zero.value + this.object.newTargetData.system.size.value;
            let targetSize = this.object.newTargetData.system.size.value;
            let remainingHealth = totalHealth - this.object.newTargetData.system.health.bashing - this.object.newTargetData.system.health.lethal - this.object.newTargetData.system.health.aggravated;
            while (remainingHealth <= damage && targetSize > 0) {
                sizeDamaged++;
                damage -= remainingHealth;
                remainingHealth = totalHealth;
                targetSize -= 1;
            }
        }
        return sizeDamaged;
    }

    async _updateTargetActor() {
        if (game.user.isGM) {
            await this.object.target.actor.update(this.object.newTargetData);
            for (const status of this.object.addStatuses) {
                const effectExists = this.object.target.actor.effects.find(e => e.statuses.has(status));
                if (!effectExists) {
                    await this.object.target.actor.toggleStatusEffect(status);
                }
            }
            if (this.object.deleteEffects) {
                await this.object.target.actor.deleteEmbeddedDocuments('ActiveEffect', this.object.deleteEffects);
            }
        }
        else {
            game.socket.emit('system.exaltedthird', {
                type: 'updateTargetData',
                id: this.object.target.id,
                data: this.object.newTargetData,
                addStatuses: this.object.addStatuses,
                deleteEffects: this.object.deleteEffects
            });
        }
    }

    async _updateTargetInitiative() {
        var attackerCombatant = this._getActorCombatant();
        let crasherId = null;
        if (attackerCombatant && this.object.crashed) {
            crasherId = attackerCombatant.id;
        }
        if (game.user.isGM) {
            game.combat.setInitiative(this.object.targetCombatant.id, this.object.newTargetInitiative, crasherId);
        }
        else {
            game.socket.emit('system.exaltedthird', {
                type: 'updateInitiative',
                id: this.object.targetCombatant.id,
                data: this.object.newTargetInitiative,
                crasherId: crasherId,
            });
        }
    }

    async _completeCraftProject() {
        await this._baseAbilityDieRoll();
        let resultString = ``;
        let projectStatus = ``;
        let craftFailed = false;
        let craftSuccess = false;
        let goalNumberLeft = this.object.goalNumber;
        let extendedTest = ``;
        const thresholdSuccesses = Math.max(0, this.object.total - this.object.difficulty);
        if (this.object.goalNumber > 0) {
            extendedTest = `<h4 class="dice-total dice-total-middle">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
        }
        if (this.object.total < this.object.difficulty) {
            resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Check Failed</h4>${extendedTest}`;
            if (this.object.total === 0 && this.object.roll.dice[0].results.some((die) => die.result === 1)) {
                this.object.finished = true;
                resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Botch</h4>`;
                craftFailed = true;
            }
            if (this.object.rollType === 'prophecy') {
                resultString += `<h4 class="dice-total" style="margin-top:5px;">Complication</h4>`;
            }
        }
        else {
            if (this.object.goalNumber > 0) {
                goalNumberLeft = Math.max(this.object.goalNumber - thresholdSuccesses - 1, 0);
                extendedTest = `<h4 class="dice-total dice-total-middle">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
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
            resultString = `<h4 class="dice-total dice-total-middle">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total dice-total-middle">${thresholdSuccesses} Threshhold Successes</h4>${extendedTest}`;
        }
        if (this.object.rollType === 'craft') {
            if (craftFailed) {
                projectStatus = `<h4 class="dice-total">Craft Project Failed</h4>`;
            }
            if (craftSuccess) {
                const actorData = foundry.utils.duplicate(this.actor);
                var silverXPGained = 0;
                var goldXPGained = 0;
                var whiteXPGained = 0;
                if (this.object.craftType === 'basic') {
                    if (thresholdSuccesses >= 3) {
                        silverXPGained = 3 * this.object.objectivesCompleted;
                    }
                    else {
                        silverXPGained = 2 * this.object.objectivesCompleted;
                    }
                    projectStatus = `<h4 class="dice-total dice-total-middle">Craft Project Success</h4><h4 class="dice-total">${silverXPGained} Silver XP Gained</h4>`;
                }
                else if (this.object.craftType === "major") {
                    if (thresholdSuccesses >= 3) {
                        silverXPGained = this.object.objectivesCompleted;
                        goldXPGained = 3 * this.object.objectivesCompleted;
                    }
                    else {
                        silverXPGained = this.object.objectivesCompleted;
                        goldXPGained = 2 * this.object.objectivesCompleted;
                    }
                    projectStatus = `<h4 class="dice-total dice-total-middle">Craft Project Success</h4><h4 class="dice-total">${silverXPGained} Silver XP Gained (-10)</h4><h4 class="dice-total">${goldXPGained} Gold XP Gained</h4>`;
                    silverXPGained -= 10;
                }
                else if (this.object.craftType === "superior") {
                    if (this.object.objectivesCompleted > 0) {
                        whiteXPGained = (parseInt(this.object.craftRating) * 2) + 1;
                        goldXPGained = (parseInt(this.object.craftRating) * 2) * this.object.intervals;
                    }
                    projectStatus = `<h4 class="dice-total dice-total-middle">Craft Project Success</h4><h4 class="dice-total">${goldXPGained} Gold XP Gained (-10)</h4><h4 class="dice-total">${whiteXPGained} White XP Gained</h4>`;
                }
                else if (this.object.craftType === "legendary") {
                    if (this.object.objectivesCompleted > 0) {
                        whiteXPGained += 10;
                    }
                    projectStatus = `<h4 class="dice-total dice-total-middle">Craft Project Success</h4><h4 class="dice-total">${whiteXPGained} White XP Gained (-10)</h4>`;
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
        if (this.object.rollType === 'prophecy') {
            if (craftFailed) {
                projectStatus += `<h4 class="dice-total">Prophecy Failed</h4>`;
            }
            if (craftSuccess) {
                projectStatus += `<h4 class="dice-total">Prophecy Success</h4>`;
            }
        }


        let messageContent = `
            <div class="dice-roll">
                <div class="dice-result">
                    <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successes} successes</h4>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <ol class="dice-rolls">${this.object.displayDice}</ol>
                        </div>
                    </div>
                    <h4 class="dice-total dice-total-middle">${this.object.total} Successes</h4>
                    ${resultString}
                    ${projectStatus}
                </div>
            </div>
        `

        this.object.finished = craftFailed || craftSuccess;
        messageContent = await this._createChatMessageContent(messageContent, `${this.object.rollType.capitalize()} Roll`);
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: messageContent,
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            rolls: [this.object.roll],
            flags: {
                "exaltedthird": {
                    dice: this.object.dice,
                    successes: this.object.successes,
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
        if (game.combat && (this.actor?.token || this.actor?.getActiveTokens()[0])) {
            const tokenId = this.actor.token?.id || this.actor.getActiveTokens()[0]?.id;
            return game.combat.combatants.find(c => c.tokenId === tokenId);
        }
    }

    _getActorToken() {
        if (this.actor.token || this.actor.getActiveTokens()[0]) {
            const tokenId = this.actor.token?.id || this.actor.getActiveTokens()[0]?.id;
            return canvas.tokens.placeables.filter(x => x.id === tokenId)[0];
        }
    }

    _getCraftDifficulty() {
        if (game.settings.get("exaltedthird", "simplifiedCrafting")) {
            this.object.intervals = 1;
        }
        else {
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
        }

    }

    _getRangedAccuracy() {
        let accuracyModifier = 0;
        let ranges = {
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

        let key = `${this.object.weaponType}-${this.object.range}`;
        accuracyModifier = ranges[key];
        if (this.object.weaponTags["flame"] && this.object.range === 'close') {
            accuracyModifier += 2;
        }
        return accuracyModifier;
    }

    _useLegendarySize(effectType) {
        if (this.object.settings.ignoreLegendarySize) {
            return false;
        }
        if (this.object.target) {
            if (effectType === 'onslaught') {
                return (this.object.target.actor.system.sizecategory === 'legendary' && this.object.target.actor.system.warstrider.equipped) && this.actor.system.sizecategory !== 'legendary' && !this.actor.system.warstrider.equipped;
            }
            if (effectType === 'withering') {
                return (this.object.target.actor.system.sizecategory === 'legendary' || this.object.target.actor.system.warstrider.equipped) && this.actor.system.sizecategory !== 'legendary' && !this.actor.system.warstrider.equipped && this.object.finalDamageDice < 10;
            }
            if (effectType === 'decisive') {
                return (this.object.target.actor.system.sizecategory === 'legendary' || this.object.target.actor.system.warstrider.equipped) && this.actor.system.sizecategory !== 'legendary' && !this.actor.system.warstrider.equipped;
            }
        }
        return false;
    }

    async _createChatMessageContent(content, cardName = 'Roll') {
        let actionName = '';
        let martialArtName = '';
        let craftRollName = '';
        let abilityName = this.object.ability;
        let showSpecialAttacks = false;
        let initiative = "No Initiative";
        let turnTaken = false;
        let combatStats = {
            inCombat: false,
            actorInitiative: "No Initiative",
            targetInitiative: "No Target Initiative",
            turnTaken: "Turn not taken",
            targetTurnTaken: "Turn not taken",
        }
        if (game.combat) {
            let combatant = this._getActorCombatant();
            if (combatant) {
                combatStats.inCombat = true;
                if (combatant?.initiative !== null) {
                    combatStats.actorInitiative = combatant.initiative;
                    combatStats.turnTaken = combatant.flags?.acted;
                }
            }
            if (this.object.targetCombatant) {
                if (this.object.targetCombatant?.initiative !== null) {
                    combatStats.targetInitiative = this.object.targetCombatant.initiative;
                    combatStats.targetTurnTaken = this.object.targetCombatant.flags?.acted;
                }
            }
        }
        if (this.object.rollType === 'action') {
            actionName = this.actor.actions.find(x => x._id === this.object.actionId).name;
        }
        for (var specialAttack of this.object.specialAttacksList) {
            if (specialAttack.added) {
                showSpecialAttacks = true
            }
        }
        const messageData = {
            name: cardName,
            rollTypeImgUrl: CONFIG.exaltedthird.rollTypeTargetImages[this.object.rollType] || CONFIG.exaltedthird.rollTypeTargetImages[this.object.attackType] || CONFIG.exaltedthird.rollTypeTargetImages[this.object.ability] || "systems/exaltedthird/assets/icons/d10.svg",
            rollTypeLabel: CONFIG.exaltedthird.rollTypeTargetLabels[this.object.rollType] || CONFIG.exaltedthird.rollTypeTargetLabels[this.object.ability] || "Ex3.Roll",
            messageContent: content,
            rollData: this.object,
            isAttack: this._isAttackRoll(),
            actionName: actionName,
            abilityName: abilityName,
            showSpecialAttacks: showSpecialAttacks,
            rollingActor: this.actor,
            combatStats: combatStats,
        }
        return await renderTemplate("systems/exaltedthird/templates/chat/roll-card.html", messageData);
    }

    async _assembleDicePool(display) {
        var dicePool = 0;
        var totalPenalties = this.object.penaltyModifier;
        var totalIgnorePenalties = this.object.ignorePenalties;
        var targetAppearanceBonus = this.object.appearanceBonus;

        if (display && this.object.showTargets && !this.object.target) {
            targetAppearanceBonus = Object.values(this.object.targets)[0].rollData.appearanceBonus;
        }

        if (this.actor.type === 'character') {
            if (this.actor.system.attributes[this.object.attribute]) {
                dicePool += (this.actor.system.attributes[this.object.attribute]?.value || 0) + (this.actor.system.attributes[this.object.attribute]?.upgrade || 0);
            }
            dicePool += this._getCharacterAbilityValue(this.actor, this.object.ability);
        }
        else if (this.actor.type === 'npc' && !this._isAttackRoll()) {
            if (this.object.actions.some(action => action._id === this.object.pool)) {
                dicePool += this.actor.actions.find(x => x._id === this.object.pool).system.value;
            }
            else if (this.object.pool === 'willpower') {
                dicePool += this.actor.system.willpower.max;
            } else {
                dicePool += this.actor.system.pools[this.object.pool].value;
            }
        }

        if (this.object.target && this.object.weaponTags) {
            if (this.object.weaponTags["bombard"]) {
                if (!this.object.target.actor.system.battlegroup && this.object.target.actor.system.sizecategory !== 'legendary' && !this.object.target.actor.system.warstrider.equipped) {
                    totalPenalties += 4;
                }
            }
        }
        if (this.object.armorPenalty) {
            for (let armor of this.actor.armor) {
                if (armor.system.equipped) {
                    totalPenalties += Math.abs(armor.system.penalty);
                }
            }
        }
        if (this.object.woundPenalty) {
            if (this.actor.system.warstrider.equipped) {
                totalPenalties += this.actor.system.warstrider.health.penalty;
            }
            else {
                totalPenalties += this.actor.system.health.penalty === 'inc' ? 4 : this.actor.system.health.penalty;
                totalIgnorePenalties += Math.min(this.actor.system.health.penaltymod, this.actor.system.health.penalty === 'inc' ? 4 : this.actor.system.health.penalty);
            }
        }
        if (this.actor.system.battlegroup) {
            dicePool += this.actor.system.commandbonus.value;
            if (this._isAttackRoll()) {
                dicePool += (this.actor.system.size.value + this.actor.system.might.value);
            }
        }
        if (this.object.stunt !== 'none' && this.object.stunt !== 'bank') {
            dicePool += 2;
        }
        if (this.object.isFlurry) {
            totalPenalties += 3;
        }
        if (this.object.diceModifier) {
            dicePool += this.object.diceModifier;
        }
        if (totalPenalties) {
            dicePool -= Math.max(0, totalPenalties - totalIgnorePenalties);
        }

        if (this.object.targetSpecificDiceMod) {
            dicePool += this.object.targetSpecificDiceMod;
        }
        if (this.object.specialty) {
            dicePool++;
        }

        if (this.object.diceToSuccesses > 0) {
            dicePool = Math.max(0, dicePool - this.object.diceToSuccesses);
        }

        if (this.object.rollType === 'social') {
            if (this.object.applyAppearance) {
                dicePool += this.object.appearanceBonus;
            }
        }

        // if (display) {
        //     for (const charm of this.object.addedCharms) {
        //         for (const trigger of Object.values(charm.system.triggers.dicerollertriggers).filter(trigger => trigger.triggerTime === 'beforeRoll')) {
        //             try {
        //                 for (let triggerAmountIndex = 1; triggerAmountIndex < (charm.timesAdded || 1) + 1; triggerAmountIndex++) {
        //                     if (await this._triggerRequirementsMet(charm, trigger, "benefit", triggerAmountIndex, true)) {

        //                         for (const bonus of Object.values(trigger.bonuses)) {
        //                             let cleanedValue = bonus.value.toLowerCase().trim();
        //                             switch (bonus.effect) {
        //                                 case 'diceModifier':
        //                                 case 'diceToSuccesses':
        //                                     dicePool += this._getFormulaValue(cleanedValue, null);
        //                                     break;
        //                             }
        //                         }
        //                     }
        //                 }
        //             } catch (e) {
        //                 ui.notifications.error(`<p>Error in Trigger:</p><pre>${trigger?.name || 'No Name Trigger'}</pre><p>See the console (F12) for details</p>`);
        //                 console.error(e);
        //             }
        //         }
        //     }
        // }

        return dicePool;
    }

    async _assembleDamagePool(display) {
        if (display && this.object.showTargets > 1) {
            return "";
        }
        var damageDicePool = this.object.damage.damageDice;
        var defense = this.object.defense;
        var soak = this.object.soak;
        var attackSuccesses = this.object.attackSuccesses;
        var targetSpecificDamageMod = this.object.targetSpecificDamageMod;

        if (display && this.object.showTargets && !this.object.target) {
            defense = Object.values(this.object.targets)[0].rollData.defense;
            soak = Object.values(this.object.targets)[0].rollData.soak;
            attackSuccesses = Object.values(this.object.targets)[0].rollData.attackSuccesses;
            targetSpecificDamageMod = Object.values(this.object.targets)[0].rollData.damageModifier;
        }

        // if (display) {
        //     for (const charm of this.object.addedCharms) {
        //         for (const trigger of Object.values(charm.system.triggers.dicerollertriggers).filter(trigger => trigger.triggerTime === 'afterRoll' || trigger.triggerTime === 'beforeDamageRoll')) {
        //             try {
        //                 for (let triggerAmountIndex = 1; triggerAmountIndex < (charm.timesAdded || 1) + 1; triggerAmountIndex++) {
        //                     if (await this._triggerRequirementsMet(charm, trigger, "benefit", triggerAmountIndex, true)) {
        //                         for (const bonus of Object.values(trigger.bonuses)) {
        //                             let cleanedValue = bonus.value.toLowerCase().trim();
        //                             switch (bonus.effect) {
        //                                 case 'damageDice':
        //                                 case 'diceToSuccesses-damage':
        //                                     damageDicePool += this._getFormulaValue(cleanedValue, null);
        //                                     break;
        //                                 case 'postSoakDamage':
        //                                     postSoakDamage += this._getFormulaValue(cleanedValue, null);
        //                                     break;
        //                                 case 'soak':
        //                                     soak += this._getFormulaValue(cleanedValue, charm.actor);
        //                                     break;
        //                                 case 'defense':
        //                                     defense += this._getFormulaValue(cleanedValue, charm.actor);
        //                                     break;
        //                             }
        //                         }
        //                     }
        //                 }
        //             } catch (e) {
        //                 ui.notifications.error(`<p>Error in Trigger:</p><pre>${trigger?.name || 'No Name Trigger'}</pre><p>See the console (F12) for details</p>`);
        //                 console.error(e);
        //             }
        //         }
        //     }
        // }

        if (this.actor.system.battlegroup && this._damageRollType('withering')) {
            damageDicePool += (this.actor.system.size.value + this.actor.system.might.value);
        }

        if (this._damageRollType('decisive') && this.object.damage.decisiveDamageType === 'initiative') {
            damageDicePool -= this.object.cost.initiative;
            if (this.object.showTargets) {
                if (this.object.damage.decisiveDamageCalculation === 'evenSplit') {
                    damageDicePool = Math.ceil(damageDicePool / this.object.showTargets);
                }
                else if (this.object.damage.decisiveDamageCalculation === 'half') {
                    damageDicePool = Math.ceil(damageDicePool / 2);
                }
                else {
                    damageDicePool = Math.ceil(damageDicePool / 3);
                }
            }
        }

        if (this.object.rollType === 'damage' && (this.object.attackType === 'withering' || this.object.damage.threshholdToDamage)) {
            damageDicePool += Math.max(0, attackSuccesses - defense);
        }
        else if (this._damageRollType('withering') || this.object.damage.threshholdToDamage) {
            damageDicePool += this.object.thresholdSuccesses;
        }
        if (this.object.damage.cappedThreshholdToDamage && defense < attackSuccesses) {
            damageDicePool += Math.min(this.object.damage.cappedThreshholdToDamage, attackSuccesses - defense);
        }
        if (targetSpecificDamageMod) {
            damageDicePool += targetSpecificDamageMod;
        }
        let baseDamage = damageDicePool;
        if (this._damageRollType('withering')) {
            damageDicePool -= Math.max(0, soak - this.object.damage.ignoreSoak);
            if (damageDicePool < this.object.overwhelming) {
                damageDicePool = Math.max(damageDicePool, this.object.overwhelming);
            }
            if (damageDicePool < 0) {
                damageDicePool = 0;
            }
            damageDicePool += this.object.damage.postSoakDamage;
        }
        if (this.object.damage.doublePreRolledDamage) {
            damageDicePool *= 2;
        }
        if (damageDicePool < 0) {
            damageDicePool = 0;
        }
        if (this.object.damage.diceToSuccesses > 0) {
            damageDicePool = Math.max(0, damageDicePool - this.object.damage.diceToSuccesses);
        }
        return damageDicePool;
    }

    _getDiceCap(getLunarFormCharmDice = false) {
        if (this.object.rollType !== "base") {
            if (!this.actor?.system.lunarform?.enabled && getLunarFormCharmDice) {
                return 0;
            }
            if (this.actor.type === "character" && this.actor.system.attributes[this.object.attribute]) {
                if (this.actor.system.attributes[this.object.attribute].excellency || this.actor.system.abilities[this.object.ability]?.excellency || this.object.customabilities.some(ma => ma._id === this.object.ability && ma.system.excellency)) {
                    let abilityValue = 0;
                    let attributeValue = this.actor.system.attributes[this.object.attribute].value;
                    abilityValue = this._getCharacterAbilityValue(this.actor, this.object.ability);
                    if (['abyssal', 'solar', 'infernal'].includes(this.actor.system.details.exalt)) {
                        return abilityValue + this.actor.system.attributes[this.object.attribute].value;
                    }
                    if (this.actor.system.details.exalt === "dragonblooded") {
                        return abilityValue + (this.object.specialty ? 1 : 0);
                    }
                    if (this.actor.system.details.exalt === "alchemical") {
                        return Math.min(10, this.actor.system.attributes[this.object.attribute].value + this.actor.system.essence.value);
                    }
                    if (this.actor.system.details.exalt === "lunar") {
                        return `${this.actor.system.attributes[this.object.attribute].value} - ${this.actor.system.attributes[this.object.attribute].value + this._getHighestAttributeNumber(this.actor.system.attributes, true)}`;
                    }
                    if (this.actor.system.details.exalt === "sidereal") {
                        return `${Math.min(5, Math.max(3, this.actor.system.essence.value))}`;
                    }
                    if (this.actor.system.details.exalt === "dreamsouled") {
                        return `${abilityValue} or ${Math.min(10, abilityValue + this.actor.system.essence.value)} when upholding ideal`;
                    }
                    if (this.actor.system.details.exalt === "umbral") {
                        return `${Math.min(10, abilityValue + this.actor.system.penumbra.value)}`;
                    }
                    if (this.actor.system.details.exalt === "hearteater") {
                        return `${this.actor.system.attributes[this.object.attribute].value + 1} + Intimacy`;
                    }
                    if (this.actor.system.details.exalt === "liminal") {
                        if (this.actor.system.anima.value >= 1) {
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
                    if (this.actor.system.details.exalt === "sovereign") {
                        return Math.min(Math.max(this.actor.system.essence.value, 3) + this.actor.system.anima.value, 10);
                    }
                }
            }
            else if (this.actor.system.lunarform?.enabled) {
                const lunar = game.actors.get(this.actor.system.lunarform.actorid);
                let diceCap = 'Connected Lunar could not be found';
                if (lunar) {
                    let lunarPool = 0;
                    let animalPool = 0;
                    let lunarAttributeValue = 0;
                    let lunarHasExcellency = false;
                    const action = this.object.actions.find(action => action._id === this.object.pool);
                    if (lunar.type === 'npc') {
                        if (action) {
                            const lunarAction = lunar.items.filter(item => item.type === 'action').find(lunarActionItem => lunarActionItem.name === action.name);
                            if (lunarAction) {
                                lunarPool = lunarAction.system.value;
                            }
                        }
                        else if (this._isAttackRoll()) {
                            lunarPool = 0;
                        }
                        else {
                            lunarPool = lunar.system.pools[this.object.pool].value;
                        }
                    }
                    else {
                        if (action) {
                            lunarPool = (lunar.system.attributes[action.system.lunarstats.attribute]?.value || 0) + this._getCharacterAbilityValue(lunar, action.system.lunarstats.ability);
                            lunarAttributeValue = lunar.system.attributes[action.system.lunarstats.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[action.system.lunarstats.attribute]?.excellency;
                        }
                        else if (this._isAttackRoll()) {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.attacks.attribute]?.value + this._getCharacterAbilityValue(lunar, 'brawl');
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings.attacks.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings.attacks.attribute]?.excellency;
                        }
                        else if (this.object.pool === 'grapple') {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.grapplecontrol.attribute]?.value + this._getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.grapplecontrol.ability);
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings.grapplecontrol.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings.grapplecontrol.attribute]?.excellency;
                        }
                        else if (this.object.rollType === 'disengage') {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.disengage.attribute]?.value + this._getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.disengage.ability);
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings.disengage.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings.disengage.attribute]?.excellency;
                        }
                        else if (this.object.pool === 'movement') {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.rush.attribute]?.value + this._getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.rush.ability);
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings.rush.attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings.rush.attribute]?.excellency;
                        }
                        else {
                            lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings[this.object.pool].attribute]?.value + this._getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings[this.object.pool].ability);
                            lunarAttributeValue = lunar.system.attributes[lunar.system.settings.rollsettings[this.object.pool].attribute]?.value;
                            lunarHasExcellency = lunar.system.attributes[lunar.system.settings.rollsettings[this.object.pool].attribute]?.excellency;
                        }
                        if (this.object.specialty) {
                            lunarPool++;
                        }
                    }
                    if (this.object.actions.some(action => action._id === this.object.pool)) {
                        animalPool = this.actor.actions.find(x => x._id === this.object.pool).system.value;
                    }
                    else if (this._isAttackRoll()) {
                        animalPool = this.object.weaponAccuracy || 0;
                    }
                    else {
                        animalPool = this.actor.system.pools[this.object.pool].value;
                    }
                    let currentCharmDice = 0;
                    for (const charm of this.object.addedCharms) {
                        if (charm.system.diceroller.settings.noncharmdice) {
                            currentCharmDice += this._getFormulaValue(charm.system.diceroller.bonusdice);
                        }
                        if (charm.system.diceroller.settings.noncharmsuccesses) {
                            currentCharmDice += (this._getFormulaValue(charm.system.diceroller.bonussuccesses) * 2);
                        }
                    }
                    if (getLunarFormCharmDice) {
                        return Math.max(currentCharmDice, currentCharmDice + (animalPool - lunarPool));
                    }
                    if (lunarHasExcellency) {
                        diceCap = `${lunarAttributeValue} - ${lunarAttributeValue + this._getHighestAttributeNumber(lunar.system.attributes, true)}`;
                    }
                    else {
                        diceCap = '';
                    }
                }
                return diceCap;
            }
            else if (this.actor.type === "npc" && this.actor.system.creaturetype === 'exalt') {
                var dicePool = 0;
                if (this.object.actions && this.object.actions.some(action => action._id === this.object.pool)) {
                    dicePool = this.actor.actions.find(x => x._id === this.object.pool).system.value;
                }
                else if (this.actor.system.pools[this.object.pool]) {
                    if (this.object.baseAccuracy) {
                        dicePool = this.object.baseAccuracy;
                    } else {
                        dicePool = this.actor.system.pools[this.object.pool].value;
                    }
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
                if (['abyssal', 'solar', 'infernal'].includes(this.actor.system.details.exalt)) {
                    diceMap = {
                        'zero': 0,
                        'two': 2,
                        'three': 5,
                        'seven': 7,
                        'eleven': 10,
                    };
                }
                if (this.actor.system.details.exalt === 'alchemical') {
                    diceMap = {
                        'zero': 0,
                        'two': this.actor.system.essence.value + 1,
                        'three': this.actor.system.essence.value + 2,
                        'seven': this.actor.system.essence.value + 4,
                        'eleven': this.actor.system.essence.value + 5,
                    };
                }
                if (this.actor.system.details.exalt === 'getimian') {
                    diceMap = {
                        'zero': 0,
                        'two': 2,
                        'three': 5,
                        'seven': 6,
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

    _getTNCap() {
        let tnChange = '';
        var abilityValue = 0;
        if (this.actor && this.actor.type === 'character') {
            abilityValue = this._getCharacterAbilityValue(this.actor, this.object.ability);
            if (this.actor.system.details.exalt === "sidereal") {
                tnChange = "";
                if (abilityValue === 5) {
                    if (this.actor.system.essence.value >= 3) {
                        tnChange = "3";
                    }
                    else {
                        tnChange = "2";
                    }
                }
                else if (abilityValue >= 3) {
                    tnChange = "1";
                }
            }
        }
        return tnChange;
    }

    _getCharacterAbilityValue(actor, ability) {
        if (actor.items.filter(item => item.type === 'customability').some(ca => ca._id === ability)) {
            return actor.customabilities.find(x => x._id === ability).system.points;
        }
        if (actor.system.abilities[ability]) {
            return actor.system.abilities[ability]?.value || 0;
        }
        if (ability === 'willpower') {
            return actor.system.willpower.max;
        }
        return 0;
    }

    _getDamageCap() {
        if (this._isAttackRoll() && this.object.attackType === 'withering') {
            let actorData = this.actor;
            if (this.actor.system.lunarform?.enabled && this.actor.system.lunarform?.actorid) {
                actorData = game.actors.get(this.actor.system.lunarform.actorid) || actorData;
            }
            if (actorData.type === 'character' && actorData.system.attributes.strength.excellency) {
                let newValueLow = Math.floor((actorData.system.attributes.strength.value) / 2);
                let newValueHigh = Math.floor((actorData.system.attributes.strength.value + this._getHighestAttributeNumber(actorData.system.attributes)) / 2);
                if (actorData.system.details.exalt === 'alchemical') {
                    newValueLow = Math.floor(Math.min(10, actorData.system.attributes.strength.value + actorData.system.essence.value) / 2);
                }
                if (actorData.system.details.exalt === 'lunar') {
                    return `(+${newValueLow}-${newValueHigh} for ${newValueLow}-${newValueHigh}m)`;
                }
                return `(+${newValueLow} for ${newValueLow}m)`;
            }
        }
        return '';
    }

    _setBattlegroupBonuses() {
        this.object.diceModifier += this.actor.system.commandbonus.value;
        if (this._isAttackRoll()) {
            this.object.diceModifier += (this.actor.system.size.value + this.actor.system.might.value);
            if (this._damageRollType('withering')) {
                this.object.damage.damageDice += (this.actor.system.size.value + this.actor.system.might.value);
            }
        }
    }

    _getHighestAttribute(attributes, syncedLunar = false) {
        var highestAttributeNumber = 0;
        var highestAttribute = "strength";
        for (let [name, attribute] of Object.entries(attributes)) {
            if (attribute.value > highestAttributeNumber && (!syncedLunar || name !== this.object.attribute)) {
                highestAttributeNumber = attribute.value;
                highestAttribute = name;
            }
        }
        return highestAttribute;
    }


    _getHighestAttributeNumber(attributes, syncedLunar = false) {
        var highestAttributeNumber = 0;
        var highestAttribute = "strength";
        for (let [name, attribute] of Object.entries(attributes)) {
            if (attribute.value > highestAttributeNumber && (!syncedLunar || name !== this.object.attribute)) {
                highestAttributeNumber = attribute.value;
                highestAttribute = name;
            }
        }
        return highestAttributeNumber;
    }

    _calculateAnimaGain() {
        var newLevel = this.actor.system.anima.level;
        if (this.object.cost.anima > 0) {
            for (var i = 0; i < this.object.cost.anima; i++) {
                if (newLevel === "Transcendent") {
                    newLevel = "Bonfire";
                }
                else if (newLevel === "Bonfire") {
                    newLevel = "Burning";
                }
                else if (newLevel === "Burning") {
                    newLevel = "Glowing";
                }
                if (newLevel === "Glowing") {
                    newLevel = "Dim";
                }
            }
        }

        if (this.object.motePool === 'peripheral') {
            if (this.object.cost.motes > 4) {
                for (var i = 0; i < Math.floor((this.object.cost.motes) / 5); i++) {
                    if (newLevel === "Dim") {
                        newLevel = "Glowing";
                    }
                    else if (newLevel === "Glowing") {
                        newLevel = "Burning";
                    }
                    else if (newLevel === "Burning") {
                        newLevel = "Bonfire";
                    }
                    else if (this.actor.system.anima.max === 4) {
                        newLevel = "Transcendent";
                    }
                }
            }
        }

        this.object.newAnima = newLevel;
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
                grappleControl: 0,
                silverxp: 0,
                goldxp: 0,
                whitexp: 0,
                aura: "",
            }
        }
        if (this.object.cost.grapplecontrol === undefined) {
            this.object.cost.grapplecontrol = 0;
        }
        if (this.object.restore === undefined) {
            this.object.restore = {
                motes: 0,
                willpower: 0,
                health: 0,
                initiative: 0
            };
        }
        if (this.object.rerollNumberDescending === undefined) {
            this.object.rerollNumberDescending = 0;
            this.object.damage.rerollNumberDescending = 0;
        }
        if (this.object.steal === undefined) {
            this.object.steal = {
                motes: {
                    max: 0,
                    gained: 0,
                },
                willpower: {
                    max: 0,
                    gained: 0,
                },
                health: {
                    max: 0,
                    gained: 0,
                },
                initiative: {
                    max: 0,
                    gained: 0,
                },
            };
        }
        if (this.object.damage.type === undefined) {
            this.object.damage.type = 'lethal';
        }

        if (this.object.penaltyModifier === undefined) {
            this.object.penaltyModifier = 0;
            this.object.ignorePenalties = 0;
        }
        if (this.object.craft === undefined) {
            this.object.craft = {
                divineInsperationTechnique: false,
                holisticMiracleUnderstanding: false,
            }
        }
        if (this.object.triggers === undefined) {
            this.object.triggers = [];
        }
        if (this.object.damage.threshholdToDamage === undefined) {
            this.object.damage.threshholdToDamage = false;
        }
        if (this.object.damage.cappedThreshholdToDamage === undefined) {
            this.object.damage.cappedThreshholdToDamage = 0;
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
        if (this.object.damage.maxInitiative === undefined) {
            this.object.damage.maxInitiative = 0;
        }
        if (this.object.damage.ignoreSoak === undefined) {
            this.object.damage.ignoreSoak = 0;
            this.object.triggerSelfDefensePenalty = 0;
            this.object.triggerKnockdown = false;
        }
        if (this.object.triggerTargetDefensePenalty === undefined) {
            this.object.triggerTargetDefensePenalty = 0;
        }
        if (this.object.onslaughtAddition === undefined) {
            this.object.onslaughtAddition = 1;
            this.object.magicOnslaughtAddition = 0;
        }
        if (this.object.damage.ignoreHardness === undefined) {
            this.object.damage.ignoreHardness = 0;
        }
        if (this.object.damage.gainInitiative === undefined) {
            this.object.damage.gainInitiative = true;
        }
        if (this.object.addedCharms === undefined) {
            this.object.addedCharms = [];
        }
        if (this.object.opposingCharms === undefined) {
            this.object.opposingCharms = [];
        }
        if (this.object.damage.decisiveDamageType === undefined) {
            this.object.damage.decisiveDamageType = 'initiative';
            this.object.damage.decisiveDamageCalculation = 'evenSplit';
            this.object.gambit = 'none';
        }
        if (this.object.addStatuses === undefined) {
            this.object.addStatuses = [];
        }
        if (this.object.addSelfStatuses === undefined) {
            this.object.addSelfStatuses = [];
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
                triggerOnesCap: 0,
                triggerOnTens: 'none',
                triggerTensCap: 0,
                doubleThresholdSuccessCap: 0,
                damage: {
                    doubleSucccessCaps: {
                        sevens: 0,
                        eights: 0,
                        nines: 0,
                        tens: 0
                    },
                    excludeOnesFromRerolls: false,
                    triggerOnTens: 'none',
                    alsoTriggerNines: false,
                    triggerTensCap: 0,
                    triggerOnOnes: '',
                    alsoTriggerTwos: false,
                    triggerOnesCap: 0,
                }
            }
            this.object.damage.rerollNumber = 0;
            this.object.damage.rerollFailed = false;
            this.object.damage.rollTwice = false;
            this.object.damage.triggerOnTens = 'none';
            this.object.damage.triggerTensCap = 'none';
            this.object.activateAura = '';
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
        if (this.object.settings.ignoreLegendarySize === undefined) {
            this.object.settings.ignoreLegendarySize = false;
        }
        if (this.object.specialAttacksList === undefined) {
            this.object.specialAttacksList = [
                { id: 'aim', name: "Aim", added: false, show: false, description: '+3 Attack Dice', img: 'systems/exaltedthird/assets/icons/targeting.svg' },
                { id: 'clash', name: "Clash", added: false, show: false, description: 'On successful attack gain +3 initiative withering damage or +1 level of Decisive damage.  Inflict a -2 defense penalty on the target.', img: 'systems/exaltedthird/assets/icons/sword-clash.svg' },
                { id: 'chopping', name: "Chopping", added: false, show: false, description: 'Cost: 1i and reduce defense by 1. Increase damage by 3 on withering.  -2 hardness on decisive', img: 'systems/exaltedthird/assets/icons/battered-axe.svg' },
                { id: 'flurry', name: "Flurry", added: false, show: this._isAttackRoll(), description: 'Cost: 3 dice and reduce defense by 1.', img: 'systems/exaltedthird/assets/icons/spinning-blades.svg' },
                { id: 'fulldefense', name: "Flurry Full Defense", added: false, show: false, description: '3 Dice and 2 Initiative cost and add the full defense effect to token.  -1 Defense for flurrying', img: 'icons/svg/shield.svg' },
                { id: 'piercing', name: "Piercing", added: false, show: false, description: 'Cost: 1i and reduce defense by 1.  Ignore 4 soak', img: 'systems/exaltedthird/assets/icons/fast-arrow.svg' },
                { id: 'knockdown', name: "Smashing (Knockdown)", added: false, show: false, description: 'Cost: 2i and reduce defense by 1. Knock opponent down', img: 'icons/svg/falling.svg' },
                { id: 'knockback', name: "Smashing (Knockback)", added: false, show: false, description: 'Cost: 2i and reduce defense by 1.  Knock opponent back 1 range band', img: 'systems/exaltedthird/assets/icons/hammer-drop.svg' },
                { id: 'impale', name: "Impale", added: false, show: false, description: 'If moved 2 consecutive range bands toward target while mounted.  Deal +5 withering or +3 decisive damage', img: 'systems/exaltedthird/assets/icons/spiked-tail.svg' },
            ];
        }
        if (this.object.charmDiceAdded === undefined) {
            this.object.charmDiceAdded = 0;
        }
        if (this.object.diceCap === undefined) {
            this.object.diceCap = this._getDiceCap();
        }
        if (this.object.TNCap === undefined) {
            this.object.TNCap = this._getTNCap();
        }
        if (this.object.damageDiceCap === undefined) {
            this.object.damageDiceCap = this._getDamageCap();
        }
        if (this.object.diceToSuccesses === undefined) {
            this.object.diceToSuccesses = 0;
        }
        if (this.object.damage.diceToSuccesses === undefined) {
            this.object.damage.diceToSuccesses = 0;
        }
        if (this.object.rollTwice === undefined) {
            this.object.rollTwice = false;
        }
        if (this.object.rollTwiceLowest === undefined) {
            this.object.rollTwiceLowest = false;
            this.object.damage.rollTwiceLowest = false;
        }
        if (this.object.attackEffect === undefined) {
            this.object.attackEffectPreset = data.attackEffectPreset || 'none';
            this.object.attackEffect = data.attackEffect || '';
        }
        if (this.object.applyAppearance === undefined) {
            this.object.applyAppearance = false;
            this.object.appearanceBonus = 0;
        }
        if (this.object.hardness === undefined) {
            this.object.hardness = 0;
        }
        if (this.object.shieldInitiative === undefined) {
            this.object.shieldInitiative = 0;
        }
        if (this.object.spell === undefined) {
            this.object.spell = "";
        }
        if (this.object.rollType !== 'base' && this.actor.type === 'npc' && !this.actor.system.pools[this.object.pool]) {
            const findPool = this.actor.actions.find((action) => action.system.oldKey === this.object.pool);
            if (findPool) {
                this.object.pool = findPool._id;
                this.object.actions = this.actor.actions;
            }
        }
        if (this.object.doubleThresholdSuccesses === undefined) {
            this.object.doubleThresholdSuccesses = 0;
        }
    }

    async _updateCharacterResources() {
        if (this.object.rollType === 'sorcery') {
            this.object.previousSorceryMotes = this.actor.system.sorcery.motes.value;
            let actorSorceryMotes = this.actor.system.sorcery.motes.value;
            let actorSorceryMoteCap = this.actor.system.sorcery.motes.max;
            let crashed = false;
            if (game.combat) {
                let combatant = this._getActorCombatant();
                if (combatant && combatant?.initiative !== null && combatant.initiative <= 0) {
                    crashed = true;
                }
            }
            actorSorceryMotes += this.object.total;
            if (this.object.spell) {
                const activeSpell = this.actor.items?.find(item => item.system?.shaping);
                if (activeSpell && activeSpell.id !== this.object.spell) {
                    actorSorceryMotes = this.object.total;
                    actorSorceryMoteCap = 0;
                    this.object.previousSorceryMotes = 0;
                }
                for (const spell of this.actor.items.filter(spell => spell.type === 'spell')) {
                    if (spell.id === this.object.spell) {
                        await spell.update({ [`system.shaping`]: true });
                        actorSorceryMoteCap = (parseInt(spell.system.cost) + (crashed ? 3 : 0));
                    }
                    if (spell.system.shaping && spell.id !== this.object.spell) {
                        await spell.update({ [`system.shaping`]: false });
                    }
                }
                if (actorSorceryMoteCap && (actorSorceryMotes >= actorSorceryMoteCap)) {
                    this.object.spellCast = true;
                    actorSorceryMotes = 0;
                    actorSorceryMoteCap = 0;
                    if (this.object.spell && !crashed) {
                        this.object.restore.willpower++;
                    }
                    for (const spell of this.actor.items.filter(spell => spell.type === 'spell')) {
                        await spell.update({ [`system.shaping`]: false });
                    }
                }
            }
            await this.actor.update({
                [`system.sorcery.motes.value`]: actorSorceryMotes,
                [`system.sorcery.motes.max`]: actorSorceryMoteCap
            });
        }
        const actorData = foundry.utils.duplicate(this.actor);
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
        var totalMotes = this.object.cost.motes + this.object.cost.muteMotes;
        const { spentPeripheral, spentPersonal } = this._lowerMotes(actorData, totalMotes);
        actorData.system.penumbra.value = Math.max(0, actorData.system.penumbra.value - this.object.cost.penumbra);
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
        actorData.system.grapplecontrolrounds.value = Math.max(0, actorData.system.grapplecontrolrounds.value - this.object.cost.grappleControl);

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
        if (this.object.activateAura && this.object.activateAura !== 'none') {
            actorData.system.details.aura = this.object.activateAura;
        }
        var restoreMotes = this.object.restore.motes + this.object.steal.motes.gained;
        if (this.object.motePool === 'personal') {
            actorData.system.motes.personal.value = Math.min(actorData.system.motes.personal.max, actorData.system.motes.personal.value + restoreMotes);
        }
        else {
            actorData.system.motes.peripheral.value = Math.min(actorData.system.motes.peripheral.max, actorData.system.motes.peripheral.value + restoreMotes);
        }
        actorData.system.willpower.value = Math.min(actorData.system.willpower.max, actorData.system.willpower.value + this.object.restore.willpower);
        if (this.object.restore.health > 0) {
            const bashingHealed = this.object.restore.health - actorData.system.health.lethal;
            actorData.system.health.lethal = Math.max(0, actorData.system.health.lethal - this.object.restore.health);
            if (bashingHealed > 0) {
                actorData.system.health.bashing = Math.max(0, actorData.system.health.bashing - bashingHealed);
            }
        }
        if (this.object.stunt === 'bank') {
            actorData.system.stuntdice.value += 2;
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
                if (this.object.restore.initiative > 0) {
                    this.object.characterInitiative += this.object.restore.initiative;
                }
                game.combat.setInitiative(combatant.id, this.object.characterInitiative);
            }
        }
        this.actor.update(actorData);
    }

    _lowerMotes(actor, value) {
        var spentPersonal = 0;
        var spentPeripheral = 0;
        if (this.object.motePool === 'personal') {
            var remainingPersonal = actor.system.motes.personal.value - value;
            if (remainingPersonal < 0) {
                spentPersonal = value + remainingPersonal;
                spentPeripheral = Math.min(actor.system.motes.peripheral.value, Math.abs(remainingPersonal));
            }
            else {
                spentPersonal = value;
            }
        }
        else {
            var remainingPeripheral = actor.system.motes.peripheral.value - value;
            if (remainingPeripheral < 0) {
                spentPeripheral = value + remainingPeripheral;
                spentPersonal = Math.min(actor.system.motes.personal.value, Math.abs(remainingPeripheral));
            }
            else {
                spentPeripheral = value;
            }
        }
        return {
            spentPeripheral,
            spentPersonal,
        };
    }

    _addStatusEffect(name, statusType = "addStatuses", value = 0) {
        this.object[statusType].push(name);
    }

    attackSequence() {
        const actorToken = this._getActorToken();
        if (game.modules.get("sequencer")?.active && this.object.target && actorToken && game.settings.get("exaltedthird", "attackEffects")) {
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
        if (this.object.weaponMacro) {
            let macro = new Function(this.object.weaponMacro);
            try {
                macro.call(this);
            } catch (e) {
                ui.notifications.error(`<p>There was an error in your macro syntax for the weapon macro:</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
                console.error(e);
            }
        }
    }

    _sortDice(diceRoll, ignoreSetting = false) {
        //ignoreSetting = true will always sort dice

        var sortedDice;

        if (game.settings.get('exaltedthird', 'sortDice') || ignoreSetting === true) {
            sortedDice = diceRoll.sort((a, b) => b.result - a.result);
        } else {
            sortedDice = diceRoll;
        }

        return sortedDice;
    }
}

export async function animaTokenMagic(actor, newAnimaValue) {
    const tokenId = actor.token?.id || actor.getActiveTokens()[0]?.id;
    const actorToken = canvas.tokens.placeables.filter(x => x.id === tokenId)[0];
    if (game.modules.get("tokenmagic")?.active && game.settings.get("exaltedthird", "animaTokenMagic") && actorToken) {
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
                    if (actorToken.actor.system.details.exalt === "sovereign") {
                        await TokenMagic.addUpdateFilters(actorToken, sovereign);
                    }
                }
                else {
                    await TokenMagic.addUpdateFilters(actorToken, bonfire);
                    if (actorToken.actor.system.details.exalt === "sovereign") {
                        await TokenMagic.addUpdateFilters(actorToken, sovereign);
                    }
                }
            }
        }
    }
}
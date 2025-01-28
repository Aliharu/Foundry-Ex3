import { activatableData, artifactData, charmAlternateData, charmPrerequisite, equipmentData, traitField, triggerData } from "./common-template.js";

const fields = foundry.data.fields;

class CommonItemData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        // Note that the return is just a simple object
        return {
            description: new fields.HTMLField({ initial: "" }),
            pagenum: new fields.StringField({ initial: "" }),
        }
    }
}

export class ItemData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...artifactData(),
            ...equipmentData(),
            ...activatableData(),
            ...triggerData(),
            autoaddtorolls: new fields.StringField({ initial: "" }),
            itemtype: new fields.StringField({ initial: "item" }),
            quantity: new fields.NumberField({ initial: 1 }),
        }
    }
    static migrateData(source) {
        if (typeof source.hasevocations === 'string') {
            source.hasevocations = true;
        }
        if (typeof source.exceptional === 'string') {
            source.exceptional = true;
        }
        return super.migrateData(source);
    }
}

export class ItemCustomAbilityData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            favored: new fields.BooleanField({ initial: false }),
            points: new fields.NumberField({ initial: 1 }),
            abilitytype: new fields.StringField({ initial: "other" }),
            attribute: new fields.StringField({ initial: "default" }),
            maiden: new fields.StringField({ initial: "" }),
            quantity: new fields.NumberField({ initial: 1 }),
            siderealmartialart: new fields.BooleanField({ initial: false }),
            excellency: new fields.BooleanField({ initial: false }),
            armorallowance: new fields.StringField({ initial: "" }),
            nature: new fields.StringField({ initial: "" }),
            formulakey: new fields.StringField({ initial: "" }),
            traits: new fields.SchemaField({
                weapons: traitField(),
            }),
        }
    }

    static migrateData(source) {
        if (typeof source.favored === 'string') {
            source.favored = true;
        }
        if (typeof source.siderealmartialart === 'string') {
            source.siderealmartialart = true;
        }
        if (typeof source.excellency === 'string') {
            source.excellency = true;
        }
        return super.migrateData(source);
    }
}


export class ItemWeaponData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...equipmentData(),
            ...artifactData(),
            ...triggerData(),
            weighttype: new fields.StringField({ initial: "other" }),
            witheringaccuracy: new fields.NumberField({ initial: 0 }),
            witheringdamage: new fields.NumberField({ initial: 0 }),
            defense: new fields.NumberField({ initial: 0 }),
            overwhelming: new fields.NumberField({ initial: 1 }),
            tags: new fields.StringField({ initial: "" }),
            equipped: new fields.BooleanField({ initial: true }),
            weapontype: new fields.StringField({ initial: "melee" }),
            ability: new fields.StringField({ initial: "melee" }),
            attribute: new fields.StringField({ initial: "dexterity" }),
            damageattribute: new fields.StringField({ initial: "strength" }),
            range: new fields.StringField({ initial: "short" }),
            attackeffectpreset: new fields.StringField({ initial: "none" }),
            attackeffect: new fields.StringField({ initial: "" }),
            attackmacro: new fields.StringField({ initial: "" }),
            decisivedamagetype: new fields.StringField({ initial: "initiative" }),
            staticdamage: new fields.NumberField({ initial: 0 }),
            resetinitiative: new fields.BooleanField({ initial: true }),
            targetstat: new fields.StringField({ initial: "defense" }),
            poison: new fields.SchemaField({
                name: new fields.StringField({ initial: "" }),
                apply: new fields.BooleanField({ initial: false }),
                damage: new fields.NumberField({ initial: 0 }),
                penalty: new fields.NumberField({ initial: 0 }),
                duration: new fields.NumberField({ initial: 0 }),
                damagetype: new fields.StringField({ initial: "none" }),
            }),
            traits: new fields.SchemaField({
                weapontags: traitField(),
            }),
        }
    }
    static migrateData(source) {
        if (typeof source.resetinitiative === 'string') {
            source.resetinitiative = true;
        }
        if (typeof source.equipped === 'string') {
            source.equipped = true;
        }
        if (typeof source.hasevocations === 'string') {
            source.hasevocations = true;
        }
        if (source.attribute === 'none') {
            source.attribute = '';
        }
        if (source.ability === 'none') {
            source.ability = '';
        }
        if (source.damageattribute === 'none') {
            source.damageattribute = '';
        }
        return super.migrateData(source);
    }
}

export class ItemArmorData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...equipmentData(),
            ...artifactData(),
            weighttype: new fields.StringField({ initial: "other" }),
            soak: new fields.NumberField({ initial: 0 }),
            penalty: new fields.NumberField({ initial: 0 }),
            hardness: new fields.NumberField({ initial: 0 }),
            tags: new fields.StringField({ initial: "" }),
            equipped: new fields.BooleanField({ initial: true }),
            traits: new fields.SchemaField({
                armortags: traitField(),
            }),
        }
    }

    static migrateData(source) {
        if (typeof source.equipped === 'string') {
            source.equipped = true;
        }
        if (typeof source.hasevocations === 'string') {
            source.hasevocations = true;
        }
        return super.migrateData(source);
    }
}

export class ItemMeritData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            ...triggerData(),
            autoaddtorolls: new fields.StringField({ initial: "" }),
            merittype: new fields.StringField({ initial: "story" }),
            parentitemid: new fields.StringField({ initial: "" }),
            archetypename: new fields.StringField({ initial: "" }),
            attribute: new fields.StringField({ initial: "" }),
            ability: new fields.StringField({ initial: "" }),
            points: new fields.NumberField({ initial: 0 }),
        }
    }
}

export class ItemInitiationData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
        }
    }
}

export class ItemRitualData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            archetypename: new fields.StringField({ initial: "" }),
            ritualtype: new fields.StringField({ initial: "sorcery" }),
        }
    }
}

export class ItemIntimacyData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            visible: new fields.BooleanField({ initial: false }),
            strength: new fields.StringField({ initial: "minor" }),
            intimacytype: new fields.StringField({ initial: "tie" }),
        }
    }
}

export class ItemMartialArtData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            favored: new fields.BooleanField({ initial: false }),
            points: new fields.NumberField({ initial: 1 }),
            siderealmartialart: new fields.BooleanField({ initial: false }),
        }
    }
}

export class ItemCraftData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            favored: new fields.BooleanField({ initial: false }),
            points: new fields.NumberField({ initial: 1 }),
            siderealmartialart: new fields.BooleanField({ initial: false }),
        }
    }
}

export class ItemSpecialAbilityData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            ...triggerData(),
            autoaddtorolls: new fields.StringField({ initial: "" }),
        }
    }
}

export class ItemSpecialtyData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ability: new fields.StringField({ initial: "archery" }),
        }
    }
}

export class ItemCraftProjectData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            type: new fields.StringField({ initial: "" }),
            rating: new fields.NumberField({ initial: 0 }),
            difficulty: new fields.NumberField({ initial: 0 }),
            goalnumber: new fields.NumberField({ initial: 0 }),
            intervals: new fields.NumberField({ initial: 0 }),
            experience: new fields.SchemaField({
                required: new fields.NumberField({ initial: 0 }),
                completed: new fields.NumberField({ initial: 0 }),
            }),
        }
    }
}

export class ItemActionData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            lunarstats: new fields.SchemaField({
                attribute: new fields.StringField({ initial: "" }),
                ability: new fields.StringField({ initial: "" }),
            }),
            value: new fields.NumberField({ initial: 0 }),
            oldKey: new fields.StringField({ initial: "" }),
        }
    }

    static migrateData(source) {
        if (typeof source.activatable === 'string') {
            source.activatable = true;
        }
        if (source.lunarstats?.attribute === 'none') {
            source.lunarstats.attribute = '';
        }
        if (source.lunarstats?.ability === 'none') {
            source.lunarstats.ability = '';
        }
        return super.migrateData(source);
    }
}

export class ItemDestinyData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            frayed: new fields.BooleanField({ initial: false }),
        }
    }
}

export class ItemShapeData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            actorid: new fields.StringField({ initial: "" }),
        }
    }
}

export class ItemSpellData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            ...triggerData(),
            autoaddtorolls: new fields.StringField({ initial: "" }),
            summary: new fields.StringField({ initial: "" }),
            circle: new fields.StringField({ initial: "terrestrial" }),
            keywords: new fields.StringField({ initial: "" }),
            cost: new fields.NumberField({ initial: 0 }),
            willpower: new fields.NumberField({ initial: 1 }),
            duration: new fields.StringField({ initial: "" }),
            shaping: new fields.BooleanField({ initial: false }),
        }
    }

    static migrateData(source) {
        if (typeof source.activatable === 'string') {
            source.activatable = true;
        }
        return super.migrateData(source);
    }
}

export class ItemCharmData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...triggerData(),
            ...charmAlternateData(),
            prerollmacro: new fields.StringField({ initial: "" }),
            macro: new fields.StringField({ initial: "" }),
            damagemacro: new fields.StringField({ initial: "" }),
            prerequisites: new fields.StringField({ initial: "" }),
            charmprerequisites: new fields.ArrayField(
                new fields.SchemaField({
                    ...charmPrerequisite()
                }),
            ),
            charmtype: new fields.StringField({ initial: "other" }),
            ability: new fields.StringField({ initial: "other" }),
            listingname: new fields.StringField({ initial: "" }),
            requirement: new fields.NumberField({ initial: 0 }),
            essence: new fields.NumberField({ initial: 0 }),
            active: new fields.BooleanField({ initial: false }),
            modes: new fields.SchemaField({
                currentmodeid: new fields.StringField({ initial: "" }),
                currentmodename: new fields.StringField({ initial: "" }),
                mainmode: new fields.SchemaField({
                    id: new fields.StringField({ initial: "" }),
                    name: new fields.StringField({ initial: "" }),
                    ...charmAlternateData(),
                }),
                alternates: new fields.ArrayField(
                    new fields.SchemaField({
                        id: new fields.StringField({ initial: "" }),
                        name: new fields.StringField({ initial: "" }),
                        ...charmAlternateData(),
                    }),
                ),
            }),
            parentitemid: new fields.StringField({ initial: "" }),
            upgrades: new fields.ObjectField({ initial: {} }),
            archetype: new fields.SchemaField({
                ability: new fields.StringField({ initial: "" }),
                prerequisites: new fields.StringField({ initial: "" }),
                charmprerequisites: new fields.ArrayField(
                    new fields.SchemaField({
                        ...charmPrerequisite()
                    }),
                ),
            }),
            numberprerequisites: new fields.SchemaField({
                ability: new fields.StringField({ initial: "" }),
                number: new fields.NumberField({ initial: 0 }),
            }),
            equipped: new fields.BooleanField({ initial: false }),
            diceroller: new fields.SchemaField({
                enabled: new fields.BooleanField({ initial: true }),
                bonusdice: new fields.StringField({ initial: "0" }),
                bonussuccesses: new fields.StringField({ initial: "0" }),
                ignorepenalties: new fields.StringField({ initial: "0" }),
                doublesuccess: new fields.NumberField({ initial: 11 }),
                decreasetargetnumber: new fields.NumberField({ initial: 0 }),
                rerolldice: new fields.StringField({ initial: "0" }),
                diceToSuccesses: new fields.StringField({ initial: "0" }),
                reducedifficulty: new fields.StringField({ initial: "0" }),
                rerollfailed: new fields.BooleanField({ initial: false }),
                rolltwice: new fields.BooleanField({ initial: false }),
                activateAura: new fields.StringField({ initial: "" }),
                selfdefensepenalty: new fields.NumberField({ initial: 0 }),
                targetdefensepenalty: new fields.NumberField({ initial: 0 }),
                triggerontens: new fields.StringField({ initial: "none" }),
                triggertenscap: new fields.StringField({ initial: "0" }),
                alsotriggernines: new fields.BooleanField({ initial: false }),
                settings: new fields.SchemaField({
                    noncharmdice: new fields.BooleanField({ initial: false }),
                    noncharmsuccesses: new fields.BooleanField({ initial: false }),
                }),
                reroll: new fields.SchemaField({
                    one: new fields.BooleanField({ initial: false }),
                    two: new fields.BooleanField({ initial: false }),
                    three: new fields.BooleanField({ initial: false }),
                    four: new fields.BooleanField({ initial: false }),
                    five: new fields.BooleanField({ initial: false }),
                    six: new fields.BooleanField({ initial: false }),
                    seven: new fields.BooleanField({ initial: false }),
                    eight: new fields.BooleanField({ initial: false }),
                    nine: new fields.BooleanField({ initial: false }),
                    ten: new fields.BooleanField({ initial: false }),
                }),
                rerollcap: new fields.SchemaField({
                    one: new fields.StringField({ initial: "0" }),
                    two: new fields.StringField({ initial: "0" }),
                    three: new fields.StringField({ initial: "0" }),
                    four: new fields.StringField({ initial: "0" }),
                    five: new fields.StringField({ initial: "0" }),
                    six: new fields.StringField({ initial: "0" }),
                    seven: new fields.StringField({ initial: "0" }),
                    eight: new fields.StringField({ initial: "0" }),
                    nine: new fields.StringField({ initial: "0" }),
                    ten: new fields.StringField({ initial: "0" }),
                }),
                doublesucccesscaps: new fields.SchemaField({
                    sevens: new fields.StringField({ initial: "0" }),
                    eights: new fields.StringField({ initial: "0" }),
                    nines: new fields.StringField({ initial: "0" }),
                    tens: new fields.StringField({ initial: "0" }),
                }),
                excludeonesfromrerolls: new fields.BooleanField({ initial: false }),
                ignorelegendarysize: new fields.BooleanField({ initial: false }),
                damage: new fields.SchemaField({
                    bonusdice: new fields.StringField({ initial: "0" }),
                    bonussuccesses: new fields.StringField({ initial: "0" }),
                    doublesuccess: new fields.NumberField({ initial: 11 }),
                    decreasetargetnumber: new fields.NumberField({ initial: 0 }),
                    rerolldice: new fields.StringField({ initial: "0" }),
                    dicetosuccesses: new fields.StringField({ initial: "0" }),
                    rerollfailed: new fields.BooleanField({ initial: false }),
                    rolltwice: new fields.BooleanField({ initial: false }),
                    overwhelming: new fields.StringField({ initial: "0" }),
                    postsoakdamage: new fields.StringField({ initial: "0" }),
                    ignoresoak: new fields.StringField({ initial: "0" }),
                    ignorehardness: new fields.StringField({ initial: "0" }),
                    threshholdtodamage: new fields.BooleanField({ initial: false }),
                    doublerolleddamage: new fields.BooleanField({ initial: false }),
                    triggerontens: new fields.StringField({ initial: "none" }),
                    triggertenscap: new fields.StringField({ initial: "0" }),
                    alsotriggernines: new fields.BooleanField({ initial: false }),
                    reroll: new fields.SchemaField({
                        one: new fields.BooleanField({ initial: false }),
                        two: new fields.BooleanField({ initial: false }),
                        three: new fields.BooleanField({ initial: false }),
                        four: new fields.BooleanField({ initial: false }),
                        five: new fields.BooleanField({ initial: false }),
                        six: new fields.BooleanField({ initial: false }),
                        seven: new fields.BooleanField({ initial: false }),
                        eight: new fields.BooleanField({ initial: false }),
                        nine: new fields.BooleanField({ initial: false }),
                        ten: new fields.BooleanField({ initial: false }),
                    }),
                    rerollcap: new fields.SchemaField({
                        one: new fields.StringField({ initial: "0" }),
                        two: new fields.StringField({ initial: "0" }),
                        three: new fields.StringField({ initial: "0" }),
                        four: new fields.StringField({ initial: "0" }),
                        five: new fields.StringField({ initial: "0" }),
                        six: new fields.StringField({ initial: "0" }),
                        seven: new fields.StringField({ initial: "0" }),
                        eight: new fields.StringField({ initial: "0" }),
                        nine: new fields.StringField({ initial: "0" }),
                        ten: new fields.StringField({ initial: "0" }),
                    }),
                    doublesucccesscaps: new fields.SchemaField({
                        sevens: new fields.StringField({ initial: "0" }),
                        eights: new fields.StringField({ initial: "0" }),
                        nines: new fields.StringField({ initial: "0" }),
                        tens: new fields.StringField({ initial: "0" }),
                    }),
                    excludeonesfromrerolls: new fields.BooleanField({ initial: false }),
                }),
                opposedbonuses: new fields.SchemaField({
                    enabled: new fields.BooleanField({ initial: false }),
                    dicemodifier: new fields.StringField({ initial: "0" }),
                    penaltymodifier: new fields.StringField({ initial: "0" }),
                    successmodifier: new fields.StringField({ initial: "0" }),
                    rerollsuccesses: new fields.StringField({ initial: "0" }),
                    defense: new fields.StringField({ initial: "0" }),
                    soak: new fields.StringField({ initial: "0" }),
                    shieldinitiative: new fields.StringField({ initial: "0" }),
                    hardness: new fields.StringField({ initial: "0" }),
                    increasedamagetargetnumber: new fields.NumberField({ initial: 0 }),
                    increasetargetnumber: new fields.NumberField({ initial: 0 }),
                    increasegambitdifficulty: new fields.StringField({ initial: "0" }),
                    damagemodifier: new fields.StringField({ initial: "0" }),
                    resolve: new fields.StringField({ initial: "0" }),
                    guile: new fields.StringField({ initial: "0" }),
                    triggeronones: new fields.StringField({ initial: "none" }),
                    alsotriggertwos: new fields.BooleanField({ initial: false }),
                    triggeronescap: new fields.StringField({ initial: "0" }),
                }),
            }),
        }
    }

    /** @inheritdoc */
    static migrateData(source) {
        if (source.diceroller) {
            if (typeof source.diceroller.enabled === 'string') {
                source.diceroller.enabled = true;
            }
            if (typeof source.diceroller.rolltwice === 'string') {
                source.diceroller.rolltwice = true;
            }
            if (typeof source.diceroller.rerollfailed === 'string') {
                source.diceroller.rerollfailed = true;
            }
            if (typeof source.diceroller.alsotriggernines === 'string') {
                source.diceroller.alsotriggernines = true;
            }
            if (typeof source.diceroller.excludeonesfromrerolls === 'string') {
                source.diceroller.excludeonesfromrerolls = true;
            }
            if (typeof source.diceroller.ignorelegendarysize === 'string') {
                source.diceroller.ignorelegendarysize = true;
            }
            if (source.diceroller.reroll) {
                if (typeof source.diceroller.reroll.one === 'string') {
                    source.diceroller.reroll.one = true;
                }
                if (typeof source.diceroller.reroll.two === 'string') {
                    source.diceroller.reroll.two = true;
                }
                if (typeof source.diceroller.reroll.three === 'string') {
                    source.diceroller.reroll.three = true;
                }
                if (typeof source.diceroller.reroll.four === 'string') {
                    source.diceroller.reroll.four = true;
                }
                if (typeof source.diceroller.reroll.five === 'string') {
                    source.diceroller.reroll.five = true;
                }
                if (typeof source.diceroller.reroll.six === 'string') {
                    source.diceroller.reroll.six = true;
                }
                if (typeof source.diceroller.reroll.seven === 'string') {
                    source.diceroller.reroll.seven = true;
                }
                if (typeof source.diceroller.reroll.eight === 'string') {
                    source.diceroller.reroll.eight = true;
                }
                if (typeof source.diceroller.reroll.nine === 'string') {
                    source.diceroller.reroll.nine = true;
                }
                if (typeof source.diceroller.reroll.ten === 'string') {
                    source.diceroller.reroll.ten = true;
                }
            }

            //Damage
            if (source.diceroller.damage) {
                if (source.diceroller.damage.reroll) {
                    if (typeof source.diceroller.damage.reroll.one === 'string') {
                        source.diceroller.damage.reroll.one = true;
                    }
                    if (typeof source.diceroller.damage.reroll.two === 'string') {
                        source.diceroller.damage.reroll.two = true;
                    }
                    if (typeof source.diceroller.damage.reroll.three === 'string') {
                        source.diceroller.damage.reroll.three = true;
                    }
                    if (typeof source.diceroller.damage.reroll.four === 'string') {
                        source.diceroller.damage.reroll.four = true;
                    }
                    if (typeof source.diceroller.damage.reroll.five === 'string') {
                        source.diceroller.damage.reroll.five = true;
                    }
                    if (typeof source.diceroller.damage.reroll.six === 'string') {
                        source.diceroller.damage.reroll.six = true;
                    }
                    if (typeof source.diceroller.damage.reroll.seven === 'string') {
                        source.diceroller.damage.reroll.seven = true;
                    }
                    if (typeof source.diceroller.damage.reroll.eight === 'string') {
                        source.diceroller.damage.reroll.eight = true;
                    }
                    if (typeof source.diceroller.damage.reroll.nine === 'string') {
                        source.diceroller.damage.reroll.nine = true;
                    }
                    if (typeof source.diceroller.damage.reroll.ten === 'string') {
                        source.diceroller.damage.reroll.ten = true;
                    }
                }
                if (typeof source.diceroller.damage.rolltwice === 'string') {
                    source.diceroller.damage.rolltwice = true;
                }
                if (typeof source.diceroller.damage.rerollfailed === 'string') {
                    source.diceroller.damage.rerollfailed = true;
                }
                if (typeof source.diceroller.damage.alsotriggernines === 'string') {
                    source.diceroller.damage.alsotriggernines = true;
                }
                if (typeof source.diceroller.damage.threshholdtodamage === 'string') {
                    source.diceroller.damage.threshholdtodamage = true;
                }
                if (typeof source.diceroller.damage.doublerolleddamage === 'string') {
                    source.diceroller.damage.doublerolleddamage = true;
                }
                if (typeof source.diceroller.damage.excludeonesfromrerolls === 'string') {
                    source.diceroller.damage.excludeonesfromrerolls = true;
                }
            }

            if (source.diceroller.opposedbonuses) {
                //Opposed
                if (typeof source.diceroller.opposedbonuses.enabled === 'string') {
                    source.diceroller.opposedbonuses.enabled = true;
                }
                if (typeof source.diceroller.opposedbonuses.alsotriggertwos === 'string') {
                    source.diceroller.opposedbonuses.alsotriggertwos = true;
                }
            }

            if (source.diceroller.activateAura === 'none') {
                source.diceroller.activateAura = '';
            }
        }

        if (typeof source.activatable === 'string') {
            source.activatable = true;
        }
        return super.migrateData(source);
    }
}
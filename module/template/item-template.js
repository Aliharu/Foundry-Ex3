import { activatableData, artifactData, equipmentData, traitField } from "./common-template.js";

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
            itemtype: new fields.StringField({ initial: "item" }),
            quantity: new fields.NumberField({ initial: 1 }),
        }
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
            maiden: new fields.StringField({ initial: "" }),
            quantity: new fields.NumberField({ initial: 1 }),
            siderealmartialart: new fields.BooleanField({ initial: false }),
            excellency: new fields.BooleanField({ initial: false }),
            armorallowance: new fields.StringField({ initial: "" }),
            nature: new fields.StringField({ initial: "" }),
            traits: new fields.SchemaField({
                weapons: traitField(),
            }),
        }
    }
}


export class ItemWeaponData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...equipmentData(),
            ...artifactData(),
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
}

export class ItemMeritData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            merittype: new fields.StringField({ initial: "story" }),
            parentitemid: new fields.StringField({ initial: "" }),
            archetypename: new fields.StringField({ initial: "" }),
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
                attribute: new fields.StringField({ initial: "none" }),
                ability: new fields.StringField({ initial: "none" }),
            }),
            value: new fields.NumberField({ initial: 0 }),
            oldKey: new fields.StringField({ initial: "" }),
        }
    }
}

export class ItemDestinyData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
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
            summary: new fields.StringField({ initial: "" }),
            circle: new fields.StringField({ initial: "terrestrial" }),
            keywords: new fields.StringField({ initial: "" }),
            cost: new fields.NumberField({ initial: 0 }),
            willpower: new fields.NumberField({ initial: 1 }),
            duration: new fields.StringField({ initial: "" }),
            shaping: new fields.BooleanField({ initial: false }),
        }
    }
}

export class ItemCharmData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            summary: new fields.StringField({ initial: "" }),
            prerollmacro: new fields.StringField({ initial: "" }),
            macro: new fields.StringField({ initial: "" }),
            damagemacro: new fields.StringField({ initial: "" }),
            prerequisites: new fields.StringField({ initial: "" }),
            charmprerequisites: new fields.ArrayField(
                new fields.SchemaField({
                    id: new fields.StringField({ initial: "" }),
                    name: new fields.StringField({ initial: "" }),
                }),
            ),
            charmtype: new fields.StringField({ initial: "" }),
            type: new fields.StringField({ initial: "supplemental" }),
            duration: new fields.StringField({ initial: "instant" }),
            keywords: new fields.StringField({ initial: "" }),
            ability: new fields.StringField({ initial: "other" }),
            listingname: new fields.StringField({ initial: "" }),
            requirement: new fields.NumberField({ initial: 0 }),
            essence: new fields.NumberField({ initial: 0 }),
            parentitemid: new fields.StringField({ initial: "" }),
            archetype: new fields.SchemaField({
                ability: new fields.StringField({ initial: "" }),
                prerequisites: new fields.StringField({ initial: "" }),
                charmprerequisites: new fields.ArrayField(
                    new fields.SchemaField({
                        id: new fields.StringField({ initial: "" }),
                        name: new fields.StringField({ initial: "" }),
                    }),
                ),
            }),
            numberprerequisites: new fields.SchemaField({
                ability: new fields.StringField({ initial: "" }),
                number: new fields.NumberField({ initial: 0 }),
            }),
            cost: new fields.SchemaField({
                motes: new fields.NumberField({ initial: 0 }),
                commitmotes: new fields.NumberField({ initial: 0 }),
                initiative: new fields.NumberField({ initial: 0 }),
                anima: new fields.NumberField({ initial: 0 }),
                penumbra: new fields.NumberField({ initial: 0 }),
                willpower: new fields.NumberField({ initial: 0 }),
                grapplecontrol: new fields.NumberField({ initial: 0 }),
                aura: new fields.StringField({ initial: "" }),
                health: new fields.NumberField({ initial: 0 }),
                healthtype: new fields.StringField({ initial: "bashing" }),
                xp: new fields.NumberField({ initial: 0 }),
                silverxp: new fields.NumberField({ initial: 0 }),
                goldxp: new fields.NumberField({ initial: 0 }),
                whitexp: new fields.NumberField({ initial: 0 }),
            }),
            restore: new fields.SchemaField({
                motes: new fields.NumberField({ initial: 0 }),
                willpower: new fields.NumberField({ initial: 0 }),
                health: new fields.NumberField({ initial: 0 }),
                initiative: new fields.NumberField({ initial: 0 }),
            }),
            diceroller: new fields.SchemaField({
                enabled: new fields.BooleanField({ initial: true }),
                bonusdice: new fields.StringField({ initial: "0" }),
                bonussuccesses: new fields.StringField({ initial: "0" }),
                doublesuccess: new fields.NumberField({ initial: 11 }),
                decreasetargetnumber: new fields.NumberField({ initial: 0 }),
                rerolldice: new fields.StringField({ initial: "0" }),
                diceToSuccesses: new fields.NumberField({ initial: 0 }),
                reducedifficulty: new fields.StringField({ initial: "0" }),
                rerollfailed: new fields.BooleanField({ initial: false }),
                rolltwice: new fields.BooleanField({ initial: false }),
                activateAura: new fields.StringField({ initial: "none" }),
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
            autoaddtorolls: new fields.StringField({ initial: "" }),
            triggers: new fields.SchemaField({
                dicerollertriggers: new fields.ObjectField({ initial: {} }),
            }),
        }
    }
}
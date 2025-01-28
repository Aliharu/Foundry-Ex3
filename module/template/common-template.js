const fields = foundry.data.fields;

export function resourceField(initialValue, initialMax) {
    return new fields.SchemaField({
        min: new fields.NumberField({ initial: 0 }),
        value: new fields.NumberField({ initial: initialValue }),
        max: new fields.NumberField({ initial: initialMax }),
    });
}

export function statField(initialValue) {
    return new fields.SchemaField({
        min: new fields.NumberField({ initial: 0 }),
        value: new fields.NumberField({ initial: initialValue }),
    });
}

export function rollSettingField(attribute, ability) {
    return new fields.SchemaField({
        attribute: new fields.StringField({ initial: attribute }),
        ability: new fields.StringField({ initial: ability }),
        bonus: new fields.NumberField({ initial: 0 }),
    });
}

export function staticSettingField(attribute, ability) {
    return new fields.SchemaField({
        attribute: new fields.StringField({ initial: attribute }),
        ability: new fields.StringField({ initial: ability }),
        specialty: new fields.BooleanField({ initial: false }),
    });
}

export function traitField() {
    return new fields.SchemaField({
        value: new fields.ArrayField(new fields.StringField({ initial: ""})),
        custom: new fields.StringField({ initial: "" }),
    });
}

export function attributeField(type) {
    return new fields.SchemaField({
        favored: new fields.BooleanField({ initial: false }),
        caste: new fields.BooleanField({ initial: false }),
        excellency: new fields.BooleanField({ initial: false }),
        value: new fields.NumberField({ initial: 1 }),
        type: new fields.StringField({ initial: type }),
        upgrade: new fields.NumberField({ initial: 0 }),
    });
}

export function abilityField(prefAttribute, ability) {
    return new fields.SchemaField({
        favored: new fields.BooleanField({ initial: false }),
        caste: new fields.BooleanField({ initial: false }),
        excellency: new fields.BooleanField({ initial: false }),
        value: new fields.NumberField({ initial: 0 }),
        prefattribute: new fields.StringField({ initial: prefAttribute }),
        maiden: new fields.StringField({ initial: CONFIG.exaltedthird.abilityMaidens[ability] || "" }),
    });
}

export function shipData() {
    return new fields.SchemaField({
        health: new fields.SchemaField({
            levels: new fields.SchemaField({
                zero: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 0 }),
                    penalty: new fields.NumberField({ initial: 0 }),
                }),
                one: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 1 }),
                    penalty: new fields.NumberField({ initial: 1 }),
                }),
                two: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 1 }),
                    penalty: new fields.NumberField({ initial: 2 }),
                }),
                three: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 0 }),
                    penalty: new fields.NumberField({ initial: 3 }),
                }),
                four: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 1 }),
                    penalty: new fields.NumberField({ initial: 4 }),
                }),
                inc: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 1 }),
                    penalty: new fields.StringField({ initial: "inc" }),
                }),
            }),

            value: new fields.NumberField({ initial: 0 }),
            min: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField({ initial: 0 }),
            bashing: new fields.NumberField({ initial: 0 }),
            lethal: new fields.NumberField({ initial: 0 }),
            aggravated: new fields.NumberField({ initial: 0 }),
            penalty: new fields.NumberField({ initial: 0 }),
        }),
        momentum: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        }),
        speed: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        }),
        maneuverability: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        }),
        cargo: new fields.StringField({ initial: "" }),
    });
}

export function warstriderData() {
    return new fields.SchemaField({
        health: new fields.SchemaField({
            levels: new fields.SchemaField({
                zero: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 5 }),
                    penalty: new fields.NumberField({ initial: 0 }),
                }),
                one: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 5 }),
                    penalty: new fields.NumberField({ initial: 1 }),
                }),
                two: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 10 }),
                    penalty: new fields.NumberField({ initial: 2 }),
                }),
                three: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 0 }),
                    penalty: new fields.NumberField({ initial: 3 }),
                }),
                four: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 10 }),
                    penalty: new fields.NumberField({ initial: 4 }),
                }),
                inc: new fields.SchemaField({
                    value: new fields.NumberField({ initial: 1 }),
                    penalty: new fields.StringField({ initial: "inc" }),
                }),
            }),
            value: new fields.NumberField({ initial: 0 }),
            min: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField({ initial: 0 }),
            bashing: new fields.NumberField({ initial: 0 }),
            lethal: new fields.NumberField({ initial: 0 }),
            aggravated: new fields.NumberField({ initial: 0 }),
            penalty: new fields.NumberField({ initial: 0 }),
        }),
        soak: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        }),
        hardness: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            min: new fields.NumberField({ initial: 0 }),
        }),
        strength: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        }),
        speed: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        }),
    });
}

export function equipmentData() {
    return {
        cost: new fields.NumberField({ initial: 0 }),
        exceptional: new fields.BooleanField({ initial: false }),
    };
}

export function artifactData() {
    return {
        hasevocations: new fields.BooleanField({ initial: false }),
        attunement: new fields.NumberField({ initial: 0 }),
        hearthstones: resourceField(0, 0),
    }
}

export function activatableData() {
    return {
        activatable: new fields.BooleanField({ initial: false }),
        active: new fields.BooleanField({ initial: false }),
        endtrigger: new fields.StringField({ initial: "none" }),
    };
}

export function charmAlternateData() {
    return {
        endtrigger: new fields.StringField({ initial: "none" }),
        type: new fields.StringField({ initial: "supplemental" }),
        duration: new fields.StringField({ initial: "instant" }),
        activatable: new fields.BooleanField({ initial: false }),
        summary: new fields.StringField({ initial: "" }),
        multiactivate: new fields.BooleanField({ initial: false }),
        autoaddtorolls: new fields.StringField({ initial: "" }),
        costdisplay: new fields.StringField({ initial: "" }),
        keywords: new fields.StringField({ initial: "" }),
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
            anima: new fields.NumberField({ initial: 0 }),
            health: new fields.NumberField({ initial: 0 }),
            initiative: new fields.NumberField({ initial: 0 }),
            grapplecontrol: new fields.NumberField({ initial: 0 }),
        }),
    };
}

export function charmPrerequisite() {
    return {
        id: new fields.StringField({ initial: "" }),
        name: new fields.StringField({ initial: "" }),
        count: new fields.NumberField({ initial: 1 }),
    };
}


export function triggerData() {
    return {
        triggers: new fields.SchemaField({
            dicerollertriggers: new fields.ObjectField({ initial: {} }),
            // dicerollertriggers: new fields.ArrayField(
            //     new fields.SchemaField({
            //         name: new fields.StringField({ initial: "" }),
            //         triggerTime: new fields.StringField({ initial: "beforeRoll" }),
            //         bonuses: new fields.ArrayField(
            //             new fields.SchemaField({
            //                 resctriction: new fields.StringField({ initial: "" }),
            //                 value: new fields.StringField({ initial: "" }),
            //             }),
            //         ),
            //         requirements: new fields.ArrayField(
            //             new fields.SchemaField({
            //                 resctriction: new fields.StringField({ initial: "" }),
            //                 value: new fields.StringField({ initial: "" }),
            //             }),
            //         ),
            //     }),
            // ),
        }),
    };
}
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
        value: new fields.StringField({ initial: ability }),
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
    });
}

export function abilityField(prefAttribute) {
    return new fields.SchemaField({
        favored: new fields.BooleanField({ initial: false }),
        caste: new fields.BooleanField({ initial: false }),
        excellency: new fields.BooleanField({ initial: false }),
        value: new fields.NumberField({ initial: 1 }),
        prefattribute: new fields.StringField({ initial: prefAttribute }),
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
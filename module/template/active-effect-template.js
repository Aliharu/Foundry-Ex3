const fields = foundry.data.fields;

export class BaseActiveEffectData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            changes: new fields.ArrayField(new fields.SchemaField({
                key: new fields.StringField({ required: true }),
                type: new fields.StringField({ required: true, blank: false, initial: "add", }),
                value: new fields.AnyField({ required: true, nullable: true, serializable: true, initial: "" }),
                phase: new fields.StringField({ required: true, blank: false, initial: "initial" }),
                priority: new fields.NumberField()
            })),
            endtrigger: new fields.StringField({ initial: "none" }),
            activatewithparentitem: new fields.BooleanField({ initial: true }),
        };
    }
}

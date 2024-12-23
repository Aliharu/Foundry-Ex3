const fields = foundry.data.fields;

export class BaseActiveEffectData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            endtrigger: new fields.StringField({ initial: "none" }),
            activatewithparentitem: new fields.BooleanField({ initial: true })
        };
    }
}

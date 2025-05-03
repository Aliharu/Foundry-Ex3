const fields = foundry.data.fields;

export class BaseCombatantData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            acted: new fields.BooleanField({ initial: false })
        };
    }
}

import { exaltedthird } from "./config.js";

export default class ExaltedActiveEffectConfig extends ActiveEffectConfig {
    get template() {
        return 'systems/exaltedthird/templates/active-effect-config.html';
    }

    async getData() {
        let data = await super.getData();

        data.useDropdown = game.settings.get("exaltedthird", "useActiveEffectsDropdown");

        data.activeEffectChanges = exaltedthird.activeEffectChanges;

        return data;
    }
}
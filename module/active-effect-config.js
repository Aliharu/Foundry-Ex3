import { exaltedthird } from "./config.js";

export default class ExaltedActiveEffectConfig extends ActiveEffectConfig {
    get template() {
        return 'systems/exaltedthird/templates/active-effect-config.html';
    }

    async getData() {
        let context = await super.getData();

        context.useDropdown = game.settings.get("exaltedthird", "useActiveEffectsDropdown");

        context.selects = CONFIG.exaltedthird.selects;

        context.activeEffectChanges = exaltedthird.activeEffectChanges;

        return context;
    }
}
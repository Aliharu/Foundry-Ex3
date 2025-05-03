import { exaltedthird } from "./config.js";

export default class ExaltedActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {

    /** @override */
    static PARTS = {
        header: { template: "templates/sheets/active-effect/header.hbs" },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        details: { template: "systems/exaltedthird/templates/active-effect/details.html", scrollable: [""] },
        duration: { template: "systems/exaltedthird/templates/active-effect/duration.html" },
        changes: { template: "systems/exaltedthird/templates/active-effect/changes.html", scrollable: ["ol[data-changes]"] },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    /** @inheritDoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.useDropdown = game.settings.get("exaltedthird", "useActiveEffectsDropdown");

        context.selects = CONFIG.exaltedthird.selects;

        context.activeEffectChanges = exaltedthird.activeEffectChanges;

        return context;
    }
}
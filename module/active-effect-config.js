import { exaltedthird } from "./config.js";

export default class ExaltedActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {

    /** @override */
    static PARTS = {
        header: { template: "systems/exaltedthird/templates/active-effect/active-effects-header.html" },
        tabs: { template: "systems/exaltedthird/templates/dialogues/tabs.html" },
        details: { template: "systems/exaltedthird/templates/active-effect/details.html", scrollable: [""] },
        duration: { template: "systems/exaltedthird/templates/active-effect/duration.html" },
        changes: {
            template: "systems/exaltedthird/templates/active-effect/changes.html",
            templates: ["systems/exaltedthird/templates/active-effect/change.html"],
            scrollable: ["ol[data-changes]"]
        },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    _initializeApplicationOptions(options) {
        options.classes = [options.document?.parent?.getSheetBackground() ?? 'tree-background', "exaltedthird"];
        return super._initializeApplicationOptions(options);
    }

    /** @inheritDoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        context.selects = CONFIG.exaltedthird.selects;


        return context;
    }

    /** @inheritDoc */
    async _preparePartContext(partId, context) {
        const partContext = await super._preparePartContext(partId, context);
        if (partId in partContext.tabs) partContext.tab = partContext.tabs[partId];
        const effect = this.document;
        switch (partId) {
            case "details":
                partContext.isActorEffect = effect.parent?.documentName === "Actor";
                partContext.isItemEffect = effect.parent?.documentName === "Item";
                partContext.statuses = Object.values(CONFIG.statusEffects)
                    .map(s => ({ value: s.id, label: _loc(s.name) }));
                partContext.showIconOptions = Object.entries(CONST.ACTIVE_EFFECT_SHOW_ICON).map(([k, value]) => ({
                    value, label: _loc(`EFFECT.SHOW_ICON.${k.toLowerCase()}`)
                })).reverse();
                break;
            case "duration": {
                partContext.start = await this._prepareStartContext();
                partContext.hasDuration = typeof context.source.duration.value === "number";
                const groups = {
                    time: _loc("EFFECT.DURATION.UNITS.GROUPS.time"),
                    combat: _loc("EFFECT.DURATION.UNITS.GROUPS.combat")
                };
                partContext.durationUnits = CONST.ACTIVE_EFFECT_DURATION_UNITS.map(
                    value => ({
                        value,
                        label: _loc(`EFFECT.DURATION.UNITS.${value}`),
                        group: CONST.ACTIVE_EFFECT_TIME_DURATION_UNITS.includes(value) ? groups.time : groups.combat
                    })
                );
                partContext.expiryEvents = Object.entries(ActiveEffect.EXPIRY_EVENTS)
                    .map(([value, label]) => ({ value, label: _loc(label) }))
                    .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang))
                    .reduce((events, { value, label }) => {
                        events[value] = label;
                        return events;
                    }, {});
                break;
            }
            case "changes": {
                const fields = effect.system.schema.fields.changes.element.fields;
                const changeTypes = Object.entries(ActiveEffect.CHANGE_TYPES)
                    .map(([type, { label }]) => ({ type, label: _loc(label) }))
                    .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang))
                    .reduce((types, { type, label }) => {
                        types[type] = label;
                        return types;
                    }, {});
                const useDropdown = game.settings.get("exaltedthird", "useActiveEffectsDropdown");

                // const activeEffectChanges = CONFIG.exaltedthird.activeEffectChangesList;

                const activeEffectChanges = CONFIG.exaltedthird.activeEffectChangesList.map((change) => ({
                    value: change.value,
                    label: game.i18n.localize(change.label),
                    group: game.i18n.localize(change.group),
                }));

                partContext.changes = await Promise.all(foundry.utils.deepClone(context.source.changes).map((change, index) => {
                    const defaultPriority = ActiveEffect.CHANGE_TYPES[change.type]?.defaultPriority;
                    return this._renderChange({ change, index, fields, defaultPriority, changeTypes, useDropdown, activeEffectChanges });
                }));
                break;
            }
            case "footer":
                partContext.buttons = [{ type: "submit", icon: "fa-solid fa-floppy-disk", label: "EFFECT.Submit" }];
        }
        return partContext;
    }

    /** @inheritDoc */
    _processFormData(event, form, formData) {
        const submitData = super._processFormData(event, form, formData);
        if (!foundry.utils.isPlainObject(submitData.system?.changes)) return submitData;
        for (const [index, change] of Object.values(submitData.system.changes).entries()) {
            this._processChangeSubmission(change, index);
        }
        return submitData;
    }

    /**
 * Process submission data for a single change object.
 * @param {EffectChangeData} change The submitted change object with the value deserialized
 * @param {number} index            The object's index in the submitted array
 * @protected
 */
    _processChangeSubmission(change, index) {
        try {
            if (typeof change.value === "string") change.value &&= JSON.parse(change.value);
        }
        catch { }
    }

    /**
 * Prepare render context for a single change object.
 * @param {object} context                   Data for rendering the change row
 * @param {EffectChangeData} context.change  A copy of the change from the Effect's source array
 * @param {number} context.index             The change object's index in the array
 * @param {DataSchema} context.fields        The defined fields of the change data
 * @param {number} context.defaultPriority   The change type's default priority
 * @param {Record<string, string>} context.changeTypes All change types and their localized labels
 * @param {Boolean} context.useDropdown Boolean to determine if using dropdown or not
 * @param {object} context.activeEffectChanges Boolean to determine if using dropdown or not
 *
 *
 * @returns {Promise<string>}
 * @protected
 */
    async _renderChange(context) {
        const { change, index } = context;
        if (typeof change.value !== "string") change.value = JSON.stringify(change.value);
        Object.assign(
            change,
            ["key", "type", "value", "priority"].reduce((paths, fieldName) => {
                paths[`${fieldName}Path`] = `system.changes.${index}.${fieldName}`;
                return paths;
            }, {}));
        return ActiveEffect.CHANGE_TYPES[change.type].render?.(context)
            ?? foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/active-effect/change.html", context);
    }
}
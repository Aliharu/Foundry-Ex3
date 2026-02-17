import { getEnritchedHTML, toggleDisplay } from "../utils/utils.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class CharacterBuilder extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options, data) {
        super(options);
    }

    static PARTS = {
        form: {
            template: "systems/exaltedthird/templates/dialogues/item-search.html",
        },
    };

    async _prepareContext(_options) {
        // await this.loadItems();

        return {
            // filters: this.filters,
            // selects: CONFIG.exaltedthird.selects,
            // items: this.items,
            // filteredItems: this.applyFilter(),
            // itemSections: this.getListSections(),
            // charmAbilities: CONFIG.exaltedthird.charmabilities,
            // charmExaltType: JSON.parse(JSON.stringify(CONFIG.exaltedthird.exaltCharmTypes)),
        };
    }

    _onRender(context, options) {
    }

}
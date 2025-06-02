const { HandlebarsApplicationMixin, DocumentSheetV2 } = foundry.applications.api;

/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @extends {DocumentSheetV2}
 */
export default class TraitSelector extends HandlebarsApplicationMixin(DocumentSheetV2) {
  constructor(document, options = {}) {
    options.document = document;
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["exaltedthird", "trait-selector", "subconfig"],
    tag: "form",
    position: { width: 320, height: "auto" },
    form: {
      handler: TraitSelector.myFormHandler,
      submitOnChange: false,
    },
    sheetConfig: false
  };

  static PARTS = {
    form: {
      template: "systems/exaltedthird/templates/dialogues/trait-selector/trait-list.html",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  get title() {
    return game.i18n.localize('Ex3.TraitSelection');
  }

  _initializeApplicationOptions(options) {
    options.classes = [options.document.getSheetBackground(), "exaltedthird", "trait-selector", "subconfig"];
    return super._initializeApplicationOptions(options);
  }

  /* -------------------------------------------- */

  /**
   * Return a reference to the target attribute
   * @type {string}
   */
  get attribute() {
    return this.options.name;
  }


  async _prepareContext(_options) {
    const attr = foundry.utils.getProperty(this.document, this.attribute);
    const o = this.options;
    const value = attr.value;
    const custom = attr.custom;

    // Populate choices
    const choices = Object.entries(o.choices).reduce((obj, e) => {
      let [k, v] = e;
      obj[k] = { label: v, chosen: attr ? value.includes(k) : false };
      return obj;
    }, {});

    // Return data
    return {
      choices: choices,
      custom: custom,
      buttons: [
        { type: "submit", icon: "fa-solid fa-save", label: "Ex3.Update", cssClass: "full-footer-button" }
      ],
    }
  }

  static async myFormHandler(event, form, formData) {
    if (event.type === 'submit') {
      await this._updateObject(event, formData.object);
      this.close();
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {
    const o = this.options;

    // Obtain choices
    const chosen = [];
    for (let [k, v] of Object.entries(formData)) {
      if ((k !== "custom") && v) chosen.push(k);
    }

    // Object including custom data
    const updateData = {};
    updateData[`${this.attribute}.value`] = chosen;
    updateData[`${this.attribute}.custom`] = formData.custom;

    // Validate the number chosen
    if (o.minimum && (chosen.length < o.minimum)) {
      return ui.notifications.error(`You must choose at least ${o.minimum} options`);
    }
    if (o.maximum && (chosen.length > o.maximum)) {
      return ui.notifications.error(`You may choose no more than ${o.maximum} options`);
    }

    // Update the object
    this.document.update(updateData);
  }
}

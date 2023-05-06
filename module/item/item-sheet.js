import TraitSelector from "../apps/trait-selector.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ExaltedThirdItemSheet extends ItemSheet {

  constructor(...args) {
    super(...args);
    if (this.object.type === "charm") {
      this.options.width = this.position.width = 614;
      this.options.height = this.position.height = 850;
    }
    if (this.object.type === "weapon") {
      this.options.width = this.position.width = 675;
      this.options.height = this.position.height = 600;
    }
    this.options.classes = [...this.options.classes, this.getTypeSpecificCSSClasses()];
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["exaltedthird", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/exaltedthird/templates/item";
    if (this.item.type === 'destiny' || this.item.type === 'shape') return `${path}/item-sheet.html`;
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    context.system = itemData.system;
    context.useShieldInitiative = game.settings.get("exaltedthird", "useShieldInitiative");
    context.attributeList = CONFIG.exaltedthird.attributes;
    context.charmAbilityList = JSON.parse(JSON.stringify(CONFIG.exaltedthird.charmabilities));
    context.abilityList = JSON.parse(JSON.stringify(CONFIG.exaltedthird.abilities));
    if(this.object?.parent) {
      for(const customAbility of this.object.parent.customabilities){
        context.abilityList[customAbility._id] = customAbility.name;
        context.charmAbilityList[customAbility._id] = customAbility.name;
      }
    }

    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    context.descriptionHTML = await TextEditor.enrichHTML(context.system.description, {
      secrets: this.document.isOwner,
      async: true
    });

    if (itemData.type === 'weapon' || itemData.type === 'armor') {
      this._prepareTraits(itemData.type, context.system.traits);
    }

    context.effects = prepareActiveEffectCategories(this.item.effects);
    return context;
  }

  getTypeSpecificCSSClasses() {
    return `${game.settings.get("exaltedthird", "sheetStyle")}-background`;
  }

  /**
* Prepare the data structure for traits data like tags
* @param {object} traits   The raw traits data object from the item data
* @private
*/
  _prepareTraits(type, traits) {
    const map = {
    };
    if (type === 'weapon') {
      map['weapontags'] = CONFIG.exaltedthird.weapontags
    }
    if (type === 'armor') {
      map['armortags'] = CONFIG.exaltedthird.armortags
    }
    for (let [t, choices] of Object.entries(map)) {
      const trait = traits[t];
      if (!trait) continue;
      let values = [];
      if (trait.value) {
        values = trait.value instanceof Array ? trait.value : [trait.value];
      }
      trait.selected = values.reduce((obj, t) => {
        obj[t] = choices[t];
        return obj;
      }, {});

      // Add custom entry
      if (trait.custom) {
        trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i + 1}`] = c.trim());
      }
      trait.cssClass = !isEmpty(trait.selected) ? "" : "inactive";
    }
  }

  /**
* Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
* @param {Event} event   The click event which originated the selection
* @private
*/
  _onTraitSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const choices = CONFIG.exaltedthird[a.dataset.options];
    const options = { name: a.dataset.target, choices };
    return new TraitSelector(this.item, options).render(true)
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    this._setupButtons(html);

    html.find('.trait-selector').click(this._onTraitSelector.bind(this));

    html.find(".effect-control").click(ev => {
      if (this.item.isOwned) return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.");
      onManageActiveEffect(ev, this.item);
    });

    html.find('.collapsable').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    html.find('.toggle-charm-dice').mousedown(ev => {
      const itemData = duplicate(this.item);
      itemData.system.diceroller.settings.noncharmdice = !itemData.system.diceroller.settings.noncharmdice;
      this.item.update(itemData);
    });


    html.find('.toggle-charm-successes').mousedown(ev => {
      const itemData = duplicate(this.item);
      itemData.system.diceroller.settings.noncharmsuccesses = !itemData.system.diceroller.settings.noncharmsuccesses;
      this.item.update(itemData);
    });

    html.find(".charms-cheat-sheet").click(async ev => {
      const html = await renderTemplate("systems/exaltedthird/templates/dialogues/charms-dialogue.html");
      new Dialog({
        title: `Keywords`,
        content: html,
        buttons: {
          cancel: { label: "Close" }
        },
      }, { height: 1000, width: 1000, classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
    });

    html.find(".formula-help").click(async ev => {
      const html = await renderTemplate("systems/exaltedthird/templates/dialogues/formula-dialogue.html");
      new Dialog({
        title: `Formulas`,
        content: html,
        buttons: {
          cancel: { label: "Close" }
        },
      }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
    });

    html.find(".embeded-item-delete").on("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const li = event.currentTarget;
      const parent = $(li).parent()[0];
      const itemIndex = parent.dataset.itemIndex;

      const items = this.object.system.charmprerequisites;
      items.splice(itemIndex, 1);

      let formData = {};
      setProperty(formData, `system.charmprerequisites`, items);

      this.object.update(formData);
    });

    // Embeded Item code taken and modified from the Star Wars FFG FoundryVTT module
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.

    html.find(".embeded-item-pill").on("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const li = event.currentTarget;
      let itemType = li.dataset.itemName;
      let itemIndex = li.dataset.itemIndex;

      const embededItem = this.object.system.charmprerequisites[itemIndex];

      var item;

      if (embededItem.pack) {
        // Case 1 - Import from a Compendium pack
        item = await this.importItemFromCollection(embededItem.pack, embededItem.id);
      }
      else {
        // Case 2 - Import from World entity
        item = await game.items.get(embededItem.id);
      }
      if (!item) return ui.notifications.error(`Error: Could not find item, it may have been deleted`);;

      item.sheet.render(true);
    });

    // if (this.object.type === 'charm') {
    //   const itemToItemAssociation = new DragDrop({
    //     dragSelector: ".item",
    //     dropSelector: null,
    //     permissions: { dragstart: true, drop: true },
    //     callbacks: { drop: this._onDropItem.bind(this) },
    //   });
    //   itemToItemAssociation.bind(html[0]);
    // }
  }

  _setupButtons(html) {
    const itemData = duplicate(this.item);
    html.find('.non-charm-dice').each(function (i) {
      if (itemData.system.diceroller.settings.noncharmdice) {
        $(this).css("color", '#F9B516');
      }
    });
    html.find('.non-charm-successes').each(function (i) {
      if (itemData.system.diceroller.settings.noncharmsuccesses) {
        $(this).css("color", '#F9B516');
      }
    });
  }

  importItemFromCollection(collection, entryId) {
    const pack = game.packs.get(collection);
    if (pack.documentName !== "Item") return;
    return pack.getDocument(entryId).then((ent) => {
      return ent;
    });
  }

  async _onDropItem(event) {
    let data;
    const obj = this.object;
    const li = event.currentTarget;

    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (data.type !== "Item") return;
    } catch (err) {
      return false;
    }

    data.id = data.uuid.split('.')[1];
    if (data.uuid.includes('Compendium')) {
      let tmp = data.uuid.split('.');
      data.pack = tmp[1] + '.' + tmp[2];
      data.id = tmp[3];
    }

    let itemObject;
    if (data.pack) {
      // Case 1 - Import from a Compendium pack
      itemObject = await this.importItemFromCollection(data.pack, data.id);
    }
    else {
      // Case 2 - Import from World entity
      itemObject = await game.items.get(data.id);
      if (!itemObject) {
        return ui.notifications.error(`Error: Could not find item, you cannot drop embeded items into box.`);
      };
    }

    var newItem = {
      id: itemObject.id,
      name: itemObject.name,
      pack: data.pack,
    }

    if (itemObject.type === "charm") {
      let items = obj?.system.charmprerequisites;
      if (!items) {
        items = [];
      }

      switch (itemObject.type) {
        case "charm": {
          items.push(newItem);
          break;
        }
        default: {
          return;
        }
      }

      let formData = {};
      setProperty(formData, `system.charmprerequisites`, items);

      obj.update(formData);
    }
  }
}

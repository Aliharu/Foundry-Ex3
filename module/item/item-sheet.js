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
    };
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
    if (this.item.type === 'destiny') return `${path}/item-sheet.html`
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    context.system = itemData.system;

    if (itemData.type === 'weapon' || itemData.type === 'armor') {
      this._prepareTraits(itemData.type, context.system.traits);
    }

    context.system = itemData.system;
    context.effects = prepareActiveEffectCategories(this.item.effects);
    return context;
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
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.trait-selector').click(this._onTraitSelector.bind(this));

    html.find(".effect-control").click(ev => {
      if (this.item.isOwned) return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.");
      onManageActiveEffect(ev, this.item);
    });

    html.find('.collapsable').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    html.find(".show-keywords").click(async ev => {
      const html = await renderTemplate("systems/exaltedthird/templates/dialogues/keywords.html");
      new Dialog({
        title: `Keywords`,
        content: html,
        buttons: {
          cancel: { label: "Close" }
        }
      }, { height: 1000, width: 1000 }).render(true);
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

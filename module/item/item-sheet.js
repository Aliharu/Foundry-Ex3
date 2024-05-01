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
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["exaltedthird", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/exaltedthird/templates/item";
    if (this.item.type === 'destiny') return `${path}/item-sheet.html`;
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    context.system = itemData.system;
    context.useShieldInitiative = game.settings.get("exaltedthird", "useShieldInitiative");
    context.simplifiedCrafting = game.settings.get("exaltedthird", "simplifiedCrafting");
    context.attributeList = CONFIG.exaltedthird.attributes;
    context.charmAbilityList = JSON.parse(JSON.stringify(CONFIG.exaltedthird.charmabilities));
    context.charmAbilityListSectioned = JSON.parse(JSON.stringify(CONFIG.exaltedthird.charmAbilitiesSectioned));
    context.abilityList = JSON.parse(JSON.stringify(CONFIG.exaltedthird.abilities));
    context.charmExaltType = JSON.parse(JSON.stringify(CONFIG.exaltedthird.exaltcharmtypes));
    context.parentItemList = [];
    if (itemData.type === 'charm') {
      if (itemData.system.ability === 'evocation') {
        context.parentItemList = game.items.filter(item => (item.type === 'weapon' || item.type === 'armor' || item.type === 'item') && item.system.hasevocations);
      }
      if (itemData.system.ability === 'martialarts') {
        context.parentItemList = game.items.filter(item => item.type === 'customability' && item.system.abilitytype === 'martialart');
      }
    }
    // if(itemData.type === 'merit') {
    //   if (itemData.system.merittype === 'sorcery') {
    //     context.parentItemList = game.items.filter(item => item.type === 'ritual');
    //   }
    // }
    context.childCharms = game.items.filter(charm => charm.type === 'charm' && charm.system.parentitemid === itemData._id);
    context.lunarForms = game.actors.filter(actor => actor.type === 'npc' && actor.system.lunarform.enabled).map((actor) => {
      return {
        id: actor.id,
        label: actor.name
      }
    });
    if (this.object?.parent) {
      for (const customAbility of this.object.parent.customabilities) {
        context.abilityList[customAbility._id] = customAbility.name;
        context.charmAbilityList[customAbility._id] = customAbility.name;
        context.charmAbilityListSectioned.custom.entries[customAbility._id] = customAbility.name;
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

    if (itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'customability') {
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
    if (type === 'customability') {
      map['weapons'] = CONFIG.exaltedthird.weapons
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

    let embedItemshandler = this._onDragEmbeddedItem.bind(this);

    html.find('a.embeded-item-pill').each((i, li) => {
      li.addEventListener("dragstart", embedItemshandler, false);
    });

    html.find('.trait-selector').click(this._onTraitSelector.bind(this));

    html.find(".effect-control").click(ev => {
      onManageActiveEffect(ev, this.item);
    });

    html.find('.collapsable').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    html.on("dragstart", "a.embeded-item-pill", this._onDragEmbeddedItem);

    html.find('.toggle-charm-dice').mousedown(ev => {
      const itemData = foundry.utils.duplicate(this.item);
      itemData.system.diceroller.settings.noncharmdice = !itemData.system.diceroller.settings.noncharmdice;
      this.item.update(itemData);
    });


    html.find('.toggle-charm-successes').mousedown(ev => {
      const itemData = foundry.utils.duplicate(this.item);
      itemData.system.diceroller.settings.noncharmsuccesses = !itemData.system.diceroller.settings.noncharmsuccesses;
      this.item.update(itemData);
    });

    html.find('.add-trigger').click(ev => {
      var triggerType = ev.currentTarget.dataset.type;
      if (triggerType) {
        const newList = this.item.system.triggers[triggerType];
        newList[Object.entries(newList).length] = {
          name: "",
          triggerTime: "beforeRoll",
          bonuses: {},
          requirements: {}
        };
        this.item.update({ [`system.triggers.${triggerType}`]: newList });
      }
    });

    html.find('.delete-trigger').click(ev => {
      var triggerType = ev.currentTarget.dataset.type;
      var index = ev.currentTarget.dataset.index;
      this.item.update({
        [`system.triggers.${triggerType}.-=${index}`]: null,
      });
    });

    // html.on("change", ".trigger-name", ev => {
    //   var triggerType = ev.currentTarget.dataset.type;
    //   var index = ev.currentTarget.dataset.index;
    //   const newList = this.item.system.triggers[triggerType];
    //   newList[index].name = ev.currentTarget.value;
    //   this.item.update({ [`system.triggers.${triggerType}`]: newList });
    // });

    html.find('.add-trigger-subitem').click(ev => {
      var triggerType = ev.currentTarget.dataset.type;
      var index = ev.currentTarget.dataset.index;
      var subType = ev.currentTarget.dataset.subtype;
      const newList = this.item.system.triggers[triggerType][index][subType];
      let listIndex = 0;
      let indexAdd = "0";
      //Add Bonuses and requirements
      for(const key of Object.keys(newList)) {
        if(key !== listIndex.toString()) {
          break;
        }
        listIndex++;
      }
      indexAdd = listIndex.toString();
      if(subType === 'bonuses') {
        newList[indexAdd] = {
          effect: "",
          value: "",
        };
      }
      else {
        newList[indexAdd] = {
          requirement: "",
          value: "",
        };
      }
      this.item.update({ [`system.triggers.${triggerType}.${index}.${subType}`]: newList });
    });

    html.find('.delete-trigger-subitem').click(ev => {
      var triggerType = ev.currentTarget.dataset.type;
      var index = ev.currentTarget.dataset.index;
      var subindex = ev.currentTarget.dataset.subindex;
      var subType = ev.currentTarget.dataset.subtype;
      this.item.update({
        [`system.triggers.${triggerType}.${index}.${subType}.-=${subindex}`]: null,
      });
    });

    html.find('.show-roll-triggers-link').click(ev => {
      new Dialog({
        title: `ReadMe`,
        content: '<div><p><a href="https://github.com/Aliharu/Foundry-Ex3/wiki/Charm-Triggers">Instructions and Syntax.</a></p></div>',
        buttons: {
          cancel: { label: "Close" }
        }
      }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
    });

    // html.on("change", ".bonus-change", ev => {
    //   var triggerType = ev.currentTarget.dataset.type;
    //   var index = ev.currentTarget.dataset.index;
    //   var bonusIndex = ev.currentTarget.dataset.index;
    //   var fieldName = ev.currentTarget.dataset.fieldname;
    //   const newList = this.item.system.triggers[triggerType][index].bonuses;
    //   newList[bonusIndex][fieldName] = ev.currentTarget.value;
    //   this.item.update({ [`system.triggers.${triggerType}`]: newList });
    // });

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
      let formData = {};

      const li = event.currentTarget;
      const parent = $(li).parent()[0];
      const itemIndex = parent.dataset.itemIndex;

      if (event.currentTarget.dataset?.type === 'archetype') {
        const items = this.object.system.archetype.charmprerequisites;
        items.splice(itemIndex, 1);
        setProperty(formData, `system.archetype.charmprerequisites`, items);
        this.object.update(formData);
      }
      else {
        const items = this.object.system.charmprerequisites;
        items.splice(itemIndex, 1);
        setProperty(formData, `system.charmprerequisites`, items);
        this.object.update(formData);
      }
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
      let embededItem;

      if (li.dataset.type === 'archetype') {
        embededItem = this.object.system.archetype.charmprerequisites[itemIndex];
      }
      else {
        embededItem = this.object.system.charmprerequisites[itemIndex];
      }

      var item;

      if (embededItem.pack) {
        // Case 1 - Import from a Compendium pack
        item = await this.importItemFromCollection(embededItem.pack, embededItem.id);
      }
      else {
        // Case 2 - Import from World entity
        if (this.item.pack) {
          item = await this.importItemFromCollection(this.item.pack, embededItem.id);
        }
        if (!item) {
          item = await game.items.get(embededItem.id);
        }
      }
      if (!item) return ui.notifications.error(`Error: Could not find item, it may have been deleted.`);

      item.sheet.render(true);
    });

    if (this.object.type === 'charm') {
      const itemToItemAssociation = new DragDrop({
        dragSelector: ".item",
        dropSelector: null,
        permissions: { dragstart: true, drop: true },
        callbacks: { drop: this._onDropItem.bind(this) },
      });
      itemToItemAssociation.bind(html[0]);
    }
  }

  _setupButtons(html) {
    const itemData = foundry.utils.duplicate(this.item);
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


  _onDragEmbeddedItem(event) {
    event.stopPropagation();
    const a = event.currentTarget;
    let dragData = null;

    // Case 1 - Compendium Link
    if (a.dataset.pack || this.item?.pack) {
      const pack = game.packs.get(a.dataset.pack || this.item.pack);
      let id = a.dataset.id;
      if (!a.dataset.uuid && !id) return false;
      const uuid = a.dataset.uuid || pack.getUuid(id);
      dragData = { type: pack.documentName, uuid };
    }
    if (!dragData) {
      const doc = fromUuidSync(`Item.${a.dataset.id}`);
      dragData = doc.toDragData();
    }

    if (!dragData) return;

    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
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
      return ui.notifications.error(`Error: You cannot drop compendium items into box.`);
      // let tmp = data.uuid.split('.');
      // data.pack = tmp[1] + '.' + tmp[2];
      // data.id = tmp[4];
    }

    let itemObject;
    if (data.pack) {
      // Case 1 - Import from a Compendium pack
      itemObject = await this.importItemFromCollection(data.pack, data.id);
      if (!itemObject) {
        return ui.notifications.error(`Error: Could not find item, you cannot drop embeded items into box.`);
      };
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
      const otherTab = li.querySelector(`#other-tab`);
      const otherTabactive = otherTab.classList.contains("active");
      let items = obj?.system.charmprerequisites;
      if (otherTabactive) {
        items = obj?.system.archetype.charmprerequisites;
      }
      if (!items) {
        items = [];
      }
      if (items.map(item => item.id).includes(newItem.id)) {
        return;
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
      setProperty(formData, `system${otherTabactive ? '.archetype' : ''}.charmprerequisites`, items);

      obj.update(formData);
    }
  }
}

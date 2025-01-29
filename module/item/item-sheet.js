import TraitSelector from "../apps/trait-selector.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ExaltedThirdItemSheet extends ItemSheet {

  constructor(...args) {
    super(...args);
    if (this.object.type === "charm" || this.object.type === "spell" || this.object.type === "merit" || this.object.type === "specialability" || this.object.type === "item" || this.object.type === "weapon") {
      this.options.width = this.position.width = 615;
      this.options.height = this.position.height = 850;
    }
    this.options.classes = [...this.options.classes, this.item.getSheetBackground()];
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
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Token Configuration
    const canConfigure = game.user.isGM || this.item.parent?.isOwner;
    if (this.options.editable && canConfigure && this.item.type === 'charm') {
      const macroButton = {
        label: game.i18n.localize('Ex3.Macros'),
        class: 'sheet-settings',
        icon: 'fas fa-gear-code',
        onclick: () => this.openMacroDialog(),
      };
      buttons = [macroButton, ...buttons];
    }
    return buttons;
  }

  async openMacroDialog() {
    const template = "systems/exaltedthird/templates/dialogues/charm-macros.html";
    const html = await renderTemplate(template, { 'prerollmacro': this.item.system.prerollmacro, 'macro': this.item.system.macro, 'damagemacro': this.item.system.damagemacro, });

    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("Ex3.Macros"), },
      content: html,
      classes: [this.item.getSheetBackground()],
      buttons: [{
        action: "choice",
        label: game.i18n.localize("Ex3.Save"),
        default: true,
        callback: (event, button, dialog) => button.form.elements
      }, {
        action: "cancel",
        label: game.i18n.localize("Ex3.Cancel"),
        callback: (event, button, dialog) => false
      }],
      submit: result => {
        if (result) {
          this.item.update({
            [`system.prerollmacro`]: result.prerollmacro.value,
            [`system.macro`]: result.macro.value,
            [`system.damagemacro`]: result.damagemacro.value,
          });
        }
      }
    }).render({ force: true });
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
    context.abilityList[''] = "Ex3.None";
    context.charmExaltType = JSON.parse(JSON.stringify(CONFIG.exaltedthird.exaltcharmtypes));
    context.parentItemList = {
      '': 'Ex3.None'
    }
    context.showParentItemList = false;
    context.selects = CONFIG.exaltedthird.selects;
    context.itemModes = {};
    context.upgradeSelects = {};
    context.activeEffectIds = {};

    context.bonusTypes = CONFIG.exaltedthird.bonusTypes;
    context.triggerBonusDropdowns = CONFIG.exaltedthird.triggerBonusDropdowns;
    context.requirementTypes = CONFIG.exaltedthird.requirementTypes;
    context.formulaKeyPlaceholder = this.item.name.replace(/\s/g, '').toLowerCase();
    if (itemData.type === 'charm') {
      if (itemData.system.ability === 'evocation') {
        for (const evocation of game.items.filter(item => (item.type === 'weapon' || item.type === 'armor' || item.type === 'item') && item.system.hasevocations)) {
          context.parentItemList[evocation.id] = evocation.name;
        }
        context.showParentItemList = true;
      }
      if (itemData.system.ability === 'martialarts') {
        for (const martialArt of game.items.filter(item => item.type === 'customability' && item.system.abilitytype === 'martialart')) {
          context.parentItemList[martialArt.id] = martialArt.name;
        }
        context.showParentItemList = true;
      }
    }
    // if(itemData.type === 'merit') {
    //   if (itemData.system.merittype === 'sorcery') {
    //     context.parentItemList = game.items.filter(item => item.type === 'ritual');
    //   }
    // }
    context.childCharms = game.items.filter(charm => charm.type === 'charm' && charm.system.parentitemid === itemData._id);

    let lunarForms = {
      '': 'Ex3.None'
    }
    for (const lunarForm of game.actors.filter(actor => actor.type === 'npc' && actor.system.lunarform.enabled)) {
      lunarForms[lunarForm.id] = lunarForm.name;
    }
    context.lunarForms = lunarForms;
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

    if (itemData.system.upgrades) {
      context.upgradeSelects = Object.values(itemData.system.upgrades).reduce((acc, upgrade) => {
        acc[upgrade.id] = upgrade.name; // Key is `id`, value is `name`
        return acc;
      }, {});
    }

    if (itemData.system.modes) {
      context.itemModes = Object.values(itemData.system.modes.alternates).reduce((acc, upgrade) => {
        acc[upgrade.id] = upgrade.name; // Key is `id`, value is `name`
        return acc;
      }, {});
      context.itemModes[''] = itemData.system.modes.mainmode.name || "Main Mode";
    }

    if (itemData.effects) {
      context.activeEffectIds = itemData.effects.reduce((acc, effect) => {
        acc[effect._id] = effect.name; // Key is `id`, value is `name`
        return acc;
      }, {});
    }

    if (itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'customability') {
      this._prepareTraits(itemData.type, context.system.traits);
    }

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
      trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
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
      let triggerType = ev.currentTarget.dataset.type;
      if (triggerType) {
        const newList = this.item.system.triggers[triggerType];
        let listIndex = 0;
        let indexAdd = "0";
        for (const key of Object.keys(newList)) {
          if (key !== listIndex.toString()) {
            break;
          }
          listIndex++;
        }
        indexAdd = listIndex.toString();
        newList[indexAdd] = {
          name: "",
          triggerTime: "beforeRoll",
          actorType: '',
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

    html.find('.add-upgrade').click(ev => {
      const newList = this.item.system.upgrades;
      newList[Object.entries(newList).length] = {
        id: foundry.utils.randomID(16),
        name: "",
        active: false,
      };
      this.item.update({ [`system.upgrades`]: newList });
    });

    html.find('.delete-upgrade').click(ev => {
      var index = ev.currentTarget.dataset.index;
      this.item.update({
        [`system.upgrades.-=${index}`]: null,
      });
    });

    html.find('.edit-alternate-mode').click(async ev => {
      const functionType = ev.currentTarget.dataset.function;
      const index = ev.currentTarget.dataset.itemIndex;
      var currentAlternateData = null;

      if (functionType === 'edit') {
        currentAlternateData = this.object.system.modes.alternates[index];
      }

      const template = "systems/exaltedthird/templates/dialogues/edit-alternate-mode.html";
      const html = await renderTemplate(template, { name: currentAlternateData ? currentAlternateData.name : "New Alt Mode", system: currentAlternateData ? currentAlternateData : this.item.system, selects: CONFIG.exaltedthird.selects });

      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Ex3.Alternate"), resizable: true },
        content: html,
        classes: [this.item.getSheetBackground()],
        buttons: [{
          action: "choice",
          label: game.i18n.localize("Ex3.Save"),
          default: true,
          callback: (event, button, dialog) => button.form.elements
        }, {
          action: "cancel",
          label: game.i18n.localize("Ex3.Cancel"),
          callback: (event, button, dialog) => false
        }],
        submit: result => {
          if (result) {
            const alternateData = {
              id: currentAlternateData?.id || foundry.utils.randomID(16),
              name: result.name.value,
              summary: result.summary.value,
              type: result.type.value,
              duration: result.duration.value,
              activatable: result.activatable.checked,
              endtrigger: result.endtrigger.value,
              costdisplay: result.costdisplay.value,
              keywords: result.keywords.value,
              multiactivate: result.multiactivate.checked,
              autoaddtorolls: result.autoaddtorolls.value,
              cost: {
                motes: result['cost.motes'].value,
                commitmotes: result['cost.commitmotes'].value,
                initiative: result['cost.initiative'].value,
                anima: result['cost.anima'].value,
                willpower: result['cost.willpower'].value,
                grapplecontrol: result['cost.grapplecontrol'].value,
                health: result['cost.health'].value,
                healthtype: result['cost.healthtype'].value,
                penumbra: result['cost.penumbra'].value,
                aura: result['cost.aura'].value,
                xp: result['cost.xp'].value,
                silverxp: result['cost.silverxp'].value,
                goldxp: result['cost.goldxp'].value,
                whitexp: result['cost.whitexp'].value,
              },
              restore: {
                motes: result['restore.motes'].value,
                willpower: result['restore.willpower'].value,
                anima: result['restore.anima'].value,
                health: result['restore.health'].value,
                initiative: result['restore.initiative'].value,
                grapplecontrol: result['restore.grapplecontrol'].value
              }
            };
            if (!alternateData.name) {
              ui.notifications.error(`New alternate requires name.`)
              return;
            }

            let formData = {};

            let items = this.object?.system.modes.alternates;
            if (!items) {
              items = [];
            }
            if (items.length === 0) {
              formData = {
                system: {
                  modes: {
                    mainmode: {
                      summary: this.object.system.summary,
                      duration: this.object.system.duration,
                      activatable: this.object.system.duration,
                      endtrigger: this.object.system.endtrigger,
                      cost: {
                        motes: this.object.system['cost.motes'],
                        commitmotes: this.object.system['cost.commitmotes'],
                        initiative: this.object.system['cost.initiative'],
                        anima: this.object.system['cost.anima'],
                        willpower: this.object.system['cost.willpower'],
                        grapplecontrol: this.object.system['cost.grapplecontrol'],
                        healthtype: this.object.system['cost.healthtype'],
                        aura: this.object.system['cost.aura'],
                        xp: this.object.system['cost.xp'],
                        silverxp: this.object.system['cost.silverxp'],
                        goldxp: this.object.system['cost.goldxp'],
                        whitexp: this.object.system['cost.whitexp'],
                      },
                      restore: {
                        motes: this.object.system['cost.motes'],
                        willpower: this.object.system['cost.willpower'],
                        health: this.object.system['cost.health'],
                        initiative: this.object.system['cost.initiative'],
                      }
                    }
                  }
                }
              };
            }
            if (items.map(item => item.alternateName).includes(alternateData.name)) {
              ui.notifications.error(`An alternate mode with this name already exists.`)
              return;
            }

            if (index) {
              items[index] = alternateData;
            } else {
              items.push(alternateData);
            }

            foundry.utils.setProperty(formData, `system.modes.alternates`, items);

            this.object.update(formData);

          }
        }
      }).render({ force: true });
    });

    html.find('.delete-alternate').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      let formData = {};

      const index = ev.currentTarget.dataset.itemIndex;
      const items = this.object.system.modes.alternates;
      items.splice(index, 1);
      foundry.utils.setProperty(formData, `system.modes.alternates`, items);
      this.object.update(formData);
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
      for (const key of Object.keys(newList)) {
        if (key !== listIndex.toString()) {
          break;
        }
        listIndex++;
      }
      indexAdd = listIndex.toString();
      if (subType === 'bonuses') {
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
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Ex3.ReadMe"), resizable: true },
        content: '<div><p><a href="https://github.com/Aliharu/Foundry-Ex3/wiki/Dice-Roll-Triggers">Instructions and Syntax.</a></p></div>',
        buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
        classes: [`${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      }).render(true);
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
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Ex3.Keywords"), resizable: true },
        content: html,
        position: {
          height: 1000, width: 1000,
        },
        buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
        classes: ['exaltedthird-dialog', `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      }).render(true);
    });

    html.find(".formula-help").click(async ev => {
      const html = await renderTemplate("systems/exaltedthird/templates/dialogues/formula-dialogue.html");
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Ex3.Formulas"), resizable: true },
        content: html,
        buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
        classes: ['exaltedthird-dialog', `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      }).render(true);
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
        foundry.utils.setProperty(formData, `system.archetype.charmprerequisites`, items);
        this.object.update(formData);
      }
      else {
        const items = this.object.system.charmprerequisites;
        items.splice(itemIndex, 1);
        foundry.utils.setProperty(formData, `system.charmprerequisites`, items);
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
        callbacks: { drop: this._onDrop.bind(this), dragstart: this._onDrag.bind(this) },
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

  async _onDrop(event) {
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (data.type === "Item") return this._onDropItem(event, data);
      if (data.type === "ActiveEffect") return this._onDropActiveEffect(event, data);
    } catch (err) {
      return false;
    }
  }

  async _onDrag(event) {
    const li = event.currentTarget;
    if ( "link" in event.target.dataset ) return;

    // Create drag data
    let dragData;

    // Active Effect
    if ( li.dataset.effectId ) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  async _onDropItem(event, data) {
    const obj = this.object;
    const li = event.currentTarget;

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

    let newItem = {
      id: itemObject.id,
      name: itemObject.name,
      pack: data.pack,
      count: 1,
    };

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
        items.forEach(item => {
          if (item.id === newItem.id) {
            if (!item.count) {
              item.count = 1;
            }
            item.count += 1;
          }
        });
      } else {
        switch (itemObject.type) {
          case "charm": {
            items.push(newItem);
            break;
          }
          default: {
            return;
          }
        }
      }



      let formData = {};
      foundry.utils.setProperty(formData, `system${otherTabactive ? '.archetype' : ''}.charmprerequisites`, items);

      obj.update(formData);
    }
  }
  async _onDropActiveEffect(event, data) {
    const effect = await ActiveEffect.implementation.fromDropData(data);
    if ( !this.item.isOwner || !effect
      || (this.item.uuid === effect.parent?.uuid)
      || (this.item.uuid === effect.origin) ) return false;
    const effectData = effect.toObject();
    const options = { parent: this.item, keepOrigin: false };

    return ActiveEffect.create(effectData, options);
  }
}

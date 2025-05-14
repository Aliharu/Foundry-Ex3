import TraitSelector from "../apps/trait-selector.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";
import { toggleDisplay } from "../utils/utils.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ExaltedThirdItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

  constructor(...args) {
    super(...args);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    window: {
      title: "Item Sheet",
      resizable: true,
      controls: [
        {
          icon: 'fa-solid fa-gear-code',
          label: "Ex3.Macros",
          action: "openMacroDialog",
        },
      ]
    },
    position: { width: 520, height: 480 },
    classes: ["tree-background", "exaltedthird", "sheet", "item"],
    actions: {
      onEditImage: this._onEditImage,
      openMacroDialog: this.openMacroDialog,
      editTraits: this.editTraits,
      effectControl: this.effectControl,
      toggleField: this.toggleField,
      triggerAction: this.triggerAction,
      triggerSubItemAction: this.triggerSubItemAction,
      upgradeAction: this.upgradeAction,
      alternateAction: this.alternateAction,
      showDialog: this.showDialog,
      showEmbeddedItem: this.showEmbeddedItem,
      deleteEmbeddedItem: this.deleteEmbeddedItem,
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
  };

  static PARTS = {
    header: {
      template: "systems/exaltedthird/templates/item/item-header.html",
    },
    tabs: { template: 'systems/exaltedthird/templates/dialogues/tabs.html' },
    description: { template: 'systems/exaltedthird/templates/item/description-tab.html' },
    cost: { template: 'systems/exaltedthird/templates/item/cost-tab.html' },
    bonuses: { template: 'systems/exaltedthird/templates/item/dice-bonuses-tab.html' },
    automations: { template: 'systems/exaltedthird/templates/item/automations-tab.html' },
    upgrades: { template: 'systems/exaltedthird/templates/item/charm-upgrades-tab.html' },
    actionDetails: { template: 'systems/exaltedthird/templates/item/details/action-details-tab.html' },
    armorDetails: { template: 'systems/exaltedthird/templates/item/details/armor-details-tab.html' },
    charmDetails: { template: 'systems/exaltedthird/templates/item/details/charm-details-tab.html' },
    itemDetails: { template: 'systems/exaltedthird/templates/item/details/item-details-tab.html' },
    meritDetails: { template: 'systems/exaltedthird/templates/item/details/merit-details-tab.html' },
    ritualDetails: { template: 'systems/exaltedthird/templates/item/details/ritual-details-tab.html' },
    shapeDetails: { template: 'systems/exaltedthird/templates/item/details/shape-details-tab.html' },
    specialAbilityDetails: { template: 'systems/exaltedthird/templates/item/details/specialability-details-tab.html' },
    spellDetails: { template: 'systems/exaltedthird/templates/item/details/spell-details-tab.html' },
    weaponDetails: { template: 'systems/exaltedthird/templates/item/details/weapon-details-tab.html' },
  };

  _initializeApplicationOptions(options) {
    options.classes = [options.document.getSheetBackground(), "exaltedthird", "sheet", "item"];
    return super._initializeApplicationOptions(options);
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    if (options.position && ['charm', 'spell', 'merit', 'specialability', 'item', 'weapon'].includes(this.document.type)) {
      options.position.width = 615;
      options.position.height = 850;
    }

    options.parts = ['header', 'tabs', 'description', 'automations'];
    // // Control which parts show based on document subtype
    switch (this.document.type) {
      case 'charm':
        options.parts.push('cost', 'bonuses', 'upgrades', 'charmDetails');
        break;
      case 'action':
        options.parts.push('actionDetails');
        break;
      case 'armor':
        options.parts.push('armorDetails');
        break;
      case 'item':
        options.parts.push('itemDetails');
        break;
      case 'merit':
        options.parts.push('meritDetails');
        break;
      case 'ritual':
        options.parts.push('ritualDetails');
        break;
      case 'shape':
        options.parts.push('shapeDetails');
        break;
      case 'specialability':
        options.parts.push('specialAbilityDetails');
        break;
      case 'spell':
        options.parts.push('spellDetails');
        break;
      case 'weapon':
        options.parts.push('weaponDetails');
        break;
    }
  }

  get title() {
    return `${game.i18n.localize(this.item.name)}`
  }

  static async openMacroDialog() {
    const template = "systems/exaltedthird/templates/dialogues/charm-macros.html";
    const html = await foundry.applications.handlebars.renderTemplate(template, { 'prerollmacro': this.item.system.prerollmacro, 'macro': this.item.system.macro, 'damagemacro': this.item.system.damagemacro, });

    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("Ex3.Macros"), },
      position: { width: 520, height: 'auto' },
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

  async _prepareContext(options) {
    const itemData = this.item.toObject(false);

    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      // Add the item document.
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      type: this.item.type,
      // Adding a pointer to CONFIG.BOILERPLATE
      config: CONFIG.EXALTEDTHIRD,
      useShieldInitiative: game.settings.get("exaltedthird", "useShieldInitiative"),
      simplifiedCrafting: game.settings.get("exaltedthird", "simplifiedCrafting"),
      // You can factor out context construction to helper functions
      tabs: this._getTabs(options.parts),

      // Moved properties
      attributeList: CONFIG.exaltedthird.attributes,
      charmAbilityList: JSON.parse(JSON.stringify(CONFIG.exaltedthird.charmabilities)),
      charmAbilityListSectioned: JSON.parse(JSON.stringify(CONFIG.exaltedthird.charmAbilitiesSectioned)),
      abilityList: (() => {
        const list = JSON.parse(JSON.stringify(CONFIG.exaltedthird.abilities));
        list[''] = "Ex3.None";
        return list;
      })(),
      charmExaltType: JSON.parse(JSON.stringify(CONFIG.exaltedthird.exaltcharmtypes)),
      parentItemList: {
        '': 'Ex3.None'
      },
      showParentItemList: false,
      selects: CONFIG.exaltedthird.selects,
      itemModes: {},
      upgradeSelects: {},
      activeEffectIds: {},
      bonusTypes: CONFIG.exaltedthird.bonusTypes,
      triggerBonusDropdowns: CONFIG.exaltedthird.triggerBonusDropdowns,
      requirementTypes: CONFIG.exaltedthird.requirementTypes,
      formulaKeyPlaceholder: this.item.name.replace(/\s/g, '').toLowerCase(),
      classifications: CONFIG.exaltedthird.classifications,
      attributes: CONFIG.exaltedthird.attributes,
      abilities: CONFIG.exaltedthird.abilities,
      traitHeader: itemData.type === 'armor' || itemData.type === 'weapon',
      hasDiceTriggers: ['charm', 'spell', 'merit', 'specialability', 'item', 'weapon'].includes(itemData.type),
      hasCustomModifier: ['charm', 'spell', 'customability', 'item', 'merit', 'specialability', 'weapon', 'armor'].includes(itemData.type),
    };

    if (itemData.type === 'charm') {
      if (itemData.system.charmtype === 'evocation') {
        for (const evocation of game.items.filter(item => (item.type === 'weapon' || item.type === 'armor' || item.type === 'item') && item.system.hasevocations).sort((a, b) => a.name.localeCompare(b.name))) {
          context.parentItemList[evocation.id] = evocation.name;
        }
        context.showParentItemList = true;
      }
      if (itemData.system.charmtype === 'martialarts') {
        for (const martialArt of game.items.filter(item => item.type === 'customability' && item.system.abilitytype === 'martialart').sort((a, b) => a.name.localeCompare(b.name))) {
          context.parentItemList[martialArt.id] = martialArt.name;
        }
        context.showParentItemList = true;
      }
    }
    context.childCharms = game.items.filter(charm => charm.type === 'charm' && charm.system.parentitemid === itemData._id);

    let lunarForms = {
      '': 'Ex3.None'
    }
    for (const lunarForm of game.actors.filter(actor => actor.type === 'npc' && actor.system.lunarform.enabled)) {
      lunarForms[lunarForm.id] = lunarForm.name;
    }
    context.lunarForms = lunarForms;
    if (this.item?.parent) {
      for (const customAbility of this.item.parent.customabilities) {
        context.abilityList[customAbility._id] = customAbility.name;
        context.charmAbilityList[customAbility._id] = customAbility.name;
        context.charmAbilityListSectioned.custom.entries[customAbility._id] = customAbility.name;
      }
    }

    context.rollData = {};
    let actor = this.item?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      {
        secrets: this.document.isOwner,
        relativeTo: this.item,
      }
    );

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

  /** @override */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
    this._setupButtons(this.element);
  }

  async _preparePartContext(partId, context) {
    context.tab = context.tabs.find(item => item.partId === partId);
    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabs = [];
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'description';
    for (const part of parts) {
      const tab = {
        cssClass: this.tabGroups['primary'] === 'charms' ? 'active' : '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: '',
      };
      switch (part) {
        case 'description':
          tab.id = 'description';
          tab.partId = 'description';
          tab.label += 'Description';
          tab.cssClass = this.tabGroups['primary'] === 'description' ? 'active' : '';
          break;
        case 'cost':
          tab.id = 'cost';
          tab.partId = 'cost';
          tab.label += 'Cost';
          tab.cssClass = this.tabGroups['primary'] === 'cost' ? 'active' : '';
          break;
        case 'bonuses':
          tab.id = 'bonuses';
          tab.label += 'Bonuses';
          tab.cssClass = this.tabGroups['primary'] === 'bonuses' ? 'active' : '';
          break;
        case 'automations':
          tab.id = 'automations';
          tab.partId = 'automations';
          tab.label += 'Automations';
          tab.cssClass = this.tabGroups['primary'] === 'automations' ? 'active' : '';
          break;
        case 'upgrades':
          tab.id = 'upgrades';
          tab.partId = 'upgrades';
          tab.label += 'Upgrades';
          tab.cssClass = this.tabGroups['primary'] === 'upgrades' ? 'active' : '';
          break;
        case 'armorDetails':
        case 'actionDetails':
        case 'charmDetails':
        case 'itemDetails':
        case 'meritDetails':
        case 'ritualDetails':
        case 'specialAbilityDetails':
        case 'spellDetails':
        case 'weaponDetails':
          tab.id = 'details';
          tab.partId = part;
          tab.label += 'Details';
          tab.cssClass = this.tabGroups['primary'] === 'details' ? 'active' : '';
          break;
      }
      if (tab.id) {
        tabs.push(tab);
      }
    }

    return tabs;
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


  _setupButtons(element) {
    const itemData = foundry.utils.duplicate(this.item);
    // Highlight non-charm dice
    element.querySelectorAll('.non-charm-dice').forEach(el => {
      if (itemData.system.diceroller.settings.noncharmdice) {
        el.style.color = '#F9B516';
      }
    });

    // Highlight non-charm successes
    element.querySelectorAll('.non-charm-successes').forEach(el => {
      if (itemData.system.diceroller.settings.noncharmsuccesses) {
        el.style.color = '#F9B516';
      }
    });

    // Highlight cap-breaking willpower
    element.querySelectorAll('.cap-breaking-willpower').forEach(el => {
      if (itemData.system.restore.willpoweriscapbreaking) {
        el.style.color = '#F9B516';
      }
    });
  }

  /**
 * Handle changing a Document's image.
 *
 * @param {PointerEvent} event   The originating click event
 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
 * @returns {Promise}
 * @protected
 */
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } =
      this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new foundry.applications.apps.FilePicker.implementation({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  static editTraits(event, target) {
    event.preventDefault();
    const a = target;
    const choices = CONFIG.exaltedthird[a.dataset.options];
    const options = { name: a.dataset.target, choices };
    return new TraitSelector(this.item, options).render(true);
  }

  static effectControl(event, target) {
    onManageActiveEffect(target, this.item);
  }

  static toggleField(event, target) {
    const fieldName = target.dataset.name;

    let settingKey, path, currentValue;

    if (fieldName === 'nonCharmDice') {
      settingKey = 'noncharmdice';
      path = 'system.diceroller.settings';
      currentValue = this.item.system.diceroller.settings.noncharmdice;
    } else if (fieldName === 'nonCharmSuccesses') {
      settingKey = 'noncharmsuccesses';
      path = 'system.diceroller.settings';
      currentValue = this.item.system.diceroller.settings.noncharmsuccesses;
    } else if (fieldName === 'capBreakingWP') {
      settingKey = 'willpoweriscapbreaking';
      path = 'system.restore';
      currentValue = this.item.system.restore.willpoweriscapbreaking;
    }

    if (settingKey && path) {
      this.item.update({
        [`${path}.${settingKey}`]: !currentValue,
      });
    }
  }

  static triggerAction(event, target) {
    const actionType = target.dataset.actiontype;
    const triggerType = target.dataset.type;

    if (actionType === 'add') {
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
          requirementMode: '',
          bonuses: {},
          requirements: {}
        };
        this.item.update({ [`system.triggers.${triggerType}`]: newList });
      }
    }
    if (actionType === 'delete') {
      let index = target.dataset.index;
      this.item.update({
        [`system.triggers.${triggerType}.-=${index}`]: null,
      });
    }
  }

  static triggerSubItemAction(event, target) {
    let functionType = target.dataset.functiontype;
    let triggerType = target.dataset.type;
    let index = target.dataset.index;
    let subType = target.dataset.subtype;
    let subindex = target.dataset.subindex;

    if (functionType === 'add') {
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
    }
    if (functionType === 'delete') {
      this.item.update({
        [`system.triggers.${triggerType}.${index}.${subType}.-=${subindex}`]: null,
      });
    }
  }

  static upgradeAction(event, target) {
    const actionType = target.dataset.actiontype;
    if (actionType === 'add') {
      const newList = this.item.system.upgrades;
      newList[Object.entries(newList).length] = {
        id: foundry.utils.randomID(16),
        name: "",
        active: false,
      };
      this.item.update({ [`system.upgrades`]: newList });
    }
    if (actionType === 'delete') {
      let index = target.dataset.index;
      this.item.update({
        [`system.upgrades.-=${index}`]: null,
      });
    }
  }

  static async alternateAction(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const functionType = target.dataset.function;
    const index = target.dataset.itemIndex;

    let currentAlternateData = null;

    if (functionType === 'add' || functionType === 'edit') {
      if (functionType === 'edit') {
        currentAlternateData = this.item.system.modes.alternates[index];
      }

      const template = "systems/exaltedthird/templates/dialogues/edit-alternate-mode.html";
      const html = await foundry.applications.handlebars.renderTemplate(template, { name: currentAlternateData ? currentAlternateData.name : "New Alt Mode", system: currentAlternateData ? currentAlternateData : this.item.system, selects: CONFIG.exaltedthird.selects });

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
                willpoweriscapbreaking: result['restore.willpoweriscapbreaking'].checked,
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

            let items = this.item?.system.modes.alternates;
            if (!items) {
              items = [];
            }
            if (items.length === 0) {
              formData = {
                system: {
                  modes: {
                    mainmode: {
                      type: this.item.system.type,
                      summary: this.item.system.summary,
                      duration: this.item.system.duration,
                      activatable: this.item.system.activatable,
                      multiactivate: this.item.system.multiactivate,
                      endtrigger: this.item.system.endtrigger,
                      costdisplay: this.item.system.costdisplay,
                      keywords: this.item.system.keywords,
                      cost: {
                        motes: this.item.system['cost.motes'],
                        commitmotes: this.item.system['cost.commitmotes'],
                        initiative: this.item.system['cost.initiative'],
                        anima: this.item.system['cost.anima'],
                        penumbra: this.item.system['cost.penumbra'],
                        willpower: this.item.system['cost.willpower'],
                        aura: this.item.system['cost.aura'],
                        grapplecontrol: this.item.system['cost.grapplecontrol'],
                        healthtype: this.item.system['cost.healthtype'],
                        xp: this.item.system['cost.xp'],
                        silverxp: this.item.system['cost.silverxp'],
                        goldxp: this.item.system['cost.goldxp'],
                        whitexp: this.item.system['cost.whitexp'],
                      },
                      restore: {
                        motes: this.item.system['restore.motes'],
                        willpower: this.item.system['restore.willpower'],
                        anima: this.item.system['restore.anima'],
                        health: this.item.system['restore.health'],
                        initiative: this.item.system['restore.initiative'],
                        grapplecontrol: this.item.system['restore.grapplecontrol'],
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

            this.item.update(formData);

          }
        }
      }).render({ force: true });
    }
    if (functionType === 'delete') {
      let formData = {};
      const items = this.item.system.modes.alternates;
      items.splice(index, 1);
      foundry.utils.setProperty(formData, `system.modes.alternates`, items);
      this.item.update(formData);
    }
  }

  static async showDialog(event, target) {
    const dialogType = target.dataset.dialogtype;
    if (dialogType === 'showTriggersLink') {
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Ex3.ReadMe"), resizable: true },
        content: '<div><p><a href="https://github.com/Aliharu/Foundry-Ex3/wiki/Dice-Roll-Triggers">Instructions and Syntax.</a></p></div>',
        buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
        classes: [`${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      }).render(true);
    }
    if (dialogType === 'charmCheatSheet') {
      const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/dialogues/charms-dialogue.html");
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Ex3.Keywords"), resizable: true },
        content: html,
        position: {
          height: 1000, width: 1000,
        },
        buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
        classes: ['exaltedthird-dialog', `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      }).render(true);
    }
    if (dialogType === 'formulaHelp') {
      const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/dialogues/formula-dialogue.html");
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Ex3.Formulas"), resizable: true },
        content: html,
        buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
        classes: ['exaltedthird-dialog', `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
      }).render(true);
    }
  }

  // Embeded Item code taken and modified from the Star Wars FFG FoundryVTT module
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  // SOFTWARE.

  static async showEmbeddedItem(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const li = target;
    let itemType = li.dataset.itemName;
    let itemIndex = li.dataset.itemIndex;
    let embededItem;

    if (li.dataset.type === 'archetype') {
      embededItem = this.item.system.archetype.charmprerequisites[itemIndex];
    }
    else {
      embededItem = this.item.system.charmprerequisites[itemIndex];
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
  }

  static deleteEmbeddedItem(event, target) {
    event.preventDefault();
    event.stopPropagation();
    let formData = {};

    const li = target;
    const parent = li.parentElement;
    const itemIndex = parent.dataset.itemIndex;

    if (target.dataset?.type === 'archetype') {
      const items = this.item.system.archetype.charmprerequisites;
      items.splice(itemIndex, 1);
      foundry.utils.setProperty(formData, `system.archetype.charmprerequisites`, items);
      this.item.update(formData);
    }
    else {
      const items = this.item.system.charmprerequisites;
      items.splice(itemIndex, 1);
      foundry.utils.setProperty(formData, `system.charmprerequisites`, items);
      this.item.update(formData);
    }
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

  async _onDrag(event) {
    const li = event.currentTarget;
    if ("link" in event.target.dataset) return;

    // Create drag data
    let dragData;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  async _onDropItem(event, data) {
    const obj = this.item;
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
      const detailsTabactive = this.tabGroups.primary === 'details';
      let items = obj?.system.charmprerequisites;
      if (detailsTabactive) {
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
      foundry.utils.setProperty(formData, `system${detailsTabactive ? '.archetype' : ''}.charmprerequisites`, items);

      obj.update(formData);
    }
  }

  async _onDropActiveEffect(event, data) {
    const effect = await ActiveEffect.implementation.fromDropData(data);
    if (!this.item.isOwner || !effect
      || (this.item.uuid === effect.parent?.uuid)
      || (this.item.uuid === effect.origin)) return false;
    const effectData = effect.toObject();
    const options = { parent: this.item, keepOrigin: false };

    return ActiveEffect.create(effectData, options);
  }

    /**
   *
   * DragDrop
   *
   */

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ('link' in event.target.dataset) return;

    let dragData = null;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) {}

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call('dropItemSheetData', item, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Actor':
        return this._onDropActor(event, data);
      case 'Item':
        return this._onDropItem(event, data);
      case 'Folder':
        return this._onDropFolder(event, data);
    }
  }

  /**
   * Sorts an Active Effect based on its surrounding attributes
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  _onEffectSort(event, effect) {
    const effects = this.item.effects;
    const dropTarget = event.target.closest('[data-effect-id]');
    if (!dropTarget) return;
    const target = effects.get(dropTarget.dataset.effectId);

    // Don't sort on yourself
    if (effect.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      if (siblingId && siblingId !== effect.id)
        siblings.push(effects.get(el.dataset.effectId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.item.updateEmbeddedDocuments('ActiveEffect', updateData);
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.item.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.item.isOwner) return [];
  }

  /** The following pieces set up drag handling and are unlikely to need modification  */

  /**
   * Returns an array of DragDrop instances
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

  /**
   * Create drag-and-drop workflow handlers for this Application
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new foundry.applications.ux.DragDrop.implementation(d);
    });
  }
}

import TraitSelector from "../apps/trait-selector.js";
import { animaTokenMagic, RollForm } from "../apps/dice-roller.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";
import Importer from "../apps/importer.js";
import { prepareItemTraits } from "../item/item.js";
import { addDefensePenalty, subtractDefensePenalty, spendEmbeddedItem } from "./actor.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ExaltedThirdActorSheet extends ActorSheet {

  constructor(...args) {
    super(...args);

    this._filters = {
      effects: new Set()
    }
    if (this.object.type === "character") {
      this.options.width = this.position.width = game.settings.get("exaltedthird", "compactSheets") ? 560 : 800;
      this.options.height = this.position.height = game.settings.get("exaltedthird", "compactSheets") ? 620 : 1061;
    }
    if (this.object.type === "npc") {
      this.position.width = this.position.width = game.settings.get("exaltedthird", "compactSheetsNPC") ? 560 : 800;
      this.position.height = this.position.height = game.settings.get("exaltedthird", "compactSheetsNPC") ? 620 : 1061;
    }
    this.options.classes = [...this.options.classes, this.getTypeSpecificCSSClasses()];
  }

  /**
 * Get the correct HTML template path to use for rendering this particular sheet
 * @type {String}
 */
  get template() {
    if (this.actor.type === "npc") return "systems/exaltedthird/templates/actor/npc-sheet.html";
    return "systems/exaltedthird/templates/actor/actor-sheet.html";
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["exaltedthird", "sheet", "actor"],
      template: "systems/exaltedthird/templates/actor/actor-sheet.html",
      width: 800,
      height: 1061,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  getTypeSpecificCSSClasses() {
    if (this.actor.system.settings.sheetbackground === 'default') {
      return `${game.settings.get("exaltedthird", "sheetStyle")}-background`;
    }
    return `${this.actor.system.settings.sheetbackground}-background`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = await super.getData();
    context.dtypes = ["String", "Number", "Boolean"];

    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.biographyHTML = await TextEditor.enrichHTML(context.system.biography, {
      secrets: this.document.isOwner,
      async: true
    });
    context.attributeList = CONFIG.exaltedthird.attributes;
    context.abilityList = CONFIG.exaltedthird.abilities;
    context.rollData = context.actor.getRollData();
    context.showFullAttackButtons = game.settings.get("exaltedthird", "showFullAttacks");
    context.useShieldInitiative = game.settings.get("exaltedthird", "useShieldInitiative");
    context.availableCastes = []
    context.availableCastes = CONFIG.exaltedthird.castes[context.system.details.exalt];
    context.characterLunars = game.actors.filter(actor => actor.system.details.exalt === 'lunar' && actor.id !== context.actor.id).map((actor) => {
      return {
        id: actor.id,
        label: actor.name
      }
    })
    this._prepareTraits(context.system.traits);
    // this._prepareActorSheetData(context);
    this._prepareCharacterItems(context);
    if (context.actor.type === 'character') {
      this._prepareCharacterData(context);
    }
    if (context.actor.type === 'npc') {
      this._prepareNPCData(context);
    }
    context.itemDescriptions = {};
    for (let item of this.actor.items) {
      context.itemDescriptions[item.id] = await TextEditor.enrichHTML(item.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: item });
    }

    context.effects = prepareActiveEffectCategories(this.document.effects);
    return context;
  }

  // _prepareActorSheetData(sheetData) {
  //   const actorData = sheetData.actor;
  // }

  _prepareCharacterData(sheetData) {
    const actorData = sheetData.actor;
    var pointsAvailableMap = {
      primary: 8,
      secondary: 6,
      tertiary: 4,
    }
    if (sheetData.system.details.exalt === 'lunar') {
      pointsAvailableMap = {
        primary: 9,
        secondary: 7,
        tertiary: 5,
      }
    }
    if (sheetData.system.details.exalt === 'mortal') {
      pointsAvailableMap = {
        primary: 6,
        secondary: 4,
        tertiary: 3,
      }
    }
    sheetData.system.charcreation.available = {
      attributes: {
        physical: pointsAvailableMap[sheetData.system.charcreation.physical],
        social: pointsAvailableMap[sheetData.system.charcreation.social],
        mental: pointsAvailableMap[sheetData.system.charcreation.mental],
      },
      abilities: 28,
      bonuspoints: 15,
      charms: 15,
      specialties: 4,
      merits: 10,
      intimacies: 4,
      willpower: 5,
    }
    if (sheetData.system.details.exalt === 'solar' || sheetData.system.details.exalt === 'lunar') {
      if (sheetData.system.essence.value >= 2) {
        sheetData.system.charcreation.available.charms = 20;
        sheetData.system.charcreation.available.merits = 13;
        sheetData.system.charcreation.available.bonuspoints = 18;
      }
    }
    if (sheetData.system.details.exalt === 'lunar') {
      if (sheetData.system.essence.value >= 2) {
        sheetData.system.charcreation.available.charms = 20;
        sheetData.system.charcreation.available.merits = 13;
        sheetData.system.charcreation.available.bonuspoints = 18;
      }
    }
    if (sheetData.system.details.exalt === 'dragonblooded') {
      sheetData.system.charcreation.available = {
        attributes: {
          physical: pointsAvailableMap[sheetData.system.charcreation.physical],
          social: pointsAvailableMap[sheetData.system.charcreation.social],
          mental: pointsAvailableMap[sheetData.system.charcreation.mental],
        },
        abilities: 28,
        bonuspoints: 18,
        charms: 20,
        specialties: 3,
        merits: 18,
        intimacies: 4,
        willpower: 5,
      }
      if (sheetData.system.essence.value === 1) {
        sheetData.system.charcreation.available.charms = 15;
        sheetData.system.charcreation.available.merits = 10;
        sheetData.system.charcreation.available.bonuspoints = 15;
      }
    }
    if (sheetData.system.details.exalt === 'sidereal') {
      if (sheetData.system.essence.value >= 2) {
        sheetData.system.charcreation.available.charms = 20;
        sheetData.system.charcreation.available.merits = 13;
        sheetData.system.charcreation.available.bonuspoints = 18;
      }
    }
    if (sheetData.system.details.exalt === 'mortal') {
      sheetData.system.charcreation.available = {
        attributes: {
          physical: pointsAvailableMap[sheetData.system.charcreation.physical],
          social: pointsAvailableMap[sheetData.system.charcreation.social],
          mental: pointsAvailableMap[sheetData.system.charcreation.mental],
        },
        abilities: 28,
        bonuspoints: 21,
        charms: 0,
        specialties: 4,
        merits: 7,
        intimacies: 4,
        willpower: 3,
      }
    }
    sheetData.system.charcreation.spent = {
      attributes: {
        physical: 0,
        social: 0,
        mental: 0,
      },
      abilities: 0,
      bonuspoints: 0,
      charms: 0,
      specialties: 0,
      merits: 0,
      abovethree: 0,
      intimacies: 0,
    }
    for (let attr of Object.values(sheetData.system.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
      sheetData.system.charcreation.spent.attributes[attr.type] += (attr.value - 1);
    }
    for (let name of Object.keys(sheetData.system.charcreation.spent.attributes)) {
      if (sheetData.system.charcreation[name] === 'tertiary' || sheetData.system.details.exalt === 'lunar') {
        sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, sheetData.system.charcreation.spent.attributes[name] - sheetData.system.charcreation.available.attributes[name]) * 3);
      }
      else {
        sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, sheetData.system.charcreation.spent.attributes[name] - sheetData.system.charcreation.available.attributes[name]) * 4);
      }
    }
    var threeOrBelow = 0;
    for (let attr of Object.values(sheetData.system.abilities)) {
      attr.isCheckbox = attr.dtype === "Boolean";
      sheetData.system.charcreation.spent.abovethree += Math.max(0, (attr.value - 3));
      if (attr.favored) {
        sheetData.system.charcreation.spent.bonuspoints += Math.max(0, (attr.value - 3));
      }
      else {
        sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (attr.value - 3))) * 2;
      }
      threeOrBelow += Math.min(3, attr.value);
    }
    for (let customAbility of actorData.customabilities) {
      sheetData.system.charcreation.spent.abovethree += Math.max(0, (customAbility.system.points - 3));
      if (customAbility.system.favored) {
        sheetData.system.charcreation.spent.bonuspoints += Math.max(0, (customAbility.system.points - 3));
      }
      else {
        sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (customAbility.system.points - 3))) * 2;
      }
      threeOrBelow += Math.min(3, customAbility.system.points);
    }
    sheetData.system.charcreation.spent.abilities = threeOrBelow;
    if (sheetData.system.details.exalt === 'lunar') {
      sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (threeOrBelow - 28))) * 2;
    }
    else {
      sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (threeOrBelow - 28)));
    }
    sheetData.system.charcreation.spent.specialties = actorData.specialties.length;
    for (let merit of actorData.merits) {
      sheetData.system.charcreation.spent.merits += merit.system.points;
    }
    sheetData.system.charcreation.spent.charms = actorData.items.filter((item) => item.type === 'charm').length;
    sheetData.system.charcreation.spent.intimacies = actorData.items.filter((item) => item.type === 'intimacy').length;
    sheetData.system.charcreation.spent.charms += Math.max(0, actorData.items.filter((item) => item.type === 'spell').length - 1);
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.willpower.max - sheetData.system.charcreation.available.willpower))) * 2;
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.merits - sheetData.system.charcreation.available.merits)));
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.specialties - sheetData.system.charcreation.available.specialties)));
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.charms - sheetData.system.charcreation.available.charms))) * 4;
    sheetData.system.settings.usedotsvalues = !game.settings.get("exaltedthird", "compactSheets");
  }

  _prepareNPCData(sheetData) {
    sheetData.system.settings.usedotsvalues = !game.settings.get("exaltedthird", "compactSheetsNPC");
  }


  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const customAbilities = [];
    const weapons = [];
    const armor = [];
    const merits = [];
    const intimacies = [];
    const rituals = [];
    const martialarts = [];
    const crafts = [];
    const specialties = [];
    const specialAbilities = [];
    const craftProjects = [];
    const actions = [];
    const destinies = [];
    const shapes = [];
    const activeItems = [];

    const charms = {};
    const rollCharms = {};
    const defenseCharms = {};

    const siderealMaidenCharms = {
      archery: 'battles',
      athletics: 'endings',
      awareness: 'endings',
      brawl: 'battles',
      bureaucracy: 'endings',
      craft: 'serenity',
      dodge: 'serenity',
      integrity: 'endings',
      investigation: 'secrets',
      larceny: 'secrets',
      linguistics: 'serenity',
      lore: 'secrets',
      medicine: 'endings',
      melee: 'battles',
      occult: 'secrets',
      performance: 'serenity',
      presence: 'battles',
      resistance: 'journeys',
      ride: 'journeys',
      sail: 'journeys',
      socialize: 'serenity',
      stealth: 'secrets',
      survival: 'journeys',
      thrown: 'journeys',
      war: 'battles',
      battles: 'battles',
      journeys: 'journeys',
      secrets: 'secrets',
      serenity: 'serenity',
      endings: 'endings',
    }

    const spells = {
      terrestrial: { name: 'Ex3.Terrestrial', visible: false, list: [] },
      celestial: { name: 'Ex3.Celestial', visible: false, list: [] },
      solar: { name: 'Ex3.Solar', visible: false, list: [] },
      ivory: { name: 'Ex3.Ivory', visible: false, list: [] },
      shadow: { name: 'Ex3.Shadow', visible: false, list: [] },
      void: { name: 'Ex3.Void', visible: false, list: [] },
    }

    sheetData.system.maidencharms = {
      journeys: 0,
      serenity: 0,
      battles: 0,
      secrets: 0,
      endings: 0,
    }
    // Iterate through items, allocating to containers
    for (let i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'customability') {
        customAbilities.push(i);
      }
      else if (i.type === 'weapon') {
        prepareItemTraits('weapon', i);
        weapons.push(i);
      }
      else if (i.type === 'armor') {
        prepareItemTraits('armor', i);
        armor.push(i);
      }
      else if (i.type === 'merit') {
        merits.push(i);
      }
      else if (i.type === 'intimacy') {
        if (game.user.isGM || this.actor.isOwner || i.system.visible) {
          intimacies.push(i);
        }
      }
      else if (i.type === 'martialart') {
        martialarts.push(i);
      }
      else if (i.type === 'craft') {
        crafts.push(i);
      }
      else if (i.type === 'ritual') {
        rituals.push(i);
      }
      else if (i.type === 'specialty') {
        specialties.push(i);
      }
      else if (i.type === 'specialability') {
        specialAbilities.push(i);
      }
      else if (i.type === 'craftproject') {
        craftProjects.push(i);
      }
      else if (i.type === 'destiny') {
        destinies.push(i);
      }
      else if (i.type === 'shape') {
        shapes.push(i);
      }
      else if (i.type === 'spell') {
        if (i.system.circle !== undefined) {
          spells[i.system.circle].list.push(i);
          spells[i.system.circle].visible = true;
        }
      }
      else if (i.type === 'action') {
        actions.push(i);
      }
      if (i.system.active) {
        activeItems.push(i);
      }
    }

    let actorCharms = actorData.items.filter((item) => item.type === 'charm');
    actorCharms = actorCharms.sort(function (a, b) {
      const sortValueA = a.system.listingname.toLowerCase() || a.system.ability;
      const sortValueB = b.system.listingname.toLowerCase() || b.system.ability;
      return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
    });

    for (let i of actorCharms) {
      if (siderealMaidenCharms[i.system.ability]) {
        sheetData.system.maidencharms[siderealMaidenCharms[i.system.ability]]++;
      }
      if (i.system.diceroller.enabled) {
        if (i.system.listingname) {
          if (!rollCharms[i.system.listingname]) {
            rollCharms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
          }
          rollCharms[i.system.listingname].list.push(i);
        }
        else {
          if (!rollCharms[i.system.ability]) {
            rollCharms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [] };
          }
          rollCharms[i.system.ability].list.push(i);
        }
      }
      if (i.system.diceroller.opposedbonuses.enabled) {
        if (i.system.listingname) {
          if (!defenseCharms[i.system.listingname]) {
            defenseCharms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
          }
          defenseCharms[i.system.listingname].list.push(i);
        }
        else {
          if (!defenseCharms[i.system.ability]) {
            defenseCharms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [] };
          }
          defenseCharms[i.system.ability].list.push(i);
        }
      }
      if (i.system.listingname) {
        if (!charms[i.system.listingname]) {
          charms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
        }
        charms[i.system.listingname].list.push(i);
      }
      else {
        if (!charms[i.system.ability]) {
          charms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [] };
        }
        charms[i.system.ability].list.push(i);
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.customabilities = customAbilities;
    actorData.activeitems = activeItems;
    actorData.weapons = weapons;
    actorData.armor = armor;
    actorData.merits = merits;
    actorData.rituals = rituals;
    actorData.intimacies = intimacies;
    actorData.specialties = specialties;
    actorData.charms = charms;
    actorData.rollcharms = rollCharms;
    actorData.defensecharms = defenseCharms;
    actorData.spells = spells;
    actorData.specialabilities = specialAbilities;
    actorData.projects = craftProjects;
    actorData.actions = actions.sort((actionA, actionB) => actionA.name < actionB.name ? -1 : actionA.name > actionB.name ? 1 : 0);
    actorData.destinies = destinies;
    actorData.shapes = shapes;
  }

  /**
 * Prepare the data structure for traits data like languages
 * @param {object} traits   The raw traits data object from the actor data
 * @private
 */
  _prepareTraits(traits) {
    const map = {
      "languages": CONFIG.exaltedthird.languages,
      "resonance": CONFIG.exaltedthird.resonance,
      "dissonance": CONFIG.exaltedthird.dissonance,
    };
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

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Token Configuration
    const canConfigure = game.user.isGM || this.actor.isOwner;
    if (this.options.editable && canConfigure) {
      const settingsButton = {
        label: game.i18n.localize('Ex3.Settings'),
        class: 'sheet-settings',
        icon: 'fas fa-cog',
        onclick: () => this.sheetSettings(),
      };
      const helpButton = {
        label: game.i18n.localize('Ex3.Help'),
        class: 'help-dialogue',
        icon: 'fas fa-question',
        onclick: () => this.helpDialogue(this.actor.type),
      };
      buttons = [settingsButton, helpButton, ...buttons];
      const colorButton = {
        label: game.i18n.localize('Ex3.DotColors'),
        class: 'set-color',
        icon: 'fas fa-palette',
        onclick: (ev) => this.pickColor(ev),
      };
      buttons = [colorButton, ...buttons];
      const rollButton = {
        label: game.i18n.localize('Ex3.Roll'),
        class: 'roll-dice',
        icon: 'fas fa-dice-d10',
        onclick: (ev) => new RollForm(this.actor, { event: ev }, {}, { rollType: 'base' }).render(true),
      };
      buttons = [rollButton, ...buttons];
    }
    return buttons;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._setupDotCounters(html)
    this._setupSquareCounters(html)
    this._setupButtons(html)

    html.find('.item-row').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.trait-selector').click(this._onTraitSelector.bind(this));

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.resource-value > .resource-value-step').click(this._onDotCounterChange.bind(this))
    html.find('.resource-value > .resource-value-empty').click(this._onDotCounterEmpty.bind(this))
    html.find('.resource-counter > .resource-counter-step').click(this._onSquareCounterChange.bind(this))

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      ev.stopPropagation();
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    html.find('.item-favored').on('click', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const itemID = li.data('itemId');
      const item = this.actor.items.get(itemID);
      await this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemID,
          system: {
            favored: !item.system.favored,
          },
        }
      ]);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      let applyChanges = false;
      new Dialog({
        title: 'Delete?',
        content: 'Are you sure you want to delete this item?',
        buttons: {
          delete: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Delete',
            callback: () => applyChanges = true
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Cancel'
          },
        },
        default: "delete",
        close: html => {
          if (applyChanges) {
            const li = $(ev.currentTarget).parents(".item");
            this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
            li.slideUp(200, () => this.render(false));
          }
        }
      }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
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

    html.find('.exalt-xp').mousedown(ev => {
      this.showDialogue('exalt-xp');
    });

    html.find('.show-bonus-points').mousedown(ev => {
      this.showDialogue('bonus-points');
    });

    html.find('.show-weapon-tags').mousedown(ev => {
      this.showDialogue('weapons');
    });

    html.find('.show-armor-tags').mousedown(ev => {
      this.showDialogue('armor');
    });

    html.find('#calculate-health').mousedown(ev => {
      this.calculateHealth();
    });

    html.find('.rout-modifiers').mousedown(async ev => {
      this.showDialogue('rout');
    });

    html.find('.show-social').mousedown(ev => {
      this.showDialogue('social');
    });

    html.find('.show-combat').mousedown(ev => {
      this.showDialogue('combat');
    });

    html.find('.show-feats-of-strength').mousedown(ev => {
      this.showDialogue('feats-of-strength');
    });

    html.find('.show-advancement').mousedown(ev => {
      this.showDialogue('advancement');
    });

    html.find('.show-craft').mousedown(ev => {
      this.showDialogue('craft');
    });


    html.find('.set-pool-peripheral').mousedown(ev => {
      this.setSpendPool('peripheral');
    });


    html.find('.set-pool-personal').mousedown(ev => {
      this.setSpendPool('personal');
    });

    html.find('.calculate-personal-commit').mousedown(ev => {
      this.calculateCommitMotes('personal');
    });

    html.find('.calculate-peripheral-commit').mousedown(ev => {
      this.calculateCommitMotes('peripheral');
    });

    html.find('.calculate-motes').mousedown(ev => {
      this.calculateMotes();
    });

    html.find('.calculate-soak').mousedown(ev => {
      this.calculateDerivedStats('soak');
    });

    html.find('.calculate-natural-soak').mousedown(ev => {
      this.calculateDerivedStats('natural-soak');
    });

    html.find('.calculate-armored-soak').mousedown(ev => {
      this.calculateDerivedStats('armored-soak');
    });

    html.find('.calculate-parry').mousedown(ev => {
      this.calculateDerivedStats('parry');
    });

    html.find('.calculate-resonance').mousedown(ev => {
      this.calculateDerivedStats('resonance');
    });

    html.find('.calculate-evasion').mousedown(ev => {
      this.calculateDerivedStats('evasion');
    });

    html.find('.calculate-resolve').mousedown(ev => {
      this.calculateDerivedStats('resolve');
    });

    html.find('.calculate-guile').mousedown(ev => {
      this.calculateDerivedStats('guile');
    });

    html.find('#calculate-warstrider-health').mousedown(ev => {
      this.calculateHealth('warstrider');
    });

    html.find('#calculate-ship-health').mousedown(ev => {
      this.calculateHealth('ship');
    });

    html.find('#color-picker').mousedown(ev => {
      this.pickColor();
    });

    html.find('#healDamage').mousedown(ev => {
      this.recoverHealth();
    });

    html.find('#healDamageWarstrider').mousedown(ev => {
      this.recoverHealth('warstrider');
    });

    html.find('#healDamageShip').mousedown(ev => {
      this.recoverHealth('ship');
    });

    html.find('.add-defense-penalty').mousedown(ev => {
      addDefensePenalty(this.actor);
    });

    html.find('.add-onslaught-penalty').mousedown(ev => {
      addDefensePenalty(this.actor, 'Onslaught');
    });

    html.find('.subtract-defense-penalty').mousedown(ev => {
      subtractDefensePenalty(this.actor);
    });

    html.find('.subtract-onslaught-penalty').mousedown(ev => {
      subtractDefensePenalty(this.actor, 'Onslaught');
    });

    html.find('#rollDice').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'base' }).render(true);
    });

    html.find('.rollAbility').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability' }).render(true);
    });

    html.find('.roll-ability').mousedown(ev => {
      var ability = $(ev.target).attr("data-ability");
      if (ability === 'willpower') {
        if (this.actor.type === "npc") {
          game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'rout', pool: 'willpower' }).render(true);
        }
        else {
          game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', ability: 'willpower', attribute: 'none' }).render(true);
        }
      }
      else {
        const abilityObject = this.actor.system.abilities[ability];
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', ability: ability, attribute: abilityObject.prefattribute }).render(true);
      }
    });

    html.find('.roll-pool').mousedown(ev => {
      var pool = $(ev.target).attr("data-pool");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', pool: pool }).render(true);
    });

    html.find('.roll-action').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', pool: item.id }).render(true);
    });

    html.find('.rout-check').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'rout', pool: 'willpower' }).render(true);
    });

    html.find('.roll-ma').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', ability: item.id }).render(true);
    });

    html.find('.roll-craft').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', ability: item.id }).render(true);
    });

    html.find('.join-battle').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'joinBattle', pool: 'joinbattle' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'joinBattle', ability: 'awareness', attribute: 'wits' }).render(true);
      }
    });

    html.find('.accuracy').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'accuracy' }).render(true);
    });

    html.find('.damage').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'damage' }).render(true);
    });

    html.find('.rush').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'rush', pool: 'movement' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'rush', ability: 'athletics', attribute: 'dexterity' }).render(true);
      }
    });

    html.find('.disengage').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'disengage', pool: 'movement' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'disengage', ability: 'dodge', attribute: 'dexterity' }).render(true);
      }
    });

    html.find('.grapple-control').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'grappleControl', pool: 'grapple' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'grappleControl' }).render(true);
      }
    });

    html.find('.command').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'command', pool: 'command' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'command' }).render(true);
      }
    });

    html.find('.shape-sorcery').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'sorcery', pool: 'sorcery' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'sorcery', ability: 'occult', attribute: 'intelligence' }).render(true);
      }
    });

    html.find('.read-intentions').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'readIntentions', pool: 'readintentions' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'readIntentions', ability: 'socialize', attribute: 'perception' }).render(true);
      }
    });

    html.find('.social-influence').mousedown(ev => {
      if (this.actor.type === "npc") {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'social', pool: 'social' }).render(true);
      }
      else {
        game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'social', ability: 'socialize', attribute: 'charisma' }).render(true);
      }
    });

    html.find('#import-stuff').mousedown(ev => {
      new Importer().render(true);
    });

    html.find('.weapon-roll').click(ev => {
      let item = this.actor.items.get($(ev.target).attr("data-item-id"));
      let rollType = $(ev.target).attr("data-roll-type");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: rollType, weapon: item.system }).render(true);
    });

    html.find('.weapon-icon').click(ev => {
      ev.stopPropagation();
      let item = this.actor.items.get($(ev.target.parentElement).attr("data-item-id"));
      let rollType = $(ev.target.parentElement).attr("data-roll-type");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: rollType, weapon: item.system }).render(true);
    });

    html.find('#anima-up').click(ev => {
      this._updateAnima("up");
    });

    html.find('#anima-down').click(ev => {
      this._updateAnima("down");
    });

    html.find('.toggle-poison').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      // Render the chat card template
      let li = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      item.update({
        [`system.poison.apply`]: !item.system.poison.apply,
      });
    });

    html.find('.item-chat').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      // Render the chat card template
      let li = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      this._displayCard(item);
    });

    html.find('.craft-project').click(ev => {
      var type = $(ev.target).attr("data-type");
      new RollForm(this.actor, { event: ev }, {}, { rollType: 'craft', ability: "craft", craftType: type, craftRating: 2 }).render(true);
    });

    html.find('.sorcerous-working').click(ev => {
      if (this.actor.type === "npc") {
        new RollForm(this.actor, { event: ev }, {}, { rollType: 'working', pool: "sorcery" }).render(true);
      }
      else {
        new RollForm(this.actor, { event: ev }, {}, { rollType: 'working', ability: "occult", attribute: 'intelligence' }).render(true);
      }
    });

    html.find('.item-complete').click(ev => {
      this._completeCraft(ev);
    });

    html.find('.add-opposing-charm').click(ev => {
      this._addOpposingCharm(ev);
    });

    html.find('.item-spend').click(ev => {
      this._spendItem(ev);
    });

    html.find('.lunar-sync').click(ev => {
      this._lunarSync();
    });

    html.find('.quick-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      new RollForm(this.actor, { event: ev }, {}, { rollId: li.data("saved-roll-id"), skipDialog: true }).roll();
    });

    html.find('.saved-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollId: li.data("saved-roll-id") }).render(true);
    });

    html.find('.anima-flux').click(ev => {
      if (game.user.targets && game.user.targets.size > 0) {
        for (const target of game.user.targets) {
          var roll = new Roll(`1d10cs>=7`).evaluate({ async: false });
          var total = roll.total;
          for (let dice of roll.dice[0].results) {
            if (dice.result >= 10) {
              total += 1;
            }
          }
          if (total > 0) {
            if (game.combat) {
              let combatant = game.combat.combatants.find(c => c.tokenId == target.actor.token.id);
              if (combatant && combatant.initiative != null) {
                if (combatant.initiative > 0) {
                  if (target.actor.system.hardness.value <= 0) {
                    game.combat.setInitiative(combatant.id, combatant.initiative - total);
                  }
                }
                else {
                  let totalHealth = 0;
                  const targetActorData = duplicate(target.actor);
                  for (let [key, health_level] of Object.entries(targetActorData.system.health.levels)) {
                    totalHealth += health_level.value;
                  }
                  targetActorData.system.health.lethal = Math.min(totalHealth - targetActorData.system.health.bashing - targetActorData.system.health.aggravated, targetActorData.system.health.lethal + total);
                  if (game.user.isGM) {
                    target.actor.update(targetActorData);
                  }
                  else {
                    game.socket.emit('system.exaltedthird', {
                      type: 'healthDamage',
                      id: target.id,
                      data: targetActorData.system.health,
                    });
                  }
                }
              }
            }
          }
          ChatMessage.create({ type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: roll });
        }
      }
    });

    html.find('.delete-saved-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      var key = li.data("saved-roll-id");
      const rollDeleteString = "data.savedRolls.-=" + key;

      let deleteConfirm = new Dialog({
        title: "Delete",
        content: "Delete Saved Roll?",
        buttons: {
          Yes: {
            icon: '<i class="fa fa-check"></i>',
            label: "Delete",
            callback: dlg => {
              this.actor.update({ [rollDeleteString]: null });
              ui.notifications.notify(`Saved Roll Deleted`);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
          },
        },
        default: 'Yes'
      });
      deleteConfirm.render(true);
    });

    $(document.getElementById('chat-log')).on('click', '.chat-card', (ev) => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    html.find('.npc-action').on('change', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const itemID = li.data('itemId');
      const newNumber = parseInt(ev.currentTarget.value);
      await this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemID,
          system: {
            value: newNumber,
          },
        }
      ]);
    });

    html.find('.list-ability').on('change', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const itemID = li.data('itemId');
      const newNumber = parseInt(ev.currentTarget.value);
      await this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemID,
          system: {
            points: newNumber,
          },
        }
      ]);
    });

    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      let savedRollhandler = ev => this._onDragSavedRoll(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        if (li.classList.contains("saved-roll-row")) {
          li.addEventListener("dragstart", savedRollhandler, false);
        }
        else {
          li.addEventListener("dragstart", handler, false);
        }
      });
    }
  }

  async _onDragSavedRoll(ev) {
    const li = ev.currentTarget;
    if (ev.target.classList.contains("content-link")) return;
    const savedRoll = this.actor.system.savedRolls[li.dataset.itemId];
    ev.dataTransfer.setData("text/plain", JSON.stringify({ actorId: this.actor.uuid, type: 'savedRoll', id: li.dataset.itemId, name: savedRoll.name }));
  }

  _updateAnima(direction) {
    let newAnima = this.actor.system.anima;
    let newLevel = this.actor.system.anima.level;
    let newValue = this.actor.system.anima.value;
    if (direction === "up") {
      if (this.actor.system.anima.level !== "Transcendent") {
        if (this.actor.system.anima.level === "Dim") {
          newLevel = "Glowing";
          newValue = 1;
        }
        else if (this.actor.system.anima.level === "Glowing") {
          newLevel = "Burning";
          newValue = 2;
        }
        else {
          newLevel = "Bonfire";
          newValue = 3;
        }
      }
      if (this.actor.system.anima.level === 'Bonfire' && this.actor.system.anima.max === 4) {
        newLevel = "Transcendent";
        newValue = 4;
      }
    }
    else {
      if (this.actor.system.anima.level === "Transcendent") {
        newLevel = "Bonfire";
        newValue = 3;
      }
      else if (this.actor.system.anima.level === "Bonfire") {
        newLevel = "Burning";
        newValue = 2;
      }
      else if (this.actor.system.anima.level === "Burning") {
        newLevel = "Glowing";
        newValue = 1;
      }
      else if (this.actor.system.anima.level === "Glowing") {
        newLevel = "Dim";
        newValue = 0;
      }
    }
    newAnima.level = newLevel;
    newAnima.value = newValue;
    animaTokenMagic(this.actor, newValue);
    this.actor.update({ [`system.anima`]: newAnima });
  }

  async calculateDerivedStats(type) {
    const actorData = duplicate(this.actor);
    var armoredSoakValue = 0;
    if (type === 'natural-soak') {
      actorData.system.naturalsoak.value = actorData.system.attributes[actorData.system.settings.staticcapsettings.soak.attribute].value;
    }
    if (type === 'soak' || type === 'armored-soak') {
      for (let armor of this.actor.armor) {
        if (armor.system.equipped) {
          armoredSoakValue = armoredSoakValue + armor.system.soak;
        }
      }
      if (type === 'armored-soak') {
        actorData.system.armoredsoak.value = armoredSoakValue;
      }
      if (type === 'soak') {
        actorData.system.soak.value = actorData.system.attributes[actorData.system.settings.staticcapsettings.soak.attribute].value + armoredSoakValue;
      }
    }
    if (type === 'parry') {
      actorData.system.parry.value = Math.ceil((actorData.system.attributes[actorData.system.settings.staticcapsettings.parry.attribute].value + actorData.system.abilities[actorData.system.settings.staticcapsettings.parry.ability].value) / 2);
      for (let weapon of this.actor.weapons) {
        if (weapon.system.equipped) {
          actorData.system.parry.value = actorData.system.parry.value + weapon.system.defense;
        }
      }
    }
    if (type === 'evasion') {
      var newEvasionValue = Math.ceil((actorData.system.attributes[actorData.system.settings.staticcapsettings.parry.attribute].value + actorData.system.abilities[actorData.system.settings.staticcapsettings.evasion.ability].value) / 2);
      for (let armor of this.actor.armor) {
        if (armor.system.equipped) {
          newEvasionValue = newEvasionValue - Math.abs(armor.system.penalty);
        }
      }
      actorData.system.evasion.value = newEvasionValue;
    }
    if (type === 'resolve') {
      actorData.system.resolve.value = Math.ceil((actorData.system.attributes[actorData.system.settings.staticcapsettings.resolve.attribute].value + actorData.system.abilities[actorData.system.settings.staticcapsettings.resolve.ability].value) / 2);
    }
    if (type === 'guile') {
      actorData.system.guile.value = Math.ceil((actorData.system.attributes[actorData.system.settings.staticcapsettings.guile.attribute].value + actorData.system.abilities[actorData.system.settings.staticcapsettings.guile.ability].value) / 2);
    }
    if (type === 'resonance') {
      actorData.system.traits.resonance = this.actor.calculateResonance(this.actor.system.details.exalt);
      actorData.system.traits.dissonance = this.actor.calculateDissonance(this.actor.system.details.exalt);
    }
    this.actor.update(actorData);
  }

  async setSpendPool(type) {
    this.actor.update({ [`system.settings.charmmotepool`]: type });
  }

  async calculateCommitMotes(type) {
    var commitMotes = 0;
    for (const item of this.actor.items.filter((i) => i.type === 'weapon' || i.type === 'armor' || i.type === 'item')) {
      if (item.type === 'item' || item.system.equipped) {
        commitMotes += item.system.attunement;
      }
    }
    this.actor.update({ [`system.motes.${type}.committed`]: commitMotes });
  }

  async calculateMotes() {
    const system = this.actor.system;

    if (system.details.exalt === 'other' || (this.actor.type === 'npc' && system.creaturetype !== 'exalt')) {
      system.motes.personal.max = 10 * system.essence.value;
      if (system.creaturetype === 'god' || system.creaturetype === 'undead' || system.creaturetype === 'demon') {
        system.motes.personal.max += 50;
      }
      system.motes.personal.value = (system.motes.personal.max - this.actor.system.motes.personal.committed);
    }
    else {
      system.motes.personal.max = this.actor.calculateMaxExaltedMotes('personal', this.actor.system.details.exalt, this.actor.system.essence.value);
      system.motes.peripheral.max = this.actor.calculateMaxExaltedMotes('peripheral', this.actor.system.details.exalt, this.actor.system.essence.value);
      system.motes.personal.value = (system.motes.personal.max - this.actor.system.motes.personal.committed);
      system.motes.peripheral.value = (system.motes.peripheral.max - this.actor.system.motes.peripheral.committed);
    }
    this.actor.update({ [`system.motes`]: system.motes });
  }

  async calculateHealth(healthType = 'person') {
    let confirmed = false;
    var oxBodyText = '';

    if (this.actor.type !== 'npc') {
      if (this.actor.system.details.exalt === 'solar') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: One -1 and one -2 level.';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -1 and two -2 levels.';
        }
        else {
          oxBodyText = 'Ox Body: One -0, one -1, and one -2 level';
        }
      }
      if (this.actor.system.details.exalt === 'dragonblooded') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: Two -2 levels';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -1 and one -2 level';
        }
        else {
          oxBodyText = 'Ox Body: One -1 and two -2 levels';
        }
      }
      if (this.actor.system.details.exalt === 'lunar') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: Two -2 levels.';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: Two -2 levels and one -4 level';
        }
        else {
          oxBodyText = 'Ox Body: Two -2 levels and two -4 levels';
        }
      }
      else if (this.actor.system.details.exalt === 'sidereal') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: One -0 level.';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -0 level and one -1 level';
        }
        else {
          oxBodyText = 'Ox Body: Two -0 levels';
        }
      }
    }


    var template = "systems/exaltedthird/templates/dialogues/calculate-health.html";
    if (this.actor.system.battlegroup && healthType === 'person') {
      template = "systems/exaltedthird/templates/dialogues/calculate-battlegroup-health.html";
    }

    var templateData = {
      'oxBodyText': oxBodyText,
      'healthType': healthType,
    }
    if (healthType === 'warstrider') {
      templateData.zero = this.actor.system.warstrider.health.levels.zero.value;
      templateData.one = this.actor.system.warstrider.health.levels.one.value;
      templateData.two = this.actor.system.warstrider.health.levels.two.value;
      templateData.four = this.actor.system.warstrider.health.levels.four.value;
    }
    else if (healthType === 'ship') {
      templateData.zero = this.actor.system.ship.health.levels.zero.value;
      templateData.one = this.actor.system.ship.health.levels.one.value;
      templateData.two = this.actor.system.ship.health.levels.two.value;
      templateData.four = this.actor.system.ship.health.levels.four.value;
    }
    else {
      templateData.zero = this.actor.system.health.levels.zero.value;
      templateData.one = this.actor.system.health.levels.one.value;
      templateData.two = this.actor.system.health.levels.two.value;
      templateData.four = this.actor.system.health.levels.four.value;
      templateData.penaltyMod = this.actor.system.health.penaltymod;
    }

    const html = await renderTemplate(template, templateData);

    new Dialog({
      title: `Calculate Health`,
      content: html,
      buttons: {
        roll: { label: "Save", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          let zero = parseInt(html.find('#zero').val()) || 0;
          let one = parseInt(html.find('#one').val()) || 0;
          let two = parseInt(html.find('#two').val()) || 0;
          let four = parseInt(html.find('#four').val()) || 0;
          let penaltyMod = parseInt(html.find('#penaltyMod').val()) || 0;
          let healthData = {
            levels: {
              zero: {
                value: zero,
              },
              one: {
                value: one,
              },
              two: {
                value: two,
              },
              four: {
                value: four,
              },
            },
            penaltymod: penaltyMod,
            bashing: 0,
            lethal: 0,
            aggravated: 0,
          }
          if (healthType === 'person') {
            this.actor.update({ [`system.health`]: healthData });
          }
          else {
            this.actor.update({ [`system.${healthType}.health`]: healthData });
          }
        }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  async recoverHealth(healthType = 'person') {
    let newDamage = {
      bashing: 0,
      lethal: 0,
      aggravated: 0,
    }
    if (healthType === 'person') {
      this.actor.update({ [`system.health`]: newDamage });
    }
    else {
      this.actor.update({ [`system.${healthType}.health`]: newDamage });
    }
  }

  async showDialogue(type) {
    var template = "systems/exaltedthird/templates/dialogues/armor-tags.html";
    switch (type) {
      case 'weapons':
        template = "systems/exaltedthird/templates/dialogues/weapon-tags.html";
        break;
      case 'craft':
        template = "systems/exaltedthird/templates/dialogues/craft-cheatsheet.html";
        break;
      case 'advancement':
        template = "systems/exaltedthird/templates/dialogues/advancement-dialogue.html";
        break;
      case 'combat':
        template = "systems/exaltedthird/templates/dialogues/combat-dialogue.html";
        break;
      case 'social':
        template = "systems/exaltedthird/templates/dialogues/social-dialogue.html";
        break;
      case 'rout':
        template = "systems/exaltedthird/templates/dialogues/rout-modifiers.html";
        break;
      case 'exalt-xp':
        template = "systems/exaltedthird/templates/dialogues/exalt-xp-dialogue.html";
        break;
      case 'feats-of-strength':
        template = "systems/exaltedthird/templates/dialogues/feats-of-strength-dialogue.html";
        break;
      case 'bonus-points':
        template = "systems/exaltedthird/templates/dialogues/bonus-points-dialogue.html";
        break;
      default:
        break;
    }
    const html = await renderTemplate(template, { 'exalt': this.actor.system.details.exalt, 'caste': this.actor.system.details.caste.toLowerCase(), 'flatXP': game.settings.get("exaltedthird", "flatXP") });
    new Dialog({
      title: `Info Dialogue`,
      content: html,
      buttons: {
        cancel: { label: "Close" }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  async pickColor() {
    let confirmed = false;
    const html = await renderTemplate("systems/exaltedthird/templates/dialogues/color-picker.html", { 'color': this.actor.system.details.color, 'animaColor': this.actor.system.details.animacolor });
    new Dialog({
      title: `Pick Color`,
      content: html,
      buttons: {
        roll: { label: "Save", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          let color = html.find('#color').val();
          let animaColor = html.find('#animaColor').val();
          if (isColor(color)) {
            this.actor.update({ [`system.details.color`]: color });
          }
          if (isColor(animaColor)) {
            this.actor.update({ [`system.details.animacolor`]: animaColor });
          }
        }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  async sheetSettings() {
    let confirmed = false;
    const template = "systems/exaltedthird/templates/dialogues/sheet-settings.html"
    const html = await renderTemplate(template, { 'actorType': this.actor.type, settings: this.actor.system.settings, 'maxAnima': this.actor.system.anima.max, 'lunarFormEnabled': this.actor.system.lunarform?.enabled });
    new Dialog({
      title: `Settings`,
      content: html,
      buttons: {
        save: { label: "Save", callback: () => confirmed = true },
        cancel: { label: "Close", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          let newSettings = {
            charmmotepool: html.find('#charmMotePool').val(),
            martialartsmastery: html.find('#martialArtsMastery').val(),
            sheetbackground: html.find('#sheetBackground').val(),
            smaenlightenment: html.find('#smaEnlightenment').is(":checked"),
            showwarstrider: html.find('#showWarstrider').is(":checked"),
            showship: html.find('#showShip').is(":checked"),
            showescort: html.find('#showEscort').is(":checked"),
            usetenattributes: html.find('#useTenAttributes').is(":checked"),
            usetenabilities: html.find('#useTenAbilities').is(":checked"),
            rollStunts: html.find('#rollStunts').is(":checked"),
            defenseStunts: html.find('#defenseStunts').is(":checked"),
            showanima: html.find('#showAnima').is(":checked"),
            editmode: html.find('#editMode').is(":checked"),
            issorcerer: html.find('#isSorcerer').is(":checked"),
            iscrafter: html.find('#isCrafter').is(":checked"),
          }
          if (this.actor.type === 'npc') {
            this.actor.update({ [`system.lunarform.enabled`]: html.find('#lunarFormEnabled').is(":checked")});
          }
          this.actor.update({ [`system.settings`]: newSettings, [`system.anima.max`]: parseInt(html.find('#maxAnima').val())});
        }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  async helpDialogue(type) {
    let confirmed = false;
    const template = "systems/exaltedthird/templates/dialogues/help-dialogue.html"
    const html = await renderTemplate(template, { 'type': type });
    new Dialog({
      title: `ReadMe`,
      content: html,
      buttons: {
        cancel: { label: "Close", callback: () => confirmed = false }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
  }

  _onSquareCounterChange(event) {
    event.preventDefault()
    const element = event.currentTarget
    const index = Number(element.dataset.index)
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    const states = parseCounterStates(data.states)
    const fields = data.name.split('.')
    const steps = parent.find('.resource-counter-step')

    if (index < 0 || index > steps.length) {
      return
    }

    const currentState = steps[index].dataset.state;
    if (steps[index].dataset.type) {
      if (currentState === '') {
        for (const step of steps) {
          if (step.dataset.state === '') {
            step.dataset.state = 'x';
            data['value'] = Number(data['value']) + 1;
            break;
          }
        }
      }
      else {
        for (const step of steps) {
          if (step.dataset.state === 'x') {
            step.dataset.state = '';
            data['value'] = Number(data['value']) - 1;
            break;
          }
        }
      }
    }
    else {
      if (currentState === '') {
        for (const step of steps) {
          if (step.dataset.state === '') {
            step.dataset.state = '/';
            data['bashing'] = Number(data['bashing']) + 1;
            break;
          }
        }
      }
      if (currentState === '/') {
        for (const step of steps) {
          if (step.dataset.state === '/') {
            step.dataset.state = 'x';
            data['lethal'] = Number(data['lethal']) + 1;
            data['bashing'] = Number(data['bashing']) - 1;
            break;
          }
        }
      }
      if (currentState === 'x') {
        for (const step of steps) {
          if (step.dataset.state === 'x') {
            step.dataset.state = '*';
            data['aggravated'] = Number(data['aggravated']) + 1;
            data['lethal'] = Number(data['lethal']) - 1;
            break;
          }
        }
      }
      if (currentState === '*') {
        for (const step of steps) {
          if (step.dataset.state === '*') {
            step.dataset.state = '';
            data['aggravated'] = Number(data['aggravated']) - 1;
            break;
          }
        }
      }
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = Number(data[k]) || 0
      return obj
    }, {})

    this._assignToActorField(fields, newValue)
  }


  _onDotCounterChange(event) {
    event.preventDefault()
    const actorData = duplicate(this.actor)
    const element = event.currentTarget
    const dataset = element.dataset
    const index = Number(dataset.index)
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-step')
    if (index < 0 || index > steps.length) {
      return
    }

    steps.removeClass('active')
    steps.each(function (i) {
      if (i <= index) {
        // $(this).addClass('active')
        $(this).css("background-color", actorData.system.details.color);
      }
    })
    this._assignToActorField(fields, index + 1)
  }

  _assignToActorField(fields, value) {
    const actorData = duplicate(this.actor)
    // update actor owned items
    if (fields.length === 2 && fields[0] === 'items') {
      for (const i of actorData.items) {
        if (fields[1] === i._id) {
          i.data.points = value
          break
        }
      }
    } else {
      const lastField = fields.pop()
      if (fields.reduce((data, field) => data[field], actorData)[lastField] === 1 && value === 1) {
        fields.reduce((data, field) => data[field], actorData)[lastField] = 0;
      }
      else {
        fields.reduce((data, field) => data[field], actorData)[lastField] = value
      }
    }
    this.actor.update(actorData)
  }

  _onDotCounterEmpty(event) {
    event.preventDefault()
    const actorData = duplicate(this.actor)
    const element = event.currentTarget
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-empty')

    steps.removeClass('active')
    this._assignToActorField(fields, 0)
  }

  _setupButtons(html) {
    const actorData = duplicate(this.actor);
    html.find('.set-pool-personal').each(function (i) {
      if (actorData.system.settings.charmmotepool === 'personal') {
        $(this).css("color", '#F9B516');
      }
    });
    html.find('.set-pool-peripheral').each(function (i) {
      if (actorData.system.settings.charmmotepool === 'peripheral') {
        $(this).css("color", '#F9B516');
      }
    });
  }

  _setupDotCounters(html) {
    const actorData = duplicate(this.actor)
    html.find('.resource-value').each(function () {
      const value = Number(this.dataset.value);
      $(this).find('.resource-value-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active');
          $(this).css("background-color", actorData.system.details.color);
        }
      });
    })
    html.find('.resource-value-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active');
          $(this).css("background-color", actorData.system.details.color);
        }
      })
    })
  }

  _setupSquareCounters(html) {
    html.find('.resource-counter').each(function () {
      const data = this.dataset;
      const states = parseCounterStates(data.states);

      const halfs = Number(data[states['/']]) || 0;
      const crossed = Number(data[states.x]) || 0;
      const stars = Number(data[states['*']]) || 0;

      const values = new Array(stars + crossed + halfs);

      values.fill('*', 0, stars);
      values.fill('x', stars, stars + crossed);
      values.fill('/', stars + crossed, halfs + crossed + stars);


      $(this).find('.resource-counter-step').each(function () {
        this.dataset.state = ''
        if (this.dataset.index < values.length) {
          this.dataset.state = values[this.dataset.index];
        }
      });
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    event.stopPropagation();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData])
  }

  /**
 * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
 * @param {Event} event   The click event which originated the selection
 * @private
 */
  _onTraitSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const label = a.parentElement.querySelector("label");
    const choices = CONFIG.exaltedthird[a.dataset.options];
    const options = { name: a.dataset.target, title: label.innerText, choices };
    return new TraitSelector(this.actor, options).render(true)
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.system);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  async _completeCraft(ev) {
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));
    game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'craft', ability: "craft", craftType: item.system.type, craftRating: item.system.rating }).render(true);
  }

  /**
* Display the chat card for an Item as a Chat Message
* @param {object} options          Options which configure the display of the item chat card
* @param {string} rollMode         The message visibility mode to apply to the created card
* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
*                                  the prepared message data (if false)
*/
  async _displayCard(item) {
    const token = this.actor.token;
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      item: item,
      labels: this.labels,
    };
    const html = await renderTemplate("systems/exaltedthird/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token }),
    };
    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }

  _addOpposingCharm(event) {
    event.preventDefault();
    event.stopPropagation();

    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));

    if (game.rollForm) {
      game.rollForm.addOpposingCharm(item);
    }

    game.socket.emit('system.exaltedthird', {
      type: 'addOpposingCharm',
      data: item,
      actorId: item.actor._id,
    });
  }

  _spendItem(event) {
    event.preventDefault();
    event.stopPropagation();
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));
    spendEmbeddedItem(this.actor, item);
    if (game.settings.get("exaltedthird", "spendChatCards")) {
      this._displayCard(item);
    }
  }

  async _lunarSync() {
    const lunar = game.actors.get(this.actor.system.lunarform.actorid);
    if (lunar) {
      const actorData = duplicate(this.actor);

      const template = "systems/exaltedthird/templates/dialogues/lunar-sync.html";
      const html = await renderTemplate(template);
      let confirmed = false;
      new Dialog({
        title: `Lunar Sync`,
        content: html,
        buttons: {
          save: { label: "Sync", callback: () => confirmed = true },
          cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
          if (confirmed) {
            if (actorData.img === 'icons/svg/mystery-man.svg') {
              actorData.img = "systems/exaltedthird/assets/icons/lunar_animal.webp";
            }
            actorData.system.health = lunar.system.health;
            actorData.system.willpower = lunar.system.willpower;
            actorData.system.essence = lunar.system.essence;
            actorData.system.motes = lunar.system.motes;
            actorData.system.resolve = lunar.system.resolve;
            actorData.system.guile = lunar.system.guile;
            actorData.system.anima = lunar.system.anima;
            if (lunar.type === 'npc') {
              actorData.system.appearance.value = actorData.system.appearance.value;
            }
            else {
              actorData.system.appearance.value = lunar.system.attributes.appearance.value;
            }
            actorData.system.evasion.value = Math.max(lunar.system.evasion.value, actorData.system.evasion.value);
            actorData.system.parry.value = Math.max(lunar.system.parry.value, actorData.system.parry.value);
            actorData.system.soak.value = Math.max(lunar.system.soak.value, actorData.system.soak.value);
            actorData.system.armoredsoak.value = Math.max(lunar.system.armoredsoak.value, actorData.system.armoredsoak.value);
            actorData.system.hardness.value = Math.max(lunar.system.hardness.value, actorData.system.hardness.value);
            actorData.system.baseinitiative = lunar.system.baseinitiative;
            actorData.system.details = lunar.system.details;
            actorData.system.creaturetype = 'exalt';

            for (let [key, pool] of Object.entries(actorData.system.pools)) {
              let lunarPool = 0;
              if (lunar.type === 'npc') {
                lunarPool = lunar.system.pools[key].value;
              }
              else {
                if (key === 'grapple') {
                  lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.grapplecontrol.attribute].value + getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.grapplecontrol.ability);
                }
                else if (key === 'movement') {
                  lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.rush.attribute].value + getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings.rush.ability);
                }
                else {
                  lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings[key].attribute].value + getCharacterAbilityValue(lunar, lunar.system.settings.rollsettings[key].ability);
                }
              }

              pool.value = Math.max(pool.value, lunarPool);
            }
            for (let item of this.actor.items.filter(item => item.type === 'action')) {
              if (lunar.type === 'character') {
                if (item.system.lunarstats.attribute !== 'none' && item.system.lunarstats.ability !== 'none') {
                  let lunarActionPool = lunar.system.attributes[item.system.lunarstats.attribute].value + lunar.system.abilities[item.system.lunarstats.ability].value;
                  item.update({
                    [`system.value`]: Math.max(item.system.value, lunarActionPool),
                  });
                }
              }
              else {
                const lunarAction = lunar.items.filter(item => item.type === 'action').find(lunarActionItem => lunarActionItem.name === item.name);
                if (lunarAction) {
                  item.update({
                    [`system.value`]: Math.max(item.system.value, lunarAction.system.value),
                  });
                }
              }
            }

            const newItems = [];
            const newEffects = [];

            for (let item of lunar.items) {
              if ((item.type === 'charm' || item.type === 'spell' || item.type === 'specialty' || item.type === 'ritual' || item.type === 'intimacy') && !this.actor.items.filter(actorItem => actorItem.type === item.type).find(actorItem => actorItem.name === item.name)) {
                newItems.push(duplicate(item));
              }
            }
            for (let effect of lunar.effects) {
              if (!this.actor.effects.find(actorEffect => actorEffect.name === effect.label)) {
                newEffects.push(duplicate(effect));
              }
            }
            if (newItems) {
              this.actor.createEmbeddedDocuments("Item", newItems);
            }
            if (newEffects) {
              this.actor.createEmbeddedDocuments("ActiveEffect", newEffects);
            }
            this.actor.update(actorData);
          }
        }
      }, { classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }).render(true);
    }
    else {
      ui.notifications.error(`<p>Linked Lunar not found</p>`);
    }
  }
}

function getCharacterAbilityValue(actor, ability) {
  if (actor.items.filter(item => item.type === 'customability').some(ca => ca._id === ability)) {
    return actor.customabilities.find(x => x._id === ability).system.points;
  }
  if (actor.system.abilities[ability]) {
    return actor.system.abilities[ability]?.value || 0;
  }
  if (ability === 'willpower') {
    return actor.system.willpower.max;
  }
  return 0;
}


function parseCounterStates(states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}

function isColor(strColor) {
  const s = new Option().style;
  s.color = strColor;
  return s.color !== '';
}

// import {
//   DiceRollerDialogue
// } from "./dialogue-diceRoller.js";
import TraitSelector from "../apps/trait-selector.js";
import { RollForm } from "../apps/dice-roller.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";

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
  }

  /**
 * Get the correct HTML template path to use for rendering this particular sheet
 * @type {String}
 */
  get template() {
    if (this.actor.data.type === "npc") return "systems/exaltedthird/templates/actor/npc-sheet.html";
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

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];

    // Update traits
    this._prepareTraits(data.data.data.traits);

    // Prepare items.
    if (this.actor.data.type === 'character') {
      for (let attr of Object.values(data.data.data.attributes)) {
        attr.isCheckbox = attr.dtype === "Boolean";
      }
      this._prepareCharacterItems(data);
    }
    if (this.actor.data.type === 'npc') {
      this._prepareCharacterItems(data);
    }

    data.effects = prepareActiveEffectCategories(this.document.effects);

    return data;
  }


  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const weapons = [];
    const armor = [];
    const merits = [];
    const intimacies = [];
    const initiations = [];
    const martialarts = [];
    const crafts = [];
    const specialties = [];
    const specialAbilities = [];
    const craftProjects = [];
    const actions = [];


    const charms = {
      strength: { name: 'Ex3.Strength', visible: false, list: [] },
      dexterity: { name: 'Ex3.Dexterity', visible: false, list: [] },
      stamina: { name: 'Ex3.Stamina', visible: false, list: [] },
      charisma: { name: 'Ex3.Charisma', visible: false, list: [] },
      manipulation: { name: 'Ex3.Manipulation', visible: false, list: [] },
      appearance: { name: 'Ex3.Appearance', visible: false, list: [] },
      perception: { name: 'Ex3.Perception', visible: false, list: [] },
      intelligence: { name: 'Ex3.Intelligence', visible: false, list: [] },
      wits: { name: 'Ex3.Wits', visible: false, list: [] },
      archery: { name: 'Ex3.Archery', visible: false, list: [] },
      athletics: { name: 'Ex3.Athletics', visible: false, list: [] },
      awareness: { name: 'Ex3.Awareness', visible: false, list: [] },
      brawl: { name: 'Ex3.Brawl', visible: false, list: [] },
      bureaucracy: { name: 'Ex3.Bureaucracy', visible: false, list: [] },
      craft: { name: 'Ex3.Craft', visible: false, list: [] },
      dodge: { name: 'Ex3.Dodge', visible: false, list: [] },
      integrity: { name: 'Ex3.Integrity', visible: false, list: [] },
      investigation: { name: 'Ex3.Investigation', visible: false, list: [] },
      larceny: { name: 'Ex3.Larceny', visible: false, list: [] },
      linguistics: { name: 'Ex3.Linguistics', visible: false, list: [] },
      lore: { name: 'Ex3.Lore', visible: false, list: [] },
      martialarts: { name: 'Ex3.MartialArts', visible: false, list: [] },
      medicine: { name: 'Ex3.Medicine', visible: false, list: [] },
      melee: { name: 'Ex3.Melee', visible: false, list: [] },
      occult: { name: 'Ex3.Occult', visible: false, list: [] },
      performance: { name: 'Ex3.Performance', visible: false, list: [] },
      presence: { name: 'Ex3.Presence', visible: false, list: [] },
      resistance: { name: 'Ex3.Resistance', visible: false, list: [] },
      ride: { name: 'Ex3.Ride', visible: false, list: [] },
      sail: { name: 'Ex3.Sail', visible: false, list: [] },
      socialize: { name: 'Ex3.Socialize', visible: false, list: [] },
      stealth: { name: 'Ex3.Stealth', visible: false, list: [] },
      survival: { name: 'Ex3.Survival', visible: false, list: [] },
      thrown: { name: 'Ex3.Thrown', visible: false, list: [] },
      war: { name: 'Ex3.War', visible: false, list: [] },
      evocation: { name: 'Ex3.Evocation', visible: false, list: [] },
      other: { name: 'Ex3.Other', visible: false, list: [] },
    }

    const spells = {
      terrestrial: { name: 'Ex3.Terrestrial', visible: false, list: [] },
      celestial: { name: 'Ex3.Celestial', visible: false, list: [] },
      solar: { name: 'Ex3.Solar', visible: false, list: [] },
    }

    // Iterate through items, allocating to containers
    for (let i of sheetData.items) {
      let item = i.data;

      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'weapon') {
        weapons.push(i);
      }
      else if (i.type === 'armor') {
        armor.push(i);
      }
      else if (i.type === 'merit') {
        merits.push(i);
      }
      else if (i.type === 'intimacy') {
        intimacies.push(i);
      }
      else if (i.type === 'martialart') {
        martialarts.push(i);
      }
      else if (i.type === 'craft') {
        crafts.push(i);
      }
      else if (i.type === 'initiation') {
        initiations.push(i);
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
      else if (i.type === 'charm') {
        if (i.data.ability !== undefined) {
          charms[i.data.ability].list.push(i);
          charms[i.data.ability].visible = true;
        }
      }
      else if (i.type === 'spell') {
        if (i.data.circle !== undefined) {
          spells[i.data.circle].list.push(i);
          spells[i.data.circle].visible = true;
        }
      }
      else if (i.type === 'action') {
        actions.push(i);
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.weapons = weapons;
    actorData.armor = armor;
    actorData.merits = merits;
    actorData.martialarts = martialarts;
    actorData.crafts = crafts;
    actorData.initiations = initiations;
    actorData.intimacies = intimacies;
    actorData.specialties = specialties;
    actorData.charms = charms;
    actorData.spells = spells;
    actorData.specialabilities = specialAbilities;
    actorData.projects = craftProjects;
    actorData.actions = actions;
  }

  /**
 * Prepare the data structure for traits data like languages
 * @param {object} traits   The raw traits data object from the actor data
 * @private
 */
  _prepareTraits(traits) {
    const map = {
      "languages": CONFIG.exaltedthird.languages,
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
      trait.cssClass = !isObjectEmpty(trait.selected) ? "" : "inactive";
    }
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Token Configuration
    const canConfigure = game.user.isGM || this.actor.isOwner;
    if (this.options.editable && canConfigure) {
      const helpButton = {
        label: game.i18n.localize('Ex3.Help'),
        class: 'help-dialogue',
        icon: 'fas fa-question',
        onclick: () => this.helpDialogue(this.actor.type),
      };
      buttons = [helpButton, ...buttons];
      if (this.actor.type != 'npc') {
        const colorButton = {
          label: game.i18n.localize('Ex3.DotColors'),
          class: 'set-color',
          icon: 'fas fa-palette',
          onclick: (ev) => this.pickColor(ev),
        };
        buttons = [colorButton, ...buttons];
      }
      const rollButton = {
        label: game.i18n.localize('Ex3.Roll'),
        class: 'roll-dice',
        icon: 'fas fa-dice',
        onclick: (ev) => new RollForm(this.actor, {event:ev}, {}, {rollType: 'base'}).render(true),
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

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.trait-selector').click(this._onTraitSelector.bind(this));

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.resource-value > .resource-value-step').click(this._onDotCounterChange.bind(this))
    html.find('.resource-value > .resource-value-empty').click(this._onDotCounterEmpty.bind(this))
    html.find('.resource-counter > .resource-counter-step').click(this._onSquareCounterChange.bind(this))

    html.find('.augment-attribute').click(this._toggleAugment.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      ev.stopPropagation();
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
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
      }).render(true);
    });

    html.find('.show-weapon-tags').mousedown(ev => {
      this.showTags('weapons');
    });

    html.find('.show-armor-tags').mousedown(ev => {
      this.showTags('armor');
    });

    html.find('#calculate-health').mousedown(ev => {
      this.calculateHealth();
    });

    html.find('.calculate-peripheral-motes').mousedown(ev => {
      this.calculateMotes('peripheral');
    });

    html.find('.calculate-personal-motes').mousedown(ev => {
      this.calculateMotes('personal');
    });

    html.find('#calculate-warstrider-health').mousedown(ev => {
      this.calculateHealth(true);
    });

    html.find('#color-picker').mousedown(ev => {
      this.pickColor();
    });

    html.find('#recoveryScene').mousedown(ev => {
      this.recoverHealth();
    });

    html.find('#recoverySceneWarstrider').mousedown(ev => {
      this.recoverHealth(true);
    });

    html.find('#rollDice').mousedown(ev => {
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'base'}).render(true);
    });

    html.find('.rollAbility').mousedown(ev => {
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'ability'}).render(true);
    });

    html.find('.roll-ability').mousedown(ev => {
      var ability = $(ev.target).attr("data-ability");
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'ability', ability: ability}).render(true);
    });

    html.find('.roll-pool').mousedown(ev => {
      var pool = $(ev.target).attr("data-pool");
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'ability', pool: pool}).render(true);
    });

    html.find('.roll-action').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'action', actionId: item.id}).render(true);
    });

    html.find('.join-battle').mousedown(ev => {
      if (this.actor.data.type=== "npc") {
          new RollForm(this.actor, {event:ev}, {}, {rollType: 'joinBattle', pool: 'joinbattle'}).render(true);
      }
      else {
          new RollForm(this.actor, {event:ev}, {}, {rollType: 'joinBattle', ability: 'awareness', attribute: 'wits'}).render(true);
      }
    });

    html.find('.accuracy').mousedown(ev => {
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'accuracy'}).render(true);
    });

    html.find('.damage').mousedown(ev => {
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'damage'}).render(true);
    });

    html.find('.shape-sorcery').mousedown(ev => {
      if (this.actor.data.type === "npc") {
          new RollForm(this.actor, {event:ev}, {}, {rollType: 'sorcery', pool: 'sorcery'}).render(true);
      }
      else {
        new RollForm(this.actor, {event:ev}, {}, {rollType: 'sorcery', ability: 'occult', attribute: 'intelligence'}).render(true);
      }
    });

    html.find('.read-intentions').mousedown(ev => {
      if (this.actor.data.type === "npc") {
        new RollForm(this.actor, {event:ev}, {}, {rollType: 'readIntentions', pool: 'readintentions'}).render(true);
      }
      else {
        new RollForm(this.actor, {event:ev}, {}, {rollType: 'readIntentions', ability: 'socialize', attribute: 'perception'}).render(true);
      }
    });

    html.find('.social-influence').mousedown(ev => {
      if (this.actor.data.type === "npc") {
        new RollForm(this.actor, {event:ev}, {}, {rollType: 'social', pool: 'social'}).render(true);
      }
      else {
        new RollForm(this.actor, {event:ev}, {}, {rollType: 'social', ability: 'socialize', attribute: 'charisma'}).render(true);
      }
    });

    html.find('.show-craft').mousedown(ev => {
      this.showCraft();
    });

    html.find('.roll-withering').mousedown(ev => {
      let item = this.actor.items.get($(ev.target).attr("data-item-id"));
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'withering', attribute: item.data.data.attribute, ability: item.data.data.ability, accuracy: item.data.data.witheringaccuracy, damage: item.data.data.witheringdamage, overwhelming: item.data.data.overwhelming, weaponType: item.data.data.weapontype, isMagic: item.data.data.magic}).render(true);
    });

    html.find('.roll-decisive').mousedown(ev => {
      let item = this.actor.items.get($(ev.target).attr("data-item-id"));
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'decisive', attribute: item.data.data.attribute, ability: item.data.data.ability, accuracy: this.actor.type === 'npc' ? item.data.data.witheringaccuracy : 0, damage: 0, overwhelming: item.data.data.overwhelming, weaponType: item.data.data.weapontype, isMagic: item.data.data.magic}).render(true);
    });

    html.find('.roll-gambit').mousedown(ev => {
      let item = this.actor.items.get($(ev.target).attr("data-item-id"));
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'gambit', attribute: item.data.data.attribute, ability: item.data.data.ability, accuracy: this.actor.type === 'npc' ? item.data.data.witheringaccuracy : 0, damage: 0, overwhelming: item.data.data.overwhelming, weaponType: item.data.data.weapontype, isMagic: item.data.data.magic}).render(true);
    });

    html.find('#anima-up').click(ev => {
      this._updateAnima("up");
    });

    html.find('#anima-down').click(ev => {
      this._updateAnima("down");
    });

    html.find('.item-chat').click(ev => {
      this._displayCard(ev);
    });

    html.find('.craft-project').click(ev => {
      var type = $(ev.target).attr("data-type");
      // completeCraftProject(this.actor, type, 2);
      new RollForm(this.actor, {event:ev}, {}, {rollType: 'craft', ability: "craft", craftType : type, craftRating: 2}).render(true);
    });

    html.find('.item-complete').click(ev => {
      this._completeCraft(ev);
    });

    html.find('.item-spend').click(ev => {
      this._spendItem(ev);
    });

    html.find('.item-row').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    html.find('.saved-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      new RollForm(this.actor, {event:ev}, {}, {rollId: li.data("item-id")}).render(true);
    });

    html.find('.delete-saved-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      var key = li.data("item-id");
      const rollDeleteString = "data.savedRolls.-=" + key;

      let deleteConfirm = new Dialog({
        title: "Delete",
        content: "Delete Saved Roll?",
        buttons: {
          Yes: {
            icon: '<i class="fa fa-check"></i>',
            label: "Delete",
            callback: dlg => {
              this.actor.update({[rollDeleteString]: null});
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
      const item = this.actor.items.get(itemID);
      const newNumber = parseInt(ev.currentTarget.value);
      await this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemID,
          data: {
            value: newNumber,
          },
        }
      ]);
    });

    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _updateAnima(direction) {
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    let newLevel = "Dim";
    if (direction === "up") {
      if (data.anima.level === "Dim") {
        newLevel = "Glowing";
      }
      else if (data.anima.level === "Glowing") {
        newLevel = "Burning";
      }
      else {
        newLevel = "Bonfire";
      }
    }
    else {
      if (data.anima.level === "Bonfire") {
        newLevel = "Burning";
      }
      else if (data.anima.level === "Burning") {
        newLevel = "Glowing";
      }
      if (data.anima.level === "Glowing") {
        newLevel = "Dim";
      }
    }
    data.anima.level = newLevel;
    this.actor.update(actorData);
  }

  async calculateMotes(type) {
    const actorData = duplicate(this.actor);
    const data = actorData.data;

    if(type === 'personal') {
      if(data.details.exalt === 'solar' || data.details.exalt === 'abyssal') {
        data.motes.personal.max = 10 + (data.essence.value * 3);
      }
      if(data.details.exalt === 'dragonblood') {
        data.motes.personal.max = 11 + data.essence.value;
      }
      if(data.details.exalt === 'lunar') {
        data.motes.personal.max = 15 + data.essence.value;
      }
      if(data.details.exalt === 'exigent') {
        data.motes.personal.max = 11 + data.essence.value;
      }
      if(data.details.exalt === 'sidereal') {
        data.motes.personal.max = 9 + (data.essence.value * 2);
      }
      if(data.details.exalt === 'liminal') {
        data.motes.personal.max = 10 + (data.essence.value * 3);
      }
    }
    else {
      if(data.details.exalt === 'solar' || data.details.exalt === 'abyssal') {
        data.motes.peripheral.max = 27 + (data.essence.value * 7);
      }
      if(data.details.exalt === 'dragonblood') {
        data.motes.peripheral.max = 23 +(data.essence.value * 4);
      }
      if(data.details.exalt === 'lunar') {
        data.motes.peripheral.max = 34 + ( data.essence.value * 4);
      }
      if(data.details.exalt === 'exigent') {
        data.motes.peripheral.max = 23 + (data.essence.value * 4);
      }
      if(data.details.exalt === 'sidereal') {
        data.motes.peripheral.max = 25 + (data.essence.value * 6);
      }
      if(data.details.exalt === 'liminal') {
        data.motes.peripheral.max = 23 + (data.essence.value * 4);
      }
    }

    this.actor.update(actorData);
  }

  async calculateHealth(warstrider=false) {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.data;

    var oxBodyText = '';

    if(actorData.type !== 'npc') {
      if(data.details.exalt === 'solar') {
        if(data.attributes.stamina.value > 3) {
          oxBodyText = 'Ox Body: One -1 and one -2 level.';
        }
        else if(data.attributes.stamina.value > 5) {
          oxBodyText = 'Ox Body: One -1 and two -2 levels.';
        }
        else {
          oxBodyText = 'Ox Body: One -0, one -1, and one -2 level';
        }
      }
      if(data.details.exalt === 'dragonblooded') {
        if(data.attributes.stamina.value > 3) {
          oxBodyText = 'Ox Body: Two −2 levels';
        }
        else if(data.attributes.stamina.value > 5) {
          oxBodyText = 'Ox Body: One −1 and one −2 level';
        }
        else {
          oxBodyText = 'Ox Body: One −1 and two −2 levels';
        }
      }
      if(data.details.exalt === 'lunar') {
        if(data.attributes.stamina.value > 3) {
          oxBodyText = 'Ox Body: Two −2 levels.';
        }
        else if(data.attributes.stamina.value > 5) {
          oxBodyText = 'Ox Body: Two −2 levels and one −4 level';
        }
        else {
          oxBodyText = 'Ox Body: Two −2 levels and two −4 levels';
        }
      }
    }


    var template = "systems/exaltedthird/templates/dialogues/calculate-health.html";
    if(data.battlegroup && !warstrider) {
      template = "systems/exaltedthird/templates/dialogues/calculate-battlegroup-health.html";
    }
    const html = await renderTemplate(template, { 'oxBodyText': oxBodyText, 'zero': warstrider ? data.warstrider.health.levels.zero.value : data.health.levels.zero.value, 'one':  warstrider ? data.warstrider.health.levels.one.value : data.health.levels.one.value, 'two':  warstrider ? data.warstrider.health.levels.two.value : data.health.levels.two.value, 'four':  warstrider ? data.warstrider.health.levels.four.value : data.health.levels.four.value});

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
          if(warstrider) {
            data.warstrider.health.bashing = 0;
            data.warstrider.health.lethal = 0;
            data.warstrider.health.aggravated = 0;
            data.warstrider.health.levels.zero.value = zero;
            data.warstrider.health.levels.one.value = one;
            data.warstrider.health.levels.two.value = two;
            data.warstrider.health.levels.four.value = four;
          }
          else {
            data.health.bashing = 0;
            data.health.lethal = 0;
            data.health.aggravated = 0;
            data.health.levels.zero.value = zero;
            data.health.levels.one.value = one;
            data.health.levels.two.value = two;
            data.health.levels.four.value = four;
          }
          this.actor.update(actorData);
        }
      }
    }).render(true);
  }

  async recoverHealth(warstrider=false) {
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    if(warstrider) {
      data.warstrider.health.bashing = 0;
      data.warstrider.health.lethal = 0;
      data.warstrider.health.aggravated = 0;
    }
    else {
      data.health.bashing = 0;
      data.health.lethal = 0;
      data.health.aggravated = 0;
    }

    this.actor.update(actorData);
  }

  async showTags(type) {
    const template = type === "weapons" ? "systems/exaltedthird/templates/dialogues/weapon-tags.html" : "systems/exaltedthird/templates/dialogues/armor-tags.html";
    const html = await renderTemplate(template);
    new Dialog({
      title: `Tags`,
      content: html,
      buttons: {
        cancel: { label: "Close"}
      }
    }).render(true);
  }

  async showCraft() {
    const template = "systems/exaltedthird/templates/dialogues/craft-cheatsheet.html";
    const html = await renderTemplate(template);
    new Dialog({
      title: `Craft`,
      content: html,
      buttons: {
        cancel: { label: "Close"}
      }
    }).render(true);
  }

  async pickColor() {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    const template = "systems/exaltedthird/templates/dialogues/color-picker.html"
    const html = await renderTemplate(template, { 'color': data.details.color });
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
          if (isColor(color)) {
            data.details.color = color
            this.actor.update(actorData)
          }
        }
      }
    }).render(true);
  }

  async helpDialogue(type) {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    const template = "systems/exaltedthird/templates/dialogues/help-dialogue.html"
    const html = await renderTemplate(template, { 'type': type });
    new Dialog({
      title: `ReadMe`,
      content: html,
      buttons: {
        cancel: { label: "Close", callback: () => confirmed = false }
      }
    }).render(true);
  }

  _onSquareCounterChange(event) {
    event.preventDefault()
    const element = event.currentTarget
    const index = Number(element.dataset.index)
    const oldState = element.dataset.state || ''
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    const states = parseCounterStates(data.states)
    const fields = data.name.split('.')
    const steps = parent.find('.resource-counter-step')
    const fulls = Number(data[states['-']]) || 0
    const halfs = Number(data[states['/']]) || 0
    const crosses = Number(data[states['x']]) || 0

    if (index < 0 || index > steps.length) {
      return
    }

    const allStates = ['', ...Object.keys(states)]
    const currentState = allStates.indexOf(oldState)
    if (currentState < 0) {
      return
    }

    const newState = allStates[(currentState + 1) % allStates.length]
    steps[index].dataset.state = newState

    if ((oldState !== '' && oldState !== '-') || (oldState !== '')) {
      data[states[oldState]] = Number(data[states[oldState]]) - 1
    }

    // If the step was removed we also need to subtract from the maximum.
    if (oldState !== '' && newState === '') {
      data[states['-']] = Number(data[states['-']]) - 1
    }

    if (newState !== '') {
      data[states[newState]] = Number(data[states[newState]]) + Math.max(index + 1 - fulls - halfs - crosses, 1)
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
        $(this).css("background-color", actorData.data.details.color);
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

  _setupDotCounters(html) {
    const actorData = duplicate(this.actor)
    html.find('.resource-value').each(function () {
      const value = Number(this.dataset.value);
      $(this).find('.resource-value-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
          $(this).css("background-color", actorData.data.details.color);
        }
      })
    })
    html.find('.resource-value-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
          $(this).css("background-color", actorData.data.details.color);
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

      const values = new Array(halfs + crossed + stars);

      values.fill('/', 0, halfs);
      values.fill('x', halfs, halfs + crossed);
      values.fill('*', halfs + crossed, halfs + crossed + stars);

      $(this).find('.resource-counter-step').each(function () {
        this.dataset.state = ''
        if (this.dataset.index < values.length) {
          this.dataset.state = values[this.dataset.index];
        }
      })
    })
  }

  _toggleAugment(event) {
    event.preventDefault()
    const element = event.currentTarget
    const attribute = element.dataset.name
    const actorData = duplicate(this.actor)
    var augStatus = actorData.data.attributes[attribute].aug;
    actorData.data.attributes[attribute].aug = !augStatus;
    this.actor.update(actorData);
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
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

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
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  async _completeCraft(ev){
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));
    new RollForm(this.actor, {event:ev}, {}, {rollType: 'craft', ability: "craft", craftType : item.data.data.type, craftRating: item.data.data.rating}).render(true);
  }
  
  /**
* Display the chat card for an Item as a Chat Message
* @param {object} options          Options which configure the display of the item chat card
* @param {string} rollMode         The message visibility mode to apply to the created card
* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
*                                  the prepared message data (if false)
*/
  async _displayCard(event) {
    event.preventDefault();
    event.stopPropagation();
    // Render the chat card template
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));
    const token = this.actor.token;
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      item: item.data,
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

  _spendItem(event) {
    event.preventDefault();
    event.stopPropagation();

    const actorData = duplicate(this.actor);

    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));

    if(item.type === 'charm') {
      if(item.data.data.cost.motes > 0) {
        if(actorData.data.motes.peripheral.value > 0) {
          actorData.data.motes.peripheral.value = Math.max(0, actorData.data.motes.peripheral.value - item.data.data.cost.motes);
        }
        else {
          actorData.data.motes.personal.value = Math.max(0, actorData.data.motes.personal.value - item.data.data.cost.motes);
        }
      }
      actorData.data.willpower.value = Math.max(0, actorData.data.willpower.value - item.data.data.cost.willpower);
      if(this.actor.type === 'character') {
        actorData.data.craft.experience.silver.value = Math.max(0, actorData.data.craft.experience.silver.value - item.data.data.cost.silverxp);
        actorData.data.craft.experience.gold.value = Math.max(0, actorData.data.craft.experience.gold.value - item.data.data.cost.goldxp);
        actorData.data.craft.experience.white.value = Math.max(0, actorData.data.craft.experience.white.value - item.data.data.cost.whitexp);
      }
      if(actorData.data.details.aura === item.data.data.cost.aura || item.data.data.cost.aura === 'any') {
        actorData.data.details.aura = "none";
      }
      if(item.data.data.cost.initiative > 0) {
        let combat = game.combat;
        if (combat) {
            let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.actor.id);
            if (combatant) {
                var newInitiative = combatant.initiative - item.data.data.cost.initiative;
                if(combatant.initiative > 0 && newInitiative <= 0) {
                  newInitiative -= 5;
                }
                combat.setInitiative(combatant.id, newInitiative);
            }
        }
      }
      if(item.data.data.cost.anima > 0) {
        var newLevel = actorData.data.anima.level;
        for(var i = 0; i < item.data.data.cost.anima; i++) {
          if (newLevel === "Bonfire") {
            newLevel = "Burning";
          }
          else if (newLevel === "Burning") {
            newLevel = "Glowing";
          }
          if (newLevel === "Glowing") {
            newLevel = "Dim";
          }
        }
        actorData.data.anima.level = newLevel;
      }
      if(item.data.data.cost.health > 0) {
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(actorData.data.health.levels)) {
          totalHealth += health_level.value;
        }
        if(item.data.data.cost.healthtype === 'bashing') {
          actorData.data.health.bashing = Math.min(totalHealth - actorData.data.health.aggravated - actorData.data.health.lethal, actorData.data.health.bashing + item.data.data.cost.health);
        }
        else if(item.data.data.cost.healthtype === 'lethal') {
          actorData.data.health.lethal = Math.min(totalHealth - actorData.data.health.bashing - actorData.data.health.aggravated, actorData.data.health.lethal + item.data.data.cost.health);
        }
        else {
          actorData.data.health.aggravated = Math.min(totalHealth - actorData.data.health.bashing - actorData.data.health.lethal, actorData.data.health.aggravated + item.data.data.cost.health);
        }
      }
    }
    if(item.type === 'spell') {
      actorData.data.sorcery.motes = 0;
    }
    this._displayCard(event);
    this.actor.update(actorData);
  }
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

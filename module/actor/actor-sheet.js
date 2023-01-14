import TraitSelector from "../apps/trait-selector.js";
import { animaTokenMagic, RollForm } from "../apps/dice-roller.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";
import Importer from "../apps/importer.js";
import { prepareItemTraits } from "../item/item.js";
import { addDefensePenalty } from "./actor.js";

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

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const context = super.getData();
    context.dtypes = ["String", "Number", "Boolean"];

    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Update traits
    this._prepareTraits(context.system.traits);

    // Prepare items.
    if (this.actor.type === 'character') {
      this._prepareCharacterItems(context);
    }
    if (this.actor.type === 'npc') {
      this._prepareCharacterItems(context);
    }

    context.effects = prepareActiveEffectCategories(this.document.effects);

    return context;
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
    const destinies = [];

    const charms = {
      offensive: { name: 'Ex3.Offensive', visible: false, list: [] },
      offsensive: { name: 'Ex3.Offensive', visible: false, list: [] },
      defensive: { name: 'Ex3.Defensive', visible: false, list: [] },
      social: { name: 'Ex3.Social', visible: false, list: [] },
      mobility: { name: 'Ex3.Mobility', visible: false, list: [] },
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
      battles: { name: 'Ex3.Battles', visible: false, list: [] },
      brawl: { name: 'Ex3.Brawl', visible: false, list: [] },
      bureaucracy: { name: 'Ex3.Bureaucracy', visible: false, list: [] },
      craft: { name: 'Ex3.Craft', visible: false, list: [] },
      dodge: { name: 'Ex3.Dodge', visible: false, list: [] },
      endings: { name: 'Ex3.Endings', visible: false, list: [] },
      integrity: { name: 'Ex3.Integrity', visible: false, list: [] },
      investigation: { name: 'Ex3.Investigation', visible: false, list: [] },
      journeys: { name: 'Ex3.Journeys', visible: false, list: [] },
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
      secrets: { name: 'Ex3.Secrets', visible: false, list: [] },
      serenity: { name: 'Ex3.Serenity', visible: false, list: [] },
      socialize: { name: 'Ex3.Socialize', visible: false, list: [] },
      stealth: { name: 'Ex3.Stealth', visible: false, list: [] },
      survival: { name: 'Ex3.Survival', visible: false, list: [] },
      thrown: { name: 'Ex3.Thrown', visible: false, list: [] },
      war: { name: 'Ex3.War', visible: false, list: [] },
      evocation: { name: 'Ex3.Evocation', visible: false, list: [] },
      other: { name: 'Ex3.Other', visible: false, list: [] },
      universal: { name: 'Ex3.Universal', visible: false, list: [] },
    }

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
      else if (i.type === 'destiny') {
        destinies.push(i);
      }
      else if (i.type === 'charm') {
        if(siderealMaidenCharms[i.system.ability]) {
          sheetData.system.maidencharms[siderealMaidenCharms[i.system.ability]]++;
        }
        if (i.system.listingname) {
          if (charms[i.system.listingname]) {
          }
          else {
            charms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [] };
          }
          charms[i.system.listingname].list.push(i);
        }
        else if (i.system.martialart) {
          if (charms[i.system.martialart]) {
          }
          else {
            charms[i.system.martialart] = { name: i.system.martialart, visible: true, list: [] };
          }
          charms[i.system.martialart].list.push(i);
        }
        else {
          if (i.system.ability === 'martial' || i.system.ability === 'martialarts') {
            charms['martialarts'].list.push(i);
            charms['martialarts'].visible = true;
            if (sheetData.system.abilities['martialarts'].favored) {
            }
            else {
            }
          }
          else if (i.system.ability === 'essence') {
            charms['evocation'].list.push(i);
            charms['evocation'].visible = true;
          }
          else if (i.system.ability !== undefined) {
            if(charms[i.system.ability]) {
              charms[i.system.ability].list.push(i);
              charms[i.system.ability].visible = true;
            }
            else {
              charms['other'].list.push(i);
              charms['other'].visible = true;
            }
          }
        }
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
    actorData.destinies = destinies;

    if (actorData.type === 'character') {
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
      for (let martialArt of actorData.martialarts) {
        sheetData.system.charcreation.spent.abovethree += Math.max(0, (martialArt.system.points - 3));
        if (sheetData.system.abilities['martialarts'].favored) {
          sheetData.system.charcreation.spent.bonuspoints += Math.max(0, (martialArt.system.points - 3));
        }
        else {
          sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (martialArt.system.points - 3))) * 2;
        }
        threeOrBelow += Math.min(3, martialArt.system.points);
      }
      for (let craft of actorData.crafts) {
        sheetData.system.charcreation.spent.abovethree += Math.max(0, (craft.system.points - 3));
        if (sheetData.system.abilities['craft'].favored) {
          sheetData.system.charcreation.spent.bonuspoints += Math.max(0, (craft.system.points - 3));
        }
        else {
          sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (craft.system.points - 3))) * 2;
        }
        threeOrBelow += Math.min(3, craft.system.points);
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
      sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.willpower.max - 5))) * 2;
      sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.merits - 10)));
      sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.specialties - 4)));
      sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.charms - 15))) * 4;
    }
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

    // html.find('.splat-xp').mousedown(ev => {
    //   this.showDialogue('splat-xp');
    // });

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

    html.find('.calculate-personal-motes').mousedown(ev => {
      this.calculateMotes('personal');
    });

    html.find('.calculate-peripheral-motes').mousedown(ev => {
      this.calculateMotes('peripheral');
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

    html.find('#recoveryScene').mousedown(ev => {
      this.recoverHealth();
    });

    html.find('#recoverySceneWarstrider').mousedown(ev => {
      this.recoverHealth('warstrider');
    });

    html.find('#recoverySceneShip').mousedown(ev => {
      this.recoverHealth('ship');
    });

    html.find('.add-defense-penalty').mousedown(ev => {
      addDefensePenalty(this.actor);
    });

    html.find('.add-onslaught-penalty').mousedown(ev => {
      addDefensePenalty(this.actor, 'Onslaught');
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

    html.find('.rout-check').mousedown(ev => {
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'rout', pool: 'willpower' }).render(true);
    });

    html.find('.roll-action').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'action', actionId: item.id }).render(true);
    });

    html.find('.roll-ma').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'martialArt', martialArtId: item.id }).render(true);
    });

    html.find('.roll-craft').mousedown(ev => {
      let li = $(event.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("item-id"));
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'craftAbilityRoll', craftId: item.id }).render(true);
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

    html.find('.item-chat').click(ev => {
      this._displayCard(ev);
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

    html.find('.quick-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      new RollForm(this.actor, { event: ev }, {}, { rollId: li.data("saved-roll-id"), skipDialog: true }).roll();
    });

    html.find('.saved-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollId: li.data("saved-roll-id") }).render(true);
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
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    let newLevel = data.anima.level;
    let newValue = data.anima.value;
    if (direction === "up") {
      if (data.anima.level !== "Transcendent") {
        if (data.anima.level === "Dim") {
          newLevel = "Glowing";
          newValue = 1;
        }
        else if (data.anima.level === "Glowing") {
          newLevel = "Burning";
          newValue = 2;
        }
        else {
          newLevel = "Bonfire";
          newValue = 3;
        }
      }
      if (data.anima.level === 'Bonfire' && data.anima.max === 4) {
        newLevel = "Transcendent";
        newValue = 4;
      }
    }
    else {
      if (data.anima.level === "Transcendent") {
        newLevel = "Bonfire";
        newValue = 3;
      }
      else if (data.anima.level === "Bonfire") {
        newLevel = "Burning";
        newValue = 2;
      }
      else if (data.anima.level === "Burning") {
        newLevel = "Glowing";
        newValue = 1;
      }
      else if (data.anima.level === "Glowing") {
        newLevel = "Dim";
        newValue = 0;
      }
    }
    data.anima.level = newLevel;
    data.anima.value = newValue;
    animaTokenMagic(this.actor, newValue);
    this.actor.update(actorData);
  }

  async calculateDerivedStats(type) {
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    var armoredSoakValue = 0;
    if (type === 'natural-soak') {
      data.naturalsoak.value = data.attributes.stamina.value;
    }
    if (type === 'soak' || type === 'armored-soak') {
      for (let armor of this.actor.armor) {
        if (armor.system.equipped) {
          armoredSoakValue = armoredSoakValue + armor.system.soak;
        }
      }
      if (type === 'armored-soak') {
        data.armoredsoak.value = armoredSoakValue;
      }
      if (type === 'soak') {
        data.soak.value = data.attributes.stamina.value + armoredSoakValue;
      }
    }
    if (type === 'parry') {
      var highestAbility = Math.max(data.abilities.melee.value, data.abilities.brawl.value, data.abilities.martialarts.value);
      data.parry.value = Math.ceil((data.attributes.dexterity.value + highestAbility) / 2);
      for (let weapon of this.actor.weapons) {
        if (weapon.system.equipped) {
          data.parry.value = data.parry.value + weapon.system.defense;
        }
      }
    }
    if (type === 'evasion') {
      var newEvasionValue = Math.ceil((data.attributes.dexterity.value + data.abilities.dodge.value) / 2);
      for (let armor of this.actor.armor) {
        if (armor.system.equipped) {
          newEvasionValue = newEvasionValue - Math.abs(armor.system.penalty);
        }
      }
      data.evasion.value = newEvasionValue;
    }
    if (type === 'resolve') {
      data.resolve.value = Math.ceil((data.attributes.wits.value + data.abilities.integrity.value) / 2);
    }
    if (type === 'guile') {
      data.guile.value = Math.ceil((data.attributes.manipulation.value + data.abilities.socialize.value) / 2);
    }
    this.actor.update(actorData);
  }

  async setSpendPool(type) {
    const actorData = duplicate(this.actor);
    actorData.system.settings.charmmotepool = type;
    this.actor.update(actorData);
  }

  async calculateMotes(type) {
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    if (data.details.exalt === 'other' || (actorData.type === 'npc' && data.creaturetype !== 'exalt')) return;

    if (type === 'personal') {
      if (data.details.exalt === 'solar' || data.details.exalt === 'abyssal') {
        data.motes.personal.max = 10 + (data.essence.value * 3);
      }
      if (data.details.exalt === 'dragonblooded') {
        data.motes.personal.max = 11 + data.essence.value;
      }
      if (data.details.exalt === 'lunar') {
        data.motes.personal.max = 15 + data.essence.value;
      }
      if (data.details.exalt === 'exigent') {
        data.motes.personal.max = 11 + data.essence.value;
      }
      if (data.details.exalt === 'sidereal') {
        data.motes.personal.max = 9 + (data.essence.value * 2);
      }
      if (data.details.exalt === 'liminal') {
        data.motes.personal.max = 10 + (data.essence.value * 3);
      }
      if (data.details.exalt === 'dreamsouled' || data.details.caste.toLowerCase() === 'sovereign' || data.details.caste.toLowerCase() === 'architect' || data.details.caste.toLowerCase() === 'puppeteer') {
        data.motes.personal.max = 11 + data.essence.value;
      }
      if (data.details.caste.toLowerCase() === 'janest' || data.details.caste.toLowerCase() === 'strawmaiden' || data.details.exalt === 'hearteater' || data.details.exalt === 'umbral') {
        data.motes.personal.max = 11 + (data.essence.value * 2);
      }
      data.motes.personal.value = (data.motes.personal.max - this.actor.system.motes.personal.committed);
    }
    else {
      if (data.details.exalt === 'solar' || data.details.exalt === 'abyssal') {
        data.motes.peripheral.max = 26 + (data.essence.value * 7);
      }
      if (data.details.exalt === 'dragonblooded') {
        data.motes.peripheral.max = 23 + (data.essence.value * 4);
      }
      if (data.details.exalt === 'lunar') {
        data.motes.peripheral.max = 34 + (data.essence.value * 4);
      }
      if (data.details.exalt === 'exigent') {
        data.motes.peripheral.max = 23 + (data.essence.value * 4);
      }
      if (data.details.exalt === 'sidereal') {
        data.motes.peripheral.max = 25 + (data.essence.value * 6);
      }
      if (data.details.exalt === 'liminal') {
        data.motes.peripheral.max = 23 + (data.essence.value * 4);
      }
      if (data.details.exalt === 'dreamsouled' || data.details.caste.toLowerCase() === 'sovereign' || data.details.caste.toLowerCase() === 'architect' || data.details.caste.toLowerCase() === 'puppeteer') {
        data.motes.peripheral.max = 23 + (data.essence.value * 4);
      }
      if (data.details.caste.toLowerCase() === 'janest' || data.details.caste.toLowerCase() === 'strawmaiden' || data.details.exalt === 'hearteater' || data.details.exalt === 'umbral') {
        data.motes.peripheral.max = 27 + (data.essence.value * 6);
      }
      data.motes.peripheral.value = (data.motes.peripheral.max - this.actor.system.motes.peripheral.committed);
    }
    this.actor.update(actorData);
  }

  async calculateHealth(healthType = 'person') {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.system;

    var oxBodyText = '';

    if (actorData.type !== 'npc') {
      if (data.details.exalt === 'solar') {
        if (data.attributes.stamina.value > 3) {
          oxBodyText = 'Ox Body: One -1 and one -2 level.';
        }
        else if (data.attributes.stamina.value > 5) {
          oxBodyText = 'Ox Body: One -1 and two -2 levels.';
        }
        else {
          oxBodyText = 'Ox Body: One -0, one -1, and one -2 level';
        }
      }
      if (data.details.exalt === 'dragonblooded') {
        if (data.attributes.stamina.value > 3) {
          oxBodyText = 'Ox Body: Two −2 levels';
        }
        else if (data.attributes.stamina.value > 5) {
          oxBodyText = 'Ox Body: One −1 and one −2 level';
        }
        else {
          oxBodyText = 'Ox Body: One −1 and two −2 levels';
        }
      }
      if (data.details.exalt === 'lunar') {
        if (data.attributes.stamina.value > 3) {
          oxBodyText = 'Ox Body: Two −2 levels.';
        }
        else if (data.attributes.stamina.value > 5) {
          oxBodyText = 'Ox Body: Two −2 levels and one −4 level';
        }
        else {
          oxBodyText = 'Ox Body: Two −2 levels and two −4 levels';
        }
      }
    }


    var template = "systems/exaltedthird/templates/dialogues/calculate-health.html";
    if (data.battlegroup && healthType === 'person') {
      template = "systems/exaltedthird/templates/dialogues/calculate-battlegroup-health.html";
    }

    var templateData = {
      'oxBodyText': oxBodyText,
      'healthType': healthType,
    }
    if (healthType === 'warstrider') {
      templateData.zero = data.warstrider.health.levels.zero.value;
      templateData.one = data.warstrider.health.levels.one.value;
      templateData.two = data.warstrider.health.levels.two.value;
      templateData.four = data.warstrider.health.levels.four.value;
    }
    else if (healthType === 'ship') {
      templateData.zero = data.ship.health.levels.zero.value;
      templateData.one = data.ship.health.levels.one.value;
      templateData.two = data.ship.health.levels.two.value;
      templateData.four = data.ship.health.levels.four.value;
    }
    else {
      templateData.zero = data.health.levels.zero.value;
      templateData.one = data.health.levels.one.value;
      templateData.two = data.health.levels.two.value;
      templateData.four = data.health.levels.four.value;
      templateData.penaltyMod = data.health.penaltymod;
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
          if (healthType === 'warstrider') {
            data.warstrider.health.bashing = 0;
            data.warstrider.health.lethal = 0;
            data.warstrider.health.aggravated = 0;
            data.warstrider.health.levels.zero.value = zero;
            data.warstrider.health.levels.one.value = one;
            data.warstrider.health.levels.two.value = two;
            data.warstrider.health.levels.four.value = four;
          }
          else if (healthType === 'ship') {
            data.ship.health.bashing = 0;
            data.ship.health.lethal = 0;
            data.ship.health.aggravated = 0;
            data.ship.health.levels.zero.value = zero;
            data.ship.health.levels.one.value = one;
            data.ship.health.levels.two.value = two;
            data.ship.health.levels.four.value = four;
          }
          else {
            data.health.bashing = 0;
            data.health.lethal = 0;
            data.health.aggravated = 0;
            data.health.levels.zero.value = zero;
            data.health.levels.one.value = one;
            data.health.levels.two.value = two;
            data.health.levels.four.value = four;
            data.health.penaltymod = penaltyMod;
          }
          this.actor.update(actorData);
        }
      }
    }).render(true);
  }

  async recoverHealth(healthType = 'person') {
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    if (healthType === 'warstrider') {
      data.warstrider.health.bashing = 0;
      data.warstrider.health.lethal = 0;
      data.warstrider.health.aggravated = 0;
    }
    else if (healthType === 'ship') {
      data.ship.health.bashing = 0;
      data.ship.health.lethal = 0;
      data.ship.health.aggravated = 0;
    }
    else {
      data.health.bashing = 0;
      data.health.lethal = 0;
      data.health.aggravated = 0;
    }
    this.actor.update(actorData);
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
      case 'splat-xp':
        template = "systems/exaltedthird/templates/dialogues/splat-xp-dialogue.html";
      case 'bonus-points':
        template = "systems/exaltedthird/templates/dialogues/bonus-points-dialogue.html";
        break;
      default:
        break;
    }
    const html = await renderTemplate(template, { 'exalt': this.actor.system.details.exalt, 'caste': this.actor.system.details.caste, 'flatXP': game.settings.get("exaltedthird", "flatXP") });
    new Dialog({
      title: `Tags`,
      content: html,
      buttons: {
        cancel: { label: "Close" }
      }
    }).render(true);
  }

  async pickColor() {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    const html = await renderTemplate("systems/exaltedthird/templates/dialogues/color-picker.html", { 'color': data.details.color, 'animaColor': data.details.animacolor });
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
            data.details.color = color;
          }
          if (isColor(animaColor)) {
            data.details.animacolor = animaColor;
          }
          this.actor.update(actorData);
        }
      }
    }).render(true);
  }

  async sheetSettings() {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    const template = "systems/exaltedthird/templates/dialogues/sheet-settings.html"
    const html = await renderTemplate(template, { settings: data.settings, 'maxAnima': data.anima.max });
    new Dialog({
      title: `Settings`,
      content: html,
      buttons: {
        save: { label: "Save", callback: () => confirmed = true },
        cancel: { label: "Close", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          data.settings.charmmotepool = html.find('#charmMotePool').val();
          data.settings.showwarstrider = html.find('#showWarstrider').is(":checked");
          data.settings.showship = html.find('#showShip').is(":checked");
          data.settings.showescort = html.find('#showEscort').is(":checked");
          data.settings.showzerovalues = html.find('#showZeroValues').is(":checked");
          data.settings.usetenattributes = html.find('#useTenAttributes').is(":checked");
          data.anima.max = parseInt(html.find('#maxAnima').val());
          data.settings.rollStunts = html.find('#rollStunts').is(":checked");
          data.settings.defenseStunts = html.find('#defenseStunts').is(":checked");
          data.settings.editmode = html.find('#editMode').is(":checked");
          data.settings.issorcerer = html.find('#isSorcerer').is(":checked");
          data.settings.iscrafter = html.find('#isCrafter').is(":checked");
          this.actor.update(actorData);
        }
      }
    }).render(true);
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
    const actorData = duplicate(this.actor)
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
          $(this).addClass('active')
          $(this).css("background-color", actorData.system.details.color);
        }
      });
    })
    html.find('.resource-value-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
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

      const values = new Array(halfs + crossed + stars);

      values.fill('/', 0, halfs);
      values.fill('x', halfs, halfs + crossed);
      values.fill('*', halfs + crossed, halfs + crossed + stars);

      $(this).find('.resource-counter-step').each(function () {
        this.dataset.state = ''
        if (this.dataset.index < values.length) {
          this.dataset.state = values[this.dataset.index];
        }
      });
    });
  }

  _toggleAugment(event) {
    event.preventDefault()
    const element = event.currentTarget
    const attribute = element.dataset.name
    const actorData = duplicate(this.actor)
    var augStatus = actorData.system.attributes[attribute].aug;
    actorData.system.attributes[attribute].aug = !augStatus;
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
    });
  }

  _spendItem(event) {
    event.preventDefault();
    event.stopPropagation();

    const actorData = duplicate(this.actor);

    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));

    if (item.type === 'charm') {
      if (item.system.active) {
        item.update({
          [`system.active`]: false,
        });
        if (actorData.system.settings.charmmotepool === 'personal') {
          if (item.system.cost.commitmotes > 0) {
            actorData.system.motes.personal.committed -= item.system.cost.commitmotes;
          }
        }
        else {
          if (item.system.cost.commitmotes > 0) {
            actorData.system.motes.peripheral.committed -= item.system.cost.commitmotes;
          }
        }
      }
      else {
        var newLevel = actorData.system.anima.level;
        var newValue = actorData.system.anima.value;
        if (item.system.cost.anima > 0) {
          for (var i = 0; i < item.system.cost.anima; i++) {
            if (newLevel === "Transcendent") {
              newLevel = "Bonfire";
              newValue = 3;
            }
            else if (newLevel === "Bonfire") {
              newLevel = "Burning";
              newValue = 2;
            }
            else if (newLevel === "Burning") {
              newLevel = "Glowing";
              newValue = 1;
            }
            if (newLevel === "Glowing") {
              newLevel = "Dim";
              newValue = 0;
            }
          }
        }
        if (item.system.cost.motes > 0 || item.system.cost.commitmotes > 0) {
          var spendingMotes = item.system.cost.motes + item.system.cost.commitmotes;
          var spentPersonal = 0;
          var spentPeripheral = 0;
          if (actorData.system.settings.charmmotepool === 'personal') {
            var remainingPersonal = actorData.system.motes.personal.value - spendingMotes;
            if (remainingPersonal < 0) {
              spentPersonal = spendingMotes + remainingPersonal;
              spentPeripheral = Math.min(actorData.system.motes.peripheral.value, Math.abs(remainingPersonal));
            }
            else {
              spentPersonal = spendingMotes;
            }
            if (item.system.cost.commitmotes > 0) {
              actorData.system.motes.personal.committed += item.system.cost.commitmotes;
            }
          }
          else {
            var remainingPeripheral = actorData.system.motes.peripheral.value - spendingMotes;
            if (remainingPeripheral < 0) {
              spentPeripheral = spendingMotes + remainingPeripheral;
              spentPersonal = Math.min(actorData.system.motes.personal.value, Math.abs(remainingPeripheral));
            }
            else {
              spentPeripheral = spendingMotes;
            }
            if (item.system.cost.commitmotes > 0) {
              actorData.system.motes.peripheral.committed += item.system.cost.commitmotes;
            }
          }
          actorData.system.motes.peripheral.value = Math.max(0, actorData.system.motes.peripheral.value - spentPeripheral);
          actorData.system.motes.personal.value = Math.max(0, actorData.system.motes.personal.value - spentPersonal);

          if (spentPeripheral > 4 && !item.system.keywords.toLowerCase().includes('mute')) {
            for (var i = 0; i < Math.floor(spentPeripheral / 5); i++) {
              if (newLevel === "Dim") {
                newLevel = "Glowing";
                newValue = 1;
              }
              else if (newLevel === "Glowing") {
                newLevel = "Burning";
                newValue = 2;
              }
              else if (newLevel === "Burning") {
                newLevel = "Bonfire";
                newValue = 3;
              }
              else if (actorData.system.anima.max === 4) {
                newLevel = "Transcendent";
                newValue = 4;
              }
            }
          }
          if (item.system.cost.commitmotes > 0) {
            item.update({
              [`system.active`]: true,
            });
          }
        }
        actorData.system.anima.level = newLevel;
        actorData.system.anima.value = newValue;
        actorData.system.willpower.value = Math.max(0, actorData.system.willpower.value - item.system.cost.willpower);
        if (this.actor.type === 'character') {
          actorData.system.craft.experience.silver.value = Math.max(0, actorData.system.craft.experience.silver.value - item.system.cost.silverxp);
          actorData.system.craft.experience.gold.value = Math.max(0, actorData.system.craft.experience.gold.value - item.system.cost.goldxp);
          actorData.system.craft.experience.white.value = Math.max(0, actorData.system.craft.experience.white.value - item.system.cost.whitexp);
        }
        if (actorData.system.details.aura === item.system.cost.aura || item.system.cost.aura === 'any') {
          actorData.system.details.aura = "none";
        }
        if (item.system.cost.initiative > 0) {
          let combat = game.combat;
          if (combat && this.actor.token) {
            let combatant = combat.combatants.find(c => c?.tokenId == this.actor.token.id);
            if (combatant) {
              var newInitiative = combatant.initiative - item.system.cost.initiative;
              if (combatant.initiative > 0 && newInitiative <= 0) {
                newInitiative -= 5;
              }
              combat.setInitiative(combatant.id, newInitiative);
            }
          }
        }
        if (item.system.cost.health > 0) {
          let totalHealth = 0;
          for (let [key, health_level] of Object.entries(actorData.system.health.levels)) {
            totalHealth += health_level.value;
          }
          if (item.system.cost.healthtype === 'bashing') {
            actorData.system.health.bashing = Math.min(totalHealth - actorData.system.health.aggravated - actorData.system.health.lethal, actorData.system.health.bashing + item.system.cost.health);
          }
          else if (item.system.cost.healthtype === 'lethal') {
            actorData.system.health.lethal = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.aggravated, actorData.system.health.lethal + item.system.cost.health);
          }
          else {
            actorData.system.health.aggravated = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.lethal, actorData.system.health.aggravated + item.system.cost.health);
          }
        }
        animaTokenMagic(this.actor, newValue);
      }
    }
    if (item.type === 'spell') {
      actorData.system.sorcery.motes = 0;
    }
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

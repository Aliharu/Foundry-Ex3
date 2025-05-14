import RollForm from "../apps/dice-roller.js";
import { animaTokenMagic } from "../utils/other-modules.js";

import Importer from "../apps/importer.js";
import Prophecy from "../apps/prophecy.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";
import { prepareItemTraits } from "../item/item.js";
import { isColor, parseCounterStates, toggleDisplay } from "../utils/utils.js";
import TraitSelector from "../apps/trait-selector.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ExaltedThirdActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    this.collapseStates = {
      charm: {},
      spell: {},
    }
  }

  static DEFAULT_OPTIONS = {
    window: {
      title: "Actor Sheet",
      resizable: true,
      controls: [
        {
          icon: 'fa-solid fa-cog',
          label: "Ex3.Settings",
          action: "sheetSettings",
        },
        {
          icon: 'fa-solid fa-question',
          label: "Help",
          action: "helpDialogue",
        },
        {
          icon: 'fa-solid fa-palette',
          label: "Ex3.Stylings",
          action: "pickColor",
        },
        {
          icon: 'fa-solid fa-dice-d10',
          label: "Ex3.Roll",
          action: "baseRoll",
        },
      ]
    },
    position: { width: 800, height: 1061 },
    classes: ["exaltedthird", "sheet", "actor"],
    actions: {
      onEditImage: this._onEditImage,
      sheetSettings: this.sheetSettings,
      helpDialogue: this.helpDialogue,
      pickColor: this.pickColor,
      baseRoll: this.baseRoll,
      createItem: this.createItem,
      itemAction: this.itemAction,
      savedRollAction: this.savedRollAction,
      lastRoll: this.lastRoll,
      makeActionRoll: this.makeActionRoll,
      rollAction: this.rollAction,
      updateAnima: this.updateAnima,
      lunarSync: this.lunarSync,
      displayDataChat: this._displayDataChat,
      importItem: this.importItem,
      showDialog: this.showDialog,
      calculateHealth: this.calculateHealth,
      calculateDerivedStat: this.calculateDerivedStat,
      recoverHealth: this.recoverHealth,
      alterDefensePenalty: this.alterDefensePenalty,
      setDiceCap: this.setDiceCap,
      setSpendPool: this.setSpendPool,
      calculateMotes: this.calculateMotes,
      createProphecy: this.createProphecy,
      editTraits: this.editTraits,
      dotCounterChange: this._onDotCounterChange,
      squareCounterChange: this._onSquareCounterChange,
      effectControl: this.effectControl,
      toggleCollapse: this.toggleCollapse,
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
  };

  get title() {
    return `${game.i18n.localize(this.actor.name)}`
  }

  static PARTS = {
    header: {
      template: "systems/exaltedthird/templates/actor/actor-header.html",
    },
    tabs: { template: 'systems/exaltedthird/templates/dialogues/tabs.html' },
    stats: {
      template: "systems/exaltedthird/templates/actor/stats-tab.html",
    },
    combat: {
      template: "systems/exaltedthird/templates/actor/combat-tab.html",
    },
    social: {
      template: "systems/exaltedthird/templates/actor/social-tab.html",
    },
    charms: {
      template: "systems/exaltedthird/templates/actor/charms-tab.html",
    },
    character: {
      template: "systems/exaltedthird/templates/actor/character-tab.html",
    },
    effects: {
      template: "systems/exaltedthird/templates/actor/actor-effects-tab.html",
    },
    biography: {
      template: "systems/exaltedthird/templates/actor/biography-tab.html",
    },
  };

  _initializeApplicationOptions(options) {
    options.classes = [options.document.getSheetBackground(), "exaltedthird", "sheet", "actor"];
    return super._initializeApplicationOptions(options);
  }


  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    if (game.settings.get("exaltedthird", "compactSheets")) {
      options.position.height = 620;
      options.position.width = 560;
    }
  }

  async _prepareContext(_options) {
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      // Add the actor document.
      actor: this.actor,
      // Add the actor's data to context.data for easier access, as well as flags.
      system: this.actor.system,
      flags: this.actor.flags,
      config: CONFIG.EXALTEDTHIRD,
      isNPC: this.actor.type === 'npc',
      characterEditMode: (this.actor.type === 'character' && this.actor.system.settings.editmode),
      collapseStates: this.collapseStates,
    };

    if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'stats';
    context.selects = CONFIG.exaltedthird.selects;
    const tabs = [{
      id: 'stats',
      group: 'primary',
      label: 'Ex3.Stats',
      cssClass: this.tabGroups['primary'] === 'stats' ? 'active' : '',
    }, {
      id: 'combat',
      group: 'primary',
      label: 'Ex3.Combat',
      cssClass: this.tabGroups['primary'] === 'combat' ? 'active' : '',
    },
    {
      id: 'social',
      group: 'primary',
      label: 'Ex3.Social',
      cssClass: this.tabGroups['primary'] === 'social' ? 'active' : '',
    },
    {
      id: 'charms',
      group: 'primary',
      label: 'Ex3.Charms',
      cssClass: this.tabGroups['primary'] === 'charms' ? 'active' : '',
    },
    {
      id: "character",
      group: "primary",
      label: "Ex3.Character",
      cssClass: this.tabGroups['primary'] === 'character' ? 'active' : '',
    },
    {
      id: 'effects',
      group: 'primary',
      label: 'Ex3.Effects',
      cssClass: this.tabGroups['primary'] === 'effects' ? 'active' : '',
    }];
    tabs.push({
      id: "biography",
      group: "primary",
      label: "Ex3.Description",
      cssClass: this.tabGroups['primary'] === 'biography' ? 'active' : '',
    });
    context.tabs = tabs;
    context.dtypes = ["String", "Number", "Boolean"];

    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );
    context.attributeList = CONFIG.exaltedthird.attributes;
    context.signList = CONFIG.exaltedthird.siderealSigns;
    context.abilityList = JSON.parse(JSON.stringify(CONFIG.exaltedthird.abilities));
    context.rollData = this.actor.getRollData();
    context.showVirtues = game.settings.get("exaltedthird", "virtues");
    context.unifiedCharacterCreation = game.settings.get("exaltedthird", "unifiedCharacterCreation");
    context.unifiedCharacterAdvancement = game.settings.get("exaltedthird", "unifiedCharacterAdvancement");
    context.bankableStunts = game.settings.get("exaltedthird", "bankableStunts");
    context.useShieldInitiative = game.settings.get("exaltedthird", "useShieldInitiative");
    context.simplifiedCrafting = game.settings.get("exaltedthird", "simplifiedCrafting");
    context.steadyAction = game.settings.get("exaltedthird", "steadyAction");
    context.gloryOverwhelming = game.settings.get("exaltedthird", "gloryOverwhelming");
    context.abilitySelectList = CONFIG.exaltedthird.selects.abilities;
    context.abilityWithCustomsSelectList = { ...CONFIG.exaltedthird.selects.abilities };
    context.isExalt = this.actor.type === 'character' || this.actor.system.creaturetype === 'exalt';

    for (const customAbility of this.actor.items.filter(item => item.type === 'customability')) {
      context.abilityWithCustomsSelectList[customAbility.id] = customAbility.name;
    }

    context.activeSpell = context.items?.find(item => item.system?.shaping);
    context.availableCastes = null;
    context.availableCastes = CONFIG.exaltedthird.castes[context.system.details.exalt];
    context.selects = CONFIG.exaltedthird.selects;
    let characterLunars = {
      '': 'Ex3.None'
    }
    for (const lunar of game.actors.filter(actor => actor.system.details.exalt === 'lunar' && actor.id !== this.actor.id).sort((a, b) => a.name.localeCompare(b.name))) {
      characterLunars[lunar.id] = lunar.name;
    }
    // context.characterLunars = game.actors.filter(actor => actor.system.details.exalt === 'lunar' && actor.id !== this.actor.id).map((actor) => {
    //   return {
    //     id: actor.id,
    //     label: actor.name
    //   }
    // });
    context.characterLunars = characterLunars;
    this._prepareTraits(context.system.traits);
    this._prepareActorSheetData(context);
    this._prepareCharacterItems(context);
    if (this.actor.type === 'character') {
      this._prepareCharacterData(context);
    }
    if (this.actor.type === 'npc') {
      this._prepareNPCData(context);
    }
    context.itemDescriptions = {};
    for (let item of this.actor.items) {
      context.itemDescriptions[item.id] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: item });
    }

    context.effects = prepareActiveEffectCategories(this.document.effects);
    context.tab = this.tabGroups['primary'];
    return context;
  }

  async _preparePartContext(partId, context) {
    context.tab = context.tabs.find(item => item.id === partId);
    return context;
  }

  _prepareActorSheetData(sheetData) {
    const actorData = sheetData.actor;

    for (let [key, setting] of Object.entries(sheetData.system.settings.rollsettings)) {
      setting.name = CONFIG.exaltedthird.rolltypes[key];
    }
    for (let [key, setting] of Object.entries(sheetData.system.settings.attackrollsettings)) {
      setting.name = CONFIG.exaltedthird.attackrolltypes[key];
    }
    for (let [key, setting] of Object.entries(sheetData.system.settings.staticcapsettings)) {
      setting.name = CONFIG.exaltedthird.statictypes[key];
    }

    var currentParryPenalty = 0;
    var currentEvasionPenalty = 0;
    var currentOnslaughtPenalty = 0;
    var currentDefensePenalty = 0;

    for (const effect of actorData.effects.filter((effect) => !effect.disabled)) {
      for (const change of effect.changes) {
        if (change.key === 'system.evasion.value' && change.value < 0 && change.mode === 2) {
          currentEvasionPenalty += (change.value * -1);
        }
        if (change.key === 'system.parry.value' && change.value < 0 && change.mode === 2) {
          currentParryPenalty += (change.value * -1);
        }
      }
      if (effect.flags.exaltedthird?.statusId === 'onslaught') {
        currentOnslaughtPenalty += (effect.changes[0].value * -1);
      }
      if (effect.flags.exaltedthird?.statusId === 'defensePenalty') {
        currentDefensePenalty += (effect.changes[0].value * -1);
      }
    }
    if (actorData.effects.some(e => e.statuses.has('prone'))) {
      currentParryPenalty += 1;
      currentEvasionPenalty += 2;
    }
    if (actorData.effects.some(e => e.statuses.has('surprised'))) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }
    if (actorData.effects.some(e => e.statuses.has('grappled')) || actorData.effects.some(e => e.statuses.has('grappling'))) {
      currentParryPenalty += 2;
      currentEvasionPenalty += 2;
    }
    currentParryPenalty += Math.max(0, (actorData.system.health.penalty === 'inc' ? 4 : sheetData.system.health.penalty) - sheetData.system.health.penaltymod);
    currentEvasionPenalty += Math.max(0, (actorData.system.health.penalty === 'inc' ? 4 : sheetData.system.health.penalty) - sheetData.system.health.penaltymod);
    sheetData.system.currentParryPenalty = currentParryPenalty;
    sheetData.system.currentEvasionPenalty = currentEvasionPenalty;
    sheetData.system.currentOnslaughtPenalty = currentOnslaughtPenalty;
    sheetData.system.currentDefensePenalty = currentDefensePenalty;

    if (actorData.type === "character" || sheetData.system.creaturetype === 'exalt') {
      sheetData.system.parry.cap = this.actor._getStaticCap(actorData, 'parry', sheetData.system.parry.value);
      if (sheetData.system.parry.cap !== '') {
        sheetData.system.evasion.padding = true;
        sheetData.system.defenseCapPadding = true;
      }
      sheetData.system.evasion.cap = this.actor._getStaticCap(actorData, 'evasion', sheetData.system.evasion.value);
      if (sheetData.system.evasion.cap !== '') {
        sheetData.system.evasion.padding = false;
        if (sheetData.system.parry.cap === '') {
          sheetData.system.parry.padding = true;
        }
        sheetData.system.defenseCapPadding = true;
      }
      sheetData.system.guile.cap = this.actor._getStaticCap(actorData, 'guile', sheetData.system.guile.value);
      if (sheetData.system.guile.cap !== '') {
        sheetData.system.resolve.padding = true;
        sheetData.system.socialCapPadding = true;
      }
      sheetData.system.resolve.cap = this.actor._getStaticCap(actorData, 'resolve', sheetData.system.resolve.value);
      if (sheetData.system.resolve.cap !== '') {
        if (sheetData.system.guile.cap === '') {
          sheetData.system.guile.padding = true;
        }
        sheetData.system.resolve.padding = false;
        sheetData.system.socialCapPadding = true;
      }
      sheetData.system.soak.cap = this.actor._getStaticCap(actorData, 'soak', actorData.type === "character" ? (sheetData.system.attributes?.stamina?.value || 0) : sheetData.system.soak.value);
    }

    sheetData.system.usedCharmSlots = this.actor.items.filter(item => item.type === 'charm' && item.system.equipped).length
  }

  _prepareCharacterData(sheetData) {
    const actorData = sheetData.actor;

    var pointsAvailableMap = {
      primary: 8,
      secondary: 6,
      tertiary: 4,
    }
    var attributesSpent = {
      physical: {
        favored: 0,
        unFavored: 0,
      },
      mental: {
        favored: 0,
        unFavored: 0,
      },
      social: {
        favored: 0,
        unFavored: 0,
      }
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
      experience: 55,
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
        experience: 55,
        charms: 20,
        specialties: 3,
        merits: 18,
        intimacies: 4,
        willpower: 5,
      }
      if (sheetData.system.essence.value === 1) {
        sheetData.system.charcreation.available.specialties = 3;
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
        experience: 55,
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
      charmSlots: 0,
      experience: 0,
      charms: 0,
      specialties: 0,
      merits: 0,
      abovethree: 0,
      intimacies: 0,
    }
    for (let [key, attr] of Object.entries(sheetData.system.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
      attr.name = CONFIG.exaltedthird.attributes[key];
      sheetData.system.charcreation.spent.attributes[attr.type] += (attr.value - 1);
      attr.nextDotCost = 0;
      if (attr.value < 5) {
        if (game.settings.get("exaltedthird", "unifiedCharacterAdvancement")) {
          attr.nextDotCost = attr.favored ? 8 : 10;
        } else {
          attr.nextDotCost = attr.value * (attr.favored ? 3 : 4);
          if (sheetData.system.details.caste === 'casteless') {
            attr.nextDotCost--;
          }
        }
      }

      if (attr.favored) {
        attributesSpent[attr.type].favored += (attr.value - 1);
      }
      else {
        attributesSpent[attr.type].unFavored += (attr.value - 1);
      }
    }
    for (let [key, ability] of Object.entries(sheetData.system.abilities)) {
      ability.name = CONFIG.exaltedthird.abilities[key];

      if (ability.value < 5) {
        if (game.settings.get("exaltedthird", "unifiedCharacterAdvancement")) {
          ability.nextDotCost = ability.favored ? 4 : 5;
        } else {
          if (ability.value === 0) {
            ability.nextDotCost = 3;
          }
          else {
            ability.nextDotCost = (ability.value * 2) - (ability.favored ? 1 : 0);
          }
        }
      }
    }
    var favoredCharms = 0;
    var nonFavoredCharms = 0;
    var favoredAttributesSpent = 0;
    var unFavoredAttributesSpent = 0;
    var tertiaryAttributes = 0;
    var nonTertiaryAttributes = 0;
    var threeOrBelowFavored = 0;
    var threeOrBelowNonFavored = 0;
    var aboveThreeFavored = 0;
    var aboveThreeUnFavored = 0;

    for (let [key, attribute] of Object.entries(sheetData.system.charcreation.spent.attributes)) {
      if (sheetData.system.charcreation[key] === 'tertiary') {
        tertiaryAttributes += Math.max(0, sheetData.system.charcreation.spent.attributes[key] - sheetData.system.charcreation.available.attributes[key]);
      }
      else {
        nonTertiaryAttributes += Math.max(0, sheetData.system.charcreation.spent.attributes[key] - sheetData.system.charcreation.available.attributes[key]);
      }
      unFavoredAttributesSpent += Math.max(0, attributesSpent[key].unFavored - sheetData.system.charcreation.available.attributes[key]);
      favoredAttributesSpent += Math.max(0, attributesSpent[key].favored - Math.max(0, sheetData.system.charcreation.available.attributes[key] - attributesSpent[key].unFavored));
    }
    for (let [key, ability] of Object.entries(sheetData.system.abilities)) {
      sheetData.system.charcreation.spent.abovethree += Math.max(0, (ability.value - 3));
      if (ability.favored) {
        aboveThreeFavored += Math.max(0, (ability.value - 3));
        sheetData.system.charcreation.spent.bonuspoints += Math.max(0, (ability.value - 3));
        threeOrBelowFavored += Math.min(3, ability.value);
      }
      else {
        sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (ability.value - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, ability.value);
        aboveThreeUnFavored += Math.max(0, (ability.value - 3));
      }
    }
    for (let customAbility of actorData.customabilities) {
      sheetData.system.charcreation.spent.abovethree += Math.max(0, (customAbility.system.points - 3));
      if (customAbility.system.favored) {
        sheetData.system.charcreation.spent.bonuspoints += Math.max(0, (customAbility.system.points - 3));
        threeOrBelowFavored += Math.min(3, customAbility.system.points);
        aboveThreeFavored += Math.max(0, (customAbility.system.points - 3));
      }
      else {
        sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (customAbility.system.points - 3))) * 2;
        threeOrBelowNonFavored += Math.min(3, customAbility.system.points);
        aboveThreeUnFavored += Math.max(0, (customAbility.system.points - 3));
      }
    }
    sheetData.system.charcreation.spent.abilities = threeOrBelowFavored + threeOrBelowNonFavored;
    var nonfavoredBPBelowThree = Math.max(0, (threeOrBelowNonFavored - 28));
    var favoredBPBelowThree = Math.max(0, (threeOrBelowFavored - Math.max(0, 28 - threeOrBelowNonFavored)));
    if (sheetData.system.details.exalt === 'lunar') {
      sheetData.system.charcreation.spent.bonuspoints += (favoredAttributesSpent * 3) + (unFavoredAttributesSpent * 4);
    } else {
      sheetData.system.charcreation.spent.bonuspoints += (tertiaryAttributes * 3) + (nonTertiaryAttributes * 4);
    }
    for (let merit of actorData.merits) {
      sheetData.system.charcreation.spent.merits += merit.system.points;
    }

    for (const charm of actorData.items.filter((item) => item.type === 'charm')) {
      if (actorData.system.attributes[charm.system.ability] && actorData.system.attributes[charm.system.ability].favored) {
        favoredCharms++;
      } else if (actorData.system.abilities[charm.system.ability] && actorData.system.abilities[charm.system.ability].favored) {
        favoredCharms++;
      }
      else if (CONFIG.exaltedthird.maidens.includes(charm.system.ability) && charm.system.ability === actorData.system.details.caste) {
        favoredCharms++;
      }
      else {
        nonFavoredCharms++;
      }
    }

    if (actorData.system.abilities.occult.favored) {
      favoredCharms += Math.max(0, actorData.items.filter((item) => item.type === 'spell').length - 1);
    }
    else {
      nonFavoredCharms += Math.max(0, actorData.items.filter((item) => item.type === 'spell').length - 1);
    }

    sheetData.system.charcreation.spent.specialties = actorData.specialties.length;

    var totalNonFavoredCharms = Math.max(0, (nonFavoredCharms - sheetData.system.charcreation.available.charms));
    var totalFavoredCharms = Math.max(0, (favoredCharms - Math.max(0, sheetData.system.charcreation.available.charms - nonFavoredCharms)));

    sheetData.system.charcreation.spent.charms = nonFavoredCharms + favoredCharms;
    sheetData.system.charcreation.spent.bonuspoints += favoredBPBelowThree + (nonfavoredBPBelowThree * 2);
    sheetData.system.charcreation.spent.intimacies = actorData.items.filter((item) => item.type === 'intimacy').length;
    sheetData.system.charcreation.spent.bonuspoints += totalNonFavoredCharms * 5;
    sheetData.system.charcreation.spent.bonuspoints += totalFavoredCharms * 4;
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.willpower.max - sheetData.system.charcreation.available.willpower))) * 2;
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.merits - sheetData.system.charcreation.available.merits)));
    sheetData.system.charcreation.spent.bonuspoints += (Math.max(0, (sheetData.system.charcreation.spent.specialties - sheetData.system.charcreation.available.specialties)));

    sheetData.system.charcreation.spent.experience += (favoredAttributesSpent * 8) + (unFavoredAttributesSpent * 10);
    sheetData.system.charcreation.spent.experience += (favoredBPBelowThree * 4) + (nonfavoredBPBelowThree * 5);
    sheetData.system.charcreation.spent.experience += (aboveThreeFavored * 4) + (aboveThreeUnFavored * 5);
    sheetData.system.charcreation.spent.experience += totalNonFavoredCharms * 12;
    sheetData.system.charcreation.spent.experience += totalFavoredCharms * 10;
    sheetData.system.charcreation.spent.experience += (Math.max(0, (sheetData.system.willpower.max - sheetData.system.charcreation.available.willpower))) * 6;
    sheetData.system.charcreation.spent.experience += (Math.max(0, (sheetData.system.charcreation.spent.merits - sheetData.system.charcreation.available.merits))) * 2;
    sheetData.system.charcreation.spent.experience += (Math.max(0, (sheetData.system.charcreation.spent.specialties - sheetData.system.charcreation.available.specialties))) * 2;
    sheetData.system.settings.usedotsvalues = !game.settings.get("exaltedthird", "compactSheets");

    sheetData.system.experience.standard.remaining = sheetData.system.experience.standard.total - sheetData.system.experience.standard.value;
    sheetData.system.experience.exalt.remaining = sheetData.system.experience.exalt.total - sheetData.system.experience.exalt.value;
  }

  _prepareNPCData(sheetData) {
    sheetData.system.settings.usedotsvalues = !game.settings.get("exaltedthird", "compactSheetsNPC");

    for (let [key, pool] of Object.entries(sheetData.system.pools)) {
      pool.name = CONFIG.exaltedthird.npcpools[key];
    }
  }

  _prepareCharacterItems(sheetData) {
    const actorData = this.actor;

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
    for (let i of this.document.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'customability') {
        prepareItemTraits('customability', i);
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
      else if (i.type === 'action') {
        actions.push(i);
      }
      if (i.system.active) {
        activeItems.push(i);
      }
    }
    let actorSpells = actorData.items.filter((item) => item.type === 'spell');
    actorSpells = actorSpells.sort(function (a, b) {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    for (let i of actorSpells) {
      if (i.system.circle !== undefined) {
        spells[i.system.circle].list.push(i);
        spells[i.system.circle].visible = true;
        // spells[i.system.circle].collapse = this.actor.spells ? this.actor.spells[i.system.circle].collapse : true;
        spells[i.system.circle].collapse = this.collapseStates.spell[i.system.circle] ?? true;
      }
    }

    let actorCharms = actorData.items.filter((item) => item.type === 'charm');
    actorCharms = actorCharms.sort(function (a, b) {
      const sortValueA = a.system.listingname.toLowerCase() || a.system.ability;
      const sortValueB = b.system.listingname.toLowerCase() || b.system.ability;
      if (sortValueA === sortValueB) {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      }
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
          charms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [], collapse: this.collapseStates.charm[i.system.listingname] ?? true };
        }
        charms[i.system.listingname].list.push(i);
      }
      else {
        if (!charms[i.system.ability]) {
          charms[i.system.ability] = { name: CONFIG.exaltedthird.charmabilities[i.system.ability] || 'Ex3.Other', visible: true, list: [], collapse: this.collapseStates.charm[i.system.ability] ?? true };
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
      "classifications": CONFIG.exaltedthird.classifications,
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
      trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
    }
  }

  /** @override */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
    this._setupDotCounters(this.element);
    this._setupSquareCounters(this.element);
    this._setupButtons(this.element);

    // // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    this.element.querySelectorAll('.list-ability').forEach(element => {
      element.addEventListener('change', async (ev) => {
        const itemElement = ev.currentTarget.closest('.item');
        const itemID = itemElement?.dataset.itemId;
        const newNumber = parseInt(ev.currentTarget.value);

        if (itemID) {
          await this.actor.updateEmbeddedDocuments('Item', [
            {
              _id: itemID,
              system: {
                points: newNumber,
              },
            }
          ]);
        }
      });
    });

    this.element.querySelectorAll('.npc-action').forEach(element => {
      element.addEventListener('change', async (ev) => {
        const itemElement = ev.currentTarget.closest('.item');
        const itemID = itemElement?.dataset.itemId;
        const newNumber = parseInt(ev.currentTarget.value);

        if (itemID) {
          await this.actor.updateEmbeddedDocuments('Item', [
            {
              _id: itemID,
              system: {
                value: newNumber,
              },
            }
          ]);
        }
      });
    });

    // // Add Inventory Item

    // html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // // Drag events for macros.
    // if (game.user.isGM || this.actor.isOwner) {
    //   let handler = ev => this._onDragStart(ev);
    //   let savedRollhandler = ev => this._onDragSavedRoll(ev);
    //   html.find('li.item').each((i, li) => {
    //     if (li.classList.contains("inventory-header")) return;
    //     li.setAttribute("draggable", true);
    //     if (li.classList.contains("saved-roll-row")) {
    //       li.addEventListener("dragstart", savedRollhandler, false);
    //     }
    //     else {
    //       li.addEventListener("dragstart", handler, false);
    //     }
    //   });
    // }
  }

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
    const docRow = event.currentTarget.closest('li');
    if ('link' in event.target.dataset) return;

    // Chained operation
    let dragData = this._getEmbeddedDocument(docRow)?.toDragData();

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) { }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call('dropActorSheetData', actor, this, data);
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
 * Handle the dropping of ActiveEffect data onto an Actor Sheet
 * @param {DragEvent} event                  The concluding DragEvent which contains drop data
 * @param {object} data                      The data transfer extracted from the event
 * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
 * @protected
 */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass('ActiveEffect');
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor)
      return this._onSortActiveEffect(event, effect);
    return aeCls.create(effect, { parent: this.actor });
  }

  /**
   * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  async _onSortActiveEffect(event, effect) {
    /** @type {HTMLElement} */
    const dropTarget = event.target.closest('[data-effect-id]');
    if (!dropTarget) return;
    const target = this._getEmbeddedDocument(dropTarget);

    // Don't sort on yourself
    if (effect.uuid === target.uuid) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      const parentId = el.dataset.parentId;
      if (
        siblingId &&
        parentId &&
        (siblingId !== effect.id || parentId !== effect.parent.id)
      )
        siblings.push(this._getEmbeddedDocument(el));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });

    // Split the updates up by parent document
    const directUpdates = [];

    const grandchildUpdateData = sortUpdates.reduce((items, u) => {
      const parentId = u.target.parent.id;
      const update = { _id: u.target.id, ...u.update };
      if (parentId === this.actor.id) {
        directUpdates.push(update);
        return items;
      }
      if (items[parentId]) items[parentId].push(update);
      else items[parentId] = [update];
      return items;
    }, {});

    // Effects-on-items updates
    for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
      await this.actor.items
        .get(itemId)
        .updateEmbeddedDocuments('ActiveEffect', updates);
    }

    // Update on the main actor
    return this.actor.updateEmbeddedDocuments('ActiveEffect', directUpdates);
  }

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid)
      return this._onSortItem(event, item);

    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== 'Item') return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments('Item', itemData);
  }

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * @param {Event} event
   * @param {Item} item
   * @private
   */
  _onSortItem(event, item) {
    // Get the drag source and drop target
    const items = this.actor.items;
    const dropTarget = event.target.closest('[data-item-id]');
    if (!dropTarget) return;
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if (item.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && siblingId !== item.id)
        siblings.push(items.get(el.dataset.itemId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(item, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.actor.updateEmbeddedDocuments('Item', updateData);
  }

  /** The following pieces set up drag handling and are unlikely to need modification  */

  /**
   * Returns an array of DragDrop instances
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
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


  async _onDragSavedRoll(ev) {
    const li = ev.currentTarget;
    if (ev.target.classList.contains("content-link")) return;
    const savedRoll = this.actor.system.savedRolls[li.dataset.itemId];
    ev.dataTransfer.setData("text/plain", JSON.stringify({ actorId: this.actor.uuid, type: 'savedRoll', id: li.dataset.itemId, name: savedRoll.name }));
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

  static updateAnima(event, target) {
    const direction = target.dataset.direction;

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

  static async setSpendPool(event, target) {
    const motePool = target.dataset.pool;
    await this.actor.update({ [`system.settings.charmmotepool`]: motePool });
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

  static async calculateMotes(event, target) {
    const motePool = target.dataset.pool;
    const functionType = target.dataset.functiontype;
    const system = this.actor.system;

    if (functionType === 'commit') {
      let commitMotes = 0;
      for (const item of this.actor.items.filter((i) => i.type === 'weapon' || i.type === 'armor' || i.type === 'item')) {
        if (item.type === 'item' || item.system.equipped) {
          commitMotes += item.system.attunement;
        }
      }
      this.actor.update({ [`system.motes.${motePool}.committed`]: commitMotes });
    } else {
      if (game.settings.get("exaltedthird", "gloryOverwhelming")) {
        if (system.details.exalt === 'other' || (this.actor.type === 'npc' && system.creaturetype !== 'exalt')) {
          system.motes.glorymotecap.max = 10;
          if (system.creaturetype === 'god' || system.creaturetype === 'undead' || system.creaturetype === 'demon' || system.creaturetype === 'elemental') {
            system.motes.glorymotecap.max = 20 + (this.actor.system.essence.value * 10);
          }
          system.motes.glorymotecap.value = (system.motes.glorymotecap.max - this.actor.system.motes.glorymotecap.committed);
        } else {
          system.motes.glorymotecap.max = this.actor.calculateMaxExaltedMotes('glorymotecap', this.actor.system.details.exalt, this.actor.system.essence.value);
          system.motes.glorymotecap.value = (system.motes.glorymotecap.max - this.actor.system.motes.glorymotecap.committed);
        }
      } else {
        if (system.details.exalt === 'other' || (this.actor.type === 'npc' && system.creaturetype !== 'exalt')) {
          if (system.settings.editmode) {
            system.motes.personal.max = 10 * system.essence.value;
            if (system.creaturetype === 'god' || system.creaturetype === 'undead' || system.creaturetype === 'demon' || system.creaturetype === 'elemental') {
              system.motes.personal.max += 50;
            }
          }
          system.motes.personal.value = (system.motes.personal.max - this.actor.system.motes.personal.committed);
        }
        else {
          if (system.settings.editmode) {
            system.motes.personal.max = this.actor.calculateMaxExaltedMotes('personal', this.actor.system.details.exalt, this.actor.system.essence.value);
            system.motes.peripheral.max = this.actor.calculateMaxExaltedMotes('peripheral', this.actor.system.details.exalt, this.actor.system.essence.value);
          }
          system.motes.personal.value = (system.motes.personal.max - this.actor.system.motes.personal.committed);
          system.motes.peripheral.value = (system.motes.peripheral.max - this.actor.system.motes.peripheral.committed);
        }
      }
      this.actor.update({ [`system.motes`]: system.motes });
    }

  }

  static createProphecy(event, target) {
    new Prophecy(this.actor, {}).render(true);
  }

  static async setDiceCap(event, target) {
    const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/dialogues/set-dice-cap.html", { 'dicecap': this.actor.system.settings.dicecap });
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("Ex3.SetCustomDiceCap") },
      content: html,
      classes: [this.actor.getSheetBackground()],
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
          let diceCapData = {
            iscustom: result['dicecap.iscustom']?.checked ?? false,
            useattribute: result['dicecap.useattribute']?.checked ?? false,
            useability: result['dicecap.useability']?.checked ?? false,
            usespecialty: result['dicecap.usespecialty']?.checked ?? false,
            other: result['dicecap.other'].value,
            extratext: result['dicecap.extratext'].value,
          };
          this.actor.update({ [`system.settings.dicecap`]: diceCapData });
        }
      }
    }).render({ force: true });
  }

  static async calculateHealth(event, target) {
    const healthType = target.dataset.healthtype;
    var oxBodyText = '';

    if (this.actor.type !== 'npc') {
      if (this.actor.system.details.exalt === 'solar' || this.actor.system.details.exalt === 'abyssal') {
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
      else if (this.actor.system.details.caste.toLowerCase() === 'strawmaiden') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: One -1 level and one -2 level';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -1 level and two -2 levels';
        }
        else {
          oxBodyText = 'Ox Body: One -1 level, One -2 level, Two -4 levels';
        }
      }
      else if (this.actor.system.details.caste.toLowerCase() === 'puppeteer') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: Two -2 levels';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -1 level and one -2 level';
        }
        else {
          oxBodyText = 'Ox Body: Two -1 levels';
        }
      }
      else if (this.actor.system.details.caste.toLowerCase() === 'architect') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: Two -2 levels';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: Two -2 levels and One -4 level';
        }
        else {
          oxBodyText = 'Ox Body: One -1 level and Two -2 Levels';
        }
      }
      else if (this.actor.system.details.exalt === 'sovereign') {
        if (this.actor.system.attributes.stamina.value < 3) {
          oxBodyText = 'Ox Body: One -2 level and One -4 level';
        }
        else if (this.actor.system.attributes.stamina.value < 5) {
          oxBodyText = 'Ox Body: One -2 level and Two -4 levels';
        }
        else {
          oxBodyText = 'Ox Body: One -2 level and Three -4 levels';
        }
      }
    }


    var template = "systems/exaltedthird/templates/dialogues/calculate-health.html";

    var templateData = {
      'oxBodyText': oxBodyText,
      'healthType': healthType,
      'hasOxBody': false,
    }
    if (healthType === 'warstrider') {
      templateData.temp = this.actor.system.warstrider.health.levels.temp.value;
      templateData.zero = this.actor.system.warstrider.health.levels.zero.value;
      templateData.one = this.actor.system.warstrider.health.levels.one.value;
      templateData.two = this.actor.system.warstrider.health.levels.two.value;
      templateData.three = this.actor.system.warstrider.health.levels.three.value;
      templateData.four = this.actor.system.warstrider.health.levels.four.value;
    }
    else if (healthType === 'ship') {
      templateData.temp = this.actor.system.ship.health.levels.temp.value;
      templateData.zero = this.actor.system.ship.health.levels.zero.value;
      templateData.one = this.actor.system.ship.health.levels.one.value;
      templateData.two = this.actor.system.ship.health.levels.two.value;
      templateData.three = this.actor.system.ship.health.levels.three.value;
      templateData.four = this.actor.system.ship.health.levels.four.value;
    }
    else {
      templateData.temp = this.actor.system.health.levels.temp.value;
      templateData.zero = this.actor.system.health.levels.zero.value;
      templateData.one = this.actor.system.health.levels.one.value;
      templateData.two = this.actor.system.health.levels.two.value;
      templateData.three = this.actor.system.health.levels.three.value;
      templateData.four = this.actor.system.health.levels.four.value;
      if (this.actor.type === 'character' && (['solar', 'lunar', 'dragonblooded', 'sidereal'].includes(this.actor.system.details.exalt) || ['strawmaiden', 'puppeteer', 'architect', 'sovereign'].includes(this.actor.system.details.caste.toLowerCase()))) {
        templateData.hasOxBody = true;
      }
    }
    if (this.actor.system.battlegroup && healthType === 'person') {
      template = "systems/exaltedthird/templates/dialogues/calculate-battlegroup-health.html";
      templateData.hasOxBody = false;
    }
    const html = await foundry.applications.handlebars.renderTemplate(template, templateData);

    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("Ex3.CalculateHealth") },
      content: html,
      classes: [this.actor.getSheetBackground()],
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
      submit: async result => {
        if (result) {
          let healthData = {
            levels: {
              temp: {
                value: templateData.temp,
              },
              zero: {
                value: templateData.zero,
              },
              one: {
                value: templateData.one,
              },
              two: {
                value: templateData.two,
              },
              three: {
                value: templateData.three,
              },
              four: {
                value: templateData.four,
              },
            },
          };
          healthData.levels.zero.value = result.zero.value;

          let tempHealthRemoval = Math.max(0, healthData.levels.temp.value - parseInt(result.temp?.value || 0));

          if (!this.actor.system.battlegroup) {
            healthData.levels.temp.value = result.temp.value;
            healthData.levels.one.value = result.one.value;
            healthData.levels.two.value = result.two.value;
            healthData.levels.three.value = result.three.value;
            healthData.levels.four.value = result.four.value;
          }
          if (healthType === 'person') {
            await this.actor.update({ [`system.health`]: healthData });
          }
          else {
            await this.actor.update({ [`system.${healthType}.health`]: healthData });
          }
          await this.actor.restoreHealth(tempHealthRemoval, true);
        }
      }
    }).render({ force: true });
  }

  static calculateDerivedStat(event, target) {
    const key = target.dataset.key;
    this.actor.calculateDerivedStats(key);
  }


  static async recoverHealth(event, target) {
    const healthType = target.dataset.healthtype;

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

  static alterDefensePenalty(event, target) {
    const defenseType = target.dataset.defensetype;
    const direction = target.dataset.direction;
    this.actor.alterDefensePenalty(direction, defenseType);
  }

  static async showDialog(event, target) {
    const dialogType = target.dataset.dialogtype;

    if (dialogType === 'charmCheatSheet') {
      const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/dialogues/charms-dialogue.html");
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Ex3.Keywords"), resizable: true },
        content: html,
        position: {
          width: 1000,
          height: 1000
        },
        buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
        classes: ['exaltedthird-dialog', this.actor.getSheetBackground()],
      }).render(true);
    } else {
      let template = "systems/exaltedthird/templates/dialogues/armor-tags.html";
      switch (dialogType) {
        case 'experience':
          template = "systems/exaltedthird/templates/dialogues/experience-points-dialogue.html";
          break;
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
        case 'featsOfStrength':
          template = "systems/exaltedthird/templates/dialogues/feats-of-strength-dialogue.html";
          break;
        case 'bonusPoints':
          template = "systems/exaltedthird/templates/dialogues/bonus-points-dialogue.html";
          break;
        case 'health':
          template = "systems/exaltedthird/templates/dialogues/health-dialogue.html";
          break;
        case 'workings':
          template = "systems/exaltedthird/templates/dialogues/workings-dialogue.html";
          break;
        default:
          break;
      }
      const html = await foundry.applications.handlebars.renderTemplate(template, { 'exalt': this.actor.system.details.exalt, 'caste': this.actor.system.details.caste.toLowerCase(), 'unifiedCharacterAdvancement': game.settings.get("exaltedthird", "unifiedCharacterAdvancement") });
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Ex3.InfoDialog"), resizable: true },
        content: html,
        buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
        classes: ['exaltedthird-dialog', this.actor.getSheetBackground()],
        position: {
          width: 500,
        },
      }).render(true);
    }

  }

  static async pickColor() {
    const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/dialogues/color-picker.html", { 'color': this.actor.system.details.color, 'animaColor': this.actor.system.details.animacolor, 'initiativeIcon': this.actor.system.details.initiativeicon, 'initiativeIconColor': this.actor.system.details.initiativeiconcolor });
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("Ex3.PickColor") },
      position: { height: 1000, width: 406 },
      content: html,
      classes: [this.actor.getSheetBackground()],
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
          let color = result.color.value;
          let animaColor = result.animaColor.value;
          let initiativeIconColor = result.initiativeIconColor.value;
          let initiativeIcon = result.initiativeIcon.value;
          if (isColor(color)) {
            this.actor.update({ [`system.details.color`]: color });
          }
          if (isColor(animaColor)) {
            this.actor.update({ [`system.details.animacolor`]: animaColor });
          }
          if (isColor(initiativeIconColor)) {
            this.actor.update({ [`system.details.initiativeiconcolor`]: initiativeIconColor });
          }
          this.actor.update({ [`system.details.initiativeicon`]: initiativeIcon });
        }
      }
    }).render({ force: true });
  }

  static async baseRoll() {
    new RollForm(this.actor, { classes: [" exaltedthird exaltedthird-dialog dice-roller", this.actor.getSheetBackground()] }, {}, { rollType: 'base' }).render(true);
  }

  static async sheetSettings() {
    const template = "systems/exaltedthird/templates/dialogues/sheet-settings.html"
    const html = await foundry.applications.handlebars.renderTemplate(template, { 'actorType': this.actor.type, settings: this.actor.system.settings, 'maxAnima': this.actor.system.anima.max, 'lunarFormEnabled': this.actor.system.lunarform?.enabled, 'showExigentType': (this.actor.system.details.exalt === 'exigent' || this.actor.system.details.exalt === 'customExigent'), selects: CONFIG.exaltedthird.selects });

    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("Ex3.Settings"), },
      content: html,
      classes: [this.actor.getSheetBackground()],
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
          let newSettings = {
            charmmotepool: result.charmMotePool.value,
            martialartsmastery: result.martialArtsMastery.value,
            sheetbackground: result.sheetBackground.value,
            sorcerycircle: result.sorceryCircle.value,
            necromancycircle: result.necromancyCircle.value,
            smaenlightenment: result.smaEnlightenment.checked,
            showwarstrider: result.showWarstrider.checked,
            showship: result.showShip.checked,
            showescort: result.showEscort.checked,
            usetenattributes: result.useTenAttributes?.checked ?? false,
            usetenabilities: result.useTenAbilities?.checked ?? false,
            rollStunts: result.rollStunts.checked,
            defenseStunts: result.defenseStunts.checked,
            showanima: result.showAnima.checked,
            editmode: result.editMode.checked,
            hasaura: result.hasAura.checked,
            issorcerer: result.isSorcerer.checked,
            iscrafter: result.isCrafter.checked,
            hasmount: result.hasMount.checked,
            showmaidens: result.showMaidens.checked,
          }
          if (result.exigentType) {
            newSettings.exigenttype = result.exigentType.value;
          }
          if (this.actor.type === 'npc' && result.lunarFormEnabled) {
            this.actor.update({ [`system.lunarform.enabled`]: result.lunarFormEnabled.checked });
          }
          this.actor.update({ [`system.settings`]: newSettings, [`system.anima.max`]: parseInt(result.maxAnima.value) });
        }
      }
    }).render({ force: true });
  }

  static async helpDialogue() {
    const template = "systems/exaltedthird/templates/dialogues/help-dialogue.html"
    const html = await foundry.applications.handlebars.renderTemplate(template, { 'type': this.actor.type });
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("Ex3.ReadMe"), resizable: true },
      content: html,
      buttons: [{ action: 'close', label: game.i18n.localize("Ex3.Close") }],
      classes: [this.actor.getSheetBackground()],
    }).render(true);
  }

  static _onSquareCounterChange(event, target) {
    const index = Number(target.dataset.index);
    const parent = target.parentNode;
    const data = parent.dataset;
    const states = parseCounterStates(data.states);
    const fields = data.name.split('.');
    const steps = parent.querySelectorAll('.resource-counter-step');

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

  static effectControl(event, target) {
    onManageActiveEffect(target, this.actor);
  }

  static toggleCollapse(event, target) {
    const collapseType = target.dataset.collapsetype;
    const itemType = target.dataset.itemtype;
    if (collapseType === 'itemSection') {
      const li = target.nextElementSibling;
      if (itemType && li.getAttribute('id')) {
        this.collapseStates[itemType][li.getAttribute('id')] = (li.offsetWidth || li.offsetHeight || li.getClientRects().length);
      }
    }
    if (collapseType === 'anima') {
      const animaType = target.dataset.type;
      const li = target.nextElementSibling;
      this.actor.update({ [`system.collapse.${animaType}`]: (li.offsetWidth || li.offsetHeight || li.getClientRects().length) });
    }

    toggleDisplay(target);
  }

  _getHighestMaidenAbility(maiden) {
    const abilityList = CONFIG.exaltedthird.maidenabilities[maiden];
    let highestValue = 0;
    for (const ability of abilityList) {
      if ((this.actor.system.abilities[ability]?.value || 0) > highestValue) {
        highestValue = (this.actor.system.abilities[ability]?.value || 0);
      }
    }
    return highestValue;
  }

  _getMaidenCharmsNumber(maiden) {
    const abilityList = CONFIG.exaltedthird.maidenabilities[maiden];
    return (this.actor.items.filter(numberCharm => numberCharm.type === 'charm' && abilityList.includes(numberCharm.system.ability)).length || 0)
  }

  static _onDotCounterChange(event, target) {
    const color = this.actor.system.details.color;
    const index = Number(target.dataset.index);
    const itemID = target.dataset.id;

    const parent = target.parentNode;
    const fieldStrings = parent.dataset.name;
    const fields = fieldStrings.split('.');

    const steps = parent.querySelectorAll('.resource-value-step');

    if (index < 0 || index > steps.length) {
      return;
    }

    steps.forEach(step => {
      step.classList.remove('active');
      step.style.backgroundColor = ''; // Clear previous color
    });

    steps.forEach((step, i) => {
      if (i <= index) {
        step.classList.add('active');
        step.style.backgroundColor = color;
      }
    });
    if (target.dataset.id) {
      const item = this.actor.items.get(target.dataset.id);
      let newVal = index + 1;
      if (index === 0 && item.system.points === 1) {
        newVal = 0;
      }
      if (item) {
        this.actor.updateEmbeddedDocuments('Item', [
          {
            _id: target.dataset.id,
            system: {
              points: newVal,
            },
          }
        ]);
      }
    }
    else {
      this._assignToActorField(fields, index + 1);
    }
  }

  _assignToActorField(fields, value) {
    const actorData = foundry.utils.duplicate(this.actor)
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

  _setupButtons(element) {
    element.querySelectorAll('.set-pool-personal').forEach(el => {
      if (this.actor.system.settings.charmmotepool === 'personal') {
        el.style.color = '#F9B516';
      }
    });

    element.querySelectorAll('.set-pool-peripheral').forEach(el => {
      if (this.actor.system.settings.charmmotepool === 'peripheral') {
        el.style.color = '#F9B516';
      }
    });
  }

  _setupDotCounters(element) {
    const actorData = foundry.utils.duplicate(this.actor)
    // Handle .resource-value
    element.querySelectorAll('.resource-value').forEach(resourceEl => {
      const value = Number(resourceEl.dataset.value);
      const steps = resourceEl.querySelectorAll('.resource-value-step');
      steps.forEach((stepEl, i) => {
        if (i + 1 <= value) {
          stepEl.classList.add('active');
          stepEl.style.backgroundColor = actorData.system.details.color;
        }
      });
    });

    // Handle .resource-value-static
    element.querySelectorAll('.resource-value-static').forEach(resourceEl => {
      const value = Number(resourceEl.dataset.value);
      const steps = resourceEl.querySelectorAll('.resource-value-static-step');
      steps.forEach((stepEl, i) => {
        if (i + 1 <= value) {
          stepEl.classList.add('active');
          stepEl.style.backgroundColor = actorData.system.details.color;
        }
      });
    });
  }

  _setupSquareCounters(element) {
    element.querySelectorAll('.resource-counter').forEach(counterEl => {
      const data = counterEl.dataset;
      const states = parseCounterStates(data.states);

      const halfs = Number(data[states['/']]) || 0;
      const crossed = Number(data[states['x']]) || 0;
      const stars = Number(data[states['*']]) || 0;

      const values = new Array(stars + crossed + halfs);
      values.fill('*', 0, stars);
      values.fill('x', stars, stars + crossed);
      values.fill('/', stars + crossed, stars + crossed + halfs);

      const steps = counterEl.querySelectorAll('.resource-counter-step');
      steps.forEach(step => {
        const index = Number(step.dataset.index);
        step.dataset.state = index < values.length ? values[index] : '';
      });
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  static createItem(event, target) {
    event.preventDefault();
    event.stopPropagation();
    // Get the type of item to create.
    const type = target.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(target.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    if (type === 'charm') {
      if (Object.keys(CONFIG.exaltedthird.exaltcharmtypes).includes(this.actor.system.details.exalt)) {
        itemData.system.charmtype = this.actor.system.details.exalt;
      }
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  static async importItem(event, target) {
    let itemType = target.dataset.type;

    let items = game.items.filter(item => item.type === itemType && this.actor.canAquireItem(item));

    for (let item of items) {
      item.enritchedHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true, secrets: true, relativeTo: item });
    }

    const sectionList = {};
    if (itemType === 'spell') {
      let circle = target.dataset.circle;
      if (circle) {
        sectionList[circle] = {
          name: CONFIG.exaltedthird.circles[circle],
          list: items.filter(item => item.system.circle === circle)
        }
      } else {
        if (items.some(item => item.system.circle === 'terrestrial')) {
          sectionList['terrestrial'] = {
            name: game.i18n.localize("Ex3.Terrestrial"),
            list: items.filter(item => item.system.circle === 'terrestrial')
          }
        }
        if (items.some(item => item.system.circle === 'celestial')) {
          sectionList['celestial'] = {
            name: game.i18n.localize("Ex3.Celestial"),
            list: items.filter(item => item.system.circle === 'celestial')
          }
        }
        if (items.some(item => item.system.circle === 'solar')) {
          sectionList['solar'] = {
            name: game.i18n.localize("Ex3.Solar"),
            list: items.filter(item => item.system.circle === 'solar')
          }
        }
        if (items.some(item => item.system.circle === 'ivory')) {
          sectionList['ivory'] = {
            name: game.i18n.localize("Ex3.Ivory"),
            list: items.filter(item => item.system.circle === 'ivory')
          }
        }
        if (items.some(item => item.system.circle === 'shadow')) {
          sectionList['shadow'] = {
            name: game.i18n.localize("Ex3.Shadow"),
            list: items.filter(item => item.system.circle === 'shadow')
          }
        }
        if (items.some(item => item.system.circle === 'void')) {
          sectionList['void'] = {
            name: game.i18n.localize("Ex3.Void"),
            list: items.filter(item => item.system.circle === 'void')
          }
        }
      }
    }
    else {
      for (const charm of items.sort(function (a, b) {
        const sortValueA = a.system.listingname.toLowerCase() || a.system.ability;
        const sortValueB = b.system.listingname.toLowerCase() || b.system.ability;
        return sortValueA < sortValueB ? -1 : sortValueA > sortValueB ? 1 : 0
      })) {
        if (charm.system.listingname) {
          if (!sectionList[charm.system.listingname]) {
            sectionList[charm.system.listingname] = { name: charm.system.listingname, list: [] };
          }
          sectionList[charm.system.listingname].list.push(charm);
        }
        else {
          if (!sectionList[charm.system.ability]) {
            sectionList[charm.system.ability] = { name: CONFIG.exaltedthird.charmabilities[charm.system.ability] || 'Ex3.Other', visible: true, list: [] };
          }
          sectionList[charm.system.ability].list.push(charm);
        }
      }
    }

    const template = "systems/exaltedthird/templates/dialogues/import-item.html";
    const html = await foundry.applications.handlebars.renderTemplate(template, { 'sectionList': sectionList });

    await foundry.applications.api.DialogV2.wait({
      window: {
        title: "Import Item",
      },
      position: {
        height: 800,
        width: 650,
      },
      content: html,
      buttons: [{
        class: "closeImportItem",
        label: "Close",
        action: "closeImportItem",
      }],
      render: (event, dialog) => {
        dialog.element.querySelectorAll('.add-item').forEach(element => {
          element.addEventListener('click', (ev) => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = items.find((item) => item._id === li.data("item-id"));
            if (!item.flags?.core?.sourceId) {
              item.updateSource({ "flags.core.sourceId": item.uuid });
            }
            if (!item._stats?.compendiumSource) {
              item.updateSource({ "_stats.compendiumSource": item.uuid });
            }
            this.actor.createEmbeddedDocuments("Item", [item]);
            const closeImportItem = document.querySelector('.closeImportItem');
            if (closeImportItem) {
              closeImportItem.click();
            }
          });
        });

        dialog.element.querySelectorAll('.collapsable').forEach(element => {
          element.addEventListener('click', (ev) => {
            const li = ev.currentTarget.nextElementSibling;
            if (li.style.display == 'none') {
              li.style.display = '';
            } else {
              li.style.display = 'none';
            }
          });
        });
      },
      classes: ['exaltedthird-dialog', this.actor.getSheetBackground()],
    });
  }

  static async itemAction(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const doc = this._getEmbeddedDocument(target);
    const actionType = target.dataset.actiontype;
    if (!doc) {
      if (actionType === 'craftSimpleProject') {
        this.actor.actionRoll(
          { rollType: 'simpleCraft', ability: "craft" }
        );
      }
      return;
    }
    switch (actionType) {
      case 'editItem':
        doc.sheet.render(true);
        break;
      case 'deleteItem':
        const applyChanges = await foundry.applications.api.DialogV2.confirm({
          window: { title: game.i18n.localize("Ex3.Delete") },
          content: "<p>Are you sure you want to delete this item?</p>",
          classes: [this.actor.getSheetBackground()],
          modal: true
        });
        if (applyChanges) {
          await doc.delete();
        }
        break;
      case 'chatItem':
        this._displayCard(doc);
        break;
      case 'switchMode':
        await doc.switchMode();
        break;
      case 'addOpposingCharm':
        await this._addOpposingCharm(doc);
        break;
      case 'spendItem':
        this._spendItem(doc);
        break;
      case 'increaseItemActivations':
        doc.increaseActivations();
        break;
      case 'decreaseItemActivations':
        doc.decreaseActiations();
        break;
      case 'togglePoison':
        await doc.update({
          [`system.poison.apply`]: !doc.system.poison.apply,
        });
        break;
      case 'toggleItemValue':
        const key = target.dataset.key;
        await doc.update({
          [`system.${key}`]: !doc.system[key],
        });
        break;
      case 'shapeSpell':
        this.actor.actionRoll(
          {
            rollType: 'sorcery',
            pool: 'sorcery',
            spell: doc.id
          }
        );
        break;
      case 'stopSpellShape':
        await doc.update({ [`system.shaping`]: false });
        await this.actor.update({
          [`system.sorcery.motes.value`]: 0,
          [`system.sorcery.motes.max`]: 0
        });
        break;
      case 'completeCraft':
        this._completeCraft(doc);
        break;
      case 'craftSimpleProject':
        this.actor.actionRoll(
          { rollType: 'simpleCraft', ability: "craft", craftProjectId: doc?.id, difficulty: doc?.system?.difficulty }
        );
        break;
      case 'editShape':
        const formActor = game.actors.get(doc.system.actorid);
        if (formActor) {
          formActor.sheet.render(true);
        }
        break;
    }
  }

  static async savedRollAction(event, target) {
    const savedRollId = this._getEmbeddedDocument(target);
    const actionType = target.dataset.actiontype;

    switch (actionType) {
      case 'quickRoll':
        new RollForm(this.actor, { classes: [" exaltedthird exaltedthird-dialog dice-roller", this.actor.getSheetBackground()] }, {}, { rollId: savedRollId, skipDialog: true }).roll();
        break;
      case 'savedRoll':
        this.actor.actionRoll(
          {
            rollType: this.actor.system.savedRolls[savedRollId].rollType,
            rollId: savedRollId
          }
        );
        break;
      case 'deleteSavedRoll':
        const rollDeleteString = "system.savedRolls.-=" + savedRollId;
        const deleteConfirm = await foundry.applications.api.DialogV2.confirm({
          window: { title: game.i18n.localize('Ex3.Delete') },
          content: `<p>Delete Saved Roll?</p>`,
          classes: [this.actor.getSheetBackground()],
          modal: true
        });
        if (deleteConfirm) {
          this.actor.update({ [rollDeleteString]: null });
          ui.notifications.notify(`Saved Roll Deleted`);
        }
        break;
    }
  }

  static lastRoll(event, target) {
    this.actor.actionRoll(
      {
        rollType: this.actor.flags.exaltedthird.lastroll.rollType,
        lastRoll: true
      }
    );
  }

  static animaFlux(event, target) {
    if (game.user.targets && game.user.targets.size > 0) {
      for (const target of game.user.targets) {
        const tokenId = target.actor.token?.id || target.actor.getActiveTokens()[0]?.id;
        let combatant = game.combat.combatants.find(c => c.tokenId == tokenId);
        var roll = new Roll(`1d10cs>=7`).evaluate({ async: false });
        let diceDisplay = "";
        var total = roll.total;
        for (let dice of roll.dice[0].results.sort((a, b) => b.result - a.result)) {
          if (dice.result === 10) {
            diceDisplay += `<li class="roll die d10 success double-success">${dice.result}</li>`;
          }
          else if (dice.result >= 7) { diceDisplay += `<li class="roll die d10 success">${dice.result}</li>`; }
          else if (dice.rerolled) { diceDisplay += `<li class="roll die d10 rerolled">${dice.result}</li>`; }
          else if (dice.result == 1) { diceDisplay += `<li class="roll die d10 failure">${dice.result}</li>`; }
          else { diceDisplay += `<li class="roll die d10">${dice.result}</li>`; }
          if (dice.result >= 10) {
            total += 1;
          }
        }
        let resultsMessage = `<h4 class="dice-total">${total} Damage</h4>`;
        if (total > 0) {
          if (game.combat) {
            if (combatant && combatant.initiative != null) {
              if (combatant.initiative > 0) {
                if (target.actor.system.hardness.value <= 0) {
                  if (game.user.isGM) {
                    game.combat.setInitiative(combatant.id, combatant.initiative - total);
                  }
                  else {
                    game.socket.emit('system.exaltedthird', {
                      type: 'updateInitiative',
                      id: combatant.id,
                      data: combatant.initiative - total,
                      // crasherId: crasherId,
                    });
                  }
                }
              }
              else {
                let totalHealth = 0;
                const targetActorData = foundry.utils.duplicate(target.actor);
                for (let [key, health_level] of Object.entries(targetActorData.system.health.levels)) {
                  totalHealth += health_level.value;
                }
                targetActorData.system.health.lethal = Math.min(totalHealth - targetActorData.system.health.bashing - targetActorData.system.health.aggravated, targetActorData.system.health.lethal + total);
                if (game.user.isGM) {
                  target.actor.update(targetActorData);
                }
                else {
                  game.socket.emit('system.exaltedthird', {
                    type: 'updateTargetData',
                    id: target.id,
                    data: targetActorData,
                  });
                }
              }
            }
          }
          if (combatant.initiative > 0 && target.actor.system.hardness.value > 0) {
            resultsMessage = `<h4 class="dice-total">Blocked by hardness</h4>`;
          }
        }
        let messageContent = `
          <div class="dice-roll">
              <div class="dice-result">
                  <h4 class="dice-formula">Anima Flux vs ${target.actor.name}</h4>
                  <div class="dice-tooltip">
                      <div class="dice">
                          <ol class="dice-rolls">${diceDisplay}</ol>
                      </div>
                  </div>
                  ${resultsMessage}
              </div>
          </div>`;
        ChatMessage.create({ user: game.user.id, style: CONST.CHAT_MESSAGE_STYLES.OTHER, roll: roll, content: messageContent });
      }
    }
    else {
      ui.notifications.warn('Ex3.NoTargets', {
        localize: true,
      });
    }
  }

  static makeActionRoll(event, target) {
    const poolMap = {
      'ability': null,
      'accuracy': null,
      'sorcery': 'sorcery',
      'readIntentions': 'readintentions',
      'social': 'social',
      'steady': 'resistance',
      'sailStratagem': 'command',
      'command': 'command',
      'rout': 'willpower',
      'joinBattle': 'joinbattle',
      'rush': 'movement',
      'grappleControl': 'grapple',
      'working': 'sorcery',
      'craft': 'craft',
    }
    const rollType = target.dataset.rolltype;

    const data = {
      rollType: rollType,
      pool: poolMap[rollType],
    }

    if (rollType === 'craft') {
      const craftType = target.dataset.crafttype;
      data.craftType = craftType;
      data.craftRating = 2;
    }

    if (rollType === 'ability') {
      const ability = target.dataset.ability;
      data.ability = ability;
      if (ability === 'fever') {
        data.pool = 'fever';
        data.attribute = 'none';
      }
      else if (ability === 'willpower') {
        data.attribute = 'none';
        data.pool = 'wilpower';
      }
      else {
        const abilityObject = this.actor.system.abilities[ability];
        data.attribute = abilityObject?.prefattribute;
      }
    }

    if (rollType === 'ability') {
      data.pool = target.dataset.pool;
    }
    if (rollType === 'accuracy') {
      const doc = this._getEmbeddedDocument(target);
      data.attackType = target.dataset.attacktype;
      data.weapon = doc?.system;
    }

    this.actor.actionRoll(data);
  }

  static rollAction(event, target) {
    const doc = this._getEmbeddedDocument(target);
    this.actor.actionRoll(
      {
        rollType: 'ability',
        pool: doc.id
      }
    );
  }

  /**
  * Fetches the embedded document representing the containing HTML element
  *
  * @param {HTMLElement} target    The element subject to search
  * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
  */
  _getEmbeddedDocument(target) {
    const docRow = target.closest('li[data-document-class]');
    if (!docRow?.dataset) {
      return null;
    }
    if (docRow.dataset.documentClass === 'savedRoll') {
      return docRow.dataset.itemId;
    }
    else if (docRow.dataset.documentClass === 'Item') {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === 'ActiveEffect') {
      const parent =
        docRow.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow?.dataset.effectId);
    } else return console.warn('Could not find document class');
  }

  /**
  * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
  * @param {Event} event   The click event which originated the selection
  * @private
  */
  static editTraits(event, target) {
    event.preventDefault();
    const label = target.parentElement.querySelector("label");
    const choices = CONFIG.exaltedthird[target.dataset.options];
    const options = { name: target.dataset.target, title: label.innerText, choices };
    return new TraitSelector(this.actor, options).render(true);
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

  async _completeCraft(doc) {
    game.rollForm = new RollForm(this.actor, { classes: [" exaltedthird exaltedthird-dialog dice-roller", this.actor.getSheetBackground()] }, {}, { rollType: 'craft', ability: "craft", standardCraftProjectId: doc.id, craftType: doc.system.type, craftRating: doc.system.rating, goalNumber: doc.system.goalnumber, intervals: doc.system.intervals }).render(true);
  }

  static async _displayDataChat(event, target) {
    let type = target.dataset.type;
    const token = this.actor.token;
    var content = '';
    var title = 'Anima Power';
    switch (type) {
      case "passive":
        content = this.actor.system.anima.passive;
        break;
      case "active":
        content = this.actor.system.anima.active;
        break;
      case "iconic":
        content = this.actor.system.anima.iconic;
        break;
    }
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      content: content,
      title: title,
    };
    const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/chat/exalt-ability-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token }),
    };


    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }

  /**
* Display the chat card for an Item as a Chat Message
* @param {object} options          Options which configure the display of the item chat card
* @param {string} rollMode         The message visibility mode to apply to the created card
* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
*                                  the prepared message data (if false)
*/
  async _displayCard(item, cardType = "") {
    const token = this.actor.token
    if (cardType === 'Spent' && (item.system.cost?.commitmotes || 0) > 0 || item.system.activatable) {
      if (item.system.active) {
        cardType = "Deactivate";
      }
      else {
        cardType = "Activate";
      }
    }
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      item: item,
      labels: this.labels,
      cardType: cardType,
    };
    const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedthird/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token }),
    };
    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }

  _addOpposingCharm(item) {
    if (game.opposedRollForm) {
      game.opposingCharmForm.addOpposingCharm(item);
    }
    else if (game.rollForm) {
      game.rollForm.addOpposingCharm(item);
    }

    game.socket.emit('system.exaltedthird', {
      type: 'addOpposingCharm',
      data: item,
      actorId: item.actor._id,
    });
  }

  _spendItem(item) {
    item.activate();
    if (game.settings.get("exaltedthird", "spendChatCards")) {
      this._displayCard(item, "Spent");
    }
    // Test
    // game.rollForm.addCharm(item);
  }

  static async lunarSync() {
    const lunar = game.actors.get(this.actor.system.lunarform.actorid);
    if (lunar) {
      const actorData = foundry.utils.duplicate(this.actor);

      const template = "systems/exaltedthird/templates/dialogues/lunar-sync.html";
      const html = await foundry.applications.handlebars.renderTemplate(template);

      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n.localize("Ex3.LunarSync") },
        content: html,
        classes: [this.actor.getSheetBackground()],
        modal: true
      });
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
              lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.grapplecontrol.attribute].value + this.actor.getCharacterAbilityValue(lunar.system.settings.rollsettings.grapplecontrol.ability);
            }
            else if (key === 'movement') {
              lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.rush.attribute].value + this.actor.getCharacterAbilityValue(lunar.system.settings.rollsettings.rush.ability);
            } else if (key === 'resistance') {
              lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings.steady.attribute].value + this.actor.getCharacterAbilityValue(lunar.system.settings.rollsettings.steady.ability);
            }
            else {
              lunarPool = lunar.system.attributes[lunar.system.settings.rollsettings[key].attribute].value + this.actor.getCharacterAbilityValue(lunar.system.settings.rollsettings[key].ability);
            }
          }

          pool.value = Math.max(pool.value, lunarPool);
        }
        for (let item of this.actor.items.filter(item => item.type === 'action')) {
          if (lunar.type === 'character') {
            if (item.system.lunarstats.attribute && item.system.lunarstats.ability) {
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
            newItems.push(foundry.utils.duplicate(item));
          }
        }
        for (let effect of lunar.effects) {
          if (!this.actor.effects.find(actorEffect => actorEffect.name === effect.label)) {
            newEffects.push(foundry.utils.duplicate(effect));
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
    else {
      ui.notifications.error(`<p>Linked Lunar not found</p>`);
    }
  }
}


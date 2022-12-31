/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class ExaltedThirdItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    if (!data.img || data.img == "icons/svg/item-bag.svg") {
      this.updateSource({ img: this.getImageUrl(data.type) });
    }
  }

  getImageUrl(type) {
    if (type === 'intimacy') {
      return "systems/exaltedthird/assets/icons/hearts.svg";
    }
    if (type === 'spell') {
      return "systems/exaltedthird/assets/icons/magic-swirl.svg";
    }
    if (type === 'initiation') {
      return "icons/svg/book.svg";
    }
    if (type === 'merit') {
      return "icons/svg/coins.svg"
    }
    if (type === 'weapon') {
      return "icons/svg/sword.svg";
    }
    if (type === 'armor') {
      return "systems/exaltedthird/assets/icons/breastplate.svg";
    }
    if (type === 'charm' || type === 'action') {
      return "icons/svg/explosion.svg";
    }
    if (type === 'specialability') {
      return "icons/svg/aura.svg";
    }
    if (type === 'craftproject') {
      return "systems/exaltedthird/assets/icons/anvil-impact.svg";
    }
    if (type === 'destiny') {
      return "systems/exaltedthird/assets/icons/spy.svg";
    }
    return "icons/svg/item-bag.svg";
  }
}

export function prepareItemTraits(type, i) {
  const map = {
  };
  if (type === 'weapon') {
    map['weapontags'] = CONFIG.exaltedthird.weapontags
  }
  if (type === 'armor') {
    map['armortags'] = CONFIG.exaltedthird.armortags
  }
  for (let [t, choices] of Object.entries(map)) {
    const trait = i.system.traits[t];
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
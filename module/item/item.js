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

  async _preUpdate(updateData, options, user) {
    await super._preUpdate(updateData, options, user);
    if (updateData.system?.weighttype && updateData.system?.weighttype !== 'other' && (!this.actor || this.actor.type === 'character')) {
      const equipmentChart = {
        light: {
          accuracy: 4,
          damage: 7,
          defense: 0,
          overwhelming: 1,
          attunement: 5,
          soak: 3,
          hardness: 0,
          penalty: 0,
        },
        medium: {
          accuracy: 2,
          damage: 9,
          defense: 1,
          overwhelming: 1,
          attunement: 5,
          soak: 5,
          hardness: 0,
          penalty: 1,
        },
        heavy: {
          accuracy: 0,
          damage: 11,
          defense: -1,
          overwhelming: 1,
          attunement: 5,
          soak: 7,
          hardness: 0,
          penalty: 2,
        },
        siege: {
          accuracy: -3,
          damage: 15,
          defense: 0,
          overwhelming: 3,
          attunement: 5,
        },
      };
      const artifactEquipmentChart = {
        light: {
          accuracy: 5,
          damage: 10,
          defense: 0,
          overwhelming: 3,
          attunement: 5,
          soak: 5,
          hardness: 4,
          penalty: 0,
        },
        medium: {
          accuracy: 3,
          damage: 12,
          defense: 1,
          overwhelming: 4,
          attunement: 5,
          soak: 8,
          hardness: 7,
          penalty: 1,
        },
        heavy: {
          accuracy: 1,
          damage: 14,
          defense: 0,
          overwhelming: 5,
          attunement: 5,
          soak: 11,
          hardness: 10,
          penalty: 2,
        },
        siege: {
          accuracy: -2,
          damage: 20,
          defense: 0,
          overwhelming: 5,
          attunement: 5,
        },
      };
      if (this.type === 'weapon') {
        if (this.system.traits.weapontags?.value?.includes('artifact')) {
          updateData.system.witheringaccuracy = artifactEquipmentChart[updateData.system?.weighttype].accuracy;
          updateData.system.witheringdamage = artifactEquipmentChart[updateData.system?.weighttype].damage;
          updateData.system.defense = artifactEquipmentChart[updateData.system?.weighttype].defense;
          updateData.system.overwhelming = artifactEquipmentChart[updateData.system?.weighttype].overwhelming;
          updateData.system.attunement = artifactEquipmentChart[updateData.system?.weighttype].attunement;
        }
        else {
          updateData.system.witheringaccuracy = equipmentChart[updateData.system?.weighttype].accuracy;
          updateData.system.witheringdamage = equipmentChart[updateData.system?.weighttype].damage;
          updateData.system.defense = equipmentChart[updateData.system?.weighttype].defense;
          updateData.system.overwhelming = equipmentChart[updateData.system?.weighttype].overwhelming;
          updateData.system.attunement = 0;
        }
      }
      if (this.type === 'armor') {
        if(this.system.traits.armortags?.value?.includes('artifact')) {
          if(updateData.system?.weighttype === 'light'){
            updateData.system.attunement = 4;
          }
          else if(updateData.system?.weighttype === 'heavy') {
            updateData.system.attunement = 6;
          }
          else {
            updateData.system.attunement = 5;
          }
          updateData.system.soak = artifactEquipmentChart[updateData.system?.weighttype].soak;
          updateData.system.hardness = artifactEquipmentChart[updateData.system?.weighttype].hardness;
          updateData.system.penalty = artifactEquipmentChart[updateData.system?.weighttype].penalty;
        }
        else {
          updateData.system.soak = equipmentChart[updateData.system?.weighttype].soak;
          updateData.system.hardness = equipmentChart[updateData.system?.weighttype].hardness;
          updateData.system.penalty = equipmentChart[updateData.system?.weighttype].penalty;
          updateData.system.attunement = 0;
        }
      }
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
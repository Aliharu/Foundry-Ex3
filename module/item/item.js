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
    const equipmentChart = CONFIG.exaltedthird.equipmentStats;
    const artifactEquipmentChart = CONFIG.exaltedthird.artifactEquipmentStats;
    if(this.type === 'weapon' || this.type === 'armor') {
      const equipped = updateData.system?.equipped || this.system.equipped;
      const weighttype = updateData.system?.weighttype || this.system.weighttype;
      if (equipped !== this.system.equipped) {
        for (const effect of this.effects) {
          effect.update({ disabled: !updateData.system?.equipped });
        }
      }
      if (weighttype !== this.system.weightype && updateData.system?.weighttype !== 'other' && (!this.actor || this.actor.type === 'character')) {
        if (this.type === 'weapon') {
          const weaponType = updateData.system?.weapontype || this.system.weapontype;
          if (updateData.system?.weighttype === 'bolt') {
            updateData.system.witheringaccuracy = 4;
            updateData.system.damageattribute = '';
            if (this.actor) {
              updateData.system.witheringdamage = this.actor.system.essence.value + 10;
              updateData.system.overwhelming = this.actor.system.essence.value + 1;
            }
          }
          else {
            if(weighttype === 'siege') {
              updateData.system.weapontype = 'siege';
            }
            if (this.system.traits.weapontags?.value?.includes('artifact')) {
              updateData.system.witheringaccuracy = artifactEquipmentChart[weighttype].accuracy;
              updateData.system.witheringdamage = artifactEquipmentChart[weighttype].damage;
              updateData.system.overwhelming = artifactEquipmentChart[weighttype].overwhelming;
              updateData.system.attunement = artifactEquipmentChart[weighttype].attunement;
            }
            else {
              updateData.system.witheringaccuracy = equipmentChart[weighttype].accuracy;
              updateData.system.witheringdamage = equipmentChart[weighttype].damage;
              updateData.system.overwhelming = equipmentChart[weighttype].overwhelming;
              updateData.system.attunement = 0;
            }
            if (weaponType === 'ranged') {
              updateData.system.defense = 0;
              if (this.system.traits.weapontags?.value?.includes('artifact')) {
                updateData.system.witheringaccuracy = artifactEquipmentChart['light'].accuracy;
              }
              else {
                updateData.system.witheringaccuracy = equipmentChart['light'].accuracy;
              }
            }
            else if (weaponType === 'thrown') {
              updateData.system.defense = 0;
              if (this.system.traits.weapontags?.value?.includes('artifact')) {
                updateData.system.witheringaccuracy = 4;
              }
              else {
                updateData.system.witheringaccuracy = 3;
              }
            }
            else {
              if (this.system.traits.weapontags?.value?.includes('artifact')) {
                updateData.system.defense = artifactEquipmentChart[updateData.system?.weighttype].defense;
              }
              else {
                updateData.system.defense = equipmentChart[updateData.system?.weighttype].defense;
              }
            }
          }
        }
        if (this.type === 'armor') {
          if (this.system.traits.armortags?.value?.includes('artifact')) {
            if (weighttype === 'light') {
              updateData.system.attunement = 4;
            }
            else if (weighttype === 'heavy') {
              updateData.system.attunement = 6;
            }
            else {
              updateData.system.attunement = 5;
            }
            updateData.system.soak = artifactEquipmentChart[weighttype].soak;
            updateData.system.hardness = artifactEquipmentChart[weighttype].hardness;
            updateData.system.penalty = artifactEquipmentChart[weighttype].penalty;
          }
          else {
            updateData.system.soak = equipmentChart[weighttype].soak;
            updateData.system.hardness = equipmentChart[weighttype].hardness;
            updateData.system.penalty = equipmentChart[weighttype].penalty;
            updateData.system.attunement = 0;
          }
        }
      }
    }

    // Won't work due to conflicts with active effects
    // if (this.type === 'weapon' || this.type === 'armor') {
    //   if(updateData.system?.equipped !== undefined) {
    //     if(this.type === 'weapon') {
    //       if(this.actor) {
    //         let defenseChange = updateData.system?.defense || this.system.defense;
    //         defenseChange = defenseChange * (updateData.system.equipped ? 1 : -1);
    //         await this.actor.update({[`system.parry.value`]: this.actor.system.parry.value + defenseChange});
    //       }
    //     }
    //     if(this.type === 'armor') {
    //       if(this.actor) {
    //         let defenseChange = updateData.system?.penalty || this.system.penalty;
    //         if(defenseChange < 0) {
    //           defenseChange *= -1;
    //         }
    //         defenseChange = defenseChange * (updateData.system.equipped ? -1 : 1);
    //         await this.actor.update({[`system.evasion.value`]: this.actor.system.evasion.value + defenseChange});
    //       }
    //     }
    //   }
    // }
  }

  getImageUrl(type) {
    if (type === 'intimacy') {
      return "systems/exaltedthird/assets/icons/hearts.svg";
    }
    if (type === 'spell') {
      return "systems/exaltedthird/assets/icons/magic-swirl.svg";
    }
    if (type === 'ritual') {
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
    if (type === 'specialability' || type === 'customability') {
      return "icons/svg/aura.svg";
    }
    if (type === 'craftproject') {
      return "systems/exaltedthird/assets/icons/anvil-impact.svg";
    }
    if (type === 'destiny') {
      return "systems/exaltedthird/assets/icons/spy.svg";
    }
    if (type === 'shape') {
      return "icons/svg/mystery-man.svg";
    }
    if (type === 'martialart') {
      return "systems/exaltedthird/assets/icons/punch-blast.svg";
    }
    if (type === 'craft') {
      return "systems/exaltedthird/assets/icons/anvil-impact.svg";
    }
    return "icons/svg/item-bag.svg";
  }

  /**
 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
 * @private
 */
  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
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
  if (type === 'customability') {
    map['weapons'] = CONFIG.exaltedthird.weapons
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
    trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
  }
}
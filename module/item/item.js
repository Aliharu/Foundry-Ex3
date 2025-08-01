import { animaTokenMagic } from "../utils/other-modules.js";
import { getNumberFormula } from "../utils/utils.js";

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
      this.updateSource({ img: CONFIG.exaltedthird.itemIcons[data.type] });
    }
  }

  async _preUpdate(updateData, options, user) {
    await super._preUpdate(updateData, options, user);
    const equipmentChart = CONFIG.exaltedthird.equipmentStats;
    const artifactEquipmentChart = CONFIG.exaltedthird.artifactEquipmentStats;
    if (this.type === 'weapon' || this.type === 'armor') {
      const equipped = updateData.system?.equipped ?? this.system.equipped;
      const weighttype = updateData.system?.weighttype ?? this.system.weighttype;
      if (weighttype && weighttype !== this.system.weighttype && weighttype !== 'other' && (!this.actor || this.actor.type === 'character')) {
        if (this.type === 'weapon') {
          const weaponType = updateData.system?.weapontype || this.system.weapontype;
          if (weaponType === 'bolt') {
            updateData.system.witheringaccuracy = 4;
            updateData.system.damageattribute = '';
            if (this.actor) {
              updateData.system.witheringdamage = this.actor.system.essence.value + 10;
              updateData.system.overwhelming = this.actor.system.essence.value + 1;
            }
          }
          else {
            if (weighttype === 'siege') {
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
                updateData.system.defense = artifactEquipmentChart[weighttype].defense;
              }
              else {
                updateData.system.defense = equipmentChart[weighttype].defense;
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
      if (equipped !== this.system.equipped) {
        // Issues with this triggering on fields with active effects
        // if (this.actor) {
        //   const defense = updateData.system.defense ?? this.system.defense;
        //   if(equipped) {
        //     if(defense) {
        //       await this.actor.update({ [`system.parry.value`]: this.actor.system.parry.value + defense });
        //       await this.actor.update({ [`system.evasion.value`]: this.actor.system.evasion.value + defense });
        //     }
        //   } else {
        //     if(defense) {
        //       await this.actor.update({ [`system.parry.value`]: this.actor.system.parry.value - defense });
        //       await this.actor.update({ [`system.evasion.value`]: this.actor.system.evasion.value - defense });
        //     }
        //   }
        // }
        for (const effect of this.effects) {
          effect.update({ disabled: !equipped });
        }
      }
    }
    if (updateData?.system && this.type === 'charm' && this.system.modes.alternates.length > 0 && this.system.modes.currentmodeid === '' && ((updateData?.system?.modes?.currentmodeid ?? '') === '')) {
      const mainmodeFields = [
        'type', 'summary', 'duration', 'activatable', 'multiactivate',
        'endtrigger', 'costdisplay', 'keywords'
      ];

      if (!updateData.system.modes) {
        updateData.system.modes = {};
      }

      if (!updateData.system.modes.mainmode) {
        updateData.system.modes.mainmode = {};
      }

      for (let field of mainmodeFields) {
        if (field in updateData.system) {
          updateData.system.modes.mainmode[field] = updateData.system[field];
        }
      }

      if (updateData.system.cost) {
        if (!updateData.system.modes.mainmode.cost) updateData.system.modes.mainmode.cost = {};
        for (let [key, value] of Object.entries(updateData.system.cost)) {
          updateData.system.modes.mainmode.cost[key] = value;
        }
      }

      if (updateData.system.restore) {
        if (!updateData.system.modes.mainmode.restore) updateData.system.modes.mainmode.restore = {};
        for (let [key, value] of Object.entries(updateData.system.restore)) {
          updateData.system.modes.mainmode.restore[key] = value;
        }
      }

    }
  }

  static async _onCreateOperation(items, operation, user) {
    for (const item of items) {
      if (item.isEmbedded && item.system.custommodifier?.key) {
        item._createModifiers();
      }
    }
    await super._onCreateOperation(items, operation, user);
  }

  async _createModifiers(target = this.parent) {
    if (!target || !this.system.custommodifier.key || target.items.some(items => items.type === 'modifier' && items.system.formulaKey === this.system.custommodifier.key)) {
      return;
    }
    await target.createEmbeddedDocuments("Item", [
      {
        name: this.system.custommodifier.name || "No Name",
        img: this.img,
        type: 'modifier',
        parent: target,
        renderSheet: undefined,
        system: {
          formulaKey: this.system.custommodifier.key,
          value: 0,
          resettrigger: this.system.custommodifier.resettrigger,
        }
      }
    ]);
  }

  getSheetBackground() {
    if (this.parent) {
      return this.parent.getSheetBackground();
    }
    return `${game.settings.get("exaltedthird", "sheetStyle")}-background`;
  }

  async switchMode() {
    const newMode = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("Ex3.SwitchMode"), resizable: true },
      content: '',
      classes: [this.actor.getSheetBackground(), 'button-select-dialog'],
      modal: true,
      buttons: [
        {
          action: 'mainmode', // Use a unique identifier for the main mode
          label: this.system.modes.mainmode.name || this.name, // Assuming mainmode has a 'name' property
          callback: (event, button, dialog) => this.system.modes.mainmode
        },
        ...this.system.modes.alternates.map((alternate, index) => ({
          action: `${index}`,
          label: alternate.name,
          callback: (event, button, dialog) => alternate
        })),
      ]
    });

    if (!newMode) {
      return;
    }

    const formData = {
      system: {
        modes: {
          'currentmodeid': newMode.id,
          'currentmodename': newMode.name,
        },
        'autoaddtorolls': newMode.autoaddtorolls,
        'activatable': newMode.activatable,
        'cost': newMode.cost,
        'restore': newMode.restore,
        'duration': newMode.duration,
        'endtrigger': newMode.endtrigger,
        'costdisplay': newMode.costdisplay,
        'keywords': newMode.keywords,
        'summary': newMode.summary,
        'type': newMode.type,
        'multiactivate': newMode.multiactivate,
      }
    };

    await this.update(formData);
  }

  async activate() {
    if (!this.actor) {
      return;
    }
    const actorData = await foundry.utils.duplicate(this.actor);
    let updateActive = null;
    let activateAmount = 1;
    let charmMotePool = game.settings.get("exaltedthird", "gloryOverwhelming") ? 'glorymotecap' : actorData.system.settings.charmmotepool;

    if (this.type === 'charm') {
      if (this.system.active) {
        updateActive = false;
        if (this.system.cost.commitmotes > 0) {
          actorData.system.motes[this.flags?.exaltedthird?.poolCommitted ?? charmMotePool].committed -= (this.system.cost.commitmotes * this.flags?.exaltedthird?.currentIterationsActive || 1);
        }
      }
      else {
        if (this.system.multiactivate) {
          try {
            activateAmount = await foundry.applications.api.DialogV2.prompt({
              window: { title: game.i18n.localize("Ex3.InputActivationAmount") },
              classes: [this.actor.getSheetBackground()],
              content: '<input name="activateAmount" type="number" min="1" step="1" value="1" autofocus>',
              ok: {
                label: "Submit",
                callback: (event, button, dialog) => button.form.elements.activateAmount.valueAsNumber
              }
            });
          } catch {
            console.log("User didn't input a value.");
          }
        }
        if (this.system.cost.commitmotes > 0 || this.system.activatable) {
          updateActive = true;
        }
        await this.spendItemResources(actorData, activateAmount);
      }
    }
    else if (this.type === 'spell') {
      if (this.system.willpower) {
        actorData.system.willpower.value = Math.min(actorData.system.willpower.max, (actorData.system.willpower.value - this.system.willpower) + 1);
      }
      if (this.system.active) {
        updateActive = false;
      }
      else {
        if (this.system.activatable) {
          updateActive = true;
        }
      }
    }
    else {
      updateActive = !this.system.active;
    }
    await this.actor.update(actorData);
    if (updateActive !== null) {
      await this.update({
        [`system.active`]: updateActive,
        [`flags.exaltedthird.poolCommitted`]: updateActive ? charmMotePool : null,
        [`flags.exaltedthird.currentIterationsActive`]: activateAmount,
      });
      for (const effect of this.actor.allApplicableEffects()) {
        if (effect._sourceName === this.name && effect.system.activatewithparentitem) {
          effect.update({ disabled: !updateActive });
        }
      }
      for (const effect of this.effects.filter(effect => effect.system.activatewithparentitem)) {
        effect.update({ disabled: !updateActive });
      }
    }
  }

  async increaseActivations() {
    if (!this.actor) {
      return;
    }
    if (this.type === 'modifier') {
      await this.update({
        [`system.value`]: this.system.value + 1,
      });
    } else {
      const actorData = await foundry.utils.duplicate(this.actor);
      await this.spendItemResources(actorData, 1);
      await this.actor.update(actorData);
      await this.update({
        [`flags.exaltedthird.currentIterationsActive`]: (this.flags?.exaltedthird?.currentIterationsActive || 0) + 1,
      });
    }
  }

  async decreaseActiations() {
    if (this.type === 'modifier') {
      await this.update({
        [`system.value`]: this.system.value - 1,
      });
    } else {
      const actorData = await foundry.utils.duplicate(this.actor);
      let charmMotePool = game.settings.get("exaltedthird", "gloryOverwhelming") ? 'glorymotecap' : actorData.system.settings.charmmotepool;
      if (this.flags?.exaltedthird?.currentIterationsActive === 1) {
        this.activate();
      } else {
        if (this.system.cost.commitmotes > 0) {
          actorData.system.motes[this.flags?.exaltedthird?.poolCommitted ?? charmMotePool].committed -= this.system.cost.commitmotes;
        }
        await this.actor.update(actorData);
        await this.update({
          [`flags.exaltedthird.currentIterationsActive`]: (this.flags?.exaltedthird?.currentIterationsActive || 0) - 1,
        });
      }
    }
  }

  async spendItemResources(actorData, activateAmount) {
    let newLevel = actorData.system.anima.level;
    let newValue = actorData.system.anima.value;

    if (this.system.cost.motes > 0 || this.system.cost.commitmotes > 0) {
      let spendingMotes = (this.system.cost.motes + this.system.cost.commitmotes) * activateAmount;
      let muteMotes = this.system.keywords.toLowerCase().includes('mute') ? spendingMotes : 0;

      if (this.system.cost.anima > 0) {
        for (let i = 0; i < (this.system.cost.anima * activateAmount); i++) {
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

      const spendMotesResult = this.actor.spendMotes(spendingMotes, actorData, actorData.system.settings.charmmotepool, muteMotes)
      actorData.system.motes.personal.value = spendMotesResult.newPersonalMotes;
      actorData.system.motes.peripheral.value = spendMotesResult.newPeripheralMotes;
      actorData.system.motes.glorymotecap.value = spendMotesResult.newGloryMotes;
      newLevel = spendMotesResult.newAnimaLevel;
      newValue = spendMotesResult.newAnimaValue;
      if (spendMotesResult.feverGain) {
        actorData.system.fever.value += spendMotesResult.feverGain;
      }
      if (this.system.cost.commitmotes > 0) {
        let charmMotePool = game.settings.get("exaltedthird", "gloryOverwhelming") ? 'glorymotecap' : actorData.system.settings.charmmotepool;
        actorData.system.motes[charmMotePool].committed += (this.system.cost.commitmotes * activateAmount);
      }
    }
    actorData.system.grapplecontrolrounds.value = Math.max(0, actorData.system.grapplecontrolrounds.value - (this.system.cost.grapplecontrol * activateAmount) + (getNumberFormula(this.system.restore.grapplecontrol, this.actor) * activateAmount));
    actorData.system.anima.level = newLevel;
    actorData.system.anima.value = newValue;
    actorData.system.willpower.value = Math.max(0, actorData.system.willpower.value - (this.system.cost.willpower * activateAmount));
    actorData.system.limit.value = Math.max(0, actorData.system.limit.value - (this.system.cost.limit * activateAmount));
    if (this.actor.type === 'character') {
      actorData.system.craft.experience.silver.value = Math.max(0, actorData.system.craft.experience.silver.value - (this.system.cost.silverxp * activateAmount));
      actorData.system.craft.experience.gold.value = Math.max(0, actorData.system.craft.experience.gold.value - (this.system.cost.goldxp * activateAmount));
      actorData.system.craft.experience.white.value = Math.max(0, actorData.system.craft.experience.white.value - (this.system.cost.whitexp * activateAmount));
    }
    if (actorData.system.details.aura === this.system.cost.aura || this.system.cost.aura === 'any') {
      actorData.system.details.aura = "none";
    }
    if (this.system.cost.health > 0) {
      let totalHealth = 0;
      for (let [key, health_level] of Object.entries(actorData.system.health.levels)) {
        totalHealth += health_level.value;
      }
      if (this.system.cost.healthtype === 'bashing') {
        actorData.system.health.bashing = Math.min(totalHealth - actorData.system.health.aggravated - actorData.system.health.lethal, actorData.system.health.bashing + (this.system.cost.health * activateAmount));
      }
      else if (this.system.cost.healthtype === 'lethal') {
        actorData.system.health.lethal = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.aggravated, actorData.system.health.lethal + (this.system.cost.health * activateAmount));
      }
      else {
        actorData.system.health.aggravated = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.lethal, actorData.system.health.aggravated + (this.system.cost.health * activateAmount));
      }
    }

    if (actorData.system.settings.charmmotepool === 'personal') {
      actorData.system.motes.personal.value = Math.min(actorData.system.motes.personal.max, actorData.system.motes.personal.value + (getNumberFormula(this.system.restore.motes, this.actor) * activateAmount));
    }
    else {
      actorData.system.motes.peripheral.value = Math.min(actorData.system.motes.peripheral.max, actorData.system.motes.peripheral.value + (getNumberFormula(this.system.restore.motes, this.actor) * activateAmount));
    }
    if (getNumberFormula(this.system.restore.anima, this.actor) > 0) {
      for (let i = 0; i < getNumberFormula(this.system.restore.anima, this.actor); i++) {
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
      actorData.system.anima.level = newLevel;
      actorData.system.anima.value = newValue;
    }
    if (this.system.restore.willpoweriscapbreaking) {
      actorData.system.willpower.value += (getNumberFormula(this.system.restore.willpower, this.actor) * activateAmount);
    } else {
      actorData.system.willpower.value = Math.min(Math.max(actorData.system.willpower.max, actorData.system.willpower.value), actorData.system.willpower.value + (getNumberFormula(this.system.restore.willpower, this.actor) * activateAmount));
    }
    actorData.system.limit.value = Math.min(10, (getNumberFormula(this.system.restore.limit, this.actor) * activateAmount) + actorData.system.limit.value);
    if (getNumberFormula(this.system.restore.health, this.actor) > 0) {
      const bashingHealed = (getNumberFormula(this.system.restore.health, this.actor) * activateAmount) - actorData.system.health.lethal;
      actorData.system.health.lethal = Math.max(0, actorData.system.health.lethal - (getNumberFormula(this.system.restore.health, this.actor) * activateAmount));

      if (bashingHealed > 0) {
        actorData.system.health.bashing = Math.max(0, actorData.system.health.bashing - bashingHealed);
      }
    }
    const tokenId = this.actor.token?.id || this.actor.getActiveTokens()[0]?.id;
    if (game.combat && tokenId) {
      let combatant = game.combat.combatants.find(c => c?.tokenId === tokenId);
      if (combatant && combatant.initiative !== null) {
        let newInitiative = combatant.initiative;
        if (this.system.cost.initiative > 0) {
          newInitiative -= (this.system.cost.initiative * activateAmount);
        }
        if (combatant.initiative > 0 && newInitiative <= 0) {
          newInitiative -= 5;
        }
        newInitiative += (getNumberFormula(this.system.restore.initiative, this.actor) * activateAmount);
        game.combat.setInitiative(combatant.id, newInitiative);
      }
    }
    await animaTokenMagic(this.actor, newValue);
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
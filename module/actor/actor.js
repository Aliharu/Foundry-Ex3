/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class ExaltedThirdActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
  }

  async displayEmbeddedItem(itemId) {
    // Render the chat card template
    let item = this.items.find(x=> x.id === itemId);
    if(!item){
      return ui.notifications.error(`${this.name} does not have an embedded item id ${itemId}!`);
    }
    const token = this.token;
    const templateData = {
      actor: this,
      tokenId: token?.uuid || null,
      item: item.data
    };
    const html = await renderTemplate("systems/exaltedthird/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this, token }),
    };


    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }

  async rollEmbeddedItem(itemId, personal = false) {

    const actorData = duplicate(this);

    let item = this.items.find(x=> x.id == itemId);

    if(!item){
      return ui.notifications.error(`${this.name} does not have an embedded item id ${itemId}!`);
    }

    if(item.type === 'charm') {
      if(item.data.data.cost.motes > 0) {
        if(actorData.data.motes.peripheral.value > 0 && !personal) {
          actorData.data.motes.peripheral.value = Math.max(0, actorData.data.motes.peripheral.value - item.data.data.cost.motes);
        }
        else {
          actorData.data.motes.personal.value = Math.max(0, actorData.data.motes.personal.value - item.data.data.cost.motes);
        }
      }
      actorData.data.willpower.value = Math.max(0, actorData.data.willpower.value - item.data.data.cost.willpower);
      if(this.type === 'character') {
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
            let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.id);
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

    this.displayEmbeddedItem(itemId);

    this.update(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    // Make modifications to data here. For example:
    const data = actorData.data;
    // this._prepareBaseActorData(data);
    let totalHealth = 0;
    let currentPenalty = 0;
    let totalWarstriderHealth = 0;
    let totalShipHealth = 0;
    let currentWarstriderPenalty = 0;
    let currentShipPenalty = 0;

    if (data.battlegroup) {
      totalHealth = data.health.levels.zero.value + data.size.value;
      data.health.total = totalHealth;
      if ((data.health.bashing + data.health.lethal + data.health.aggravated) > data.health.total) {
        data.health.aggravated = data.health.total - data.health.lethal;
        if (data.health.aggravated <= 0) {
          data.health.aggravated = 0
          data.health.lethal = data.health.total
        }
      }
      data.health.penalty = 0;
    }
    else {
      for (let [key, health_level] of Object.entries(data.health.levels)) {
        if ((data.health.bashing + data.health.lethal + data.health.aggravated) > totalHealth) {
          currentPenalty = health_level.penalty;
        }
        totalHealth += health_level.value;
      }
      data.health.total = totalHealth;
      if ((data.health.bashing + data.health.lethal + data.health.aggravated) > data.health.total) {
        data.health.aggravated = data.health.total - data.health.lethal;
        if (data.health.aggravated <= 0) {
          data.health.aggravated = 0;
          data.health.lethal = data.health.total;
        }
      }
      data.health.penalty = currentPenalty;
    }


    for (let [key, health_level] of Object.entries(data.warstrider.health.levels)) {
      if ((data.warstrider.health.bashing + data.warstrider.health.lethal + data.warstrider.health.aggravated) > totalWarstriderHealth) {
        currentWarstriderPenalty = health_level.penalty;
      }
      totalWarstriderHealth += health_level.value;
    }
    data.warstrider.health.total = totalWarstriderHealth;
    if ((data.warstrider.health.bashing + data.warstrider.health.lethal + data.warstrider.health.aggravated) > data.warstrider.health.total) {
      data.warstrider.health.aggravated = data.warstrider.health.total - data.warstrider.health.lethal;
      if (data.warstrider.health.aggravated <= 0) {
        data.warstrider.health.aggravated = 0;
        data.warstrider.health.lethal = data.health.total;
      }
    }
    data.warstrider.health.penalty = currentWarstriderPenalty;

    
    for (let [key, health_level] of Object.entries(data.ship.health.levels)) {
      if ((data.ship.health.bashing + data.ship.health.lethal + data.ship.health.aggravated) > totalShipHealth) {
        currentShipPenalty = health_level.penalty;
      }
      totalShipHealth += health_level.value;
    }
    data.ship.health.total = totalShipHealth;
    if ((data.ship.health.bashing + data.ship.health.lethal + data.ship.health.aggravated) > data.ship.health.total) {
      data.ship.health.aggravated = data.ship.health.total - data.ship.health.lethal;
      if (data.ship.health.aggravated <= 0) {
        data.ship.health.aggravated = 0;
        data.ship.health.lethal = data.health.total;
      }
    }
    data.ship.health.penalty = currentShipPenalty;

    if (actorData.type !== "npc") {
      data.experience.standard.spent = data.experience.standard.total - data.experience.standard.value;
      data.experience.exalt.spent = data.experience.exalt.total - data.experience.exalt.value;
    }
  }
}
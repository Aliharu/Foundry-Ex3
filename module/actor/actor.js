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
    let currentWarstriderPenalty = 0;
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
          data.health.aggravated = 0
          data.health.lethal = data.health.total
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
        data.warstrider.health.aggravated = 0
        data.warstrider.health.lethal = data.health.total
      }
    }
    data.warstrider.health.penalty = currentWarstriderPenalty;

    if (actorData.type !== "npc") {
      data.experience.standard.spent = data.experience.standard.total - data.experience.standard.value;
      data.experience.exalt.spent = data.experience.exalt.total - data.experience.exalt.value;
    }
  }
}
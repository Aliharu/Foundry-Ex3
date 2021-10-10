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
    const data = actorData.data;
    const flags = actorData.flags;

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
    for (let [key, health_level] of Object.entries(data.health.levels)) {
      if ((data.health.bashing + data.health.lethal + data.health.aggravated) > totalHealth) {
        currentPenalty = health_level.penalty;
      }
      totalHealth += health_level.value;
    }
    data.health.total = totalHealth;
    if ((data.health.bashing + data.health.lethal + data.health.aggravated) > data.health.total) {
      data.health.aggravated = data.health.total - data.health.lethal
      if (data.health.aggravated <= 0) {
        data.health.aggravated = 0
        data.health.lethal = data.health.total
      }
    }
    data.health.penalty = currentPenalty;
  }

  // _prepareBaseActorData(data) {
  // }
}
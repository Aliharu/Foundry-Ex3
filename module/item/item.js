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

    // Get the Item's data
  }

  async _preCreate(createData, options, userId) {
    if (createData.type === 'intimacy') {
      createData.img = "systems/exaltedthird/assets/icons/hearts.svg";
    }
    if (createData.type === 'spell' || createData.type === 'initiation') {
      createData.img = "icons/svg/book.svg";
    }
    if (createData.type === 'merit') {
      createData.img = "icons/svg/coins.svg";
    }
    if (createData.type === 'weapon') {
      createData.img = "icons/svg/sword.svg";
    }
    if (createData.type === 'armor') {
      createData.img = "systems/exaltedthird/assets/icons/breastplate.svg";
    }
    if (createData.type === 'charm') {
      createData.img = "icons/svg/explosion.svg";
    }
    if (createData.type === 'specialability') {
      createData.img = "icons/svg/aura.svg";
    }
    if (createData.type === 'craftproject') {
      createData.img = "systems/exaltedthird/assets/icons/anvil-impact.svg";
    }
  }
}

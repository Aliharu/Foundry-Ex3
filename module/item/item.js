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
    const itemData = this.system;
  }

  async _preCreate(createData, options, userId) {
    if (createData.type === 'intimacy') {
      this.data.update({ img: "systems/exaltedthird/assets/icons/hearts.svg" });
    }
    if (createData.type === 'spell' || createData.type === 'initiation') {
      this.data.update({ img: "icons/svg/book.svg" });
    }
    if (createData.type === 'merit') {
      this.data.update({ img: "icons/svg/coins.svg" });
    }
    if (createData.type === 'weapon') {
      this.data.update({ img: "icons/svg/sword.svg" });
    }
    if (createData.type === 'armor') {
      this.data.update({ img: "systems/exaltedthird/assets/icons/breastplate.svg" });
    }
    if (createData.type === 'charm') {
      this.data.update({ img: "icons/svg/explosion.svg" });
    }
    if (createData.type === 'charm') {
      this.data.update({ img: "icons/svg/explosion.svg" });
    }
    if (createData.type === 'specialability') {
      this.data.update({ img: "icons/svg/aura.svg" });
    }
    if (createData.type === 'craftproject') {
      this.data.update({ img: "systems/exaltedthird/assets/icons/anvil-impact.svg" });
    }
  }
}

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
      this.updateSource({ img: "systems/exaltedthird/assets/icons/hearts.svg"});
    }
    if (createData.type === 'spell' || createData.type === 'initiation') {
      this.updateSource({ img: "icons/svg/book.svg"});
    }
    if (createData.type === 'merit') {
      this.updateSource({ img: "icons/svg/coins.svg"});
          }
    if (createData.type === 'weapon') {
      this.updateSource({ img: "icons/svg/sword.svg"});
    }
    if (createData.type === 'armor') {
      this.updateSource({ img: "systems/exaltedthird/assets/icons/breastplate.svg"});
    }
    if (createData.type === 'charm') {
      this.updateSource({ img: "icons/svg/explosion.svg"});
    }
    if (createData.type === 'specialability') {
      this.updateSource({ img: "icons/svg/aura.svg"});
    }
    if (createData.type === 'craftproject') {
      this.updateSource({ img: "systems/exaltedthird/assets/icons/anvil-impact.svg"});
    }
  }
}

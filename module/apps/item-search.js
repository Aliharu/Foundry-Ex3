const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class ItemSearch extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);

    this.filters = {
      type: {
        "armor": { display: "Armor", value: false },
        "charm": { display: "Charm", value: true },
        "item": { display: "Item", value: false },
        "merit": { display: "Merit", value: false },
        "spell": { display: "Spell", value: false },
        "ritual": { display: "Ritual", value: false },
        "weapon": { display: "Weapon", value: false },
      },
      attribute: {
        name: "",
        description: "",
        worldItems: false,
        ability: "",
        requirement: {
          min: "0",
          max: "5",
        },
        essence: {
          min: "0",
          max: "10",
        },
        charmType: "",
        circle: "",
        ritualType: "",
        itemType: "",
        weaponWeight: "",
        weaponArtifactType: "",
        armorArtifactType: "",
      },
    }
  }

  static DEFAULT_OPTIONS = {
    window: {
      title: "Item Search", resizable: true,
    },
    tag: "form",
    form: {
      handler: ItemSearch.myFormHandler,
      submitOnClose: false,
      submitOnChange: true,
      closeOnSubmit: false
    },
    classes: ['exaltedthird-dialog', `solar-background`],
    position: { width: 850, height: 900 },
  };

  static PARTS = {
    form: {
      template: "systems/exaltedthird/templates/dialogues/item-search.html",
    },
  };

  async _prepareContext(_options) {
    await this.loadItems();

    return {
      filters: this.filters,
      selects: CONFIG.exaltedthird.selects,
      items: this.items,
      filteredItems: this.applyFilter(),
      charmAbilities: CONFIG.exaltedthird.charmabilities,
      charmExaltType: JSON.parse(JSON.stringify(CONFIG.exaltedthird.exaltcharmtypes)),
    };
  }

  _onRender(context, options) {
    this.element.querySelectorAll('.item-row').forEach(element => {
      let dragStarted = false;

      element.addEventListener('mousedown', () => {
        dragStarted = false; // Reset the flag on mousedown
      });

      element.addEventListener('click', async (ev) => {
        if (dragStarted) return; // Prevent click handler if dragging
        ev.stopPropagation();
        let itemId = $(ev.currentTarget).attr("data-item-id");
        this.items.find(i => i.id == itemId).sheet.render(true);
      });

      element.setAttribute("draggable", true);

      element.addEventListener("dragstart", event => {
        dragStarted = true; // Set the flag when dragging starts
        event.stopPropagation();
        let itemId = $(event.currentTarget).attr("data-item-id");
        const item = this.items.find(i => i.id == itemId);
        let transfer = {
          type: "Item",
          id: item.id,
          uuid: item.uuid
        };
        if (item.compendium) {
          transfer.pack = `${item.compendium.metadata.package}.${item.compendium.metadata.name}`;
        }
        event.dataTransfer.setData("text/plain", JSON.stringify(transfer));
      });
    });
  }

  async loadItems() {
    this.items = [];
    this.filterId = 0;
    for (let p of game.packs) {
      if (p.metadata.type == "Item" && (game.user.isGM || !p.private)) {
        await p.getDocuments().then(content => {
          this.addItems(content)
        })
      }
    }
    this.addItems(game.items.contents.filter(i => i.permission > 1));
    this.items = this.items.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
  }

  addItems(itemList) {
    for (let item of itemList) {
      item.filterId = this.filterId;
      this.filterId++;
    }
    this.items = this.items.concat(itemList)
  }

  applyFilter() {
    let items = this.items;
    let noItemFilter = true;
    let filteredItems = [];
    for (let filter in this.filters.type) {
      if (this.filters.type[filter].value) {
        filteredItems = filteredItems.concat(items.filter(i => i.type == filter))
        noItemFilter = false;
      }
    }

    if (noItemFilter)
      filteredItems = items;

    for (let filter in this.filters.attribute) {
      if (this.filters.attribute[filter] || filter == "worldItems") {
        switch (filter) {
          case "name":
            filteredItems = filteredItems.filter(i => i.name.toLowerCase().includes(this.filters.attribute.name.toLowerCase()))
            break;
          case "description":
            filteredItems = filteredItems.filter(i => i.system.description.value && i.system.description.value.toLowerCase().includes(this.filters.attribute.description.toLowerCase()))
            break;
          case "worldItems":
            filteredItems = filteredItems.filter(i => this.filters.attribute[filter] || !!i.compendium)
            break;
          case "essence":
            filteredItems = filteredItems.filter((i) => i.type !== 'charm' || (i.system.essence >= parseInt(this.filters.attribute.essence.min) && i.system.essence <= parseInt(this.filters.attribute.essence.max)))
            break;
          case "requirement":
            filteredItems = filteredItems.filter((i) => i.type !== 'charm' || (i.system.requirement >= parseInt(this.filters.attribute.requirement.min) && i.system.requirement <= parseInt(this.filters.attribute.requirement.max)))
            break;
          case "ability":
            if (this.filters.attribute.ability) {
              filteredItems = filteredItems.filter((i) => i.type !== 'charm' || i.system.ability === this.filters.attribute.ability)
            }
            break;
          case 'charmType':
            if (this.filters.attribute.charmType) {
              filteredItems = filteredItems.filter((i) => i.type !== 'charm' || i.system.charmtype === this.filters.attribute.charmType)
            }
            break;
          case 'circle':
            if (this.filters.attribute.circle) {
              filteredItems = filteredItems.filter((i) => i.type !== 'spell' || i.system.circle === this.filters.attribute.circle)
            }
            break;
          case 'itemType':
            if (this.filters.attribute.itemType) {
              filteredItems = filteredItems.filter((i) => i.type !== 'item' || i.system.itemtype === this.filters.attribute.itemType)
            }
            break;
          case 'ritualType':
            if (this.filters.attribute.ritualType) {
              filteredItems = filteredItems.filter((i) => i.type !== 'ritual' || i.system.ritualtype === this.filters.attribute.ritualType)
            }
            break;
          case 'weaponWeight':
            if (this.filters.attribute.weaponWeight) {
              filteredItems = filteredItems.filter((i) => i.type !== 'weapon' || i.system.weighttype === this.filters.attribute.weaponWeight)
            }
            break;
          case 'armorWeight':
            if (this.filters.attribute.armorWeight) {
              filteredItems = filteredItems.filter((i) => i.type !== 'armor' || i.system.weighttype === this.filters.attribute.armorWeight)
            }
            break;
          case 'meritType':
            if (this.filters.attribute.meritType) {
              filteredItems = filteredItems.filter((i) => i.type !== 'merit' || i.system.merittype === this.filters.attribute.meritType)
            }
            break;
          case 'weaponArtifactType':
            if (this.filters.attribute.weaponArtifactType) {
              if (this.filters.attribute.weaponArtifactType === "artifact") {
                filteredItems = filteredItems.filter((i) => i.type !== 'weapon' || i.system.traits.weapontags.value.includes('artifact'))
              } else {
                filteredItems = filteredItems.filter((i) => i.type !== 'weapon' || !i.system.traits.weapontags.value.includes('artifact'))
              }
            }
            break;
          case 'armorArtifactType':
            if (this.filters.attribute.armorArtifactType) {
              if (this.filters.attribute.armorArtifactType === "artifact") {
                filteredItems = filteredItems.filter((i) => i.type !== 'armor' || i.system.traits.armortags.value.includes('artifact'))
              } else {
                filteredItems = filteredItems.filter((i) => i.type !== 'armor' || !i.system.traits.armortags.value.includes('artifact'))
              }
            }
            break;
        }
      }
    }

    return filteredItems;
  }

  static async myFormHandler(event, form, formData) {
    // Do things with the returned FormData
    const formObject = foundry.utils.expandObject(formData.object);
    if (formObject.filters?.attribute) {
      this.filters.attribute = formObject.filters.attribute;
    }
    if (formObject.filters?.type) {
      for (let [key, typeValue] of Object.entries(formObject.filters?.type)) {
        this.filters.type[key].value = typeValue.value;
      }
    }

    this.render();
  }
}

Hooks.on("renderCompendiumDirectory", (app, html, data) => {
  const button = $(`<button class="item-search-button"><i class="fas fa-suitcase"> </i><b>${game.i18n.localize("Ex3.ItemSearch")}</b></button>`);
  html.find(".directory-footer").append(button);

  button.click(ev => {
    game.itemSearch.render(true)
  })
})

Hooks.on('init', () => {
  if (!game.itemSearch)
    game.itemSearch = new ItemSearch();
})
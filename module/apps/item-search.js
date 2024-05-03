export default class ItemSearch extends Application {
  constructor(app) {
    super(app)

    this.filters = {
      type: {
        "charm": { display: "Charm", value: false },
        "spell": { display: "Spell", value: false },
        "ritual": { display: "Ritual", value: false },
        "merit": { display: "Merit", value: false },
      },
      attribute: {
        name: "",
        description: "",
        worldItems: false,
        lessThen: false,
        charmFilters: {
          ability: "",
          requirement: "",
          essence: "",
          charmtype: "",
        }
      },
    }
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = ["dialog", `solar-background`];
    options.id = "ex3-item-search";
    options.template = "systems/exaltedthird/templates/dialogues/item-search.html"
    options.resizable = true;
    options.height = 900;
    options.width = 631;
    options.minimizable = true;
    options.title = "Item Search"
    return options;
  }

  async _render(force = false, options = {}) {
    await this.loadItems();
    await super._render(force, options);
    this.applyFilter(this._element)
  }

  getData() {
    let data = super.getData();
    data.filters = this.filters;
    data.selects = CONFIG.exaltedthird.selects;
    data.items = this.items;
    data.charmAbilities = CONFIG.exaltedthird.charmabilities;
    data.charmExaltType = JSON.parse(JSON.stringify(CONFIG.exaltedthird.exaltcharmtypes));

    return data;
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

  applyFilter(html) {
    let items = this.items
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
          case "charmFilters":
            if(this.filters.attribute.lessThen) {
              if(this.filters.attribute[filter].requirement) {
                filteredItems = filteredItems.filter((i) => i.type !== 'charm' || (i.system.requirement || 11) <= parseInt(this.filters.attribute[filter].requirement))
              }
              if(this.filters.attribute[filter].essence) {
                filteredItems = filteredItems.filter((i) => i.type !== 'charm' || (i.system.essence || 11) <= parseInt(this.filters.attribute[filter].essence))
              }
            }
            else {
              if(this.filters.attribute[filter].requirement) {
                filteredItems = filteredItems.filter((i) => i.type !== 'charm' || (i.system.requirement || '').toString() === this.filters.attribute[filter].requirement)
              }
              if(this.filters.attribute[filter].essence) {
                filteredItems = filteredItems.filter((i) => i.type !== 'charm' || (i.system.essence || '').toString() === this.filters.attribute[filter].essence)
              }
            }
            if(this.filters.attribute[filter].ability) {
              filteredItems = filteredItems.filter((i) => i.type !== 'charm' || i.system.ability === this.filters.attribute[filter].ability)
            }
            if(this.filters.attribute[filter].charmtype) {
              filteredItems = filteredItems.filter((i) => i.type !== 'charm' || i.system.charmtype === this.filters.attribute[filter].charmtype)
            }
            break;
        }
      }
    }
    
    this.filterIds = filteredItems.map(i => i.filterId);
    let list = html.find(".item-row")
    for (let element of list) {
      if (this.filterIds.includes(Number(element.getAttribute('data-filter-id'))))
        $(element).show();
      else
        $(element).hide();
    }
    return filteredItems;
  }


  activateListeners(html) {

    html.find(".item-row").each((i, li) => {
      let item = this.items.find(i => i.id == $(li).attr("data-item-id"))

      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", event => {
        let transfer = {
          type: "Item",
          id: item.id,
          uuid: item.uuid
        }
        if (item.compendium)
          transfer.pack = `${item.compendium.metadata.package}.${item.compendium.metadata.name}`;
        event.dataTransfer.setData("text/plain", JSON.stringify(transfer))
    })
  })

    html.on("click", ".item-row", ev => {
      let itemId = $(ev.currentTarget).attr("data-item-id")
      this.items.find(i => i.id == itemId).sheet.render(true);
    });

    html.on("click", ".filter", ev => {
      this.filters.type[$(ev.currentTarget).attr("data-filter")].value = $(ev.currentTarget).is(":checked");
      this.applyFilter(html);
    });

    html.on("keyup", ".name", ev => {
      this.filters.attribute.name = ev.target.value;
      this.applyFilter(html);
    });
    html.on("keyup", ".description", ev => {
      this.filters.attribute.description = ev.target.value;
      this.applyFilter(html);
    });
    html.on("click", ".world-filter", ev => {
      this.filters.attribute.worldItems = $(ev.currentTarget).is(":checked");
      this.applyFilter(html);
    });
    html.on("click", ".less-then", ev => {
      this.filters.attribute.lessThen = $(ev.currentTarget).is(":checked");
      this.applyFilter(html);
    });
    html.on("change", ".charm-filter", ev => {
      this.filters.attribute.charmFilters[$(ev.currentTarget).attr("data-filter")] = $(ev.currentTarget).val();
      this.applyFilter(html);
    });
  }
}

Hooks.on("renderCompendiumDirectory", (app, html, data) => {
  const button = $(`<button class="item-search"><i class="fas fa-suitcase"></i>${game.i18n.localize("Ex3.ItemSearch")}</button>`);
  html.find(".directory-footer").append(button);

  button.click(ev => {
    game.itemSearch.render(true)
  })
})

Hooks.on('init', () => {
  if (!game.itemSearch)
    game.itemSearch = new ItemSearch();
})
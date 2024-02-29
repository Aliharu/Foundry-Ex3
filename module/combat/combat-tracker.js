/**
* Overrides the display of the combat and turn order tab to add activation
* buttons and either move or remove the initiative button
*/
export class ExaltedCombatTracker extends CombatTracker {
    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            template: 'systems/exaltedthird/templates/sidebar/combat-tracker.html',
        };
    }
    async getData(options) {
        const data = (await super.getData(options));
        data.turns = data.turns.map(t => {
            const combatant = (this.viewed.getEmbeddedDocument("Combatant", t.id));
            return {
                ...t,
                css: t.css,
                acted: combatant?.flags.acted,
                initiativeIconColor: combatant?.actor?.system?.details?.initiativeiconcolor  || '#F9B516',
                initiativeIcon: combatant?.actor?.system?.details?.initiativeicon?.toLowerCase() || 'sun',
                turnOrderInitiative: ((combatant?.initiative || 0) + (combatant?.actor?.system?.turnorderinitiative.value || 0))
            };
        });
        data.turns.sort(function (a, b) {
            const ad = (a.acted && !a.active) ? 1 : 0;
            const bd = (b.acted && !b.active) ? 1 : 0;
            if(ad === bd) {
                return (b.turnOrderInitiative || 0) - (a.turnOrderInitiative || 0);
            }
            return ad - bd;
        });

        return data;
    }
    activateListeners(html) {
        super.activateListeners(html);
        html
            .find(".toggle-turn-over")
            .on("click", this._toggleTurnOver.bind(this));

        html
            .find(".set-character-turn")
            .on("click", this._setCharacterTurn.bind(this));

        html.find(".init-combatant-control").click(ev => this._initCombatantControl(ev));
    }
    async _toggleTurnOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const id = btn.closest(".combatant")?.dataset.combatantId;
        if (!id)
            return;
        await this.viewed.toggleTurnOver(id);
    }

    async _setCharacterTurn(event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const id = btn.closest(".combatant")?.dataset.combatantId;
        if (!id)
            return;
        await this.viewed.setCharacterTurn(id);
    }

    async _initCombatantControl(event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const li = btn.closest(".combatant");
        const combat = this.viewed;
        const c = combat.combatants.get(li.dataset.combatantId);

        switch (btn.dataset.control) {
            case "increaseInit":
                return c.updateInit(true);

            case "decreaseInit":
                return c.updateInit(false);
        }
    }
}
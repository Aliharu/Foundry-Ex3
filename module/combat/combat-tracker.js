/**
* Overrides the display of the combat and turn order tab to add activation
* buttons and either move or remove the initiative button
*/
export default class ExaltedCombatTracker extends foundry.applications.sidebar
    .tabs.CombatTracker {

    static DEFAULT_OPTIONS = {
        classes: ['exaltedthird'],
        actions: {
            toggleTurnOver: this.#toggleTurnOver,
            setCharacterTurn: this.#setCharacterTurn,
            increaseInit: this.#increaseInit,
            decreaseInit: this.#decreaseInit,
        },
    };

    static PARTS = {
        header: {
            template: 'systems/exaltedthird/templates/sidebar/combat-tracker/header.html',
        },
        tracker: {
            template: "systems/exaltedthird/templates/sidebar/combat-tracker/tracker.html"
        },
        footer: {
            template: 'systems/exaltedthird/templates/sidebar/combat-tracker/footer.html',
        },
    };

    async _prepareTrackerContext(context, options) {
        await super._prepareTrackerContext(context, options);
        context.turns = context.turns.map(t => {
            const combatant = (this.viewed.getEmbeddedDocument("Combatant", t.id));
            return {
                ...t,
                css: t.css,
                acted: combatant?.system.acted,
                initiativeIconColor: combatant?.actor?.system?.details?.initiativeiconcolor || '#F9B516',
                initiativeIcon: combatant?.actor?.system?.details?.initiativeicon?.toLowerCase() || 'sun',
                turnOrderInitiative: ((combatant?.initiative || 0) + (combatant?.actor?.system?.turnorderinitiative.value || 0))
            };
        });
        context.turns.sort(function (a, b) {
            const ad = (a.acted && !a.active) ? 1 : 0;
            const bd = (b.acted && !b.active) ? 1 : 0;
            if (ad === bd) {
                return (b.turnOrderInitiative || 0) - (a.turnOrderInitiative || 0);
            }
            return ad - bd;
        });
    }

    // async getData(options) {
    //     const data = (await super.getData(options));
    //     data.turns = data.turns.map(t => {
    //         const combatant = (this.viewed.getEmbeddedDocument("Combatant", t.id));
    //         return {
    //             ...t,
    //             css: t.css,
    //             acted: combatant?.system.acted,
    //             initiativeIconColor: combatant?.actor?.system?.details?.initiativeiconcolor || '#F9B516',
    //             initiativeIcon: combatant?.actor?.system?.details?.initiativeicon?.toLowerCase() || 'sun',
    //             turnOrderInitiative: ((combatant?.initiative || 0) + (combatant?.actor?.system?.turnorderinitiative.value || 0))
    //         };
    //     });
    //     data.turns.sort(function (a, b) {
    //         const ad = (a.acted && !a.active) ? 1 : 0;
    //         const bd = (b.acted && !b.active) ? 1 : 0;
    //         if (ad === bd) {
    //             return (b.turnOrderInitiative || 0) - (a.turnOrderInitiative || 0);
    //         }
    //         return ad - bd;
    //     });

    //     return data;
    // }

    static async #toggleTurnOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const id = event.target.closest('[data-combatant-id]')?.dataset.combatantId;
        if (!id)
            return;
        await this.viewed.toggleTurnOver(id);
    }

    static async #setCharacterTurn(event) {
        event.preventDefault();
        event.stopPropagation();
        const id = event.target.closest('[data-combatant-id]')?.dataset.combatantId;

        if (!id)
            return;
        await this.viewed.setCharacterTurn(id);
    }

    static async #increaseInit(event) {
        event.preventDefault();
        event.stopPropagation();
        const li = event.target.closest('[data-combatant-id]');
        const combat = this.viewed;
        const c = combat.combatants.get(li.dataset.combatantId);
        return c.updateInit(true);
    }

    static async #decreaseInit(event) {
        event.preventDefault();
        event.stopPropagation();
        const li = event.target.closest('[data-combatant-id]');
        const combat = this.viewed;
        const c = combat.combatants.get(li.dataset.combatantId);
        return c.updateInit(false);
    }
}
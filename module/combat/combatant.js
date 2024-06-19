export class ExaltedCombatant extends Combatant {
    prepareBaseData() {
        super.prepareBaseData();
        if (
            this.flags?.acted === undefined &&
            canvas?.ready) {
            this.flags.acted = false;
        }
    }
    testUserPermission(...[user, permission, options]) {
        return (this.actor?.testUserPermission(user, permission, options) ?? user.isGM);
    }

    async toggleCombatantTurnOver() {
        return this.update({
            [`flags.acted`]: !this.flags.acted,
        });
    }

    async updateInit(increase) {
        if (increase && this.initiative >= 0) {
            this.update({ [`flags.crashedBy`]: null });
            if (this.initiative === 0) {
                this.update({ [`flags.crashRecovery`]: 2 });
            }
        }
        if (increase) {
            return this.update({ initiative: this.initiative + 1 });
        }
        else {
            return this.update({ initiative: this.initiative - 1 });
        }
    }
}
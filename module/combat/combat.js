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
}
export class ExaltedCombatant extends Combatant {
    async _preUpdate(updateData, options, user) {
        await super._preUpdate(updateData, options, user);
        if(this.initiative <= 0 && (updateData.initiative ?? 0) > 0) {
            updateData.flags = {
                exaltedthird: {
                    crashedBy: null,
                    crashRecovery: 2,
                }
            }
        }
    }

    testUserPermission(...[user, permission, options]) {
        return (this.actor?.testUserPermission(user, permission, options) ?? user.isGM);
    }

    async toggleCombatantTurnOver() {
        await this.update({
            [`system.acted`]: !this.system.acted,
        });
    }
}
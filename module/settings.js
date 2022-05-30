export function registerSettings() {
    game.settings.register('exaltedthird', 'calculateOnslaught', {
        name: game.i18n.localize('Ex3.Onslaught'),
        hint: game.i18n.localize('Ex3.ShowOnslaughtDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'defenseOnDamage', {
        name: game.i18n.localize('Ex3.DefenseOnDamage'),
        hint: game.i18n.localize('Ex3.DefenseOnDamageDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });
}
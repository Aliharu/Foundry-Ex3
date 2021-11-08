export function registerSettings() {
    game.settings.register('exaltedthird', 'calculateOnslaught', {
        name: game.i18n.localize('ExEss.Onslaught'),
        hint: game.i18n.localize('ExEss.ShowOnslaughtDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });
}
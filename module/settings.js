export function registerSettings() {
    game.settings.register('exaltedthird', 'calculateOnslaught', {
        name: game.i18n.localize('Ex3.Onslaught'),
        hint: game.i18n.localize('Ex3.ShowOnslaughtDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'autoDecisiveDamage', {
        name: game.i18n.localize('Ex3.AutoDecisiveDamage'),
        hint: game.i18n.localize('Ex3.AutoDecisiveDamageDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'animaTokenMagic', {
        name: game.i18n.localize('Ex3.AnimaTokenEffects'),
        hint: game.i18n.localize('Ex3.AnimaTokenEffectsDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'attackEffects', {
        name: game.i18n.localize('Ex3.AttackEffects'),
        hint: game.i18n.localize('Ex3.AttackEffectsDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register("exaltedthird", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    game.settings.register("exaltedthird", "flatXP", {
        name: game.i18n.localize('Ex3.FlatXP'),
        hint: game.i18n.localize('Ex3.FlatXPDescription'),
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register("exaltedthird", "compactSheets", {
        name: game.i18n.localize('Ex3.CompactSheets'),
        hint: game.i18n.localize('Ex3.CompactSheetsDescription'),
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register("exaltedthird", "compactSheetsNPC", {
        name: game.i18n.localize('Ex3.CompactSheetsNPC'),
        hint: game.i18n.localize('Ex3.CompactSheetsDescriptionNPC'),
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register("exaltedthird", "showFullAttacks", {
        name: game.i18n.localize('Ex3.ShowFullAttackButtons'),
        hint: game.i18n.localize('Ex3.ShowFullAttackButtonsDescriptions'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });
    game.settings.register("exaltedthird", "useShieldInitiative", {
        name: game.i18n.localize('Ex3.ShieldInitiativeSetting'),
        hint: game.i18n.localize('Ex3.ShieldInitiativeSettingDescription'),
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
    game.settings.register("exaltedthird", "sheetStyle", {
        name: "Ex3.SheetStyle",
        hint: "Ex3.SheetStyleDescription",
        scope: "world",
        config: true,
        default: "solar",
        type: String,
        choices: {
            "solar": "Ex3.Solar",
            "lunar": "Ex3.Lunar",
            "db": "Ex3.Dragonblooded",
        },
        onChange: (choice) => {
            window.location.reload();
        },
    });
}
export function registerSettings() {
    game.settings.registerMenu('exaltedthird', 'rulesConfig', {
        name: "Ex3.RulesConfig",
        label: "Ex3.RulesConfigLabel",
        hint: "Ex3.RulesConfigLabelDesc",
        icon: "fa-solid fa-globe",
        type: RulesConfigurator,
        restricted: true,
    });

    game.settings.register("exaltedthird", "sheetStyle", {
        name: "Ex3.SheetStyle",
        hint: "Ex3.SheetStyleDescription",
        scope: "world",
        config: true,
        default: "leaves",
        type: String,
        choices: {
            "db": "Ex3.Dragonblooded",
            "exigent": "Ex3.Exigent",
            "janest": "Ex3.Janest",
            "leaves": "Ex3.Leaves",
            "lunar": "Ex3.Lunar",
            "mountain": "Ex3.Mountain",
            "puppeteer": "Ex3.Puppeteer",
            "sidereal": "Ex3.Sidereal",
            "solar": "Ex3.Solar",
            "sovereign": "Ex3.Sovereign",
            "tree": "Ex3.Tree",
        },
        onChange: (choice) => {
            window.location.reload();
        },
    });

    game.settings.register("exaltedthird", "pauseIcon", {
        name: "Ex3.PauseIcon",
        hint: "Ex3.PauseIconDescription",
        scope: "world",
        config: true,
        default: "main",
        type: String,
        choices: {
            "abyssal": "Ex3.Abyssal",
            "alchemical": "Ex3.Alchemical",
            "db": "Ex3.Dragonblooded",
            "exigent": "Ex3.Exigent",
            "getimian": "Ex3.Getimian",
            "infernal": "Ex3.Infernal",
            "liminal": "Ex3.Liminal",
            "lunar": "Ex3.Lunar",
            "main": "Ex3.Main",
            "sidereal": "Ex3.Sidereal",
            "solar": "Ex3.Solar",
            "terrestrial": "Ex3.Terrestrial",
        },
        onChange: (choice) => {
            window.location.reload();
        },
    });

    game.settings.register('exaltedthird', 'useActiveEffectsDropdown', {
        name: game.i18n.localize('Ex3.UseActiveEffectsDropdown'),
        hint: game.i18n.localize('Ex3.UseActiveEffectsDropdownDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'calculateOnslaught', {
        name: game.i18n.localize('Ex3.Onslaught'),
        hint: game.i18n.localize('Ex3.ShowOnslaughtDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'automaticDecisiveDamage', {
        name: game.i18n.localize('Ex3.AutoDecisiveDamage'),
        hint: game.i18n.localize('Ex3.AutoDecisiveDamageDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'automaticWitheringDamage', {
        name: game.i18n.localize('Ex3.AutoWitheringDamage'),
        hint: game.i18n.localize('Ex3.AutoWitheringDamageDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'confirmDamageRolls', {
        name: game.i18n.localize('Ex3.ConfirmDamageRoll'),
        hint: game.i18n.localize('Ex3.ConfirmDamageRollDescription'),
        default: true,
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

    game.settings.register('exaltedthird', 'spendChatCards', {
        name: game.i18n.localize('Ex3.SpendItemsChatCards'),
        hint: game.i18n.localize('Ex3.SpendItemsChatCardsDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedthird', 'nonTargetRollCards', {
        name: game.i18n.localize('Ex3.NonTargetRollCards'),
        hint: game.i18n.localize('Ex3.NonTargetRollCardsDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register("exaltedthird", "rollButtonTarget", {
        name: game.i18n.localize('Ex3.RollButtonTarget'),
        hint: game.i18n.localize('Ex3.RollButtonTargetDescription'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register("exaltedthird", "sortDice", {
        name: game.i18n.localize('Ex3.sortDice'),
        hint: game.i18n.localize('Ex3.sortDiceDescription'),
        scope: "world",
        config: true,
        type: Boolean,
        ruleChange: false,
        default: true
    });

    game.settings.register("exaltedthird", "unifiedCharacterCreation", {
        name: game.i18n.localize('Ex3.UnifiedCharacterCreation'),
        hint: game.i18n.localize('Ex3.UnifiedCharacterCreationDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedthird", "unifiedCharacterAdvancement", {
        name: game.i18n.localize('Ex3.UnifiedAdvancement'),
        hint: game.i18n.localize('Ex3.UnifiedAdvancementDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedthird", "useShieldInitiative", {
        name: game.i18n.localize('Ex3.ShieldInitiativeSetting'),
        hint: game.i18n.localize('Ex3.ShieldInitiativeSettingDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        homebrew: true,
        default: false
    });

    game.settings.register("exaltedthird", "gloryOverwhelming", {
        name: game.i18n.localize('Ex3.GloryOverwhelming'),
        hint: game.i18n.localize('Ex3.GloryOverwhelmingSettingDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        homebrew: true,
        default: false,
        onChange: (choice) => {
            window.location.reload();
        },
    });

    game.settings.register("exaltedthird", "useEssenceGambits", {
        name: game.i18n.localize('Ex3.UseEssenceGambits'),
        hint: game.i18n.localize('Ex3.UseEssenceGambitsDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        homebrew: true,
        default: false
    });

    game.settings.register("exaltedthird", "bankableStunts", {
        name: game.i18n.localize('Ex3.BankableStunts'),
        hint: game.i18n.localize('Ex3.BankableStuntsDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        homebrew: true,
        default: false
    });

    game.settings.register("exaltedthird", "virtues", {
        name: game.i18n.localize('Ex3.UseVirtues'),
        hint: game.i18n.localize('Ex3.UseVirtuesDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedthird", "forgivingDecisives", {
        name: game.i18n.localize('Ex3.ForgivingDecisives'),
        hint: game.i18n.localize('Ex3.ForgivingDecisivesDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedthird", "simplifiedCrafting", {
        name: game.i18n.localize('Ex3.SimplifiedCrafting'),
        hint: game.i18n.localize('Ex3.SimplifiedCraftingDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedthird", "steadyAction", {
        name: game.i18n.localize('Ex3.SteadyAction'),
        hint: game.i18n.localize('Ex3.SteadyActionDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedthird", "disengageCost", {
        name: game.i18n.localize('Ex3.DisengageCost'),
        hint: game.i18n.localize('Ex3.DisengageCostDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: true
    });
}

class RulesConfigurator extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "rules-config";
        options.template = "systems/exaltedthird/templates/dialogues/rules-config.html";
        options.width = 600;
        options.minimizable = true;
        options.resizable = true;
        options.title = "Rules Config";
        return options;
    }

    getData() {
        let data = super.getData();
        data.settings = Array.from(game.settings.settings).filter(s => s[1].ruleChange && !s[1].homebrew).map(i => i[1]);
        data.homebrewSettings = Array.from(game.settings.settings).filter(s => s[1].ruleChange && s[1].homebrew).map(i => i[1]);

        data.settings.forEach(s => s.inputType = s.type == Boolean ? "checkbox" : "text");
        data.homebrewSettings.forEach(s => s.inputType = s.type == Boolean ? "checkbox" : "text");

        data.settings.forEach(s => s.value = game.settings.get(s.namespace, s.key));
        data.homebrewSettings.forEach(s => s.value = game.settings.get(s.namespace, s.key));
        return data
    }


    async _updateObject(event, formData) {
        for(let setting in formData)
            game.settings.set("exaltedthird", setting, formData[setting]);
    }
}
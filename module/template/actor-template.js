import { abilityField, attributeField, resourceField, rollSettingField, shipData, statField, staticSettingField, traitField, warstriderData } from "./common-template.js";

const fields = foundry.data.fields;

class CommonActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    // Note that the return is just a simple object
    return {
      biography: new fields.HTMLField({ initial: "" }),
      details: new fields.SchemaField({
        exalt: new fields.StringField({ initial: "other" }),
        creaturesubtype: new fields.StringField({ initial: "other" }),
        caste: new fields.StringField({ initial: "" }),
        color: new fields.StringField({ initial: "#000000" }),
        animacolor: new fields.StringField({ initial: "#FFFFFF" }),
        initiativeiconcolor: new fields.StringField({ initial: "#F9B516" }),
        initiativeicon: new fields.StringField({ initial: "sun" }),
        tell: new fields.StringField({ initial: "" }),
        spiritshape: new fields.StringField({ initial: "" }),
        birthsign: new fields.StringField({ initial: "" }),
        exaltsign: new fields.StringField({ initial: "" }),
        aura: new fields.StringField({ initial: "" }),
        ideal: new fields.StringField({ initial: "" }),
        supernal: new fields.StringField({ initial: "" }),
        apocalyptic: new fields.StringField({ initial: "" }),
      }),
      health: new fields.SchemaField({
        levels: new fields.SchemaField({
          zero: new fields.SchemaField({
            value: new fields.NumberField({ initial: 1 }),
            penalty: new fields.NumberField({ initial: 0 }),
          }),
          one: new fields.SchemaField({
            value: new fields.NumberField({ initial: 2 }),
            penalty: new fields.NumberField({ initial: 1 }),
          }),
          two: new fields.SchemaField({
            value: new fields.NumberField({ initial: 2 }),
            penalty: new fields.NumberField({ initial: 2 }),
          }),
          three: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            penalty: new fields.NumberField({ initial: 3 }),
          }),
          four: new fields.SchemaField({
            value: new fields.NumberField({ initial: 1 }),
            penalty: new fields.NumberField({ initial: 4 }),
          }),
          inc: new fields.SchemaField({
            value: new fields.NumberField({ initial: 1 }),
            penalty: new fields.StringField({ initial: "inc" }),
          }),
        }),
        value: new fields.NumberField({ initial: 0 }),
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 0 }),
        bashing: new fields.NumberField({ initial: 0 }),
        lethal: new fields.NumberField({ initial: 0 }),
        aggravated: new fields.NumberField({ initial: 0 }),
        penalty: new fields.NumberField({ initial: 0 }),
        penaltymod: new fields.NumberField({ initial: 0 }),
      }),
      motes: new fields.SchemaField({
        personal: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
          min: new fields.NumberField({ initial: 0 }),
          max: new fields.NumberField({ initial: 0 }),
          committed: new fields.NumberField({ initial: 0 }),
        }),
        peripheral: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
          min: new fields.NumberField({ initial: 0 }),
          max: new fields.NumberField({ initial: 0 }),
          committed: new fields.NumberField({ initial: 0 }),
        }),
        glorymotecap: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
          min: new fields.NumberField({ initial: 0 }),
          max: new fields.NumberField({ initial: 0 }),
          committed: new fields.NumberField({ initial: 0 }),
        }),
      }),
      anima: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0 }),
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 3 }),
        level: new fields.StringField({ initial: "Dim" }),
        passive: new fields.StringField({ initial: "" }),
        active: new fields.StringField({ initial: "" }),
        iconic: new fields.StringField({ initial: "" }),
      }),
      fever: statField(0),
      collapse: new fields.SchemaField({
        passive: new fields.BooleanField({ initial: false }),
        active: new fields.BooleanField({ initial: false }),
        iconic: new fields.BooleanField({ initial: false }),
      }),
      limit: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0 }),
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 10 }),
        trigger: new fields.StringField({ initial: "" }),
      }),
      sorcery: new fields.SchemaField({
        motes: resourceField(0, 0),
      }),
      virtueone: new fields.StringField({ initial: "" }),
      virtuetwo: new fields.StringField({ initial: "" }),
      lorebackgrounds: new fields.StringField({ initial: "" }),
      essence: resourceField(1, 10),
      charmslots: statField(0),
      willpower: resourceField(5, 5),
      penumbra: resourceField(0, 10),
      evasion: statField(0),
      parry: statField(0),
      shieldinitiative: statField(0),
      soak: statField(0),
      armoredsoak: statField(0),
      naturalsoak: statField(1),
      hardness: statField(0),
      stuntdice: statField(0),
      resolve: statField(0),
      guile: statField(0),
      grapplecontrolrounds: resourceField(0, 0),
      effectivestrength: statField(0),
      negateevasionpenalty: statField(0),
      negateparrypenalty: statField(0),
      turnorderinitiative: statField(0),
      dicemodifier: statField(0),
      penaltymodifier: statField(0),
      baseinitiative: statField(3),
      crashbonus: statField(5),
      dontresetonslaught: new fields.BooleanField({ initial: false }),
      immunities: new fields.SchemaField({
        onslaught: new fields.BooleanField({ initial: false }),
      }),
      savedRolls: new fields.ObjectField({ initial: {} }),
      sizecategory: new fields.StringField({ initial: "standard" }),
      traits: new fields.SchemaField({
        languages: traitField(),
        resonance: traitField(),
        dissonance: traitField(),
        classifications: traitField(),
      }),
      settings: new fields.SchemaField({
        charmmotepool: new fields.StringField({ initial: "peripheral" }),
        martialartsmastery: new fields.StringField({ initial: "standard" }),
        sorcerycircle: new fields.StringField({ initial: "none" }),
        necromancycircle: new fields.StringField({ initial: "none" }),
        sheetbackground: new fields.StringField({ initial: "default" }),
        exigenttype: new fields.StringField({ initial: "" }),
        smaenlightenment: new fields.BooleanField({ initial: false }),
        showwarstrider: new fields.BooleanField({ initial: false }),
        showship: new fields.BooleanField({ initial: false }),
        showescort: new fields.BooleanField({ initial: false }),
        usetenattributes: new fields.BooleanField({ initial: false }),
        usetenabilities: new fields.BooleanField({ initial: false }),
        rollStunts: new fields.BooleanField({ initial: false }),
        defenseStunts: new fields.BooleanField({ initial: false }),
        editmode: new fields.BooleanField({ initial: true }),
        issorcerer: new fields.BooleanField({ initial: true }),
        iscrafter: new fields.BooleanField({ initial: true }),
        usedotsvalues: new fields.BooleanField({ initial: true }),
        showanima: new fields.BooleanField({ initial: true }),
        hasaura: new fields.BooleanField({ initial: false }),
        showmaidens: new fields.BooleanField({ initial: false }),
        rollsettings: new fields.SchemaField({
          attacks: rollSettingField("dexterity", "melee"),
          command: rollSettingField("charisma", "war"),
          craft: rollSettingField("intelligence", "craft"),
          disengage: rollSettingField("dexterity", "dodge"),
          grapplecontrol: rollSettingField("strength", "brawl"),
          joinbattle: rollSettingField("wits", "awareness"),
          readintentions: rollSettingField("perception", "socialize"),
          rush: rollSettingField("dexterity", "athletics"),
          social: new fields.SchemaField({
            attribute: new fields.StringField({ initial: "charisma" }),
            ability: new fields.StringField({ initial: "socialize" }),
            appearanceattribute: new fields.StringField({ initial: "appearance" }),
            bonus: new fields.NumberField({ initial: 0 }),
          }),
          sorcery: rollSettingField("intelligence", "occult"),
          steady: rollSettingField("stamina", "resistance"),
        }),
        attackrollsettings: new fields.SchemaField({
          withering: new fields.SchemaField({
            bonus: new fields.NumberField({ initial: 0 }),
            damage: new fields.NumberField({ initial: 0 }),
            overwhelming: new fields.NumberField({ initial: 0 }),
          }),
          decisive: new fields.SchemaField({
            bonus: new fields.NumberField({ initial: 0 }),
            damage: new fields.NumberField({ initial: 0 }),
          }),
          gambit: new fields.SchemaField({
            bonus: new fields.NumberField({ initial: 0 }),
            damage: new fields.NumberField({ initial: 0 }),
          }),
        }),
        staticcapsettings: new fields.SchemaField({
          parry: staticSettingField("dexterity", "melee"),
          evasion: staticSettingField("dexterity", "dodge"),
          resolve: staticSettingField("wits", "integrity"),
          guile: staticSettingField("manipulation", "socialize"),
          soak: staticSettingField("stamina", "none"),
        }),
        dicecap: new fields.SchemaField({
          iscustom: new fields.BooleanField({ initial: false }),
          useattribute: new fields.BooleanField({ initial: false }),
          useability: new fields.BooleanField({ initial: false }),
          usespecialty: new fields.BooleanField({ initial: false }),
          other: new fields.StringField({ initial: "" }),
          extratext: new fields.StringField({ initial: "" }),
        }),
      }),
      ship: shipData(),
      warstrider: warstriderData(),
    }
  }

  static migrateData(source) {
    if(source.details?.aura === 'none') {
      source.details.aura = '';
    }
    return super.migrateData(source);
  }
}

export class CharacterData extends CommonActorData {
  static defineSchema() {
    // CharacterData inherits those resource fields
    const commonData = super.defineSchema();
    return {
      // Using destructuring to effectively append our additional data here
      ...commonData,

      attributes: new fields.SchemaField({
        strength: attributeField("physical"),
        charisma: attributeField("social"),
        perception: attributeField("mental"),
        dexterity: attributeField("physical"),
        manipulation: attributeField("social"),
        intelligence: attributeField("mental"),
        stamina: attributeField("physical"),
        appearance: attributeField("social"),
        wits: attributeField("mental"),
      }),
      abilities: new fields.SchemaField({
        archery: abilityField("dexterity", "archery"),
        athletics: abilityField("dexterity", "athletics"),
        awareness: abilityField("perception", "awareness"),
        brawl: abilityField("dexterity", "brawl"),
        bureaucracy: abilityField("intelligence", "bureaucracy"),
        craft: abilityField("intelligence", "craft"),
        dodge: abilityField("dexterity", "dodge"),
        integrity: abilityField("charisma", "integrity"),
        investigation: abilityField("intelligence", "investigation"),
        larceny: abilityField("dexterity", "larceny"),
        linguistics: abilityField("intelligence", "linguistics"),
        lore: abilityField("intelligence", "lore"),
        martialarts: abilityField("dexterity", "martialarts"),
        medicine: abilityField("intelligence", "medicine"),
        melee: abilityField("dexterity", "melee"),
        occult: abilityField("intelligence", "occult"),
        performance: abilityField("charisma", "performance"),
        presence: abilityField("charisma", "presence"),
        resistance: abilityField("stamina", "resistance"),
        ride: abilityField("dexterity", "ride"),
        sail: abilityField("dexterity", "sail"),
        socialize: abilityField("charisma", "socialize"),
        stealth: abilityField("dexterity", "stealth"),
        survival: abilityField("perception", "survival"),
        thrown: abilityField("dexterity", "thrown"),
        war: abilityField("intelligence", "war"),
      }),
      charcreation: new fields.SchemaField({
        physical: new fields.StringField({ initial: "primary" }),
        social: new fields.StringField({ initial: "secondary" }),
        mental: new fields.StringField({ initial: "tertiary" }),
      }),
      experience: new fields.SchemaField({
        standard: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
          total: new fields.NumberField({ initial: 0 }),
        }),
        exalt: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
          total: new fields.NumberField({ initial: 0 }),
        }),
        trigger: new fields.StringField({ initial: "" }),
      }),
      craft: new fields.SchemaField({
        experience: new fields.SchemaField({
          simple: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
          }),
          silver: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
          }),
          gold: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
          }),
          white: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
          }),
        }),
        slots: new fields.SchemaField({
          major: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            total: new fields.NumberField({ initial: 0 }),
          }),
          superior: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            total: new fields.NumberField({ initial: 0 }),
          }),
          legendary: new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            total: new fields.NumberField({ initial: 0 }),
          }),
        }),
      }),
    }
  }
}

export class NpcData extends CommonActorData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,

      creaturetype: new fields.StringField({ initial: "mortal" }),
      pools: new fields.SchemaField({
        command: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
        }),
        grapple: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
        }),
        joinbattle: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
        }),
        movement: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
        }),
        readintentions: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
        }),
        resistance: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
        }),
        social: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
        }),
        sorcery: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
        }),
      }),
      battlegroup: new fields.BooleanField({ initial: false }),
      appearance: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0 }),
      }),
      commandbonus: statField(0),
      size: statField(0),
      drill: statField(0),
      might: statField(0),
      speed: statField(0),

      lunarform: new fields.SchemaField({
        enabled: new fields.BooleanField({ initial: false }),
        actorid: new fields.StringField({ initial: "" }),
      }),
      qualities: new fields.StringField({ initial: "" }),
      escort: new fields.StringField({ initial: "" }),
    }
  }
}
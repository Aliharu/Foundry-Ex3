export async function setGoldenCalibrationIcons() {
  for (let item of game.items) {
    try {
      let updateData = foundry.utils.deepClone(item.toObject());
      if (updateData.type === 'charm') {
        var image = 'icons/svg/explosion.svg';
        var imageMap = {};
        switch (updateData.system.ability) {
          case 'archery':
            image = 'icons/skills/ranged/arrow-flying-white-blue.webp';
            break;
          case 'athletics':
            imageMap = {
              'Attack': 'icons/skills/melee/strike-flail-destructive-yellow.webp',
              'Might': 'icons/magic/control/buff-strength-muscle-damage-orange.webp',
              'Mobility': 'icons/skills/movement/feet-winged-boots-glowing-yellow.webp',
              'Special': 'icons/magic/light/explosion-beam-impact-silhouette.webp',
              'Speed': 'modules/ex3-golden-calibration/icons/speed.webp',
            };
            break;
          case 'awareness':
            image = 'icons/magic/control/hypnosis-mesmerism-eye-tan.webp'
            imageMap = {
              'Special': 'modules/ex3-golden-calibration/icons/awareness-special.webp',
            };
            break;
          case 'brawl':
            image = 'modules/ex3-golden-calibration/icons/brawl.webp'
            imageMap = {
              'Grappling': 'icons/skills/melee/strike-chain-whip-blue.webp',
            };
            break;
          case 'bureaucracy':
            image = 'icons/skills/trades/academics-merchant-scribe.webp'
            break;
          case 'craft':
            image = 'icons/skills/trades/smithing-anvil-silver-red.webp'
            break;
          case 'dodge':
            image = 'modules/ex3-golden-calibration/icons/dodge.webp'
            break;
          case 'integrity':
            image = 'modules/ex3-golden-calibration/icons/integrity.webp'
            break;
          case 'investigation':
            image = 'icons/skills/trades/academics-investigation-study-blue.webp'
            break;
          case 'larceny':
            image = 'icons/skills/trades/security-locksmith-key-gray.webp'
            break;
          case 'linguistics':
            image = 'icons/skills/trades/academics-scribe-quill-gray.webp'
            break;
          case 'lore':
            image = 'modules/ex3-golden-calibration/icons/lore.webp'
            break;
          case 'medicine':
            image = 'icons/tools/cooking/mortar-stone-yellow.webp'
            imageMap = {
              'Poison': 'icons/skills/toxins/poison-bottle-corked-fire-green.webp'
            };
            break;
          case 'melee':
            image = 'icons/skills/melee/weapons-crossed-swords-yellow.webp'
            imageMap = {
              'Defense': 'modules/ex3-golden-calibration/icons/melee-defense.webp',
              'Weaponry': 'modules/ex3-golden-calibration/icons/melee-weaponry.webp',
            };
            break;
          case 'occult':
            image = 'icons/magic/symbols/runes-star-pentagon-orange.webp'
            break;
          case 'performance':
            image = 'icons/skills/trades/music-notes-sound-blue.webp';
            break;
          case 'presence':
            image = 'modules/ex3-golden-calibration/icons/presence.webp'
            imageMap = {
              'Seduction': 'icons/magic/life/heart-glowing-red.webp',
              'Fear': 'icons/magic/control/silhouette-aura-energy.webp'
            };
            break;
          case 'resistance':
            image = 'icons/magic/defensive/shield-barrier-deflect-gold.webp'
            imageMap = {
              'Armor': 'modules/ex3-golden-calibration/icons/resistance-armor.webp',
              'Defense': 'modules/ex3-golden-calibration/icons/resistance-defense.webp',
              'Fury': 'modules/ex3-golden-calibration/icons/resistance-fury.webp',
              'Vitality': 'modules/ex3-golden-calibration/icons/resistance-vitality.webp',
              'Wellness': 'modules/ex3-golden-calibration/icons/resistance-wellness.webp',
            };
            break;
          case 'ride':
            image = 'icons/environment/creatures/horse-brown.webp'
            break;
          case 'sail':
            image = 'icons/skills/trades/profession-sailing-ship.webp';
            imageMap = {
              'Navigation': 'icons/tools/navigation/map-marked-blue.webp',
              'Piloting': 'modules/ex3-golden-calibration/icons/sail-pilot.webp',
              'Sailor': 'modules/ex3-golden-calibration/icons/sailor.webp',
            };
            break;
          case 'socialize':
            image = 'icons/skills/social/diplomacy-handshake-yellow.webp'
            break;
          case 'stealth':
            image = 'icons/magic/perception/shadow-stealth-eyes-purple.webp'
            break;
          case 'survival':
            image = 'icons/magic/nature/wolf-paw-glow-large-green.webp';
            imageMap = {
              'Husbandry': 'modules/ex3-golden-calibration/icons/husbandry.webp',
              'Wilderness': 'icons/magic/nature/plant-bamboo-green.webp',
            };
            break;
          case 'thrown':
            image = 'icons/skills/ranged/daggers-thrown-salvo-orange.webp'
            break;
          case 'war':
            image = 'icons/environment/people/charge.webp'
            break;
          case 'universal':
            image = 'icons/magic/light/explosion-star-large-orange.webp';
            break;
        }
        if (updateData.name === 'Blazing Solar Bolt') {
          image = 'modules/ex3-golden-calibration/icons/solar-bolt.webp';
        }
        if (imageMap[item.folder.name]) {
          image = imageMap[item.folder.name];
        }
        var listingName = updateData.system.ability.charAt(0).toUpperCase() + updateData.system.ability.slice(1);
        if (item.folder.name !== listingName) {
          listingName += ` (${item.folder.name})`;
        }
        updateData.img = image;
        updateData.system.listingname = listingName;
        if (!foundry.utils.isEmpty(updateData)) {
          await item.update(updateData, { enforceTypes: false });
        }
      }
    } catch (error) {
      error.message = `Failed migration for Item ${item.name}: ${error.message} `;
      console.error(error);
    }
  }
}

export async function setCharmIcons() {
  for (let item of game.items) {
    try {
      let updateData = foundry.utils.deepClone(item.toObject());
      if (updateData.type === 'charm') {
        let image = 'icons/svg/explosion.svg';
        let imageMap = {};
        switch (updateData.system.ability) {
          case 'brawl':
            image = 'modules/ex3-golden-calibration/icons/brawl.webp'
            imageMap = {
              'Grappling': 'icons/skills/melee/strike-chain-whip-blue.webp',
            };
            break;
        }
        if (imageMap[item.folder.name]) {
          image = imageMap[item.folder.name];
        }
        let listingName = updateData.system.ability.charAt(0).toUpperCase() + updateData.system.ability.slice(1);
        if (item.folder.name !== listingName) {
          listingName += ` (${item.folder.name})`;
        }
        updateData.img = image;
        // updateData.system.listingname = listingName;
        if (!foundry.utils.isEmpty(updateData)) {
          await item.update(updateData, { enforceTypes: false });
        }
      }
    } catch (error) {
      error.message = `Failed migration for Item ${item.name}: ${error.message} `;
      console.error(error);
    }
  }
}

export async function createTestCharacterForCharms(abilityOrAttribute = 'athletics', charmType = 'solar') {
  let actorData = new Actor.implementation({
    name: `Test Bureaucracy solar`,
    type: 'character'
  }).toObject();
  let charmList = [];
  for (const charm of game.items.filter(item => item.type === 'charm' && item.system.ability === 'bureaucracy' && item.system.charmtype === 'solar')) {
    charmList.push(await foundry.utils.duplicate(charm));
  }
  actorData.items = charmList;
  await Actor.create(actorData);
}

export async function setCostDisplayAndKeyWords() {
  for (let item of game.items.filter((item) => item.type === 'charm' && item.system.modes.alternates.length > 0)) {
    // let updateData = foundry.utils.deepClone(item.toObject());
    // for (const mode of updateData.system.modes.alternates) {
    //   if (!mode.costdisplay) {
    //     mode.costdisplay = item.system.costdisplay;
    //   }
    //   if (!mode.keywords) {
    //     mode.keywords = item.system.keywords;
    //   }
    //   console.log(`Updating Mode ${mode.name} in item ${item.name}`);
    // }
    // if (!foundry.utils.isEmpty(updateData)) {
    //   await item.update(updateData, { enforceTypes: false });
    // }
    console.log(`${item.name}`);
  }
}

export async function setEndTriggers() {
  for (let item of game.items.filter((item) => item.system.duration.trim() === 'One scene')) {
    let updateData = foundry.utils.deepClone(item.toObject());
    updateData.system.endtrigger = 'endscene';
    if (!foundry.utils.isEmpty(updateData)) {
      await item.update(updateData, { enforceTypes: false });
    }
    console.log(item.name);
  }

  for (let item of game.items.filter((item) => item.system.duration.trim() === 'One turn' || item.system.duration.trim() === 'Until next turn')) {
    let updateData = foundry.utils.deepClone(item.toObject());
    updateData.system.endtrigger = 'startturn';
    if (!foundry.utils.isEmpty(updateData)) {
      await item.update(updateData, { enforceTypes: false });
    }
    console.log(item.name);
  }
}

export async function setEditModeToFalse() {
  for (let actor of game.actors) {
    try {
      await actor.update({ [`system.settings.editmode`]: false });
    } catch (error) {
      error.message = `Failed migration for Actor ${actor.name}: ${error.message} `;
      console.error(error);
    }
  }
}

export async function setCharmPrereqs() {
  for (let item of game.items.filter((item) => item.type === 'charm' && item.system.prerequisites && item.system.prerequisites !== 'None')) {
    let updateData = foundry.utils.deepClone(item.toObject());

    if (!foundry.utils.isEmpty(updateData)) {
      const splitPrereqs = item.system.prerequisites.split(',');
      const newPrereqs = [];
      for (const prereq of splitPrereqs) {
        const existingCharm = game.items.filter(item => item.type === 'charm' && item.system.charmtype === updateData.system.charmtype && item.name.trim() === prereq.trim())[0];
        if (existingCharm) {
          updateData.system.charmprerequisites.push(
            {
              id: existingCharm.id,
              name: existingCharm.name
            }
          );
        }
        else {
          newPrereqs.push(prereq);
        }
      }
      if (updateData.system.charmprerequisites) {
        updateData.system.prerequisites = newPrereqs.join(", ");
        await item.update(updateData, { enforceTypes: false });
      }
    }
  }
}
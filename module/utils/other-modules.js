export async function animaTokenMagic(actor, newAnimaValue) {
    const tokenId = actor.token?.id || actor.getActiveTokens()[0]?.id;
    const actorToken = canvas.tokens.placeables.filter(x => x.id === tokenId)[0];
    if (game.modules.get("tokenmagic")?.active && game.settings.get("exaltedthird", "animaTokenMagic") && actorToken) {
        let effectColor = Number(`0x${actor.system.details.animacolor.replace('#', '')}`);
        let sovereign =
            [{
                filterType: "xfire",
                filterId: "myChromaticXFire",
                time: 0,
                blend: 2,
                amplitude: 1.1,
                dispersion: 0,
                chromatic: true,
                scaleX: 1,
                scaleY: 1,
                inlay: false,
                animated:
                {
                    time:
                    {
                        active: true,
                        speed: -0.0015,
                        animType: "move"
                    }
                }
            }];

        let glowing =
            [{
                filterType: "glow",
                filterId: "superSpookyGlow",
                outerStrength: 4,
                innerStrength: 0,
                color: effectColor,
                quality: 0.5,
                padding: 10,
                animated:
                {
                    color:
                    {
                        active: true,
                        loopDuration: 3000,
                        animType: "colorOscillation",
                        val1: 0xFFFFFF,
                        val2: effectColor
                    }
                }
            }];
        let burning =
            [
                {
                    filterType: "zapshadow",
                    filterId: "myPureFireShadow",
                    alphaTolerance: 0.50
                },
                {
                    filterType: "xglow",
                    filterId: "myPureFireAura",
                    auraType: 2,
                    color: effectColor,
                    thickness: 9.8,
                    scale: 4.,
                    time: 0,
                    auraIntensity: 2,
                    subAuraIntensity: 1.5,
                    threshold: 0.40,
                    discard: true,
                    animated:
                    {
                        time:
                        {
                            active: true,
                            speed: 0.0027,
                            animType: "move"
                        },
                        thickness:
                        {
                            active: true,
                            loopDuration: 3000,
                            animType: "cosOscillation",
                            val1: 2,
                            val2: 5
                        }
                    }
                }];

        let bonfire =
            [{
                filterType: "zapshadow",
                filterId: "myZap",
                alphaTolerance: 0.45
            }, {
                filterType: "field",
                filterId: "myLavaRing",
                shieldType: 6,
                gridPadding: 1.25,
                color: effectColor,
                time: 0,
                blend: 14,
                intensity: 1,
                lightAlpha: 0,
                lightSize: 0.7,
                scale: 1,
                radius: 1,
                chromatic: false,
                discardThreshold: 0.30,
                hideRadius: 0.95,
                alphaDiscard: true,
                animated:
                {
                    time:
                    {
                        active: true,
                        speed: 0.0015,
                        animType: "move"
                    },
                    radius:
                    {
                        active: true,
                        loopDuration: 6000,
                        animType: "cosOscillation",
                        val1: 1,
                        val2: 0.8
                    },
                    hideRadius:
                    {
                        active: true,
                        loopDuration: 3000,
                        animType: "cosOscillation",
                        val1: 0.75,
                        val2: 0.4
                    }
                }
            }, {
                filterType: "xglow",
                filterId: "myBurningAura",
                auraType: 2,
                color: effectColor,
                thickness: 9.8,
                scale: 1.,
                time: 0,
                auraIntensity: 2,
                subAuraIntensity: 1,
                threshold: 0.30,
                discard: true,
                zOrder: 3000,
                animated:
                {
                    time:
                    {
                        active: true,
                        speed: 0.0027,
                        animType: "move"
                    },
                    thickness:
                    {
                        active: true,
                        loopDuration: 600,
                        animType: "cosOscillation",
                        val1: 4,
                        val2: 8
                    }
                }
            }];

        if (actorToken) {
            await TokenMagic.deleteFilters(actorToken);
            if (newAnimaValue > 0) {
                if (newAnimaValue === 1) {
                    await TokenMagic.addUpdateFilters(actorToken, glowing);
                }
                else if (newAnimaValue === 2) {
                    await TokenMagic.addUpdateFilters(actorToken, burning);
                    if (actorToken.actor.system.details.exalt === "sovereign") {
                        await TokenMagic.addUpdateFilters(actorToken, sovereign);
                    }
                }
                else {
                    await TokenMagic.addUpdateFilters(actorToken, bonfire);
                    if (actorToken.actor.system.details.exalt === "sovereign") {
                        await TokenMagic.addUpdateFilters(actorToken, sovereign);
                    }
                }
            }
        }
    }
}

export function attackSequence(diceRollerObject) {
    const actorToken = diceRollerObject._getActorToken();
    if (game.modules.get("sequencer")?.active && diceRollerObject.object.target && actorToken && game.settings.get("exaltedthird", "attackEffects")) {
        if (diceRollerObject.object.attackEffectPreset !== 'none') {
            let effectsMap = {
                'arrow': 'jb2a.arrow.physical.white.01.05ft',
                'bite': 'jb2a.bite.400px.red',
                'brawl': 'jb2a.flurry_of_blows.physical.blue',
                'claws': 'jb2a.claws.400px.red',
                'fireball': 'jb2a.fireball.beam.orange',
                'firebreath': 'jb2a.breath_weapons.fire.line.orange',
                'flamepiece': 'jb2a.bullet.01.orange.05ft',
                'glaive': 'jb2a.glaive.melee.01.white.5',
                'goremaul': 'jb2a.maul.melee.standard.white',
                'greatsaxe': 'jb2a.greataxe.melee.standard.white',
                'greatsword': 'jb2a.greatsword.melee.standard.white',
                'handaxe': 'jb2a.handaxe.melee.standard.white',
                'lightning': 'jb2a.chain_lightning.primary.blue.05ft',
                'quarterstaff': 'jb2a.quarterstaff.melee.01.white.3',
                'rapier': 'jb2a.rapier.melee.01.white.4',
                'scimitar': 'jb2a.scimitar.melee.01.white.0',
                'shortsword': 'jb2a.shortsword.melee.01.white.0',
                'spear': 'jb2a.spear.melee.01.white.2',
                'sword': 'jb2a.sword.melee.01.white.4',
                'throwdagger': 'jb2a.dagger.throw.01.white.15ft',
            }

            switch (diceRollerObject.object.attackEffectPreset) {
                case 'fireball':
                    new Sequence()
                        // .effect()
                        // .file('animated-spell-effects-cartoon.fire.118')
                        // .atLocation(actorToken)
                        // .delay(300)
                        .effect()
                        .file(effectsMap[diceRollerObject.object.attackEffectPreset])
                        .atLocation(actorToken)
                        .stretchTo(diceRollerObject.object.target)
                        .effect()
                        .file("jb2a.fireball.explosion.orange")
                        .atLocation(diceRollerObject.object.target)
                        .delay(2100)
                        .effect()
                        .file("jb2a.ground_cracks.orange.01")
                        .atLocation(diceRollerObject.object.target)
                        .belowTokens()
                        .scaleIn(0.5, 150, { ease: "easeOutExpo" })
                        .duration(5000)
                        .fadeOut(3250, { ease: "easeInSine" })
                        .name("Fireball_Impact")
                        .delay(2300)
                        .waitUntilFinished(-3250)
                        .effect()
                        .file("jb2a.impact.ground_crack.still_frame.01")
                        .atLocation(diceRollerObject.object.target)
                        .belowTokens()
                        .fadeIn(300, { ease: "easeInSine" })
                        .play();
                    break;
                case 'flamepiece':
                    new Sequence()
                        .effect()
                        .file(effectsMap[diceRollerObject.object.attackEffectPreset])
                        .atLocation(actorToken)
                        .stretchTo(diceRollerObject.object.target)
                        .waitUntilFinished(-500)
                        .effect()
                        .file("jb2a.impact.010.orange")
                        .atLocation(diceRollerObject.object.target)
                        .play()
                    break;
                case 'goremaul':
                    new Sequence()
                        .effect()
                        .file(effectsMap[diceRollerObject.object.attackEffectPreset])
                        .atLocation(actorToken)
                        .stretchTo(diceRollerObject.object.target)
                        .waitUntilFinished(-1100)
                        .effect()
                        .file("jb2a.impact.ground_crack.orange")
                        .atLocation(diceRollerObject.object.target)
                        .scale(0.5)
                        .belowTokens()
                        .play();
                    break;
                case 'none':
                    break;
                default:
                    new Sequence()
                        .effect()
                        .file(effectsMap[diceRollerObject.object.attackEffectPreset])
                        .atLocation(actorToken)
                        .stretchTo(diceRollerObject.object.target)
                        .play()
                    break;
            }
        }
        else if (diceRollerObject.object.attackEffect) {
            new Sequence()
                .effect()
                .file(diceRollerObject.object.attackEffect)
                .atLocation(actorToken)
                .stretchTo(diceRollerObject.object.target)
                .play()
        }
    }
    if (diceRollerObject.object.weaponMacro) {
        let macro = new Function(diceRollerObject.object.weaponMacro);
        try {
            macro.call(diceRollerObject);
        } catch (e) {
            ui.notifications.error(`<p>There was an error in your macro syntax for the weapon macro:</p><pre>${e.message}</pre><p>See the console (F12) for details</p>`);
            console.error(e);
        }
    }
}
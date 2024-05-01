// new game.exaltedthird.applications.Importer().render(true);
export default class Importer extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "importer",
            title: "Importer",
            template: "systems/exaltedthird/templates/dialogues/importer.html",
        });
    }

    CSVToArray(strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
            ) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);

            }


            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                var strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"),
                    "\""
                );

            } else {

                // We found a non-quoted value.
                var strMatchedValue = arrMatches[3];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }

        // Return the parsed data.
        return (arrData);
    }


    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find(".import-button").on("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const form = html[0];
            if (!form.data.files.length) return ui.notifications.error("You did not upload a data file!");
            const text = await readTextFromFile(form.data.files[0]);

            var charmArray = this.CSVToArray(text);

            let solarFolder = game.folders.find(folder => {
                return folder.name === 'Solar Charms' && folder.type === 'Item';
            });
            if (!solarFolder) {
                solarFolder = await Folder.create({ name: 'Solar Charms', type: 'Item' });
            }
            let lunarFolder = game.folders.find(folder => {
                return folder.name === 'Lunar Charms' && folder.type === 'Item';
            });
            if (!lunarFolder) {
                lunarFolder = await Folder.create({ name: 'Lunar Charms', type: 'Item' });
            }
            let dragonBloodCharms = game.folders.find(folder => {
                return folder.name === 'Dragonblood Charms' && folder.type === 'Item';
            });
            if (!dragonBloodCharms) {
                dragonBloodCharms = await Folder.create({ name: 'Dragonblood Charms', type: 'Item' });
            }
            let martialArtsFolder = game.folders.find(folder => {
                return folder.name === 'Martial Arts Charms' && folder.type === 'Item';
            });
            if (!martialArtsFolder) {
                martialArtsFolder = await Folder.create({ name: 'Martial Arts Charms', type: 'Item' });
            }
            let evocationsFolder = game.folders.find(folder => {
                return folder.name === 'Evocations' && folder.type === 'Item';
            });
            if (!evocationsFolder) {
                evocationsFolder = await Folder.create({ name: 'Evocations', type: 'Item' });
            }
            let spellsFolder = game.folders.find(folder => {
                return folder.name === 'Spells' && folder.type === 'Item';
            });
            if (!spellsFolder) {
                spellsFolder = await Folder.create({ name: 'Spells', type: 'Item' });
            }

            var strengthFolder = await Folder.create({ name: 'Strength', type: 'Item', parent: lunarFolder });
            var dexterityFolder = await Folder.create({ name: 'Dexterity', type: 'Item', parent: lunarFolder });
            var staminaFolder = await Folder.create({ name: 'Stamina', type: 'Item', parent: lunarFolder });
            var charismaFolder = await Folder.create({ name: 'Charisma', type: 'Item', parent: lunarFolder });
            var manipulationFolder = await Folder.create({ name: 'Manipulation', type: 'Item', parent: lunarFolder });
            var appearanceFolder = await Folder.create({ name: 'Appearance', type: 'Item', parent: lunarFolder });
            var perceptionFolder = await Folder.create({ name: 'Perception', type: 'Item', parent: lunarFolder });
            var intelligenceFolder = await Folder.create({ name: 'Intelligence', type: 'Item', parent: lunarFolder });
            var witsFolder = await Folder.create({ name: 'Wits', type: 'Item', parent: lunarFolder });
            var universalFolder = await Folder.create({ name: 'Universal', type: 'Item', parent: lunarFolder });

            var archeryFolder = await Folder.create({ name: 'Archery', type: 'Item', parent: solarFolder });
            var athleticsFolder = await Folder.create({ name: 'Athletics', type: 'Item', parent: solarFolder });
            var awarenessFolder = await Folder.create({ name: 'Awareness', type: 'Item', parent: solarFolder });
            var brawlFolder = await Folder.create({ name: 'Brawl', type: 'Item', parent: solarFolder });
            var bureaucracyFolder = await Folder.create({ name: 'Bureaucracy', type: 'Item', parent: solarFolder });
            var craftFolder = await Folder.create({ name: 'Craft', type: 'Item', parent: solarFolder });
            var dodgeFolder = await Folder.create({ name: 'Dodge', type: 'Item', parent: solarFolder });
            var integrityFolder = await Folder.create({ name: 'Integrity', type: 'Item', parent: solarFolder });
            var investigationFolder = await Folder.create({ name: 'Investigation', type: 'Item', parent: solarFolder });
            var larcenyFolder = await Folder.create({ name: 'Larceny', type: 'Item', parent: solarFolder });
            var linguisticsFolder = await Folder.create({ name: 'Linguistics', type: 'Item', parent: solarFolder });
            var loreFolder = await Folder.create({ name: 'Lore', type: 'Item', parent: solarFolder });
            var medicineFolder = await Folder.create({ name: 'Medicine', type: 'Item', parent: solarFolder });
            var meleeFolder = await Folder.create({ name: 'Melee', type: 'Item', parent: solarFolder });
            var occultFolder = await Folder.create({ name: 'Occult', type: 'Item', parent: solarFolder });
            var performanceFolder = await Folder.create({ name: 'Performance', type: 'Item', parent: solarFolder });
            var presenceFolder = await Folder.create({ name: 'Presence', type: 'Item', parent: solarFolder });
            var resistanceFolder = await Folder.create({ name: 'Resistance', type: 'Item', parent: solarFolder });
            var rideFolder = await Folder.create({ name: 'Ride', type: 'Item', parent: solarFolder });
            var sailFolder = await Folder.create({ name: 'Sail', type: 'Item', parent: solarFolder });
            var socializeFolder = await Folder.create({ name: 'Socialize', type: 'Item', parent: solarFolder });
            var stealthFolder = await Folder.create({ name: 'Stealth', type: 'Item', parent: solarFolder });
            var survivalFolder = await Folder.create({ name: 'Survival', type: 'Item', parent: solarFolder });
            var thrownFolder = await Folder.create({ name: 'Thrown', type: 'Item', parent: solarFolder });
            var warFolder = await Folder.create({ name: 'War', type: 'Item', parent: solarFolder });

            var dragonArcheryFolder = await Folder.create({ name: 'Archery', type: 'Item', parent: dragonBloodCharms });
            var dragonAthleticsFolder = await Folder.create({ name: 'Athletics', type: 'Item', parent: dragonBloodCharms });
            var dragonAwarenessFolder = await Folder.create({ name: 'Awareness', type: 'Item', parent: dragonBloodCharms });
            var dragonBrawlFolder = await Folder.create({ name: 'Brawl', type: 'Item', parent: dragonBloodCharms });
            var dragonBureaucracyFolder = await Folder.create({ name: 'Bureaucracy', type: 'Item', parent: dragonBloodCharms });
            var dragonCraftFolder = await Folder.create({ name: 'Craft', type: 'Item', parent: dragonBloodCharms });
            var dragonDodgeFolder = await Folder.create({ name: 'Dodge', type: 'Item', parent: dragonBloodCharms });
            var dragonIntegrityFolder = await Folder.create({ name: 'Integrity', type: 'Item', parent: dragonBloodCharms });
            var dragonInvestigationFolder = await Folder.create({ name: 'Investigation', type: 'Item', parent: dragonBloodCharms });
            var dragonLarcenyFolder = await Folder.create({ name: 'Larceny', type: 'Item', parent: dragonBloodCharms });
            var dragonLinguisticsFolder = await Folder.create({ name: 'Linguistics', type: 'Item', parent: dragonBloodCharms });
            var dragonLoreFolder = await Folder.create({ name: 'Lore', type: 'Item', parent: dragonBloodCharms });
            var dragonMedicineFolder = await Folder.create({ name: 'Medicine', type: 'Item', parent: dragonBloodCharms });
            var dragonMeleeFolder = await Folder.create({ name: 'Melee', type: 'Item', parent: dragonBloodCharms });
            var dragonOccultFolder = await Folder.create({ name: 'Occult', type: 'Item', parent: dragonBloodCharms });
            var dragonPerformanceFolder = await Folder.create({ name: 'Performance', type: 'Item', parent: dragonBloodCharms });
            var dragonPresenceFolder = await Folder.create({ name: 'Presence', type: 'Item', parent: dragonBloodCharms });
            var dragonResistanceFolder = await Folder.create({ name: 'Resistance', type: 'Item', parent: dragonBloodCharms });
            var dragonRideFolder = await Folder.create({ name: 'Ride', type: 'Item', parent: dragonBloodCharms });
            var dragonSailFolder = await Folder.create({ name: 'Sail', type: 'Item', parent: dragonBloodCharms });
            var dragonSocializeFolder = await Folder.create({ name: 'Socialize', type: 'Item', parent: dragonBloodCharms });
            var dragonStealthFolder = await Folder.create({ name: 'Stealth', type: 'Item', parent: dragonBloodCharms });
            var dragonSurvivalFolder = await Folder.create({ name: 'Survival', type: 'Item', parent: dragonBloodCharms });
            var dragonThrownFolder = await Folder.create({ name: 'Thrown', type: 'Item', parent: dragonBloodCharms });
            var dragonWarFolder = await Folder.create({ name: 'War', type: 'Item', parent: dragonBloodCharms });

            var terrestrialFolder = await Folder.create({ name: 'Terrestrial', type: 'Item', parent: spellsFolder });
            var celestialFolder = await Folder.create({ name: 'Celestial', type: 'Item', parent: spellsFolder });
            var solarSpellFolder = await Folder.create({ name: 'Solar', type: 'Item', parent: spellsFolder });


            var solarFolderMap = {
                'Archery': archeryFolder,
                'Athletics': athleticsFolder,
                'Awareness': awarenessFolder,
                'Brawl': brawlFolder,
                'Bureaucracy': bureaucracyFolder,
                'Craft': craftFolder,
                'Dodge': dodgeFolder,
                'Integrity': integrityFolder,
                'Investigation': investigationFolder,
                'Larceny': larcenyFolder,
                'Linguistics': linguisticsFolder,
                'Lore': loreFolder,
                'Medicine': medicineFolder,
                'Melee': meleeFolder,
                'Occult': occultFolder,
                'Performance': performanceFolder,
                'Presence': presenceFolder,
                'Resistance': resistanceFolder,
                'Ride': rideFolder,
                'Sail': sailFolder,
                'Socialize': socializeFolder,
                'Stealth': stealthFolder,
                'Survival': survivalFolder,
                'Thrown': thrownFolder,
                'War': warFolder,
            }

            var dragonFolderMap = {
                'Archery': dragonArcheryFolder,
                'Athletics': dragonAthleticsFolder,
                'Awareness': dragonAwarenessFolder,
                'Brawl': dragonBrawlFolder,
                'Bureaucracy': dragonBureaucracyFolder,
                'Craft': dragonCraftFolder,
                'Dodge': dragonDodgeFolder,
                'Integrity': dragonIntegrityFolder,
                'Investigation': dragonInvestigationFolder,
                'Larceny': dragonLarcenyFolder,
                'Linguistics': dragonLinguisticsFolder,
                'Lore': dragonLoreFolder,
                'Medicine': dragonMedicineFolder,
                'Melee': dragonMeleeFolder,
                'Occult': dragonOccultFolder,
                'Performance': dragonPerformanceFolder,
                'Presence': dragonPresenceFolder,
                'Resistance': dragonResistanceFolder,
                'Ride': dragonRideFolder,
                'Sail': dragonSailFolder,
                'Socialize': dragonSocializeFolder,
                'Stealth': dragonStealthFolder,
                'Survival': dragonSurvivalFolder,
                'Thrown': dragonThrownFolder,
                'War': dragonWarFolder,
            }

            var spellFolderMap = {
                'Terrestrial': terrestrialFolder,
                'Celestial': celestialFolder,
                'Solar': solarSpellFolder,
            }

            var lunarMap = {
                'Strength': {
                    parentFolder: strengthFolder,
                    folders: {}
                },
                'Dexterity': {
                    parentFolder: dexterityFolder,
                    folders: {}
                },
                'Stamina': {
                    parentFolder: staminaFolder,
                    folders: {}
                },
                'Appearance': {
                    parentFolder: appearanceFolder,
                    folders: {}
                },
                'Charisma': {
                    parentFolder: charismaFolder,
                    folders: {}
                },
                'Manipulation': {
                    parentFolder: manipulationFolder,
                    folders: {}
                },
                'Wits': {
                    parentFolder: witsFolder,
                    folders: {}
                },
                'Perception': {
                    parentFolder: perceptionFolder,
                    folders: {}
                },
                'Intelligence': {
                    parentFolder: intelligenceFolder,
                    folders: {}
                },
            };


            var artifactMap = {};

            var martialArtsMap = {};

            var charmData = {
                type: 'charm'
            }

            var lunarSubAttributeFolder;
            var evocationFolder;
            var martialArtFolder;

            for (const charmRow of charmArray.slice(1)) {
                if (charmRow[1] === 'Lunar') {
                    var attributeArray = charmRow[2].split(',');
                    if (attributeArray.length > 1 && !lunarMap[attributeArray[0]].folders.hasOwnProperty(attributeArray[1].trim())) {
                        lunarSubAttributeFolder = await Folder.create({ name: attributeArray[1].trim(), type: 'Item', parent: lunarMap[attributeArray[0]].parentFolder });
                        lunarMap[attributeArray[0]].folders[attributeArray[1].trim()] = lunarSubAttributeFolder;
                    }
                }
                if (charmRow[1] === 'Evocation') {
                    if (!artifactMap.hasOwnProperty(charmRow[2])) {
                        evocationFolder = await Folder.create({ name: charmRow[2], type: 'Item', parent: evocationsFolder });
                        artifactMap[charmRow[2]] = evocationFolder;
                    }
                }
                if (charmRow[1] === 'Martial Arts') {
                    if (!martialArtsMap.hasOwnProperty(charmRow[2])) {
                        martialArtFolder = await Folder.create({ name: charmRow[2], type: 'Item', parent: martialArtsFolder });
                        martialArtsMap[charmRow[2]] = martialArtFolder;
                    }
                }
            }

            charmArray.slice(1).forEach(async (charmRow, i) => {
                charmData = {
                    type: 'charm',
                    system: {
                        cost: {
                            "motes": 0,
                            "initiative": 0,
                            "anima": 0,
                            "willpower": 0,
                            "aura": "",
                            "health": 0,
                            "healthtype": "bashing",
                            "silverxp": 0,
                            "goldxp": 0,
                            "whitexp": 0
                        }
                    }
                };
                if (charmRow[1] === 'Dragon-Blooded' || charmRow[1] === 'Lunar' || charmRow[1] === 'Solar' || charmRow[1] === 'Martial Arts' || charmRow[1] === 'Evocation' || charmRow[1] === 'Spell') {
                    if (charmRow[0]) {
                        charmData.name = charmRow[0];
                    }
                    if (charmRow[1] === 'Spell') {
                        charmData.folder = spellFolderMap[charmRow[2]];
                        charmData.type = 'spell';
                        charmData.system.circle = charmRow[2].toLowerCase();
                        if (charmRow[4] !== 'Ritual' && parseInt(charmRow[4])) {
                            charmData.system.cost = parseInt(charmRow[4]);
                        } else {
                            charmData.system.cost = 0;
                        }
                        if (parseInt(charmRow[7])) {
                            charmData.system.willpower = parseInt(charmRow[7]);
                        }
                        if (charmRow[14] !== "—") {
                            charmData.system.duration = charmRow[14];
                        }
                    }
                    else {
                        if (charmRow[1] === 'Artifact') {
                            charmData.system.charmtype = 'evocation';
                        }
                        else {
                            charmData.system.charmtype = charmRow[1].replace(' ', '').replace('-', '').toLowerCase();
                        }
                        if (charmRow[1] === 'Solar') {
                            charmData.folder = solarFolderMap[charmRow[2]];
                            charmData.system.ability = charmRow[2].toLowerCase();
                        }
                        if (charmRow[1] === 'Dragon-Blooded') {
                            charmData.folder = dragonFolderMap[charmRow[2]];
                            charmData.system.ability = charmRow[2].toLowerCase();
                        }
                        if (charmRow[1] === 'Lunar') {
                            var attributeArray = charmRow[2].split(',');
                            charmData.system.ability = attributeArray[0].toLowerCase();
                            if (charmRow[2].includes('Universal')) {
                                charmData.folder = universalFolder;
                                charmData.system.ability = 'universal';
                            }
                            else {
                                charmData.folder = lunarMap[attributeArray[0]].folders[attributeArray[1].trim()]
                            }
                        }
                        if (charmRow[1] === 'Evocation') {
                            charmData.folder = artifactMap[charmRow[2]];
                            charmData.system.ability = 'evocation';
                        }
                        if (charmRow[1] === 'Martial Arts') {
                            charmData.folder = martialArtsMap[charmRow[2]];
                            charmData.system.ability = 'martialarts';
                        }
                        if (charmRow[4] !== "—" && charmRow[4] !== 'Var') {
                            charmData.system.cost.motes = parseInt(charmRow[4]);
                        }
                        if (charmRow[5] !== "—") {
                            charmData.system.cost.initiative = parseInt(charmRow[5]);
                        }
                        if (charmRow[6] !== "—") {
                            charmData.system.cost.anima = parseInt(charmRow[6]);
                        }
                        if (charmRow[7] !== "—") {
                            charmData.system.cost.willpower = parseInt(charmRow[7]);
                        }
                        if (charmRow[8] !== "—") {
                            var miscCostArray = charmRow[8].split(',');
                            for (var miscCost of miscCostArray) {
                                miscCost = miscCost.trim();
                                if (miscCost.includes('hl')) {
                                    var num = miscCost.replace(/[^0-9]/g, '');
                                    charmData.system.cost.health = parseInt(num);
                                    if (miscCost.includes('ahl')) {
                                        charmData.system.cost.healthtype = 'aggravated';
                                    }
                                    if (miscCost.includes('lhl')) {
                                        charmData.system.cost.healthtype = 'lethal';
                                    }
                                }
                                if (miscCost.includes('Fire')) {
                                    charmData.system.cost.aura = 'fire';
                                }
                                if (miscCost.includes('Earth')) {
                                    charmData.system.cost.aura = 'earth';
                                }
                                if (miscCost.includes('Air')) {
                                    charmData.system.cost.aura = 'air';
                                }
                                if (miscCost.includes('Water')) {
                                    charmData.system.cost.aura = 'water';
                                }
                                if (miscCost.includes('Wood')) {
                                    charmData.system.cost.aura = 'wood';
                                }
                                if (miscCost.includes('gxp')) {
                                    var num = miscCost.replace(/[^0-9]/g, '');
                                    charmData.system.cost.goldxp = parseInt(num);
                                }
                                else if (miscCost.includes('sxp')) {
                                    var num = miscCost.replace(/[^0-9]/g, '');
                                    charmData.system.cost.silverxp = parseInt(num);
                                }
                                else if (miscCost.includes('wxp')) {
                                    var num = miscCost.replace(/[^0-9]/g, '');
                                    charmData.system.cost.whitexp = parseInt(num);
                                }
                                else if (miscCost.includes('xp')) {
                                    var num = miscCost.replace(/[^0-9]/g, '');
                                    charmData.system.cost.xp = parseInt(num);
                                }
                            }
                        }
                        if (charmRow[9] !== "—") {
                            charmData.system.requirement = parseInt(charmRow[9]);
                        }
                        if (charmRow[10] !== "—") {
                            charmData.system.essence = parseInt(charmRow[10]);
                        }
                        if (charmRow[12] !== "—") {
                            charmData.system.type = charmRow[12];
                        }
                        if (charmRow[13] !== "—") {
                            charmData.system.keywords = charmRow[13];
                        }
                        if (charmRow[14] !== "—") {
                            charmData.system.duration = charmRow[14];
                        }
                        if (charmRow[15] !== "—") {
                            charmData.system.prerequisites = charmRow[15];
                        }
                    }
                    if (charmRow[16] !== "—") {
                        charmData.system.description = charmRow[16];
                    }
                    await Item.create(charmData);
                }

            });
            this.close();
        });
    }
}

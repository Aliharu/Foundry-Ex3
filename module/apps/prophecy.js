import RollForm from "./dice-roller.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class Prophecy extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, options) {
        super(options);
        this.actor = actor;
        this.object = {
            sign: '',
            signTrappings: '',
            maxAmbition: Math.max(3, this.actor.system.essence.value),
            signList: CONFIG.exaltedthird.siderealSigns,
            selects: CONFIG.exaltedthird.selects,
            totalUsedAmbition: 4,
            baseIntervalTime: "Ex3.OneHour",
            ambitions: {
                duration: {
                    label: 'Ex3.Duration',
                    value: "1",
                    text: 'One month',
                },
                frequency: {
                    label: 'Ex3.Frequency',
                    value: "1",
                    text: 'Once per story',
                },
                power: {
                    label: 'Ex3.Power',
                    value: "1",
                    text: 'Effects only mortals and trivial characters.',
                },
                scope: {
                    label: 'Ex3.Scope',
                    value: "1",
                    text: 'Up to 10 people/Household',
                }
            },
            means: {
                cooperation: {
                    label: 'Ex3.Cooperation',
                    value: "0",
                    text: 'No Cooperation',
                },
                cosignatories: {
                    label: 'Ex3.Cosignatories',
                    value: "0",
                    text: 'No Cosignatories',
                },
                additionalIntervalTime: {
                    label: 'Ex3.ExtraIntervalTime',
                    value: "0",
                },
            },
            trappings: {
                label: 'Ex3.Trappings',
                value: false,
            }
        }
    }

    static DEFAULT_OPTIONS = {
        window: {
            title: "Prophecy",
        },
        tag: "form",
        form: {
            handler: Prophecy.myFormHandler,
            submitOnClose: false,
            submitOnChange: true,
            closeOnSubmit: false
        },
        classes: [`sidereal-background`],
        position: { width: 400 },
    };

    static PARTS = {
        form: {
            template: "systems/exaltedthird/templates/dialogues/prophecy.html",
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    };

    async _prepareContext(_options) {
        const baseTimeMap = {
            1: "Ex3.OneHour",
            2: "Ex3.OneDay",
            3: "Ex3.OneWeek",
            4: "Ex3.OneMonth",
            5: "Ex3.OneSeason",
            6: "Ex3.OneYear",
        };
        const valueMap = {
            cooperation: {
                0: 'No Cooperation',
                1: 'Another sidereal or a god with thematically related powers.',
                2: 'More than a single circle of sidereals',
            },
            cosignatories: {
                0: 'No Cosignatory',
                1: 'Another sidereal or Bureau god',
                2: 'An Essence 6+ god or sidereal',
            },
            duration: {
                1: 'One month',
                2: 'One season',
                3: 'One year',
                4: 'One century',
                5: 'One millennium',
            },
            frequency: {
                1: 'Once per story',
                2: 'Once per week',
                3: 'Once per day',
                4: 'Once per scene',
                5: 'No limit',
            },
            power: {
                1: 'Effects only mortals and trivial characters',
                2: 'Can affect non-exalts with Essence (Sidereals Essence)',
                3: 'Can affect un-exalted characters with (Sidereals Essence+2) or less or Exalted with (Sidereals Essence) or less',
                4: 'Effects all non-exalted characters and Exalted characters with (Sidereals Essence+2) or less',
                5: 'All characters',
            },
            scope: {
                1: 'Up to 10 people/Household',
                2: 'Up to 25 people/Hamlet',
                3: 'Up to 100 people/Village',
                4: 'Up to 1,000 people/Town or City neightborhood',
                5: 'Up to 10,000 people/small city, large city district',
            },
        }

        this.object.maxAmbition = Math.max(3, this.actor.system.essence.value);
        this.object.maxTotalAmbition = (this.actor.system.essence.value * 2) + 5;
        if (this.object.sign === this.actor.system.details.exaltsign || this.object.sign === this.actor.system.details.birthsign) {
            this.object.maxAmbition++;
            this.object.maxTotalAmbition += 5;
        }

        let prophecyAmbition = 0;
        for (const ambition of Object.values(this.object.ambitions)) {
            prophecyAmbition += parseInt(ambition.value);
        }
        this.object.totalUsedAmbition = prophecyAmbition;
        for (const [ambitionType, ambition] of Object.entries(this.object.ambitions)) {
            ambition.text = valueMap[ambitionType][ambition.value];
        }


        let timeValue = 1;
        let maxValue = 1; // Initialize with the smallest possible number
        for (const key in this.object.ambitions) {
            if (parseInt(this.object.ambitions[key].value) > maxValue) {
                maxValue = parseInt(this.object.ambitions[key].value);
            }
        }
        if (maxValue > 4) {
            timeValue = 3;
        } else if (maxValue > 2) {
            timeValue = 2;
        } else {
            timeValue = 1;
        }
        timeValue = Math.min(timeValue + parseInt(this.object.means.additionalIntervalTime.value), 6);
        this.object.baseIntervalTime = baseTimeMap[timeValue];
        for (const [meanType, mean] of Object.entries(this.object.means)) {
            if(meanType !== 'additionalIntervalTime') {
                mean.text = valueMap[meanType][mean.value];
            }
        }

        return {
            data: this.object,
            buttons: [
                { type: "submit", icon: "fa-solid fa-dice-d10", label: "Ex3.Roll" }
            ],
        };
    }

    static async myFormHandler(event, form, formData) {
        // Do things with the returned FormData
        foundry.utils.mergeObject(this, formData.object);

        if (event.type === 'submit') {
            let bonusIntervals = 0;
            for (const mean of Object.values(this.object.means)) {
                bonusIntervals += parseInt(mean.value);
            }
            if (this.object.trappings.value) {
                bonusIntervals += 1;
            }

            const sign = `The ${this.object.sign?.capitalize() || "No Sign"}`;

            const cardContent = await renderTemplate("systems/exaltedthird/templates/chat/prophecy-card.html", { 'data': this.object, 'actor': this.actor, intervalTimeString: this.object.baseIntervalTime, sign: sign });

            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: cardContent,
                style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            });
            game.rollForm = new RollForm(this.actor, {classes: [" exaltedthird exaltedthird-dialog dice-roller", `${game.settings.get("exaltedthird", "sheetStyle")}-background`]}, {}, { rollType: 'prophecy', prophecyAmbition: this.object.totalUsedAmbition, bonusIntervals: bonusIntervals }).render(true);
            this.close();
        }
        this.render();
    }
}
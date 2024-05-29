import { RollForm } from "./dice-roller.js";

export class Prophecy extends FormApplication {
    constructor(actor, options, object, data) {
        super(object, options);
        this.actor = actor;
        this.object.sign = '';
        this.object.signTrappings = '';
        this.object.maxAmbition = Math.max(3, this.actor.system.essence.value);
        this.object.maxTotalAmbition = (this.actor.system.essence.value * 2) + 5;
        this.object.signList = CONFIG.exaltedthird.siderealSigns;
        this.object.selects = CONFIG.exaltedthird.selects;
        this.object.totalUsedAmbition = 4;
        this.object.ambitions = {
            duration: {
                label: 'Ex3.Duration',
                value: 1,
                text: 'One month',
            },
            frequency: {
                label: 'Ex3.Frequency',
                value: 1,
                text: 'Once per story',
            },
            power: {
                label: 'Ex3.Power',
                value: 1,
                text: 'Effects only mortals and trivial characters.',
            },
            scope: {
                label: 'Ex3.Scope',
                value: 1,
                text: 'Up to 10 people/Household',
            }
        }
        this.object.means = {
            cooperation: {
                label: 'Ex3.Cooperation',
                value: 0,
                text: 'No Cooperation',
            },
            cosignatories: {
                label: 'Ex3.Cosignatories',
                value: 0,
                text: 'No Cosignatories',
            },
            intervalTime: {
                label: 'Ex3.IntervalTime',
                value: 0,
            },

        }
        this.object.trappings = {
            label: 'Ex3.Trappings',
            value: false,
        }
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["dialog", `${game.settings.get("exaltedthird", "sheetStyle")}-background`],
            popOut: true,
            template: "systems/exaltedthird/templates/dialogues/prophecy.html",
            id: "prophecy",
            title: `Prophecy`,
            resizable: true,
            width: 400,
            submitOnChange: true,
            closeOnSubmit: false
        });
    }

    getData() {
        return {
            data: this.object,
        };
    }

    async _updateObject(event, formData) {
        foundry.utils.mergeObject(this, formData);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("#roll").on("click", async (event) => {
            let bonusIntervals = 0;
            for (const mean of Object.values(this.object.means)) {
                bonusIntervals += parseInt(mean.value);
            }
            if (this.object.trappings.value) {
                bonusIntervals += 1;
            }

            const intervalTime = {
                "0": "One Week",
                "1": "One Month",
                "2": "Three Months",
            };

            const sign = `The ${this.object.sign.capitalize()}`;

            let intervalTimeString = intervalTime[this.object.means.intervalTime.value];

            const cardContent = await renderTemplate("systems/exaltedthird/templates/chat/prophecy-card.html", { 'data': this.object, intervalTimeString: intervalTimeString, sign: sign });

            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: cardContent,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            });
            game.rollForm = new RollForm(this.actor, {}, {}, { rollType: 'prophecy', prophecyAmbition: this.object.totalUsedAmbition, bonusIntervals: bonusIntervals }).render(true);
            this.close();
        });

        html.on("change", ".ambition-rerender", ev => {
            const valueMap = {
                duration: {
                    1: 'One month',
                    2: 'One season',
                    3: 'One year',
                    4: 'Ten years',
                    5: 'One hundred years',
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
                    2: 'Can affect non-exalts with Essence 1',
                    3: 'Can affect un-exalted characters with essence 3 or less',
                    4: 'Can affect any character with less or equal to Sidereal\'s (Essence or 3)',
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
            let prophecyAmbition = 0;
            for (const ambition of Object.values(this.object.ambitions)) {
                prophecyAmbition += parseInt(ambition.value);
            }
            this.object.totalUsedAmbition = prophecyAmbition;
            this.object.ambitions[ev.target.id].text = valueMap[ev.target.id][ev.target.value];
            this.render();
        });

        html.on("change", ".means-rerender", ev => {
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
            }
            this.object.means[ev.target.id].text = valueMap[ev.target.id][ev.target.value];
            this.render();
        });

        html.on("change", ".sign-select", ev => {
            this.object.maxAmbition = Math.max(3, this.actor.system.essence.value);
            this.object.maxTotalAmbition = (this.actor.system.essence.value * 2) + 5;
            if (ev.target.value === this.actor.system.details.exaltsign || ev.target.value === this.actor.system.details.birthsign) {
                this.object.maxAmbition++;
                this.object.maxTotalAmbition += 5;
            }
            this.render();
        });
    }
}
import RollForm from "../apps/dice-roller.js";

export function getNumberFormula(formulaString, actor, item = null) {
    let negativeValue = false;
    if (formulaString.startsWith('-(') && formulaString.endsWith(')')) {
        formulaString = formulaString.slice(2, -1); // Remove `-(...)`
        negativeValue = true;
    }

    // Helper function to evaluate a single operation
    const evaluate = (leftVar, operand, rightVar) => {
        switch (operand) {
            case '+': return leftVar + rightVar;
            case '-': return leftVar - rightVar;
            case '*': return leftVar * rightVar;
            case '/>': return Math.ceil(leftVar / rightVar);
            case '/<': return Math.floor(leftVar / rightVar);
            case '|': return Math.max(leftVar, rightVar);
            case 'cap': return Math.min(leftVar, rightVar);
            default: throw new Error(`Unknown operator: ${operand}`);
        }
    };

    const formulaData = (changeValue, actor, item = null) => {
        let returnValue = 0;
        let negativeValue = false;
        if (parseInt(changeValue)) {
            return parseInt(changeValue);
        }
        if (changeValue.includes('-')) {
            returnValue = changeValue.replace('-', '');
            negativeValue = true;
        }
        if (changeValue.toLowerCase() === 'activationcount') {
            returnValue = item.effect?.parent?.flags?.exaltedthird?.currentIterationsActive ?? 1;
        }
        if (actor.getRollData()[changeValue]?.value) {
            returnValue = actor.getRollData()[changeValue]?.value;
        }
        if (negativeValue) {
            returnValue *= -1;
        }
        return returnValue;
    };

    // Helper function to parse values (operands)
    const parseValue = (token) => formulaData(token.trim(), actor, item);

    // Recursive function to evaluate expressions with parentheses and operations
    const evaluateExpression = (expression) => {
        // Match parentheses and solve inner expressions first
        while (expression.includes('(')) {
            expression = expression.replace(/\(([^()]+)\)/g, (_, inner) => evaluateExpression(inner));
        }

        // Split expression into tokens by operators, respecting order of operations
        const operators = [['*', '/>', '/<'], ['+', '-'], ['|', 'cap']]; // Order of precedence
        let tokens = expression.split(/(\s+)/).filter(token => token.trim() !== ''); // Split and filter whitespace

        for (const operatorGroup of operators) {
            let i = 0;
            while (i < tokens.length) {
                const token = tokens[i];
                if (operatorGroup.includes(token)) {
                    const leftVar = parseValue(tokens[i - 1]);
                    const rightVar = parseValue(tokens[i + 1]);
                    const result = evaluate(leftVar, token, rightVar);
                    tokens.splice(i - 1, 3, result.toString()); // Replace operation with result
                    i = i - 1; // Adjust index after splice
                } else {
                    i++;
                }
            }
        }

        return parseValue(tokens[0]);
    };

    // Evaluate the expression and apply the negative sign if necessary
    let formulaResult = evaluateExpression(formulaString);
    formulaResult = negativeValue ? -formulaResult : formulaResult;
    return formulaResult;
}

export async function getEnritchedHTML(item) {
    item.enritchedHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true, secrets: true, relativeTo: item });
}

export function sortDice(diceRoll, ignoreSetting = false) {
    //ignoreSetting = true will always sort dice

    let sortedDice;

    if (game.settings.get('exaltedthird', 'sortDice') || ignoreSetting === true) {
        sortedDice = diceRoll.sort((a, b) => b.result - a.result);
    } else {
        sortedDice = diceRoll;
    }

    return sortedDice;
}

/**
 * From the Draw Steel System
 * A helper method for constructing an HTML button based on given parameters.
 * @param {object} config Options forwarded to the button
 * @param {string} config.label
 * @param {Record<string, string>} [config.dataset={}]
 * @param {string[]} [config.classes=[]]
 * @param {string} [config.icon=""]
 * @param {"button" | "submit"} [config.type="button"]
 * @param {boolean} [config.disabled=false]
 * @returns {HTMLButtonElement}
 */
export function constructHTMLButton({ label, dataset = {}, classes = [], icon = "", type = "button", disabled = false }) {
    const button = document.createElement("button");
    button.type = type;

    for (const [key, value] of Object.entries(dataset)) {
        button.dataset[key] = value;
    }
    button.classList.add(...classes);
    if (icon) icon = `<i class="${icon}"></i> `;
    if (disabled) button.disabled = true;
    button.innerHTML = `${icon}${label}`;

    return button;
}

export function appendSidebarButtons(html, type) {
    const buttonClassMap = {
        'actor': 'character-generator-button',
        'item': 'template-import-button',
        'journal': 'charm-card-button',
        'compendium': 'item-search-button',
    }
    const buttonClassLabel = {
        'actor': game.i18n.localize("Ex3.Generate"),
        'item': game.i18n.localize("Ex3.Import"),
        'journal': game.i18n.localize("Ex3.CharmCardJournals"),
        'compendium': game.i18n.localize("Ex3.ItemSearch"),
    }
    const buttonClassIcon = {
        'actor': 'fa-user-plus',
        'item': 'fa-suitcase',
        'journal': 'fa-book-open',
        'compendium': 'fa-suitcase',
    }
    if (html instanceof jQuery) {
        html = $(html)[0];
    }
    const buttonsText = document.createElement("div");
    buttonsText.classList.add("action-buttons");
    buttonsText.classList.add("flexrow");

    const button = document.createElement("button");
    button.classList.add(buttonClassMap[type]);
    button.innerHTML = `<i class="fas ${buttonClassIcon[type]}"></i> ${buttonClassLabel[type]}`;
    buttonsText.appendChild(button);

    if (type === 'actor' && game.user.isGM) {
        const importButton = document.createElement("button");
        importButton.classList.add("template-import-button", "button-text");
        importButton.innerHTML = `<i class="fas fa-file-import"></i> ${game.i18n.localize("Ex3.Import")}`;
        buttonsText.appendChild(importButton);
    }
    const headerActions = html.querySelector(".header-actions");
    if (headerActions) {
        headerActions.after(buttonsText);
    }
}

export function toggleDisplay(target) {
    const li = target.nextElementSibling;
    if ((getComputedStyle(li)?.display || 'none') == 'none') {
        li.style.display = 'block';
    } else {
        li.style.display = 'none';
    }
}

export function parseCounterStates(states) {
    return states.split(',').reduce((obj, state) => {
        const [k, v] = state.split(':')
        obj[k] = v
        return obj
    }, {})
}

export function isColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
}

export function noActorBaseRoll() {
    new RollForm(null, { classes: [" exaltedthird exaltedthird-dialog dice-roller", `${game.settings.get("exaltedthird", "sheetStyle")}-background`] }, {}, { rollType: 'base' }).render(true);
}

export function createListSections(items) {
    const sectionList = {};

    for (const item of items) {
        if (item.system.listingname) {
            if (!sectionList[item.system.listingname]) {
                sectionList[item.system.listingname] = { name: item.system.listingname, visible: true, list: [], collapse: true };
            }
            sectionList[item.system.listingname].list.push(item);
        }
        else {
            switch (item.type) {
                case 'charm':
                    if (!sectionList[item.system.ability]) {
                        sectionList[item.system.ability] = { name: game.i18n.localize(CONFIG.exaltedthird.charmabilities[item.system.ability]) || 'Ex3.Other', visible: true, list: [], collapse: true };
                    }
                    sectionList[item.system.ability].list.push(item);
                    break;
                case 'spell':
                    if (!sectionList[item.system.circle]) {
                        sectionList[item.system.circle] = { name: `${game.i18n.localize(CONFIG.exaltedthird.circles[item.system.circle])} Spells`, visible: true, list: [], collapse: true };
                    }
                    sectionList[item.system.circle].list.push(item);
                    break;
                case 'merit':
                    if (item.system.archetypename) {
                        if (!sectionList[`merit${item.system.archetypename}`]) {
                            sectionList[`merit${item.system.archetypename}`] = { name: `${item.system.archetypename} Merits`, list: [], collapse: true };
                        }
                        sectionList[`merit${item.system.archetypename}`].list.push(item);
                    } else {
                        if (!sectionList[item.system.merittype]) {
                            sectionList[item.system.merittype] = { name: `${game.i18n.localize(CONFIG.exaltedthird.meritTypes[item.system.merittype])} Merits`, visible: true, list: [], collapse: true };
                        }
                        sectionList[item.system.merittype].list.push(item);
                    }
                    break;
                case 'armor':
                    if (item.system.traits.armortags.value.includes('artifact')) {
                        sectionList[`armorArtifact${item.system.weighttype}`] = {
                            name: `${game.i18n.localize(CONFIG.exaltedthird.weightTypes[item.system.weighttype])} Artifact Armor`,
                            list: [],
                            collapse: true
                        }
                        sectionList[`armorArtifact${item.system.weighttype}`].list.push(item);
                    }
                    else {
                        sectionList[`armor${item.system.weighttype}`] = {
                            name: `${game.i18n.localize(CONFIG.exaltedthird.weightTypes[item.system.weighttype])} Mundane Armor`,
                            list: [],
                            collapse: true
                        }
                        sectionList[`armor${item.system.weighttype}`].list.push(item);
                    }
                    break;
                case 'weapon':
                    if (item.system.traits.weapontags.value.includes('artifact')) {
                        if (!sectionList[`weaponArtifact${item.system.weighttype}`]) {
                            sectionList[`weaponArtifact${item.system.weighttype}`] = {
                                name: `${game.i18n.localize(CONFIG.exaltedthird.weightTypes[item.system.weighttype])} Artifact Weapons`,
                                list: [],
                                collapse: true
                            }
                        }
                        sectionList[`weaponArtifact${item.system.weighttype}`].list.push(item);
                    }
                    else {
                        if (!sectionList[`weapon${item.system.weighttype}`]) {
                            sectionList[`weapon${item.system.weighttype}`] = {
                                name: `${game.i18n.localize(CONFIG.exaltedthird.weightTypes[item.system.weighttype])} Mundane Weapons`,
                                list: [], collapse: true
                            }
                        }

                        sectionList[`weapon${item.system.weighttype}`].list.push(item);
                    }
                    break;
                case 'customability':
                    if (item.system.siderealmartialart) {
                        if (!sectionList['siderealmartialarts']) {
                            sectionList[`siderealmartialarts`] = {
                                name: game.i18n.localize("Ex3.SiderealMartialArts"),
                                list: [],
                                collapse: true
                            }
                        }
                        sectionList['siderealmartialarts'].list.push(item);
                    } else {
                        if (!sectionList['martialarts']) {
                            sectionList[`martialarts`] = {
                                name: game.i18n.localize("Ex3.MartialArts"),
                                list: [],
                                collapse: true
                            }
                        }
                        sectionList['martialarts'].list.push(item);
                    }
                    if (item.system.armorallowance) {
                        if (!sectionList[`martialArts${item.system.armorallowance}`]) {
                            sectionList[`martialArts${item.system.armorallowance}`] = {
                                name: `Martial Arts (${game.i18n.localize(CONFIG.exaltedthird.martialArtsArmorAllowances[item.system.armorallowance])} or Lower Armor)`,
                                list: [],
                                collapse: true
                            }
                        }
                        sectionList[`martialArts${item.system.armorallowance}`].list.push(item);
                    }

                    break;
                case 'item':
                    if (!sectionList[`item${item.system.itemtype}`]) {
                        sectionList[`item${item.system.itemtype}`] = {
                            name: `Items (${game.i18n.localize(CONFIG.exaltedthird.itemTypes[item.system.itemtype])})`,
                            list: [],
                            collapse: true
                        }
                    }
                    sectionList[`item${item.system.itemtype}`].list.push(item);
                    break;
                case 'ritual':
                    if (item.system.archetypename) {
                        if (!sectionList[item.system.archetypename]) {
                            sectionList[item.system.archetypename] = { name: item.system.archetypename, list: [], collapse: true };
                        }
                        sectionList[item.system.archetypename].list.push(item);
                    } else {
                        if (!sectionList['shapingRituals']) {
                            sectionList['shapingRituals'] = { name: game.i18n.localize("Ex3.ShapingRituals"), list: [], collapse: true };
                        }
                        sectionList['shapingRituals'].list.push(item);
                    }
                    break;
                case 'specialability':
                    if (!sectionList['specialAbilities']) {
                        sectionList['specialAbilities'] = { name: game.i18n.localize("Ex3.SpecialAbilities"), list: [], collapse: true };
                    }
                    sectionList['specialAbilities'].list.push(item);
                default:
                    if (!sectionList['otherItems']) {
                        sectionList['otherItems'] = { name: game.i18n.localize("Ex3.Other"), list: [], collapse: true };
                    }
                    sectionList['otherItems'].list.push(item);
                    break;
            }
        }
    }
    return sectionList;
}

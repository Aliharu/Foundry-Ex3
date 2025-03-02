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
    item.enritchedHTML = await TextEditor.enrichHTML(item.system.description, { async: true, secrets: true, relativeTo: item });
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
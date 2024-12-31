export default class ExaltedActiveEffect extends ActiveEffect {
    apply(actor, change) {
        if (change.value) {
            let negativeValue = false;
            if (change.value.startsWith('-(') && change.value.endsWith(')')) {
                change.value = change.value.slice(2, -1); // Remove `-(...)`
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
        
            // Helper function to parse values (operands)
            const parseValue = (token) => formulaData(token.trim(), change, actor);
        
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
            let rollerValue = evaluateExpression(change.value);
            rollerValue = negativeValue ? -rollerValue : rollerValue;
            change.value = rollerValue;
        }
        return super.apply(actor, change);
    }
}

function formulaData(changeValue, change, actor) {
    if (parseInt(changeValue)) {
        return parseInt(changeValue);
    }
    var negativeValue = false;
    if (changeValue.includes('-')) {
        changeValue = changeValue.replace('-', '');
        negativeValue = true;
    }
    if (changeValue.toLowerCase() === 'activationcount') {
        changeValue = change.effect?.parent?.flags?.exaltedthird?.currentIterationsActive ?? 1;
    }
    if (actor.getRollData()[changeValue]?.value) {
        changeValue = actor.getRollData()[changeValue]?.value;
    }
    if (negativeValue) {
        changeValue *= -1;
    }
    return changeValue;
}
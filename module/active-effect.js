export default class ExaltedActiveEffect extends ActiveEffect {
    apply(actor, change) {
        if (change.value) {
            if (change.value.split(' ').length === 3) {
                var negativeValue = false;
                if (change.value.includes('-(')) {
                    change.value = change.value.replace(/(-\(|\))/g, '');
                    negativeValue = true;
                }
                var split = change.value.split(' ');
                var leftVar = formulaData(actor, change, split[0]);
                var operand = split[1];
                var rightVar = formulaData(actor, change, split[2]);
                switch (operand) {
                    case '+':
                        change.value = leftVar + rightVar;
                        break;
                    case '-':
                        change.value = Math.max(0, leftVar - rightVar);
                        break;
                    case '/>':
                        if (rightVar) {
                            change.value = Math.ceil(leftVar / rightVar);
                        }
                        break;
                    case '/<':
                        if (rightVar) {
                            change.value = Math.floor(leftVar / rightVar);
                        }
                        break;
                    case '*':
                        change.value = leftVar * rightVar;
                        break;
                    case '|':
                        change.value = Math.max(leftVar, rightVar);
                        break;
                    case 'cap':
                        change.value = Math.min(leftVar, rightVar);
                        break;
                }
                if (negativeValue) {
                    change.value *= -1;
                }
            }
            else {
                change.value = formulaData(actor, change, change.value);
            }
        }
        return super.apply(actor, change);
    }
}

function formulaData(actor, change, changeValue) {
    if (parseInt(changeValue)) {
        return parseInt(changeValue);
    }
    var negativeValue = false;
    if (changeValue.includes('-')) {
        changeValue = changeValue.replace('-', '');
        negativeValue = true;
    }
    if(changeValue.toLowerCase() === 'activationcount') {
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
import { getNumberFormula } from "./utils/utils.js";

export default class ExaltedActiveEffect extends ActiveEffect {
    apply(actor, change) {
        if (change.value) {
            change.value = getNumberFormula(change.value, actor, change);
        }
        return super.apply(actor, change);
    }
}
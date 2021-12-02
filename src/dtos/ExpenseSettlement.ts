import { ExpenseSettlementsQueryBodyStorage, ExpenseSettlementStorage } from "../types/expenseSettlement"
import validator from 'validator'
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import areAllPropsString from "../libs/areAllPropsString"

export default class ExpenseSettlement {
    expenseSettlement: ExpenseSettlementStorage

    constructor(expenseSettlement: ExpenseSettlementStorage) {
        this.expenseSettlement = expenseSettlement
    }

    isValid(): boolean {
        if (!areAllPropsString(this.expenseSettlement)) return false

        this.expenseSettlement = removeSpacesFromObjectValues(this.expenseSettlement)

        if (!validator.isUUID(this.expenseSettlement.id, 4)) return false
        //formattedIs field is assigned in insert statement
        if (!validator.matches(this.expenseSettlement.toll, /^\d{1,4}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.expenseSettlement.viatic, /^\d{1,4}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.expenseSettlement.load, /^\d{1,4}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.expenseSettlement.unload, /^\d{1,4}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.expenseSettlement.garage, /^\d{1,3}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.expenseSettlement.washed, /^\d{1,3}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.expenseSettlement.tire, /^\d{1,4}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.expenseSettlement.mobility, /^\d{1,3}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.expenseSettlement.other, /^\d{1,4}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.expenseSettlement.total, /^\d{1,4}(\.\d{1,2})?$/)) return false
        if (!validator.isDate(this.expenseSettlement.datePresentation)) return false
        if (!validator.matches(this.expenseSettlement.deposits, /^\d{1,4}(\.\d{1,2})?$/)) return false
        if (!validator.isBoolean(this.expenseSettlement.favorsTheCompany)) return false
        if (!validator.matches(this.expenseSettlement.residue, /^-?\d{1,4}(\.\d{1,2})?$/)) return false
        if (!validator.isBoolean(this.expenseSettlement.cancelled)) return false

        //nulls
        if (!validator.isLength(this.expenseSettlement.otherDetail || 'foo', { min: 3, max: 1000 })) return false
        if (!validator.isLength(this.expenseSettlement.observation || 'foo', { min: 3, max: 1000 })) return false

        return true
    }

    prepareForInsertOrUpdateStatement(): ExpenseSettlementStorage {
        //from '' to null
        this.expenseSettlement.otherDetail = this.expenseSettlement.otherDetail || null
        this.expenseSettlement.observation = this.expenseSettlement.observation || null
        return this.expenseSettlement
    }
}

export class ExpenseSettlementsQueryBody {
    queryBody: ExpenseSettlementsQueryBodyStorage

    constructor(queryBody: ExpenseSettlementsQueryBodyStorage) {
        this.queryBody = removeSpacesFromObjectValues(queryBody)
    }

    areQueryFieldsValid(): boolean {
        if (!validator.isDate(this.queryBody.dateStart)) return false
        if (!validator.isDate(this.queryBody.dateEnd)) return false
        if (!validator.isBoolean(this.queryBody.liquidated)) return false
        return true
    }

    isMaximumDateRangeOneYear(): boolean {
        const dateStartMls = Date.parse(this.queryBody.dateStart)
        const dateEndMls = Date.parse(this.queryBody.dateEnd)
        const oneDayInMileseconds = 86400000

        const dif = (dateEndMls - dateStartMls) / (oneDayInMileseconds * 366)
        if (dif <= 1) {
            return true
        } else {
            return false
        }
    }
}
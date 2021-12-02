import SaleSettlementStorage, { SaleSettlementsQueryBodyStorage } from "../types/saleSettlements"
import validator from 'validator'
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import areAllPropsString from "../libs/areAllPropsString"

export default class SaleSettlement {
    saleSettlement: SaleSettlementStorage
    constructor(saleSettlement: SaleSettlementStorage) {
        this.saleSettlement = saleSettlement
    }

    isValid(): boolean {
        if (!areAllPropsString(this.saleSettlement)) return false
        this.saleSettlement = removeSpacesFromObjectValues(this.saleSettlement)

        if (!validator.isUUID(this.saleSettlement.id || '', 4)) return false
        if (!validator.isUUID(this.saleSettlement.clientId || '', 4)) return false
        if (!validator.isDate(this.saleSettlement.date || '')) return false
        if (!validator.matches(this.saleSettlement.valueWithoutIgv, /^\d{1,6}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.saleSettlement.valueIgv, /^\d{1,6}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.saleSettlement.valueWithIgv, /^\d{1,6}(\.\d{1,2})?$/)) return false

        //null
        if (!validator.isLength(this.saleSettlement.observation || 'FOO', { min: 3, max: 100 })) return false
        if (!validator.isDate(this.saleSettlement.invoiceDate || '2020-01-01')) return false
        if (!validator.matches(this.saleSettlement.invoiceNumber || 'F001-4', /^[fF0-9]{1}\d{3}-\d{1,8}$/)) return false

        return true
    }

    isDateValid(): boolean {
        if (typeof this.saleSettlement.invoiceNumber !== 'string') return false
        return validator.isDate(this.saleSettlement.date || '')
    }

    isInvoiceNumberValid(): boolean {
        if (typeof this.saleSettlement.invoiceNumber !== 'string') return false
        return validator.matches(this.saleSettlement.invoiceNumber || 'F001-4', /^[fF0-9]{1}\d{3}-\d{1,8}$/)
    }

    isInvoiceDateValid(): boolean {
        if (typeof this.saleSettlement.invoiceDate !== 'string') return false
        return validator.isDate(this.saleSettlement.invoiceDate || '2020-01-01')
    }

    isObservationValid(): boolean {
        if (typeof this.saleSettlement.observation !== 'string') return false
        return validator.isLength(this.saleSettlement.observation || 'FOO', { min: 3, max: 100 })
    }

    prepareForInsertOrUpdateStatement(): SaleSettlementStorage {
        //from '' to null
        this.saleSettlement.invoiceDate = this.saleSettlement.invoiceDate || null
        this.saleSettlement.invoiceNumber = this.saleSettlement.invoiceNumber || null
        this.saleSettlement.observation = this.saleSettlement.observation.trim() || null
        return this.saleSettlement
    }
}

export class SaleSettlementsQueryBody {
    queryBody: SaleSettlementsQueryBodyStorage

    constructor(queryBody: SaleSettlementsQueryBodyStorage) {
        this.queryBody = removeSpacesFromObjectValues(queryBody)
    }

    isValid(): boolean {
        if (!validator.isDate(this.queryBody.dateStart || '')) return false
        if (!validator.isDate(this.queryBody.dateEnd || '')) return false
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
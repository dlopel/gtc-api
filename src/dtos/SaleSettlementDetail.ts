import validator from "validator"
import areAllPropsString from "../libs/areAllPropsString"
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import SaleSettlementDetailStorage from "../types/saleSettlementDetail"

export default class SaleSettlementDetail {
    saleSettlementDetail: SaleSettlementDetailStorage
    constructor(saleSettlementDetail: SaleSettlementDetailStorage) {
        this.saleSettlementDetail = saleSettlementDetail
    }

    isValid(): boolean {
        if (!areAllPropsString(this.saleSettlementDetail)) return false
        this.saleSettlementDetail = removeSpacesFromObjectValues(this.saleSettlementDetail)

        if (!validator.isUUID(this.saleSettlementDetail.id || '', 4)) return false
        if (!validator.isUUID(this.saleSettlementDetail.freightId || '', 4)) return false
        if (!validator.matches(this.saleSettlementDetail.valueWithoutIgv, /^\d{1,5}(\.\d{1,2})?$/)) return false

        //null
        if (!validator.matches(this.saleSettlementDetail.valueAdditionalWithoutIgv || '100', /^\d{1,5}(\.\d{1,2})?$/)) return false
        if (!validator.isLength(this.saleSettlementDetail.valueAdditionalDetail || 'FOO', { min: 3, max: 100 })) return false
        if (!validator.isLength(this.saleSettlementDetail.observation || 'FOO', { min: 3, max: 100 })) return false

        return true
    }

    prepareForInsertOrUpdateStatement(): SaleSettlementDetailStorage {
        //from '' to null
        this.saleSettlementDetail.observation = this.saleSettlementDetail.observation.trim() || null
        this.saleSettlementDetail.valueAdditionalWithoutIgv = this.saleSettlementDetail.valueAdditionalWithoutIgv.trim() || '0'
        this.saleSettlementDetail.valueAdditionalDetail = this.saleSettlementDetail.valueAdditionalDetail.trim() || null
        return this.saleSettlementDetail
    }
}

export class SaleSettlementDetailList {
    list: SaleSettlementDetail[]

    constructor(list: SaleSettlementDetailStorage[]) {
        if (Array.isArray(list)) {
            this.list = list.map(saleSettlementDetail => (
                new SaleSettlementDetail(saleSettlementDetail)
            ))
        } else {
            this.list = []
        }
    }

    isValid(): boolean {
        if (this.list.length < 1) return false

        for (let i = 0; i < this.list.length; i++) {
            if (!this.list[i].isValid()) return false
        }

        return true
    }

    setSaleSettlementIDToObjects(id: string) {
        this.list.forEach((item, idx) => {
            this.list[idx].saleSettlementDetail.saleSettlementId = id
        })
    }

    prepareForInsertOrUpdateStatement(): SaleSettlementDetailStorage[] {
        const list: SaleSettlementDetailStorage[] = this.list.map(saleSettlementDetail => (
            saleSettlementDetail.prepareForInsertOrUpdateStatement()
        ))
        return list
    }
}


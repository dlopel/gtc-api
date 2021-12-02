import { ProductTransportedStorage } from "../types/productTransported"
import validator from 'validator'
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import areAllPropsString from "../libs/areAllPropsString"

export default class ProductTransported {
    productTransported: ProductTransportedStorage
    constructor(productTransported: ProductTransportedStorage) {
        this.productTransported = productTransported
    }

    isValid(): boolean {
        if (!areAllPropsString(this.productTransported)) return false

        this.productTransported = removeSpacesFromObjectValues(this.productTransported)

        if (!validator.isUUID(this.productTransported.id || '', 4)) return false
        if (!validator.isUUID(this.productTransported.productId || '', 4)) return false
        if (!validator.isUUID(this.productTransported.freightId || '', 4)) return false
        if (!validator.isInt(this.productTransported.quantity || '', { gt: 0 })) return false
        if (!validator.matches(this.productTransported.sku || '', /^[a-zA-Z0-9- ]{3,40}$/)) return false

        //null
        if (!validator.isLength(this.productTransported.observation || 'FOO', { min: 3, max: 100 })) return false
        return true
    }

    prepareForInsertOrUpdateStatement(): ProductTransportedStorage {
        //from '' to null
        this.productTransported.observation = this.productTransported.observation || null
        return this.productTransported
    }
}
import { CompressedProductsQueryBodyStorage, ProductStogare } from "../types/product"
import validator from 'validator'
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import areAllPropsString from "../libs/areAllPropsString"

export default class Product {
    product: ProductStogare
    constructor(product: ProductStogare) {
        this.product = product
    }

    isValid(): boolean {
        if (!areAllPropsString(this.product)) return false
        this.product = removeSpacesFromObjectValues(this.product)

        if (!validator.isUUID(this.product.id || '', 4)) return false
        if (!validator.matches(this.product.name || '', /^[a-zA-Z0-9 ]{3,100}$/)) return false
        if (!validator.isUUID(this.product.clientId || '', 4)) return false

        //null
        if (!validator.isLength(this.product.observation || 'FOO', { min: 3, max: 100 })) return false

        return true
    }

    prepareForInsertOrUpdateStatement(): ProductStogare {
        //from '' to null
        this.product.observation = this.product.observation || null
        return this.product
    }
}

export class CompressedProductsQueryBody {
    queryBody: CompressedProductsQueryBodyStorage

    constructor(queryBody: CompressedProductsQueryBodyStorage) {
        this.queryBody = removeSpacesFromObjectValues(queryBody)
    }

    /**Para filtrar por lo menos un campo tiene que estar validado correctamente*/
    areQueryFieldsValid(): boolean {
        let isThereAtLeastOneApprovedProp = false

        if (this.queryBody.name)
            if (validator.matches(this.queryBody.name, /^[a-zA-Z0-9 ]{3,100}$/)) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.clientId)
            if (validator.isUUID(this.queryBody.clientId, '4')) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (!validator.isInt(this.queryBody.page as string, { allow_leading_zeroes: false, gt: 0 }))
            return false

        return isThereAtLeastOneApprovedProp
    }

    prepareForGet(): CompressedProductsQueryBodyStorage {
        this.queryBody.name = `%${this.queryBody.name.toUpperCase()}%`
        this.queryBody.clientId = `%${this.queryBody.clientId.toUpperCase()}%`
        this.queryBody.page = parseInt(this.queryBody.page as string)
        return this.queryBody
    }
}
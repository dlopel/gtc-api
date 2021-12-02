import validator from "validator"
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import { CompressedRoutesQueryBodyStorage } from "../types/route"

export class CompressedRoutesQueryBody {
    queryBody: CompressedRoutesQueryBodyStorage
    constructor(queryBody: CompressedRoutesQueryBodyStorage) {
        this.queryBody = removeSpacesFromObjectValues(queryBody)
    }

    /**Para filtrar por lo menos un campo tiene que estar validado correctamente*/
    areQueryFieldsValid(): boolean {
        let isThereAtLeastOneApprovedProp = false
        if (this.queryBody.name)
            if (validator.matches(this.queryBody.name, /^[a-zA-Z -]{3,100}$/)) {
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

    prepareForGet(): CompressedRoutesQueryBodyStorage {
        this.queryBody.name = `%${this.queryBody.name.toUpperCase()}%`
        this.queryBody.clientId = `%${this.queryBody.clientId.toUpperCase()}%`
        this.queryBody.page = parseInt(this.queryBody.page as string)
        return this.queryBody
    }
}
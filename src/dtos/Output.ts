import { OutputStorage, OutputsQueryBodyStorage } from "../types/output"
import validator from 'validator'
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import areAllPropsString from "../libs/areAllPropsString"

export default class Output {
    output: OutputStorage
    constructor(output: OutputStorage) {
        this.output = output
    }

    isValid(): boolean {
        if (!areAllPropsString(this.output)) return false
        this.output = removeSpacesFromObjectValues(this.output)

        if (!validator.isUUID(this.output.id || '', 4)) return false
        if (!validator.isUUID(this.output.bankId || '', 4)) return false
        if (!validator.isUUID(this.output.outputTypeId || '', 4)) return false
        if (!validator.isDate(this.output.date || '')) return false
        if (!validator.matches(this.output.value, /^\d{1,5}(\.\d{1,2})?$/)) return false

        //null
        if (!validator.isUUID(this.output.freightId || 'cf6bab5c-518a-4862-8939-4293a074daba', 4)) return false
        if (!validator.matches(this.output.operation || '123', /^[0-9]{3,25}$/)) return false
        if (!validator.isLength(this.output.observation || 'FOO', { min: 3, max: 100 })) return false
        if (!validator.isUUID(this.output.userId || 'b99f749c-edbf-4e2a-837a-d33a96f8c180', 4)) return false
        return true
    }

    prepareForInsertOrUpdateStatement(): OutputStorage {
        //from '' to null
        this.output.freightId = this.output.freightId || null
        this.output.observation = this.output.observation || null
        this.output.userId = this.output.userId || null
        this.output.operation = this.output.operation || null
        return this.output
    }

    static areFreightIdListValid(
        freightIdList: string[]
    ): boolean {
        if (Array.isArray(freightIdList)) {
            for (const id of freightIdList) {
                if (!validator.isUUID(id, 4)) return false
            }
            return true
        } else {
            return false
        }
    }
}

export class OutputsQueryBody {
    queryBody: OutputsQueryBodyStorage

    constructor(queryBody: OutputsQueryBodyStorage) {
        this.queryBody = removeSpacesFromObjectValues(queryBody)
    }

    isValid(): boolean {
        if (!validator.isUUID(this.queryBody.bankId || '', 4)) return false
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
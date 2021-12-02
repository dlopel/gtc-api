import validator from "validator"
import areAllPropsString from "../libs/areAllPropsString"
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import SctrStorage from "../types/sctr"

class Sctr {
    sctr: SctrStorage
    constructor(sctr: SctrStorage) {
        this.sctr = sctr
    }

    isValid(): boolean {
        if (!areAllPropsString(this.sctr)) return false
        this.sctr = removeSpacesFromObjectValues(this.sctr)

        if (!validator.isUUID(this.sctr.id || '', 4)) return false
        if (!validator.isAlphanumeric(this.sctr.pensionNumber || '', 'en-US', { ignore: '-' })) return false
        if (!validator.isLength(this.sctr.pensionNumber || '', { min: 3, max: 15 })) return false
        if (!validator.isAlphanumeric(this.sctr.healthNumber || '', 'en-US', { ignore: '-' })) return false
        if (!validator.isLength(this.sctr.healthNumber || '', { min: 3, max: 15 })) return false
        if (!validator.isDate(this.sctr.dateStart || '')) return false
        if (!validator.isDate(this.sctr.dateEnd || '')) return false
        if (!validator.matches(this.sctr.insuranceCompany || '', /^[a-zA-Z ]{3,100}$/)) return false

        //if it is null, OK (optional fields)
        if (!validator.isLength(this.sctr.observation || 'FOO', { min: 3, max: 1000 })) return false

        return true
    }

    prepareForInsertStatement(): SctrStorage {
        this.sctr.observation = this.sctr.observation || null
        return this.sctr
    }

    static isObservationAndIdFieldValid(observation: string, id: string): boolean {
        if (typeof observation !== 'string' && typeof id !== 'string') return false
        if (!validator.isUUID(id.trim() || '', 4)) return false
        if (!validator.isLength(observation.trim() || 'FOO', { min: 3, max: 1000 })) return false

        return true
    }
}

export default Sctr
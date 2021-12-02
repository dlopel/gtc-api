import validator from "validator"
import areAllPropsString from "../libs/areAllPropsString"
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import PolicyStorage from "../types/policy"

class Policy {
    policy: PolicyStorage
    constructor(policy: PolicyStorage) {
        this.policy = policy
    }

    isValid(): boolean {
        if (!areAllPropsString(this.policy)) return false
        this.policy = removeSpacesFromObjectValues(this.policy)

        if (!validator.isUUID(this.policy.id || '', 4)) return false
        if (!validator.isAlphanumeric(this.policy.endorsement || '', 'en-US', { ignore: '-' })) return false
        if (!validator.isLength(this.policy.endorsement || '', { min: 3, max: 15 })) return false
        if (!validator.isDate(this.policy.dateStart || '')) return false
        if (!validator.isDate(this.policy.dateEnd || '')) return false
        if (!validator.matches(this.policy.insuranceCarrier || '', /^[a-zA-Z ]{3,50}$/)) return false
        if (!validator.matches(this.policy.insuranceCompany || '', /^[a-zA-Z ]{3,50}$/)) return false
        if (!validator.matches(this.policy.netPremium, /^\d{1,7}(\.\d{1,2})?$/)) return false
        if (!validator.matches(this.policy.telephone || '', /^\d{2}-\d{3}-\d{4}$/)) return false

        //if it is null, OK (optional fields)
        if (!validator.isLength(this.policy.observation || 'FOO', { min: 3, max: 1000 })) return false

        return true
    }

    prepareForInsertStatement(): PolicyStorage {
        this.policy.observation = this.policy.observation || null
        return this.policy	
    }

    static isObservationAndIdFieldValid(observation: string, id: string): boolean {
        if (typeof observation !== 'string' && typeof id !== 'string') return false
        if (!validator.isUUID(id.trim() || '', 4)) return false
        if (!validator.isLength(observation.trim() || 'FOO', { min: 3, max: 1000 })) return false

        return true
    }
}

export default Policy
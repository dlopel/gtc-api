import validator from 'validator'
import transformToCleanString from '../libs/transformToCleanString'

class Transport {
    id: string
    ruc: string
    name: string
    address: string
    telephone: string
    observation: string | null
    constructor(
        id: string,
        ruc: string,
        name: string,
        address: string,
        telephone: string,
        observation: string | null
    ) {
        this.id = transformToCleanString(id)
        this.ruc = transformToCleanString(ruc)
        this.name = transformToCleanString(name)
        this.address = transformToCleanString(address)
        this.telephone = transformToCleanString(telephone)
        this.observation = observation == null ? observation : transformToCleanString(observation)
    }

    isValid(): boolean {

        if (!validator.isUUID(this.id, 4)) return false
        if (!validator.isInt(this.ruc, { allow_leading_zeroes: false, gt: 0 })) return false
        if (!validator.isLength(this.ruc, { min: 11, max: 11 })) return false
        if (!validator.isLength(this.name, { min: 3, max: 50 })) return false
        if (!validator.isAlphanumeric(this.name, 'en-US', { ignore: '\s' })) return false
        if (!validator.isLength(this.address, { min: 3, max: 100 })) return false
        if (!validator.matches(this.telephone, /^(\d{2}-)?\d{3}-\d{4}$/)) return false
        
        if (!validator.isLength(this.observation || 'FOO', { min: 3, max: 1000 })) return false

        return true
    }

    static isIdValid(id: string): boolean {
        return validator.isUUID(transformToCleanString(id), 4)
    }

    static isNameValid(name: string): boolean {
        name = transformToCleanString(name)
        if (!validator.isLength(name, { min: 3, max: 50 })) return false
        if (!validator.isAlphanumeric(name, 'en-US', { ignore: '\s' })) return false
        return true
    }
}

export default Transport
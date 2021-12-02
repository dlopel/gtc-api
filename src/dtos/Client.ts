import validator from 'validator'
import areAllPropsString from '../libs/areAllPropsString'
import removeSpacesFromObjectValues from '../libs/removeSpacesFromObjectValues'
import ClientStorage from '../types/client'

class Client {
    client: ClientStorage
    constructor(client: ClientStorage) {
        this.client = client
    }

    isValid(): boolean {
        if (!areAllPropsString(this.client)) return false
        this.client = removeSpacesFromObjectValues(this.client)

        if (!validator.isUUID(this.client.id || '', 4)) return false
        if (!validator.isInt(this.client.ruc || '', { allow_leading_zeroes: false, gt: 0 })) return false
        if (!validator.isLength(this.client.ruc || '', { min: 11, max: 11 })) return false
        if (!validator.isLength(this.client.name || '', { min: 3, max: 50 })) return false
        if (!validator.isAlphanumeric(this.client.name || '', 'en-US', { ignore: '\s' })) return false
        if (!validator.isLength(this.client.address || '', { min: 3, max: 100 })) return false

        //null fields
        if (!validator.isLength(this.client.observation || 'FOO', { min: 3, max: 1000 })) return false

        return true
    }
}

export default Client
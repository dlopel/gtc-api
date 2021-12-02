import { BankStorage } from "../types/bank"
import validator from 'validator'
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import areAllPropsString from "../libs/areAllPropsString"

export default class Bank {
    bank: BankStorage
    constructor(bank: BankStorage) {
        this.bank = bank
    }

    isValid(): boolean {
        if (!areAllPropsString(this.bank)) return false
        this.bank = removeSpacesFromObjectValues(this.bank)

        if (!validator.isUUID(this.bank.id || '', 4)) return false
        if (!validator.matches(this.bank.name || '', /^[a-zA-Z ]{3,25}$/)) return false

        //null
        if (!validator.isLength(this.bank.observation || 'FOO', { min: 3, max: 100 })) return false

        return true
    }

    prepareForInsertOrUpdateStatement(): BankStorage {
        //from '' to null
        this.bank.observation = this.bank.observation || null
        return this.bank
    }
}
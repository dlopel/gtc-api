import { OutputTypeStorage } from "../types/outputType"
import validator from 'validator'
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import areAllPropsString from "../libs/areAllPropsString"

export default class OutputType {
    outputType: OutputTypeStorage
    constructor(outputType: OutputTypeStorage) {
        this.outputType = outputType
    }

    isValid(): boolean {
        if (!areAllPropsString(this.outputType)) return false
        this.outputType = removeSpacesFromObjectValues(this.outputType)

        if (!validator.isUUID(this.outputType.id || '', 4)) return false
        if (!validator.matches(this.outputType.name || '', /^[a-zA-Z ]{3,25}$/)) return false
    
        return true
    }
}
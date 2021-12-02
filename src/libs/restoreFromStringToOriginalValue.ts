import validator from "validator"

export const restoreFromStringToOriginalValue = (
    value: string): number | null | undefined | boolean | string => {
    let parsedValue: any = null
    if (validator.trim(value).toLowerCase() == 'null') {
        parsedValue = null
    } else if (validator.trim(value).toLowerCase() == 'undefined') {
        parsedValue = undefined
    } else if (value === 'true' || value === 'false') {
        parsedValue = validator.toBoolean(value)
    } else {
        parsedValue = value
    }
    return parsedValue
}
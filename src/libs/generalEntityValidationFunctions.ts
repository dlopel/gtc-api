import validator from "validator"

export const isIdValid = (id: string): boolean => {
    return validator.isUUID(id || '', 4)
}

export const isRucValid = (ruc: string): boolean => {
    if (!validator.isInt(ruc || '', { allow_leading_zeroes: false, gt: 0 })) return false
    if (!validator.isLength(ruc || '', { min: 11, max: 11 })) return false
    return true
}
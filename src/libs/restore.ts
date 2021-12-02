export const restoreNullOrUndefinedValue = (value: string): any | null | undefined => {
    if (value == 'null') {
        return null
    }
    if (value == 'undefined') {
        return undefined
    }
    return value
}
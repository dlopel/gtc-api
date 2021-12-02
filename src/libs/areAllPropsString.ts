const areAllPropsString = (obj: object): boolean => {
    for (const prop in obj) {
        if (typeof obj[prop] !== 'string') return false
    }
    return true
}

export default areAllPropsString
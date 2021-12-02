function removeSpacesFromObjectValues<T>(obj: object): T {
    for (const key in obj) {
        obj[key] = obj[key].trim()
    }
    return (obj as unknown as T)
}

export default removeSpacesFromObjectValues
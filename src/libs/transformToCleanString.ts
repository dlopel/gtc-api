const transformToCleanString = (name: string) => {
    if (name) {
        return name.toString().trim()
    } else {
        return ''
    }
}

export default transformToCleanString
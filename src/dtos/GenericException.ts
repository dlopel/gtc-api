class GenericException {
    title: string
    processedData: any
    stack: string
    message?: string
    constructor(title: string, processedData: any, stack: string, message?: string) {
        this.title = title
        this.processedData = processedData
        this.stack = stack
        this.message = message
    }
}

export { GenericException }
class ResponseHTTPHelper {
    status: number
    error: string
    path: string
    message: string
    timestamp: string

    constructor(
        status: number,
        error: string,
        path: string,
        message: string
    ) {
        this.status = status
        this.error = error
        this.path = path
        this.message = message
        this.timestamp = new Date().toLocaleString()
    }
}

export default ResponseHTTPHelper
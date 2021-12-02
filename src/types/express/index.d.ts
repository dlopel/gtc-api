// import { IncomingHttpHeaders } from 'http'

declare module 'http' {
    interface IncomingHttpHeaders {
        decodedUserId: string
    }
}
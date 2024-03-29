import { Readable } from 'stream'

interface IMulterFile {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    stream: Readable
    destination: string
    filename: string
    path: string
    buffer: Buffer
}

export { IMulterFile }
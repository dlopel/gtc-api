import { GenericException } from '../../dtos/GenericException'

export class LoggerMessage extends GenericException {
    date: string
    constructor(title: string, processedData: any, stack: string, message: string) {
        super(title, processedData, stack, message)
        this.date = new Date().toLocaleString()
    }
}
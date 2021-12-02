import winston from 'winston'

export { LoggerMessage } from './LoggerMessage'

export const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.File(
            {
                filename: 'error.log',
                level: 'error',
                format: winston.format.json()
            }),
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
})

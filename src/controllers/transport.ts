import * as transportService from '../services/transport'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import Transport from '../dtos/Transport'
import { ITransport } from '../types/ITransport'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'

export const createTransport = async (req: Request, res: Response, next: NextFunction) => {

    const transport: ITransport = req.body
    const newTransport = new Transport(
        transport.id,
        transport.ruc,
        transport.name,
        transport.address,
        transport.telephone,
        transport.observation
    )

    try {
        if (newTransport.isValid()) {
            const isUnique = await transportService.isRucUnique(newTransport.ruc)
            if (isUnique) {
                await transportService.createTransport(newTransport)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restricciones en campos unicos',
                    req.originalUrl,
                    'El campo ruc es unico. El dato enviado ya esta en uso.'
                ))
            }
        } else {
            res.status(400).json(new ResponseHTTPHelper(
                400,
                'Datos invalidos',
                req.originalUrl,
                'Los datos enviados tienen un formato invalido'
            ))
        }
    } catch (error) {
        next(new GenericException(
            'Error al crear transportista',
            newTransport,
            error.stack
        ))
    }
}

export const getCompressedTransports = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {
        const transports = await transportService.getCompressedTransports()
        res.status(200).json(transports)
    } catch (error) {
        next(new GenericException(
            'Error al obtener transportistas comprimidos',
            null,
            error.stack
        ))
    }
}

export const getTransportById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const transport = await transportService.getTransportById(id)
            res.status(200).json(transport)
        } catch (error) {
            next(new GenericException(
                'Error al obtener transportista por id',
                id,
                error.stack
            ))
        }
    } else {
        res.status(400).json(new ResponseHTTPHelper(
            400,
            'Dato invalido',
            req.originalUrl,
            'El dato enviado tiene un formato invalido'
        ))
    }
}

export const getDataForDropDownList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await transportService.getDataForDropDownList()
        res.status(200).json(data)
    } catch (error) {
        next(new GenericException(
            'Error getting data for dropdownlist',
            null,
            error.stack
        ))
    }
}

export const updateTransportById = async (
    req: Request<any, unknown, ITransport>,
    res: Response,
    next: NextFunction) => {

    const newTransport = new Transport(
        req.body.id,
        req.body.ruc,
        req.body.name,
        req.body.address,
        req.body.telephone,
        req.body.observation
    )

    try {
        if (newTransport.isValid()) {
            const isUnique = await transportService.isRucUniqueExceptCurrentId(newTransport.ruc, newTransport.id)
            if (isUnique) {
                await transportService.updateTransportById(newTransport, newTransport.id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restricciones en campos unicos',
                    req.originalUrl,
                    'El campo ruc es unico. El dato enviado ya esta en uso'
                ))
            }
        } else {
            res.status(400).json(new ResponseHTTPHelper(
                400,
                'Dato invalido',
                req.originalUrl,
                'El dato enviado tiene un formato invalido'
            ))
        }
    } catch (error) {
        next(new GenericException(
            'Error al actualizar transportista',
            newTransport,
            error.stack
        ))
    }
}

export const deleteTransportById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await transportService.hasDependents(id)
            if (!hasDependents) {
                await transportService.deleteTransportById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Transportista en Uso',
                    req.originalUrl,
                    'El transportista a eliminar esta en uso en otras tablas.'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error al eliminar transportista por id',
                id,
                error.stack
            ))
        }
    } else {
        res.status(400).json(new ResponseHTTPHelper(
            400,
            'Dato invalido',
            req.originalUrl,
            'El dato enviado tiene un formato invalido'
        ))
    }
}
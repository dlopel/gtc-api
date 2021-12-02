import * as clientServices from '../services/client'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import ClientStorage from '../types/client'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import Client from '../dtos/Client'

export const createClient = async (
    req: Request<unknown, unknown, ClientStorage>,
    res: Response,
    next: NextFunction) => {

    const client = new Client(req.body)
    try {
        if (client.isValid()) {
            const areUnique = await clientServices.areUniqueConstraintsValid(
                client.client.id,
                client.client.ruc)
            if (areUnique) {
                await clientServices.createClient(client.client)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restrictions on unique fields',
                    req.originalUrl,
                    'The ruc field of id are unique. The data sent is already in use.'
                ))
            }
        } else {
            res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))
        }
    } catch (error) {
        next(new GenericException(
            'Error creating a client',
            req.body,
            error.stack
        ))
    }
}

export const getCompressedClients = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const clients = await clientServices.getCompressedClients()
        res.status(200).json(clients)
    } catch (error) {
        next(new GenericException(
            'Error getting clients',
            null,
            error.stack
        ))
    }
}

export const getClientById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const client = await clientServices.getClientById(id)
            res.status(200).json(client)

        } catch (error) {
            next(new GenericException(
                'Error getting client by id',
                id,
                error.stack
            ))
        }
    } else {
        res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data are invalid'
        ))
    }
}

export const getDataForDropDownList = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {
        const data = await clientServices.getDataForDropDownList()
        res.status(200).json(data)

    } catch (error) {
        next(new GenericException(
            'Error getting client data for drop down list',
            null,
            error.stack
        ))
    }
}

export const updateClientById = async (
    req: Request<any, unknown, ClientStorage>,
    res: Response,
    next: NextFunction) => {
    const client = new Client(req.body)
    try {
        if (client.isValid()) {
            const isUnique = await clientServices.isRucUniqueExceptCurrentClient(
                client.client.id,
                client.client.ruc)
            if (isUnique) {
                await clientServices.updateClientById(client.client)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restrictions on unique fields',
                    req.originalUrl,
                    'The ruc field already in use'
                ))
            }
        } else {
            res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))
        }
    } catch (error) {
        next(new GenericException(
            'Error updating client by id',
            req.body,
            error.stack
        ))
    }
}

export const deleteClientById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await clientServices.hasDependents(id)
            if (!hasDependents) {
                await clientServices.deleteClientById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Client in use',
                    req.originalUrl,
                    'The client is in use in other tables'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error when deleting client by id',
                id,
                error.stack
            ))
        }
    } else {
        res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data is invalid'
        ))
    }
}
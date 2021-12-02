import * as serviceServices from '../services/service'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { Service } from '../types/service'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'

export const createService = async (
    req: Request<unknown, unknown, Service>,
    res: Response,
    next: NextFunction) => {
    req.body = serviceServices.sanitizer(req.body)
    try {
        if (serviceServices.isValid(req.body)) {
            const areUnique = await serviceServices.areUniqueConstraintsValid(req.body.id, req.body.name)
            if (areUnique) {
                await serviceServices.createService(req.body)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restriction on unique field',
                    req.originalUrl,
                    'Id field is unique. The data sent is already in use.'
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
            'Error creating a service',
            req.body,
            error.stack
        ))
    }
}

export const getServices = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const services = await serviceServices.getServices()
        res.status(200).json(services)
    } catch (error) {
        next(new GenericException(
            'Error getting services',
            null,
            error.stack
        ))
    }
}

export const getServiceById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const service = await serviceServices.getServiceById(id)
            res.status(200).json(service)

        } catch (error) {
            next(new GenericException(
                'Error getting service by id',
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

export const getDataForDropDownList = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const data = await serviceServices.getDataForDropDownList()
        res.status(200).json(data)

    } catch (error) {
        next(new GenericException(
            'Error getting service data for drop down list',
            null,
            error.stack
        ))
    }
}

export const updateServiceById = async (
    req: Request<any, unknown, Service>,
    res: Response,
    next: NextFunction) => {
    req.body = serviceServices.sanitizer(req.body)
    try {
        if (serviceServices.isValid(req.body)) {
            const isUnique = await serviceServices.isNameUniqueExceptCurrentServiceId(req.body.id, req.body.name)
            if (isUnique) {
                await serviceServices.updateServiceById(req.body)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restriction on unique field',
                    req.originalUrl,
                    'Name field is unique. The data sent is already in use.'
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
            'Error updating service by id',
            req.body,
            error.stack
        ))
    }
}

export const deleteServiceById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await serviceServices.hasDependents(id)
            if (!hasDependents) {
                await serviceServices.deleteServiceById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Service in use',
                    req.originalUrl,
                    'The service is in use in other tables'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error when deleting service by id',
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
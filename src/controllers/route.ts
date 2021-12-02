import * as routeServices from '../services/routes'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { CompressedRoutesQueryBodyStorage, Route } from '../types/route'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import { CompressedRoutesQueryBody } from '../dtos/Route'

export const createRoute = async (
    req: Request<unknown, unknown, Route>,
    res: Response,
    next: NextFunction) => {
    req.body = routeServices.sanitizer(req.body)
    try {
        if (routeServices.isValid(req.body)) {
            const isUnique = await routeServices.isIdUnique(req.body.id)
            if (isUnique) {
                await routeServices.createRoute(req.body)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restrictions on unique fields',
                    req.originalUrl,
                    'The id field is unique. The data sent is already in use.'
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
    } catch (error) {
        next(new GenericException(
            'Error creating a route',
            req.body,
            error.stack
        ))
    }
}

export const getPaginationOfCompressedRoutesByQuery = async (
    req: Request<unknown, unknown, unknown, CompressedRoutesQueryBodyStorage>,
    res: Response,
    next: NextFunction) => {
    //convert to number

    try {

        const queryBody = new CompressedRoutesQueryBody(req.query)

        if (!queryBody.areQueryFieldsValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data is invalid'
            ))

        const paginatedResponse = await routeServices.getPaginationOfCompressedRoutes(
            queryBody.prepareForGet()
        )
        res.status(200).json(paginatedResponse)
    } catch (error) {
        next(new GenericException(
            'Error getting pagination of compressed routes by query',
            null,
            error.stack
        ))
    }
}

export const getRouteById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const route = await routeServices.getRouteById(id)
            res.status(200).json(route)

        } catch (error) {
            next(new GenericException(
                'Error getting route by id',
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

export const getDataForDropDownListByClient = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const clientId = req.query.clientId as unknown as string

    if (!isIdValid(clientId))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data is invalid'
        ))

    try {
        const data = await routeServices.getDataForDropDownListByClient(clientId)
        res.status(200).json(data)

    } catch (error) {
        next(new GenericException(
            'Error getting route data for drop down list',
            clientId,
            error.stack
        ))
    }
}

export const updateRouteById = async (
    req: Request<any, unknown, Route>,
    res: Response,
    next: NextFunction) => {
    req.body = routeServices.sanitizer(req.body)
    try {
        if (routeServices.isValid(req.body)) {

            await routeServices.updateRouteById(req.body)
            res.sendStatus(204)

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
            'Error updating route by id',
            req.body,
            error.stack
        ))
    }
}

export const deleteRouteById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await routeServices.hasDependents(id)
            if (!hasDependents) {
                await routeServices.deleteRouteById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Route in use',
                    req.originalUrl,
                    'The route is in use in other tables'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error when deleting route by id',
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
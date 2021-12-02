import * as freightServices from '../services/freight'
import * as outputServices from '../services/output'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import Freight, { ClientFreightsQueryBody, CompressedFreightsQueryBody, FreightsNotLiquidatedQueryBody } from '../dtos/Freight'
import { CompressedFreightsQueryBodyStorage, FreightStorage, FreightsNotLiquidatedQueryBodyStorage, ClientFreightsQueryBodyStorage } from '../types/freight'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'

export const createFreight = async (
    req: Request<unknown, unknown, FreightStorage>,
    res: Response,
    next: NextFunction) => {

    const freight = new Freight(req.body)
    try {

        if (!freight.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data is invalid'
            ))

        const areValid = await freightServices.areUniqueConstraintsValid(freight.freight.id)
        if (!areValid)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restrictions on unique fields',
                req.originalUrl,
                'The id field is unique. The data sent is already in use.'
            ))

        await freightServices.createFreight(freight.prepareForInsertOrUpdateStatement())
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error creating a freight',
            req.body,
            error.stack
        ))
    }
}

export const getFreightsNotLiquidatedByQuery = async (
    req: Request<unknown, unknown, unknown, FreightsNotLiquidatedQueryBodyStorage>,
    res: Response,
    next: NextFunction) => {
    try {

        const queryBody = new FreightsNotLiquidatedQueryBody(req.query)
        if (!queryBody.areQueryFieldsValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        if (!queryBody.isMaximumDateRangeOneYear())
            return res.status(422).json(new ResponseHTTPHelper(
                422,
                'Dates out of range',
                req.originalUrl,
                'Start date and end date must have a maximum range of one year'
            ))

        const freightsNotLiquidated = await freightServices.getFreightsNotLiquidatedByQuery(
            queryBody.queryBody
        )
        res.status(200).json(freightsNotLiquidated)
    } catch (error) {
        next(new GenericException(
            'Error getting freights not liquidated',
            req.query,
            error.stack
        ))
    }
}

export const getFreightsByClientId = async (
    req: Request<{ id: string }, unknown, unknown, ClientFreightsQueryBodyStorage>,
    res: Response,
    next: NextFunction
) => {
    try {
        const queryBody = new ClientFreightsQueryBody(req.query)
        queryBody.queryBody.clientId = req.params.id

        if (!queryBody.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        if (!queryBody.isMaximumDateRangeOneYear())
            return res.status(422).json(new ResponseHTTPHelper(
                422,
                'Dates out of range',
                req.originalUrl,
                'Start date and end date must have a maximum range of one year'
            ))

        queryBody.convertLiquitatedToBoolean()
        const freights = await freightServices.getClientFreightsByQuery(
            queryBody.queryBody
        )
        res.status(200).json(freights)
    } catch (error) {
        next(new GenericException(
            'Error getting freights by client id',
            { querystring: req.query, queryparam: req.params },
            error.stack
        ))
    }
}

export const getPaginationOfCompressedFreights = async (
    req: Request<unknown, unknown, unknown, CompressedFreightsQueryBodyStorage>,
    res: Response,
    next: NextFunction) => {
    try {
        const queryBody = new CompressedFreightsQueryBody(req.query)

        if (!queryBody.areQueryFieldsValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data is invalid'
            ))

        if (!queryBody.isMaximumDateRangeOneYear())
            return res.status(422).json(new ResponseHTTPHelper(
                422,
                'Dates out of range',
                req.originalUrl,
                'Start date and end date must have a maximum range of 1 year'
            ))

        const paginatedResponse = await freightServices.getPaginationOfCompressedFreights(
            queryBody.prepareForGet()
        )
        res.status(200).json(paginatedResponse)


    } catch (error) {
        next(new GenericException(
            'Error getting pagination of compressed freights',
            req.query,
            error.stack
        ))
    }
}

export const getFreightsByExpenseSettlement = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const expenseSettlementId = req.query.expenseSettlementId as unknown as string
    try {
        if (!isIdValid(expenseSettlementId))
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data is invalid'
            ))

        const freights = await freightServices.getFreightsByExpenseSettlement(
            expenseSettlementId
        )
        res.status(200).json(freights)
    } catch (error) {
        next(new GenericException(
            'Error getting freights by expense settlement',
            expenseSettlementId,
            error.stack
        ))
    }
}

export const getOutputsByFreight = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { freightId } = req.params
    if (!isIdValid(freightId))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data is invalid'
        ))

    try {
        const outputs = await outputServices.getOutputsByFreight(freightId)
        res.status(200).json(outputs)
    } catch (error) {
        next(new GenericException(
            'Error getting outputs by freight',
            freightId,
            error.stack
        ))
    }
}

export const getFreightById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params

    try {
        if (!isIdValid(id))
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data is invalid'
            ))

        const freight = await freightServices.getFreightById(id)
        res.status(200).json(freight)
    } catch (error) {
        next(new GenericException(
            'Error getting freight by id',
            id,
            error.stack
        ))
    }
}

export const getFreightByFormattedId = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { formattedId } = req.params
    try {
        if (!Freight.isFormattedIdValid(formattedId))
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data is invalid'
            ))

        const freight = await freightServices.getFreightByFormattedId(formattedId)
        res.status(200).json(freight)
    } catch (error) {
        next(new GenericException(
            'Error getting freight by formattedId',
            formattedId,
            error.stack
        ))
    }
}

export const updateFreightById = async (
    req: Request<any, unknown, FreightStorage>,
    res: Response,
    next: NextFunction) => {

    try {

        const freight = new Freight(req.body)

        if (!freight.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data is invalid'
            ))

        await freightServices.updateFreight(freight.prepareForInsertOrUpdateStatement())
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error updating freight',
            req.body,
            error.stack
        ))
    }
}

export const updateFreightsExpenseSettlement = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const freightIdList = req.query.freightId as string[]
    const expenseSettlementId = req.body.expenseSettlementId as string
    try {
        const areValid = Freight.validateFreightIdListAndExpenseSettlementId(
            expenseSettlementId,
            freightIdList
        )
        if (!areValid)
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        await freightServices.updateFreightsExpenseSettlement(
            freightIdList,
            expenseSettlementId
        )
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error updating freights expense settlement',
            { expenseSettlementId, freightIdList },
            error.stack
        ))
    }
}

export const deleteFreightById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params

    try {

        if (!isIdValid(id))
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data is invalid'
            ))

        const hasDependents = await freightServices.hasDependents(id)
        if (hasDependents) {
            res.status(409).json(new ResponseHTTPHelper(
                409,
                'Freight in use',
                req.originalUrl,
                'The freight is in use in other tables'
            ))
        } else {
            await freightServices.deleteFreightById(id)
            res.sendStatus(204)
        }
    } catch (error) {
        next(new GenericException(
            'Error when deleting freight by id',
            id,
            error.stack
        ))
    }
}
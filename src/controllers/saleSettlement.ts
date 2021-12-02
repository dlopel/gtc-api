import * as saleSettlementServices from '../services/saleSettlements'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import SaleSettlementStorage, { SaleSettlementsQueryBodyStorage } from '../types/saleSettlements'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import SaleSettlement, { SaleSettlementsQueryBody } from '../dtos/SaleSettlement'

export const createSaleSettlement = async (
    req: Request<unknown, unknown, SaleSettlementStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const saleSettlement = new SaleSettlement(req.body)

        if (!saleSettlement.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const isIdUnique = await saleSettlementServices.isIdUnique(
            saleSettlement.saleSettlement.id
        )
        if (!isIdUnique)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restriction on unique field',
                req.originalUrl,
                'Id field is unique. The data sent is already in use.'
            ))

        const response = await saleSettlementServices.createSaleSettlement(
            saleSettlement.prepareForInsertOrUpdateStatement()
        )
        res.status(201).json(response)

    } catch (error) {
        next(new GenericException(
            'Error creating a saleSettlement',
            req.body,
            error.stack
        ))
    }
}

export const getSaleSettlementsByQuery = async (
    req: Request<unknown, unknown, unknown, SaleSettlementsQueryBodyStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const queryBody = new SaleSettlementsQueryBody(req.query)
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
                'Start date and end date must have a maximum range of 1 year'
            ))

        const salesSettlements = await saleSettlementServices.getSaleSettlementsByQuery(
            queryBody.queryBody
        )
        res.status(200).json(salesSettlements)
    } catch (error) {
        next(new GenericException(
            'Error getting sale settlements',
            req.query,
            error.stack
        ))
    }
}

export const getSaleSettlementById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const saleSettlement = await saleSettlementServices.getSaleSettlementById(id)
            res.status(200).json(saleSettlement)
        } catch (error) {
            next(new GenericException(
                'Error getting sale settlement by id',
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

export const updateSaleSettlementById = async (
    req: Request<{ id: string }, unknown, SaleSettlementStorage>,
    res: Response,
    next: NextFunction
) => {

    try {
        const saleSettlement = new SaleSettlement(req.body)
        saleSettlement.saleSettlement.id = req.params.id

        const isIDOk = isIdValid(saleSettlement.saleSettlement.id)
        const isDateValid = saleSettlement.isDateValid()
        const isInvoiceDateValid = saleSettlement.isInvoiceDateValid()
        const isInvoiceNumberValid = saleSettlement.isInvoiceNumberValid()
        const isObservationValid = saleSettlement.isObservationValid()
        if (!isIDOk || !isDateValid || !isInvoiceDateValid || !isInvoiceNumberValid || !isObservationValid)
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        await saleSettlementServices.updateSaleSettlementById(
            saleSettlement.prepareForInsertOrUpdateStatement()
        )
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error updating sale settlement by id',
            req.body,
            error.stack
        ))
    }
}

export const deleteSaleSettlementById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await saleSettlementServices.hasDependents(id)
            if (!hasDependents) {
                await saleSettlementServices.deleteSaleSettlementById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Sale Settlement in use',
                    req.originalUrl,
                    'The sale settlement is in use in other tables'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error when deleting sale settlement by id',
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
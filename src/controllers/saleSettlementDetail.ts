import * as saleSettlementDetailtServices from '../services/saleSettlementsDetail'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import SaleSettlementDetailStorage from '../types/saleSettlementDetail'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import { SaleSettlementDetailList } from '../dtos/SaleSettlementDetail'
import { getSaleSettlementById } from '../services/saleSettlements'

export const createBatch = async (
    req: Request<{ id: string }, unknown, SaleSettlementDetailStorage[]>,
    res: Response,
    next: NextFunction
) => {

    try {
        const { id } = req.params
        if (!isIdValid(id))
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sale settlement id is invalid'
            ))

        const saleSettlement = await getSaleSettlementById(id)
        if (saleSettlement === null)
            return res.status(404).json(new ResponseHTTPHelper(
                404,
                'Not Found',
                req.originalUrl,
                'The sent id is not associated with any sale settlement'
            ))

        const saleSettlementDetailList = new SaleSettlementDetailList(req.body)
        if (!saleSettlementDetailList.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const IDs = saleSettlementDetailList.list.map(saleSettlementDetail => (
            saleSettlementDetail.saleSettlementDetail.id
        ))
        const arIDsUnique = await saleSettlementDetailtServices.areIDsUnique(IDs)
        if (!arIDsUnique)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restriction on unique field',
                req.originalUrl,
                'Id field is unique. The data sent is already in use.'
            ))

        saleSettlementDetailList.setSaleSettlementIDToObjects(id)

        await saleSettlementDetailtServices.createBatch(
            saleSettlementDetailList.prepareForInsertOrUpdateStatement()
        )
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error creating a sale settlement detail batch',
            req.body,
            error.stack
        ))
    }
}

export const getBatchBySaleSettlementId = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params
    if (!isIdValid(id))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data are invalid'
        ))

    try {
        const saleSettlementDetails = await saleSettlementDetailtServices.getBatchBySaleSettlement(id)
        res.status(200).json(saleSettlementDetails)
    } catch (error) {
        next(new GenericException(
            'Error getting sale settlement details by sale settlement id',
            req.params,
            error.stack
        ))
    }
}

export const deleteBatchBySaleSettlementId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //verificar si existe la liquidacion de venta
    const { id } = req.params
    if (!isIdValid(id))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data is invalid'
        ))

    try {
        await saleSettlementDetailtServices.deleteBatchBySaleSettlement(id)
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error when deleting sale settlement details by sale settlementid',
            id,
            error.stack
        ))
    }
}
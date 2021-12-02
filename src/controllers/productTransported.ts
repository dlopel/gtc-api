import * as productTransportedServices from '../services/productTransported'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { ProductTransportedStorage } from '../types/productTransported'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import ProductTransported from '../dtos/ProductTransported'

export const createProductTransported = async (
    req: Request<unknown, unknown, ProductTransportedStorage>,
    res: Response,
    next: NextFunction) => {

    try {

        const productTransported = new ProductTransported(req.body)

        if (!productTransported.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const isIdUnique = await productTransportedServices.isIdUnique(
            productTransported.productTransported.id
        )

        if (!isIdUnique)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restriction on unique field',
                req.originalUrl,
                'Id field is unique. The data sent is already in use.'
            ))

        await productTransportedServices.createProductTransported(
            productTransported.prepareForInsertOrUpdateStatement()
        )
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error creating a product transported',
            req.body,
            error.stack
        ))
    }
}

export const getTransportedProductsByFreight = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {

        const freightId = req.query.freightId as string

        if (!isIdValid(freightId))
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data is invalid'
            ))

        const transportedProducts = await productTransportedServices.getTransportedProductsByFreight(freightId)
        res.status(200).json(transportedProducts)
    } catch (error) {
        next(new GenericException(
            'Error getting transported products',
            req.query,
            error.stack
        ))
    }

}

export const getProductTransportedById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params

    if (!isIdValid(id))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data is invalid'
        ))

    try {
        const productTransported = await productTransportedServices.getProductTransportedById(id)
        res.status(200).json(productTransported)

    } catch (error) {
        next(new GenericException(
            'Error getting product transported by id',
            id,
            error.stack
        ))
    }
}

export const deleteProductTransportedById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params
    if (!isIdValid(id))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data is invalid'
        ))

    try {
        await productTransportedServices.deleteProductTransportedById(id)
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error when deleting product transported by id',
            id,
            error.stack
        ))
    }
}
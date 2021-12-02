import * as productServices from '../services/product'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { CompressedProductsQueryBodyStorage, ProductStogare } from '../types/product'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import Product, { CompressedProductsQueryBody } from '../dtos/Product'

export const createProduct = async (
    req: Request<unknown, unknown, ProductStogare>,
    res: Response,
    next: NextFunction) => {

    try {

        const product = new Product(req.body)

        if (!product.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const isIdUnique = await productServices.isIdUnique(
            product.product.id
        )
        if (!isIdUnique)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restriction on unique field',
                req.originalUrl,
                'Id field is unique. The data sent is already in use.'
            ))

        await productServices.createProduct(
            product.prepareForInsertOrUpdateStatement()
        )
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error creating a product',
            req.body,
            error.stack
        ))
    }
}

export const getPaginationOfCompressedProductsByQuery = async (
    req: Request<unknown, unknown, unknown, CompressedProductsQueryBodyStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const queryBody = new CompressedProductsQueryBody(req.query)

        if (!queryBody.areQueryFieldsValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const responsePaginated = await productServices.getPaginationOfCompressedProductsByQuery(
            queryBody.prepareForGet())

        res.status(200).json(responsePaginated)
    } catch (error) {
        next(new GenericException(
            'Error getting products',
            req.query,
            error.stack
        ))
    }

}

export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const product = await productServices.getProductById(id)
            res.status(200).json(product)

        } catch (error) {
            next(new GenericException(
                'Error getting product by id',
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
        const data = await productServices.getDataForDropDownListByClient(clientId)
        res.status(200).json(data)

    } catch (error) {
        next(new GenericException(
            'Error getting product data for drop down list',
            clientId,
            error.stack
        ))
    }
}

export const updateProductById = async (
    req: Request<any, unknown, ProductStogare>,
    res: Response,
    next: NextFunction) => {

    try {
        const product = new Product(req.body)
        if (!product.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        await productServices.updateProductById(
            product.prepareForInsertOrUpdateStatement()
        )
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error updating product by id',
            req.body,
            error.stack
        ))
    }
}

export const deleteProductById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await productServices.hasDependents(id)
            if (!hasDependents) {
                await productServices.deleteProductById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Product in use',
                    req.originalUrl,
                    'The client is in use in other tables'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error when deleting product by id',
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
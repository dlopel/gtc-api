import * as outputTypeServices from '../services/outputType'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { OutputTypeStorage } from '../types/outputType'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import OutputType from '../dtos/OutputType'

export const createOutputType = async (
    req: Request<unknown, unknown, OutputTypeStorage>,
    res: Response,
    next: NextFunction
) => {

    try {
        const outputType = new OutputType(req.body)
        if (!outputType.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const areUnique = await outputTypeServices.areUniqueConstraintsValid(
            outputType.outputType.id,
            outputType.outputType.name
        )
        if (!areUnique)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restriction on unique fields',
                req.originalUrl,
                'Id and Name fields are unique. The data sent are already in use.'
            ))

        await outputTypeServices.createOutputType(outputType.outputType)
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error creating a outputType',
            req.body,
            error.stack
        ))
    }
}

export const getDataForDropDownList = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const data = await outputTypeServices.getDataForDropDownList()
        res.status(200).json(data)
    } catch (error) {
        next(new GenericException(
            'Error getting output data for drop down list',
            null,
            error.stack
        ))
    }
}

export const getOutputTypes = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const outputTypes = await outputTypeServices.getOutputTypes()
        res.status(200).json(outputTypes)
    } catch (error) {
        next(new GenericException(
            'Error getting outputTypes',
            null,
            error.stack
        ))
    }
}

export const getOutputTypeById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const outputType = await outputTypeServices.getOutputTypeById(id)
            res.status(200).json(outputType)
        } catch (error) {
            next(new GenericException(
                'Error getting outputType by id',
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

export const updateOutputTypeById = async (
    req: Request<any, unknown, OutputTypeStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const outputType = new OutputType(req.body)
        if (!outputType.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const isUnique = outputTypeServices.isNameUnique(outputType.outputType.name)
        if (!isUnique)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restriction on unique field',
                req.originalUrl,
                'Name field is unique. The data sent is already in use.'
            ))

        await outputTypeServices.updateOutputTypeById(outputType.outputType)
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error updating outputType by id',
            req.body,
            error.stack
        ))
    }
}

export const deleteOutputTypeById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await outputTypeServices.hasDependents(id)
            if (!hasDependents) {
                await outputTypeServices.deleteOutputTypeById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'OutputType in use',
                    req.originalUrl,
                    'The outputType is in use in other tables'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error when deleting outputType by id',
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
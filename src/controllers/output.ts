import * as outputServices from '../services/output'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { OutputStorage, OutputsQueryBodyStorage } from '../types/output'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import Output, { OutputsQueryBody } from '../dtos/Output'

export const createOutput = async (
    req: Request<unknown, unknown, OutputStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const output = new Output(req.body)

        if (!output.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const isIdUnique = await outputServices.isIdUnique(output.output.id)

        if (!isIdUnique)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restriction on unique field',
                req.originalUrl,
                'Id field is unique. The data sent is already in use.'
            ))

        await outputServices.createOutput(output.prepareForInsertOrUpdateStatement())
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error creating a output',
            req.body,
            error.stack
        ))
    }
}

export const getOutputsByQuery = async (
    req: Request<unknown, unknown, unknown, OutputsQueryBodyStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const queryBody = new OutputsQueryBody(req.query)
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

        const outputs = await outputServices.getOutputsByQuery(
            queryBody.queryBody
        )
        res.status(200).json(outputs)
    } catch (error) {
        next(new GenericException(
            'Error getting outputs',
            req.query,
            error.stack
        ))
    }

}

export const getOutputById = async (
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
        const output = await outputServices.getOutputById(id)
        res.status(200).json(output)
    } catch (error) {
        next(new GenericException(
            'Error getting output by id',
            id,
            error.stack
        ))
    }
}

export const getDepositsByFreights = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const freightIdList = req.query.freightId as string[]
    try {
        const areValid = Output.areFreightIdListValid(freightIdList)
        if (!areValid)
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const outputs = await outputServices.getDepositsByFreights(freightIdList)
        res.status(200).json(outputs)
    } catch (error) {
        next(new GenericException(
            'Error when obtaining freight deposits',
            { freightIdList },
            error.stack
        ))
    }
}

export const updateOutputById = async (
    req: Request<any, unknown, OutputStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const output = new Output(req.body)
        if (!output.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        await outputServices.updateOutputById(output.prepareForInsertOrUpdateStatement())
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error updating output by id',
            req.body,
            error.stack
        ))
    }
}

export const deleteOutputById = async (
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
        await outputServices.deleteOutputById(id)
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error when deleting output by id',
            id,
            error.stack
        ))
    }
}
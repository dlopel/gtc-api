import * as expenseSettlementServices from '../services/expenseSettlement'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import ExpenseSettlement, { ExpenseSettlementsQueryBody } from '../dtos/expenseSettlement'
import { ExpenseSettlementsQueryBodyStorage, ExpenseSettlementStorage } from '../types/expenseSettlement'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'

export const createExpenseSettlement = async (
    req: Request<unknown, unknown, ExpenseSettlementStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const expenseSettlement = new ExpenseSettlement(req.body)
        if (!expenseSettlement.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const areValid = await expenseSettlementServices.areUniqueConstraintsValid(
            expenseSettlement.expenseSettlement.id
        )
        if (!areValid)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restrictions on unique fields',
                req.originalUrl,
                'The id field is unique. The data sent is already in use.'
            ))

        const response = await expenseSettlementServices.createExpenseSettlement(
            expenseSettlement.prepareForInsertOrUpdateStatement()
        )
        res.status(200).json(response)
    } catch (error) {
        next(new GenericException(
            'Error creating a expense settlements',
            req.body,
            error.stack
        ))
    }
}

export const getExpenseSettlementsByQuery = async (
    req: Request<unknown, unknown, unknown, ExpenseSettlementsQueryBodyStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const query = new ExpenseSettlementsQueryBody(req.query)
        if (!query.areQueryFieldsValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        if (!query.isMaximumDateRangeOneYear())
            return res.status(422).json(new ResponseHTTPHelper(
                422,
                'Dates out of range',
                req.originalUrl,
                'Start date and end date must have a maximum range of 1 year'
            ))

        const expenseSettlements = await expenseSettlementServices.getExpenseSettlementsByQuery(
            query.queryBody
        )
        res.status(200).json(expenseSettlements)
    } catch (error) {
        next(new GenericException(
            'Error getting expense settlements by query',
            req.query,
            error.stack
        ))
    }
}

export const getExpenseSettlementById = async (
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

        const expenseSettlement = await expenseSettlementServices.getExpenseSettlementById(id)
        res.status(200).json(expenseSettlement)
    } catch (error) {
        next(new GenericException(
            'Error getting expense settlement by id',
            id,
            error.stack
        ))
    }
}

export const updateExpenseSettlementById = async (
    req: Request<any, unknown, ExpenseSettlementStorage>,
    res: Response,
    next: NextFunction) => {

    const expenseSettlement = new ExpenseSettlement(req.body)
    try {
        if (!expenseSettlement.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        await expenseSettlementServices.updateExpenseSettlement(
            expenseSettlement.prepareForInsertOrUpdateStatement()
        )
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error updating expense settlement',
            req.body,
            error.stack
        ))
    }
}

export const deleteExpenseSettlementById = async (
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

        const hasDependents = await expenseSettlementServices.hasDependents(id)
        if (hasDependents) {
            res.status(409).json(new ResponseHTTPHelper(
                409,
                'Expense settlement in use',
                req.originalUrl,
                'The Expense settlement is in use in other tables'
            ))
        } else {
            await expenseSettlementServices.deleteExpenseSettlementById(id)
            res.sendStatus(204)
        }
    } catch (error) {
        next(new GenericException(
            'Error when deleting expense settlement by id',
            id,
            error.stack
        ))
    }
}
import * as bankServices from '../services/bank'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { BankStorage } from '../types/bank'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import Bank from '../dtos/Bank'

export const createBank = async (
    req: Request<unknown, unknown, BankStorage>,
    res: Response,
    next: NextFunction
) => {

    try {
        const bank = new Bank(req.body)
        if (!bank.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const areUnique = await bankServices.areUniqueConstraintsValid(
            bank.bank.id,
            bank.bank.name
        )
        if (!areUnique)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restriction on unique fields',
                req.originalUrl,
                'Id and Name fields are unique. The data sent are already in use.'
            ))

        await bankServices.createBank(bank.prepareForInsertOrUpdateStatement())
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error creating a bank',
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
        const data = await bankServices.getDataForDropDownList()
        res.status(200).json(data)

    } catch (error) {
        next(new GenericException(
            'Error getting bank data for drop down list',
            null,
            error.stack
        ))
    }
}

export const getBanks = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const banks = await bankServices.getBanks()
        res.status(200).json(banks)
    } catch (error) {
        next(new GenericException(
            'Error getting banks',
            null,
            error.stack
        ))
    }
}

export const getBankById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const bank = await bankServices.getBankById(id)
            res.status(200).json(bank)
        } catch (error) {
            next(new GenericException(
                'Error getting bank by id',
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

export const updateBankById = async (
    req: Request<any, unknown, BankStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const bank = new Bank(req.body)
        if (!bank.isValid())
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Invalid Data',
                req.originalUrl,
                'The sent data are invalid'
            ))

        const isUnique = bankServices.isNameUnique(bank.bank.name)
        if (!isUnique)
            return res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restriction on unique field',
                req.originalUrl,
                'Name field is unique. The data sent is already in use.'
            ))

        await bankServices.updateBankById(bank.prepareForInsertOrUpdateStatement())
        res.sendStatus(204)

    } catch (error) {
        next(new GenericException(
            'Error updating bank by id',
            req.body,
            error.stack
        ))
    }
}

export const deleteBankById = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await bankServices.hasDependents(id)
            if (!hasDependents) {
                await bankServices.deleteBankById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Bank in use',
                    req.originalUrl,
                    'The bank is in use in other tables'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error when deleting bank by id',
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
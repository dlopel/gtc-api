import * as unitServices from '../services/unit'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { Unit, UnitCompressedsQuery } from '../types/unit'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { _cloudinary } from '../libs/_cloudinary'
import { destroyCloudinaryImages } from '../libs/destroyCloudinaryImages'
import { isIdValid } from '../libs/generalEntityValidationFunctions'

export const createUnit = async (
    req: Request<unknown, unknown, Unit>,
    res: Response,
    next: NextFunction) => {

    try {
        await unitServices.createUnit(req.body)
        res.sendStatus(204)
    } catch (error) {

        next(new GenericException(
            'Error creating unit',
            { unit: req.body },
            error.stack
        ))
    }
}

export const getCompressedUnitsByQuery = async (
    req: Request<unknown, unknown, unknown, UnitCompressedsQuery>,
    res: Response,
    next: NextFunction) => {
    const areValid = unitServices.AreQueryFieldsForCompressedUnitsValid(req.query)
    if (areValid) {
        try {
            const units = await unitServices.getCompressedUnitsByQuery(
                req.query.licensePlate,
                req.query.brand,
                req.query.bodyType,
                req.query.transportId)
            res.status(200).json(units)
        } catch (error) {
            next(new GenericException(
                'Error getting compressed units',
                req.query,
                error.stack
            ))
        }
    } else {
        res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'data are invalids'
        ))
    }
}

export const getUnitById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const unit = await unitServices.getUnitById(id)
            res.status(200).json(unit)
        } catch (error) {
            next(new GenericException(
                'Error getting unit by id',
                id,
                error.stack
            ))
        }
    } else {
        res.status(400).json(new ResponseHTTPHelper(
            400,
            'Dato invalido',
            req.originalUrl,
            'El dato enviado tiene un formato invalido'
        ))
    }
}

export const getDataForDropDownListByTransport = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const transportId = req.query.transportId as unknown as string

    if (!isIdValid(transportId))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent id is invalid'
        ))

    try {
        const data = await unitServices.getDataForDropDownListByTransport(transportId)
        res.status(200).json(data)

    } catch (error) {
        next(new GenericException(
            'Error getting unit data for drop down list',
            transportId,
            error.stack
        ))
    }
}

export const getBodyTypeDataForDropDownList = (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const data = unitServices.getBodyTypeDataForDropDownList()
        res.status(200).json(data)

    } catch (error) {
        next(new GenericException(
            'Error getting body type data for drop down list',
            null,
            error.stack
        ))
    }
}

export const updateUnitById = async (
    req: Request<unknown, unknown, Unit>,
    res: Response,
    next: NextFunction) => {

    try {
        await unitServices.updateUnitById(req.body)
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error updating unit',
            { unit: req.body },
            error.stack
        ))
    }
}

export const deleteUnitById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const hasDependents = await unitServices.hasDependents(id)
            if (!hasDependents) {
                // destroy from cloudinary
                const currentImagePaths = await unitServices.getImagePathsById(id)
                if (currentImagePaths) {
                    await destroyCloudinaryImages(currentImagePaths as {})
                }
                await unitServices.deleteUnitById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Policy is in use',
                    req.originalUrl,
                    'The Policy to delete is in use in other tables.'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error when removing policy by id',
                id,
                error.stack
            ))
        }
    } else {
        res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The data sent has an invalid format'
        ))
    }
}
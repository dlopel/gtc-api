import * as driverServices from '../services/driver'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { IDriver } from '../types/IDriver'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { DriverCompressedsQuery } from '../types/DriverCompressedsQuery'
import { DriverOnOneProperty } from '../types/DriverOnOneProperty'
import { destroyCloudinaryImages } from '../libs/destroyCloudinaryImages'
import { isIdValid } from '../libs/generalEntityValidationFunctions'

const createDriver = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const newDriver: IDriver = req.body.driver

    try {
        await driverServices.createDriver(newDriver)
        res.sendStatus(204)
    } catch (error) {

        next(new GenericException(
            'Error al crear conductor',
            newDriver,
            error.stack
        ))
    }
}

const getCompressedDrivers = async (
    req: Request<unknown, unknown, unknown, DriverCompressedsQuery>,
    res: Response,
    next: NextFunction) => {

    const areValid = driverServices.areQueryFieldsForCompressedDriversValid(
        req.query.name,
        req.query.lastname,
        req.query.transportId
    )
    if (areValid) {
        try {
            const drivers = await driverServices.getCompressedDrivers(
                req.query.name.trim(),
                req.query.lastname.trim(),
                req.query.transportId.trim()
            )
            res.status(200).json(drivers)
        } catch (error) {
            next(new GenericException(
                'Error getting compressed drivers',
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

const getDriverById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const driver = await driverServices.getDriverById(id)
            res.status(200).json(driver)
        } catch (error) {
            next(new GenericException(
                'Error al obtener conductor por id',
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

const getDataForDropDownListByTransport = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const transportId = req.query.transportId as unknown as string

    if (!isIdValid(transportId))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data is invalid'
        ))

    try {
        const data = await driverServices.getDataForDropDownList(transportId)
        res.status(200).json(data)

    } catch (error) {
        next(new GenericException(
            'Error getting driver data for drop down list',
            null,
            error.stack
        ))
    }
}

const updateTransportById = async (
    req: Request<unknown, unknown, DriverOnOneProperty>,
    res: Response,
    next: NextFunction) => {

    const newDriver: IDriver = req.body.driver

    try {
        await driverServices.updateDriverById(newDriver, newDriver.id)
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error al actualizar conductor',
            newDriver,
            error.stack
        ))
    }
}

const deleteTransportById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await driverServices.hasDependents(id)
            if (!hasDependents) {
                const currentImagePaths = await driverServices.getImagePathsById(id)
                if (currentImagePaths) {
                    await destroyCloudinaryImages(currentImagePaths as {})
                }
                await driverServices.deleteDriverById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Conductor en Uso',
                    req.originalUrl,
                    'El Conductor a eliminar esta en uso en otras tablas.'
                ))
            }
        } catch (error) {
            next(new GenericException(
                'Error al eliminar conductor por id',
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


export {
    createDriver,
    getCompressedDrivers,
    getDriverById,
    getDataForDropDownListByTransport,
    updateTransportById,
    deleteTransportById
}
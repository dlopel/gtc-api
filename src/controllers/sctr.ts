import * as sctrServices from '../services/sctr'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import SctrStorage from '../types/sctr'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { destroyCloudinaryImages } from '../libs/destroyCloudinaryImages'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import Sctr from '../dtos/sctr'

export const createPolicy = async (
    req: Request<unknown, unknown, SctrStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const sctr = new Sctr(req.body)
        await sctrServices.createSctr(sctr.prepareForInsertStatement())
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error creating sctr',
            req.body,
            error.stack
        ))
    }
}

export const getSctrs = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const sctrs = await sctrServices.getSctrs()
        res.status(200).json(sctrs)
    } catch (error) {
        next(new GenericException(
            'Error getting sctrs',
            null,
            error.stack
        ))
    }
}

export const getSctrById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const sctr = await sctrServices.getSctrById(id)
            res.status(200).json(sctr)
        } catch (error) {
            next(new GenericException(
                'Error getting sctr by id',
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

export const updateSctrById = async (
    req: Request<{ id: string }, unknown, { observation: string }>,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params
    let { observation } = req.body

    if (!Sctr.isObservationAndIdFieldValid(observation, id))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data are invalid'
        ))

    observation = observation.trim() || null
    try {
        await sctrServices.updateSctrById({ observation, id })
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error updating sctr by id',
            { sctr: req.body },
            error.stack
        ))
    }
}

export const deleteSctrById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const { id } = req.params
    if (!isIdValid(id))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data is invalid'
        ))

    try {

        const imgPath = await sctrServices.getImagePathById(id)
        if (imgPath) {
            await destroyCloudinaryImages({ imagePath: imgPath })
        }
        await sctrServices.deleteSctrById(id)
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error deleting sctr by id',
            id,
            error.stack
        ))
    }
}
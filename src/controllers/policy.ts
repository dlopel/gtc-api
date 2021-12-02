import * as policyServices from '../services/policy'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import PolicyStorage from '../types/policy'
import { Request, Response, NextFunction } from 'express'
import { GenericException } from '../dtos/GenericException'
import { destroyCloudinaryImages } from '../libs/destroyCloudinaryImages'
import { isIdValid } from '../libs/generalEntityValidationFunctions'
import Policy from '../dtos/Policy'

export const createPolicy = async (
    req: Request<unknown, unknown, PolicyStorage>,
    res: Response,
    next: NextFunction) => {

    try {
        const policy = new Policy(req.body)
        await policyServices.createPolicy(policy.prepareForInsertStatement())
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error creating policy',
            req.body,
            error.stack
        ))
    }
}

export const getPolicies = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const policies = await policyServices.getPolicies()
        res.status(200).json(policies)
    } catch (error) {
        next(new GenericException(
            'Error getting policies',
            null,
            error.stack
        ))
    }
}

export const getDataForDropDownList = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const data = await policyServices.getDataForDropDownList()
        res.status(200).json(data)
    } catch (error) {
        next(new GenericException(
            'error getting policy data for dropdown list',
            null,
            error.stack
        ))
    }

}

export const getPolicyById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const policy = await policyServices.getPolicyById(id)
            res.status(200).json(policy)
        } catch (error) {
            next(new GenericException(
                'Error getting policy by id',
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

export const updatePolicyById = async (
    req: Request<{ id: string }, unknown, { observation: string }>,
    res: Response,
    next: NextFunction) => {

    const { id } = req.params
    let { observation } = req.body

    if (!Policy.isObservationAndIdFieldValid(observation, id))
        return res.status(400).json(new ResponseHTTPHelper(
            400,
            'Invalid Data',
            req.originalUrl,
            'The sent data are invalid'
        ))

    observation = observation.trim() || null
    try {
        await policyServices.updatePolicyById({ observation, id })
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error updating policy by id',
            { policy: req.body },
            error.stack
        ))
    }
}

export const deletePolicyById = async (
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

        const imgPath = await policyServices.getImagePathById(id)
        if (imgPath) {
            await destroyCloudinaryImages({ imagePath: imgPath })
        }
        await policyServices.deletePolicyById(id)
        res.sendStatus(204)
    } catch (error) {
        next(new GenericException(
            'Error deleting policy by id',
            id,
            error.stack
        ))
    }
}
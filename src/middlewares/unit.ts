import { _multer } from './_multer'
import { Field, MulterError } from 'multer'
import { IMulterFile } from '../types/IMulterFile'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { GenericException } from '../dtos/GenericException'
import { Request, Response, NextFunction } from 'express'
import * as fs from 'fs-extra'
import { _cloudinary } from '../libs/_cloudinary'
import * as unitServices from '../services/unit'
import { Unit } from '../types/unit'
import { restoreFromStringToOriginalValue } from '../libs/restoreFromStringToOriginalValue'
import { deleteLocallyUploadedFiles } from '../libs/deleteLocallyUploadedFiles'
import { MulterImagesObject } from '../types/MulterImagesObject'
import { destroyCloudinaryImageByPath } from '../libs/destroyCloudinaryImageByPath'

const unitImageFields: Field[] = [
    { name: 'technicalReviewImage', maxCount: 1 },
    { name: 'mtcImage', maxCount: 1 },
    { name: 'propertyCardImage', maxCount: 1 },
    { name: 'soatImage', maxCount: 1 }
]

export const uploadUnitImagesToLocal = (
    req: Request,
    res: Response,
    next: NextFunction) => {

    if (req.method.toUpperCase() === 'POST' || req.method.toUpperCase() === 'PUT') {
        _multer.fields(unitImageFields)(req, res, (err: any) => {
            if (err) {
                if (err instanceof MulterError) {
                    res.status(400).json(new ResponseHTTPHelper(
                        400,
                        'Conjunto de Imagenes no Soportadas',
                        req.originalUrl,
                        'Maximo 4 imagenes (pdf), 1MB maximo cada una' 
                    ))
                } else if (err.message === 'Forbbiden file type') {
                    res.status(415).json(new ResponseHTTPHelper(
                        415,
                        'Formato no admitido',
                        req.originalUrl,
                        'Las imagenes tienen un formato invalido'
                    ))
                } else {
                    next(new GenericException(
                        'Error al cargar imagenes',
                        req,
                        err.stack
                    ))
                }
            } else {
                next()
            }
        })
    } else {
        res.status(405).json(new ResponseHTTPHelper(
            405,
            'Metodo No Permitido',
            req.originalUrl,
            'Metodo No Permitido'
        ))
    }
}

export const uploadUnitImagesToCloudinary = async (
    req: Request<unknown, unknown, Unit>,
    res: Response,
    next: NextFunction) => {
    try {

        const previousImagePaths = await unitServices.getImagePathsById(req.body.id)

        const technicalReviewImage = unitImageFields[0].name
        if (req.files[technicalReviewImage]) {
            const localImagePath = (req.files[technicalReviewImage][0] as IMulterFile).path
            const uploaded = await _cloudinary.uploader.upload(localImagePath)
            req.body.technicalReviewImagePath = uploaded.url

            await fs.promises.unlink(localImagePath)

            if (previousImagePaths) {
                await destroyCloudinaryImageByPath(previousImagePaths.technicalReviewImagePath)
            }

        } else {
            req.body.technicalReviewImagePath = null
        }

        const mtcImage = unitImageFields[1].name
        if (req.files[mtcImage]) {
            const localImagePath = (req.files[mtcImage][0] as IMulterFile).path
            const uploaded = await _cloudinary.uploader.upload(localImagePath)
            req.body.mtcImagePath = uploaded.url

            await fs.promises.unlink(localImagePath)

            if (previousImagePaths) {
                await destroyCloudinaryImageByPath(previousImagePaths.mtcImagePath)
            }

        } else {
            req.body.mtcImagePath = null
        }

        const propertyCardImage = unitImageFields[2].name
        if (req.files[propertyCardImage]) {
            const localImagePath = (req.files[propertyCardImage][0] as IMulterFile).path
            const uploaded = await _cloudinary.uploader.upload(localImagePath)
            req.body.propertyCardImagePath = uploaded.url

            await fs.promises.unlink(localImagePath)

            if (previousImagePaths) {
                await destroyCloudinaryImageByPath(previousImagePaths.propertyCardImagePath)
            }

        } else {
            req.body.propertyCardImagePath = null
        }

        const soatImage = unitImageFields[3].name
        if (req.files[soatImage]) {
            const localImagePath = (req.files[soatImage][0] as IMulterFile).path
            const uploaded = await _cloudinary.uploader.upload(localImagePath)
            req.body.soatImagePath = uploaded.url

            await fs.promises.unlink(localImagePath)

            if (previousImagePaths) {
                await destroyCloudinaryImageByPath(previousImagePaths.soatImagePath)
            }

        } else {
            req.body.soatImagePath = null
        }

        next()

    } catch (error) {
        next(new GenericException(
            'Error al subir imagenes a Cloudinary',
            {
                technicalReviewImage: req.files[unitImageFields[0].name],
                mtcImage: req.files[unitImageFields[1].name],
                propertyCardImage: req.files[unitImageFields[2].name],
                soatImage: req.files[unitImageFields[3].name]
            },
            error.stack
        ))
    }
}

export const areFormatAndUniqueConstraintsValid = async (
    req: Request<unknown, unknown, Unit>,
    res: Response,
    next: NextFunction) => {

    // restoring 'null' a null || 'undefined' to undefined
    // null fields

    for (const [key, value] of Object.entries(req.body)) {
        req.body[key] = restoreFromStringToOriginalValue(value)
    }
    req.body = unitServices.sanitizer(req.body)
    if (unitServices.isValid(req.body)) {
        let areUnique = false

        if (req.method.toUpperCase() === 'POST') {
            areUnique = await unitServices.areUniqueConstraintsValid(
                req.body.id,
                req.body.chassisNumber || '',
                req.body.engineNumber || '',
                req.body.licensePlate || ''
            )
        }

        if (req.method.toUpperCase() === 'PUT') {
            areUnique = await unitServices.areUniqueConstraintsValidExceptCurrentUnitId(
                req.body.id,
                req.body.chassisNumber || '',
                req.body.engineNumber || '',
                req.body.licensePlate || ''
            )
        }

        if (areUnique) {
            next()
        } else {
            await deleteLocallyUploadedFiles(req.files as MulterImagesObject)
            res.status(409).json(new ResponseHTTPHelper(
                409,
                'Restricciones en campos unicos',
                req.originalUrl,
                `Los datos ingresados ya estan en uso`
            ))
        }

    } else {
        await deleteLocallyUploadedFiles(req.files as MulterImagesObject)
        res.status(400).json(new ResponseHTTPHelper(
            400,
            'Datos invalidos',
            req.originalUrl,
            'Los datos enviados tienen un formato invalido'
        ))
    }
}

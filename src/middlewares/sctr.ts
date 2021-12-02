import { _multer } from './_multer'
import { MulterError } from 'multer'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { GenericException } from '../dtos/GenericException'
import { Request, Response, NextFunction } from 'express'
import * as fs from 'fs-extra'
import { _cloudinary } from '../libs/_cloudinary'
import { isIdUnique } from '../services/sctr'
import SctrStorage from '../types/sctr'
import Sctr from '../dtos/sctr'
import { deleteLocallyUploadedFiles } from '../libs/deleteLocallyUploadedFiles'

export const uploadSctrFile = (
    req: Request,
    res: Response,
    next: NextFunction) => {
    _multer.single('image')(req, res, (err: any) => {
        if (err) {
            if (err instanceof MulterError) {
                res.status(400).json(new ResponseHTTPHelper(
                    400,
                    'Imagenes no Soportadas',
                    req.originalUrl,
                    'Maximo 1 imagen de 1MB(pdf)'
                ))
            } else if (err.message === 'Forbbiden file type') {
                res.status(415).json(new ResponseHTTPHelper(
                    415,
                    'Formato no admitido',
                    req.originalUrl,
                    'La imagen tiene un formato invalido'
                ))
            } else {
                next(new GenericException(
                    'Error al cargar imagen',
                    req,
                    err.stack
                ))
            }
        } else {
            if (req.method !== 'POST')
                return res.status(405).json(new ResponseHTTPHelper(
                    405,
                    'Metodo no permitido',
                    req.originalUrl,
                    `Metodo no permitido`
                ))

            if (!req.file)
                return res.status(422).json(new ResponseHTTPHelper(
                    422,
                    'Imagen Requerida',
                    req.originalUrl,
                    'No se envio la imagen de la poliza'
                ))

            next()
        }
    })
}

export const uploadSctrFileToCloudinary = async (
    req: Request<unknown, unknown, SctrStorage>,
    res: Response,
    next: NextFunction) => {
    try {

        if (req.file) {
            const path = req.file.path
            const uploaded = await _cloudinary.uploader.upload(path)
            req.body.imagePath = uploaded.url

            await fs.promises.unlink(path)
        } else {
            req.body.imagePath = null
        }

        next()
    } catch (error) {
        next(new GenericException(
            'Error al subir imagen a Cloudinary',
            { image: req.file },
            error.stack
        ))
    }
}

export const isSctrValid = async (
    req: Request<unknown, unknown, SctrStorage>,
    res: Response,
    next: NextFunction
) => {

    try {
        const sctr = new Sctr(req.body)
        if (!sctr.isValid()) {
            await deleteLocallyUploadedFiles({ image: [req.file] })
            return res.status(400).json(new ResponseHTTPHelper(
                400,
                'Datos invalidos',
                req.originalUrl,
                'Los datos enviados tienen un formato invalido'
            ))
        }

        let isUnique = false
        let error = false
        try {
            isUnique = await isIdUnique(sctr.sctr.id)
        } catch (er) {
            error = true
            await deleteLocallyUploadedFiles({ image: [req.file] })
            throw er
        }

        if (!error) {
            if (!isUnique) {
                await deleteLocallyUploadedFiles({ image: [req.file] })
                return res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restricciones en campos unicos',
                    req.originalUrl,
                    `El id ingresado ya esta en uso`
                ))
            }
            next()
        }
    } catch (error) {
        next(new GenericException(
            'Error validating Sctr and unique constraint',
            { sctr: req.body },
            error.stack
        ))
    }
}
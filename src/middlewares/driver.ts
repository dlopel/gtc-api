import { _multer } from './_multer'
import { Field, MulterError } from 'multer'
import { IMulterFile } from '../types/IMulterFile'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { GenericException } from '../dtos/GenericException'
import { Request, Response, NextFunction } from 'express'
import * as fs from 'fs-extra'
import { _cloudinary } from '../libs/_cloudinary'
import { UploadApiResponse } from 'cloudinary'
import Driver from '../dtos/Driver'
import { areUniqueConstraintsValid, areUniqueConstraintsValidExceptCurrentDriverId } from '../services/driver'
import { getImagePathsById as getDriverImagePathsById } from '../services/driver'
import { DriverOnOneProperty } from '../types/DriverOnOneProperty'
import { deleteLocallyUploadedFiles } from '../libs/deleteLocallyUploadedFiles'
import { MulterImagesObject } from '../types/MulterImagesObject'
import { destroyCloudinaryImageByPath } from '../libs/destroyCloudinaryImageByPath'

// imagenes del conductor a parsear
const driverImageFields: Field[] = [
    { name: 'dniImage', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 },
    { name: 'contractImage', maxCount: 1 }
]

const dniImage = driverImageFields[0].name
const licenseImage = driverImageFields[1].name
const contractImage = driverImageFields[2].name

const uploadDriverFilesToLocal = (
    req: Request,
    res: Response,
    next: NextFunction) => {
    _multer.fields(driverImageFields)(req, res, (err: any) => {
        if (err) {
            if (err instanceof MulterError) {
                res.status(400).json(new ResponseHTTPHelper(
                    400,
                    'Conjunto de Imagenes no Soportadas',
                    req.originalUrl,
                    'El servicio no acepta mas de 3 imagenes con menos de 1MB cada una.'
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
}

const uploadDriverFilesToCloudinary = async (
    req: Request<unknown, unknown, DriverOnOneProperty>,
    res: Response,
    next: NextFunction) => {
    try {
        const previousImagePaths = await getDriverImagePathsById(req.body.driver.id)

        let uploadedImagePromises: Promise<UploadApiResponse>[] = []
        // buscar si las imagenes requeridas del conductor estan cargadas
        // dniImage
        if (req.files[dniImage]) {
            const dniImageFile: IMulterFile = req.files[dniImage][0]
            const path = dniImageFile.path
            const dniImagePromise = _cloudinary.uploader.upload(path)
            uploadedImagePromises.push(dniImagePromise)
            await fs.promises.unlink(path)

            //eliminar la ruta anterior si es que hay
            if (previousImagePaths) {
                await destroyCloudinaryImageByPath(previousImagePaths.dniImagePath)
            }

        } else {
            uploadedImagePromises.push(null)
        }

        //licenseImage
        if (req.files[licenseImage]) {
            const licenseImageFile: IMulterFile = req.files[licenseImage][0]
            const path = licenseImageFile.path
            const licenceImagePromise = _cloudinary.uploader.upload(path)
            uploadedImagePromises.push(licenceImagePromise)
            await fs.promises.unlink(path)

            //eliminar la ruta anterior si es que hay
            if (previousImagePaths) {
                await destroyCloudinaryImageByPath(previousImagePaths.licenseImagePath)
            }
        } else {
            uploadedImagePromises.push(null)
        }

        //contractImage
        if (req.files[contractImage]) {
            const contractImageFile: IMulterFile = req.files[contractImage][0]
            const path = contractImageFile.path
            const contractImagePromise = _cloudinary.uploader.upload(path)
            uploadedImagePromises.push(contractImagePromise)
            await fs.promises.unlink(path)

            if (previousImagePaths) {
                //eliminar la ruta anterior si es que hay
                await destroyCloudinaryImageByPath(previousImagePaths.contractImagePath)
            }
        } else {
            uploadedImagePromises.push(null)
        }

        const values: UploadApiResponse[] = await Promise.all(uploadedImagePromises)
        //guardamos el url de las imagenes subidas a cloudinary
        //Las imagenes en la lista estan en orden
        // 1ro dniImage, 2do licenseImage, 3ro contractImage
        req.body.driver.dniImagePath = values[0] ? values[0].url : null
        req.body.driver.licenseImagePath = values[1] ? values[1].url : null
        req.body.driver.contractImagePath = values[2] ? values[2].url : null
        req.on('close', () => {
            console.log(values)
        })

        next()

    } catch (error) {
        next(new GenericException(
            'Error al subir imagenes a Cloudinary',
            {
                dniImage: req.files[dniImage],
                licenseImage: req.files[licenseImage],
                contractImage: req.files[contractImage]
            },
            error.stack
        ))
    }
}

const isDriverValid = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const newDriver = new Driver(
        req.body.id,
        req.body.dni,
        '',
        req.body.dniDateStart,
        req.body.dniDateEnd,
        req.body.license,
        '',
        req.body.licenseDateStart,
        req.body.licenseDateEnd,
        req.body.name,
        req.body.lastname,
        req.body.cellphoneOne,
        req.body.cellphoneTwo,
        req.body.dateStart,
        req.body.dateEnd,
        '',
        req.body.observation,
        req.body.transportId
    )

    if (newDriver.isValid()) {
        req.body = {
            driver: newDriver
        }
        next()
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

const areUniqueConstraintsValidToCreateDriver = async (
    req: Request<unknown, unknown, DriverOnOneProperty>,
    res: Response,
    next: NextFunction) => {

    const newDriver = req.body.driver

    try {
        const areUnique = await areUniqueConstraintsValid(
            newDriver.id,
            newDriver.dni,
            newDriver.license,
            newDriver.name,
            newDriver.lastname
        )

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

    } catch (err) {
        next(new GenericException(
            'Error al validar unique constraints del conductor',
            newDriver,
            err.stack
        ))
    }
}

const areUniqueConstraintsValidToUpdateDriver = async (
    req: Request<unknown, unknown, DriverOnOneProperty>,
    res: Response,
    next: NextFunction) => {

    const newDriver = req.body.driver

    try {
        const areUnique = await areUniqueConstraintsValidExceptCurrentDriverId(
            newDriver.dni,
            newDriver.license,
            newDriver.name,
            newDriver.lastname,
            newDriver.id
        )

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

    } catch (err) {
        next(new GenericException(
            'Error al validar unique constraints del conductor excepto el actual',
            newDriver,
            err.stack
        ))
    }
}

export {
    uploadDriverFilesToLocal,
    uploadDriverFilesToCloudinary,
    isDriverValid,
    areUniqueConstraintsValidToCreateDriver,
    areUniqueConstraintsValidToUpdateDriver
}
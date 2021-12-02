import { getUserById, isManager as isManagerUser } from '../services/user'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { GenericException } from '../dtos/GenericException'
import { Response, Request, NextFunction } from 'express'
import { isTokenValid } from './isTokenValid'

/** Middlewares para usuarios */

/**Si el usuario tiene el rol de administrador(Gerente) */
const _isManager = async (req: Request, res: Response, next: NextFunction) => {
    const decodedUserId = req.headers.decodedUserId as string

    try {
        const _isManager = await isManagerUser(decodedUserId)
        if (_isManager) {
            next()
        } else {
            res.status(403).json(new ResponseHTTPHelper(
                403,
                'No se permite el acceso',
                req.baseUrl,
                'El usuario no cuenta con los permisos necesarios'
            ))
        }
    } catch (err) {
        next(new GenericException(
            'Error al validar rol administrador del usuario',
            decodedUserId,
            err.stack
        ))
    }
}

/** Verifica si hay al menos un usuario */
const _validateExistenceOfUser = async (req: Request, res: Response, next: NextFunction) => {
    const decodedUserId = req.headers.decodedUserId as string
    let user: any = null

    try {
        user = await getUserById(decodedUserId)

        if (user) {
            next()
        } else {
            res.status(404).json(new ResponseHTTPHelper(
                404,
                'Recurso no encontrado',
                req.baseUrl,
                'El usuario no fue encontrado'
            ))
        }
    } catch (err) {
        next(new GenericException(
            'Error al validar existencia del usuario',
            { decodedUserId, user },
            err.stack
        ))
    }

}

/**Añade el id del usuario a la cabecera */
const _addUserIdtoUrlParams = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.decodedUserId) {
        req.params.id = req.headers.decodedUserId as string
        next()
    } else {
        next(new GenericException(
            'Error al intentar capturar id del usuario',
            null,
            null
        ))
    }
}

const isManager = [isTokenValid, _validateExistenceOfUser, _isManager]
const AddUserIdToUrlParams = [isTokenValid, _validateExistenceOfUser, _addUserIdtoUrlParams]
const validateExistenceOfUser = [isTokenValid, _validateExistenceOfUser]

export {
    isManager,
    AddUserIdToUrlParams,
    validateExistenceOfUser
}
import * as userService from '../services/user'
import { User } from '../dtos/User'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { Request, Response, NextFunction } from 'express'
import { IUser } from '../types/IUser'
import { GenericException } from '../dtos/GenericException'
import { isIdValid } from '../libs/generalEntityValidationFunctions'

const createUser = async (req: Request, res: Response, next: NextFunction) => {

    const user: IUser = req.body

    const newUser = new User(
        user.id,
        user.email,
        user.password,
        user.name,
        user.lastname,
        user.roleId)

    try {
        if (newUser.isValid()) {

            const areUnique = await userService.areUniqueConstraintsValid(
                user.name,
                user.lastname,
                user.email)

            if (areUnique) {
                await userService.createUser(newUser)
                res.sendStatus(204)

            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restricciones en campos unicos',
                    req.originalUrl,
                    'Los campos nombres, apellidos y email son unicos. Los datos enviados ya estan en uso.'
                ))
            }
        } else {
            res.status(400).json(new ResponseHTTPHelper(
                400,
                'Datos invalidos',
                req.originalUrl,
                'Los datos enviados tienen un formato invalido'
            ))
        }
    } catch (error) {
        next(new GenericException(
            'Error al crear usuario',
            newUser,
            error.stack
        ))
    }

}

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.getUsers()
        res.status(200).json(users)
    } catch (error) {
        next(new GenericException(
            'Error al obtener usuarios',
            null,
            error.stack
        ))
    }
}

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    if (isIdValid(id)) {
        try {
            const user = await userService.getUserById(id)
            res.status(200).json(user)
        } catch (error) {
            next(new GenericException(
                'Error al obtener usuario por id',
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

const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
    //se asigna la email y contraseña genericos para que pase el metodo isValid()
    const newUser = new User(
        req.params.id,
        null,
        null,
        req.body.name,
        req.body.lastname,
        req.body.roleId
    )

    try {
        if (newUser.isIdValid() &&
            newUser.isNameValid() &&
            newUser.isLastNameValid() &&
            newUser.isRoleIdValid()) {

            const areUnique = await userService.areUniqueConstraintsValidExceptCurrentId(
                newUser.name,
                newUser.lastname,
                newUser.id)

            if (areUnique) {
                await userService.updateUserPartiallyById(
                    newUser.id,
                    newUser.name,
                    newUser.lastname,
                    newUser.roleId)

                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Restricciones en campos unicos',
                    req.originalUrl,
                    'Los campos nombres, apellidos son unicos. Los datos enviados ya estan en uso'
                ))
            }
        } else {
            res.status(400).json(new ResponseHTTPHelper(
                400,
                'Datos invalidos',
                req.originalUrl,
                'Los datos enviados tienen un formato invalido'
            ))
        }
    } catch (error) {
        next(new GenericException(
            'Error al crear usuario',
            newUser,
            error.stack
        ))
    }
}

const updateUserPasswordById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { password } = req.body

    try {

        if (isIdValid(id) && User.isPasswordValid(password)) {
            await userService.updateUserPasswordById(password, id)
            res.sendStatus(204)
        } else {
            res.status(400).json(new ResponseHTTPHelper(
                400,
                'Datos invalidos',
                req.originalUrl,
                'Los datos enviados tienen un formato invalido'
            ))
        }
    } catch (error) {
        next(new GenericException(
            'Error al actualizar contraseña',
            { id, password },
            error.stack
        ))
    }
}

const updateCurrentUserPasswordById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { oldPassword, newPassword } = req.body

    try {
        if (isIdValid(id) &&
            User.isPasswordValid(oldPassword) &&
            User.isPasswordValid(newPassword)) {

            const currentUser = await userService.getCurrentUserById(id)

            if (currentUser) {

                const areSame = await userService.areHashAndPasswordSame(oldPassword, currentUser.password)

                if (areSame) {
                    await userService.updateUserPasswordById(newPassword, id)
                    res.sendStatus(204)
                } else {
                    res.status(401).json(new ResponseHTTPHelper(
                        401,
                        'Credenciales Incorrectas',
                        req.originalUrl,
                        'La contraseña no coincide con la anterior'
                    ))
                }
            } else {
                res.status(404).json(new ResponseHTTPHelper(
                    404,
                    'Recurso Encontrado',
                    req.originalUrl,
                    'El usuario ha actualizar no fue encontrado'
                ))
            }
        } else {
            res.status(400).json(new ResponseHTTPHelper(
                400,
                'Datos invalidos',
                req.originalUrl,
                'Los datos enviados tienen un formato invalido'
            ))
        }
    } catch (error) {
        next(new GenericException(
            'Error al actualizar contraseña',
            { id, oldPassword, newPassword },
            error.stack
        ))
    }
}

const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    if (isIdValid(id)) {
        try {
            const hasDependents = await userService.hasDependentRecords(id)
            if (!hasDependents) {
                await userService.deleteUserById(id)
                res.sendStatus(204)
            } else {
                res.status(409).json(new ResponseHTTPHelper(
                    409,
                    'Usuario en Uso',
                    req.originalUrl,
                    'El usuario a eliminar esta en uso en otras tablas.'
                ))
            }

        } catch (error) {
            next(new GenericException(
                'Error al eliminar usuario por id',
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
    createUser,
    getUsers,
    getUserById,
    updateUserById,
    updateUserPasswordById,
    updateCurrentUserPasswordById,
    deleteUserById
}
import { getSigninUserByEmail } from '../services/user'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { ISigninFields } from '../types/ISigninFields'
import { JwtUserPayload } from '../types/JwtUserPayload'
import { GenericException } from '../dtos/GenericException'
import { TokenResponse } from '../dtos/Token'

/**inicio de sesion y envio de token*/
const signin = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    const signin: ISigninFields = req.body

    try {

        const userOriginalCredentials = await getSigninUserByEmail(signin.email || '')

        if (userOriginalCredentials) {

            const isEqual = await bcrypt.compare(signin.password, userOriginalCredentials.password)

            if (isEqual) {
                const jwtuserpayload: JwtUserPayload = {
                    userId: userOriginalCredentials.id
                }
                jwt.sign(jwtuserpayload,
                    process.env.SECRET_KEY,
                    { expiresIn: '4h' },
                    (err, token) => {
                        if (err) {
                            next(new GenericException(
                                'Error al crear token',
                                { idUser: userOriginalCredentials.id },
                                err.stack))
                        } else {
                            res.status(200).json(new TokenResponse(token))
                        }
                    })
            } else {
                res.status(400).json(new ResponseHTTPHelper(
                    400,
                    'Contraseña Incorrecta',
                    req.originalUrl,
                    'La contrasena enviada es incorrecta'
                ))
            }

        } else {
            res.status(404).json(new ResponseHTTPHelper(
                404,
                'Usuario no encontrado',
                req.originalUrl,
                'No existe usuario con las credenciales enviadas.'
            ))
        }

    } catch (error) {
        next(new GenericException(
            'Error al autenticar email y contraseña',
            { email: signin.email, password: signin.password },
            error.stack
        ))
    }
}

export { signin }
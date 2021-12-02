import jwt from 'jsonwebtoken'
import ResponseHTTPHelper from '../dtos/ResponseHTTPHelper'
import { Request, Response, NextFunction } from 'express'
import { JwtUserPayload } from '../types/JwtUserPayload'

/**Valida el token, si es valido se pasa el id del objeto decodificado por el req.headers.decodedUserId*/
const isTokenValid = (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.headers.authorization
    if (token && token.slice(0, 6) == 'Bearer') {
        jwt.verify(token.slice(7), process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                switch (err.name) {
                    case 'TokenExpiredError':
                        res.status(401).json(new ResponseHTTPHelper(
                            401,
                            'No autorizado',
                            req.originalUrl,
                            'El token a expirado, vuelva a autenticarse.'
                        ))
                        break
                    default:
                        res.status(400).json(new ResponseHTTPHelper(
                            400,
                            'Token Invalido',
                            req.originalUrl,
                            'El token enviado es invalido'
                        ))
                        break
                }
            } else {
                const _decoded = decoded as JwtUserPayload
                if (_decoded.userId) {
                    req.headers.decodedUserId = _decoded.userId
                    next()
                } else {
                    res.status(400).json(new ResponseHTTPHelper(
                        400,
                        'Cuerpo del token invalido',
                        req.baseUrl,
                        'El token no contiene el cuerpo requerido'
                    ))
                }
            }
        })
    } else {
        res.status(400).json(new ResponseHTTPHelper(
            400,
            'Token no enviado',
            req.originalUrl,
            'No se ha enviando el token'
        ))
    }
}

export { isTokenValid }
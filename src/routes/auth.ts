import express from 'express'
import * as authController from '../controllers/auth'

const authRouter = express.Router()

authRouter.post('/', authController.signin)

export { authRouter }
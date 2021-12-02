import express from 'express'
import * as sctrController from '../controllers/sctr'
import * as sctrMiddlewares from '../middlewares/sctr'

export const sctrRouter = express.Router()

sctrRouter.get('/:id', sctrController.getSctrById)
sctrRouter.put('/:id', sctrController.updateSctrById)
sctrRouter.delete('/:id', sctrController.deleteSctrById)
sctrRouter.get('/', sctrController.getSctrs)
sctrRouter.post(
    '/',
    sctrMiddlewares.uploadSctrFile,
    sctrMiddlewares.isSctrValid,
    sctrMiddlewares.uploadSctrFileToCloudinary,
    sctrController.createPolicy)
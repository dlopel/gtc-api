import express from 'express'
import * as outputController from '../controllers/output'

export const outputRouter = express.Router()

outputRouter.get('/op/getDepositsByFreights', outputController.getDepositsByFreights)
outputRouter.get('/:id', outputController.getOutputById)
outputRouter.delete('/:id', outputController.deleteOutputById)
outputRouter.get('/', outputController.getOutputsByQuery)
outputRouter.post('/', outputController.createOutput)
outputRouter.put('/', outputController.updateOutputById)
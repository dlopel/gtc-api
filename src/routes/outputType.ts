import express from 'express'
import * as outputTypeController from '../controllers/outputType'

export const outputTypeRouter = express.Router()

outputTypeRouter.get('/dropdownlist', outputTypeController.getDataForDropDownList)
outputTypeRouter.get('/:id', outputTypeController.getOutputTypeById)
outputTypeRouter.delete('/:id', outputTypeController.deleteOutputTypeById)
outputTypeRouter.get('/', outputTypeController.getOutputTypes)
outputTypeRouter.post('/', outputTypeController.createOutputType)
outputTypeRouter.put('/', outputTypeController.updateOutputTypeById)
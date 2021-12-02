import express from 'express'
import * as serviceController from '../controllers/service'

export const serviceRouter = express.Router()

serviceRouter.get('/expanded/:id', serviceController.getServiceById)
serviceRouter.get('/dropdownlist', serviceController.getDataForDropDownList)
serviceRouter.delete('/:id', serviceController.deleteServiceById)
serviceRouter.get('/expanded', serviceController.getServices)
serviceRouter.post('/', serviceController.createService)
serviceRouter.put('/', serviceController.updateServiceById)
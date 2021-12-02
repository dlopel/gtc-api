import express from 'express'
import * as transportController from '../controllers/transport'

const transportRouter = express.Router()

transportRouter.get('/expanded/:id', transportController.getTransportById)
transportRouter.get('/dropdownlist', transportController.getDataForDropDownList)
transportRouter.get('/compressed', transportController.getCompressedTransports)
transportRouter.delete('/:id', transportController.deleteTransportById)
transportRouter.post('/', transportController.createTransport)
transportRouter.put('/', transportController.updateTransportById)

export { transportRouter }
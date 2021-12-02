import express from 'express'
import * as clientController from '../controllers/client'
import * as freightController from '../controllers/freight'

export const clientRouter = express.Router()

clientRouter.get('/:id/freights', freightController.getFreightsByClientId)
clientRouter.get('/dropdownlist', clientController.getDataForDropDownList)
clientRouter.get('/:id', clientController.getClientById)
clientRouter.delete('/:id', clientController.deleteClientById)
clientRouter.get('/', clientController.getCompressedClients)
clientRouter.post('/', clientController.createClient)
clientRouter.put('/', clientController.updateClientById)
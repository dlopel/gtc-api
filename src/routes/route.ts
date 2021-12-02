import express from 'express'
import * as routeController from '../controllers/route'

export const routeRouter = express.Router()

routeRouter.get('/expanded/:id', routeController.getRouteById)
routeRouter.get('/compressed', routeController.getPaginationOfCompressedRoutesByQuery)
routeRouter.get('/dropdownlist', routeController.getDataForDropDownListByClient)
routeRouter.post('/', routeController.createRoute)
routeRouter.put('/', routeController.updateRouteById)
routeRouter.delete('/:id', routeController.deleteRouteById)
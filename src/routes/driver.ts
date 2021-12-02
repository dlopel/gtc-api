import express from 'express'
import * as driverController from '../controllers/driver'
import * as driverMiddlewares from '../middlewares/driver'

const driverRouter = express.Router()

driverRouter.get('/expanded/:id', driverController.getDriverById)
driverRouter.get('/compressed', driverController.getCompressedDrivers)
driverRouter.get('/dropdownlist', driverController.getDataForDropDownListByTransport)
driverRouter.delete('/:id', driverController.deleteTransportById)
driverRouter.post(
    '/',
    driverMiddlewares.uploadDriverFilesToLocal,
    driverMiddlewares.isDriverValid,
    driverMiddlewares.areUniqueConstraintsValidToCreateDriver,
    driverMiddlewares.uploadDriverFilesToCloudinary,
    driverController.createDriver)
    
driverRouter.put(
    '/', 
    driverMiddlewares.uploadDriverFilesToLocal,
    driverMiddlewares.isDriverValid,
    driverMiddlewares.areUniqueConstraintsValidToUpdateDriver,
    driverMiddlewares.uploadDriverFilesToCloudinary,
    driverController.updateTransportById)
    


export { driverRouter }
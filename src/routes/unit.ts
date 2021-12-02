import express from 'express'
import * as unitController from '../controllers/unit'
import * as unitMiddlewares from '../middlewares/unit'

export const unitRouter = express.Router()

unitRouter.get('/expanded/:id', unitController.getUnitById)
unitRouter.get('/compressed', unitController.getCompressedUnitsByQuery)
unitRouter.get('/dropdownlist', unitController.getDataForDropDownListByTransport)
unitRouter.get('/dropdownlist/bodyTypes', unitController.getBodyTypeDataForDropDownList)

unitRouter.post(
    '/',
    unitMiddlewares.uploadUnitImagesToLocal,
    unitMiddlewares.areFormatAndUniqueConstraintsValid,
    unitMiddlewares.uploadUnitImagesToCloudinary,
    unitController.createUnit)

unitRouter.put(
    '/',
    unitMiddlewares.uploadUnitImagesToLocal,
    unitMiddlewares.areFormatAndUniqueConstraintsValid,
    unitMiddlewares.uploadUnitImagesToCloudinary,
    unitController.updateUnitById)

unitRouter.delete('/:id', unitController.deleteUnitById)
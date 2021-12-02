import express from 'express'
import * as productTransportedController from '../controllers/productTransported'

const productTransportedRouter = express.Router()

productTransportedRouter.get('/:id', productTransportedController.getProductTransportedById)
productTransportedRouter.delete('/:id', productTransportedController.deleteProductTransportedById)
productTransportedRouter.get('/', productTransportedController.getTransportedProductsByFreight)
productTransportedRouter.post('/', productTransportedController.createProductTransported)

export default productTransportedRouter
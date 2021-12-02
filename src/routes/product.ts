import express from 'express'
import * as productController from '../controllers/product'

export const productRouter = express.Router()

productRouter.get('/expanded/:id', productController.getProductById)
productRouter.get('/compressed', productController.getPaginationOfCompressedProductsByQuery)
productRouter.get('/dropdownlist', productController.getDataForDropDownListByClient)
productRouter.delete('/:id', productController.deleteProductById)
productRouter.post('/', productController.createProduct)
productRouter.put('/', productController.updateProductById)
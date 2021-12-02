import express from 'express'
import * as bankController from '../controllers/bank'

export const bankRouter = express.Router()

bankRouter.get('/dropdownlist', bankController.getDataForDropDownList)
bankRouter.get('/:id', bankController.getBankById)
bankRouter.delete('/:id', bankController.deleteBankById)
bankRouter.get('/', bankController.getBanks)
bankRouter.post('/', bankController.createBank)
bankRouter.put('/', bankController.updateBankById)
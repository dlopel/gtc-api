import express from 'express'
import * as saleSettlementController from '../controllers/saleSettlement'
import * as saleSettlementDetailtController from '../controllers/saleSettlementDetail'
export const saleSettlementRouter = express.Router()

saleSettlementRouter.post('/:id/details', saleSettlementDetailtController.createBatch)
saleSettlementRouter.get('/:id/details', saleSettlementDetailtController.getBatchBySaleSettlementId)
saleSettlementRouter.delete('/:id/details', saleSettlementDetailtController.deleteBatchBySaleSettlementId)
saleSettlementRouter.get('/:id', saleSettlementController.getSaleSettlementById)
saleSettlementRouter.delete('/:id', saleSettlementController.deleteSaleSettlementById)
saleSettlementRouter.put('/:id', saleSettlementController.updateSaleSettlementById)
saleSettlementRouter.get('/', saleSettlementController.getSaleSettlementsByQuery)
saleSettlementRouter.post('/', saleSettlementController.createSaleSettlement)
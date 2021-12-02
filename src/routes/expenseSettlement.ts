import express from 'express'
import * as expenseSettlementController from '../controllers/expenseSettlement'

const expenseSettlementRouter = express.Router()

expenseSettlementRouter.get(
    '/:id',
    expenseSettlementController.getExpenseSettlementById)

expenseSettlementRouter.get(
    '/',
    expenseSettlementController.getExpenseSettlementsByQuery)

expenseSettlementRouter.post(
    '/',
    expenseSettlementController.createExpenseSettlement)

expenseSettlementRouter.put(
    '/',
    expenseSettlementController.updateExpenseSettlementById)

expenseSettlementRouter.delete(
    '/:id',
    expenseSettlementController.deleteExpenseSettlementById)

export default expenseSettlementRouter
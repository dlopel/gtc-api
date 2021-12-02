import express from 'express'
import * as policyController from '../controllers/policy'
import * as policyMiddlewares from '../middlewares/policy'

export const policyRouter = express.Router()

policyRouter.get('/dropdownlist', policyController.getDataForDropDownList)
policyRouter.get('/:id', policyController.getPolicyById)
policyRouter.put('/:id', policyController.updatePolicyById)
policyRouter.delete('/:id', policyController.deletePolicyById)
policyRouter.get('/', policyController.getPolicies)
policyRouter.post(
    '/',
    policyMiddlewares.uploadPolicyFile,
    policyMiddlewares.isPolicyValid,
    policyMiddlewares.uploadPolicyFileToCloudinary,
    policyController.createPolicy)
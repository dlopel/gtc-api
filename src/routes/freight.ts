import express from 'express'
import * as freightController from '../controllers/freight'

const freightRouter = express.Router()

//mas adelante corregir los endpoint, deberian de ser solo sustantitos
//paginated y notLiquidated son estado que deberia poner como query string
/**Dato: Cuando capturamos el flete por formattedId para ponerlo como referencia
 * al EGreso, podriamos validar si la liquidacion del flete ya esta liquidado
 * o cancelado para no vincularlo porque la liquidacion ya esta CERRADA
 */
freightRouter.get('/expanded/formattedId/:formattedId', freightController.getFreightByFormattedId)
freightRouter.get('/expanded/id/:id', freightController.getFreightById)
freightRouter.get('/paginated/compressed', freightController.getPaginationOfCompressedFreights)
freightRouter.get('/notLiquidated/compressed', freightController.getFreightsNotLiquidatedByQuery)
freightRouter.get('/compressed', freightController.getFreightsByExpenseSettlement)
freightRouter.get('/:freightId/outputs', freightController.getOutputsByFreight)
freightRouter.delete('/:id', freightController.deleteFreightById)
freightRouter.post('/', freightController.createFreight)
freightRouter.put('/', freightController.updateFreightById)
freightRouter.patch('/', freightController.updateFreightsExpenseSettlement)

export default freightRouter
import 'dotenv/config'
import express, { ErrorRequestHandler, Request, Response, NextFunction } from 'express'
const app = express()
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import pkg from '../package.json'
import { userRouter } from './routes/user'
import { transportRouter } from './routes/transport'
import { driverRouter } from './routes/driver'
import { authRouter } from './routes/auth'
import { logger, LoggerMessage } from './libs/logger'
import ResponseHTTPHelper from './dtos/ResponseHTTPHelper'
import { policyRouter } from './routes/policy'
import { GenericException } from './dtos/GenericException'
import { unitRouter } from './routes/unit'
import { clientRouter } from './routes/client'
import { routeRouter } from './routes/route'
import { productRouter } from './routes/product'
import { serviceRouter } from './routes/service'
import freightRouter from './routes/freight'
import productTransportedRouter from './routes/productTransported'
import expenseSettlementRouter from './routes/expenseSettlement'
import { bankRouter } from './routes/bank'
import { outputTypeRouter } from './routes/outputType'
import { outputRouter } from './routes/output'
import { sctrRouter } from './routes/sctr'
import { saleSettlementRouter } from './routes/saleSettlement'

//settings
const corsOptions: any = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}
app.set('pkg', pkg)
app.set('title', `Servidor Express para: "${app.get('pkg').name}"`)
app.set('port', process.env.EXPRESS_PORT)
const root: string = '/api/v1'
const welcome: any = {
    name: app.get('pkg').name,
    author: app.get('pkg').author,
    description: app.get('pkg').description,
    version: app.get('pkg').version
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))
app.use(helmet())


//routes
//root
app.get('/', (req, res) => {
    res.json(welcome)
})

app.use(`${root}/auth`, authRouter)
app.use(`${root}/users`, userRouter)
app.use(`${root}/transports`, transportRouter)
app.use(`${root}/drivers`, driverRouter)
app.use(`${root}/policies`, policyRouter)
app.use(`${root}/sctrs`, sctrRouter)
app.use(`${root}/units`, unitRouter)
app.use(`${root}/clients`, clientRouter)
app.use(`${root}/routes`, routeRouter)
app.use(`${root}/products`, productRouter)
app.use(`${root}/services`, serviceRouter)
app.use(`${root}/freights`, freightRouter)
app.use(`${root}/transportedProducts`, productTransportedRouter)
app.use(`${root}/expenseSettlements`, expenseSettlementRouter)
app.use(`${root}/banks`, bankRouter)
app.use(`${root}/outputTypes`, outputTypeRouter)
app.use(`${root}/outputs`, outputRouter)
app.use(`${root}/saleSettlements`, saleSettlementRouter)
app.use((req, res, next) => {
    res.status(404).json(new ResponseHTTPHelper(
        404,
        'Not found',
        req.originalUrl,
        'Resource not found'))
})


//error handling
app.use((
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction) => {

    const error = err as unknown as GenericException

    logger.error(new LoggerMessage(
        error.title,
        error.processedData,
        error.stack,
        error.message
    ))

    res.status(500).json(new ResponseHTTPHelper(
        500,
        error.title,
        req.originalUrl,
        error.message
    ))

    return next(err)
})

export default app

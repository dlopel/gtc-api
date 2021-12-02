import { Pool } from 'pg'
import environments from './environments'

const currentEnv = environments[process.env.NODE_ENV]

const config = {
    user: currentEnv.username,
    host: currentEnv.host,
    database: currentEnv.database,
    password: currentEnv.password,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 30000,
}

const pool = new Pool(config)

export default pool
import pool from '../connectDb'
import ClientStorage from '../types/client'
import DropDownListRow from '../types/DropDownListRow'

export const areUniqueConstraintsValid = async (
    id: string,
    ruc: string) => {
    if (id && ruc) {
        const query = {
            text: `
                   SELECT id
                   FROM public."CLIENTS" 
                   WHERE UPPER(id || '')=$1 OR ruc=$2`,
            values: [id.toUpperCase(), ruc]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const isRucUniqueExceptCurrentClient = async (clientId: string, ruc: string) => {
    if (clientId && ruc) {
        const query = {
            text: `
                   SELECT id
                   FROM public."CLIENTS" 
                   WHERE UPPER(id || '')!=$1 AND ruc=$2`,
            values: [clientId.toUpperCase(), ruc]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createClient = async (client: ClientStorage) => {
    if (client) {
        const query = {
            text: `
                   INSERT INTO public."CLIENTS"
                   (id, ruc, name, address, observation)
                   VALUES ($1, $2, $3, $4, $5)`,
            values: [
                client.id,
                client.ruc,
                client.name,
                client.address,
                client.observation]
        }
        await pool.query(query)
    }
}

export const updateClientById = async (client: ClientStorage) => {
    if (client && client.id) {
        const query = {
            text: `
                    UPDATE public."CLIENTS" SET
                    ruc=$1, name=$2, address=$3, observation=$4
                    WHERE id=$5`,
            values: [
                client.ruc,
                client.name,
                client.address,
                client.observation,
                client.id]
        }
        await pool.query(query)
    }
}

export const getCompressedClients = async (): Promise<ClientStorage[]> => {
    const text = `
                  SELECT 
                  id, ruc, name, address, observation
                  FROM public."CLIENTS"
                  ORDER BY name`
    const result = await pool.query<ClientStorage>(text)
    return result.rows
}

export const getClientById = async (id: string): Promise<ClientStorage | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT id, ruc, name, address, observation
                  FROM public."CLIENTS"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<ClientStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getDataForDropDownList = async (): Promise<DropDownListRow[]> => {
    const text = `
                  SELECT id, name AS value
                  FROM public."CLIENTS"
                  ORDER BY name `
    const result = await pool.query<DropDownListRow>(text)
    return result.rows
}

export const deleteClientById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."CLIENTS"
                   WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla TRANSPORTS */
export const hasDependents = async (clientId: string) => {
    if (clientId) {
        const query = {
            text: `
                    SELECT client_id
                    FROM public."ROUTES"
                    WHERE client_id=$1
                    UNION
                    SELECT client_id
                    FROM public."PRODUCTS"
                    WHERE client_id=$1
                    UNION 
                    SELECT client_id
                    FROM public."USERS_CLIENTS"
                    WHERE client_id=$1
                    UNION 
                    SELECT client_id
                    FROM public."FREIGHTS"
                    WHERE client_id=$1
                    UNION 
                    SELECT client_id
                    FROM public."SALESINVOICES"
                    WHERE client_id=$1`,
            values: [clientId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
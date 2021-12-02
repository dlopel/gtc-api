import pool from '../connectDb'
import Transport from '../dtos/Transport'
import { CompressedTransport, ITransport } from '../types/ITransport'
import DropDownListRow from '../types/DropDownListRow'

export const isRucUnique = async (ruc: string) => {
    if (ruc) {
        const query = {
            text: `
                   SELECT id
                   FROM public."TRANSPORTS" 
                   WHERE ruc=$1`,
            values: [ruc]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const isRucUniqueExceptCurrentId = async (ruc: string, id: string) => {
    if (ruc && id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."TRANSPORTS" 
                   WHERE UPPER(id || '')!=$1 AND UPPER(ruc || '')=$2`,
            values: [id.toUpperCase(), ruc.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createTransport = async (transport: ITransport) => {
    if (transport instanceof Transport) {
        const query = {
            text: `
                   INSERT INTO public."TRANSPORTS" (id, ruc, name, address, telephone, observation)
                   VALUES ($1, $2, $3, $4, $5, $6)`,
            values: [
                transport.id,
                transport.ruc,
                transport.name,
                transport.address,
                transport.telephone,
                transport.observation]
        }
        await pool.query(query)
    }
}

export const updateTransportById = async (transport: ITransport, id: string) => {
    if (transport instanceof Transport) {
        const query = {
            text: `
                    UPDATE public."TRANSPORTS" SET
                    ruc=$1, 
                    name=$2, 
                    address=$3, 
                    telephone=$4,
                    observation=$5
                    WHERE id=$6`,
            values: [transport.ruc, transport.name, transport.address, transport.telephone, transport.observation, id]
        }
        await pool.query(query)
    }
}

export const getCompressedTransports = async () => {
    const text =  `
                   SELECT id, ruc, name, address, telephone
                   FROM public."TRANSPORTS"
                   ORDER BY name`
    const result = await pool.query<CompressedTransport>(text)
    return result.rows
}

export const getTransportById = async (id: string): Promise<ITransport | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT id, ruc, name, address, telephone, observation
                  FROM public."TRANSPORTS"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query(query)

        if (result.rowCount) {
            return new Transport(
                result.rows[0].id,
                result.rows[0].ruc,
                result.rows[0].name,
                result.rows[0].address,
                result.rows[0].telephone,
                result.rows[0].observation
            )
        } else {
            return null
        }
    }
}

export const getDataForDropDownList = async (): Promise<DropDownListRow[]> => {
    const text = `
                  SELECT id, SUBSTRING(name FROM 1 FOR 25) AS value
                  FROM public."TRANSPORTS"
                  ORDER BY name`
    const result = await pool.query<DropDownListRow>(text)
    return result.rows
}

export const deleteTransportById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."TRANSPORTS"
                   WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla TRANSPORTS */
export const hasDependents = async (transportId: string) => {
    if (transportId) {
        const query = {
            text: `
                    SELECT transport_id
                    FROM public."DRIVERS"
                    WHERE transport_id=$1
                    UNION
                    SELECT transport_id
                    FROM public."FREIGHTS"
                    WHERE transport_id=$1
                    UNION 
                    SELECT transport_id
                    FROM public."PURCHASEINVOICES"
                    WHERE transport_id=$1
                    UNION 
                    SELECT transport_id
                    FROM public."UNITS"
                    WHERE transport_id=$1`,
            values: [transportId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
import pool from '../connectDb'
import DropDownListRow from '../types/DropDownListRow'
import { OutputTypeStorage } from '../types/outputType'

export const areUniqueConstraintsValid = async (
    id: string,
    name: string
) => {
    if (id && name) {
        const query = {
            text: `
                   SELECT id
                   FROM public."OUTPUTTYPES" 
                   WHERE UPPER(id || '')=$1 OR UPPER(name || '')=$2`,
            values: [id.toUpperCase(), name.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const isNameUnique = async (name: string) => {
    if (name) {
        const query = {
            text: `
                   SELECT id
                   FROM public."OUTPUTTYPES" 
                   WHERE UPPER(name || '')=$1`,
            values: [name.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createOutputType = async (outputType: OutputTypeStorage) => {
    if (outputType) {
        const query = {
            text: `
                   INSERT INTO public."OUTPUTTYPES" (id,name)
                   VALUES ($1, $2)`,
            values: [
                outputType.id,
                outputType.name
            ]
        }
        await pool.query(query)
    }
}

export const updateOutputTypeById = async (outputType: OutputTypeStorage) => {
    if (outputType && outputType.id) {
        const query = {
            text: `
                    UPDATE public."OUTPUTTYPES" SET
                    name=$1
                    WHERE id=$2`,
            values: [
                outputType.name,
                outputType.id
            ]
        }
        await pool.query(query)
    }
}

export const getDataForDropDownList = async (): Promise<DropDownListRow[]> => {
    const text = `
                  SELECT id, SUBSTRING(name FROM 1 FOR 25) AS value
                  FROM public."OUTPUTTYPES"
                  ORDER BY name`
    const result = await pool.query<DropDownListRow>(text)
    return result.rows
}

export const getOutputTypes = async () => {
    const query = `
                    SELECT id, name
                    FROM "OUTPUTTYPES"`
    const result = await pool.query<OutputTypeStorage>(query)
    return result.rows
}


export const getOutputTypeById = async (id: string): Promise<OutputTypeStorage | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT id, name
                  FROM public."OUTPUTTYPES"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<OutputTypeStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const deleteOutputTypeById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."OUTPUTTYPES"
                   WHERE id=$1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla OUTPUTTYPES */
export const hasDependents = async (outputTypeId: string) => {
    if (outputTypeId) {
        const query = {
            text: `
                    SELECT outputtype_id
                    FROM public."OUTPUTS"
                    WHERE outputtype_id=$1`,
            values: [outputTypeId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
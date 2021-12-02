import pool from '../connectDb'
import { BankStorage } from '../types/bank'
import * as config from '../config'
import DropDownListRow from '../types/DropDownListRow'

export const areUniqueConstraintsValid = async (
    id: string,
    name: string
) => {
    if (id && name) {
        const query = {
            text: `
                   SELECT id
                   FROM public."BANKS" 
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
                   FROM public."BANKS" 
                   WHERE UPPER(name || '')=$1`,
            values: [name.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createBank = async (bank: BankStorage) => {
    if (bank) {
        const query = {
            text: `
                   INSERT INTO public."BANKS" (id,name, observation)
                   VALUES ($1, $2, $3)`,
            values: [
                bank.id,
                bank.name,
                bank.observation
            ]
        }
        await pool.query(query)
    }
}

export const updateBankById = async (bank: BankStorage) => {
    if (bank && bank.id) {
        const query = {
            text: `
                    UPDATE public."BANKS" SET
                    name=$1,
                    observation=$2
                    WHERE id=$3`,
            values: [
                bank.name,
                bank.observation,
                bank.id
            ]
        }
        await pool.query(query)
    }
}

export const getBanks = async () => {
    const query = `
                    SELECT id, name, observation
                    FROM "BANKS"`
    const result = await pool.query<BankStorage>(query)
    return result.rows
}

export const getDataForDropDownList = async (): Promise<DropDownListRow[]> => {
    const text = `
                  SELECT id, SUBSTRING(name FROM 1 FOR 25) AS value
                  FROM public."BANKS"
                  ORDER BY name`
    const result = await pool.query<DropDownListRow>(text)
    return result.rows
}

export const getBankById = async (id: string): Promise<BankStorage | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT id, name, observation
                  FROM public."BANKS"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<BankStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const deleteBankById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."BANKS"
                   WHERE id=$1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla BANKS */
export const hasDependents = async (bankId: string) => {
    if (bankId) {
        const query = {
            text: `
                    SELECT bank_id
                    FROM public."OUTPUTS"
                    WHERE bank_id=$1`,
            values: [bankId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
import pool from '../connectDb'
import { OutputStorage, OutputsQueryBodyStorage } from '../types/output'

export const isIdUnique = async (
    id: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."OUTPUTS" 
                   WHERE UPPER(id || '')=$1`,
            values: [id.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createOutput = async (output: OutputStorage) => {
    if (output) {
        const query = {
            text: `
                   INSERT INTO public."OUTPUTS" (
                       id,
                       bank_id,
                       date,
                       value,
                       operation,
                       outputtype_id,
                       freight_id,
                       observation,
                       user_id)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            values: [
                output.id,
                output.bankId,
                output.date,
                output.value,
                output.operation,
                output.outputTypeId,
                output.freightId,
                output.observation,
                output.userId
            ]
        }
        await pool.query(query)
    }
}

export const updateOutputById = async (output: OutputStorage) => {
    if (output && output.id) {
        const query = {
            text: `
                    UPDATE public."OUTPUTS" SET
                       bank_id=$1,
                       date=$2,
                       value=$3,
                       operation=$4,
                       outputtype_id=$5,
                       freight_id=$6,
                       observation=$7,
                       user_id=$8
                    WHERE id=$9`,
            values: [
                output.bankId,
                output.date,
                output.value,
                output.operation,
                output.outputTypeId,
                output.freightId,
                output.observation,
                output.userId,
                output.id
            ]
        }
        await pool.query(query)
    }
}

export const getOutputsByQuery = async (
    queryBody: OutputsQueryBodyStorage
) => {
    const query = {
        text: `
                    SELECT 
                        "O".id,
                        "B".name "bankName",
                        TO_CHAR("O".date, 'DD/MM/YY') "date",
                        "O".value,
                        "O".operation,
                        "OT".name "outputTypeName",
                        "F"."formattedId" "freightFormattedId",
                        "O".observation,
                        ("U".name || '' || "U".lastname) "userFullName"
                    FROM 
                        "OUTPUTS" "O" 
                        INNER JOIN "BANKS" "B" ON "O".bank_id = "B".id 
                        INNER JOIN "OUTPUTTYPES" "OT" ON "O".outputtype_id = "OT".id 
                        LEFT JOIN "FREIGHTS" "F" ON "O".freight_id = "F".id 
                        LEFT JOIN "USERS" "U" ON "O".user_id = "U".id 
                    WHERE 
                        "O".bank_id=$1 AND 
                        "O".date BETWEEN $2 AND $3
                    ORDER BY "O".date`,
        values: [
            queryBody.bankId,
            queryBody.dateStart,
            queryBody.dateEnd
        ]
    }

    const result = await pool.query(query)
    return result.rows
}


export const getOutputById = async (id: string): Promise<OutputStorage | null> => {
    if (id) {
        const query = {
            text: `
                    SELECT 
                        "O".id,
                        "O".bank_id "bankId",
                        "B".name "bankName",
                        TO_CHAR("O".date, 'yyyy-MM-dd') "date",
                        "O".value,
                        "O".operation,
                        "O".outputtype_id "outputTypeId",
                        "O"."freight_id" "freightId",
                        "F"."formattedId" "freightFormattedId",
                        "O".observation,
                        "O".user_id
                    FROM public."OUTPUTS" "O"
                         LEFT JOIN "FREIGHTS" "F" ON "O".freight_id = "F".id
                         INNER JOIN "BANKS" "B" ON "O".bank_id = "B".id
                    WHERE "O".id=$1`,
            values: [id]
        }
        const result = await pool.query<OutputStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getDepositsByFreights = async (
    freightIdList: string[]
) => {
    if (freightIdList) {
        const query = {
            text: `
                    SELECT SUM(value) "deposits"
                    FROM "OUTPUTS"
                    WHERE freight_id = ANY ($1)`,
            values: [freightIdList]
        }
        const result = await pool.query(query)
        return result.rowCount ? result.rows[0].deposits : 0
    }
}

const getDepositsByFreight = async (
    freightId: string
) => {
    if (freightId) {
        const query = {
            text: `
                    SELECT SUM(value) "deposits"
                    FROM "OUTPUTS"
                    WHERE freight_id=$1`,
            values: [freightId]
        }
        const result = await pool.query(query)
        return result.rowCount ? result.rows[0].deposits : 0
    }
}

export const getOutputsByFreight = async (
    freightId: string
) => {
    if (freightId) {
        const query = {
            text: `
                    SELECT 
                        "O".id,
                        "B".name "bankName",
                        TO_CHAR("O".date, 'DD/MM/YY') "date",
                        "O".value,
                        "O".operation,
                        "OT".name "outputTypeName",
                        "F"."formattedId" "freightFormattedId",
                        "O".observation,
                        ("U".name || '' || "U".lastname) "userFullName"
                    FROM         
                        "OUTPUTS" "O" 
                        INNER JOIN "BANKS" "B" ON "O".bank_id = "B".id 
                        INNER JOIN "OUTPUTTYPES" "OT" ON "O".outputtype_id = "OT".id 
                        LEFT JOIN "FREIGHTS" "F" ON "O".freight_id = "F".id 
                        LEFT JOIN "USERS" "U" ON "O".user_id = "U".id 
                    WHERE 
                        "O".freight_id = $1
                    ORDER BY "O".date`,
            values: [freightId]
        }
        const result = await pool.query(query)
        const allDeposits = await getDepositsByFreight(freightId)

        return {
            rows: result.rows,
            allDeposits
        }
    }
}

export const deleteOutputById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."OUTPUTS"
                   WHERE id=$1`,
            values: [id]
        }
        await pool.query(query)
    }
}
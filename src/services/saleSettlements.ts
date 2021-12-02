import pool from '../connectDb'
import SaleSettlementsStorage, { SaleSettlementsQueryBodyStorage } from '../types/saleSettlements'

export const isIdUnique = async (
    id: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."SALESETTLEMENTS" 
                   WHERE UPPER(id || '')=$1`,
            values: [id.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createSaleSettlement = async (
    saleSettlements: SaleSettlementsStorage
) => {
    if (saleSettlements) {
        const query = {
            text: `
                    INSERT INTO "SALESETTLEMENTS" (
                        id,
                        "formattedId",
                        "date",
                        "valueWithoutIgv",
                        client_id,
                        observation,
                        "valueIgv",
                        "valueWithIgv",
                        "invoiceNumber",
                        "invoiceDate"
                    )
                    SELECT 
                        $1,
                        ('V' || TRIM(TO_CHAR(COALESCE(MAX(autoincrement) + 1, 1), '000000'))),
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9
                    FROM "SALESETTLEMENTS"
                    RETURNING "formattedId"`,
            values: [
                saleSettlements.id,
                saleSettlements.date,
                saleSettlements.valueWithoutIgv,
                saleSettlements.clientId,
                saleSettlements.observation,
                saleSettlements.valueIgv,
                saleSettlements.valueWithIgv,
                saleSettlements.invoiceNumber,
                saleSettlements.invoiceDate
            ]
        }
        const result = await pool.query(query)
        return result.rows[0]
    }
}

export const updateSaleSettlementById = async (
    { id, date, invoiceNumber, invoiceDate, observation }: { id: string, date: string, invoiceNumber: string, invoiceDate: string, observation: string },
) => {
    const query = {
        text: `
                    UPDATE public."SALESETTLEMENTS" SET
                        date=$1, 
                        "invoiceNumber"=$2,
                        "invoiceDate"=$3,
                        observation=$4
                    WHERE id=$5`,
        values: [
            date,
            invoiceNumber,
            invoiceDate,
            observation,
            id
        ]
    }
    await pool.query(query)
}

export const getSaleSettlementsByQuery = async (
    query: SaleSettlementsQueryBodyStorage
) => {
    const qry = {
        text: `
                SELECT
                    "S".id,
                    "S"."formattedId",
                    to_char("S"."date", 'dd-MM-yy') "date",
                    "S"."valueWithoutIgv",
                    "C".name "clientName",
                    "S".observation,
                    "S"."valueIgv",
                    "S"."valueWithIgv",
                    "S"."invoiceNumber",
                    to_char("S"."invoiceDate", 'dd-MM-yy') "invoiceDate"
                FROM        
                    "SALESETTLEMENTS" "S"
                    INNER JOIN "CLIENTS" "C" ON "S".client_id = "C".id
                WHERE
                    "S"."date" BETWEEN $1 AND $2
                ORDER BY "S"."date"`,
        values: [
            query.dateStart,
            query.dateEnd
        ]
    }
    const result = await pool.query(qry)
    return result.rows
}

export const getSaleSettlementById = async (
    id: string
): Promise<SaleSettlementsStorage | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT 
                    "S".id,
                    "S"."formattedId",
                    to_char("S"."date", 'yyyy-MM-dd') "date",
                    "S"."valueWithoutIgv",
                    "S".client_id "clientId",
                    "C".name "clientName",
                    "S".observation,
                    "S"."valueIgv",
                    "S"."valueWithIgv",
                    "S"."invoiceNumber",
                    to_char("S"."invoiceDate", 'yyyy-MM-dd') "invoiceDate"
                  FROM 
                    "SALESETTLEMENTS" "S"
                    INNER JOIN "CLIENTS" "C" ON "S".client_id = "C".id
                  WHERE "S".id=$1`,
            values: [id]
        }
        const result = await pool.query<SaleSettlementsStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const deleteSaleSettlementById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."SALESETTLEMENTS"
                   WHERE id=$1`,
            values: [id]
        }
        await pool.query(query)
    }
}

export const hasDependents = async (saleSettlementId: string) => {
    if (saleSettlementId) {
        const query = {
            text: `
                    SELECT "saleSettlement_id"
                    FROM public."SALESETTLEMENTSDETAILS"
                    WHERE "saleSettlement_id"=$1`,
            values: [saleSettlementId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
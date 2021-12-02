import pool from '../connectDb'
import { ExpenseSettlementStorage, ExpenseSettlementsQueryBodyStorage } from '../types/expenseSettlement'

export const areUniqueConstraintsValid = async (
    id: string
) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."EXPENSESETTLEMENTS" 
                   WHERE 
                    UPPER(id || '')=$1`,
            values: [id.trim().toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createExpenseSettlement = async (
    expenseSettlement: ExpenseSettlementStorage
) => {
    if (expenseSettlement) {
        const query = {
            text: `
                    INSERT INTO "EXPENSESETTLEMENTS" (
                        id,
                        "formattedId",
                        toll,
                        viatic,
                        load,
                        unload,
                        garage,
                        washed,
                        tire,
                        mobility,
                        other,
                        "otherDetail",
                        total,
                        observation,
                        "datePresentation",
                        deposits,
                        "favorsTheCompany",
                        residue,
                        cancelled
                        )
                    SELECT 
                        $1,
                        ('L' || TRIM(TO_CHAR(COALESCE(MAX(autoincrement) + 1, 1), '000000'))),
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10,
                        $11,
                        $12,
                        $13,
                        $14,
                        $15,
                        $16,
                        $17,
                        $18
                    FROM "EXPENSESETTLEMENTS"
                    RETURNING "formattedId"`,
            values: [
                expenseSettlement.id,
                expenseSettlement.toll,
                expenseSettlement.viatic,
                expenseSettlement.load,
                expenseSettlement.unload,
                expenseSettlement.garage,
                expenseSettlement.washed,
                expenseSettlement.tire,
                expenseSettlement.mobility,
                expenseSettlement.other,
                expenseSettlement.otherDetail,
                expenseSettlement.total,
                expenseSettlement.observation,
                expenseSettlement.datePresentation,
                expenseSettlement.deposits,
                expenseSettlement.favorsTheCompany,
                expenseSettlement.residue,
                expenseSettlement.cancelled
            ]
        }
        const result = await pool.query(query)
        return result.rows[0]
    }
}

export const updateExpenseSettlement = async (
    expenseSettlement: ExpenseSettlementStorage
) => {
    if (expenseSettlement && expenseSettlement.id) {
        const query = {
            text: `
                    UPDATE public."EXPENSESETTLEMENTS" SET
                        toll=$1,
                        viatic=$2,
                        load=$3,
                        unload=$4,
                        garage=$5,
                        washed=$6,
                        tire=$7,
                        mobility=$8,
                        other=$9,
                        "otherDetail"=$10,
                        total=$11,
                        observation=$12,
                        "datePresentation"=$13,
                        deposits=$14,
                        "favorsTheCompany"=$15,
                        residue=$16,
                        cancelled=$17
                    WHERE id=$18`,
            values: [
                expenseSettlement.toll,
                expenseSettlement.viatic,
                expenseSettlement.load,
                expenseSettlement.unload,
                expenseSettlement.garage,
                expenseSettlement.washed,
                expenseSettlement.tire,
                expenseSettlement.mobility,
                expenseSettlement.other,
                expenseSettlement.otherDetail,
                expenseSettlement.total,
                expenseSettlement.observation,
                expenseSettlement.datePresentation,
                expenseSettlement.deposits,
                expenseSettlement.favorsTheCompany,
                expenseSettlement.residue,
                expenseSettlement.cancelled,
                expenseSettlement.id
            ]
        }
        await pool.query(query)
    }
}
//llevar a servicios y  controlador flete y terminar de crear el enrutador de liquidacipm de gasstps


export const getExpenseSettlementsByQuery = async (
    query: ExpenseSettlementsQueryBodyStorage
) => {
    const qry = {
        text: `
                SELECT
                    "E".id,
                    "F"."formattedId" "freightFormattedId",
                    "E"."formattedId" "expenseSettlementFormattedId",
                    "R"."name" "routeName",
                    SUBSTRING("C"."name",1,15) "clientName",
                    "UT"."licensePlate" "truckTractorLicensePlate",
                    "US"."licensePlate" "semiTrailerLicensePlate",
                    SUBSTRING(("D"."name" || ' ' || "D"."lastname"),1,15) as "driverFullName",
                    SUBSTRING("T"."name",1,15) "transportName",
                    TO_CHAR("F"."dateStart", 'DD/MM/YY') "dateStart",
                    TO_CHAR("F"."dateEnd", 'DD/MM/YY') "dateEnd",
                    "S"."name" "serviceName",
                    TO_CHAR("E"."datePresentation", 'DD/MM/YY') "datePresentation",
                    "E".toll,
                    "E".viatic,
                    "E".load,
                    "E".unload,
                    "E".garage,
                    "E".washed,
                    "E".tire,
                    "E".mobility,
                    "E".other,
                    "E"."otherDetail",
                    "E".total,
                    "E".deposits,
                    "E"."favorsTheCompany",
                    "E".residue,
                    "E".cancelled,
                    "E".observation
                FROM        
                    "FREIGHTS" "F"
                    LEFT JOIN "EXPENSESETTLEMENTS" "E" ON "F"."expenseSettlement_id" = "E".id
                    INNER JOIN "CLIENTS" "C" ON "F".client_id = "C".id
                    INNER JOIN "ROUTES" "R" ON "F".route_id = "R".id
                    INNER JOIN "UNITS" "UT" ON "F"."truckTractor_unit_id" = "UT".id
                    INNER JOIN "UNITS" "US" ON "F"."semiTrailer_unit_id" = "US".id
                    INNER JOIN "DRIVERS" "D" ON "F".driver_id = "D".id
                    INNER JOIN "SERVICES" "S" ON "F".service_id = "S".id
                    INNER JOIN "TRANSPORTS" "T" ON "F".transport_id = "T".id
                WHERE
                    "F"."expenseSettlement_id" ${query.liquidated === 'true' ? 'IS NOT NULL' : 'IS NULL'}
                    AND (
                        "F"."dateStart" BETWEEN $1
                        AND $2
                    )
                ORDER BY "F"."dateStart"`,
        values: [
            query.dateStart,
            query.dateEnd
        ]
    }

    const result = await pool.query(qry)
    return result.rows
}

export const getExpenseSettlementById = async (
    id: string
): Promise<ExpenseSettlementStorage | null> => {
    if (id) {
        const query = {
            text: `
                    SELECT
                        id,
                        "formattedId",
                        toll,
                        viatic,
                        load,
                        unload,
                        garage,
                        washed,
                        tire,
                        mobility,
                        other,
                        "otherDetail",
                        total,
                        observation,
                        TO_CHAR("datePresentation", 'yyyy-MM-dd') "datePresentation",
                        deposits,
                        "favorsTheCompany",
                        residue,
                        cancelled
                    FROM "EXPENSESETTLEMENTS"
                    WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<ExpenseSettlementStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const deleteExpenseSettlementById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."EXPENSESETTLEMENTS"
                   WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla EXPENSESETTLEMETS */
export const hasDependents = async (freightId: string) => {
    if (freightId) {
        const query = {
            text: `
                    SELECT "expenseSettlement_id"
                    FROM public."FREIGHTS"
                    WHERE "expenseSettlement_id"=$1
                    UNION
                    SELECT "expenseSettlement_id"
                    FROM public."FUELCYCLES"
                    WHERE "expenseSettlement_id"=$1`,
            values: [freightId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
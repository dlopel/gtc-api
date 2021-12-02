import pool from '../connectDb'
import { CompressedFreight, CompressedFreightsQueryBodyStorage, FreightStorage, FreightsNotLiquidatedQueryBodyStorage, ClientFreightsQueryBodyStorage } from '../types/freight'
import { PaginatedResponse } from '../types/PaginatedResponse'
import * as config from '../config'

export const areUniqueConstraintsValid = async (
    id: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."FREIGHTS" 
                   WHERE UPPER(id || '')=$1`,
            values: [id.trim().toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createFreight = async (freight: FreightStorage) => {
    if (freight) {
        const query = {
            text: `
            INSERT INTO "FREIGHTS" (
                id,
                "formattedId",
                "dateStart",
                "dateEnd",
                grt,
                grr,
                ton,
                pallet,
                route_id,
                "truckTractor_unit_id",
                driver_id,
                transport_id,
                client_id,
                service_id,
                observation,
                "semiTrailer_unit_id")
            SELECT 
                $1,
                ('F' || TRIM(TO_CHAR(COALESCE(MAX(autoincrement) + 1, 1), '000000'))),
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
                $15
            FROM "FREIGHTS"`,
            values: [
                freight.id,
                freight.dateStart,
                freight.dateEnd,
                freight.grt,
                freight.grr,
                freight.ton,
                freight.pallet,
                freight.routeId,
                freight.truckTractorId,
                freight.driverId,
                freight.transportId,
                freight.clientId,
                freight.serviceId,
                freight.observation,
                freight.semiTrailerId
            ]
        }
        await pool.query(query)
    }
}

export const updateFreight = async (freight: FreightStorage) => {
    if (freight && freight.id) {
        const query = {
            text: `
                    UPDATE public."FREIGHTS" SET
                    "dateStart"=$1,
                    "dateEnd"=$2,
                    "grt"=$3,
                    grr=$4,
                    ton=$5,
                    pallet=$6,
                    route_id=$7,
                    "truckTractor_unit_id"=$8,
                    driver_id=$9,
                    transport_id=$10,
                    client_id=$11,
                    service_id=$12,
                    observation=$13,
                    "semiTrailer_unit_id"=$14
                    WHERE id=$15`,
            values: [
                freight.dateStart,
                freight.dateEnd,
                freight.grt,
                freight.grr,
                freight.ton,
                freight.pallet,
                freight.routeId,
                freight.truckTractorId,
                freight.driverId,
                freight.transportId,
                freight.clientId,
                freight.serviceId,
                freight.observation,
                freight.semiTrailerId,
                freight.id
            ]
        }
        await pool.query(query)
    }
}

export const updateFreightsExpenseSettlement = async (
    freightIdList: string[],
    expenseSettlementId: string
) => {
    if (freightIdList.length && (expenseSettlementId === null || expenseSettlementId)) {
        const query = {
            text: `
                    UPDATE "FREIGHTS" 
                    SET
                        "expenseSettlement_id"=$1
                    WHERE id = ANY ($2)`,
            values: [
                expenseSettlementId,
                freightIdList
            ]
        }
        await pool.query(query)
    }
}

export const getFreightByFormattedId = async (
    formattedId: string
): Promise<FreightStorage | null> => {
    if (formattedId) {
        const query = {
            text: `
                    SELECT
                    id,
                    "formattedId",
                    TO_CHAR("dateStart", 'YYYY-MM-DD') AS "dateStart",
                    TO_CHAR("dateEnd", 'YYYY-MM-DD') AS "dateEnd",
                    grt,
                    grr,
                    ton,
                    pallet::text,
                    route_id AS "routeId",
                    "truckTractor_unit_id" AS "truckTractorId",
                    "semiTrailer_unit_id" AS "semiTrailerId",
                    driver_id  AS "driverId",
                    transport_id  AS "transportId",
                    client_id  AS "clientId",
                    service_id  AS "serviceId",
                    observation
                    FROM public."FREIGHTS"
                    WHERE "formattedId"=$1`,
            values: [formattedId]
        }
        const result = await pool.query<FreightStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getFreightsNotLiquidatedByQuery = async (
    query: FreightsNotLiquidatedQueryBodyStorage
) => {
    const qry = {
        text: `
                SELECT
                    "F".id,
                    "F"."formattedId",
                    TO_CHAR("F"."dateStart", 'DD/MM/YY') "dateStart",
                    TO_CHAR("F"."dateEnd", 'DD/MM/YY') "dateEnd",
                    "R"."name" "routeName",
                    "UT"."licensePlate" "truckTractorLicensePlate",
                    "US"."licensePlate" "semiTrailerLicensePlate",
                    SUBSTRING(("D"."name" || ' ' || "D"."lastname"),1,15) as "driverFullName",
                    SUBSTRING("T"."name",1,15) "transportName",
                    SUBSTRING("C"."name",1,15) "clientName",
                    "S"."name" "serviceName"
                FROM        
                    "FREIGHTS" "F"
                    INNER JOIN "CLIENTS" "C" ON "F".client_id = "C".id
                    INNER JOIN "ROUTES" "R" ON "F".route_id = "R".id
                    INNER JOIN "UNITS" "UT" ON "F"."truckTractor_unit_id" = "UT".id
                    INNER JOIN "UNITS" "US" ON "F"."semiTrailer_unit_id" = "US".id
                    INNER JOIN "DRIVERS" "D" ON "F".driver_id = "D".id
                    INNER JOIN "SERVICES" "S" ON "F".service_id = "S".id
                    INNER JOIN "TRANSPORTS" "T" ON "F".transport_id = "T".id
                WHERE
                    "F"."expenseSettlement_id" IS NULL
                    AND "F".transport_id=$1
                    AND "F".driver_id=$2
                    AND (
                        "F"."dateStart" BETWEEN $3
                        AND $4
                    )
                ORDER BY "F"."dateStart"`,
        values: [
            query.transportId,
            query.driverId,
            query.dateStart,
            query.dateEnd
        ]
    }

    const result = await pool.query(qry)
    return result.rows
}

export const getClientFreightsByQuery = async (
    queryBody: ClientFreightsQueryBodyStorage
) => {
    const query = {
        text: `
                SELECT
                    "F".id,
                    "F"."formattedId" "freightFormattedId",
                    TO_CHAR("F"."dateStart", 'DD/MM/YY') "dateStart",
                    TO_CHAR("F"."dateEnd", 'DD/MM/YY') "dateEnd",
                    "R"."name" "routeName",
                    "F"."ton",
                    "F"."grt",
                    "F"."grr",
                    "UT"."licensePlate" "truckTractorLicensePlate",
                    "US"."licensePlate" "semiTrailerLicensePlate",
                    SUBSTRING(("D"."name" || ' ' || "D"."lastname"),1,15) "driverFullName",
                    SUBSTRING("T"."name",1,15) "transportName",
                    SUBSTRING("C"."name",1,15) "clientName",
                    "F"."client_id" "clientId",
                    "S"."name" "serviceName",
                    "R".value "valueWithoutIgv",
                    coalesce("SD"."valueAdditionalWithoutIgv", 0)::text "valueAdditionalWithoutIgv",
                    "SD"."valueAdditionalDetail",
                    "SD".observation,
                    "F".observation
                FROM        
                    "FREIGHTS" "F"
                    LEFT JOIN "SALESETTLEMENTSDETAILS" "SD" ON "F".id = "SD".freight_id
                    INNER JOIN "CLIENTS" "C" ON "F".client_id = "C".id
                    INNER JOIN "ROUTES" "R" ON "F".route_id = "R".id
                    INNER JOIN "UNITS" "UT" ON "F"."truckTractor_unit_id" = "UT".id
                    INNER JOIN "UNITS" "US" ON "F"."semiTrailer_unit_id" = "US".id
                    INNER JOIN "DRIVERS" "D" ON "F".driver_id = "D".id
                    INNER JOIN "SERVICES" "S" ON "F".service_id = "S".id
                    INNER JOIN "TRANSPORTS" "T" ON "F".transport_id = "T".id
                WHERE
                    "SD".id IS ${queryBody.liquidated ? 'NOT NULL' : 'NULL'}
                    AND "F".client_id=$1
                    AND "F"."dateStart" BETWEEN $2 AND $3
                ORDER BY "F"."dateStart"`,
        values: [
            queryBody.clientId,
            queryBody.dateStart,
            queryBody.dateEnd
        ]
    }

    const result = await pool.query(query)
    return result.rows
}

export const getFreightsByExpenseSettlement = async (
    expenseSettlementId: string
) => {
    if (expenseSettlementId) {
        const query = {
            text: `
                    SELECT
                        "F".id,
                        "F"."formattedId",
                        TO_CHAR("F"."dateStart", 'DD/MM/YY') "dateStart",
                        TO_CHAR("F"."dateEnd", 'DD/MM/YY') "dateEnd",
                        "R"."name" "routeName",
                        "UT"."licensePlate" "truckTractorLicensePlate",
                        "US"."licensePlate" "semiTrailerLicensePlate",
                        SUBSTRING(("D"."name" || ' ' || "D"."lastname"),1,15) as "driverFullName",
                        SUBSTRING("T"."name",1,15) "transportName",
                        SUBSTRING("C"."name",1,15) "clientName",
                        "S"."name" "serviceName"
                    FROM        
                        "FREIGHTS" "F"
                        INNER JOIN "CLIENTS" "C" ON "F".client_id = "C".id
                        INNER JOIN "ROUTES" "R" ON "F".route_id = "R".id
                        INNER JOIN "UNITS" "UT" ON "F"."truckTractor_unit_id" = "UT".id
                        INNER JOIN "UNITS" "US" ON "F"."semiTrailer_unit_id" = "US".id
                        INNER JOIN "DRIVERS" "D" ON "F".driver_id = "D".id
                        INNER JOIN "SERVICES" "S" ON "F".service_id = "S".id
                        INNER JOIN "TRANSPORTS" "T" ON "F".transport_id = "T".id
                    WHERE
                        "F"."expenseSettlement_id"=$1
                    ORDER BY "F"."dateStart"`,
            values: [
                expenseSettlementId
            ]
        }
        const result = await pool.query(query)
        return result.rows
    }
}

export const getPaginationOfCompressedFreights = async (
    queryBody: CompressedFreightsQueryBodyStorage
) => {

    const queryRowCount = {
        text: `
                SELECT count("F".id) AS "totalRows"
                FROM
                      public."FREIGHTS" AS "F"
                      INNER JOIN public."CLIENTS" AS "C" ON "F".client_id = "C".id
                      INNER JOIN public."ROUTES" AS "R" ON "F".route_id = "R".id
                      INNER JOIN public."UNITS" AS "UT" ON "F"."truckTractor_unit_id" = "UT".id
                      INNER JOIN public."UNITS" AS "US" ON "F"."semiTrailer_unit_id" = "US".id
                      INNER JOIN public."DRIVERS" AS "D" ON "F".driver_id = "D".id
                      INNER JOIN public."SERVICES" AS "S" ON "F".service_id = "S".id
                      INNER JOIN public."TRANSPORTS" AS "T" ON "F".transport_id = "T".id
                WHERE 
                      UPPER("F"."formattedId" || '') LIKE $1 AND
                      UPPER("R".name || '') LIKE $2 AND
                      UPPER("UT"."licensePlate" || '') LIKE $3 AND
                      UPPER("US"."licensePlate" || '') LIKE $4 AND
                      UPPER("D".name || ' ' || "D".lastname || '') LIKE $5 AND
                      UPPER("F".transport_id || '') LIKE $6 AND
                      UPPER("F".client_id || '') LIKE $7 AND
                      UPPER("F".service_id || '') LIKE $8 AND
                      UPPER(COALESCE(grt,'')) LIKE $9 AND
                      UPPER(COALESCE(grr,'')) LIKE $10 AND
                      ("F"."dateStart" BETWEEN $11 AND $12)`,
        values: [
            queryBody.formattedId,
            queryBody.routeName,
            queryBody.truckTractorLicensePlate,
            queryBody.semiTrailerLicensePlate,
            queryBody.driverFullName,
            queryBody.transportId,
            queryBody.clientId,
            queryBody.serviceId,
            queryBody.grt,
            queryBody.grr,
            queryBody.dateStart,
            queryBody.dateEnd
        ]
    }

    const rowCountResult = await pool.query(queryRowCount)
    const totalRows: number = parseInt(rowCountResult.rows[0].totalRows)
    const limitPerPage = config.LIMIT_PER_PAGE
    const totalPages: number = Math.ceil(totalRows / limitPerPage)
    const offset: number = ((queryBody.page as number) - 1) * limitPerPage

    const queryData = {
        text: `
               SELECT
               "F"."id",
               "F"."formattedId",
               TO_CHAR("F"."dateStart", 'DD/MM/YY') AS "dateStart",
               TO_CHAR("F"."dateEnd", 'DD/MM/YY') AS "dateEnd",
               "F".ton,
               "F"."grt",
               "F"."grr",
               "R"."name" AS "routeName",
               "UT"."licensePlate" AS "truckTractorLicensePlate",
               "US"."licensePlate" AS "semiTrailerLicensePlate",
               SUBSTRING(("D"."name" || ' ' || "D"."lastname"),1,15) as "driverFullName",
               SUBSTRING("T"."name",1,15) AS "transportName",
               SUBSTRING("C"."name",1,15) AS "clientName",
               "S"."name" AS "serviceName"
               FROM
               public."FREIGHTS" AS "F"
               INNER JOIN public."CLIENTS" AS "C" ON "F".client_id = "C".id
               INNER JOIN public."ROUTES" AS "R" ON "F".route_id = "R".id
               INNER JOIN public."UNITS" AS "UT" ON "F"."truckTractor_unit_id" = "UT".id
               INNER JOIN public."UNITS" AS "US" ON "F"."semiTrailer_unit_id" = "US".id
               INNER JOIN public."DRIVERS" AS "D" ON "F".driver_id = "D".id
               INNER JOIN public."SERVICES" AS "S" ON "F".service_id = "S".id
               INNER JOIN public."TRANSPORTS" AS "T" ON "F".transport_id = "T".id
               WHERE
               UPPER("F"."formattedId" || '') LIKE $1
               AND UPPER("R".name || '') LIKE $2
               AND UPPER("UT"."licensePlate" || '') LIKE $3
               AND UPPER("US"."licensePlate" || '') LIKE $4
               AND UPPER("D".name || ' ' || "D".lastname || '') LIKE $5
               AND UPPER("F".transport_id || '') LIKE $6
               AND UPPER("F".client_id || '') LIKE $7
               AND UPPER("F".service_id || '') LIKE $8
               AND UPPER(COALESCE(grt,'')) LIKE $9
               AND UPPER(COALESCE(grr,'')) LIKE $10
               AND (
                   "F"."dateStart" BETWEEN $11
                   AND $12
               )
               ORDER BY "F"."dateStart", "C"."name", "T"."name", "D"."lastname"
               OFFSET $13 ROWS
               FETCH FIRST $14 ROWS ONLY`,
        values: [
            queryBody.formattedId,
            queryBody.routeName,
            queryBody.truckTractorLicensePlate,
            queryBody.semiTrailerLicensePlate,
            queryBody.driverFullName,
            queryBody.transportId,
            queryBody.clientId,
            queryBody.serviceId,
            queryBody.grt,
            queryBody.grr,
            queryBody.dateStart,
            queryBody.dateEnd,
            offset,
            limitPerPage
        ]
    }
    const queryDataResult = await pool.query<CompressedFreight>(queryData)

    const response: PaginatedResponse<CompressedFreight> = {
        rows: queryDataResult.rows,
        totalRows,
        totalPages,
        limitPerPage,
        currentPage: queryBody.page as number,
        nextPage: queryBody.page >= 1 && queryBody.page < totalPages ? (queryBody.page as number) + 1 : null,
        prevPage: queryBody.page > 1 && queryBody.page <= totalPages ? (queryBody.page as number) - 1 : null
    }

    return response
}

export const getFreightById = async (id: string): Promise<FreightStorage | null> => {
    if (id) {
        const query = {
            text: `
                    SELECT
                    id,
                    "formattedId",
                    TO_CHAR("dateStart", 'YYYY-MM-DD') AS "dateStart",
                    TO_CHAR("dateEnd", 'YYYY-MM-DD') AS "dateEnd",
                    grt,
                    grr,
                    ton,
                    pallet::text,
                    route_id AS "routeId",
                    "truckTractor_unit_id" AS "truckTractorId",
                    "semiTrailer_unit_id" AS "semiTrailerId",
                    driver_id  AS "driverId",
                    transport_id  AS "transportId",
                    client_id  AS "clientId",
                    service_id  AS "serviceId",
                    observation
                    FROM public."FREIGHTS"
                    WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<FreightStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const deleteFreightById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."FREIGHTS"
                   WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla FREIGHTS */
export const hasDependents = async (freightId: string) => {
    if (freightId) {
        const query = {
            text: `
                    SELECT freight_id
                    FROM public."SALESETTLEMENTS"
                    WHERE freight_id=$1
                    UNION
                    SELECT freight_id
                    FROM public."PURCHASESETTLEMENTS"
                    WHERE freight_id=$1
                    UNION
                    SELECT freight_id
                    FROM public."FREIGHTS_PRODUCTS"
                    WHERE freight_id=$1
                    UNION
                    SELECT freight_id
                    FROM public."OUTPUTS"
                    WHERE freight_id=$1
                    UNION
                    SELECT freight_id
                    FROM public."FREIGHTS_SETTLEMENTEXPENSES"
                    WHERE freight_id=$1`,
            values: [freightId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
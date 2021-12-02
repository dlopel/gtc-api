import pool from '../connectDb'
import SaleSettlementDetailStorage from '../types/saleSettlementDetail'
import pgformat from 'pg-format'

export const isIdUnique = async (
    id: string
) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."SALESETTLEMENTSDETAILS" 
                   WHERE UPPER(id || '')=$1`,
            values: [id.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const areIDsUnique = async (
    idList: string[]
) => {
    if (Array.isArray(idList)) {
        const text = `
                      SELECT id
                      FROM public."SALESETTLEMENTSDETAILS" 
                      WHERE id IN (%L)`
        const query = pgformat(text, idList)
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createBatch = async (
    saleSettlementDetailList: SaleSettlementDetailStorage[]
) => {

    if (Array.isArray(saleSettlementDetailList)) {

        const nestedList = saleSettlementDetailList.map(saleSettlementDetail => {
            return [
                saleSettlementDetail.id,
                saleSettlementDetail.freightId,
                saleSettlementDetail.valueWithoutIgv,
                saleSettlementDetail.valueAdditionalWithoutIgv,
                saleSettlementDetail.valueAdditionalDetail,
                saleSettlementDetail.observation,
                saleSettlementDetail.saleSettlementId,
            ]
        })
       
        const text = `
                    INSERT INTO "SALESETTLEMENTSDETAILS" (
                        id,
                        freight_id,
                        "valueWithoutIgv",
                        "valueAdditionalWithoutIgv",
                        "valueAdditionalDetail",
                        observation,
                        "saleSettlement_id"
                    )
                    VALUES %L`
        const query = pgformat(text, nestedList)
        await pool.query(query)
    }
}

export const createSaleSettlementDetail = async (
    saleSettlementDetail: SaleSettlementDetailStorage
) => {
    if (saleSettlementDetail) {
        const query = {
            text: `
                    INSERT INTO "SALESETTLEMENTSDETAILS" (
                        id,
                        freight_id,
                        "valueWithoutIgv",
                        "valueAdditionalWithoutIgv",
                        "valueAdditionalDetail",
                        observation,
                        "saleSettlement_id"
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            values: [
                saleSettlementDetail.id,
                saleSettlementDetail.freightId,
                saleSettlementDetail.valueWithoutIgv,
                saleSettlementDetail.valueAdditionalWithoutIgv,
                saleSettlementDetail.valueAdditionalDetail,
                saleSettlementDetail.observation,
                saleSettlementDetail.saleSettlementId,
            ]
        }
        await pool.query(query)
    }
}

export const getBatchBySaleSettlement = async (
    saleSettlementId: string
) => {
    const query = {
        text: `
            SELECT
                "SD".id,
                "F"."formattedId" "freightFormattedId",
                "R"."name" "routeName",
                SUBSTRING("C"."name",1,15) "clientName",
                "UT"."licensePlate" "truckTractorLicensePlate",
                "US"."licensePlate" "semiTrailerLicensePlate",
                ("D"."name" || ', ' || "D"."lastname") as "driverFullName",
                "T"."name" "transportName",
                TO_CHAR("F"."dateStart", 'DD/MM/YY') "dateStart",
                TO_CHAR("F"."dateEnd", 'DD/MM/YY') "dateEnd",
                "S"."name" "serviceName",
                "F".grt,
                "F".grr,
                "F".ton,
                "F".pallet,
                "SD"."valueWithoutIgv",
                "SD"."valueAdditionalWithoutIgv",
                "SD"."valueAdditionalDetail",
                "SD".observation
            FROM        
                "FREIGHTS" "F"
                INNER JOIN "SALESETTLEMENTSDETAILS" "SD" ON "F"."id" = "SD".freight_id
                INNER JOIN "CLIENTS" "C" ON "F".client_id = "C".id
                INNER JOIN "ROUTES" "R" ON "F".route_id = "R".id
                INNER JOIN "UNITS" "UT" ON "F"."truckTractor_unit_id" = "UT".id
                INNER JOIN "UNITS" "US" ON "F"."semiTrailer_unit_id" = "US".id
                INNER JOIN "DRIVERS" "D" ON "F".driver_id = "D".id
                INNER JOIN "SERVICES" "S" ON "F".service_id = "S".id
                INNER JOIN "TRANSPORTS" "T" ON "F".transport_id = "T".id
            WHERE
                "SD"."saleSettlement_id"=$1        
            ORDER BY "F"."dateStart"`,
        values: [saleSettlementId]
    }
    const result = await pool.query(query)
    return result.rows
}

export const deleteBatchBySaleSettlement = async (
    saleSettlementId: string
) => {
    if (saleSettlementId) {
        const query = {
            text: `
                   DELETE FROM public."SALESETTLEMENTSDETAILS"
                   WHERE "saleSettlement_id"=$1`,
            values: [saleSettlementId]
        }
        await pool.query(query)
    }
}
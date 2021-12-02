import pool from '../connectDb'
import { CompressedRoutesQueryBodyStorage, Route, RouteCompressed } from '../types/route'
import validator from 'validator'
import * as config from '../config'
import transformToCleanString from '../libs/transformToCleanString'
import DropDownListRow from '../types/DropDownListRow'
import { PaginatedResponse } from '../types/PaginatedResponse'

export const isValid = (route: Route): boolean => {

    if (!validator.isUUID(route.id || '', 4)) return false
    if (!validator.matches(route.name || '', /^[a-zA-Z -]{3,100}$/)) return false
    if (!validator.isAlphanumeric(route.addressStart || '', 'en-US', { ignore: ' -/' })) return false
    if (!validator.isLength(route.addressStart || '', { min: 6, max: 300 })) return false
    if (!validator.isAlphanumeric(route.addressEnd || '', 'en-US', { ignore: ' -/' })) return false
    if (!validator.isLength(route.addressEnd || '', { min: 6, max: 300 })) return false
    if (!validator.matches(route.clientStart || '', /^[a-zA-Z /]{3,100}$/)) return false
    if (!validator.matches(route.clientEnd || '', /^[a-zA-Z /]{3,100}$/)) return false
    if (!validator.isUUID(route.clientId || '', 4)) return false
    if (!validator.matches(route.value ? route.value.toString() : '', /^[0-9]{1,5}(\.[0-9]{1,2})?$/)) return false

    //null fields
    if (!validator.isLength(route.observation || 'FOO', { min: 3, max: 1000 })) return false

    return true

}

export const sanitizer = (route: Route): Route => {
    if (route) {
        route.id = transformToCleanString(route.id)
        route.name = transformToCleanString(route.name)
        route.addressStart = transformToCleanString(route.addressStart)
        route.addressEnd = transformToCleanString(route.addressEnd)
        route.clientStart = transformToCleanString(route.clientStart)
        route.clientEnd = transformToCleanString(route.clientEnd)
        route.clientId = transformToCleanString(route.clientId)
        route.value = transformToCleanString(route.value)
        route.observation = route.observation == null ? route.observation : transformToCleanString(route.observation)
    }
    return route
}

export const isNameValid = (name: string) => {
    return validator.matches(name || '', /^[a-zA-Z ]{3,100}$/)
}

export const isIdUnique = async (
    id: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."ROUTES" 
                   WHERE UPPER(id || '')=$1`,
            values: [id.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createRoute = async (route: Route) => {
    if (route) {
        const query = {
            text: `
                   INSERT INTO public."ROUTES"
                   (id,name,"addressStart","addressEnd","clientStart","clientEnd",observation,client_id,value)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            values: [
                route.id,
                route.name,
                route.addressStart,
                route.addressEnd,
                route.clientStart,
                route.clientEnd,
                route.observation,
                route.clientId,
                route.value]
        }
        await pool.query(query)
    }
}

export const updateRouteById = async (route: Route) => {
    if (route && route.id) {
        const query = {
            text: `
                    UPDATE public."ROUTES" SET
                    name=$1,
                    "addressStart"=$2,
                    "addressEnd"=$3,
                    "clientStart"=$4,
                    "clientEnd"=$5,
                    observation=$6,
                    client_id=$7,
                    value=$8
                    WHERE id=$9`,
            values: [
                route.name,
                route.addressStart,
                route.addressEnd,
                route.clientStart,
                route.clientEnd,
                route.observation,
                route.clientId,
                route.value,
                route.id]
        }
        await pool.query(query)
    }
}

export const getPaginationOfCompressedRoutes = async (
    queryBody: CompressedRoutesQueryBodyStorage
) => {

    const queryRowCount = {
        text: `
                SELECT count(id) AS "totalRows"
                FROM public."ROUTES"
                WHERE 
                    UPPER(name || '') LIKE $1 AND
                    UPPER(client_id || '') LIKE $2`,
        values: [queryBody.name, queryBody.clientId]
    }
    
    const rowCountResult = await pool.query(queryRowCount)
    const totalRows = parseInt(rowCountResult.rows[0].totalRows)
    const limitPerPage = config.LIMIT_PER_PAGE
    const totalPages = Math.ceil(totalRows / limitPerPage)
    const offset = ((queryBody.page as number) - 1) * limitPerPage

    // consulta de datos paginados
    const queryData = {
        text: `
                SELECT 
                "R".id,"R".name,"addressStart","addressEnd","clientStart","clientEnd",CAST(value AS DOUBLE PRECISION),"C".name AS "clientName"
                FROM public."ROUTES" AS "R"
                INNER JOIN public."CLIENTS" AS "C" ON "R".client_id="C".id 
                WHERE 
                    UPPER("R".name || '') LIKE $1 AND
                    UPPER("R".client_id || '') LIKE $2
                ORDER BY "R".client_id, "R".name
                OFFSET $3 ROWS
                FETCH FIRST $4 ROWS ONLY`,
        values: [queryBody.name, queryBody.clientId, offset, limitPerPage]
    }
    const queryDataResult = await pool.query<RouteCompressed>(queryData)
    
    const response : PaginatedResponse<RouteCompressed> = {
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

export const getRouteById = async (id: string): Promise<Route | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT
                  id,name,"addressStart","addressEnd","clientStart","clientEnd",observation,client_id AS "clientId", value
                  FROM public."ROUTES"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<Route>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getDataForDropDownListByClient = async (
    clientId: string
): Promise<DropDownListRow[]> => {
    const query = {
        text: `
        SELECT id, name AS value
        FROM public."ROUTES"
        WHERE client_id=$1
        ORDER BY name`,
        values: [clientId]
    }
    const result = await pool.query<DropDownListRow>(query)
    return result.rows
}

export const deleteRouteById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."ROUTES"
                   WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla TRANSPORTS */
export const hasDependents = async (routeId: string) => {
    if (routeId) {
        const query = {
            text: `
                    SELECT route_id
                    FROM public."FREIGHTS"
                    WHERE route_id=$1`,
            values: [routeId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
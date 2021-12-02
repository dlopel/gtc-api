import pool from '../connectDb'
import { ProductStogare, ProductCompressed, CompressedProductsQueryBodyStorage } from '../types/product'
import * as config from '../config'
import { PaginatedResponse } from '../types/PaginatedResponse'
import DropDownListRow from '../types/DropDownListRow'

export const isIdUnique = async (
    id: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."PRODUCTS" 
                   WHERE UPPER(id || '')=$1`,
            values: [id.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createProduct = async (product: ProductStogare) => {
    if (product) {
        const query = {
            text: `
                   INSERT INTO public."PRODUCTS"
                   (id,name,client_id,observation)
                   VALUES ($1, $2, $3, $4)`,
            values: [
                product.id,
                product.name,
                product.clientId,
                product.observation]
        }
        await pool.query(query)
    }
}

export const updateProductById = async (product: ProductStogare) => {
    if (product && product.id) {
        const query = {
            text: `
                    UPDATE public."PRODUCTS" SET
                    name=$1, 
                    client_id=$2,
                    observation=$3
                    WHERE id=$4`,
            values: [
                product.name,
                product.clientId,
                product.observation,
                product.id]
        }
        await pool.query(query)
    }
}

export const getPaginationOfCompressedProductsByQuery = async (
    query: CompressedProductsQueryBodyStorage
) => {

    const queryRowCount = {
        text: `
                SELECT count(id) AS "totalRows"
                FROM public."PRODUCTS"
                WHERE 
                    UPPER(name || '') LIKE $1 AND
                    UPPER(client_id || '') LIKE $2`,
        values: [query.name, query.clientId]
    }

    const rowCountResult = await pool.query(queryRowCount)
    const totalRows = parseInt(rowCountResult.rows[0].totalRows)
    const limitPerPage = config.LIMIT_PER_PAGE
    const totalPages = Math.ceil(totalRows / limitPerPage)
    const offset = ((query.page as number) - 1) * limitPerPage

    const queryData = {
        text: `
                SELECT 
                "P".id, "P".name, "C".name AS "clientName"
                FROM public."PRODUCTS" AS "P"
                INNER JOIN public."CLIENTS" AS "C" ON "P".client_id="C".id 
                WHERE 
                    UPPER("P".name || '') LIKE $1 AND
                    UPPER("P".client_id || '') LIKE $2 
                ORDER BY "P".client_id, "P".name
                OFFSET $3 ROWS
                FETCH FIRST $4 ROWS ONLY`,
        values: [query.name, query.clientId, offset, limitPerPage]
    }

    const queryDataResult = await pool.query<ProductCompressed>(queryData)

    const response: PaginatedResponse<ProductCompressed> = {
        rows: queryDataResult.rows,
        totalRows,
        totalPages,
        limitPerPage,
        currentPage: query.page as number,
        nextPage: (query.page as number) >= 1 && (query.page as number) < totalPages ? (query.page as number) + 1 : null,
        prevPage: (query.page as number) > 1 && (query.page as number) <= totalPages ? (query.page as number) - 1 : null
    }

    return response
}


export const getProductById = async (id: string): Promise<ProductStogare | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT id, name, client_id as "clientId", observation
                  FROM public."PRODUCTS"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<ProductStogare>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getDataForDropDownListByClient = async (
    clientId: string
): Promise<DropDownListRow[]> => {
    const query = {
        text: `
        SELECT id, name AS value
        FROM public."PRODUCTS"
        WHERE client_id=$1
        ORDER BY name`,
        values: [clientId]
    }
    const result = await pool.query<DropDownListRow>(query)
    return result.rows
}

export const deleteProductById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."PRODUCTS"
                   WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla TRANSPORTS */
export const hasDependents = async (productId: string) => {
    if (productId) {
        const query = {
            text: `
                    SELECT product_id
                    FROM public."FREIGHTS_PRODUCTS"
                    WHERE product_id=$1`,
            values: [productId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
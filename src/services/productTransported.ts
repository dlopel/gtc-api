import pool from '../connectDb'
import { ProductTransportedStorage } from '../types/productTransported'
import ProductTransported from '../dtos/ProductTransported'

export const isIdUnique = async (
    id: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."FREIGHTS_PRODUCTS" 
                   WHERE UPPER(id || '')=$1`,
            values: [id.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createProductTransported = async (productTransported: ProductTransportedStorage) => {
    if (productTransported) {
        const query = {
            text: `
                   INSERT INTO public."FREIGHTS_PRODUCTS"
                   (id,product_id,freight_id,quantity,sku,observation)
                   VALUES ($1, $2, $3, $4, $5, $6)`,
            values: [
                productTransported.id,
                productTransported.productId,
                productTransported.freightId,
                productTransported.quantity,
                productTransported.sku,
                productTransported.observation]
        }
        await pool.query(query)
    }
}

export const getProductTransportedById = async (id: string): Promise<ProductTransportedStorage | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT id, product_id AS "productId", freight_id AS "freightId", quantity, sku, observation
                  FROM public."FREIGHTS_PRODUCTS"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<ProductTransportedStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getTransportedProductsByFreight = async (
    freightId: string
) => {
    const query = {
        text: `
               SELECT "FP".id, "P".name AS "productName", "FP".freight_id AS "freightId", "FP".quantity, "FP".sku, "FP".observation
               FROM public."FREIGHTS_PRODUCTS" AS "FP"
               INNER JOIN public."PRODUCTS" AS "P" ON "FP".product_id = "P".id
               WHERE freight_id=$1`,
        values: [freightId]
    }
    const result = await pool.query<ProductTransported>(query)
    return result.rows
}

export const deleteProductTransportedById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."FREIGHTS_PRODUCTS"
                   WHERE id=$1`,
            values: [id]
        }
        await pool.query(query)
    }
}
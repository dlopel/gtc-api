import pool from '../connectDb'
import SctrStorage from '../types/sctr'

export const isIdUnique = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."SCTRS" 
                   WHERE UPPER(id || '')=$1`,
            values: [id.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createSctr = async (sctr: SctrStorage) => {
    if (sctr) {
        const query = {
            text: `
                   INSERT INTO public."SCTRS" (
                        "dateStart", 
                        "dateEnd", 
                        "insuranceCompany", 
                        observation,
                        "pensionNumber", 
                        "healthNumber", 
                        id, 
                        "imagePath"
                    )
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            values: [
                sctr.dateStart,
                sctr.dateEnd,
                sctr.insuranceCompany,
                sctr.observation,
                sctr.pensionNumber,
                sctr.healthNumber,
                sctr.id,
                sctr.imagePath
            ]
        }
        await pool.query(query)
    }
}

export const updateSctrById = async ({ observation, id }) => {
    //observation is field null
    if (id) {
        const query = {
            text: `
                    UPDATE public."SCTRS" SET
                    observation=$1
                    WHERE id=$2 `,
            values: [observation, id]
        }
        await pool.query(query)
    }
}

export const getSctrs = async (): Promise<SctrStorage[]> => {
    const text = `
                  SELECT 
                    id, 
                    "pensionNumber", 
                    "healthNumber", 
                    "insuranceCompany", 
                    to_char("dateStart", 'dd-MM-yy') "dateStart", 
                    to_char("dateEnd", 'dd-MM-yy') "dateEnd", 
                    "imagePath",
                    observation
                    FROM public."SCTRS"
                  ORDER BY "dateStart"`
    const result = await pool.query(text)
    return result.rows
}

export const getSctrById = async (id: string): Promise<SctrStorage | null> => {
    if (id) {
        const query = {
            text: `
                    SELECT 
                        id, 
                        "pensionNumber", 
                        "healthNumber", 
                        "insuranceCompany", 
                        to_char("dateStart", 'yyyy-MM-dd') "dateStart", 
                        to_char("dateEnd", 'yyyy-MM-dd') "dateEnd", 
                        "imagePath",
                        observation
                    FROM public."SCTRS"
                    WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<SctrStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getImagePathById = async (id: string): Promise<string | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT 
                  "imagePath"
                  FROM public."SCTRS"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<{ imagePath: string }>(query)
        return result.rowCount ? result.rows[0].imagePath : null
    }
}

export const deleteSctrById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."SCTRS"
                   WHERE id=$1`,
            values: [id]
        }
        await pool.query(query)
    }
}
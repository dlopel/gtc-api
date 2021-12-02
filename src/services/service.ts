import pool from '../connectDb'
import { Service } from '../types/service'
import validator from 'validator'
import transformToCleanString from '../libs/transformToCleanString'
import DropDownListRow from '../types/DropDownListRow'

export const isValid = (service: Service): boolean => {
    if (!validator.isUUID(service.id || '', 4)) return false
    if (!validator.matches(service.name || '', /^[a-zA-Z ]{3,25}$/)) return false
    return true
}

export const sanitizer = (service: Service): Service => {
    if (service) {
        service.id = transformToCleanString(service.id)
        service.name = transformToCleanString(service.name)
    }

    return service
}

export const areUniqueConstraintsValid = async (
    id: string,
    name: string) => {
    if (id && name) {
        const query = {
            text: `
                   SELECT id
                   FROM public."SERVICES" 
                   WHERE UPPER(id || '')=$1 OR UPPER(name || '')=$2`,
            values: [id.toUpperCase(), name.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const isNameUniqueExceptCurrentServiceId = async (
    serviceId: string,
    name: string) => {
    if (serviceId && name) {
        const query = {
            text: `
                   SELECT id
                   FROM public."SERVICES" 
                   WHERE UPPER(id || '')!=$1 AND UPPER(name || '')=$2`,
            values: [serviceId.toUpperCase(), name.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createService = async (service: Service) => {
    if (service) {
        const query = {
            text: `
                   INSERT INTO public."SERVICES"
                   (id,name)
                   VALUES ($1, $2)`,
            values: [
                service.id,
                service.name]
        }
        await pool.query(query)
    }
}

export const updateServiceById = async (service: Service) => {
    if (service && service.id) {
        const query = {
            text: `
                    UPDATE public."SERVICES"
                    SET name=$1
                    WHERE id=$2`,
            values: [
                service.name,
                service.id]
        }
        await pool.query(query)
    }
}

export const getServices = async (): Promise<Service[]> => {
    const text = `
                  SELECT 
                  id, name
                  FROM public."SERVICES"
                  ORDER BY name`
    const result = await pool.query<Service>(text)
    return result.rows
}


export const getServiceById = async (id: string): Promise<Service | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT id, name
                  FROM public."SERVICES"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<Service>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getDataForDropDownList = async (): Promise<DropDownListRow[]> => {
    const text = `
                    SELECT id, name AS value
                    FROM public."SERVICES"
                    ORDER BY name`

    const result = await pool.query<DropDownListRow>(text)
    return result.rows
}

export const deleteServiceById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."SERVICES"
                   WHERE id=$1`,
            values: [id]
        }
        await pool.query(query)
    }
}

export const hasDependents = async (serviceId: string) => {
    if (serviceId) {
        const query = {
            text: `
                    SELECT service_id
                    FROM public."FREIGHTS"
                    WHERE service_id=$1`,
            values: [serviceId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
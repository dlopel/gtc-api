import pool from '../connectDb'
import Driver from '../dtos/Driver'
import { DriverImagePaths } from '../types/DriverImagePaths'
import { DriverCompressed, IDriver } from '../types/IDriver'
import validator from 'validator'
import DropDownListRow from '../types/DropDownListRow'

const areQueryFieldsForCompressedDriversValid = (
    name: string,
    lastname: string,
    transportId: string): boolean => {

    if (typeof name !== 'string') return false
    if (typeof lastname !== 'string') return false
    if (typeof transportId !== 'string') return false

    name = name.trim()
    lastname = lastname.trim()
    transportId = transportId.trim()

    if (name.length === 1 || name.length === 2) return false
    if (lastname.length === 1 || lastname.length === 2) return false
    if (transportId.length > 0 && transportId.length < 36) return false

    let isTherePropertyWithThreeCharacters = false
    if (name.length >= 3)
        if (validator.matches(name, /[a-zA-Z ]+/)) {
            isTherePropertyWithThreeCharacters = true
        } else {
            return false
        }

    if (lastname.length >= 3)
        if (validator.matches(lastname, /[a-zA-Z ]+/)) {
            isTherePropertyWithThreeCharacters = true
        } else {
            return false
        }

    if (transportId.length === 36)
        if (validator.isUUID(transportId, '4')) {
            isTherePropertyWithThreeCharacters = true
        } else {
            return false
        }

    return isTherePropertyWithThreeCharacters
}

const areUniqueConstraintsValid = async (
    id: string,
    dni: string,
    license: string,
    name: string,
    lastname: string) => {

    if (id && dni && license && name && lastname) {
        const query = {
            text: `
                   SELECT id
                   FROM public."DRIVERS" 
                   WHERE UPPER(id || '')=$1 OR dni=$2 OR UPPER(license || '')=$3 OR (UPPER(name || '')=$4 AND UPPER(lastname || '')=$5)`,
            values: [id.toUpperCase(), dni, license.toUpperCase(), name.toUpperCase(), lastname.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

const areUniqueConstraintsValidExceptCurrentDriverId = async (
    dni: string,
    license: string,
    name: string,
    lastname: string,
    driverId: string) => {
    if (dni && license && name && lastname && driverId) {
        const query = {
            text: `
                   SELECT id
                   FROM public."DRIVERS" 
                   WHERE (dni=$1 OR UPPER(license || '')=$2 OR (UPPER(name || '')=$3 AND UPPER(lastname || '')=$4)) AND UPPER(id || '')!=$5 `,
            values: [dni, license.toUpperCase(), name.toUpperCase(), lastname.toUpperCase(), driverId.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

const createDriver = async (driver: IDriver) => {
    if (driver instanceof Driver) {
        const query = {
            text: `
                  INSERT INTO public."DRIVERS"(
                      id, 
                      dni, 
                      "dniImagePath", 
                      "dniDateStart", 
                      "dniDateEnd", 
                      license, 
                      "licenseImagePath", 
                      "licenseDateStart", 
                      "licenseDateEnd", 
                      name,
                      lastname, 
                      "cellphoneOne", 
                      "cellphoneTwo", 
                      "dateStart", 
                      "dateEnd", 
                      "contractImagePath", 
                      observation, 
                      transport_id)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
            values: [
                driver.id,
                driver.dni,
                driver.dniImagePath,
                driver.dniDateStart,
                driver.dniDateEnd,
                driver.license,
                driver.licenseImagePath,
                driver.licenseDateStart,
                driver.licenseDateEnd,
                driver.name,
                driver.lastname,
                driver.cellphoneOne,
                driver.cellphoneTwo,
                driver.dateStart,
                driver.dateEnd,
                driver.contractImagePath,
                driver.observation,
                driver.transportId]
        }
        await pool.query(query)
    }
}

const getCompressedDrivers = async (
    name: string,
    lastname: string,
    transportId: string): Promise<DriverCompressed[]> => {

    name = `%${name.toUpperCase()}%`
    lastname = `%${lastname.toUpperCase()}%`
    transportId = `%${transportId.toUpperCase()}%`

    const queryData = {
        text: `
                SELECT 
                "D".id, 
                dni, 
                "dniImagePath", 
                license, 
                "licenseImagePath", 
                "contractImagePath", 
                "D".name, 
                "D".lastname, 
                "D"."cellphoneOne", 
                SUBSTRING("T".name FROM 1 FOR 15) AS "transportName"
                FROM public."DRIVERS" AS "D"
                INNER JOIN public."TRANSPORTS" AS "T" ON "D".transport_id = "T".id
                WHERE 
                    UPPER("D".name || '') LIKE $1 AND 
                    UPPER("D".lastname || '') LIKE $2 AND 
                    UPPER("D".transport_id || '') LIKE $3
                ORDER BY "D".name, "D".lastname, "T".name`,
        values: [name, lastname, transportId]
    }
    const result = await pool.query<DriverCompressed>(queryData)
    return result.rows
}

const getDriverById = async (id: string): Promise<IDriver | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT 
                  id, 
                  dni, 
                  "dniImagePath", 
                  TO_CHAR("dniDateStart", 'YYYY-MM-DD') AS "dniDateStart", 
                  TO_CHAR("dniDateEnd", 'YYYY-MM-DD') AS "dniDateEnd", 
                  license, 
                  "licenseImagePath", 
                  TO_CHAR("licenseDateStart", 'YYYY-MM-DD') AS "licenseDateStart", 
                  TO_CHAR("licenseDateEnd",  'YYYY-MM-DD') AS "licenseDateEnd", 
                  name, 
                  lastname, 
                  "cellphoneOne", 
                  "cellphoneTwo", 
                  TO_CHAR("dateStart", 'YYYY-MM-DD') AS "dateStart",
                  TO_CHAR("dateEnd", 'YYYY-MM-DD') AS "dateEnd",
                  "contractImagePath", 
                  observation, 
                  transport_id as "transportId"
                  FROM public."DRIVERS"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<IDriver>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

const getImagePathsById = async (id: string): Promise<DriverImagePaths | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT 
                  "dniImagePath", 
                  "licenseImagePath",
                  "contractImagePath"
                  FROM public."DRIVERS"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query(query)

        if (result.rowCount) {
            return {
                dniImagePath: result.rows[0].dniImagePath,
                licenseImagePath: result.rows[0].licenseImagePath,
                contractImagePath: result.rows[0].contractImagePath,
            }
        } else {
            return null
        }
    }
}

export const getDataForDropDownList = async (
    transportId: string
): Promise<DropDownListRow[]> => {
    const query = {
        text: `
                  SELECT id, (name || ', ' || lastname) AS value
                  FROM public."DRIVERS"
                  WHERE transport_id=$1
                  ORDER BY lastname, name`,
        values: [transportId]
    }
    const result = await pool.query<DropDownListRow>(query)
    return result.rows
}

const updateDriverById = async (driver: IDriver, id: string) => {

    if (driver instanceof Driver) {

        //cuerpo de sentencia UPDATE
        const updateHeaderText = 'UPDATE public."DRIVERS"'
        let setText = 'SET' //complete ...
        let whereText = 'WHERE id=$' //add parameter value

        const keyValueArray = Object.entries(driver)
        let valueList: any[] = []
        let counter = 0
        for (let i = 0; i < keyValueArray.length; i++) {
            if (keyValueArray[i][1] != null && keyValueArray[i][0] !== 'id') {
                counter++

                switch (keyValueArray[i][0]) {
                    case 'transportId':
                        setText = `${setText} "transport_id"=$${counter},`
                        valueList.push(keyValueArray[i][1])
                        break
                    default:
                        setText = `${setText} "${keyValueArray[i][0]}"=$${counter},`
                        valueList.push(keyValueArray[i][1])
                        break
                }
            }
        }
        //borramos la ultima coma del setText del update
        setText = setText.slice(0, -1)

        //añadiendo la posicion del parametro al texto del where 
        //y agregarlo el valor id del driver a la lista de valores
        counter++
        whereText = `${whereText}${counter}`
        valueList.push(driver.id)

        const query = {
            text: `
                   ${updateHeaderText}
                   ${setText}
                   ${whereText}`,
            values: valueList
        }
        await pool.query(query)
    }
}

const deleteDriverById = async (id: string) => {
    if (id) {

        const query = {
            text: `
                   DELETE FROM public."DRIVERS"
                   WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla DRIVERS */
const hasDependents = async (id: string) => {
    if (id) {
        const query = {
            text: `
                    SELECT driver_id
                    FROM public."FREIGHTS"
                    WHERE driver_id=$1`,
            values: [id]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}

export {
    areQueryFieldsForCompressedDriversValid,
    areUniqueConstraintsValid,
    areUniqueConstraintsValidExceptCurrentDriverId,
    hasDependents,
    createDriver,
    getCompressedDrivers,
    getDriverById,
    getImagePathsById,
    updateDriverById,
    deleteDriverById
}
import validator from 'validator'
import pool from '../connectDb'
import transformToCleanString from '../libs/transformToCleanString'
import DropDownListRow from '../types/DropDownListRow'
import { Unit, UnitCompressed, UnitCompressedsQuery, UnitImagePaths } from '../types/unit'

export const areUniqueConstraintsValid = async (
    id: string,
    chassisNumber: string,
    engineNumber: string,
    licensePlate: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."UNITS" 
                   WHERE UPPER(id || '')=$1 OR UPPER("chassisNumber" || '')=$2 OR UPPER("engineNumber" || '')=$3 OR UPPER("licensePlate" || '')=$4`,
            values: [id.toUpperCase(), chassisNumber.toUpperCase(), engineNumber.toUpperCase(), licensePlate.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const areUniqueConstraintsValidExceptCurrentUnitId = async (
    id: string,
    chassisNumber: string,
    engineNumber: string,
    licensePlate: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."UNITS" 
                   WHERE UPPER(id || '')!=$1 AND (UPPER("chassisNumber" || '')=$2 OR UPPER("engineNumber" || '')=$3 OR UPPER("licensePlate" || '')=$4)`,
            values: [id.toUpperCase(), chassisNumber.toUpperCase(), engineNumber.toUpperCase(), licensePlate.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const isValid = (unit: Unit): boolean => {

    if (!validator.isUUID(unit.id || '', 4)) return false
    if (!validator.matches(unit.licensePlate || '', /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/)) return false
    if (!validator.isLength(unit.licensePlate || '', { min: 7, max: 7 })) return false
    if (!validator.isAlpha(unit.brand || '')) return false
    if (!validator.isLength(unit.brand || '', { min: 3, max: 25 })) return false
    if (!validator.matches(unit.color || '', /^[a-zA-Z ]+$/)) return false
    if (!validator.isLength(unit.color || '', { min: 3, max: 25 })) return false
    if (!validator.isAlpha(unit.bodyType || '')) return false
    if (!validator.isLength(unit.bodyType || '', { min: 3, max: 25 })) return false
    if (!validator.isUUID(unit.transportId || '', 4)) return false

    //null fields
    //when value is null default value is set to pass filter 
    if (!validator.isInt(unit.year || '1900', { allow_leading_zeroes: false, min: 1900, max: 2100 })) return false
    if (!validator.isAlphanumeric(unit.model || 'FOOO-11', 'en-US', { ignore: ' -' })) return false
    if (!validator.isLength(unit.model || 'FOO', { min: 3, max: 25 })) return false
    if (!validator.isAlphanumeric(unit.engineNumber || 'FOO11')) return false
    if (!validator.isLength(unit.engineNumber || 'FOO', { min: 3, max: 25 })) return false
    if (!validator.isAlphanumeric(unit.chassisNumber || 'FOO11')) return false
    if (!validator.isLength(unit.chassisNumber || 'FOO', { min: 3, max: 25 })) return false
    if (!validator.isInt(unit.numberCylinders || '0', { allow_leading_zeroes: false, gt: -1 })) return false
    if (!validator.isInt(unit.numberAxles || '0', { allow_leading_zeroes: false, gt: -1 })) return false
    if (!validator.isInt(unit.numberTires || '0', { allow_leading_zeroes: false, gt: -1 })) return false
    if (!validator.matches(unit.dryWeight || '12.123', /^[0-9]{1,2}(\.[0-9]{1,3})?$/)) return false
    if (!validator.matches(unit.grossWeight || '12.123', /^[0-9]{1,2}(\.[0-9]{1,3})?$/)) return false
    if (!validator.matches(unit.length || '12.12', /^[0-9]{1,2}(\.[0-9]{1,2})?$/)) return false
    if (!validator.matches(unit.height || '12.12', /^[0-9]{1,2}(\.[0-9]{1,2})?$/)) return false
    if (!validator.matches(unit.width || '12.12', /^[0-9]{1,2}(\.[0-9]{1,2})?$/)) return false
    if (!validator.matches(unit.usefulLoad || '12.123', /^[0-9]{1,2}(\.[0-9]{1,3})?$/)) return false
    if (!validator.isInt(unit.numberSeats || '0', { allow_leading_zeroes: false, gt: -1 })) return false
    if (!validator.isUUID(unit.policyId || 'd3545a7f-4cbb-4798-a08a-8021bc690245', 4)) return false
    if (!validator.isDate(unit.technicalReviewDateStart || '2021/08/11')) return false
    if (!validator.isDate(unit.technicalReviewDateEnd || '2021/08/11')) return false
    if (!validator.isDate(unit.mtcDateStart || '2021/08/11')) return false
    if (!validator.isDate(unit.mtcDateEnd || '2021/08/11')) return false
    if (!validator.isDate(unit.propertyCardDateStart || '2021/08/11')) return false
    if (!validator.isDate(unit.propertyCardDateEnd || '2021/08/11')) return false
    if (!validator.isDate(unit.soatDateStart || '2021/08/11')) return false
    if (!validator.isDate(unit.soatDateEnd || '2021/08/11')) return false
    if (!validator.isLength(unit.observation || 'FOO', { min: 3, max: 1000 })) return false

    return true
}

export const AreQueryFieldsForCompressedUnitsValid = (
    queryFields: UnitCompressedsQuery): boolean => {
    let hasAnApprovedProperty = false
    for (const prop in queryFields) {
        const val: string = queryFields[prop]
        if (typeof val === 'string') {
            if (val.length >= 3) {
                hasAnApprovedProperty = true
            } else if (val.length === 1 || val.length === 2) {
                return false
            }
        } else {
            return false
        }
    }
    return hasAnApprovedProperty
}

export const sanitizer = (unit: Unit): Unit => {
    if (unit) {
        unit.id = transformToCleanString(unit.id)
        unit.licensePlate = transformToCleanString(unit.licensePlate)
        unit.brand = transformToCleanString(unit.brand)
        unit.color = transformToCleanString(unit.color)
        unit.bodyType = transformToCleanString(unit.bodyType)
        unit.transportId = transformToCleanString(unit.transportId)
        unit.year = unit.year == null ? unit.year : transformToCleanString(unit.year)
        unit.model = unit.model == null ? unit.model : transformToCleanString(unit.model)
        unit.engineNumber = unit.engineNumber == null ? unit.engineNumber : transformToCleanString(unit.engineNumber)
        unit.chassisNumber = unit.chassisNumber == null ? unit.chassisNumber : transformToCleanString(unit.chassisNumber)
        unit.numberCylinders = unit.numberCylinders == null ? unit.numberCylinders : transformToCleanString(unit.numberCylinders)
        unit.numberAxles = unit.numberAxles == null ? unit.numberAxles : transformToCleanString(unit.numberAxles)
        unit.numberTires = unit.numberTires == null ? unit.numberTires : transformToCleanString(unit.numberTires)
        unit.dryWeight = unit.dryWeight == null ? unit.dryWeight : transformToCleanString(unit.dryWeight)
        unit.grossWeight = unit.grossWeight == null ? unit.grossWeight : transformToCleanString(unit.grossWeight)
        unit.length = unit.length == null ? unit.length : transformToCleanString(unit.length)
        unit.height = unit.height == null ? unit.height : transformToCleanString(unit.height)
        unit.width = unit.width == null ? unit.width : transformToCleanString(unit.width)
        unit.usefulLoad = unit.usefulLoad == null ? unit.usefulLoad : transformToCleanString(unit.usefulLoad)
        unit.numberSeats = unit.numberSeats == null ? unit.numberSeats : transformToCleanString(unit.numberSeats)
        unit.policyId = unit.policyId == null ? unit.policyId : transformToCleanString(unit.policyId)
        unit.technicalReviewImagePath = unit.technicalReviewImagePath == null ? unit.technicalReviewImagePath : transformToCleanString(unit.technicalReviewImagePath)
        unit.technicalReviewDateStart = unit.technicalReviewDateStart == null ? unit.technicalReviewDateStart : transformToCleanString(unit.technicalReviewDateStart)
        unit.technicalReviewDateEnd = unit.technicalReviewDateEnd == null ? unit.technicalReviewDateEnd : transformToCleanString(unit.technicalReviewDateEnd)
        unit.mtcImagePath = unit.mtcImagePath == null ? unit.mtcImagePath : transformToCleanString(unit.mtcImagePath)
        unit.mtcDateStart = unit.mtcDateStart == null ? unit.mtcDateStart : transformToCleanString(unit.mtcDateStart)
        unit.mtcDateEnd = unit.mtcDateEnd == null ? unit.mtcDateEnd : transformToCleanString(unit.mtcDateEnd)
        unit.propertyCardImagePath = unit.propertyCardImagePath == null ? unit.propertyCardImagePath : transformToCleanString(unit.propertyCardImagePath)
        unit.propertyCardDateStart = unit.propertyCardDateStart == null ? unit.propertyCardDateStart : transformToCleanString(unit.propertyCardDateStart)
        unit.propertyCardDateEnd = unit.propertyCardDateEnd == null ? unit.propertyCardDateEnd : transformToCleanString(unit.propertyCardDateEnd)
        unit.soatImagePath = unit.soatImagePath == null ? unit.soatImagePath : transformToCleanString(unit.soatImagePath)
        unit.soatDateStart = unit.soatDateStart == null ? unit.soatDateStart : transformToCleanString(unit.soatDateStart)
        unit.soatDateEnd = unit.soatDateEnd == null ? unit.soatDateEnd : transformToCleanString(unit.soatDateEnd)
        unit.observation = unit.observation == null ? unit.observation : transformToCleanString(unit.observation)

    }
    return unit
}

export const createUnit = async (unit: Unit) => {
    if (unit) {
        const query = {
            text: `
                    INSERT INTO public."UNITS" 
                    (id,
                    "licensePlate",
                    year,
                    brand,
                    model,
                    "engineNumber",
                    "chassisNumber",
                    color,
                    "numberCylinders",
                    "numberAxles",
                    "numberTires",
                    "dryWeight",
                    "grossWeight",
                    length,
                    height,
                    width,
                    "usefulLoad",
                    "numberSeats",
                    "bodyType",
                    policy_id,
                    "technicalReviewImagePath",
                    "technicalReviewDateStart",
                    "technicalReviewDateEnd",
                    "mtcImagePath",
                    "mtcDateStart",
                    "mtcDateEnd",
                    "propertyCardImagePath",
                    "propertyCardDateStart",
                    "propertyCardDateEnd",
                    "soatImagePath",
                    "soatDateStart",
                    "soatDateEnd",
                    observation,
                    transport_id)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                           $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                           $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                           $31, $32, $33, $34)`,
            values: [
                unit.id,
                unit.licensePlate,
                unit.year,
                unit.brand,
                unit.model,
                unit.engineNumber,
                unit.chassisNumber,
                unit.color,
                unit.numberCylinders,
                unit.numberAxles,
                unit.numberTires,
                unit.dryWeight,
                unit.grossWeight,
                unit.length,
                unit.height,
                unit.width,
                unit.usefulLoad,
                unit.numberSeats,
                unit.bodyType,
                unit.policyId,
                unit.technicalReviewImagePath,
                unit.technicalReviewDateStart,
                unit.technicalReviewDateEnd,
                unit.mtcImagePath,
                unit.mtcDateStart,
                unit.mtcDateEnd,
                unit.propertyCardImagePath,
                unit.propertyCardDateStart,
                unit.propertyCardDateEnd,
                unit.soatImagePath,
                unit.soatDateStart,
                unit.soatDateEnd,
                unit.observation,
                unit.transportId
            ]
        }
        await pool.query(query)
    }
}

export const updateUnitById = async (unit: Unit) => {
    if (unit && unit.id) {
        const updateHeaderText = 'UPDATE public."UNITS"'
        let setText = 'SET' //complete ...
        let whereText = 'WHERE id=$' //add parameter value
        const keyValueArray = Object.entries(unit)
        let valueList: any[] = []
        let counter = 0
        for (let i = 0; i < keyValueArray.length; i++) {
            if (keyValueArray[i][1] != null && keyValueArray[i][0] !== 'id') {
                counter++

                if (keyValueArray[i][0] == 'policyId') {
                    setText = `${setText} "policy_id"=$${counter},`
                    valueList.push(keyValueArray[i][1])
                } else if (keyValueArray[i][0] == 'transportId') {
                    setText = `${setText} "transport_id"=$${counter},`
                    valueList.push(keyValueArray[i][1])
                } else {
                    setText = `${setText} "${keyValueArray[i][0]}"=$${counter},`
                    valueList.push(keyValueArray[i][1])
                }

            }
        }
        //borramos la ultima coma del setText del update
        setText = setText.slice(0, -1)

        //añadiendo la posicion del parametro al texto del where 
        //y agregarlo el valor id del driver a la lista de valores
        counter++
        whereText = `${whereText}${counter}`
        valueList.push(unit.id)

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

export const getCompressedUnitsByQuery = async (
    licensePlate: string,
    brand: string,
    bodyType: string,
    transportId: string): Promise<UnitCompressed[]> => {

    licensePlate = `%${licensePlate.toUpperCase()}%`
    brand = `%${brand.toUpperCase()}%`
    bodyType = `%${bodyType.toUpperCase()}%`
    transportId = `%${transportId.toUpperCase()}%`

    const query =
    {
        text: `
               SELECT 
               "U".id,
               "licensePlate",
               brand,
               color,
               length,
               height,
               width,
               "dryWeight",
               "grossWeight",
               "usefulLoad",
               "bodyType",
               "P".endorsement as "policyEndorsement",
               "P"."imagePath" as "policyImagePath",
               SUBSTRING("T".name FROM 1 FOR 15) as "transportName"
               FROM public."UNITS" AS "U"
               LEFT JOIN public."POLICIES" AS "P" ON "U".policy_id = "P".id 
               LEFT JOIN public."TRANSPORTS" AS "T" ON "U".transport_id = "T".id
               WHERE UPPER("licensePlate" || '') LIKE $1 AND UPPER(brand || '') LIKE $2
               AND UPPER("bodyType" || '') LIKE $3 AND UPPER(transport_id || '') LIKE $4
               ORDER BY brand, "bodyType"`,
        values: [licensePlate, brand, bodyType, transportId]
    }

    const result = await pool.query<UnitCompressed>(query)
    return result.rows
}

export const getUnitById = async (id: string): Promise<Unit | null> => {
    if (id) {
        const query = {
            text: `
                    SELECT
                    id,
                    "licensePlate",
                    year::text,
                    brand,
                    model,
                    "engineNumber",
                    "chassisNumber",
                    color,
                    "numberCylinders"::text,
                    "numberAxles"::text,
                    "numberTires"::text,
                    "dryWeight",
                    "grossWeight",
                    length,
                    height,
                    width,
                    "usefulLoad",
                    "numberSeats"::text,
                    "bodyType",
                    policy_id as "policyId",
                    "technicalReviewImagePath",
                    TO_CHAR("technicalReviewDateStart", 'YYYY-MM-DD') AS "technicalReviewDateStart",
                    TO_CHAR("technicalReviewDateEnd",'YYYY-MM-DD') AS "technicalReviewDateEnd" ,
                    "mtcImagePath",
                    TO_CHAR("mtcDateStart",'YYYY-MM-DD') AS "mtcDateStart",
                    TO_CHAR("mtcDateEnd",'YYYY-MM-DD') AS "mtcDateEnd",
                    "propertyCardImagePath",
                    TO_CHAR("propertyCardDateStart",'YYYY-MM-DD') AS "propertyCardDateStart",
                    TO_CHAR("propertyCardDateEnd",'YYYY-MM-DD') AS "propertyCardDateEnd",
                    "soatImagePath",
                    TO_CHAR("soatDateStart",'YYYY-MM-DD') AS "soatDateStart",
                    TO_CHAR("soatDateEnd",'YYYY-MM-DD') AS "soatDateEnd",
                    observation,
                    transport_id as "transportId"
                    FROM public."UNITS"
                    WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<Unit>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getImagePathsById = async (id: string): Promise<UnitImagePaths | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT 
                  "technicalReviewImagePath",
                  "mtcImagePath",
                  "propertyCardImagePath",
                  "soatImagePath"
                  FROM public."UNITS"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<UnitImagePaths>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getDataForDropDownListByTransport = async (
    transportId: string
): Promise<DropDownListRow[]> => {
    const query = {
        text: `
        SELECT id, "licensePlate" AS value
        FROM public."UNITS"
        WHERE transport_id=$1
        ORDER BY "licensePlate"`,
        values: [transportId]
    }
    const result = await pool.query<DropDownListRow>(query)
    return result.rows
}

export const getBodyTypeDataForDropDownList = () => {
    const bodyTypesAllowed = [
        'Remolcador',
        'Plataforma',
        'Baranda',
        'Furgon',
        'Furgon Isotermico',
        'Furgon Frigorifico',
        'Cañero',
        'Cigueña',
        'Cisterna',
        'Cisterna Combustible',
        'Tanque Isotermico',
        'Tanque Frigorifico',
        'Tanque Corrosivo',
        'Tanque Calorifico',
        'Tanque GLP',
        'Tanque GNC',
        'Tanque Criogenico',
        'Porta Contenedor',
        'Quilla',
        'Bombona',
        'Granelero',
        'Volquete',
        'Cama Baja',
        'Dolly',
        'Madrina',
        'Hormigonera',
        'Mezclador'
    ]
    return bodyTypesAllowed
}

export const deleteUnitById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."UNITS"
                   WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla TRANSPORTS */
export const hasDependents = async (unitId: string) => {
    if (unitId) {
        const query = {
            text: `
                    SELECT unit_id
                    FROM public."FREIGHTS"
                    WHERE unit_id=$1`,
            values: [unitId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}

import { CompressedFreightsQueryBodyStorage, FreightStorage, FreightsNotLiquidatedQueryBodyStorage, ClientFreightsQueryBodyStorage } from "../types/freight"
import validator from 'validator'
import removeSpacesFromObjectValues from "../libs/removeSpacesFromObjectValues"
import areAllPropsString from "../libs/areAllPropsString"

export default class Freight {
    freight: FreightStorage

    constructor(freight: FreightStorage) {
        this.freight = freight
    }

    isValid(): boolean {
        if (!areAllPropsString(this.freight)) return false

        this.freight = removeSpacesFromObjectValues(this.freight)

        if (!validator.isUUID(this.freight.id, 4)) return false
        //formattedIs is assigned in insert statement
        // if (!validator.matches(this.freight.formattedId, /^F[0-9]{6}$/)) return false
        if (!validator.isDate(this.freight.dateStart)) return false
        if (!validator.isUUID(this.freight.routeId, 4)) return false
        if (!validator.isUUID(this.freight.truckTractorId, 4)) return false
        if (!validator.isUUID(this.freight.semiTrailerId, 4)) return false
        if (!validator.isUUID(this.freight.driverId, 4)) return false
        if (!validator.isUUID(this.freight.transportId, 4)) return false
        if (!validator.isUUID(this.freight.clientId, 4)) return false
        if (!validator.isUUID(this.freight.serviceId, 4)) return false

        //nulls
        if (!validator.isDate(this.freight.dateEnd || '2021/08/11')) return false
        if (!validator.matches(this.freight.grt || '322', /^[0-9-/]{3,1000}$/)) return false
        if (!validator.matches(this.freight.grr || '322', /^[0-9-/]{3,1000}$/)) return false
        if (!validator.matches(this.freight.ton || '12.12', /^[0-9]{1,2}(\.[0-9]{1,2})?$/)) return false
        if (!validator.isInt(this.freight.pallet || '1', { allow_leading_zeroes: false, min: 0, max: 999 })) return false
        if (!validator.isLength(this.freight.observation || 'foo', { min: 3, max: 1000 })) return false

        return true
    }

    prepareForInsertOrUpdateStatement(): FreightStorage {
        //from '' to null
        this.freight.dateEnd = this.freight.dateEnd || null
        this.freight.grt = this.freight.grt || null
        this.freight.grr = this.freight.grr || null
        this.freight.ton = this.freight.ton || null
        this.freight.pallet = this.freight.pallet || null
        this.freight.observation = this.freight.observation || null
        return this.freight
    }

    static validateFreightIdListAndExpenseSettlementId(
        expenseSettlementId: string,
        freightIdList: string[]
    ): boolean {
        if (expenseSettlementId !== null) {
            if (!validator.isUUID(expenseSettlementId.toString(), 4)) return false
        }

        if (Array.isArray(freightIdList)) {
            for (const id of freightIdList) {
                if (!validator.isUUID(id, 4)) return false
            }
            return true
        } else {
            return false
        }
    }

    static isFormattedIdValid(formattedId: string): boolean {
        return validator.matches(formattedId || '', /^[fF]\d{6}$/)
    }
}

export class CompressedFreightsQueryBody {
    queryBody: CompressedFreightsQueryBodyStorage

    constructor(queryBody: CompressedFreightsQueryBodyStorage) {
        this.queryBody = removeSpacesFromObjectValues(queryBody)
    }

    /**Para filtrar por lo menos un campo tiene que estar validado correctamente*/
    areQueryFieldsValid(): boolean {
        let isThereAtLeastOneApprovedProp = false
        if (this.queryBody.formattedId)
            if (validator.matches(this.queryBody.formattedId, /^F?[0-9]{3,6}$/i)) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.clientId)
            if (validator.isUUID(this.queryBody.clientId, '4')) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.driverFullName)
            if (validator.matches(this.queryBody.driverFullName, /^[a-zA-Z ]{3,50}$/)) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.routeName)
            if (validator.matches(this.queryBody.routeName, /^[a-zA-Z ]{3,100}$/)) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.serviceId)
            if (validator.isUUID(this.queryBody.serviceId, '4')) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.transportId)
            if (validator.isUUID(this.queryBody.transportId, '4')) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.truckTractorLicensePlate)
            if (validator.matches(this.queryBody.truckTractorLicensePlate, /^[a-zA-Z0-9-]{3,7}$/)) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.semiTrailerLicensePlate)
            if (validator.matches(this.queryBody.semiTrailerLicensePlate, /^[a-zA-Z0-9-]{3,7}$/)) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.dateStart || this.queryBody.dateEnd)
            if (validator.isDate(this.queryBody.dateStart) &&
                validator.isDate(this.queryBody.dateEnd)) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.grt)
            if (validator.matches(this.queryBody.grt, /^[0-9-/]{3,1000}$/)) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (this.queryBody.grr)
            if (validator.matches(this.queryBody.grr, /^[0-9-/]{3,1000}$/)) {
                isThereAtLeastOneApprovedProp = true
            } else {
                return false
            }

        if (!validator.isInt(this.queryBody.page as string, { allow_leading_zeroes: false, gt: 0 }))
            return false

        return isThereAtLeastOneApprovedProp
    }

    isMaximumDateRangeOneYear() {
        //si tiene contenido validar el rango, sino, debe ser campos nulos y retornar true
        if (this.queryBody.dateStart && this.queryBody.dateEnd) {
            const dateStartMls = Date.parse(this.queryBody.dateStart)
            const dateEndMls = Date.parse(this.queryBody.dateEnd)
            const oneDayInMileseconds = 86400000
    
            const dif = (dateEndMls - dateStartMls) / (oneDayInMileseconds * 366)
            if (dif <= 1) {
                return true
            } else {
                return false
            }
        } else {
            return true
        }

        
    }

    prepareForGet(): CompressedFreightsQueryBodyStorage {
        this.queryBody.formattedId = `%${this.queryBody.formattedId.toUpperCase()}%`
        this.queryBody.routeName = `%${this.queryBody.routeName.toUpperCase()}%`
        this.queryBody.truckTractorLicensePlate = `%${this.queryBody.truckTractorLicensePlate.toUpperCase()}%`
        this.queryBody.semiTrailerLicensePlate = `%${this.queryBody.semiTrailerLicensePlate.toUpperCase()}%`
        this.queryBody.driverFullName = `%${this.queryBody.driverFullName.toUpperCase()}%`
        this.queryBody.transportId = `%${this.queryBody.transportId.toUpperCase()}%`
        this.queryBody.clientId = `%${this.queryBody.clientId.toUpperCase()}%`
        this.queryBody.serviceId = `%${this.queryBody.serviceId.toUpperCase()}%`
        this.queryBody.grt = `%${this.queryBody.grt}%`
        this.queryBody.grr = `%${this.queryBody.grr}%`
        this.queryBody.dateStart = this.queryBody.dateStart || '1900-01-01'
        this.queryBody.dateEnd = this.queryBody.dateEnd || '2100-01-01'
        this.queryBody.page = parseInt(this.queryBody.page as string)
        return this.queryBody
    }
}

export class FreightsNotLiquidatedQueryBody {
    queryBody: FreightsNotLiquidatedQueryBodyStorage

    constructor(queryBody: FreightsNotLiquidatedQueryBodyStorage) {
        this.queryBody = removeSpacesFromObjectValues(queryBody)
    }

    areQueryFieldsValid(): boolean {
        if (!validator.isUUID(this.queryBody.transportId, 4)) return false
        if (!validator.isUUID(this.queryBody.driverId, 4)) return false
        if (!validator.isDate(this.queryBody.dateStart)) return false
        if (!validator.isDate(this.queryBody.dateEnd)) return false
        return true
    }

    isMaximumDateRangeOneYear(): boolean {
        const dateStartMls = Date.parse(this.queryBody.dateStart)
        const dateEndMls = Date.parse(this.queryBody.dateEnd)
        const oneDayInMileseconds = 86400000

        const dif = (dateEndMls - dateStartMls) / (oneDayInMileseconds * 366)
        if (dif <= 1) {
            return true
        } else {
            return false
        }
    }
}

export class ClientFreightsQueryBody {
    queryBody: ClientFreightsQueryBodyStorage

    constructor(queryBody: ClientFreightsQueryBodyStorage) {
        this.queryBody = removeSpacesFromObjectValues(queryBody)
    }

    isValid(): boolean {
        if (!validator.isUUID(this.queryBody.clientId || '', 4)) return false
        this.queryBody.liquidated.toString().toLowerCase()
        if (!(this.queryBody.liquidated === 'true' || this.queryBody.liquidated === 'false')) return false
        if (!validator.isDate(this.queryBody.dateStart || '')) return false
        if (!validator.isDate(this.queryBody.dateEnd || '')) return false
        return true
    }

    convertLiquitatedToBoolean() {
        this.queryBody.liquidated = validator.toBoolean(this.queryBody.liquidated as string)
    }

    isMaximumDateRangeOneYear(): boolean {
        const dateStartMls = Date.parse(this.queryBody.dateStart)
        const dateEndMls = Date.parse(this.queryBody.dateEnd)
        const oneDayInMileseconds = 86400000

        const dif = (dateEndMls - dateStartMls) / (oneDayInMileseconds * 366)
        if (dif <= 1) {
            return true
        } else {
            return false
        }
    }
}
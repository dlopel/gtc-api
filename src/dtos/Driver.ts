import validator from "validator"

class Driver {
    id: string
    dni: string
    dniImagePath: string | null
    dniDateStart: string
    dniDateEnd: string
    license: string
    licenseImagePath: string | null
    licenseDateStart: string
    licenseDateEnd: string
    name: string
    lastname: string
    cellphoneOne: string
    cellphoneTwo: string | null
    dateStart: string
    dateEnd: string | null
    contractImagePath: string | null
    observation: string | null
    transportId: string

    constructor(
        id: string,
        dni: string,
        dniImagePath: string | null,
        dniDateStart: string,
        dniDateEnd: string,
        license: string,
        licenseImagePath: string | null,
        licenseDateStart: string,
        licenseDateEnd: string,
        name: string,
        lastname: string,
        cellphoneOne: string,
        cellphoneTwo: string | null,
        dateStart: string,
        dateEnd: string | null,
        contractImagePath: string | null,
        observation: string | null,
        transportId: string
    ) {
        this.id = id
        this.dni = dni
        this.dniImagePath = dniImagePath
        this.dniDateStart = dniDateStart
        this.dniDateEnd = dniDateEnd
        this.license = license
        this.licenseImagePath = licenseImagePath
        this.licenseDateStart = licenseDateStart
        this.licenseDateEnd = licenseDateEnd
        this.name = name
        this.lastname = lastname
        this.cellphoneOne = cellphoneOne
        this.cellphoneTwo = cellphoneTwo
        this.dateStart = dateStart
        this.dateEnd = dateEnd
        this.contractImagePath = contractImagePath
        this.observation = observation
        this.transportId = transportId
    }

    isValid(): boolean {

        if (typeof this.id !== 'string') return false
        if (typeof this.dniImagePath !== 'string') return false
        if (typeof this.dniDateStart !== 'string') return false
        if (typeof this.dniDateEnd !== 'string') return false
        if (typeof this.license !== 'string') return false
        if (typeof this.licenseImagePath !== 'string') return false
        if (typeof this.licenseDateStart !== 'string') return false
        if (typeof this.licenseDateEnd !== 'string') return false
        if (typeof this.name !== 'string') return false
        if (typeof this.lastname !== 'string') return false
        if (typeof this.cellphoneOne !== 'string') return false
        if (typeof this.cellphoneTwo !== 'string') return false
        if (typeof this.dateStart !== 'string') return false
        if (typeof this.dateEnd !== 'string') return false
        if (typeof this.contractImagePath !== 'string') return false
        if (typeof this.observation !== 'string') return false
        if (typeof this.transportId !== 'string') return false

        this.id = this.id.trim()
        this.dni = this.dni.trim()
        this.dniImagePath = this.dniImagePath || null
        this.dniDateStart = this.dniDateStart.trim() || null
        this.dniDateEnd = this.dniDateEnd.trim() || null
        this.license = this.license.trim()
        this.licenseImagePath = this.licenseImagePath || null
        this.licenseDateStart = this.licenseDateStart.trim() || null
        this.licenseDateEnd = this.licenseDateEnd.trim() || null
        this.name = this.name.trim()
        this.lastname = this.lastname.trim()
        this.cellphoneOne = this.cellphoneOne.trim()
        this.cellphoneTwo = this.cellphoneTwo.trim() || null
        this.dateStart = this.dateStart.trim()
        this.dateEnd = this.dateEnd.trim() || null
        this.contractImagePath = this.contractImagePath || null
        this.observation = this.observation.trim() || null
        this.transportId = this.transportId.trim()

        if (!validator.isUUID(this.id, 4)) return false
        if (!validator.isInt(this.dni, { allow_leading_zeroes: true, gt: -1 })) return false
        if (!validator.isLength(this.dni, { min: 8, max: 8 })) return false
        if (!validator.isAlphanumeric(this.license)) return false
        if (!validator.isLength(this.license, { min: 9, max: 9 })) return false
        if (!validator.matches(this.name, /^[a-zA-Z ]+$/i)) return false
        if (!validator.isLength(this.name, { min: 3, max: 50 })) return false
        if (!validator.matches(this.lastname, /^[a-zA-Z ]+$/i)) return false
        if (!validator.isLength(this.lastname, { min: 3, max: 50 })) return false
        if (!validator.isInt(this.cellphoneOne, { min: 900000000, max: 999999999 })) return false
        if (!validator.isDate(this.dateStart)) return false
        if (!validator.isUUID(this.transportId, 4)) return false

        if (this.dniDateStart)
            if (!validator.isDate(this.dniDateStart)) return false

        if (this.dniDateEnd)
            if (!validator.isDate(this.dniDateEnd)) return false

        if (this.licenseDateStart)
            if (!validator.isDate(this.licenseDateStart)) return false

        if (this.licenseDateEnd)
            if (!validator.isDate(this.licenseDateEnd)) return false

        if (this.dniImagePath)
            if (!validator.isURL(this.dniImagePath, { require_host: true })) return false

        if (this.licenseImagePath)
            if (!validator.isURL(this.licenseImagePath, { require_host: true })) return false

        if (this.cellphoneTwo)
            if (!validator.isInt(this.cellphoneTwo, { min: 900000000, max: 999999999 })) return false

        if (this.dateEnd)
            if (!validator.isDate(this.dateEnd)) return false

        if (this.contractImagePath)
            if (!validator.isURL(this.contractImagePath, { require_host: true })) return false

        if (this.observation)
            if (!validator.isLength(this.observation, { min: 0, max: 1000 })) return false

        return true
    }


    static isIdValid(id: string): boolean {
        if (typeof id === 'string') {
            return validator.isUUID(id, 4)
        } else {
            return false
        }
    }

    static isNameValid(name: string): boolean {
        if (typeof name !== 'string') return false 
        if (!validator.matches(name, /^[a-zA-Z ]+$/i)) return false
        if (!validator.isLength(name, { min: 3, max: 50 })) return false
        return true
    }

    static isLastNameValid(lastname: string): boolean {
        if (typeof lastname !== 'string') return false 
        if (!validator.matches(lastname, /^[a-zA-Z ]+$/i)) return false
        if (!validator.isLength(lastname, { min: 3, max: 50 })) return false
        return true
    }
}

export default Driver
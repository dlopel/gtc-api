export interface DriverCompressed {
    id: string
    dni: string
    dniImagePath: string
    license: string
    licenseImagePath: string
    contractImagePath: string | null
    name: string
    lastname: string
    cellphoneOne: string
    transportName?: string
}

export interface IDriver extends DriverCompressed {
    dniDateStart: string
    dniDateEnd: string
    licenseDateStart: string
    licenseDateEnd: string
    cellphoneTwo: string | null
    dateStart: string
    dateEnd: string | null
    observation: string | null
    transportId: string
}
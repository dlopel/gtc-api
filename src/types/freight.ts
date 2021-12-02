export interface CompressedFreight {
    id: string
    formattedId?: string
    dateStart: string
    dateEnd: string | null
    grt: string | null
    grr: string | null
    ton: string | null
    routeName?: string
    truckTractorLicensePlate?: string
    semiTrailerLicensePlate?: string
    driverFullName?: string
    transportName?: string
    clientName?: string
    serviceName?: string
}

export interface FreightStorage extends CompressedFreight {
    pallet: string | null
    routeId: string
    truckTractorId: string
    semiTrailerId: string
    driverId: string
    transportId: string
    clientId: string
    serviceId: string
    observation: string | null
}

export interface CompressedFreightsQueryBodyStorage {
    formattedId: string
    transportId: string
    clientId: string
    serviceId: string
    routeName: string
    truckTractorLicensePlate: string
    semiTrailerLicensePlate: string
    driverFullName: string
    dateStart: string
    dateEnd: string
    grt: string
    grr: string
    page: string | number
}

export interface FreightsNotLiquidatedQueryBodyStorage {
    transportId: string
    driverId: string
    dateStart: string
    dateEnd: string
}

export interface ClientFreightsQueryBodyStorage {
    clientId: string
    liquidated: string | boolean
    dateStart: string
    dateEnd: string
}
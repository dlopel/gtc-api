export interface UnitCompressed {
    id: string
    licensePlate: string
    brand: string
    color: string
    length: string | null
    height: string | null
    width: string | null
    dryWeight: string | null
    grossWeight: string | null
    usefulLoad: string | null
    bodyType: string
    policyEndorsement?: string
    policyImagePath?: string
    transportName?: string
}

export interface Unit extends UnitCompressed {
    model: string | null
    technicalReviewImagePath: string | null
    mtcImagePath: string | null
    propertyCardImagePath: string | null
    soatImagePath: string | null
    year: string | null
    engineNumber: string | null
    chassisNumber: string | null
    numberCylinders: string | null
    numberAxles: string | null
    numberTires: string | null
    numberSeats: string | null
    technicalReviewDateStart: string | null
    technicalReviewDateEnd: string | null
    mtcDateStart: string | null
    mtcDateEnd: string | null
    propertyCardDateStart: string | null
    propertyCardDateEnd: string | null
    soatDateStart: string | null
    soatDateEnd: string | null
    observation: string | null
    policyId: string | null
    transportId: string
}

export interface UnitImagePaths {
    technicalReviewImagePath: string
    mtcImagePath: string
    propertyCardImagePath: string
    soatImagePath: string
}

export interface UnitCompressedsQuery {
    licensePlate: string
    brand: string
    bodyType: string
    transportId: string
}
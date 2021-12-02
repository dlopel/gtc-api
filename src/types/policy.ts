interface PolicyStorage {
    id: string
    endorsement: string
    dateStart: string
    dateEnd: string
    insuranceCarrier: string
    insuranceCompany: string
    netPremium: string
    telephone: string
    imagePath: string
    observation: string | null
}

export default PolicyStorage
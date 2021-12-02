export interface ExpenseSettlementStorage {
    id: string
    formattedId?: string
    datePresentation: string
    toll: string
    viatic: string
    load: string
    unload: string
    garage: string
    washed: string
    tire: string
    mobility: string
    other: string
    otherDetail: string | null
    total: string
    deposits: string
    favorsTheCompany: string
    residue: string
    cancelled: string
    observation: string | null
}

export interface ExpenseSettlementsQueryBodyStorage {
    dateStart: string
    dateEnd: string
    liquidated: string
}
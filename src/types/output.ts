export interface OutputStorage {
    id: string
    bankId: string
    date: string
    value: string
    operation: string
    outputTypeId: string
    freightId: string
    observation: string
    userId: string
}

export interface OutputsQueryBodyStorage {
    bankId: string
    dateStart: string
    dateEnd: string
}
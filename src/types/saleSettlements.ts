export default interface SaleSettlementsStorage {
    id: string
    formattedId?: string
    date: string
    valueWithoutIgv: string
    clientId?: string
    clientName?: string
    observation: string | null
    valueIgv: string
    valueWithIgv: string
    invoiceNumber: string | null
    invoiceDate: string | null
}

export interface SaleSettlementsQueryBodyStorage {
    dateStart: string
    dateEnd: string
}
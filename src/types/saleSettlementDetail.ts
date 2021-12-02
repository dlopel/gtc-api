export default interface SaleSettlementDetailStorage {
    id: string
    freightId: string
    valueWithoutIgv: string
    valueAdditionalWithoutIgv: string
    valueAdditionalDetail: string
    observation: string | null
    saleSettlementId: string
    saleSettlementDetailList?: string
}
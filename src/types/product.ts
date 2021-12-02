export interface ProductCompressed {
    id: string
    name: string
    clientName?: string
}

export interface ProductStogare extends ProductCompressed {
    clientId: string
    observation: string
}

export interface CompressedProductsQueryBodyStorage {
    clientId: string
    name: string
    page: string | number
}
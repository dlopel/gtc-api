export interface RouteCompressed {
    id: string
    name: string
    addressStart: string
    addressEnd: string
    clientStart: string
    clientEnd: string
    value: string
    clientName?: string
}

export interface Route extends RouteCompressed {
    clientId: string
    observation: string | null
}

export interface CompressedRoutesQueryBodyStorage {
    clientId: string
    name: string
    page: string | number
}
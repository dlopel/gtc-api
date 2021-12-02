export interface ITransport extends CompressedTransport {
    observation: string | null
}

export interface CompressedTransport {
    id: string
    ruc: string
    name: string
    address: string
    telephone: string
}
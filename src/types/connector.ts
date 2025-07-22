export interface ConnectorPayload {
    meta: {
        endpoint: string
        episode?: string
        show: string | number
    }
    range?: {
        start: string
        end: string
    }
    data: object
    provider: string
}

export interface ConnectorPayload {
    meta: {
        endpoint: string
        episode?: string
    }
    range?: {
        start: string
        end: string
    }
    data: object
    provider: string
}

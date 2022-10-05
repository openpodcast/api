export interface ConnectorPayload {
    meta: {
        endpoint: string
    }
    data: Object
    provider: string
}

export interface SpotifyDetailedStreamsPayload {
    detailedStreams: {
        date: string
        starts: number
        streams: number
    }[]
}

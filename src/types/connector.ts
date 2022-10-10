export interface ConnectorPayload {
    meta: {
        endpoint: string
        episode?: string
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

export interface SpotifyListenersPayload {
    counts: {
        count: number
        date: string
    }[]
}

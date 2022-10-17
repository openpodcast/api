export interface ConnectorPayload {
    meta: {
        endpoint: string
        episode?: string
    }
    data: Object
    provider: string
}

export interface SpotifyPerformancePayload {
    samples: number[]
    sampleRate: number
    max: number
    seconds: number
    percentiles: {
        '25': number
        '50': number
        '75': number
        '100': number
    }
    medianCompletion: {
        percentage: number
        seconds: number
    }
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

export interface SpotifyEpisodeMetadata {
    name: string
    id: string
    url: string
    releaseDate: string
    artworkUrl: string
    description: string
    explict: boolean
    language: string
    duration: number
    starts: number
    streams: number
    listeners: number
    sparkLine: unknown[]
    hasVideo: boolean
    [k: string]: unknown
}

export interface SpotifyEpisodesMetadataPayload {
    episodes: SpotifyEpisodeMetadata[]
    [k: string]: unknown
}

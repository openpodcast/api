export interface ConnectorPayload {
    meta: {
        endpoint: string
        episode?: string
    }
    range: {
        start: string
        end: string
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

export interface SpotifyAggregatePayload {
    count: number
    ageFacetedCounts: {
        [ageGroup: string]: {
            counts: {
                [name: string]: number
            }
        }
    }
    genderedCounts: {
        counts: {
            [name: string]: number
        }
    }
}

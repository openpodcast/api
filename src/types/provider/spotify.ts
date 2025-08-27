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

export interface SpotifyGenderCounts {
    counts: {
        NOT_SPECIFIED: number
        FEMALE: number
        MALE: number
        NON_BINARY: number
        [k: string]: unknown
    }
    [k: string]: unknown
}

export interface SpotifyPodcastAggregatePayload {
    start: string
    end: string
    count: number
    ageFacetedCounts: {
        [ageGroup: string]: SpotifyGenderCounts
    }
    countryFacetedCounts?: {
        [country: string]: {
            counts: {
                NON_BINARY: number
                MALE: number
                FEMALE: number
                NOT_SPECIFIED: number
            }
            countryCode: string
        }
    }
    genderedCounts: SpotifyGenderCounts
}

export interface SpotifyEpisodeAggregatePayload {
    start: string
    end: string
    count: number
    ageFacetedCounts: {
        [ageGroup: string]: SpotifyGenderCounts
    }
    genderedCounts: SpotifyGenderCounts
}

export interface SpotifyPodcastMetadataPayload {
    name: string
    totalEpisodes: number
    starts: number
    streams: number
    listeners: number
    followers: number
    artworkUrl: string
    releaseDate: string
    url: string
    publisher: string
}

export interface SpotifyEpisodeMetadataPayload {
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

export interface SpotifyPodcastFollowersPayload {
    counts: {
        count: number
        date: string
        [k: string]: unknown
    }[]
    [k: string]: unknown
}

export interface SpotifyImpressionsTotalPayload {
    count: number
    start: string
    end: string
}

export interface SpotifyImpressionsDailyPayload {
    counts: {
        count: number
        date: string
    }[]
}

export interface SpotifyImpressionsFacetedPayload {
    count: number
    start: string
    end: string
    sourcedCounts: {
        counts: {
            SEARCH: number
            LIBRARY: number
            OTHER: number
            HOME: number
        }
    }
}

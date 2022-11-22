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
    count: number
    ageFacetedCounts: {
        [ageGroup: string]: SpotifyGenderCounts
    }
    countryFacetedCounts: {
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
    count: number
    ageFacetedCounts: {
        [ageGroup: string]: SpotifyGenderCounts
    }
    genderedCounts: SpotifyGenderCounts
}

export interface SpotifyPodcastMetadataPayload {
    totalEpisodes: number
    starts: number
    streams: number
    listeners: number
    followers: number
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

export interface SpotifyPodcastFollowersPayload {
    counts: {
        count: number
        date: string
        [k: string]: unknown
    }[]
    [k: string]: unknown
}

export interface AppleEpisodePayload {
    id: string
    name: string
    collectionName: string
    podcastEpisodeGuid: string
    podcastEpisodeITunesTitle: string
    podcastEpisodeNumber?: number
    podcastEpisodeType: string
    releaseDateTime: string
    releaseDate: string
    kind: string
    offers: {
        assets: {
            duration: number
        }[]
        download: {
            url: string
        }
    }[]
}

export interface AppleEpisodePlayCountPayload {
    episodeid: string
    followstate: string
    playscount: number
    podcastid: number
    totaltimelistened: number
    uniqueengagedlistenerscount: number
    uniquelistenerscount: number
}

export interface AppleEpisodesPayload {
    content: {
        results: {
            [episodeId: string]: AppleEpisodePayload
        }
    }
    episodesPlayCount: {
        [episodeId: string]: AppleEpisodePlayCountPayload[]
    }
}

export interface appleEpisodePlayCountAllTimePayload {
    episodeid: string
    followstate: string
    playscount: number
    podcastid: string
    totaltimelistened: number
    uniqueengagedlistenerscount: number
    uniquelistenerscount: number
    engagedplayscount: number
}

export interface appleEpisodeDetailsPayload {
    episodePlayCountAllTime: appleEpisodePlayCountAllTimePayload
    episodePlayHistogram: {
        [seconds: string]: number
    }[]
    showTopCities: {
        [cityId: string]: {
            latestValue: number
        }
    }
    showTopCountries: {
        [countryId: string]: {
            latestValue: number
        }
    }
}

export interface AppleEpisodePlayCountTrendsPayload
    extends AppleEpisodePlayCountPayload {
    timebucket: number
}
export interface AppleShowPlayCountTrendsPayload {
    followstate: string
    playscount: number
    podcastid: string
    timebucket: number
    totaltimelistened: number
    uniqueengagedlistenerscount: number
    uniquelistenerscount: number
}

export interface AppleShowTrendsListenersPayload {
    measure: 'LISTENERS'
    dimension: 'BY_EPISODES'
    episodesPlayCountTrends: {
        [episodeId: string]: AppleEpisodePlayCountTrendsPayload[]
    }
    showPlayCountTrends: AppleShowPlayCountTrendsPayload[]
}

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

export interface AppleShowTrendsListeningTimeFollowerStatePayload {
    measure: 'TIME_LISTENED'
    dimension: 'BY_FOLLOW_STATE'
    timeListenedByFollowStateFollowedTrends: [number, number][]
    timeListenedByFollowStateNotFollowedTrends: [number, number][]
    timeListenedByFollowStateStarTrends: [number, number][]
    [k: string]: unknown
}
export interface AppleShowTrendsListeningTimeFollowerStateDay {
    date: number
    totalListeningTimeFollowed: number
    totalListeningTimeNotFollowed: number
}
export interface AppleShowTrendsListenersPayload {
    measure: 'LISTENERS'
    dimension: 'BY_EPISODES'
    episodesPlayCountTrends: {
        [episodeId: string]: AppleEpisodePlayCountTrendsPayload[]
    }
    showPlayCountTrends: AppleShowPlayCountTrendsPayload[]
}

export interface AppleShowTrendsFollowersPayload {
    measure: 'FOLLOWERS'
    followerAllTimeTrends: number[][]
    followerGrowthTrends: number[][]
}

export interface AppleShowTrendsFollowersDay {
    date: number
    totalListeners: number
    gained: number
    lost: number
}

export interface AnchorColumnHeader {
    name: string
    type: 'integer' | 'string' | 'number'
    isDateTime?: boolean
}

export interface RawAnchorAggregatedPerformanceData {
    rows: [string, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export function convertToAnchorAggregatedPerformanceData(
    rawData: RawAnchorAggregatedPerformanceData
): AnchorAggregatedPerformanceData {
    const data: Partial<AnchorAggregatedPerformanceData> = {}

    for (const row of rawData.rows) {
        if (row[0] === 'percentile25') {
            data.percentile25 = row[1]
        } else if (row[0] === 'percentile50') {
            data.percentile50 = row[1]
        } else if (row[0] === 'percentile75') {
            data.percentile75 = row[1]
        } else if (row[0] === 'percentile100') {
            data.percentile100 = row[1]
        } else if (row[0] === 'averageListenSeconds') {
            data.averageListenSeconds = row[1]
        }
    }

    if (
        !data.percentile25 ||
        !data.percentile50 ||
        !data.percentile75 ||
        !data.percentile100 ||
        !data.averageListenSeconds
    ) {
        throw new Error('Incomplete data.')
    }

    return data as AnchorAggregatedPerformanceData
}

export interface AnchorAggregatedPerformanceData {
    percentile25: number
    percentile50: number
    percentile75: number
    percentile100: number
    averageListenSeconds: number
}

export interface RawAnchorAudienceSizeData {
    rows: number[]
    columnHeaders: [AnchorColumnHeader]
}

export interface AnchorPlaysData {
    rows: [number, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface AnchorPlaysByAgeRangeData {
    rows: [string, number][]
    translationMapping: Record<string, string>
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
    colors: Record<string, string>
}

export interface AnchorPlaysByAppData {
    rows: [string, number][]
    translationMapping: Record<string, string>
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
    colors: Record<string, string>
}

export interface AnchorPlaysByGeoData {
    rows: [string, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
    assets: {
        flagUrlByGeo: Record<string, string>
    }
}

export interface AnchorPlaysByDeviceData {
    rows: [string, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface AnchorEpisodePlaysData {
    rows: [string, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface AnchorPlaysByGenderData {
    rows: [string, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface AnchorTotalPlaysData {
    rows: [number][]
    columnHeaders: [AnchorColumnHeader]
}

export interface AnchorTotalPlaysByEpisodeData {
    rows: [string, number, number, number, number][]
    columnHeaders: [
        AnchorColumnHeader,
        AnchorColumnHeader,
        AnchorColumnHeader,
        AnchorColumnHeader,
        AnchorColumnHeader
    ]
}

export interface AnchorUniqueListenersData {
    rows: [number][]
    columnHeaders: [AnchorColumnHeader]
}

export type AnchorDataPayload =
    | { kind: 'aggregatedPerformance'; data: AnchorAggregatedPerformanceData }
    | { kind: 'audienceSize'; data: RawAnchorAudienceSizeData }
    | { kind: 'plays'; data: AnchorPlaysData }
    | { kind: 'playsByAgeRange'; data: AnchorPlaysByAgeRangeData }
    | { kind: 'playsByApp'; data: AnchorPlaysByAppData }
    | { kind: 'playsByDevice'; data: AnchorPlaysByDeviceData }
    | { kind: 'playsByEpisode'; data: AnchorEpisodePlaysData }
    | { kind: 'playsByGender'; data: AnchorPlaysByGenderData }
    | { kind: 'playsByGeo'; data: AnchorPlaysByGeoData }
    | { kind: 'totalPlays'; data: AnchorTotalPlaysData }
    | { kind: 'totalPlaysByEpisode'; data: AnchorTotalPlaysByEpisodeData }
    | { kind: 'uniqueListeners'; data: AnchorUniqueListenersData }

export interface AnchorConnectorPayload {
    meta: {
        endpoint: string
        episode?: string
    }
    range: {
        start: string
        end: string
    }
    // Make use of `AnchorDataPayload` union type
    // stationId needs to be set in the `data` object as well
    data: AnchorDataPayload & { stationId: string }
    provider: string
}

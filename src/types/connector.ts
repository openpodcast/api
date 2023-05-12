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

export interface RawAnchorEpisodePerformanceData {
    rows: [number, string][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface RawAnchorPlaysData {
    rows: [number, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface RawAnchorPlaysByAgeRangeData {
    rows: [string, number][]
    translationMapping: Record<string, string>
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
    colors: Record<string, string>
}

export interface RawAnchorPlaysByAppData {
    rows: [string, number][]
    translationMapping: Record<string, string>
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
    colors: Record<string, string>
}

export interface RawAnchorPlaysByGeoData {
    rows: [string, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
    assets: {
        flagUrlByGeo: Record<string, string>
    }
}

export interface RawAnchorPlaysByDeviceData {
    rows: [string, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface RawAnchorEpisodePlaysData {
    rows: [number, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface AnchorEpisodePlaysData {
    episodeId: string
    data: Map<Date, number>
}

export function convertToAnchorEpisodePlaysData(
    rawData: RawAnchorEpisodePlaysData
): AnchorEpisodePlaysData {
    const data: Map<Date, number> = new Map()
    for (const row of rawData.rows) {
        const timestamp = row[0] * 1000
        const date = new Date(timestamp)
        const value = row[1]
        data.set(date, value)
    }
    return {
        episodeId: rawData.columnHeaders[0].name,
        data: data,
    }
}

export interface AnchorPlaysData {
    data: Map<Date, number>
}

// TODO: Merge with `convertToAnchorEpisodePlaysData`
export function convertToAnchorPlaysData(
    rawData: RawAnchorPlaysData
): AnchorPlaysData {
    const data: Map<Date, number> = new Map()
    for (const row of rawData.rows) {
        const timestamp = row[0] * 1000
        const date = new Date(timestamp)
        const value = row[1]
        data.set(date, value)
    }
    return {
        data: data,
    }
}

export interface RawAnchorPlaysByGenderData {
    rows: [string, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface RawAnchorTotalPlaysData {
    rows: [number][]
    columnHeaders: [AnchorColumnHeader]
}

export interface RawAnchorTotalPlaysByEpisodeData {
    rows: [string, number, number, number, number][]
    columnHeaders: [
        AnchorColumnHeader,
        AnchorColumnHeader,
        AnchorColumnHeader,
        AnchorColumnHeader,
        AnchorColumnHeader
    ]
}

export interface RawAnchorUniqueListenersData {
    rows: [number][]
    columnHeaders: [AnchorColumnHeader]
}

export type AnchorDataPayload =
    | { kind: 'aggregatedPerformance'; data: AnchorAggregatedPerformanceData }
    | { kind: 'audienceSize'; data: RawAnchorAudienceSizeData }
    | { kind: 'performance'; data: RawAnchorEpisodePerformanceData }
    | { kind: 'plays'; data: RawAnchorPlaysData }
    | { kind: 'playsByAgeRange'; data: RawAnchorPlaysByAgeRangeData }
    | { kind: 'playsByApp'; data: RawAnchorPlaysByAppData }
    | { kind: 'playsByDevice'; data: RawAnchorPlaysByDeviceData }
    | { kind: 'playsByEpisode'; data: RawAnchorEpisodePlaysData }
    | { kind: 'playsByGender'; data: RawAnchorPlaysByGenderData }
    | { kind: 'playsByGeo'; data: RawAnchorPlaysByGeoData }
    | { kind: 'totalPlays'; data: RawAnchorTotalPlaysData }
    | { kind: 'totalPlaysByEpisode'; data: RawAnchorTotalPlaysByEpisodeData }
    | { kind: 'uniqueListeners'; data: RawAnchorUniqueListenersData }

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

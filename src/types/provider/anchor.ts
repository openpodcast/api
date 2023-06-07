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

    if (data.percentile25 === undefined) {
        throw new Error('Missing percentile25.')
    }
    if (data.percentile50 === undefined) {
        throw new Error('Missing percentile50.')
    }
    if (data.percentile75 === undefined) {
        throw new Error('Missing percentile75.')
    }
    if (data.percentile100 === undefined) {
        throw new Error('Missing percentile100.')
    }
    if (data.averageListenSeconds === undefined) {
        throw new Error('Missing averageListenSeconds.')
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

export interface AnchorPlaysByAgeRangeData {
    data: Map<string, number>
}

export function convertToAnchorPlaysByAgeRangeData(
    rawData: RawAnchorPlaysByAgeRangeData
): AnchorPlaysByAgeRangeData {
    const data = new Map<string, number>()

    for (const row of rawData.rows) {
        data.set(row[0], row[1])
    }

    return { data }
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

export interface RawAnchorPlaysByEpisodeData {
    rows: [number, number][]
    columnHeaders: [AnchorColumnHeader, AnchorColumnHeader]
}

export interface AnchorEpisodePlaysData {
    episodeId: string
    data: Map<Date, number>
}

export function convertToAnchorEpisodePlaysData(
    rawData: RawAnchorPlaysByEpisodeData
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
    | { kind: 'playsByEpisode'; data: RawAnchorPlaysByEpisodeData }
    | { kind: 'playsByGender'; data: RawAnchorPlaysByGenderData }
    | {
          kind: 'playsByGeo'
          parameters: { geos: string[] }
          data: RawAnchorPlaysByGeoData
      }
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
    data: AnchorConnectorPayloadData
    provider: string
}

type AnchorConnectorPayloadData =
    | (AnchorDataPayload & { stationId: string })
    | RawAnchorPodcastData

export interface RawAnchorEpisodeData {
    adCount: number
    created: string
    createdUnixTimestamp: number
    description: string
    duration: number
    hourOffset: number
    isDeleted: boolean
    isPublished: boolean
    podcastEpisodeId: string
    publishOn: string
    publishOnUnixTimestamp: number
    title: string
    url: string
    trackedUrl: string
    episodeImage: null | string
    shareLinkPath: string
    shareLinkEmbedPath: string
}

export interface RawAnchorPodcastData {
    allEpisodeWebIds: string[]
    podcastId: string
    podcastEpisodes: RawAnchorEpisodeData[]
    totalPodcastEpisodes: number
    vanitySlug: string
    stationCreatedDate: string
}

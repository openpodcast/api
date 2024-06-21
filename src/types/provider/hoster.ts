export interface HosterPodcastMetadataPayload {
    name: string
}

export interface HosterEpisodeMetadataPayload {
    name: string
    url: string
    release_date: string
}

export interface HosterMetricsPayload {
    start: string
    end: string
    dimension: string
    subdimension?: string
    value: number
}

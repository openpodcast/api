export interface HosterPodcastMetadataPayload {
    name: string
}

export interface HosterEpisodeMetadataPayload {
    ep_name: string
    ep_url: string
    ep_release_date: string
}

export interface HosterMetricsPayload {
    start: string
    end: string
    dimension: string
    subdimension?: string
    value: number
}

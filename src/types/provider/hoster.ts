// Metadata for a podcast from a hoster
export interface HosterPodcastMetadataPayload {
    name: string
}

// Metadata for a single episode from a hoster
export interface HosterEpisodeMetadataPayload {
    ep_name: string
    ep_url: string
    ep_release_date: string
}

// A single metric from a hoster
export interface HosterMetric {
    start: string
    end: string
    dimension: string
    value: number
    // Examples for "dimension: subdimension":
    // - downloads: total,
    // - clients: PocketCast,
    // - countries: regions
    subdimension?: string
}

// Metrics from a hoster
export interface HosterMetricsPayload {
    metrics?: HosterMetric[]
}

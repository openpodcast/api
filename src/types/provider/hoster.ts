export interface HosterPodcastMetadata {
    name: string
}

export interface HosterEpisodeMetadata {
    name: string
    url: string
    release_date: string
}

export interface HosterMetrics {
    start: string
    end: string
    dimension: string
    subdimension: string
    value: number
}

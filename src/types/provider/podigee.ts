export interface HosterPodcastDetails {
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

export interface RawHosterPodcastAnalyticsData {}

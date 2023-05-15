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

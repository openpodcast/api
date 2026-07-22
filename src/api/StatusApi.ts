import { StatusRepository } from '../db/StatusRepository'
import { StatusPayload } from '../types/api'

type AlertData = {
    podcastId: number
    endpoint: string
    ageHours: number
}

type FailedPodcast = {
    podcastId: number
    podcastName: string | null
}

type DailyEndpointStatistics = {
    date: string
    title: string
    isUnavailable: boolean
    isDegraded: boolean
    requests: {
        total: number
        successful: number
        failed: number
        successRate: number
    }
}

type EndpointStatistics = {
    provider: string
    endpoint: string
    requests: {
        total: number
        successful: number
        failed: number
        successRate: number
    }
    failedPodcasts: FailedPodcast[]
    days: DailyEndpointStatistics[]
}

const getEndpointAgeHours = (endpointDate: Date) => {
    return Math.round(
        (new Date().getTime() - new Date(endpointDate).getTime()) /
            (1000 * 60 * 60)
    )
}

const splitEndpointIdentifier = (identifier: string) => {
    const [provider, ...endpointParts] = identifier.split('/')

    return {
        provider,
        endpoint: endpointParts.join('/'),
    }
}

const getEndpointIdentifier = (provider: string, endpoint: string) => {
    return `${provider}/${endpoint}`
}

const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

const getDateRange = (periodDays: number) => {
    const endDate = new Date()
    const dates: string[] = []

    for (let offset = periodDays - 1; offset >= 0; offset--) {
        const date = new Date(endDate)
        date.setDate(date.getDate() - offset)
        dates.push(formatDate(date))
    }

    return dates
}

const emptyRequests = () => ({
    total: 0,
    successful: 0,
    failed: 0,
    successRate: 0,
})

const updateSuccessRate = (requests: EndpointStatistics['requests']) => {
    requests.successRate =
        requests.total > 0 ? requests.successful / requests.total : 0
}

const getDayTitle = (
    date: string,
    requests: EndpointStatistics['requests']
) => {
    if (requests.total === 0) {
        return `${date}: no data available`
    }

    return `${date}: ${requests.successful}/${requests.total} successful, ${requests.failed} failed`
}

class StatusApi {
    statusRepo: StatusRepository

    constructor(statusRepo: StatusRepository) {
        this.statusRepo = statusRepo
    }

    // Returns the latest status for the given accountId and endpoint
    async getStatus() {
        return await this.statusRepo.getStatus()
    }

    // checks all dates and create yellow and red alerts if too old
    // returns an object with the alerts if there are any
    getAgeAlerts(
        statusData: {
            [podcastId: number]: {
                latestUpdates: { [endpointName: string]: Date }
            }
        },
        yellowAgeHours: number,
        redAgeHours: number
    ) {
        const yellowAlerts: AlertData[] = []
        const redAlerts: AlertData[] = []
        Object.entries(statusData).forEach(([podcastIdStr, podcastData]) => {
            // as entries returns key as string, cast to number
            const podcastId = parseInt(podcastIdStr)
            Object.entries(podcastData.latestUpdates).forEach(
                ([endpointName, endpointDate]) => {
                    const ageHours = getEndpointAgeHours(endpointDate)
                    if (ageHours >= redAgeHours) {
                        redAlerts.push({
                            podcastId: podcastId,
                            endpoint: endpointName,
                            ageHours: ageHours,
                        })
                    } else if (ageHours >= yellowAgeHours) {
                        yellowAlerts.push({
                            podcastId: podcastId,
                            endpoint: endpointName,
                            ageHours: ageHours,
                        })
                    }
                }
            )
        })
        const alerts: { yellow?: AlertData[]; red?: AlertData[] } = {}
        // only add alerts if there are any
        // this allows the client to look for the presence of the key yellow or red
        // to determine if there are any alerts. this is easier for monitors as
        // they don't have to parse json
        if (yellowAlerts.length > 0) {
            alerts.yellow = yellowAlerts
        }
        if (redAlerts.length > 0) {
            alerts.red = redAlerts
        }
        return alerts
    }

    async getEndpointStatistics(
        periodDays: number
    ): Promise<EndpointStatistics[]> {
        const status = await this.getStatus()
        const dailyUpdates = await this.statusRepo.getDailyEndpointUpdates(
            periodDays
        )
        const firstUpdates = await this.statusRepo.getEndpointFirstUpdates()
        const maxAgeHours = periodDays * 24
        const dates = getDateRange(periodDays)
        const statistics: EndpointStatistics[] = []
        const statisticsByEndpoint: { [key: string]: EndpointStatistics } = {}
        const successfulPodcastsByEndpointAndDate: {
            [endpointIdentifier: string]: { [date: string]: Set<number> }
        } = {}
        const firstUpdateByEndpointAndPodcast: {
            [endpointIdentifier: string]: { [podcastId: number]: string }
        } = {}

        Object.entries(status).forEach(([podcastIdStr, podcastData]) => {
            const podcastId = parseInt(podcastIdStr)

            Object.entries(podcastData.latestUpdates).forEach(
                ([endpointIdentifier, endpointDate]) => {
                    if (!statisticsByEndpoint[endpointIdentifier]) {
                        const { provider, endpoint } =
                            splitEndpointIdentifier(endpointIdentifier)

                        statisticsByEndpoint[endpointIdentifier] = {
                            provider,
                            endpoint,
                            requests: emptyRequests(),
                            failedPodcasts: [],
                            days: dates.map((date) => ({
                                date,
                                title: `${date}: no data available`,
                                isUnavailable: true,
                                isDegraded: false,
                                requests: emptyRequests(),
                            })),
                        }
                        statistics.push(
                            statisticsByEndpoint[endpointIdentifier]
                        )
                    }

                    const endpointStatistics =
                        statisticsByEndpoint[endpointIdentifier]
                    const ageHours = getEndpointAgeHours(endpointDate)
                    const hasRecentSuccessfulUpdate = ageHours < maxAgeHours

                    endpointStatistics.requests.total += 1
                    if (hasRecentSuccessfulUpdate) {
                        endpointStatistics.requests.successful += 1
                    } else {
                        endpointStatistics.requests.failed += 1
                        endpointStatistics.failedPodcasts.push({
                            podcastId,
                            podcastName: null,
                        })
                    }
                }
            )
        })

        firstUpdates.forEach((update) => {
            const endpointIdentifier = getEndpointIdentifier(
                update.provider,
                update.endpoint
            )
            if (!firstUpdateByEndpointAndPodcast[endpointIdentifier]) {
                firstUpdateByEndpointAndPodcast[endpointIdentifier] = {}
            }

            firstUpdateByEndpointAndPodcast[endpointIdentifier][
                update.accountId
            ] = update.date
        })

        dailyUpdates.forEach((update) => {
            const endpointIdentifier = getEndpointIdentifier(
                update.provider,
                update.endpoint
            )
            if (!successfulPodcastsByEndpointAndDate[endpointIdentifier]) {
                successfulPodcastsByEndpointAndDate[endpointIdentifier] = {}
            }
            if (
                !successfulPodcastsByEndpointAndDate[endpointIdentifier][
                    update.date
                ]
            ) {
                successfulPodcastsByEndpointAndDate[endpointIdentifier][
                    update.date
                ] = new Set()
            }

            successfulPodcastsByEndpointAndDate[endpointIdentifier][
                update.date
            ].add(update.accountId)
        })

        statistics.forEach((endpointStatistics) => {
            updateSuccessRate(endpointStatistics.requests)
            const endpointIdentifier = getEndpointIdentifier(
                endpointStatistics.provider,
                endpointStatistics.endpoint
            )
            const successfulPodcastsByDate =
                successfulPodcastsByEndpointAndDate[endpointIdentifier] ?? {}
            const firstUpdateByPodcast =
                firstUpdateByEndpointAndPodcast[endpointIdentifier] ?? {}

            endpointStatistics.days.forEach((day) => {
                day.requests.total = Object.values(firstUpdateByPodcast).filter(
                    (firstUpdateDate) => firstUpdateDate <= day.date
                ).length
                day.requests.successful =
                    successfulPodcastsByDate[day.date]?.size ?? 0
                day.requests.failed = Math.max(
                    day.requests.total - day.requests.successful,
                    0
                )
                updateSuccessRate(day.requests)
                day.isUnavailable = day.requests.total === 0
                day.isDegraded =
                    day.requests.total > 0 && day.requests.failed > 0
                day.title = getDayTitle(day.date, day.requests)
            })
        })

        return statistics
    }

    async updateStatus(accountId: number, update: StatusPayload): Promise<any> {
        return await this.statusRepo.updateStatus(accountId, update)
    }
}

export { StatusApi, EndpointStatistics }

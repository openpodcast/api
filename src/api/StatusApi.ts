import { StatusRepository } from '../db/StatusRepository'
import { StatusPayload } from '../types/api'

type AlertData = {
    podcastId: number
    endpoint: string
    ageHours: number
}

type DailyEndpointStatistics = {
    date: string
    title: string
    hasUpdates: boolean
    successfulUpdates: number
}

type EndpointStatistics = {
    provider: string
    endpoint: string
    podcastCount: number
    successfulUpdates: number
    activeDays: number
    lastSuccessfulAt: string | null
    lastSuccessfulAgeHours: number | null
    lastSuccessfulLabel: string
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

const getDayTitle = (date: string, successfulUpdates: number) => {
    if (successfulUpdates === 1) {
        return `${date}: 1 successful import recorded`
    }

    return `${date}: ${successfulUpdates} successful imports recorded`
}

const getLastSuccessfulLabel = (ageHours: number | null) => {
    if (ageHours === null) {
        return 'No successful import recorded'
    }

    if (ageHours < 1) {
        return 'Last success less than 1 hour ago'
    }

    if (ageHours === 1) {
        return 'Last success 1 hour ago'
    }

    return `Last success ${ageHours} hours ago`
}

const formatDateTime = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
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
        const dates = getDateRange(periodDays)
        const statistics: EndpointStatistics[] = []
        const statisticsByEndpoint: { [key: string]: EndpointStatistics } = {}
        const successfulPodcastsByEndpointAndDate: {
            [endpointIdentifier: string]: { [date: string]: Set<number> }
        } = {}
        const observedPodcastsByEndpoint: {
            [endpointIdentifier: string]: Set<number>
        } = {}
        const latestSuccessfulDateByEndpoint: {
            [endpointIdentifier: string]: Date
        } = {}

        const ensureEndpointStatistics = (endpointIdentifier: string) => {
            if (!statisticsByEndpoint[endpointIdentifier]) {
                const { provider, endpoint } =
                    splitEndpointIdentifier(endpointIdentifier)

                statisticsByEndpoint[endpointIdentifier] = {
                    provider,
                    endpoint,
                    podcastCount: 0,
                    successfulUpdates: 0,
                    activeDays: 0,
                    lastSuccessfulAt: null,
                    lastSuccessfulAgeHours: null,
                    lastSuccessfulLabel: getLastSuccessfulLabel(null),
                    days: dates.map((date) => ({
                        date,
                        title: getDayTitle(date, 0),
                        hasUpdates: false,
                        successfulUpdates: 0,
                    })),
                }
                statistics.push(statisticsByEndpoint[endpointIdentifier])
            }

            return statisticsByEndpoint[endpointIdentifier]
        }

        Object.entries(status).forEach(([podcastIdStr, podcastData]) => {
            const podcastId = parseInt(podcastIdStr)

            Object.entries(podcastData.latestUpdates).forEach(
                ([endpointIdentifier, endpointDate]) => {
                    const endpointStatistics =
                        ensureEndpointStatistics(endpointIdentifier)

                    if (!observedPodcastsByEndpoint[endpointIdentifier]) {
                        observedPodcastsByEndpoint[endpointIdentifier] =
                            new Set()
                    }
                    observedPodcastsByEndpoint[endpointIdentifier].add(
                        podcastId
                    )

                    if (
                        !latestSuccessfulDateByEndpoint[endpointIdentifier] ||
                        endpointDate >
                            latestSuccessfulDateByEndpoint[endpointIdentifier]
                    ) {
                        const ageHours = getEndpointAgeHours(endpointDate)

                        latestSuccessfulDateByEndpoint[endpointIdentifier] =
                            endpointDate
                        endpointStatistics.lastSuccessfulAt =
                            formatDateTime(endpointDate)
                        endpointStatistics.lastSuccessfulAgeHours = ageHours
                        endpointStatistics.lastSuccessfulLabel =
                            getLastSuccessfulLabel(ageHours)
                    }
                }
            )
        })

        dailyUpdates.forEach((update) => {
            const endpointIdentifier = getEndpointIdentifier(
                update.provider,
                update.endpoint
            )
            ensureEndpointStatistics(endpointIdentifier)

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
            const endpointIdentifier = getEndpointIdentifier(
                endpointStatistics.provider,
                endpointStatistics.endpoint
            )
            const successfulPodcastsByDate =
                successfulPodcastsByEndpointAndDate[endpointIdentifier] ?? {}

            endpointStatistics.podcastCount =
                observedPodcastsByEndpoint[endpointIdentifier]?.size ?? 0

            // The updates table only records successful imports. We therefore
            // show observed successful imports only. Missing days are not marked
            // as failures here because failed import attempts are not stored yet.
            endpointStatistics.days.forEach((day) => {
                day.successfulUpdates =
                    successfulPodcastsByDate[day.date]?.size ?? 0
                day.hasUpdates = day.successfulUpdates > 0
                day.title = getDayTitle(day.date, day.successfulUpdates)
            })

            endpointStatistics.successfulUpdates =
                endpointStatistics.days.reduce(
                    (total, day) => total + day.successfulUpdates,
                    0
                )
            endpointStatistics.activeDays = endpointStatistics.days.filter(
                (day) => day.hasUpdates
            ).length
        })

        return statistics
    }

    async updateStatus(accountId: number, update: StatusPayload): Promise<any> {
        return await this.statusRepo.updateStatus(accountId, update)
    }
}

export { StatusApi, EndpointStatistics }

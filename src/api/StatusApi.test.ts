import { StatusApi } from './StatusApi'
import { StatusRepository } from '../db/StatusRepository'

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

describe('StatusApi', () => {
    it('returns endpoint statistics from the same status data as the status endpoint', async () => {
        const periodDays = 90
        const dates = getDateRange(periodDays)
        const firstAvailableDate = dates[1]
        const today = dates[dates.length - 1]
        const recentDate = new Date()
        recentDate.setDate(recentDate.getDate() - 1)

        const oldDate = new Date()
        oldDate.setDate(oldDate.getDate() - 100)

        const statusRepo = {
            getStatus: jest.fn().mockResolvedValue({
                1: {
                    latestUpdates: {
                        'spotify/aggregate': recentDate,
                        'apple/trends': oldDate,
                    },
                },
                2: {
                    latestUpdates: {
                        'spotify/aggregate': oldDate,
                    },
                },
                3: {
                    latestUpdates: {
                        'spotify/aggregate': recentDate,
                    },
                },
            }),
            getDailyEndpointUpdates: jest.fn().mockResolvedValue([
                {
                    accountId: 1,
                    provider: 'spotify',
                    endpoint: 'aggregate',
                    date: today,
                },
                {
                    accountId: 3,
                    provider: 'spotify',
                    endpoint: 'aggregate',
                    date: today,
                },
            ]),
            getEndpointFirstUpdates: jest.fn().mockResolvedValue([
                {
                    accountId: 1,
                    provider: 'spotify',
                    endpoint: 'aggregate',
                    date: firstAvailableDate,
                },
                {
                    accountId: 2,
                    provider: 'spotify',
                    endpoint: 'aggregate',
                    date: firstAvailableDate,
                },
                {
                    accountId: 3,
                    provider: 'spotify',
                    endpoint: 'aggregate',
                    date: firstAvailableDate,
                },
                {
                    accountId: 1,
                    provider: 'apple',
                    endpoint: 'trends',
                    date: today,
                },
            ]),
        } as unknown as StatusRepository

        const statusApi = new StatusApi(statusRepo)

        const statistics = await statusApi.getEndpointStatistics(periodDays)

        expect(statusRepo.getDailyEndpointUpdates).toHaveBeenCalledWith(
            periodDays
        )
        expect(statusRepo.getEndpointFirstUpdates).toHaveBeenCalledTimes(1)
        expect(statistics).toHaveLength(2)
        expect(statistics[0]).toEqual(
            expect.objectContaining({
                provider: 'spotify',
                endpoint: 'aggregate',
                requests: {
                    total: 3,
                    successful: 2,
                    failed: 1,
                    successRate: 2 / 3,
                },
                failedPodcasts: [
                    {
                        podcastId: 2,
                        podcastName: null,
                    },
                ],
            })
        )
        expect(statistics[0].days).toHaveLength(periodDays)
        expect(statistics[0].days[0]).toEqual({
            date: dates[0],
            title: `${dates[0]}: no data available`,
            isUnavailable: true,
            isDegraded: false,
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                successRate: 0,
            },
        })
        expect(statistics[0].days[1]).toEqual({
            date: firstAvailableDate,
            title: `${firstAvailableDate}: 0/3 successful, 3 failed`,
            isUnavailable: false,
            isDegraded: true,
            requests: {
                total: 3,
                successful: 0,
                failed: 3,
                successRate: 0,
            },
        })
        expect(statistics[0].days[periodDays - 1]).toEqual({
            date: today,
            title: `${today}: 2/3 successful, 1 failed`,
            isUnavailable: false,
            isDegraded: true,
            requests: {
                total: 3,
                successful: 2,
                failed: 1,
                successRate: 2 / 3,
            },
        })
        expect(statistics[1]).toEqual(
            expect.objectContaining({
                provider: 'apple',
                endpoint: 'trends',
                requests: {
                    total: 1,
                    successful: 0,
                    failed: 1,
                    successRate: 0,
                },
                failedPodcasts: [
                    {
                        podcastId: 1,
                        podcastName: null,
                    },
                ],
            })
        )
    })
})

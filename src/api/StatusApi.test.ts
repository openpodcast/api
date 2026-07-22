import { StatusApi } from './StatusApi'
import { StatusRepository } from '../db/StatusRepository'

const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

const formatDateTime = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
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
    it('returns only observed successful endpoint import statistics', async () => {
        const periodDays = 90
        const dates = getDateRange(periodDays)
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
        } as unknown as StatusRepository

        const statusApi = new StatusApi(statusRepo)

        const statistics = await statusApi.getEndpointStatistics(periodDays)

        expect(statusRepo.getDailyEndpointUpdates).toHaveBeenCalledWith(
            periodDays
        )
        expect(statistics).toHaveLength(2)
        expect(statistics[0]).toEqual(
            expect.objectContaining({
                provider: 'spotify',
                endpoint: 'aggregate',
                podcastCount: 3,
                successfulUpdates: 2,
                activeDays: 1,
                lastSuccessfulAt: formatDateTime(recentDate),
                lastSuccessfulAgeHours: expect.any(Number),
                lastSuccessfulLabel: expect.stringMatching(
                    /^Last success \d+ hours ago$/
                ),
            })
        )
        expect(statistics[0].days).toHaveLength(periodDays)
        expect(statistics[0].days[0]).toEqual({
            date: dates[0],
            title: `${dates[0]}: 0 successful imports recorded`,
            hasUpdates: false,
            successfulUpdates: 0,
        })
        expect(statistics[0].days[periodDays - 1]).toEqual({
            date: today,
            title: `${today}: 2 successful imports recorded`,
            hasUpdates: true,
            successfulUpdates: 2,
        })
        expect(statistics[1]).toEqual(
            expect.objectContaining({
                provider: 'apple',
                endpoint: 'trends',
                podcastCount: 1,
                successfulUpdates: 0,
                activeDays: 0,
                lastSuccessfulAt: formatDateTime(oldDate),
                lastSuccessfulAgeHours: expect.any(Number),
                lastSuccessfulLabel: expect.stringMatching(
                    /^Last success \d+ hours ago$/
                ),
            })
        )
    })
})

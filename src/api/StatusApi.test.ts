import { StatusApi, MutedAlert } from './StatusApi'
import { StatusRepository } from '../db/StatusRepository'

describe('StatusApi.getAgeAlerts', () => {
    // The repository is not used by getAgeAlerts, so a bare object is enough.
    const statusApi = new StatusApi({} as StatusRepository)

    // A timestamp old enough to trigger a red alert
    const staleDate = new Date(Date.now() - 100 * 60 * 60 * 1000)

    const yellowAgeHours = 26
    const redAgeHours = 50

    it('creates a red alert for stale data when nothing is muted', () => {
        const status = {
            3701: { latestUpdates: { 'anchor/playsByGender': staleDate } },
        }

        const alerts = statusApi.getAgeAlerts(
            status,
            yellowAgeHours,
            redAgeHours
        )

        expect(alerts.red).toHaveLength(1)
        expect(alerts.red?.[0]).toMatchObject({
            podcastId: 3701,
            endpoint: 'anchor/playsByGender',
        })
    })

    it('suppresses alerts for a muted podcast/endpoint combination', () => {
        const status = {
            3701: { latestUpdates: { 'anchor/playsByGender': staleDate } },
        }
        const muted: MutedAlert[] = [
            { podcastId: 3701, endpoint: 'anchor/playsByGender' },
        ]

        const alerts = statusApi.getAgeAlerts(
            status,
            yellowAgeHours,
            redAgeHours,
            muted
        )

        expect(alerts.red).toBeUndefined()
        expect(alerts.yellow).toBeUndefined()
    })

    it('only mutes the specified endpoint, not other endpoints of the podcast', () => {
        const status = {
            3701: {
                latestUpdates: {
                    'anchor/playsByGender': staleDate,
                    'anchor/plays': staleDate,
                },
            },
        }
        const muted: MutedAlert[] = [
            { podcastId: 3701, endpoint: 'anchor/playsByGender' },
        ]

        const alerts = statusApi.getAgeAlerts(
            status,
            yellowAgeHours,
            redAgeHours,
            muted
        )

        expect(alerts.red).toHaveLength(1)
        expect(alerts.red?.[0]).toMatchObject({
            podcastId: 3701,
            endpoint: 'anchor/plays',
        })
    })

    it('only mutes the specified podcast, not the same endpoint on other podcasts', () => {
        const status = {
            3701: { latestUpdates: { 'anchor/playsByGender': staleDate } },
            42: { latestUpdates: { 'anchor/playsByGender': staleDate } },
        }
        const muted: MutedAlert[] = [
            { podcastId: 3701, endpoint: 'anchor/playsByGender' },
        ]

        const alerts = statusApi.getAgeAlerts(
            status,
            yellowAgeHours,
            redAgeHours,
            muted
        )

        expect(alerts.red).toHaveLength(1)
        expect(alerts.red?.[0]).toMatchObject({
            podcastId: 42,
            endpoint: 'anchor/playsByGender',
        })
    })
})

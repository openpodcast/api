import { StatusApi } from './StatusApi'
import { StatusRepository } from '../db/StatusRepository'

const GRAFANA_EXPLORE_URL = 'https://openpodcast.grafana.net/explore'

describe('StatusApi', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 6, 22, 12, 0, 0))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('returns stale import issues from latest status data', () => {
        const statusRepo = {} as StatusRepository
        const statusApi = new StatusApi(statusRepo)

        const report = statusApi.getImportIssueReport(
            {
                1: {
                    latestUpdates: {
                        'spotify/metadata': new Date(2026, 6, 22, 0, 0, 0),
                        'spotify/aggregate': new Date(2026, 6, 21, 6, 0, 0),
                    },
                },
                2: {
                    latestUpdates: {
                        'apple/episodeDetails': new Date(2026, 6, 20, 8, 0, 0),
                        'spotify/aggregate': new Date(2026, 6, 19, 4, 0, 0),
                    },
                },
            },
            24
        )

        expect(report.summary).toEqual({
            issueCount: 3,
            affectedPodcastCount: 2,
            affectedEndpointCount: 2,
            worstAgeHours: 80,
            hasIssues: true,
        })
        expect(report.issues).toEqual([
            {
                podcastId: 2,
                provider: 'spotify',
                endpoint: 'aggregate',
                latestUpdateAt: '2026-07-19 04:00',
                ageHours: 80,
                severity: 'serious',
                severityLabel: 'Needs attention',
                guidance: 'Check the import pipeline and provider credentials.',
                grafanaUrl: expect.stringContaining(GRAFANA_EXPLORE_URL),
            },
            {
                podcastId: 2,
                provider: 'apple',
                endpoint: 'episodeDetails',
                latestUpdateAt: '2026-07-20 08:00',
                ageHours: 52,
                severity: 'concerning',
                severityLabel: 'Concerning',
                guidance: 'Check whether the pipeline is delayed or stuck.',
                grafanaUrl: expect.stringContaining(GRAFANA_EXPLORE_URL),
            },
            {
                podcastId: 1,
                provider: 'spotify',
                endpoint: 'aggregate',
                latestUpdateAt: '2026-07-21 06:00',
                ageHours: 30,
                severity: 'stale',
                severityLabel: 'Stale',
                guidance:
                    'Watch this import; it is older than the daily window.',
                grafanaUrl: expect.stringContaining(GRAFANA_EXPLORE_URL),
            },
        ])
        expect(report.endpointGroups).toEqual([
            expect.objectContaining({
                provider: 'spotify',
                endpoint: 'aggregate',
                issueCount: 2,
                affectedPodcastCount: 2,
                worstAgeHours: 80,
                severity: 'serious',
                grafanaUrl: expect.stringContaining(GRAFANA_EXPLORE_URL),
            }),
            expect.objectContaining({
                provider: 'apple',
                endpoint: 'episodeDetails',
                issueCount: 1,
                affectedPodcastCount: 1,
                worstAgeHours: 52,
                severity: 'concerning',
                grafanaUrl: expect.stringContaining(GRAFANA_EXPLORE_URL),
            }),
        ])
        expect(report.endpointGroups[0].issues).toEqual([
            report.issues[0],
            report.issues[2],
        ])
        expect(report.podcastGroups).toEqual([
            expect.objectContaining({
                podcastId: 2,
                issueCount: 2,
                affectedEndpointCount: 2,
                worstAgeHours: 80,
                severity: 'serious',
                grafanaUrl: expect.stringContaining(GRAFANA_EXPLORE_URL),
            }),
            expect.objectContaining({
                podcastId: 1,
                issueCount: 1,
                affectedEndpointCount: 1,
                worstAgeHours: 30,
                severity: 'stale',
                grafanaUrl: expect.stringContaining(GRAFANA_EXPLORE_URL),
            }),
        ])
        expect(report.podcastGroups[0].issues).toEqual([
            report.issues[0],
            report.issues[1],
        ])
    })

    it('returns an empty issue report when all imports are fresh', () => {
        const statusRepo = {} as StatusRepository
        const statusApi = new StatusApi(statusRepo)

        const report = statusApi.getImportIssueReport(
            {
                1: {
                    latestUpdates: {
                        'spotify/metadata': new Date(2026, 6, 22, 0, 0, 0),
                    },
                },
            },
            24
        )

        expect(report).toEqual({
            summary: {
                issueCount: 0,
                affectedPodcastCount: 0,
                affectedEndpointCount: 0,
                worstAgeHours: null,
                hasIssues: false,
            },
            endpointGroups: [],
            podcastGroups: [],
            issues: [],
        })
    })
})

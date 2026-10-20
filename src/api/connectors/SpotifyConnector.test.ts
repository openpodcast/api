import { SpotifyConnector } from './SpotifyConnector'
import { SpotifyRepository } from '../../db/SpotifyRepository'
import { MetricsRepository } from '../../db/MetricsRepository'
import { METRIC, PLATFORM } from '../../types/metrics'
import podcastDetailedStreams from '../../../fixtures/spotifyPodcastDetailedStreams.json'
import episodeDetailedStreams from '../../../fixtures/spotifyEpisodeDetailedStreams.json'
import podcastMetadata from '../../../fixtures/spotifyPodcastMetadata.json'
import episodesMetadata from '../../../fixtures/spotifyEpisodesMetadata.json'

describe('SpotifyConnector v2 metrics', () => {
    let repo: jest.Mocked<SpotifyRepository>
    let metricsRepo: jest.Mocked<MetricsRepository>
    let connector: SpotifyConnector

    beforeEach(() => {
        repo = {
            storePodcastDetailedStreams: jest.fn(),
            storeEpisodeDetailedStreams: jest.fn(),
            storePodcastMetadata: jest.fn(),
            storeEpisodeMetadata: jest.fn(),
        } as any
        metricsRepo = {
            getOrCreateEpisodeId: jest.fn().mockResolvedValue(42),
            upsertPodcastPlatformId: jest.fn(),
            storePodcastMetrics: jest.fn(),
            storeEpisodeMetrics: jest.fn(),
        } as any
        connector = new SpotifyConnector(repo, metricsRepo)
    })

    const expectedDailyPlays = (payload: typeof podcastDetailedStreams) =>
        payload.data.detailedStreams.map((entry) => ({
            start: entry.date,
            end: entry.date,
            value: entry.streams,
        }))

    it('should store podcast streams as daily plays', async () => {
        await connector.handleRequest(3, podcastDetailedStreams as any)

        expect(repo.storePodcastDetailedStreams).toHaveBeenCalled()
        expect(metricsRepo.storePodcastMetrics).toHaveBeenCalledWith(
            3,
            PLATFORM.spotify,
            METRIC.plays,
            expectedDailyPlays(podcastDetailedStreams)
        )
    })

    it('should store episode streams as daily plays of our episode id', async () => {
        await connector.handleRequest(3, episodeDetailedStreams as any)

        expect(repo.storeEpisodeDetailedStreams).toHaveBeenCalled()
        expect(metricsRepo.getOrCreateEpisodeId).toHaveBeenCalledWith(
            3,
            PLATFORM.spotify,
            episodeDetailedStreams.meta.episode
        )
        expect(metricsRepo.storeEpisodeMetrics).toHaveBeenCalledWith(
            42,
            PLATFORM.spotify,
            METRIC.plays,
            expectedDailyPlays(episodeDetailedStreams)
        )
    })

    it('should store lifetime episode plays from release until fetch date', async () => {
        await connector.handleRequest(3, episodesMetadata as any)

        expect(repo.storeEpisodeMetadata).toHaveBeenCalled()
        expect(metricsRepo.getOrCreateEpisodeId).toHaveBeenCalledWith(
            3,
            PLATFORM.spotify,
            episodesMetadata.data.id
        )
        expect(metricsRepo.storeEpisodeMetrics).toHaveBeenCalledWith(
            42,
            PLATFORM.spotify,
            METRIC.plays,
            [
                {
                    start: episodesMetadata.data.releaseDate,
                    end: episodesMetadata.retrieved.substring(0, 10),
                    value: episodesMetadata.data.streams,
                },
            ]
        )
    })

    it('should store the podcast platform id and lifetime plays', async () => {
        const payload = {
            ...podcastMetadata,
            retrieved: '2026-10-18T06:00:00.000Z',
        }
        await connector.handleRequest(3, payload as any)

        expect(repo.storePodcastMetadata).toHaveBeenCalled()
        expect(metricsRepo.upsertPodcastPlatformId).toHaveBeenCalledWith(
            3,
            PLATFORM.spotify,
            podcastMetadata.data.id
        )
        expect(metricsRepo.storePodcastMetrics).toHaveBeenCalledWith(
            3,
            PLATFORM.spotify,
            METRIC.plays,
            [
                {
                    start: podcastMetadata.data.releaseDate,
                    end: '2026-10-18',
                    value: podcastMetadata.data.streams,
                },
            ]
        )
    })

    it('should skip lifetime plays if the release date is after the fetch date', async () => {
        const payload = {
            ...podcastMetadata,
            retrieved: '2022-01-01T06:00:00.000Z',
        }
        await connector.handleRequest(3, payload as any)

        expect(metricsRepo.storePodcastMetrics).toHaveBeenCalledWith(
            3,
            PLATFORM.spotify,
            METRIC.plays,
            []
        )
    })
})

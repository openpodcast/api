import { MetricsRepository } from './MetricsRepository'
import { Pool } from 'mysql2/promise'
import { METRIC, PLATFORM } from '../types/metrics'

describe('MetricsRepository', () => {
    let repo: MetricsRepository
    let mockPool: jest.Mocked<Pool>

    beforeEach(() => {
        mockPool = {
            query: jest.fn(),
        } as any

        repo = new MetricsRepository(mockPool)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('getOrCreateEpisodeId', () => {
        it('should return the existing episode id', async () => {
            mockPool.query.mockResolvedValueOnce([
                [{ episode_id: 7 }],
                [],
            ] as any)

            const result = await repo.getOrCreateEpisodeId(
                3,
                PLATFORM.spotify,
                'spotifyEpisode'
            )

            expect(result).toBe(7)
            expect(mockPool.query).toHaveBeenCalledTimes(1)
            expect(mockPool.query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'SELECT episode_id FROM episodePlatformIds'
                ),
                [3, PLATFORM.spotify, 'spotifyEpisode']
            )
        })

        it('should create a new episode and mapping if unknown', async () => {
            mockPool.query
                .mockResolvedValueOnce([[], []] as any)
                .mockResolvedValueOnce([{ insertId: 42 }, []] as any)
                .mockResolvedValueOnce([{ affectedRows: 1 }, []] as any)

            const result = await repo.getOrCreateEpisodeId(
                3,
                PLATFORM.spotify,
                'spotifyEpisode'
            )

            expect(result).toBe(42)
            expect(mockPool.query).toHaveBeenNthCalledWith(
                2,
                'INSERT INTO episodes (podcast_id) VALUES (?)',
                [3]
            )
            expect(mockPool.query).toHaveBeenNthCalledWith(
                3,
                expect.stringContaining(
                    'INSERT IGNORE INTO episodePlatformIds'
                ),
                [3, PLATFORM.spotify, 'spotifyEpisode', 42]
            )
        })

        it('should use the concurrently created episode and remove the orphan', async () => {
            mockPool.query
                .mockResolvedValueOnce([[], []] as any)
                .mockResolvedValueOnce([{ insertId: 42 }, []] as any)
                .mockResolvedValueOnce([{ affectedRows: 0 }, []] as any)
                .mockResolvedValueOnce([{ affectedRows: 1 }, []] as any)
                .mockResolvedValueOnce([[{ episode_id: 41 }], []] as any)

            const result = await repo.getOrCreateEpisodeId(
                3,
                PLATFORM.spotify,
                'spotifyEpisode'
            )

            expect(result).toBe(41)
            expect(mockPool.query).toHaveBeenNthCalledWith(
                4,
                'DELETE FROM episodes WHERE episode_id = ?',
                [42]
            )
        })
    })

    describe('storePodcastMetrics', () => {
        it('should store all values with one bulk upsert', async () => {
            mockPool.query.mockResolvedValue([{ affectedRows: 2 }, []] as any)

            await repo.storePodcastMetrics(3, PLATFORM.spotify, METRIC.plays, [
                { start: '2022-09-26', end: '2022-09-26', value: 11 },
                { start: '2022-09-27', end: '2022-09-27', value: 32 },
            ])

            expect(mockPool.query).toHaveBeenCalledTimes(1)
            const [sql, params] = mockPool.query.mock.calls[0] as any
            expect(sql).toContain('INSERT INTO podcastMetrics (podcast_id,')
            expect(sql).toContain('ON DUPLICATE KEY UPDATE')
            expect(params).toEqual([
                [
                    [
                        3,
                        METRIC.plays,
                        PLATFORM.spotify,
                        '2022-09-26',
                        '2022-09-26',
                        11,
                    ],
                    [
                        3,
                        METRIC.plays,
                        PLATFORM.spotify,
                        '2022-09-27',
                        '2022-09-27',
                        32,
                    ],
                ],
            ])
        })

        it('should not query without values', async () => {
            await repo.storePodcastMetrics(
                3,
                PLATFORM.spotify,
                METRIC.plays,
                []
            )

            expect(mockPool.query).not.toHaveBeenCalled()
        })
    })

    describe('storeEpisodeMetrics', () => {
        it('should store values for the episode id', async () => {
            mockPool.query.mockResolvedValue([{ affectedRows: 1 }, []] as any)

            await repo.storeEpisodeMetrics(42, PLATFORM.spotify, METRIC.plays, [
                { start: '2022-09-13', end: '2022-10-04', value: 120 },
            ])

            const [sql, params] = mockPool.query.mock.calls[0] as any
            expect(sql).toContain('INSERT INTO episodeMetrics (episode_id,')
            expect(params).toEqual([
                [
                    [
                        42,
                        METRIC.plays,
                        PLATFORM.spotify,
                        '2022-09-13',
                        '2022-10-04',
                        120,
                    ],
                ],
            ])
        })
    })
})

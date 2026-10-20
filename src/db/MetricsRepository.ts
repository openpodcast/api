import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { MetricId, MetricValue, PlatformId } from '../types/metrics'

// v2 metrics: platform independent podcast/episode ids and metric values
// stored by date range (see podcastMetrics and episodeMetrics tables)
class MetricsRepository {
    pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    private async findEpisodeId(
        podcastId: number,
        platformId: PlatformId,
        platformEpisodeId: string
    ): Promise<number | null> {
        const [rows] = await this.pool.query<RowDataPacket[]>(
            'SELECT episode_id FROM episodePlatformIds WHERE podcast_id = ? AND platform_id = ? AND platform_episode_id = ?',
            [podcastId, platformId, platformEpisodeId]
        )
        return rows.length > 0 ? rows[0].episode_id : null
    }

    // returns our episode id for the episode id of a platform
    // and creates a new episode if it is not known yet
    async getOrCreateEpisodeId(
        podcastId: number,
        platformId: PlatformId,
        platformEpisodeId: string
    ): Promise<number> {
        const existingId = await this.findEpisodeId(
            podcastId,
            platformId,
            platformEpisodeId
        )
        if (existingId !== null) {
            return existingId
        }

        const [episodeResult] = await this.pool.query<ResultSetHeader>(
            'INSERT INTO episodes (podcast_id) VALUES (?)',
            [podcastId]
        )
        const episodeId = episodeResult.insertId

        const [mappingResult] = await this.pool.query<ResultSetHeader>(
            'INSERT IGNORE INTO episodePlatformIds (podcast_id, platform_id, platform_episode_id, episode_id) VALUES (?,?,?,?)',
            [podcastId, platformId, platformEpisodeId, episodeId]
        )
        if (mappingResult.affectedRows > 0) {
            return episodeId
        }

        // a concurrent request created the mapping in the meantime,
        // remove the orphaned episode and use the existing one
        await this.pool.query('DELETE FROM episodes WHERE episode_id = ?', [
            episodeId,
        ])
        const concurrentId = await this.findEpisodeId(
            podcastId,
            platformId,
            platformEpisodeId
        )
        if (concurrentId === null) {
            throw new Error(
                `Could not create episode id for ${platformEpisodeId} of podcast ${podcastId}`
            )
        }
        return concurrentId
    }

    async upsertPodcastPlatformId(
        podcastId: number,
        platformId: PlatformId,
        platformPodcastId: string
    ): Promise<void> {
        await this.pool.query(
            'INSERT INTO podcastPlatformIds (podcast_id, platform_id, platform_podcast_id) VALUES (?,?,?) ON DUPLICATE KEY UPDATE platform_podcast_id = VALUES(platform_podcast_id)',
            [podcastId, platformId, platformPodcastId]
        )
    }

    private async storeMetrics(
        table: 'podcastMetrics' | 'episodeMetrics',
        idColumn: 'podcast_id' | 'episode_id',
        id: number,
        platformId: PlatformId,
        metricId: MetricId,
        values: MetricValue[]
    ): Promise<void> {
        if (values.length === 0) {
            return
        }
        const rows = values.map((v) => [
            id,
            metricId,
            platformId,
            v.start,
            v.end,
            v.value,
        ])
        // existing values are overwritten, so refetching data is idempotent
        await this.pool.query(
            `INSERT INTO ${table} (${idColumn}, metric_id, platform_id, start_date, end_date, value) VALUES ? ON DUPLICATE KEY UPDATE value = VALUES(value)`,
            [rows]
        )
    }

    async storePodcastMetrics(
        podcastId: number,
        platformId: PlatformId,
        metricId: MetricId,
        values: MetricValue[]
    ): Promise<void> {
        return this.storeMetrics(
            'podcastMetrics',
            'podcast_id',
            podcastId,
            platformId,
            metricId,
            values
        )
    }

    async storeEpisodeMetrics(
        episodeId: number,
        platformId: PlatformId,
        metricId: MetricId,
        values: MetricValue[]
    ): Promise<void> {
        return this.storeMetrics(
            'episodeMetrics',
            'episode_id',
            episodeId,
            platformId,
            metricId,
            values
        )
    }
}

export { MetricsRepository }

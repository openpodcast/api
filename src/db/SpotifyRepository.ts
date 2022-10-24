import { Pool } from 'mysql2/promise'
import {
    SpotifyAggregatePayload,
    SpotifyDetailedStreamsPayload,
    SpotifyEpisodeMetadata,
    SpotifyEpisodesMetadataPayload,
    SpotifyListenersPayload,
    SpotifyPerformancePayload,
} from '../types/connector'

class SpotifyRepository {
    pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    // store metadata of multiple episodes
    async storeEpisodesMetadata(
        accountId: number,
        payload: SpotifyEpisodesMetadataPayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO spotifyEpisodeMetadata (
            account_id,
            episode_id,
            ep_name,
            ep_url,
            ep_artwork_url,
            ep_release_date,
            ep_description,
            ep_explicit,
            ep_duration,
            ep_language,
            ep_spark_line,
            ep_has_video) VALUES
            (?,?,?,?,?,?,?,?,?,?,?,?)`

        return await Promise.all(
            payload.episodes.map(
                async (entry: SpotifyEpisodeMetadata): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        entry.id,
                        entry.name,
                        entry.url,
                        entry.artworkUrl,
                        entry.releaseDate,
                        entry.description,
                        entry.explict, // typo in Spotify API
                        entry.duration,
                        entry.language,
                        JSON.stringify(entry.sparkLine),
                        entry.hasVideo,
                    ])
            )
        )
    }

    // store performance data of one single episode
    async storeEpisodePerformance(
        accountId: number,
        episodeId: string,
        data: SpotifyPerformancePayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO spotifyEpisodePerformance (
                account_id,
                episode_id,
                spp_median_percentage,
                spp_median_seconds,
                spp_percentile_25,
                spp_percentile_50,
                spp_percentile_75,
                spp_percentile_100,
                spp_sample_rate,
                spp_sample_max,
                spp_sample_seconds,
                spp_samples) VALUES
                (?,?,?,?,?,?,?,?,?,?,?,?)
            `
        return await this.pool.query(replaceStmt, [
            accountId,
            episodeId,
            data.medianCompletion.percentage,
            data.medianCompletion.seconds,
            data.percentiles['25'],
            data.percentiles['50'],
            data.percentiles['75'],
            data.percentiles['100'],
            data.sampleRate,
            data.max,
            data.seconds,
            JSON.stringify(data.samples),
        ])
    }

    async storeDetailedStreams(
        accountId: number,
        payload: SpotifyDetailedStreamsPayload
    ): Promise<any> {
        const replaceStmt =
            'REPLACE INTO spotifyDetailedStreams (account_id, sps_date, sps_starts, sps_streams) VALUES (?,?,?,?)'

        return await Promise.all(
            payload.detailedStreams.map(
                async (entry: any): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        entry.date,
                        entry.starts,
                        entry.streams,
                    ])
            )
        )
    }

    async storeListeners(
        accountId: number,
        episodeId: string,
        payload: SpotifyListenersPayload
    ): Promise<any> {
        const replaceStmt =
            'REPLACE INTO spotifyListeners (account_id, episode_id, spl_date, spl_count) VALUES (?,?,?,?)'

        return await Promise.all(
            payload.counts.map(
                async (entry: any): Promise<any> =>
                    await this.pool.execute(replaceStmt, [
                        accountId,
                        episodeId,
                        entry.date,
                        entry.count,
                    ])
            )
        )
    }

    async storeAggregate(
        accountId: number,
        episodeId: string,
        date: string,
        payload: SpotifyAggregatePayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO spotifyAggregate (account_id, episode_id, spa_date, spa_age, 
            spa_gender_not_specified, spa_gender_female, spa_gender_male, spa_gender_non_binary) VALUES (?,?,?,?,?,?,?,?)`

        return await Promise.all([
            Object.keys(payload.ageFacetedCounts).map(
                async (ageGroup: string): Promise<any> => {
                    const entry = payload.ageFacetedCounts[ageGroup]
                    return await this.pool.execute(replaceStmt, [
                        accountId,
                        episodeId,
                        date,
                        ageGroup,
                        entry.counts.NOT_SPECIFIED,
                        entry.counts.FEMALE,
                        entry.counts.MALE,
                        entry.counts.NON_BINARY,
                    ])
                }
            ),
            this.pool.execute(replaceStmt, [
                accountId,
                episodeId,
                date,
                'ALL',
                payload.genderedCounts.counts.NOT_SPECIFIED,
                payload.genderedCounts.counts.FEMALE,
                payload.genderedCounts.counts.MALE,
                payload.genderedCounts.counts.NON_BINARY,
            ]),
        ])
    }
}

export { SpotifyRepository }

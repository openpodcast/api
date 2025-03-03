import { Pool } from 'mysql2/promise'
import {
    SpotifyPodcastAggregatePayload,
    SpotifyDetailedStreamsPayload,
    SpotifyEpisodeMetadata,
    SpotifyEpisodesMetadataPayload,
    SpotifyGenderCounts,
    SpotifyListenersPayload,
    SpotifyPerformancePayload,
    SpotifyPodcastFollowersPayload,
    SpotifyPodcastMetadataPayload,
    SpotifyEpisodeAggregatePayload,
} from '../types/provider/spotify'

class SpotifyRepository {
    pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    getTodayDBString(): string {
        const today = new Date()

        // format to YYYY-mm-dd
        // Note that today.toLocaleDateString('en-CA') returned `DD/MM/YYYY` on
        // some systems
        return (
            today.getFullYear() +
            '-' +
            (today.getMonth() + 1) +
            '-' +
            today.getDate()
        )
    }

    // store metadata for the entire podcast
    async storePodcastMetadata(
        accountId: number,
        payload: SpotifyPodcastMetadataPayload
    ): Promise<any> {
        // Daily stats go into the time series table
        const replaceStatsStmt = `REPLACE INTO spotifyPodcastMetadata (
            account_id,
            spm_date,
            spm_total_episodes,
            spm_starts,
            spm_streams,
            spm_listeners,
            spm_followers
        ) VALUES (?,?,?,?,?,?,?)`

        // Metadata goes into a seprate metadata table
        // because we only need to store the latest values
        const replaceMetadataStmt = `REPLACE INTO podcastMetadata (
            account_id,
            name,
            artwork_url,
            release_date,
            url,
            publisher
        ) VALUES (?,?,?,?,?,?)`

        await Promise.all([
            this.pool.query(replaceStatsStmt, [
                accountId,
                this.getTodayDBString(),
                payload.totalEpisodes,
                payload.starts,
                payload.streams,
                payload.listeners,
                payload.followers,
            ]),
            this.pool.query(replaceMetadataStmt, [
                accountId,
                payload.name,
                payload.artworkUrl,
                payload.releaseDate,
                payload.url,
                payload.publisher,
            ]),
        ])
    }

    // store metadata of multiple episodes
    async storeEpisodesMetadata(
        accountId: number,
        payload: SpotifyEpisodesMetadataPayload
    ): Promise<any> {
        const replaceStmtHistory = `REPLACE INTO spotifyEpisodeMetadataHistory (
            account_id,
            episode_id,
            epm_date,
            epm_starts,
            epm_streams,
            epm_listeners) VALUES
            (?,?,?,?,?,?)`

        await Promise.all(
            payload.episodes.map(
                async (entry: SpotifyEpisodeMetadata): Promise<any> =>
                    await this.pool.query(replaceStmtHistory, [
                        accountId,
                        entry.id,
                        this.getTodayDBString(),
                        entry.starts,
                        entry.streams,
                        entry.listeners,
                    ])
            )
        )

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
                spp_date,
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
                (?,?,?,?,?,?,?,?,?,?,?,?,?)
            `
        return await this.pool.query(replaceStmt, [
            accountId,
            episodeId,
            this.getTodayDBString(),
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

    async storeEpisodeDetailedStreams(
        accountId: number,
        episodeId: string | null,
        payload: SpotifyDetailedStreamsPayload
    ): Promise<any> {
        const replaceStmt =
            'REPLACE INTO spotifyEpisodeDetailedStreams (account_id, episode_id, sps_date, sps_starts, sps_streams) VALUES (?,?,?,?,?)'

        return await Promise.all(
            payload.detailedStreams.map(
                async (entry: any): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        episodeId,
                        entry.date,
                        entry.starts,
                        entry.streams,
                    ])
            )
        )
    }

    async storePodcastDetailedStreams(
        accountId: number,
        payload: SpotifyDetailedStreamsPayload
    ): Promise<any> {
        const replaceStmt =
            'REPLACE INTO spotifyPodcastDetailedStreams (account_id, sps_date, sps_starts, sps_streams) VALUES (?,?,?,?)'

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

    async storePodcastFollowers(
        accountId: number,
        payload: SpotifyPodcastFollowersPayload
    ): Promise<any> {
        const replaceStmt =
            'REPLACE INTO spotifyPodcastFollowers (account_id, spf_date, spf_count) VALUES (?,?,?)'

        return await Promise.all(
            payload.counts.map(
                async (entry: any): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        entry.date,
                        entry.count,
                    ])
            )
        )
    }

    async storeEpisodeListeners(
        accountId: number,
        episodeId: string,
        payload: SpotifyListenersPayload
    ): Promise<any> {
        const replaceStmt =
            'REPLACE INTO spotifyEpisodeListeners (account_id, episode_id, spl_date, spl_count) VALUES (?,?,?,?)'

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

    async storePodcastListeners(
        accountId: number,
        payload: SpotifyListenersPayload
    ): Promise<any> {
        const replaceStmt =
            'REPLACE INTO spotifyPodcastListeners (account_id, spl_date, spl_count) VALUES (?,?,?)'

        return await Promise.all(
            payload.counts.map(
                async (entry: any): Promise<any> =>
                    await this.pool.execute(replaceStmt, [
                        accountId,
                        entry.date,
                        entry.count,
                    ])
            )
        )
    }

    async storeEpisodeAggregate(
        accountId: number,
        episodeId: string,
        date: string,
        payload: SpotifyEpisodeAggregatePayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO spotifyEpisodeAggregate (account_id, episode_id, spa_date, spa_facet, spa_facet_type, 
            spa_gender_not_specified, spa_gender_female, spa_gender_male, spa_gender_non_binary) VALUES (?,?,?,?,?,?,?,?,?)`

        return await Promise.all([
            ...Object.keys(payload.ageFacetedCounts).map(
                async (ageGroup: string): Promise<any> => {
                    const entry: SpotifyGenderCounts =
                        payload.ageFacetedCounts[ageGroup]
                    return await this.pool.execute(replaceStmt, [
                        accountId,
                        episodeId,
                        date,
                        ageGroup,
                        'age',
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
                'age_sum',
                payload.genderedCounts.counts.NOT_SPECIFIED,
                payload.genderedCounts.counts.FEMALE,
                payload.genderedCounts.counts.MALE,
                payload.genderedCounts.counts.NON_BINARY,
            ]),
        ])
    }

    async storePodcastAggregate(
        accountId: number,
        date: string,
        payload: SpotifyPodcastAggregatePayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO spotifyPodcastAggregate (account_id, spa_date, spa_facet, spa_facet_type, 
            spa_gender_not_specified, spa_gender_female, spa_gender_male, spa_gender_non_binary) VALUES (?,?,?,?,?,?,?,?)`

        // We cannot be sure that the payload will contain country faceted counts
        // so we need to check for them before we try to iterate over them.
        // Note that age faceted counts are always present as per the schema.
        const countryFacetedCounts = payload.countryFacetedCounts || {}

        return await Promise.all([
            ...Object.keys(payload.ageFacetedCounts).map(
                async (ageGroup: string): Promise<any> => {
                    const entry: SpotifyGenderCounts =
                        payload.ageFacetedCounts[ageGroup]
                    return await this.pool.execute(replaceStmt, [
                        accountId,
                        date,
                        ageGroup,
                        'age',
                        entry.counts.NOT_SPECIFIED,
                        entry.counts.FEMALE,
                        entry.counts.MALE,
                        entry.counts.NON_BINARY,
                    ])
                }
            ),
            ...Object.keys(countryFacetedCounts).map(
                async (country: string): Promise<any> => {
                    const entry = countryFacetedCounts[country]
                    return await this.pool.execute(replaceStmt, [
                        accountId,
                        date,
                        entry.countryCode,
                        'country',
                        entry.counts.NOT_SPECIFIED,
                        entry.counts.FEMALE,
                        entry.counts.MALE,
                        entry.counts.NON_BINARY,
                    ])
                }
            ),
            this.pool.execute(replaceStmt, [
                accountId,
                date,
                'ALL',
                'age_sum',
                payload.genderedCounts.counts.NOT_SPECIFIED,
                payload.genderedCounts.counts.FEMALE,
                payload.genderedCounts.counts.MALE,
                payload.genderedCounts.counts.NON_BINARY,
            ]),
        ])
    }
}

export { SpotifyRepository }

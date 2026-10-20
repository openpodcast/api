const request = require('supertest')
const auth = require('./authheader')
const podcastDetailedStreamsPayload = require('../../fixtures/spotifyPodcastDetailedStreams.json')
const episodeDetailedStreamsPayload = require('../../fixtures/spotifyEpisodeDetailedStreams.json')
const podcastMetadataPayload = require('../../fixtures/spotifyPodcastMetadata.json')
const episodesMetadataPayload = require('../../fixtures/spotifyEpisodesMetadata.json')

const baseURL = process.env.API_BASE_URL || 'http://localhost:8080'

// hardcoded for testing and is set in db_auth_data.sql file
const podcast_test_id = 3

const path_prefix = `/analytics/v2/${podcast_test_id}/`

const start = '2022-09-26'
const end = '2022-10-02'
const streams = podcastDetailedStreamsPayload.data.detailedStreams

const postPayload = async (payload) => {
    const response = await request(baseURL)
        .post('/connector')
        .set(auth)
        .send(payload)
    expect(response.statusCode).toBe(200)
}

const getQuery = async (query, queryStart = start, queryEnd = end) => {
    const response = await request(baseURL)
        .get(`${path_prefix}${query}?start=${queryStart}&end=${queryEnd}`)
        .set(auth)
        .send()
    expect(response.statusCode).toBe(200)
    expect(response.body.meta.result).toBe('success')
    return response.body.data
}

const getEpisodeId = async (spotifyId) => {
    const episodes = await getQuery('episodes')
    const episode = episodes.find((e) => e.spotifyId === spotifyId)
    expect(episode).toBeDefined()
    return episode.episodeId
}

beforeAll(async () => {
    await postPayload(podcastDetailedStreamsPayload)
    await postPayload(episodeDetailedStreamsPayload)
    await postPayload(episodesMetadataPayload)
    // release date of the fixture is after its retrieved date
    await postPayload({
        ...podcastMetadataPayload,
        retrieved: '2022-10-30T10:00:00.000Z',
    })
})

describe('v2 podcast plays', () => {
    it('should return daily Spotify streams as plays', async () => {
        const data = await getQuery('podcastPlays')

        const spotify = data.filter((row) => row.platform === 'spotify')
        expect(spotify).toEqual(
            streams.map((entry) => ({
                podcastId: podcast_test_id,
                metric: 'plays',
                platform: 'spotify',
                startDate: entry.date,
                endDate: entry.date,
                value: entry.streams,
            }))
        )
    })

    it('should sum up the plays of the date range', async () => {
        const data = await getQuery('podcastPlaysTotal')

        expect(data).toContainEqual({
            podcastId: podcast_test_id,
            metric: 'plays',
            platform: 'spotify',
            startDate: start,
            endDate: end,
            value: streams.reduce((sum, entry) => sum + entry.streams, 0),
            days: streams.length,
        })
    })

    it('should return lifetime plays from release until fetch date', async () => {
        const data = await getQuery('podcastPlaysLifetime', start, '2022-10-30')

        expect(data).toContainEqual({
            podcastId: podcast_test_id,
            metric: 'plays',
            platform: 'spotify',
            startDate: podcastMetadataPayload.data.releaseDate,
            endDate: '2022-10-30',
            value: podcastMetadataPayload.data.streams,
        })
    })

    it('should return days without plays', async () => {
        const data = await getQuery('podcastPlaysMissingDays', '2022-09-22', end)

        expect(data.map((row) => row.date)).toEqual([
            '2022-09-22',
            '2022-09-23',
            '2022-09-24',
            '2022-09-25',
        ])
    })
})

describe('v2 episode plays', () => {
    it('should return daily plays with our numeric episode id', async () => {
        const episodeId = await getEpisodeId(
            episodeDetailedStreamsPayload.meta.episode
        )
        expect(typeof episodeId).toBe('number')

        const data = await getQuery('episodePlays')
        const episodeRows = data.filter((row) => row.episodeId === episodeId)
        expect(episodeRows).toEqual(
            episodeDetailedStreamsPayload.data.detailedStreams.map((entry) => ({
                episodeId,
                metric: 'plays',
                platform: 'spotify',
                startDate: entry.date,
                endDate: entry.date,
                value: entry.streams,
            }))
        )
    })

    it('should keep the episode id when data is sent again', async () => {
        const spotifyId = episodeDetailedStreamsPayload.meta.episode
        const episodeId = await getEpisodeId(spotifyId)

        await postPayload(episodeDetailedStreamsPayload)

        expect(await getEpisodeId(spotifyId)).toBe(episodeId)
        const episodes = await getQuery('episodes')
        expect(episodes.filter((e) => e.spotifyId === spotifyId)).toHaveLength(1)
    })

    it('should sum up the plays per episode', async () => {
        const episodeId = await getEpisodeId(
            episodeDetailedStreamsPayload.meta.episode
        )
        const data = await getQuery('episodePlaysTotal')

        expect(data).toContainEqual({
            episodeId,
            metric: 'plays',
            platform: 'spotify',
            startDate: start,
            endDate: end,
            value: streams.reduce((sum, entry) => sum + entry.streams, 0),
            days: streams.length,
        })
    })

    it('should return lifetime plays of an episode', async () => {
        const episodeId = await getEpisodeId(episodesMetadataPayload.data.id)
        const fetchDate = episodesMetadataPayload.retrieved.substring(0, 10)

        const data = await getQuery('episodePlaysLifetime', start, fetchDate)

        expect(data).toContainEqual({
            episodeId,
            metric: 'plays',
            platform: 'spotify',
            startDate: episodesMetadataPayload.data.releaseDate,
            endDate: fetchDate,
            value: episodesMetadataPayload.data.streams,
        })
    })
})

describe('v2 access', () => {
    it('should return status 401 for a podcast of another account', async () => {
        const response = await request(baseURL)
            .get('/analytics/v2/10/podcastPlays')
            .set(auth)
            .send()
        expect(response.statusCode).toBe(401)
    })
})

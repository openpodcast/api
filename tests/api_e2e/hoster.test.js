const request = require('supertest')
const baseURL = 'http://localhost:8080'
const hosterPodcastMetadataPayload = require('../../fixtures/hosterPodcastMetadata.json')
const hosterEpisodeMetadataPayload = require('../../fixtures/hosterEpisodeMetadata.json')
const hosterPodcastMetricsPayload = require('../../fixtures/hosterPodcastMetrics.json')
const hosterEpisodeMetricsPayload = require('../../fixtures/hosterEpisodeMetrics.json')

const hosterPodcastMetadataNumericPayload = require('../../fixtures/hosterPodcastMetadataNumeric.json')
const hosterPodcastMetricsTotalsPayload = require('../../fixtures/hosterPodcastMetricsTotals.json')

const auth = require('./authheader')

describe('check Connector API with generic hosters', () => {
    it('should return status 200 when sending proper hoster payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(hosterPodcastMetadataPayload)
        expect(response.statusCode).toBe(200)
    })

    it('should return status 200 when sending proper episode payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(hosterEpisodeMetadataPayload)
        expect(response.statusCode).toBe(200)
    })

    it('should return status 200 when sending proper podcast metrics payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(hosterPodcastMetricsPayload)
        expect(response.statusCode).toBe(200)
    })

    it('should return status 200 when sending proper episode metrics payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(hosterEpisodeMetricsPayload)
        expect(response.statusCode).toBe(200)
    })

    it('should return status 200 when sending podcast metrics totals payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(hosterPodcastMetricsTotalsPayload)
        expect(response.statusCode).toBe(200)
    })

    it('should return status 200 when sending payload with numeric show ID (Podigee compatibility)', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(hosterPodcastMetadataNumericPayload)
        expect(response.statusCode).toBe(200)
    })
})
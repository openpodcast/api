const request = require('supertest')
const baseURL = 'http://localhost:8080'
const spotifyPodcastDetailedStreamsPayload = require('../../fixtures/spotifyPodcastDetailedStreams.json')
const spotifyEpisodeDetailedStreamsPayload = require('../../fixtures/spotifyEpisodeDetailedStreams.json')
const spotifyEpisodeListenersPayload = require('../../fixtures/spotifyEpisodeListeners.json')
const spotifyPodcastListenersPayload = require('../../fixtures/spotifyPodcastListeners.json')
const spotifyPerformancePayload = require('../../fixtures/spotifyPerformance.json')
const spotifyEpisodeAggregatePayload = require('../../fixtures/spotifyEpisodeAggregate.json')
const spotifyPodcastAggregatePayload = require('../../fixtures/spotifyPodcastAggregate.json')
const spotifyEpisodesPayload = require('../../fixtures/spotifyEpisodesMetadata.json')
const spotifyPodcastFollowersPayload = require('../../fixtures/spotifyPodcastFollowers.json')
const spotifyPodcastMetadataPayload = require('../../fixtures/spotifyPodcastMetadata.json')
const spotifyEpisodesMetadataPayload = require('../../fixtures/spotifyEpisodesMetadata.json')
const spotifyImpressionsTotalPayload = require('../../fixtures/spotifyImpressionsTotalPayload.json')
const spotifyImpressionsDailyPayload = require('../../fixtures/spotifyImpressionsDailyPayload.json')
const spotifyImpressionsFacetedPayload = require('../../fixtures/spotifyImpressionsFacetedPayload.json')

const auth = require("./authheader")

describe('check Connector API with spotifyPodcastDetailedStreamsPayload ', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyPodcastDetailedStreamsPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyEpisodeDetailedStreamsPayload ', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyEpisodeDetailedStreamsPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyEpisodeListenersPayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyEpisodeListenersPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyPodcastListenersPayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyPodcastListenersPayload)
        expect(response.statusCode).toBe(200)
    })
})


describe('check Connector API with spotifyPerformancePayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyPerformancePayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyEpisodesPayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyEpisodesPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyPodcastFollowersPayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyPodcastFollowersPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyEpisodeAggregatePayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyEpisodeAggregatePayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyPodcastAggregatePayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyPodcastAggregatePayload)
        expect(response.statusCode).toBe(200)
    })
})


describe('check Connector API with spotifyPodcastMetadataPayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyPodcastMetadataPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyEpisodesMetadataPayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyEpisodesMetadataPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyImpressionsTotalPayload', () => {
    it('should return status 200 when sending proper spotify impressions_total payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyImpressionsTotalPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyImpressionsDailyPayload', () => {
    it('should return status 200 when sending proper spotify impressions_daily payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyImpressionsDailyPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with spotifyImpressionsFacetedPayload', () => {
    it('should return status 200 when sending proper spotify impressions_faceted payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyImpressionsFacetedPayload)
        expect(response.statusCode).toBe(200)
    })
})

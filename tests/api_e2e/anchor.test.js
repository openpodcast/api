const request = require('supertest')
const baseURL = 'http://localhost:8080'

const anchorAudienceSizePayload = require('../../fixtures/anchorAudienceSize.json')
const anchorEpisodeAggregatedPerformancePayload = require('../../fixtures/anchorEpisodeAggregatedPerformance.json')
const anchorEpisodePerformancePayload = require('../../fixtures/anchorEpisodePerformance.json')
const anchorEpisodePlaysPayload = require('../../fixtures/anchorEpisodePlays.json')
const anchorPlaysPayload = require('../../fixtures/anchorPlays.json')
const anchorPlaysByAgeRangePayload = require('../../fixtures/anchorPlaysByAgeRange.json')
const anchorPlaysByAppPayload = require('../../fixtures/anchorPlaysByApp.json')
const anchorPlaysByDevicePayload = require('../../fixtures/anchorPlaysByDevice.json')
const anchorPlaysByEpisodePayload = require('../../fixtures/anchorPlaysByEpisode.json')
const anchorPlaysByGenderPayload = require('../../fixtures/anchorPlaysByGender.json')
const anchorPlaysByGeoPayload = require('../../fixtures/anchorPlaysByGeo.json')
const anchorPodcastEpisodePayload = require('../../fixtures/anchorPodcastEpisode.json')
const anchorTotalPlaysPayload = require('../../fixtures/anchorTotalPlays.json')
const anchorTotalPlaysByEpisodePayload = require('../../fixtures/anchorTotalPlaysByEpisode.json')
const anchorUniqueListenersPayload = require('../../fixtures/anchorUniqueListeners.json')

const auth = require('./authheader')

describe('check Connector API with anchorAudienceSizePayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorAudienceSizePayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorEpisodeAggregatedPerformancePayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorEpisodeAggregatedPerformancePayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorEpisodePerformancePayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorEpisodePerformancePayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorEpisodePlaysPayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorEpisodePlaysPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorPlaysPayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorPlaysPayload)
        expect(response.statusCode).toBe(200)
    })
})

it('should return status 200 when sending proper Anchor payload', async () => {
    const response = await request(baseURL)
        .post('/connector')
        .set(auth)
        .send(anchorPlaysByAgeRangePayload)
    expect(response.statusCode).toBe(200)
})

describe('check Connector API with anchorPlaysByAppPayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorPlaysByAppPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorPlaysByDevicePayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorPlaysByDevicePayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorPlaysByEpisodePayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorPlaysByEpisodePayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorPlaysByGenderPayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorPlaysByGenderPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorPlaysByGeoPayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorPlaysByGeoPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorPodcastEpisodePayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorPodcastEpisodePayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorTotalPlaysPayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorTotalPlaysPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorTotalPlaysByEpisodePayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorTotalPlaysByEpisodePayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorUniqueListenersPayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorUniqueListenersPayload)
        expect(response.statusCode).toBe
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with anchorUniqueListenersPayload', () => {
    it('should return status 200 when sending proper Anchor payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(anchorUniqueListenersPayload)
        expect(response.statusCode).toBe(200)
    })
})

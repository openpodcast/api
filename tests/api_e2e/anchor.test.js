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
const anchorPlaysByGenderPayload = require('../../fixtures/anchorPlaysByGender.json')
const anchorPlaysByGeoPayload = require('../../fixtures/anchorPlaysByGeo.json')
const anchorPodcastEpisodePayload = require('../../fixtures/anchorPodcastEpisode.json')
const anchorTotalPlaysPayload = require('../../fixtures/anchorTotalPlays.json')
const anchorTotalPlaysByEpisodePayload = require('../../fixtures/anchorTotalPlaysByEpisode.json')
const anchorUniqueListenersPayload = require('../../fixtures/anchorUniqueListeners.json')

const auth = require('./authheader')

describe('check Connector API with unknown Anchor endpoint', () => {
    it('should return status 404 when sending unknown Anchor endpoint', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send({ endpoint: 'unknown' })
        expect(response.statusCode).toBe(400)
    })
})

describe('check Connector API with wrong schema', () => {
    it('should return status 400 when sending wrong schema', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send({ endpoint: 'audience_size', wrong: 'schema', data: 'test' })
        expect(response.statusCode).toBe(400)
    })
})

describe('check Connector API with invalid anchorTotalPlaysPayload (missing columnHeaders)', () => {
    it('should return status 400 when sending invalid Anchor payload', async () => {
        // Load the payload and remove the columnHeaders
        // "Clone" the object to avoid changing the original
        // Note that the spread operator does not work here as it creates a shallow copy
        // https://stackoverflow.com/a/38874807
        const payload = JSON.parse(JSON.stringify(anchorTotalPlaysPayload))
        delete payload.data.data.columnHeaders

        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(payload)
        expect(response.statusCode).toBe(400)
    })
})

describe('check Connector API with invalid anchorTotalPlaysPayload (missing rows)', () => {
    it('should return status 400 when sending invalid Anchor payload', async () => {
        // Load the payload and remove the rows
        const payload = JSON.parse(JSON.stringify(anchorTotalPlaysPayload))
        delete payload.data.data.rows

        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(payload)
        expect(response.statusCode).toBe(400)
    })
})

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

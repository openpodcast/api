const request = require('supertest')
const baseURL = 'http://localhost:8080'
const spotifyPodcastDetailedStreamsPayload = require('../../fixtures/spotifyPodcastDetailedStreams.json')
const spotifyEpisodeDetailedStreamsPayload = require('../../fixtures/spotifyEpisodeDetailedStreams.json')
const spotifyListenersPayload = require('../../fixtures/spotifyListeners.json')
const spotifyPerformancePayload = require('../../fixtures/spotifyPerformance.json')
const spotifyEpisodesPayload = require('../../fixtures/spotifyEpisodesMetadata.json')

const auth = {
    Authorization: 'Bearer cn389ncoiwuencr',
    Accept: 'application/json',
}
const someRandomContent = { 'some data': 'anything' }

describe('check auth pn api', () => {
    it('should return not authenticated without bearer', async () => {
        const response = await request(baseURL).post('/events')
        expect(response.statusCode).toBe(401)
        expect(response.text).toContain('Not authorized')
    })
    it('should return status 200 with specified bearer', async () => {
        const response = await request(baseURL)
            .post('/events')
            .set(auth)
            .send(someRandomContent)
        expect(response.statusCode).toBe(200)
    })
    it('should return status 400 as no payload specified', async () => {
        const response = await request(baseURL).post('/events').set(auth)
        expect(response.statusCode).toBe(400)
    })
})

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

describe('check Connector API with spotifyListenersPayload', () => {
    it('should return status 200 when sending proper spotify payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(spotifyListenersPayload)
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

describe('check Connector API error cases', () => {
    it('should return status 400 when no proper payload is sent', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(someRandomContent)
        expect(response.statusCode).toBe(400)
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
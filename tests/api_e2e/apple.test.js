const request = require('supertest')
const baseURL = 'http://localhost:8080'

const appleEpisodesPayload = require('../../fixtures/appleEpisodes.json')
const appleEpisodeDetailsPayload = require('../../fixtures/appleEpisodeDetails.json')
const appleEpisodeDetailsPayloadSparse = require('../../fixtures/appleEpisodeDetailsSparse.json')
const appleEpisodeDetailsPayloadEmpty = require('../../fixtures/appleEpisodeDetailsEmpty.json')
const appleShowTrendsListenersPayload = require('../../fixtures/appleTrendsListenersByEpisode.json')
const appleShowTrendsFollowersPayload = require('../../fixtures/appleTrendsFollowers.json')
const appleShowTrendsFollowersPayloadEmpty = require('../../fixtures/appleTrendsFollowersEmpty.json')
const appleShowTrendsListeningTimeFollowerStatePayload = require('../../fixtures/appleTrendsListeningTimeFollowerState.json')
const appleShowTrendsListeningTimeFollowerStatePayloadSparse = require('../../fixtures/appleTrendsListeningTimeFollowerStateSparse.json')

const auth = require('./authheader')

describe('check Connector API with appleEpisodesPayload', () => {
    it('should return status 200 when sending proper Apple payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(appleEpisodesPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with appleEpisodeDetailsPayload', () => {
    it('should return status 200 when sending proper Apple payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(appleEpisodeDetailsPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with appleEpisodeDetailsPayloadSparse', () => {
    it('should return status 200 when sending proper Apple payload (only one performance value) ', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(appleEpisodeDetailsPayloadSparse)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with appleEpisodeDetailsPayloadEmpty', () => {
    it('should return status 200 when sending proper Apple payload (but empty perf data)', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(appleEpisodeDetailsPayloadEmpty)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with Listeners of ShowTrends API', () => {
    it('should return status 200 when sending proper Apple payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(appleShowTrendsListenersPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with Followers of ShowTrends API', () => {
    it('should return status 200 when sending proper Apple payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(appleShowTrendsFollowersPayload)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with empty Followers of ShowTrends API', () => {
    it('should return status 200 when sending proper Apple payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(appleShowTrendsFollowersPayloadEmpty)
        expect(response.statusCode).toBe(200)
    })
})

describe('check Connector API with ListeningTimeFollowerState of ShowTrends API', () => {
    it('should return status 200 when sending proper Apple payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(appleShowTrendsListeningTimeFollowerStatePayload)
        expect(response.statusCode).toBe(200)
    })
    it('should return status 200 when sending proper but sparse Apple payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(appleShowTrendsListeningTimeFollowerStatePayloadSparse)
        expect(response.statusCode).toBe(200)
    })
})

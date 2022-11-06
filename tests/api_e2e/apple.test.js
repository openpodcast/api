const request = require('supertest')
const baseURL = 'http://localhost:8080'

const appleEpisodesPayload = require('../../fixtures/appleEpisodes.json')
const appleEpisodeDetailsPayload = require('../../fixtures/appleEpisodeDetails.json')

const auth = require("./authheader")

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

const request = require('supertest')
const baseURL = 'http://localhost:8080'
const hosterPodcastMetadataPayload = require('../../fixtures/hosterPodcastMetadata.json')

const auth = require('./authheader')

describe('check Connector API with hosterPodcastMetadata', () => {
    it('should return status 200 when sending proper hoster payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(hosterPodcastMetadataPayload)
        expect(response.statusCode).toBe(200)
    })
})

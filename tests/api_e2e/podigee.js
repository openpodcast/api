const request = require('supertest')
const baseURL = 'http://localhost:8080'
const podigeePodcastDetailsPayload = require('../../fixtures/podigeePodcastDetails.json')

const auth = require('./authheader')

describe('check Connector API with podigeePodcastDetailsPayload ', () => {
    it('should return status 200 when sending proper podigee payload', async () => {
        const response = await request(baseURL)
            .post('/connector')
            .set(auth)
            .send(podigeePodcastDetailsPayload)
        expect(response.statusCode).toBe(200)
    })
})

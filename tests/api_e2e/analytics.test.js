const request = require('supertest')
const baseURL = 'http://localhost:8080'

const auth = require('./authheader')

describe('check basic analytics query', () => {
    it('should return status 200 when sending proper analytics query without payload', async () => {
        const response = await request(baseURL)
            .get('/analytics/v1/ping')
            .set(auth)
            .send()
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual([{ result: 'Pong' }])
    })
})
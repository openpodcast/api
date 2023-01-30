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

describe('check basic analytics query', () => {
    it('should return status 401 when sending query without auth', async () => {
        const response = await request(baseURL).get('/analytics/v1/ping').send()
        expect(response.statusCode).toBe(401)
    })
})

describe('check basic analytics query', () => {
    it('should return status 401 when sending query without version', async () => {
        const response = await request(baseURL).get('/analytics/ping').send()
        expect(response.statusCode).toBe(401)
    })
})

describe('check basic analytics query', () => {
    it('should return status 401 when sending query without proper version (e.g. v1)', async () => {
        const response = await request(baseURL)
            .get('/analytics/xxx/ping')
            .send()
        expect(response.statusCode).toBe(401)
    })
})

describe('check basic analytics query', () => {
    it('should return status 404 when sending to non-existent endpoint', async () => {
        const response = await request(baseURL)
            .get('/analytics/v1/shurelydoesnotexist')
            .set(auth)
            .send()
        expect(response.statusCode).toBe(404)
    })
})

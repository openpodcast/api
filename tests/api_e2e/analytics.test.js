const e = require('express')
const request = require('supertest')
const baseURL = 'http://localhost:8080'

const auth = require('./authheader')

describe('check basic analytics query', () => {
    it('should return status 200 when sending proper analytics query without payload', async () => {
        const response = await request(baseURL)
            .get('/analytics/v1/1/ping')
            .set(auth)
            .send()
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(response.body).toHaveProperty('meta')
        expect(response.body.meta.query).toBe('ping')
        expect(response.body.meta.result).toBe('success')
        expect(response.body.data[0].result).toBe('pong')
    })

    it('should return status 401 when sending query without auth', async () => {
        const response = await request(baseURL)
            .get('/analytics/v1/0/ping')
            .send()
        expect(response.statusCode).toBe(401)
    })

    it('should return status 401 when sending query with empty auth', async () => {
        const response = await request(baseURL)
            .get('/analytics/v1/0/ping')
            .set({
                Authorization: 'Bearer ',
                Accept: 'application/json',
            })
            .send()
        expect(response.statusCode).toBe(401)
    })

    it('should return status 401 when sending query without version', async () => {
        const response = await request(baseURL).get('/analytics/ping').send()
        expect(response.statusCode).toBe(401)
    })

    it('should return status 401 when sending query without podcast id', async () => {
        const response = await request(baseURL).get('/analytics/v1/ping').send()
        expect(response.statusCode).toBe(401)
    })

    it('should return status 401 when sending query without proper version (e.g. v1)', async () => {
        const response = await request(baseURL)
            .get('/analytics/xxx/0/ping')
            .send()
        expect(response.statusCode).toBe(401)
    })

    it('should return status 401 when podcast id != account id', async () => {
        const response = await request(baseURL)
            .get('/analytics/v1/10/ping')
            .set(auth)
            .send()
        expect(response.statusCode).toBe(401)
    })

    it('should return status 401 when sending query without proper version (e.g. v1)', async () => {
        const response = await request(baseURL)
            .get('/analytics/xxx/0/ping')
            .send()
        expect(response.statusCode).toBe(401)
    })

    it('should throw error when sending to non-existent endpoint', async () => {
        const response = await request(baseURL)
            .get('/analytics/v1/1/shurelydoesnotexist')
            .set(auth)
            .send()
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(response.body).toHaveProperty('meta')
        expect(response.body.meta.query).toBe('shurelydoesnotexist')
        expect(response.body.meta.result).toBe('error')
        expect(response.body.data).toBeNull()
    })

    it('should throw error when sending to non-existent version', async () => {
        const response = await request(baseURL)
            .get('/analytics/v9999/0/foo')
            .set(auth)
            .send()
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(response.body).toHaveProperty('meta')
        expect(response.body.meta.query).toBe('foo')
        expect(response.body.meta.result).toBe('error')
        expect(response.body.data).toBeNull()
    })

    it('should return status 404 when sending to empty podcast id', async () => {
        const response = await request(baseURL)
            .get('/analytics/v1//foo')
            .set(auth)
            .send()
        expect(response.statusCode).toBe(404)
    })
})

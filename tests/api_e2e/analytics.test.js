// TODO: These tests currently fail because we updated the analytics endpoint.

const request = require('supertest')
const fs = require('fs')
const auth = require('./authheader')

const baseURL = 'http://localhost:8080'

const account_map = JSON.parse(process.env.ACCOUNTS)
const podcast_test_id = account_map[Object.keys(account_map)[0]]

const path_prefix = `/analytics/v1/${podcast_test_id}/`

describe('check basic analytics query', () => {
    it('should return status 200 when sending proper analytics query without payload', async () => {
        const response = await request(baseURL)
            .get(`${path_prefix}ping`)
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
            .get(`${path_prefix}shurelydoesnotexist`)
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

    // read all filesnames in db_schema/queries/v1
    // consider only files with .sql extension
    // for each filename check the analytics endpoint and check if there are any errors
    const queries = fs
        .readdirSync('./db_schema/queries/v1')
        .filter((file) => file.endsWith('.sql'))
        .map((file) => file.replace('.sql', ''))

    // TODO: Fix this test by making it more robust.

    // date range 30days ago to yesterday
    // const from = '2023-10-01'
    // const to = '2023-10-31'

    // describe('check all analytics queries', () => {
    //     queries.forEach((query) => {
    //         it(`should return status 200 and a non empty result set when requesting analytics query ${query}`, async () => {
    //             const response = await request(baseURL)
    //                 .get(`${path_prefix}${query}?start=${from}&end=${to}`)
    //                 .set(auth)
    //                 .send()
    //             expect(response.statusCode).toBe(200)
    //             expect(response.body).toHaveProperty('data')
    //             expect(response.body).toHaveProperty('meta')
    //             expect(response.body.meta.query).toBe(query)
    //             expect(response.body.meta.result).toBe('success')
    //             expect(response.body.data).not.toBeNull()
    //             expect(response.body.data.length).toBeGreaterThan(0)
    //         })
    //     })
    // })
})

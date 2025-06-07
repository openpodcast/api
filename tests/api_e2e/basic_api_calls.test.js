const request = require('supertest')
const baseURL = 'http://localhost:8080'

const auth = require('./authheader')
const someRandomContent = { 'some data': 'anything' }

// create a failing test case to check testing framework and call on github
describe('check if fail is working', () => {
    it('should fail with status 500', async () => {
        const response = await request(baseURL).get('/fail')
        expect(response.statusCode).toBe(200)
    })
})


describe('check authentication', () => {
    it('should return not authenticated without bearer', async () => {
        const response = await request(baseURL).post('/events')
        expect(response.statusCode).toBe(401)
        expect(response.text).toContain("Something's wrong")
    })
    it('should return not be authenticated with random token', async () => {
        const wrongToken = { ...auth }
        wrongToken.Authorization = 'Bearer 123'
        const response = await request(baseURL).post('/events').set(wrongToken)
        expect(response.statusCode).toBe(401)
        expect(response.text).toContain("Something's wrong")
    })
    it('should return status 200 with correct auth token', async () => {
        const response = await request(baseURL)
            .post('/events')
            .set(auth)
            .send(someRandomContent)
        expect(response.statusCode).toBe(200)
    })
    it('should return status 400 if no payload specified', async () => {
        const response = await request(baseURL).post('/events').set(auth)
        expect(response.statusCode).toBe(400)
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

describe('check Connector API error cases', () => {
    it('should return status 404 and print missing route when requesting invalid route', async () => {
        const response = await request(baseURL)
            .post('/unknown')
            .set(auth)
            .send({ endpoint: 'unknown' })
        expect(response.statusCode).toBe(404)
        expect(response.text).toContain("Something's wrong.")
    })
})

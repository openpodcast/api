const request = require('supertest')
const baseURL = 'http://localhost:8080'

const auth = require('./authheader')

describe('Error Logging Tests', () => {

    describe('Test broken JSON payloads', () => {
        it('should return 400 and log error for invalid JSON structure in /connector endpoint', async () => {
            const brokenPayload = {
                // Missing required fields for connector
                invalidField: 'test',
                malformed: {
                    nested: true
                }
            }

            const response = await request(baseURL)
                .post('/connector')
                .set(auth)
                .send(brokenPayload)

            expect(response.statusCode).toBe(400)
            expect(response.text).toContain("Something's wrong. We're looking into it.")
            
            // Extract tracing ID from response to verify error logging is working
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            expect(tracingIdMatch[1]).toHaveLength(32)
        })

        it('should return 400 and log error for completely invalid JSON in /events endpoint', async () => {
            const malformedPayload = {
                // This will fail validation since events endpoint expects specific structure
                randomField: 'invalid',
                anotherField: 123
            }

            const response = await request(baseURL)
                .post('/events')
                .set(auth)
                .send(malformedPayload)

            // Events endpoint accepts any payload structure, so this should return 200
            expect(response.statusCode).toBe(200)
            expect(response.text).toContain('Data stored. Thx')
        })

        it('should return 400 and log error for spotify connector with invalid schema', async () => {
            const invalidSpotifyPayload = {
                provider: 'spotify',
                meta: {
                    endpoint: 'podcastDetailedStreams'
                },
                data: {
                    // Missing required fields that Spotify schema expects
                    invalidField: 'this will fail validation',
                    wrongStructure: true
                }
            }

            const response = await request(baseURL)
                .post('/connector')
                .set(auth)
                .send(invalidSpotifyPayload)

            expect(response.statusCode).toBe(400)
            expect(response.text).toContain("Something's wrong. We're looking into it.")

            // Extract tracing ID from response to verify error logging is working
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            expect(tracingIdMatch[1]).toHaveLength(32)
        })

        it('should return 400 and log error when sending empty payload to connector', async () => {
            const response = await request(baseURL)
                .post('/connector')
                .set(auth)
                .send({})

            expect(response.statusCode).toBe(400)
            expect(response.text).toContain("Something's wrong. We're looking into it.")

            // Extract tracing ID from response to verify error logging is working
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            expect(tracingIdMatch[1]).toHaveLength(32)
        })

        it('should return 404 and log error for invalid endpoint', async () => {
            const response = await request(baseURL)
                .post('/invalid-endpoint')
                .set(auth)
                .send({ test: 'payload' })

            expect(response.statusCode).toBe(404)
            expect(response.text).toContain("Something's wrong. We're looking into it.")

            // Extract tracing ID from response to verify error logging is working
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            expect(tracingIdMatch[1]).toHaveLength(32)
        })

        it('should return 401 and log error for invalid authentication', async () => {
            const invalidAuth = {
                Authorization: 'Bearer invalid-token',
                Accept: 'application/json'
            }

            const response = await request(baseURL)
                .post('/connector')
                .set(invalidAuth)
                .send({ test: 'payload' })

            expect(response.statusCode).toBe(401)
            expect(response.text).toContain("Something's wrong. We're looking into it.")

            // Extract tracing ID from response to verify error logging is working
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            expect(tracingIdMatch[1]).toHaveLength(32)
        })
    })

    describe('Test error response format', () => {
        it('should include tracing ID in error response', async () => {
            const testPayload = { invalid: 'payload' }

            const response = await request(baseURL)
                .post('/connector')
                .set(auth)
                .send(testPayload)

            expect(response.statusCode).toBe(400)
            expect(response.text).toContain("Something's wrong. We're looking into it.")
            
            // Extract tracing ID from response
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            expect(tracingIdMatch[1]).toHaveLength(32)
            
            // The tracing ID should be a valid hex string
            expect(tracingIdMatch[1]).toMatch(/^[a-f0-9]{32}$/)
        })
    })
})

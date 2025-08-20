const request = require('supertest')
const fs = require('fs')
const path = require('path')
const baseURL = 'http://localhost:8080'

const auth = require('./authheader')

describe('Error Logging Tests', () => {
    // Helper function to clean up error log files after tests
    const cleanupErrorLogs = () => {
        try {
            const tmpDir = '/tmp'
            const files = fs.readdirSync(tmpDir)
            files.forEach(file => {
                if (file.startsWith('error_') && file.endsWith('.json')) {
                    fs.unlinkSync(path.join(tmpDir, file))
                }
            })
        } catch (err) {
            // Ignore cleanup errors
        }
    }

    beforeEach(() => {
        cleanupErrorLogs()
    })

    afterEach(() => {
        cleanupErrorLogs()
    })

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
            
            // Extract tracing ID from response
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            
            if (tracingIdMatch) {
                const tracingId = tracingIdMatch[1]
                const errorLogPath = `/tmp/error_${tracingId}.json`
                
                // Check that error log file was created
                expect(fs.existsSync(errorLogPath)).toBe(true)
                
                // Read and verify error log content
                const errorLog = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'))
                
                expect(errorLog.tracingId).toBe(tracingId)
                expect(errorLog.error.name).toBe('PayloadError')
                expect(errorLog.request.method).toBe('POST')
                expect(errorLog.request.endpoint).toBe('/connector')
                expect(errorLog.request.payload).toEqual(brokenPayload)
                expect(errorLog.timestamp).toBeDefined()
                expect(errorLog.user).toBeTruthy()
            }
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

            expect(response.statusCode).toBe(400)
            expect(response.text).toContain("Something's wrong. We're looking into it.")

            // Extract tracing ID from response
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            
            if (tracingIdMatch) {
                const tracingId = tracingIdMatch[1]
                const errorLogPath = `/tmp/error_${tracingId}.json`
                
                // Check that error log file was created
                expect(fs.existsSync(errorLogPath)).toBe(true)
                
                // Read and verify error log content
                const errorLog = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'))
                
                expect(errorLog.tracingId).toBe(tracingId)
                expect(errorLog.request.method).toBe('POST')
                expect(errorLog.request.endpoint).toBe('/events')
                expect(errorLog.request.payload).toEqual(malformedPayload)
                expect(errorLog.error.message).toContain('Tracing ID')
            }
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

            // Extract tracing ID from response
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            
            if (tracingIdMatch) {
                const tracingId = tracingIdMatch[1]
                const errorLogPath = `/tmp/error_${tracingId}.json`
                
                // Check that error log file was created
                expect(fs.existsSync(errorLogPath)).toBe(true)
                
                // Read and verify error log content
                const errorLog = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'))
                
                expect(errorLog.tracingId).toBe(tracingId)
                expect(errorLog.request.payload).toEqual(invalidSpotifyPayload)
                expect(errorLog.request.payload.provider).toBe('spotify')
                expect(errorLog.error.name).toBe('PayloadError')
            }
        })

        it('should return 400 and log error when sending empty payload to connector', async () => {
            const response = await request(baseURL)
                .post('/connector')
                .set(auth)
                .send({})

            expect(response.statusCode).toBe(400)
            expect(response.text).toContain("Something's wrong. We're looking into it.")

            // Extract tracing ID from response
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            
            if (tracingIdMatch) {
                const tracingId = tracingIdMatch[1]
                const errorLogPath = `/tmp/error_${tracingId}.json`
                
                // Check that error log file was created
                expect(fs.existsSync(errorLogPath)).toBe(true)
                
                // Read and verify error log content
                const errorLog = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'))
                
                expect(errorLog.tracingId).toBe(tracingId)
                expect(errorLog.request.payload).toEqual({})
                expect(errorLog.error.message).toContain('Request format invalid')
            }
        })

        it('should return 404 and log error for invalid endpoint', async () => {
            const response = await request(baseURL)
                .post('/invalid-endpoint')
                .set(auth)
                .send({ test: 'payload' })

            expect(response.statusCode).toBe(404)
            expect(response.text).toContain("Something's wrong. We're looking into it.")

            // Extract tracing ID from response
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            
            if (tracingIdMatch) {
                const tracingId = tracingIdMatch[1]
                const errorLogPath = `/tmp/error_${tracingId}.json`
                
                // Check that error log file was created
                expect(fs.existsSync(errorLogPath)).toBe(true)
                
                // Read and verify error log content
                const errorLog = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'))
                
                expect(errorLog.tracingId).toBe(tracingId)
                expect(errorLog.request.endpoint).toBe('/invalid-endpoint')
                expect(errorLog.error.message).toContain('Not Found')
                expect(errorLog.error.name).toBe('HttpError')
            }
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

            // Extract tracing ID from response
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            
            if (tracingIdMatch) {
                const tracingId = tracingIdMatch[1]
                const errorLogPath = `/tmp/error_${tracingId}.json`
                
                // Check that error log file was created
                expect(fs.existsSync(errorLogPath)).toBe(true)
                
                // Read and verify error log content
                const errorLog = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'))
                
                expect(errorLog.tracingId).toBe(tracingId)
                expect(errorLog.request.headers.authorization).toBe('Bearer invalid-token')
                expect(errorLog.error.name).toBe('AuthError')
                expect(errorLog.user).toBeNull()
            }
        })
    })

    describe('Test error log content completeness', () => {
        it('should log all required fields in error log', async () => {
            const testPayload = { invalid: 'payload' }

            const response = await request(baseURL)
                .post('/connector')
                .set(auth)
                .send(testPayload)

            expect(response.statusCode).toBe(400)

            // Extract tracing ID from response
            const tracingIdMatch = response.text.match(/\(([a-f0-9]{32})\)/)
            expect(tracingIdMatch).toBeTruthy()
            
            if (tracingIdMatch) {
                const tracingId = tracingIdMatch[1]
                const errorLogPath = `/tmp/error_${tracingId}.json`
                
                // Check that error log file was created
                expect(fs.existsSync(errorLogPath)).toBe(true)
                
                // Read and verify error log content structure
                const errorLog = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'))
                
                // Verify all required fields exist
                expect(errorLog).toHaveProperty('tracingId')
                expect(errorLog).toHaveProperty('timestamp')
                expect(errorLog).toHaveProperty('error')
                expect(errorLog).toHaveProperty('request')
                expect(errorLog).toHaveProperty('user')
                
                // Verify error object structure
                expect(errorLog.error).toHaveProperty('message')
                expect(errorLog.error).toHaveProperty('name')
                expect(errorLog.error).toHaveProperty('stack')
                
                // Verify request object structure
                expect(errorLog.request).toHaveProperty('method')
                expect(errorLog.request).toHaveProperty('url')
                expect(errorLog.request).toHaveProperty('endpoint')
                expect(errorLog.request).toHaveProperty('headers')
                expect(errorLog.request).toHaveProperty('query')
                expect(errorLog.request).toHaveProperty('params')
                expect(errorLog.request).toHaveProperty('payload')
                
                // Verify the payload is exactly what we sent
                expect(errorLog.request.payload).toEqual(testPayload)
                
                // Verify timestamp is valid ISO string
                expect(new Date(errorLog.timestamp).toISOString()).toBe(errorLog.timestamp)
            }
        })
    })
})

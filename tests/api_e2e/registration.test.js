const request = require('supertest')
const baseURL = 'http://localhost:8080'

describe('User Registration API', () => {
    const validUserData = {
        name: 'John Doe',
        email: 'john.doe@example.com'
    }

    describe('POST /register - Successful Registration', () => {
        it('should register a new user successfully', async () => {
            const uniqueEmail = `test-${Date.now()}@example.com`
            const userData = {
                name: 'Test User',
                email: uniqueEmail
            }

            const response = await request(baseURL)
                .post('/register')
                .send(userData)

            expect(response.statusCode).toBe(201)
            expect(response.body).toMatchObject({
                success: true,
                data: {
                    userId: expect.any(Number),
                    apiKey: expect.stringMatching(/^op_[a-f0-9]{32}$/),
                    email: uniqueEmail,
                    name: 'Test User'
                }
            })
        })
    })

    describe('POST /register - Duplicate Email', () => {
        it('should return existing user data when email already exists', async () => {
            const existingEmail = `existing-${Date.now()}@example.com`
            const userData = {
                name: 'First User',
                email: existingEmail
            }

            // First registration
            const firstResponse = await request(baseURL)
                .post('/register')
                .send(userData)

            expect(firstResponse.statusCode).toBe(201)

            // Second registration with same email
            const secondResponse = await request(baseURL)
                .post('/register')
                .send({
                    name: 'Second User',
                    email: existingEmail
                })

            expect(secondResponse.statusCode).toBe(409)
            expect(secondResponse.body).toMatchObject({
                success: false,
                error: 'Email already registered',
                data: {
                    userId: expect.any(Number),
                    apiKey: expect.stringMatching(/^op_[a-f0-9]{32}$/),
                    email: existingEmail,
                    name: 'First User' // Should maintain original name
                }
            })
        })
    })

    describe('POST /register - Validation Errors', () => {
        it('should return 400 for missing name', async () => {
            const response = await request(baseURL)
                .post('/register')
                .send({
                    email: 'test@example.com'
                })

            expect(response.statusCode).toBe(400)
            expect(response.body).toMatchObject({
                success: false,
                error: 'Validation failed',
                details: expect.arrayContaining([
                    expect.stringContaining('Name')
                ])
            })
        })

        it('should return 400 for missing email', async () => {
            const response = await request(baseURL)
                .post('/register')
                .send({
                    name: 'Test User'
                })

            expect(response.statusCode).toBe(400)
            expect(response.body).toMatchObject({
                success: false,
                error: 'Validation failed',
                details: expect.arrayContaining([
                    expect.stringContaining('Email')
                ])
            })
        })

        it('should return 400 for invalid email format', async () => {
            const response = await request(baseURL)
                .post('/register')
                .send({
                    name: 'Test User',
                    email: 'invalid-email'
                })

            expect(response.statusCode).toBe(400)
            expect(response.body).toMatchObject({
                success: false,
                error: 'Validation failed',
                details: expect.arrayContaining([
                    expect.stringContaining('Email')
                ])
            })
        })

        it('should return 400 for name too short', async () => {
            const response = await request(baseURL)
                .post('/register')
                .send({
                    name: 'A',
                    email: 'test@example.com'
                })

            expect(response.statusCode).toBe(400)
            expect(response.body).toMatchObject({
                success: false,
                error: 'Validation failed',
                details: expect.arrayContaining([
                    expect.stringContaining('Name')
                ])
            })
        })

        it('should return 400 for name too long', async () => {
            const longName = 'A'.repeat(101)
            const response = await request(baseURL)
                .post('/register')
                .send({
                    name: longName,
                    email: 'test@example.com'
                })

            expect(response.statusCode).toBe(400)
            expect(response.body).toMatchObject({
                success: false,
                error: 'Validation failed',
                details: expect.arrayContaining([
                    expect.stringContaining('Name')
                ])
            })
        })

        it('should return 400 for empty JSON body', async () => {
            const response = await request(baseURL)
                .post('/register')
                .send({})

            expect(response.statusCode).toBe(400)
            expect(response.body).toMatchObject({
                success: false,
                error: 'Validation failed'
            })
        })
    })

    describe('POST /register - Data Normalization', () => {
        it('should normalize email to lowercase', async () => {
            const uniqueEmail = `TEST-${Date.now()}@EXAMPLE.COM`
            const userData = {
                name: 'Test User',
                email: uniqueEmail
            }

            const response = await request(baseURL)
                .post('/register')
                .send(userData)

            expect(response.statusCode).toBe(201)
            expect(response.body.data.email).toBe(uniqueEmail.toLowerCase())
        })

        it('should trim whitespace from name', async () => {
            const uniqueEmail = `test-${Date.now()}@example.com`
            const userData = {
                name: '  Test User  ',
                email: uniqueEmail
            }

            const response = await request(baseURL)
                .post('/register')
                .send(userData)

            expect(response.statusCode).toBe(201)
            expect(response.body.data.name).toBe('Test User')
        })
    })

    describe('POST /register - API Key Format', () => {
        it('should generate API key with correct format', async () => {
            const uniqueEmail = `test-${Date.now()}@example.com`
            const userData = {
                name: 'Test User',
                email: uniqueEmail
            }

            const response = await request(baseURL)
                .post('/register')
                .send(userData)

            expect(response.statusCode).toBe(201)
            expect(response.body.data.apiKey).toMatch(/^op_[a-f0-9]{32}$/)
        })
    })
})
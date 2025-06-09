const request = require('supertest')
const baseURL = 'http://localhost:8080'

describe('comments endpoint tests', () => {
    // Test with both comment and email
    it('should return status 200 when sending a comment with email', async () => {
        const response = await request(baseURL)
            .post('/comments/123456')
            .send({ email: 'test@example.com', comment: 'Great episode!' })
        expect(response.statusCode).toBe(200)
    })

    // Test with only comment and no email
    it('should return status 200 when sending a comment without email', async () => {
        const response = await request(baseURL)
            .post('/comments/234567')
            .send({ comment: 'Interesting content!' })
        expect(response.statusCode).toBe(200)
    })

    // Test with invalid comment (too short)
    it('should return status 400 for comment that is too short', async () => {
        const response = await request(baseURL)
            .post('/comments/123456')
            .send({ comment: 'Hi' })
        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            status: 'error',
            message: 'Validation failed',
            errors: [
                {
                    field: 'comment',
                    message: 'Comment must be between 3 and 1000 characters',
                },
            ],
        })
    })

    // Test with invalid email
    it('should return status 400 for invalid email', async () => {
        const response = await request(baseURL)
            .post('/comments/123456')
            .send({ email: 'notanemail', comment: 'This is a valid comment.' })
        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            status: 'error',
            message: 'Validation failed',
            errors: [
                {
                    field: 'email',
                    message:
                        'Please provide a valid email address or remove it completely',
                },
            ],
        })
    })

    // Test with empty comment
    it('should return status 400 for empty comment', async () => {
        const response = await request(baseURL)
            .post('/comments/123456')
            .send({ comment: '' })
        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            status: 'error',
            message: 'Validation failed',
            errors: [
                {
                    field: 'comment',
                    message: 'Comment cannot be empty',
                },
                {
                    field: 'comment',
                    message: 'Comment must be between 3 and 1000 characters',
                },
            ],
        })
    })

    // Test with comment that is too long
    it('should return status 400 for comment exceeding max length', async () => {
        const response = await request(baseURL)
            .post('/comments/123456')
            .send({ comment: 'a'.repeat(1001) })
        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            status: 'error',
            message: 'Validation failed',
            errors: [
                {
                    field: 'comment',
                    message: 'Comment must be between 3 and 1000 characters',
                },
            ],
        })
    })
})

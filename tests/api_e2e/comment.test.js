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

    // Test with invalid comment (too short, email is optional)
    it('should return status 400 for invalid comment', async () => {
        const response = await request(baseURL)
            .post('/comments/123456')
            .send({ comment: 'Hi' }) // Assuming the minimum length is 3
        expect(response.statusCode).toBe(400)
    })

    // Test with invalid email (comment is valid)
    it('should return status 400 for invalid email', async () => {
        const response = await request(baseURL)
            .post('/comments/123456')
            .send({ email: 'notanemail', comment: 'This is a valid comment.' })
        expect(response.statusCode).toBe(400)
    })
})

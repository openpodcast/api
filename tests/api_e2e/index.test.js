const request = require('supertest')
const baseURL = 'http://localhost:8080'

describe('check API', () => {
  it('should return not authenticated without bearer', async () => {
    const response = await request(baseURL).post('/events')
    expect(response.statusCode).toBe(401)
    expect(response.text).toContain('Not authorized')
  })
  it('should return status 200 with specified bearer', async () => {
    const response = await request(baseURL)
      .post('/events')
      .set({ Authorization: 'Bearer cn389ncoiwuencr', Accept: 'application/json' })
    expect(response.statusCode).toBe(200)
  })
})

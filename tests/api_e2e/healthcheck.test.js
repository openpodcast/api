const request = require('supertest')
const baseURL = 'http://localhost:8080'

describe('check health endpoint', () => {
  it('should return status 200 when sending proper request', async () => {
    const response = await request(baseURL).get('/health')
    expect(response.statusCode).toBe(200)
    expect(response.body.db).toBe(true)
    expect(response.body).toHaveProperty('version')
    expect(response.body).toHaveProperty('buildTime')
    expect(response.body).toHaveProperty('commit')
  })
})

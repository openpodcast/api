const request = require('supertest')

const baseURL = 'http://localhost:8080/feedback/'

describe('check up/downvote', () => {
  it('should return status 200 when upvoting', async () => {
    const response = await request(baseURL).get(`0/upvote`).send()
    expect(response.statusCode).toBe(200)
    expect(response.text).toContain('Thank you for your feedback!')
  })

  it('should return status 200 when downvoting', async () => {
    const response = await request(baseURL).get(`1/downvote`).send()
    expect(response.statusCode).toBe(200)
    expect(response.text).toContain('Thank you for your feedback!')
  })
})

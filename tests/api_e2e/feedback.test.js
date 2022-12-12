const request = require('supertest')
const baseURL = 'http://localhost:8080'

//send thumbs up and down to the feedback endpoint and check if return code is 200
describe('check feedback endpoint', () => {
    it('should return status 200 when sending proper request', async () => {
        const response = await request(baseURL).get('/feedback/123456/upvote')
        expect(response.statusCode).toBe(200)
    })
    //send thumbs down to the feedback endpoint and check if return code is 200
    it('should return status 200 when sending proper request', async () => {
        const response = await request(baseURL).get('/feedback/123456/downvote')
        expect(response.statusCode).toBe(200)
    })
})

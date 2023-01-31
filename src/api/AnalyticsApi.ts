import { AnalyticsRepository } from '../db/AnalyticsRepository'

class AnalyticsApi {
    AnalyticsRepo: AnalyticsRepository

    constructor(AnalyticsRepo: AnalyticsRepository) {
        this.AnalyticsRepo = AnalyticsRepo
    }

    // Returns the latest Analytics for the given accountId and endpoint
    async getAnalytics(endpoint: string) {
        // Validate endpoint.
        // The endpoint needs to be a string and must not be empty.
        // It needs to be of the form `vN/endpoint` where N is a number and must
        // not contain any special characters.
        if (typeof endpoint !== 'string' || endpoint.length === 0) {
            throw new Error('Invalid endpoint. Must be a non-empty string')
        }

        if (!/^v\d+\/[a-zA-Z0-9_]+$/.test(endpoint)) {
            throw new Error('Invalid endpoint. Must be of the form v1/endpoint')
        }

        return await this.AnalyticsRepo.execute(endpoint)
    }
}

export { AnalyticsApi }

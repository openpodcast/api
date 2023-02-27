import { AnalyticsRepository } from '../db/AnalyticsRepository'

class AnalyticsApi {
    AnalyticsRepo: AnalyticsRepository

    constructor(AnalyticsRepo: AnalyticsRepository) {
        this.AnalyticsRepo = AnalyticsRepo
    }

    // Get the specified date and time in SQL format.
    // Use date format YYYY-MM-DD.
    formatDate(date: Date) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()

        return `${year}-${month}-${day}`
    }

    // Returns the latest Analytics for the given accountId and endpoint
    async getAnalytics(
        endpoint: string,
        startDate: Date = new Date(),
        endDate: Date = new Date()
    ) {
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

        const sqlVars = {
            start: this.formatDate(startDate),
            end: this.formatDate(endDate),
        }

        return await this.AnalyticsRepo.execute(endpoint, sqlVars)
    }
}

export { AnalyticsApi }

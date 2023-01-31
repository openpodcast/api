import { StatusRepository } from '../db/StatusRepository'
import { StatusPayload } from '../types/api'

class StatusApi {
    statusRepo: StatusRepository

    constructor(statusRepo: StatusRepository) {
        this.statusRepo = statusRepo
    }

    // Returns the latest status for the given accountId and endpoint
    async getStatus() {
        return await this.statusRepo.getStatus()
    }

    async updateStatus(accountId: number, update: StatusPayload): Promise<any> {
        return await this.statusRepo.updateStatus(accountId, update)
    }
}

export { StatusApi }

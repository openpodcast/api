import { EventRepository } from '../db/EventRepository'
import { JsonPayload, Event } from '../types/api'

class EventsApi {
    repo: EventRepository

    constructor(repository: EventRepository) {
        this.repo = repository
    }

    getEventFromRawBodyPayload(payload: JsonPayload): Event | never {
        return payload
    }

    async handleApiPost(accountId: number, payload: JsonPayload): Promise<any> {
        const cleanedPayload = this.getEventFromRawBodyPayload(payload)
        return await this.repo.storeEvent(accountId, cleanedPayload)
    }
}

export { EventsApi }

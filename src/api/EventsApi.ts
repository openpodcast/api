import { ForwarderPayload, Event } from '../types/api'
import { EventRepository } from '../types/db'

class EventsApi {
  dbEvents: EventRepository

  getEventFromRawBodyPayload (payload: ForwarderPayload): Event | never {
    return payload
  }

  async handleApiPost (accountId: number, payload: ForwarderPayload): Promise<any> {
    const cleanedPayload = this.getEventFromRawBodyPayload(payload)
    return await this.dbEvents.storeEvent(accountId, cleanedPayload)
  }

  constructor (db: EventRepository | null) {
    if (db == null) {
      throw new Error('given EventRepository is invalid')
    }
    this.dbEvents = db
  }
}

export { EventsApi }

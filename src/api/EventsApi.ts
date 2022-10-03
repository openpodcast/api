import { MySQLEvents } from '../db/MySQLEvents'
import { JsonPayload, Event } from '../types/api'

class EventsApi {
  eventRepository: MySQLEvents

  getEventFromRawBodyPayload (payload: JsonPayload): Event | never {
    return payload
  }

  async handleApiPost (accountId: number, payload: JsonPayload): Promise<any> {
    const cleanedPayload = this.getEventFromRawBodyPayload(payload)
    return await this.eventRepository.storeEvent(accountId, cleanedPayload)
  }

  constructor (repository: MySQLEvents | null) {
    if (repository == null) {
      throw new Error('given EventRepository is invalid')
    }
    this.eventRepository = repository
  }
}

export { EventsApi }

import { ForwarderPayload, AuthError, Event } from '../types/api'
import { EventRepository } from '../types/db'

class EventsApi {
  dbEvents: EventRepository

  getAccountFromAuthToken (token: string | undefined): number | never {
    if (!token || token.length < 7 || !token.startsWith('Bearer ')) {
      throw new AuthError('Auth token not valid')
    }
    return 1
  }

  getEventFromRawBodyPayload (payload: ForwarderPayload): Event | never {
    return payload
  }

  async handleApiPost (auth: string | undefined, payload: ForwarderPayload): Promise<any> {
    const accountId = this.getAccountFromAuthToken(auth)
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

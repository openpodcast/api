import { Event } from './api'

export interface EventRepository {
  storeEvent: (accountId: number, event: Event) => Promise<any>
}

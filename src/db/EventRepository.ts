import { Event } from '../types/api'
import { Pool } from 'mysql2/promise'

class EventRepository {
    pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    async storeEvent(accountId: number, event: Event): Promise<any> {
        return await this.pool.query(
            'INSERT INTO events (account_id, ev_raw) VALUES (?,?)',
            [accountId.toString(), JSON.stringify(event)]
        )
    }
}

export { EventRepository }

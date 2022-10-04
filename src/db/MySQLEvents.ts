import mysql from 'mysql2/promise'
import { Event } from '../types/api'

class MySQLEvents {
    connection

    constructor(connectionString: string | undefined) {
        if (connectionString === undefined) {
            throw new Error('connection string to connect to DB is undefined')
        }
        // TODO: maybe use pooling for more throughput
        this.connection = mysql.createConnection(connectionString)
    }

    async close(): Promise<any> {
        const connection = await this.connection
        return await connection.end()
    }

    async storeEvent(accountId: number, event: Event): Promise<any> {
        const connection = await this.connection
        return await connection.query(
            'INSERT INTO events (account_id, ev_raw) VALUES (?,?)',
            [accountId.toString(), JSON.stringify(event)]
        )
    }
}

export { MySQLEvents }

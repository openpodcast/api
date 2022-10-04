import { ConnectorHandler } from '.'
import { JsonPayload, PayloadError } from '../../types/api'
import mysql from 'mysql2/promise'

class SpotifyConnector implements ConnectorHandler {
    async handleDetailedStreams(
        accountId: number,
        payload: { detailedStreams: Object[] } | undefined
    ): Promise<void> | never {
        // just a quick and dirty approach to implement one api

        if (
            payload === undefined ||
            payload.detailedStreams === undefined ||
            !Array.isArray(payload.detailedStreams)
        ) {
            throw new PayloadError('no Detailed Stream data found')
        }
        const connection = await mysql.createConnection(
            process.env.DB_CONNECTION_STRING
        )
        const insertStmt =
            'INSERT INTO spotifyDetailedStreams (account_id, sps_date, sps_starts, sps_streams) VALUES (?,?,?,?)'

        await Promise.all(
            payload.detailedStreams.map(
                async (entry: any): Promise<any> =>
                    await connection.execute(insertStmt, [
                        accountId,
                        entry.date,
                        entry.starts,
                        entry.streams,
                    ])
            )
        )

        return connection.unprepare(insertStmt)
    }

    async handleRequest(
        accountId: number,
        payload: JsonPayload
    ): Promise<void> | never {
        if (payload.meta === undefined || payload.meta.endpoint === undefined) {
            throw new PayloadError('Endpoint in meta is not defined')
        }
        if (payload.data === undefined) {
            throw new PayloadError('No valid data section found')
        }
        if (payload.meta.endpoint === 'detailedStreams') {
            return await this.handleDetailedStreams(accountId, payload.data)
        } else {
            throw new PayloadError('Unknown endpoint in meta')
        }
    }
}

export { SpotifyConnector }

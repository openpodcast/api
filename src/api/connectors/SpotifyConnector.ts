import { ConnectorHandler } from '.'
import { JsonPayload, PayloadError } from '../../types/api'
import mysql from 'mysql2/promise'
import {
    ConnectorPayload,
    SpotifyDetailedStreamsPayload,
} from '../../types/connector'
import detailedStreamsSchema from '../../schema/spotify/detailedStreams.json'
import { validateAdditionalItems } from 'ajv/dist/vocabularies/applicator/additionalItems'
import { validateJsonApiPayload } from '../JsonPayloadValidator'

class SpotifyConnector implements ConnectorHandler {
    async handleDetailedStreams(
        accountId: number,
        payload: SpotifyDetailedStreamsPayload
    ): Promise<void> | never {
        // just a quick and dirty approach to implement one api
        // TODO: move to SpotifyRepository

        if (
            payload === undefined ||
            payload.detailedStreams === undefined ||
            !Array.isArray(payload.detailedStreams)
        ) {
            throw new PayloadError('no Detailed Stream data found')
        }
        const connection = await mysql.createConnection(
            process.env.DB_CONNECTION_STRING as string
        )
        const insertStmt =
            'REPLACE INTO spotifyDetailedStreams (account_id, sps_date, sps_starts, sps_streams) VALUES (?,?,?,?)'

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
        payload: ConnectorPayload
    ): Promise<void> | never {
        if (payload.meta.endpoint === 'detailedStreams') {
            //validates the payload and throws an error if it is not valid
            validateJsonApiPayload(detailedStreamsSchema, payload.data)
            return await this.handleDetailedStreams(
                accountId,
                payload.data as SpotifyDetailedStreamsPayload
            )
        } else {
            throw new PayloadError('Unknown endpoint in meta')
        }
    }
}

export { SpotifyConnector }

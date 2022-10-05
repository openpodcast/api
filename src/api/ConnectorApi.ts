import { EventRepository } from '../db/EventRepository'
import { PayloadError } from '../types/api'
import { getConnectorHandler } from './connectors'
import connectorSchema from '../schema/connector.json'
import { ConnectorPayload } from '../types/connector'
import { validateJsonApiPayload } from './JsonPayloadValidator'

class ConnectorApi {
    constructor(db: EventRepository) {}

    async handleApiPost(
        accountId: number,
        payload: any
    ): Promise<void> | never {
        // validate the wrapper json around the endpoint payload
        // the endpoint payload is checked by the respective connector handler
        validateJsonApiPayload(connectorSchema, payload)

        // after validation we can cast the payload to the proper typed payload
        const connectorPayload = payload as ConnectorPayload

        //get responsible connector handler such as Spotify or Apple
        const connectorHandler = getConnectorHandler(connectorPayload.provider)
        if (connectorHandler === null) {
            throw new PayloadError('No valid provider specified')
        }
        return await connectorHandler.handleRequest(accountId, connectorPayload)
    }
}

export { ConnectorApi }

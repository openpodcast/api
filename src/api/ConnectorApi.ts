import { PayloadError } from '../types/api'
import { ConnectorHandler } from './connectors'
import connectorSchema from '../schema/connector.json'
import { ConnectorPayload } from '../types/connector'
import { validateJsonApiPayload } from './JsonPayloadValidator'

class ConnectorApi {
    connectorHandlerMap: { [x: string]: ConnectorHandler }

    constructor(connectorHandlerMap: { [x: string]: ConnectorHandler }) {
        this.connectorHandlerMap = connectorHandlerMap
    }

    getConnectorHandler(provider: string): ConnectorHandler | null {
        return this.connectorHandlerMap[provider] ?? null
    }

    // Handle connector post requests
    // Returns the connector payload for further processing (status update /
    // event sourcing)
    async handleApiPost(
        accountId: number,
        payload: any
    ): Promise<ConnectorPayload> | never {
        // validate the wrapper json around the endpoint payload
        // the endpoint payload is checked by the respective connector handler
        validateJsonApiPayload(connectorSchema, payload)

        // after validation we can cast the payload to the proper typed payload
        const connectorPayload = payload as ConnectorPayload

        // Convert meta.show to string if it's a number (for compatibility with Podigee and other providers)
        if (typeof connectorPayload.meta.show === 'number') {
            connectorPayload.meta.show = connectorPayload.meta.show.toString()
        }

        //get responsible connector handler such as Spotify or Apple
        const connectorHandler = this.getConnectorHandler(
            connectorPayload.provider
        )
        if (connectorHandler === null) {
            throw new PayloadError('No valid provider specified')
        }
        await connectorHandler.handleRequest(accountId, connectorPayload)
        return connectorPayload
    }
}

export { ConnectorApi }

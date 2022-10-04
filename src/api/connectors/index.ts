import { JsonPayload } from '../../types/api'
import { SpotifyConnector } from './SpotifyConnector'

interface ConnectorHandler {
    handleRequest: (
        accountId: number,
        payload: JsonPayload
    ) => Promise<void> | never
}

const map: { [x: string]: ConnectorHandler } = {
    spotify: new SpotifyConnector(),
}

const getConnectorHandler = function (
    connector: string
): ConnectorHandler | null {
    return map[connector] ?? null
}

export { getConnectorHandler, ConnectorHandler }

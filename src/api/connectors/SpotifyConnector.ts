import { ConnectorHandler } from '.'
import { JsonPayload } from '../../types/api'

class SpotifyConnector implements ConnectorHandler {
  async handleRequest (accountId: number, payload: JsonPayload): Promise<boolean> | never {
    return await new Promise()
  }
}

export { SpotifyConnector }

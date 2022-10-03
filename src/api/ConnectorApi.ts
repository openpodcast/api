import { MySQLEvents } from '../db/MySQLEvents'
import { JsonPayload, PayloadError } from '../types/api'
import { getConnectorHandler } from './connectors'

class ConnectorApi {
  async handleApiPost (accountId: number, payload: JsonPayload): Promise<void> | never {
    if (payload.provider === undefined) {
      throw new PayloadError('No provider specified')
    }
    const connectorHandler = getConnectorHandler(payload.provider)
    if (connectorHandler === null) {
      throw new PayloadError('No valid provider specified')
    }
    return await connectorHandler.handleRequest(accountId, payload)
  }

  constructor (db: MySQLEvents) {
    // TODO: use DB
  }
}

export { ConnectorApi }

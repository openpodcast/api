import { PayloadError } from '../types/api'

class ConnectorApi {
  connectorRepository: ConnectorRepository

  async handleApiPost (accountId: number, payload: JsonPayload): Promise<any> {
    if (!payload.connector) {
      throw new PayloadError('No connector specified')
    }
    const connector = getConnectorHandler(payload.connector)

    return true
  }

  constructor (repository: ConnectorRepository | null) {
    if (repository == null) {
      throw new Error('given ConnectorRepository is invalid')
    }
    this.connectorRepository = repository
  }
}

export { ConnectorApi }

import { ConnectorPayload } from '../../types/connector'

interface ConnectorHandler {
    handleRequest: (
        accountId: number,
        payload: ConnectorPayload
    ) => Promise<void> | never
}

export { ConnectorHandler }

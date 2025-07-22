import { ConnectorApi } from './ConnectorApi'
import { ConnectorHandler } from './connectors'
import { ConnectorPayload } from '../types/connector'

// Mock connector handler
class MockConnectorHandler implements ConnectorHandler {
    async handleRequest(
        accountId: number,
        payload: ConnectorPayload
    ): Promise<void> {
        // Mock implementation - just resolve
        return Promise.resolve()
    }
}

describe('ConnectorApi', () => {
    let connectorApi: ConnectorApi
    let mockHandler: MockConnectorHandler

    beforeEach(() => {
        mockHandler = new MockConnectorHandler()
        connectorApi = new ConnectorApi({
            podigee: mockHandler,
        })
    })

    it('should convert numeric show to string', async () => {
        const mockHandleRequest = jest.spyOn(mockHandler, 'handleRequest')

        const payloadWithNumericShow = {
            provider: 'podigee',
            version: 1,
            retrieved: '2022-10-04T10:09:46.463Z',
            meta: {
                show: 12345, // numeric show ID
                endpoint: 'metadata',
            },
            data: {
                name: 'Test Podcast',
            },
        }

        await connectorApi.handleApiPost(1, payloadWithNumericShow)

        expect(mockHandleRequest).toHaveBeenCalledTimes(1)
        const calledPayload = mockHandleRequest.mock.calls[0][1]
        expect(typeof calledPayload.meta.show).toBe('string')
        expect(calledPayload.meta.show).toBe('12345')
    })

    it('should preserve string show values', async () => {
        const mockHandleRequest = jest.spyOn(mockHandler, 'handleRequest')

        const payloadWithStringShow = {
            provider: 'podigee',
            version: 1,
            retrieved: '2022-10-04T10:09:46.463Z',
            meta: {
                show: 'string-show-id', // string show ID
                endpoint: 'metadata',
            },
            data: {
                name: 'Test Podcast',
            },
        }

        await connectorApi.handleApiPost(1, payloadWithStringShow)

        expect(mockHandleRequest).toHaveBeenCalledTimes(1)
        const calledPayload = mockHandleRequest.mock.calls[0][1]
        expect(typeof calledPayload.meta.show).toBe('string')
        expect(calledPayload.meta.show).toBe('string-show-id')
    })
})

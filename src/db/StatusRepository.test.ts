import { Pool, RowDataPacket } from 'mysql2/promise'
import { StatusRepository } from './StatusRepository'

describe('StatusRepository', () => {
    let mockPool: jest.Mocked<Pool>
    let statusRepository: StatusRepository

    beforeEach(() => {
        mockPool = {
            query: jest.fn(),
        } as any

        statusRepository = new StatusRepository(mockPool)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('returns latest updates grouped by podcast and endpoint', async () => {
        const rows = [
            {
                account_id: 1,
                provider: 'spotify',
                endpoint: 'aggregate',
                latest_update: '2026-07-22 10:00:00',
            },
            {
                account_id: 1,
                provider: 'apple',
                endpoint: 'trends',
                latest_update: '2026-07-22 11:00:00',
            },
            {
                account_id: 2,
                provider: 'spotify',
                endpoint: 'aggregate',
                latest_update: '2026-07-21 10:00:00',
            },
        ] as RowDataPacket[]

        mockPool.query.mockResolvedValue([rows, []] as any)

        const status = await statusRepository.getStatus()

        expect(status).toEqual({
            1: {
                latestUpdates: {
                    'spotify/aggregate': new Date('2026-07-22 10:00:00'),
                    'apple/trends': new Date('2026-07-22 11:00:00'),
                },
            },
            2: {
                latestUpdates: {
                    'spotify/aggregate': new Date('2026-07-21 10:00:00'),
                },
            },
        })
    })
})

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

    it('returns endpoint statistics with failed podcasts', async () => {
        const recentDate = new Date()
        recentDate.setDate(recentDate.getDate() - 1)

        const oldDate = new Date()
        oldDate.setDate(oldDate.getDate() - 10)

        const rows = [
            {
                account_id: 1,
                provider: 'spotify',
                endpoint: 'aggregate',
                last_successful_update: recentDate.toISOString(),
            },
            {
                account_id: 2,
                provider: 'spotify',
                endpoint: 'aggregate',
                last_successful_update: oldDate.toISOString(),
            },
            {
                account_id: 3,
                provider: 'spotify',
                endpoint: 'aggregate',
                last_successful_update: recentDate.toISOString(),
            },
            {
                account_id: 4,
                provider: 'apple',
                endpoint: 'trends',
                last_successful_update: oldDate.toISOString(),
            },
        ] as RowDataPacket[]

        mockPool.query.mockResolvedValue([rows, []] as any)

        const statistics = await statusRepository.getEndpointStatistics(7)

        expect(statistics).toEqual([
            {
                provider: 'spotify',
                endpoint: 'aggregate',
                requests: {
                    total: 3,
                    successful: 2,
                    failed: 1,
                    successRate: 2 / 3,
                },
                failedPodcasts: [
                    {
                        podcastId: 2,
                        podcastName: null,
                    },
                ],
            },
            {
                provider: 'apple',
                endpoint: 'trends',
                requests: {
                    total: 1,
                    successful: 0,
                    failed: 1,
                    successRate: 0,
                },
                failedPodcasts: [
                    {
                        podcastId: 4,
                        podcastName: null,
                    },
                ],
            },
        ])
    })
})

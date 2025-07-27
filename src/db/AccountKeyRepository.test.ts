import { AccountKeyRepository } from './AccountKeyRepository'
import { Pool, RowDataPacket } from 'mysql2/promise'

// Mock mysql2/promise
jest.mock('mysql2/promise')

describe('AccountKeyRepository', () => {
    let accountKeyRepository: AccountKeyRepository
    let mockPool: jest.Mocked<Pool>

    beforeEach(() => {
        mockPool = {
            execute: jest.fn(),
        } as any

        accountKeyRepository = new AccountKeyRepository(mockPool)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('getAccountIdsByKey', () => {
        it('should return array of account IDs for valid API key', async () => {
            const mockRows = [
                { account_id: 1 },
                { account_id: 2 },
                { account_id: 3 },
            ] as RowDataPacket[]
            mockPool.execute.mockResolvedValue([mockRows, []] as any)

            const result = await accountKeyRepository.getAccountIdsByKey(
                'valid-key-123'
            )

            expect(result).toEqual([1, 2, 3])
            expect(mockPool.execute).toHaveBeenCalledWith(
                'SELECT account_id FROM apiKeys WHERE key_hash = ?',
                [expect.any(String)] // The hashed key
            )
        })

        it('should return single account ID in array', async () => {
            const mockRows = [{ account_id: 42 }] as RowDataPacket[]
            mockPool.execute.mockResolvedValue([mockRows, []] as any)

            const result = await accountKeyRepository.getAccountIdsByKey(
                'single-account-key'
            )

            expect(result).toEqual([42])
        })

        it('should return empty array when no accounts found', async () => {
            const mockRows: RowDataPacket[] = []
            mockPool.execute.mockResolvedValue([mockRows, []] as any)

            const result = await accountKeyRepository.getAccountIdsByKey(
                'nonexistent-key'
            )

            expect(result).toEqual([])
        })

        it('should filter out rows with null account_id', async () => {
            const mockRows = [
                { account_id: 1 },
                { account_id: null },
                { account_id: 2 },
                { account_id: undefined },
                { account_id: 3 },
            ] as RowDataPacket[]
            mockPool.execute.mockResolvedValue([mockRows, []] as any)

            const result = await accountKeyRepository.getAccountIdsByKey(
                'mixed-data-key'
            )

            expect(result).toEqual([1, 2, 3])
        })

        it('should throw error for empty API key', async () => {
            await expect(
                accountKeyRepository.getAccountIdsByKey('')
            ).rejects.toThrow('Invalid API key')

            expect(mockPool.execute).not.toHaveBeenCalled()
        })

        it('should throw error for null API key', async () => {
            await expect(
                accountKeyRepository.getAccountIdsByKey(null as any)
            ).rejects.toThrow('Invalid API key')

            expect(mockPool.execute).not.toHaveBeenCalled()
        })

        it('should throw error for undefined API key', async () => {
            await expect(
                accountKeyRepository.getAccountIdsByKey(undefined as any)
            ).rejects.toThrow('Invalid API key')

            expect(mockPool.execute).not.toHaveBeenCalled()
        })

        it('should throw error for API key longer than 255 characters', async () => {
            const longKey = 'a'.repeat(256)

            await expect(
                accountKeyRepository.getAccountIdsByKey(longKey)
            ).rejects.toThrow('Invalid API key')

            expect(mockPool.execute).not.toHaveBeenCalled()
        })

        it('should handle API key exactly 255 characters', async () => {
            const maxLengthKey = 'a'.repeat(255)
            const mockRows = [{ account_id: 1 }] as RowDataPacket[]
            mockPool.execute.mockResolvedValue([mockRows, []] as any)

            const result = await accountKeyRepository.getAccountIdsByKey(
                maxLengthKey
            )

            expect(result).toEqual([1])
            expect(mockPool.execute).toHaveBeenCalled()
        })

        it('should use hashed key in database query', async () => {
            const apiKey = 'test-key-123'
            const mockRows = [{ account_id: 1 }] as RowDataPacket[]
            mockPool.execute.mockResolvedValue([mockRows, []] as any)

            await accountKeyRepository.getAccountIdsByKey(apiKey)

            expect(mockPool.execute).toHaveBeenCalledWith(
                'SELECT account_id FROM apiKeys WHERE key_hash = ?',
                [expect.stringMatching(/^[a-f0-9]{64}$/)] // SHA-256 hash is 64 hex characters
            )
        })

        it('should handle database errors', async () => {
            const dbError = new Error('Database connection failed')
            mockPool.execute.mockRejectedValue(dbError)

            await expect(
                accountKeyRepository.getAccountIdsByKey('test-key')
            ).rejects.toThrow('Database connection failed')
        })

        it('should handle non-array database response', async () => {
            mockPool.execute.mockResolvedValue([null as any, []] as any)

            const result = await accountKeyRepository.getAccountIdsByKey(
                'test-key'
            )

            expect(result).toEqual([])
        })

        it('should handle large number of account IDs', async () => {
            const mockRows = Array.from({ length: 100 }, (_, i) => ({
                account_id: i + 1,
            })) as RowDataPacket[]
            mockPool.execute.mockResolvedValue([mockRows, []] as any)

            const result = await accountKeyRepository.getAccountIdsByKey(
                'multi-account-key'
            )

            expect(result).toHaveLength(100)
            expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
        })
    })

    describe('hashKey', () => {
        it('should produce consistent hashes for same input', async () => {
            const apiKey = 'test-key-123'
            const mockRows1 = [{ account_id: 1 }] as RowDataPacket[]
            const mockRows2 = [{ account_id: 1 }] as RowDataPacket[]

            mockPool.execute.mockResolvedValueOnce([mockRows1, []] as any)
            mockPool.execute.mockResolvedValueOnce([mockRows2, []] as any)

            await accountKeyRepository.getAccountIdsByKey(apiKey)
            const firstCallHash = mockPool.execute.mock.calls[0][1][0]

            await accountKeyRepository.getAccountIdsByKey(apiKey)
            const secondCallHash = mockPool.execute.mock.calls[1][1][0]

            expect(firstCallHash).toBe(secondCallHash)
        })

        it('should produce different hashes for different inputs', async () => {
            const mockRows = [{ account_id: 1 }] as RowDataPacket[]
            mockPool.execute.mockResolvedValue([mockRows, []] as any)

            await accountKeyRepository.getAccountIdsByKey('key1')
            const hash1 = mockPool.execute.mock.calls[0][1][0]

            await accountKeyRepository.getAccountIdsByKey('key2')
            const hash2 = mockPool.execute.mock.calls[1][1][0]

            expect(hash1).not.toBe(hash2)
        })
    })
})

import { UserRepository, User } from './UserRepository'
import { Pool, RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise'

jest.mock('mysql2/promise')

describe('UserRepository', () => {
    let userRepo: UserRepository
    let mockPool: jest.Mocked<Pool>

    beforeEach(() => {
        mockPool = {
            execute: jest.fn()
        } as any

        userRepo = new UserRepository(mockPool)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('getUserByEmail', () => {
        it('should return user when found', async () => {
            const mockUser = {
                id: 1,
                email: 'john@example.com',
                name: 'John Doe',
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            }

            const mockRows: RowDataPacket[] = [mockUser as RowDataPacket]
            const mockFields: FieldPacket[] = []
            mockPool.execute.mockResolvedValue([mockRows, mockFields])

            const result = await userRepo.getUserByEmail('john@example.com')

            expect(result).toEqual(mockUser)
            expect(mockPool.execute).toHaveBeenCalledWith(
                'SELECT id, email, name, created_at, updated_at FROM users WHERE email = ?',
                ['john@example.com']
            )
        })

        it('should return null when user not found', async () => {
            const mockRows: RowDataPacket[] = []
            const mockFields: FieldPacket[] = []
            mockPool.execute.mockResolvedValue([mockRows, mockFields])

            const result = await userRepo.getUserByEmail('notfound@example.com')

            expect(result).toBeNull()
        })

        it('should normalize email to lowercase', async () => {
            const mockRows: RowDataPacket[] = []
            const mockFields: FieldPacket[] = []
            mockPool.execute.mockResolvedValue([mockRows, mockFields])

            await userRepo.getUserByEmail('JOHN@EXAMPLE.COM')

            expect(mockPool.execute).toHaveBeenCalledWith(
                'SELECT id, email, name, created_at, updated_at FROM users WHERE email = ?',
                ['john@example.com']
            )
        })
    })

    describe('createUser', () => {
        it('should create user successfully', async () => {
            const mockResult = {
                insertId: 1,
                affectedRows: 1,
                changedRows: 1,
                fieldCount: 0,
                info: '',
                serverStatus: 0,
                warningStatus: 0,
                constructor: { name: 'ResultSetHeader' }
            } as ResultSetHeader

            const mockUser = {
                id: 1,
                email: 'john@example.com',
                name: 'John Doe',
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            }

            const mockFields: FieldPacket[] = []
            
            mockPool.execute
                .mockResolvedValueOnce([mockResult, mockFields]) // INSERT
                .mockResolvedValueOnce([[mockUser as RowDataPacket], mockFields]) // SELECT

            const result = await userRepo.createUser('John Doe', 'john@example.com')

            expect(result).toEqual(mockUser)
            expect(mockPool.execute).toHaveBeenCalledWith(
                'INSERT INTO users (name, email) VALUES (?, ?)',
                ['John Doe', 'john@example.com']
            )
        })

        it('should normalize email to lowercase and trim name', async () => {
            const mockResult = {
                insertId: 1,
                affectedRows: 1,
                changedRows: 1,
                fieldCount: 0,
                info: '',
                serverStatus: 0,
                warningStatus: 0,
                constructor: { name: 'ResultSetHeader' }
            } as ResultSetHeader

            const mockUser = {
                id: 1,
                email: 'john@example.com',
                name: 'John Doe',
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            }

            const mockFields: FieldPacket[] = []

            mockPool.execute
                .mockResolvedValueOnce([mockResult, mockFields])
                .mockResolvedValueOnce([[mockUser as RowDataPacket], mockFields])

            await userRepo.createUser('  John Doe  ', 'JOHN@EXAMPLE.COM')

            expect(mockPool.execute).toHaveBeenCalledWith(
                'INSERT INTO users (name, email) VALUES (?, ?)',
                ['John Doe', 'john@example.com']
            )
        })

        it('should throw error when insertId is not available', async () => {
            const mockResult = {
                insertId: 0,
                affectedRows: 1,
                changedRows: 1,
                fieldCount: 0,
                info: '',
                serverStatus: 0,
                warningStatus: 0,
                constructor: { name: 'ResultSetHeader' }
            } as ResultSetHeader

            const mockFields: FieldPacket[] = []
            mockPool.execute.mockResolvedValue([mockResult, mockFields])

            await expect(userRepo.createUser('John Doe', 'john@example.com'))
                .rejects.toThrow('Failed to create user')
        })

        it('should throw error when created user cannot be retrieved', async () => {
            const mockResult = {
                insertId: 1,
                affectedRows: 1,
                changedRows: 1,
                fieldCount: 0,
                info: '',
                serverStatus: 0,
                warningStatus: 0,
                constructor: { name: 'ResultSetHeader' }
            } as ResultSetHeader

            const mockFields: FieldPacket[] = []

            mockPool.execute
                .mockResolvedValueOnce([mockResult, mockFields])
                .mockResolvedValueOnce([[], mockFields])

            await expect(userRepo.createUser('John Doe', 'john@example.com'))
                .rejects.toThrow('Failed to retrieve created user')
        })
    })
})
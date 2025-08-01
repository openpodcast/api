import { RegistrationApi, RegisterRequest } from './RegistrationApi'
import { UserRepository, User } from '../db/UserRepository'
import { AccountKeyRepository } from '../db/AccountKeyRepository'

jest.mock('../db/UserRepository')
jest.mock('../db/AccountKeyRepository')

const MockedUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>
const MockedAccountKeyRepository = AccountKeyRepository as jest.MockedClass<typeof AccountKeyRepository>

describe('RegistrationApi', () => {
    let registrationApi: RegistrationApi
    let mockUserRepo: jest.Mocked<UserRepository>
    let mockAccountKeyRepo: jest.Mocked<AccountKeyRepository>

    beforeEach(() => {
        mockUserRepo = new MockedUserRepository({} as any) as jest.Mocked<UserRepository>
        mockAccountKeyRepo = new MockedAccountKeyRepository({} as any) as jest.Mocked<AccountKeyRepository>
        registrationApi = new RegistrationApi(mockUserRepo, mockAccountKeyRepo)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('register', () => {
        const validRequest: RegisterRequest = {
            name: 'John Doe',
            email: 'john@example.com'
        }

        it('should register a new user successfully', async () => {
            const mockUser: User = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            }

            mockUserRepo.getUserByEmail.mockResolvedValue(null)
            mockUserRepo.createUser.mockResolvedValue(mockUser)
            mockAccountKeyRepo.generateApiKey.mockResolvedValue('op_1234567890abcdef1234567890abcdef')

            const result = await registrationApi.register(validRequest)

            expect(result.statusCode).toBe(201)
            expect(result.response.success).toBe(true)
            expect(result.response.data).toEqual({
                userId: 1,
                apiKey: 'op_1234567890abcdef1234567890abcdef',
                email: 'john@example.com',
                name: 'John Doe'
            })

            expect(mockUserRepo.getUserByEmail).toHaveBeenCalledWith('john@example.com')
            expect(mockUserRepo.createUser).toHaveBeenCalledWith('John Doe', 'john@example.com')
            expect(mockAccountKeyRepo.generateApiKey).toHaveBeenCalledWith(1)
        })

        it('should return existing user data when email already exists', async () => {
            const existingUser: User = {
                id: 2,
                name: 'Jane Doe',
                email: 'john@example.com',
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            }

            mockUserRepo.getUserByEmail.mockResolvedValue(existingUser)
            mockAccountKeyRepo.getApiKeyHashByAccountId.mockResolvedValue('hash123')
            mockAccountKeyRepo.generateApiKey.mockResolvedValue('op_existingkey1234567890abcdef123456')

            const result = await registrationApi.register(validRequest)

            expect(result.statusCode).toBe(409)
            expect(result.response.success).toBe(false)
            expect(result.response.error).toBe('Email already registered')
            expect(result.response.data).toEqual({
                userId: 2,
                apiKey: 'op_existingkey1234567890abcdef123456',
                email: 'john@example.com',
                name: 'Jane Doe'
            })

            expect(mockUserRepo.createUser).not.toHaveBeenCalled()
        })

        it('should return validation error for missing name', async () => {
            const invalidRequest = {
                name: '',
                email: 'john@example.com'
            }

            const result = await registrationApi.register(invalidRequest)

            expect(result.statusCode).toBe(400)
            expect(result.response.success).toBe(false)
            expect(result.response.error).toBe('Validation failed')
            expect(result.response.details).toContain('Name is required')
        })

        it('should return validation error for missing email', async () => {
            const invalidRequest = {
                name: 'John Doe',
                email: ''
            }

            const result = await registrationApi.register(invalidRequest)

            expect(result.statusCode).toBe(400)
            expect(result.response.success).toBe(false)
            expect(result.response.error).toBe('Validation failed')
            expect(result.response.details).toContain('Email is required')
        })

        it('should return validation error for invalid email format', async () => {
            const invalidRequest = {
                name: 'John Doe',
                email: 'invalid-email'
            }

            const result = await registrationApi.register(invalidRequest)

            expect(result.statusCode).toBe(400)
            expect(result.response.success).toBe(false)
            expect(result.response.error).toBe('Validation failed')
            expect(result.response.details).toContain('Email must be valid')
        })

        it('should return validation error for name too short', async () => {
            const invalidRequest = {
                name: 'A',
                email: 'john@example.com'
            }

            const result = await registrationApi.register(invalidRequest)

            expect(result.statusCode).toBe(400)
            expect(result.response.success).toBe(false)
            expect(result.response.error).toBe('Validation failed')
            expect(result.response.details).toContain('Name must be between 2 and 100 characters')
        })

        it('should return validation error for name too long', async () => {
            const invalidRequest = {
                name: 'A'.repeat(101),
                email: 'john@example.com'
            }

            const result = await registrationApi.register(invalidRequest)

            expect(result.statusCode).toBe(400)
            expect(result.response.success).toBe(false)
            expect(result.response.error).toBe('Validation failed')
            expect(result.response.details).toContain('Name must be between 2 and 100 characters')
        })

        it('should normalize email to lowercase', async () => {
            const requestWithUppercaseEmail = {
                name: 'John Doe',
                email: 'JOHN@EXAMPLE.COM'
            }

            const mockUser: User = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            }

            mockUserRepo.getUserByEmail.mockResolvedValue(null)
            mockUserRepo.createUser.mockResolvedValue(mockUser)
            mockAccountKeyRepo.generateApiKey.mockResolvedValue('op_1234567890abcdef1234567890abcdef')

            await registrationApi.register(requestWithUppercaseEmail)

            expect(mockUserRepo.getUserByEmail).toHaveBeenCalledWith('john@example.com')
            expect(mockUserRepo.createUser).toHaveBeenCalledWith('John Doe', 'john@example.com')
        })

        it('should trim whitespace from name', async () => {
            const requestWithWhitespace = {
                name: '  John Doe  ',
                email: 'john@example.com'
            }

            const mockUser: User = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            }

            mockUserRepo.getUserByEmail.mockResolvedValue(null)
            mockUserRepo.createUser.mockResolvedValue(mockUser)
            mockAccountKeyRepo.generateApiKey.mockResolvedValue('op_1234567890abcdef1234567890abcdef')

            await registrationApi.register(requestWithWhitespace)

            expect(mockUserRepo.createUser).toHaveBeenCalledWith('John Doe', 'john@example.com')
        })

        it('should handle database errors gracefully', async () => {
            mockUserRepo.getUserByEmail.mockRejectedValue(new Error('Database error'))

            const result = await registrationApi.register(validRequest)

            expect(result.statusCode).toBe(500)
            expect(result.response.success).toBe(false)
            expect(result.response.error).toBe('Internal server error')
        })
    })
})
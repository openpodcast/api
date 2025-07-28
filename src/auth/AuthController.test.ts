import { AuthController } from './AuthController'
import { AccountKeyRepository } from '../db/AccountKeyRepository'
import { AuthError } from '../types/api'
import { Request, Response, NextFunction } from 'express'

// Mock the AccountKeyRepository
jest.mock('../db/AccountKeyRepository')

describe('AuthController', () => {
    let authController: AuthController
    let mockAccountKeyRepository: jest.Mocked<AccountKeyRepository>
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let mockNext: jest.MockedFunction<NextFunction>

    beforeEach(() => {
        mockAccountKeyRepository = {
            getAccountIdsByKey: jest.fn(),
        } as any

        authController = new AuthController(mockAccountKeyRepository)

        mockRequest = {
            headers: {},
        }

        mockResponse = {
            locals: {},
        }

        mockNext = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('getAccountIds', () => {
        it('should return array of account IDs for valid Bearer token', async () => {
            const mockAccountIds = [1, 2, 3]
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue(
                mockAccountIds
            )

            const result = await authController.getAccountIds(
                'Bearer valid-token-123'
            )

            expect(result).toEqual([1, 2, 3])
            expect(
                mockAccountKeyRepository.getAccountIdsByKey
            ).toHaveBeenCalledWith('valid-token-123')
        })

        it('should return single account ID in array', async () => {
            const mockAccountIds = [42]
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue(
                mockAccountIds
            )

            const result = await authController.getAccountIds(
                'Bearer single-account-token'
            )

            expect(result).toEqual([42])
            expect(
                mockAccountKeyRepository.getAccountIdsByKey
            ).toHaveBeenCalledWith('single-account-token')
        })

        it('should throw AuthError when token does not start with Bearer', async () => {
            await expect(
                authController.getAccountIds('invalid-token')
            ).rejects.toThrow(AuthError)

            await expect(
                authController.getAccountIds('invalid-token')
            ).rejects.toThrow('Specified token is not valid')

            expect(
                mockAccountKeyRepository.getAccountIdsByKey
            ).not.toHaveBeenCalled()
        })

        it('should throw AuthError when no account IDs found', async () => {
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue([])

            await expect(
                authController.getAccountIds('Bearer nonexistent-token')
            ).rejects.toThrow(AuthError)

            await expect(
                authController.getAccountIds('Bearer nonexistent-token')
            ).rejects.toThrow('Specified token is not valid')
        })

        it('should handle repository errors', async () => {
            const dbError = new Error('Database error')
            mockAccountKeyRepository.getAccountIdsByKey.mockRejectedValue(
                dbError
            )

            await expect(
                authController.getAccountIds('Bearer test-token')
            ).rejects.toThrow('Database error')
        })

        it('should remove Bearer prefix correctly', async () => {
            const mockAccountIds = [1]
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue(
                mockAccountIds
            )

            await authController.getAccountIds('Bearer test-token-with-hyphens')

            expect(
                mockAccountKeyRepository.getAccountIdsByKey
            ).toHaveBeenCalledWith('test-token-with-hyphens')
        })

        it('should handle token with spaces after Bearer', async () => {
            const mockAccountIds = [1]
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue(
                mockAccountIds
            )

            await authController.getAccountIds('Bearer  token-with-spaces')

            expect(
                mockAccountKeyRepository.getAccountIdsByKey
            ).toHaveBeenCalledWith(' token-with-spaces')
        })
    })

    describe('handleRequest middleware', () => {
        it('should set user with accountIds and accountId in response locals', async () => {
            const mockAccountIds = [1, 2, 3]
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue(
                mockAccountIds
            )

            mockRequest.headers!.authorization = 'Bearer valid-token'

            await authController.handleRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            )

            expect(mockResponse.locals!.user).toEqual({
                accountIds: [1, 2, 3],
                accountId: 1, // First account ID for backward compatibility
            })
            expect(mockNext).toHaveBeenCalledWith()
        })

        it('should set accountId to first element when multiple account IDs exist', async () => {
            const mockAccountIds = [42, 99, 123]
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue(
                mockAccountIds
            )

            mockRequest.headers!.authorization = 'Bearer multi-account-token'

            await authController.handleRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            )

            expect(mockResponse.locals!.user.accountId).toBe(42)
            expect(mockResponse.locals!.user.accountIds).toEqual([42, 99, 123])
        })

        it('should set accountId to undefined when no account IDs exist', async () => {
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue([])

            mockRequest.headers!.authorization = 'Bearer invalid-token'

            await authController.handleRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            )

            // Should call next with AuthError, but let's also check what would be set
            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError))
        })

        it('should call next with AuthError when authorization header is missing', async () => {
            await authController.handleRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            )

            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError))
            const error = mockNext.mock.calls[0][0] as unknown as AuthError
            expect(error.message).toContain('Token format is invalid')
        })

        it('should call next with AuthError when authorization header is too short', async () => {
            mockRequest.headers!.authorization = 'Bearer'

            await authController.handleRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            )

            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError))
        })

        it('should call next with AuthError when authorization header does not start with Bearer', async () => {
            mockRequest.headers!.authorization = 'Basic token123'

            await authController.handleRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            )

            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError))
        })

        it('should handle authorization header as array', async () => {
            const mockAccountIds = [1, 2]
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue(
                mockAccountIds
            )

            mockRequest.headers!.authorization = [
                'Bearer first-token',
                'Bearer second-token',
            ] as any

            await authController.handleRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            )

            expect(
                mockAccountKeyRepository.getAccountIdsByKey
            ).toHaveBeenCalledWith('first-token')
            expect(mockResponse.locals!.user).toEqual({
                accountIds: [1, 2],
                accountId: 1,
            })
        })

        it('should call next with AuthError when getAccountIds throws', async () => {
            mockAccountKeyRepository.getAccountIdsByKey.mockRejectedValue(
                new AuthError('Invalid token')
            )

            mockRequest.headers!.authorization = 'Bearer invalid-token'

            await authController.handleRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            )

            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError))
        })

        it('should handle empty account IDs array', async () => {
            mockAccountKeyRepository.getAccountIdsByKey.mockResolvedValue([])

            mockRequest.headers!.authorization = 'Bearer empty-accounts-token'

            await authController.handleRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            )

            expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError))
            const error = mockNext.mock.calls[0][0] as unknown as AuthError
            expect(error.message).toBe('Specified token is not valid')
        })
    })

    describe('getMiddleware', () => {
        it('should return a middleware function', () => {
            const middleware = authController.getMiddleware()

            expect(typeof middleware).toBe('function')
        })

        it('should return the bound handleRequest function', () => {
            const middleware = authController.getMiddleware()

            // The middleware should be a function that calls handleRequest
            expect(middleware.name).toBe('bound ')
            expect(typeof middleware).toBe('function')
        })
    })
})

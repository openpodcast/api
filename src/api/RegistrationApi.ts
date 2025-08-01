import { UserRepository } from '../db/UserRepository'
import { AccountKeyRepository } from '../db/AccountKeyRepository'

export interface RegisterRequest {
    name: string
    email: string
}

export interface RegisterResponse {
    success: boolean
    data?: {
        userId: number
        apiKey: string
        email: string
        name: string
    }
    error?: string
    details?: string[]
}

export class RegistrationApi {
    private userRepo: UserRepository
    private accountKeyRepo: AccountKeyRepository

    constructor(
        userRepo: UserRepository,
        accountKeyRepo: AccountKeyRepository
    ) {
        this.userRepo = userRepo
        this.accountKeyRepo = accountKeyRepo
    }

    async register(
        data: RegisterRequest
    ): Promise<{ response: RegisterResponse; statusCode: number }> {
        const validation = this.validateInput(data)
        if (!validation.isValid) {
            return {
                response: {
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors,
                },
                statusCode: 400,
            }
        }

        const { name, email } = data
        const normalizedEmail = email.toLowerCase().trim()
        const trimmedName = name.trim()

        try {
            const existingUser = await this.userRepo.getUserByEmail(
                normalizedEmail
            )

            if (existingUser) {
                let apiKey = await this.getExistingApiKey(existingUser.id)
                if (!apiKey) {
                    apiKey = await this.accountKeyRepo.generateApiKey(
                        existingUser.id
                    )
                }

                return {
                    response: {
                        success: false,
                        error: 'Email already registered',
                        data: {
                            userId: existingUser.id,
                            apiKey,
                            email: existingUser.email,
                            name: existingUser.name,
                        },
                    },
                    statusCode: 409,
                }
            }

            const newUser = await this.userRepo.createUser(
                trimmedName,
                normalizedEmail
            )
            const apiKey = await this.accountKeyRepo.generateApiKey(newUser.id)

            return {
                response: {
                    success: true,
                    data: {
                        userId: newUser.id,
                        apiKey,
                        email: newUser.email,
                        name: newUser.name,
                    },
                },
                statusCode: 201,
            }
        } catch (error) {
            console.error('Registration error:', error)
            return {
                response: {
                    success: false,
                    error: 'Internal server error',
                },
                statusCode: 500,
            }
        }
    }

    private validateInput(data: RegisterRequest): {
        isValid: boolean
        errors: string[]
    } {
        const errors: string[] = []

        if (
            !data.name ||
            typeof data.name !== 'string' ||
            data.name.trim().length === 0
        ) {
            errors.push('Name is required')
        } else if (
            data.name.trim().length < 2 ||
            data.name.trim().length > 100
        ) {
            errors.push('Name must be between 2 and 100 characters')
        }

        if (
            !data.email ||
            typeof data.email !== 'string' ||
            data.email.trim().length === 0
        ) {
            errors.push('Email is required')
        } else if (!this.isValidEmail(data.email.trim())) {
            errors.push('Email must be valid')
        }

        return {
            isValid: errors.length === 0,
            errors,
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    private async getExistingApiKey(userId: number): Promise<string | null> {
        const keyHash = await this.accountKeyRepo.getApiKeyHashByAccountId(
            userId
        )
        if (!keyHash) {
            return null
        }

        return this.generateNewApiKeyForExistingUser(userId)
    }

    private async generateNewApiKeyForExistingUser(
        userId: number
    ): Promise<string> {
        return await this.accountKeyRepo.generateApiKey(userId)
    }
}

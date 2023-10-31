import { AuthError } from '../types/api'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { AccountKeyRepository } from '../db/AccountKeyRepository'

class AuthController {
    private accountKeyRepository: AccountKeyRepository

    constructor(accountsKeyRepository: AccountKeyRepository) {
        this.accountKeyRepository = accountsKeyRepository
    }

    async getAccountId(authToken: string): Promise<number> {
        if (authToken.startsWith('Bearer ') === false) {
            throw new AuthError('Specified token is not valid')
        }

        // remove 'Bearer ' from token to get the actual token
        const token = authToken.substring(7)

        if (this.accountsMap[token] !== undefined) {
            return this.accountsMap[token]
        } else {
            throw new AuthError(
                `Specified token is not valid (not in accounts map): ${token}.`
            )
        }

        // If the account ID is not found in the database, throw an error
        throw new AuthError('Specified token is not valid')
    }

    getMiddleware = (): RequestHandler => {
        return this.handleRequest.bind(this)
    }

    handleRequest = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> => {
        const authToken: string | undefined = Array.isArray(
            req.headers.authorization
        )
            ? req.headers.authorization[0]
            : req.headers.authorization

        if (
            authToken === undefined ||
            authToken.length < 7 ||
            !authToken.startsWith('Bearer ')
        ) {
            const err = new AuthError(
                `Not authorized: Token format is invalid (token: ${authToken})`
            )
            return next(err)
        }

        try {
            // store the user data in the response object (locals is officially made for this)
            // so we can access this data in the backend when it is stored to the database
            const accountId = await this.getAccountId(authToken)
            res.locals.user = {
                accountId,
            }
        } catch (err) {
            return next(err)
        }

        return next()
    }
}

export { AuthController }

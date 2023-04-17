import { AuthError } from '../types/api'
import { NextFunction, Request, RequestHandler, Response } from 'express'

class AuthController {
    accountsMap: { [key: string]: number }

    constructor(accountsMap: { [key: string]: number }) {
        this.accountsMap = accountsMap
    }

    /**
     * Returns the account id for the specified auth token
     * @param authToken The auth token to get the account id for (incl. 'Bearer ')
     * @returns The account id
     * @throws AuthError if the token is not valid
     * */
    getAccountId = (authToken: string): number => {
        if (authToken.startsWith('Bearer ') === false) {
            throw new AuthError('Specified token is not valid')
        }

        // remove 'Bearer ' from token to get the actual token
        const token = authToken.substring(7)

        if (this.accountsMap[token] !== undefined) {
            return this.accountsMap[token]
        } else {
            throw new AuthError('Specified token is not valid')
        }
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
            const err = new AuthError('Not authorized: Token format is invalid')
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
            return next(
                new AuthError('Not authorized: Specified token is not valid')
            )
        }

        return next()
    }
}

export { AuthController }

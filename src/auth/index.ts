import { AuthError } from '../types/api'
import { Request, Response } from 'express'

const getAccountId = function (authToken: String): Number {
    // dirty hack to integrate new podcast engineering kiosk
    // should be kind of a database later
    if (authToken === 'Bearer engkiosk-81ztQL36e') {
        return 2
    }
    return 1
}

const authMiddleware = function (
    req: Request,
    res: Response,
    next: Function
): any {
    const authToken: String | undefined = Array.isArray(
        req.headers.authorization
    )
        ? req.headers.authorization[0]
        : req.headers.authorization

    // TODO: for now just check if there is a Bearer consisting of a few chars
    if (
        authToken === undefined ||
        authToken.length < 7 ||
        !authToken.startsWith('Bearer ')
    ) {
        const err = new AuthError('Not authorized')
        return next(err)
    }

    // store the user data in the response object (locals is officialy made for this)
    // so we can access this data in the backend when it is stored to the database
    res.locals.user = {
        accountId: getAccountId(authToken),
    }

    return next()
}

export { authMiddleware }

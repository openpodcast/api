import { AuthError } from '../types/auth'
import { Request, Response } from 'express'

const getAccountId = function (authToken: String): Number {
  return 1
}

const authMiddleware = function (req: Request, res: Response, next: Function): any {
  const authToken: String = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization

  if (!authToken || authToken.length < 7 || !authToken.startsWith('Bearer ')) {
    const err = new AuthError('Not authorized')
    err.status = 401
    return next(err)
  }

  res.locals.user = {
    accountId: getAccountId(authToken)
  }

  return next()
}

export { authMiddleware }

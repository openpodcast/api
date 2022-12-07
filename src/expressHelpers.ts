import { RequestHandler } from 'express'

// function to exclude paths from middleware
const unless = function (
    path: string,
    middleware: RequestHandler
): RequestHandler {
    return function (req, res, next) {
        if (path === req.path) {
            return next()
        } else {
            return middleware(req, res, next)
        }
    }
}

export { unless }

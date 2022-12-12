import { RequestHandler } from 'express'

// function to exclude paths from middleware
// paths can also defined using regex
const unless = function (
    excludePaths: string[],
    middleware: RequestHandler
): RequestHandler {
    return function (req, res, next) {
        if (excludePaths.some((path) => new RegExp(path).test(req.path))) {
            return next()
        } else {
            return middleware(req, res, next)
        }
    }
}

export { unless }

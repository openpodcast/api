// TODO: we need a proper solution for API parsing, maybe https://github.com/sinclairzx81/typebox
export interface JsonPayload {
    meta?: {
        endpoint?: string
    }
    data?: Object
    provider?: string
}

export type Event = JsonPayload

export class HttpError extends Error {
    status = 0
}
export class PayloadError extends HttpError {
    status = 400 // invalid request
}

export class AuthError extends HttpError {
    status = 401 // not authorized
}

export interface StatusPayload {
    endpoint: string
    data: Object
}

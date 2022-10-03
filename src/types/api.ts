// TODO: we need a proper solution for API parsing, maybe https://github.com/sinclairzx81/typebox
export interface JsonPayload {
  meta?: {
    endpoint?: string
  }
  data?: Object
  provider?: string
}

export interface Event extends JsonPayload {}

export class HttpError extends Error {
  status: number = 0
}
export class PayloadError extends HttpError {
  status = 400 // invalid request
}

export class AuthError extends HttpError {
  status = 401 // not authorized
}

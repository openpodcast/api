export interface JsonPayload {}

export interface Event extends JsonPayload {}

export class PayloadError extends Error {
  constructor (...args: any[]) {
    super(args)
    this.status = 400
  }
}

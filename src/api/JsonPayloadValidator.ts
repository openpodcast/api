import { ErrorObject } from 'ajv'
import { validateJson } from '../schema/SchemaValidator'
import { PayloadError } from '../types/api'

const getJsonValidationErrorSummary = function (err: any) {
    if (Array.isArray(err)) {
        return err.map((e) => e.message).join(' <> ')
    }
    return err.message
}

const validateJsonApiPayload = function (schema: any, json: any) {
    try {
        validateJson(schema, json)
    } catch (err) {
        throw new PayloadError(getJsonValidationErrorSummary(err))
    }
}

export { validateJsonApiPayload }

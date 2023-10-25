import { validateJson } from '../schema/SchemaValidator'
import { PayloadError } from '../types/api'

const validateJsonApiPayload = function (schema: any, json: any) {
    try {
        validateJson(schema, json)
    } catch (err) {
        throw new PayloadError((err as Error).message)
    }
}

export { validateJsonApiPayload }

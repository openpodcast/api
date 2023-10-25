import Ajv, { ErrorObject } from 'ajv/dist/2020' //support the new 2020 draft
import addFormats from 'ajv-formats'

const ajv = new Ajv({
    allErrors: true,
    // The prefixItems section of your schema defines a union type (either
    // "number" or "string"). This is required for some Anchor payloads.
    allowUnionTypes: true,
})
addFormats(ajv)

const validateJson = function (schema: any, json: any) {
    const valid = ajv.validate(schema, json)
    if (!valid) {
        throw new Error(ajv.errorsText(ajv.errors))
    }
}

export { validateJson }

import Ajv from 'ajv/dist/2020' //support the new 2020 draft
import addFormats from 'ajv-formats'

const ajv = new Ajv()
addFormats(ajv)

const validateJson = function (schema: any, json: any) {
    const valid = ajv.validate(schema, json)
    if (!valid) {
        throw ajv.errors
    }
}

export { validateJson }

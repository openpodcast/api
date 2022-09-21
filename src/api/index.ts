import { ForwarderPayload, AuthError } from './types'

const getAccountFromAuthToken = function(token: String | undefined): Number | never {
  if (!token || token.length > 3) {
    throw new AuthError('Auth token not valid')
  }
  return 1
}

const getCleanedPayload = function(payload: ForwarderPayload): ForwarderPayload | never {
  return payload
}

const handleApiPost = function(auth: String | undefined, payload: ForwarderPayload) {
  const accountId = getAccountFromAuthToken(auth)
  const cleanedPayload = getCleanedPayload(payload)
}

export { handleApiPost }
import { requestJson } from '../../utils/api'

export function login(email, password) {
  return requestJson('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

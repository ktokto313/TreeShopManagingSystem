import { requestJson } from '../../../utils/api'

export async function getProfile() {
    return requestJson('/api/profile')
}

export async function updateProfile({ fullName, phone, status }) {
    return requestJson('/api/profile', {
        method: 'PUT',
        body: { fullName, phone, status }
    })
}
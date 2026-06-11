//06/09: Dao Hung: Add function changePassword
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

export async function changePassword(oldPassword, newPassword) {
    try {
        return await requestJson('/api/profile/change-password', {
            method: 'POST',
            body: { oldPassword, newPassword }
        })
    } catch (error) {
        if (error.status === 401) {
            throw new Error('Unauthorized', {cause: error});
        }
        if (error.status === 403) {
            throw new Error('Google account cannot change password', {cause: error});
        }
        if (error.status === 400) {
            throw new Error('Wrong old password or invalid input', {cause: error});
        }
        throw error
    }
}
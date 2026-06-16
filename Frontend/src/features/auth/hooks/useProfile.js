//6/8: Dao Hung: Separate the hook from the UI file
import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../api/profileApi'
import { useAuth } from '../../../hooks/useAuth'

export function useProfile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ fullName: '', phone: '' })
    const [submitting, setSubmitting] = useState(false)
    const { updateUser } = useAuth()

    useEffect(() => {
        getProfile()
            .then((data) => {
                setProfile(data)
                setFormData({ fullName: data.fullName, phone: data.phone ?? '' })
            })
            .catch(() => setProfile(null))
            .finally(() => setLoading(false))
    }, [])

    const handleInputChange = (e, field) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

    const handleCancel = () => {
        setIsEditing(false)
        if (profile) {
            setFormData({ fullName: profile.fullName, phone: profile.phone ?? '' })
        }
    }

    const handleSave = async () => {
        if (!formData.fullName.trim()) {
            alert('Họ tên không được để trống!')
            return
        }

        setSubmitting(true)
        try {
            const updated = await updateProfile({
                fullName: formData.fullName,
                phone: formData.phone,
                status: profile.status,
            })

            setProfile(updated)
            updateUser({ fullName: updated.fullName, phone: updated.phone })
            setIsEditing(false)
            alert('Cập nhật thông tin cá nhân thành công!')
        } catch (err) {
            console.error(err)
            alert('Có lỗi xảy ra khi cập nhật thông tin!')
        } finally {
            setSubmitting(false)
        }
    }

    return {
        profile,
        loading,
        isEditing,
        formData,
        submitting,
        setIsEditing,
        handleInputChange,
        handleCancel,
        handleSave,
    }
}

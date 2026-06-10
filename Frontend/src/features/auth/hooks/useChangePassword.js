import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function useChangePassword() {
    const navigate = useNavigate()

    const [values, setValues] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
    const [show, setShow] = useState({ old: false, new: false, confirm: false })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    function handleChange(field) {
        return (e) => {
            setValues(v => ({ ...v, [field]: e.target.value }))
            if (errors[field]) setErrors(err => ({ ...err, [field]: '' }))
        }
    }

    function toggleShow(field) {
        setShow(v => ({ ...v, [field]: !v[field] }))
    }

    function validate() {
        const next = {}
        if (!values.oldPassword) next.oldPassword = 'Vui lòng nhập mật khẩu hiện tại'
        if (!values.newPassword) next.newPassword = 'Vui lòng nhập mật khẩu mới'
        else if (values.newPassword.length < 6) next.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
        else if (values.newPassword === values.oldPassword) next.newPassword = 'Mật khẩu mới không được trùng mật khẩu cũ'
        if (!values.confirmPassword) next.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
        else if (values.confirmPassword !== values.newPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp'
        return next
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const next = validate()
        if (Object.keys(next).length) { setErrors(next); return }

        setSubmitting(true)
        try {
            const res = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ oldPassword: values.oldPassword, newPassword: values.newPassword }),
            })

            if (res.status === 400) {
                setErrors({ oldPassword: 'Mật khẩu hiện tại không đúng' })
                setSubmitting(false)
                return
            }
            if (!res.ok) {
                setErrors({ form: 'Đã xảy ra lỗi, vui lòng thử lại' })
                setSubmitting(false)
                return
            }

            setSuccess(true)
            setTimeout(() => navigate('/profile'), 2000)
        } catch {
            setErrors({ form: 'Đã xảy ra lỗi, vui lòng thử lại' })
            setSubmitting(false)
        }
    }

    return {
        values,
        show,
        errors,
        submitting,
        success,
        handleChange,
        toggleShow,
        handleSubmit
    }
}
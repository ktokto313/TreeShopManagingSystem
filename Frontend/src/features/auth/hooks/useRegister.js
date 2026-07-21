//6/8: Dao Hung: Separate the hook from the UI file
import { useContext, useState } from 'react'
import { sendOtp, verifyOtp } from '../api/authApi'
import { AuthContext } from '../../../context/AuthContext'

export function useRegister() {
    const { register } = useContext(AuthContext)

    const [values, setValues] = useState({
        fullName: '',
        email: '',
        password: '',
    })

    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function handleChange(e) {
        const { name, value, type, checked } = e.target
        setValues((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    function setOtpSafe(value) {
        const clean = value.replace(/\D/g, '').slice(0, 6)
        setOtp(clean)
    }

    async function handleSendOtp(e) {
        e.preventDefault()
        if (loading) return

        if (!values.email) {
            setError('Yêu cầu email.')
            return
        }

        setLoading(true)
        setError('')

        try {
            await sendOtp(values.email)
            setOtpSent(true)
        } catch (err) {
            setError(err.message || 'Gửi OTP thất bại.')
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyOtp() {
        if (loading) return

        if (otp.length !== 6) {
            setError('OTP phải có 6 ký tự.')
            return false
        }

        setLoading(true)
        setError('')

        try {
            await verifyOtp(values.email, otp)
            await register(values.fullName, values.email, values.password)
            return true
        } catch (err) {
            setError(err.message || 'Đăng ký thất bại.')
            return false
        } finally {
            setLoading(false)
        }
    }

    function resetOtp() {
        setOtpSent(false)
        setOtp('')
        setError('')
        setLoading(false)
    }

    return {
        values,
        otp,
        otpSent,
        loading,
        error,
        handleChange,
        handleSendOtp,
        handleVerifyOtp,
        setOtp: setOtpSafe,
        resetOtp,
    }
}

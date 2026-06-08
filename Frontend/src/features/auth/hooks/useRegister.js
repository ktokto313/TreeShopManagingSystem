import { useState } from 'react'
import { sendOtp, verifyOtp } from '../api/authApi'
import { useAuth } from '../../../context/AuthContext'

export function useRegister() {
    const { register } = useAuth()

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
            setError('Email is required')
            return
        }

        setLoading(true)
        setError('')

        try {
            await sendOtp(values.email)
            setOtpSent(true)
        } catch (err) {
            setError(err.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyOtp() {
        if (loading) return

        if (otp.length !== 6) {
            setError('OTP must be 6 digits')
            return false
        }

        setLoading(true)
        setError('')

        try {
            await verifyOtp(values.email, otp)
            await register(values.fullName, values.email, values.password)
            return true
        } catch (err) {
            setError(err.message || 'Registration failed')
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
import { useState, useEffect } from 'react'
import {
    sendResetOtp,
    verifyResetOtp,
    resetPassword,
} from '../api/authApi'

export function useResetPassword() {
    const [step, setStep] = useState(1)

    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown <= 0) return

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown])

    const handleSendOtp = async () => {
        try {
            setLoading(true)
            setError('')
            await sendResetOtp(email)
            setStep(2)
            setCountdown(60)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // RESEND OTP
    const handleResendOtp = async () => {
        try {
            setLoading(true)
            setError('')
            await sendResetOtp(email)
            setCountdown(60)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // STEP 2
    const handleVerifyOtp = async () => {
        try {
            setLoading(true)
            setError('')
            await verifyResetOtp(email, otp)
            setStep(3)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (navigate) => {
        try {
            setLoading(true)
            setError('')
            await resetPassword(email, newPassword)
            navigate('/login')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        step,
        email,
        otp,
        newPassword,
        loading,
        error,
        countdown,

        setEmail,
        setOtp,
        setNewPassword,

        handleSendOtp,
        handleVerifyOtp,
        handleResetPassword,
        handleResendOtp,
    }
}
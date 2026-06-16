//6/8: Dao Hung: Separate the hook from the UI file
import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext.jsx'

function canAccessManagement(role) {
    return role === 'MANAGER' || role === 'SYSTEM_ADMIN'
}

export function useLogin() {
    const { login, loginWithGoogle } = useAuth()

    const [values, setValues] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [pendingGoogle, setPendingGoogle] = useState(null)

    function handleChange(e) {
        const { name, value } = e.target
        setValues((prev) => ({ ...prev, [name]: value }))
    }

    async function handleLogin(fromPath) {
        if (loading) return

        setLoading(true)
        setError('')

        try {
            const user = await login(values.email, values.password)

            const role = user.roleName ?? user.role
            const targetPath = role === 'SYSTEM_ADMIN'
                ? '/admin/users'
                : canAccessManagement(role)
                    ? fromPath === '/login' ? '/manage' : fromPath
                    : '/catalog'

            return { success: true, redirect: targetPath }
        } catch (err) {
            setError(err.message || 'Invalid email or password')
            return { success: false }
        } finally {
            setLoading(false)
        }
    }

    async function handleGoogleLogin(credential) {
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ credential }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || 'Google login failed')
                return { success: false }
            }

            if (data.newUser) {
                setPendingGoogle({ email: data.email, fullName: data.fullName })
                return { success: false }
            }

            loginWithGoogle({
                email: data.email,
                fullName: data.fullName,
                role: data.role,
            })

            return {
                success: true,
                redirect: data.role === 'SYSTEM_ADMIN' ? '/admin/users' : canAccessManagement(data.role) ? '/manage' : '/catalog',
            }
        } catch {
            setError('Google login failed, please try again')
            return { success: false }
        }
    }

    return {
        values,
        loading,
        error,
        pendingGoogle,
        handleChange,
        handleLogin,
        handleGoogleLogin,
        setPendingGoogle,
    }
}

//6/4: Dao Hung: Frontend for Register screen
//6/7: Dao Hung: Update send OTP for registering user
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [values, setValues] = useState({ fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      })
      if (res.status === 409) {
        setError('Email already registered')
        return
      }
      setOtpSent(true)
    } catch {
      setError('Failed to send OTP, please try again')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, otp }),
      })
      if (!res.ok) {
        setError('Invalid or expired OTP')
        return
      }
      await register(values.fullName, values.email, values.password)
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-[calc(100vh-4rem)] flex">
        {/* Left panel — Register form */}
        <div className="w-[60%] bg-white flex flex-col items-center justify-center px-16 py-12">
          <div className="w-full max-w-md">
            <h1
                className="text-2xl font-bold tracking-wider uppercase mb-8"
                style={{ color: '#2c3e2d', fontFamily: 'Georgia, serif' }}
            >
              Register
            </h1>

            {error && (
                <div className="text-red-600 text-sm mb-6 p-3 bg-red-50 border border-red-200">
                  {error}
                </div>
            )}

            {!otpSent ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-5">
                    <label className="block text-sm text-gray-700 mb-1.5">Full name *</label>
                    <input
                        type="text"
                        name="fullName"
                        required
                        value={values.fullName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm text-gray-700 mb-1.5">Email address *</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={values.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm text-gray-700 mb-1.5">Password *</label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={values.password}
                        onChange={handleChange}
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors"
                    />
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 text-xs font-bold tracking-widest uppercase text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#2c5f2e' }}
                  >
                    {loading ? 'Sending OTP...' : 'Register an account'}
                  </button>
                </form>
            ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-6">
                    An OTP has been sent to <strong>{values.email}</strong>. Please enter it below.
                  </p>

                  <div className="mb-6">
                    <label className="block text-sm text-gray-700 mb-1.5">OTP Code *</label>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length !== 6}
                        className="px-8 py-3 text-xs font-bold tracking-widest uppercase text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#2c5f2e' }}
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <button
                        onClick={() => { setOtpSent(false); setOtp(''); setError('') }}
                        className="px-8 py-3 text-xs font-bold tracking-widest uppercase border border-gray-400 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Right panel — Login CTA */}
        <div className="w-[40%] bg-[#7a9ab0] flex flex-col items-center justify-center p-12 text-white">
          <h2 className="text-xl font-bold tracking-widest uppercase mb-4">Login</h2>
          <p className="mb-8 text-center text-sm text-white/90">
            Already have an account? Log in!
          </p>
          <button
              onClick={() => navigate('/login')}
              className="border border-white text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-[#7a9ab0] transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </div>
  )
}
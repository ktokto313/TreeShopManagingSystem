import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegister } from '../hooks/useRegister'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const {
    values,
    otp,
    otpSent,
    loading,
    error,
    setOtp,
    handleChange,
    handleSendOtp,
    handleVerifyOtp,
    resetOtp,
  } = useRegister()

  function handleSubmit(e) {
    e.preventDefault()
    if (values.password !== confirmPassword) {
      setConfirmError('Passwords do not match')
      return
    }
    setConfirmError('')
    handleSendOtp(e)
  }

  const EyeIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
  )

  const EyeOffIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
  )

  return (
      <div className="min-h-[calc(100vh-4rem)] flex">

        {/* LEFT - FORM */}
        <div className="w-[60%] bg-bg-base flex items-center justify-center px-16 py-12">
          <div className="w-full max-w-md">

            <h1 className="text-2xl font-bold tracking-wider uppercase mb-8 text-black">
              Register
            </h1>

            {error && (
                <div className="text-sm mb-6 p-3 border border-red-400 text-red-700 bg-red-200 rounded">
                  {error}
                </div>
            )}

            {!otpSent ? (
                <form onSubmit={handleSubmit}>

                  <div className="mb-5">
                    <label className="block text-sm mb-1.5 text-black">Full name *</label>
                    <input
                        name="fullName"
                        value={values.fullName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full border border-white-subtle px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm mb-1.5 text-black">Email address *</label>
                    <input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full border border-white-subtle px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm mb-1.5 text-black">Password *</label>
                    <div className="relative">
                      <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full border border-white-subtle px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-500 disabled:opacity-50"
                      />
                      <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          tabIndex={-1}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm mb-1.5 text-black">Confirm password *</label>
                    <div className="relative">
                      <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            if (confirmError) setConfirmError('')
                          }}
                          required
                          disabled={loading}
                          className={`w-full border px-3 py-2.5 pr-10 text-sm focus:outline-none disabled:opacity-50 ${
                              confirmError
                                  ? 'border-red-400 focus:border-red-400'
                                  : 'border-white-subtle focus:border-green-500'
                          }`}
                      />
                      <button
                          type="button"
                          onClick={() => setShowConfirm(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          tabIndex={-1}
                      >
                        {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {confirmError && (
                        <p className="mt-1.5 text-xs text-red-600">{confirmError}</p>
                    )}
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 text-xs font-bold uppercase bg-green-800 text-white hover:bg-green-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    {loading ? 'Sending OTP...' : 'Register'}
                  </button>
                </form>
            ) : (
                <div>
                  <p className="mb-6 text-sm text-black">
                    OTP sent to <strong>{values.email}</strong>
                  </p>

                  <div className="mb-6">
                    <label className="block text-sm mb-1.5 text-black">OTP Code *</label>
                    <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        disabled={loading}
                        className="w-full border border-white-subtle px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={async () => {
                          const success = await handleVerifyOtp()
                          if (success) navigate('/login')
                        }}
                        disabled={loading || otp.length !== 6}
                        className="px-8 py-3 text-xs font-bold uppercase bg-green-800 text-white hover:bg-green-700 disabled:opacity-50 transition cursor-pointer"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <button
                        type="button"
                        onClick={resetOtp}
                        className="px-8 py-3 text-xs font-bold uppercase border border-green-800 text-green-800 hover:bg-green-800 hover:text-white transition cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* RIGHT - CTA */}
        <div className="w-[40%] bg-blue-500 flex flex-col items-center justify-center p-12 text-white">
          <h2 className="text-xl font-bold uppercase mb-4">Login</h2>
          <p className="mb-8 text-center text-sm">
            Already have an account? Log in!
          </p>
          <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 text-xs font-bold uppercase border border-white hover:bg-white hover:text-blue-500 transition cursor-pointer"
          >
            Login
          </button>
        </div>
      </div>
  )
}
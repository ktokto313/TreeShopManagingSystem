//6/8: Dao Hung: Fix this into pure UI files and move to features/auth/pages
import { useNavigate } from 'react-router-dom'
import { useRegister } from '../hooks/useRegister'

export default function RegisterPage() {
  const navigate = useNavigate()

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

  return (
      <div className="min-h-[calc(100vh-4rem)] flex">

        {/* LEFT - FORM */}
        <div className="w-[60%] bg-[var(--color-bg-base)] flex items-center justify-center px-16 py-12">
          <div className="w-full max-w-md">

            <h1 className="text-2xl font-bold tracking-wider uppercase mb-8 text-[var(--color-black)]">
              Register
            </h1>

            {error && (
                <div className="text-sm mb-6 p-3 border border-[var(--color-red-400)] text-[var(--color-red-700)] bg-[var(--color-red-200)] rounded">
                  {error}
                </div>
            )}

            {!otpSent ? (
                <form onSubmit={handleSendOtp}>

                  <div className="mb-5">
                    <label className="block text-sm mb-1.5 text-[var(--color-black)]">
                      Full name *
                    </label>
                    <input
                        name="fullName"
                        value={values.fullName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full border border-[var(--color-white-subtle)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-green-500)] disabled:opacity-50"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm mb-1.5 text-[var(--color-black)]">
                      Email address *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full border border-[var(--color-white-subtle)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-green-500)] disabled:opacity-50"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm mb-1.5 text-[var(--color-black)]">
                      Password *
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full border border-[var(--color-white-subtle)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-green-500)] disabled:opacity-50"
                    />
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 text-xs font-bold uppercase bg-[var(--color-green-800)] text-white hover:bg-[var(--color-green-700)] disabled:opacity-50 transition cursor-pointer"
                  >
                    {loading ? 'Sending OTP...' : 'Register'}
                  </button>
                </form>
            ) : (
                <div>
                  <p className="mb-6 text-sm text-[var(--color-black)]">
                    OTP sent to <strong>{values.email}</strong>
                  </p>

                  <div className="mb-6">
                    <label className="block text-sm mb-1.5 text-[var(--color-black)]">
                      OTP Code *
                    </label>
                    <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        disabled={loading}
                        className="w-full border border-[var(--color-white-subtle)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-green-500)] disabled:opacity-50"
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
                        className="px-8 py-3 text-xs font-bold uppercase bg-[var(--color-green-800)] text-white hover:bg-[var(--color-green-700)] disabled:opacity-50 transition cursor-pointer"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <button
                        type="button"
                        onClick={resetOtp}
                        className="px-8 py-3 text-xs font-bold uppercase border border-[var(--color-green-800)] text-[var(--color-green-800)] hover:bg-[var(--color-green-800)] hover:text-white transition cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* RIGHT - CTA */}
        <div className="w-[40%] bg-[var(--color-blue-500)] flex flex-col items-center justify-center p-12 text-white">
          <h2 className="text-xl font-bold uppercase mb-4">Login</h2>
          <p className="mb-8 text-center text-sm">
            Already have an account? Log in!
          </p>
          <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 text-xs font-bold uppercase border border-white hover:bg-white hover:text-[var(--color-blue-500)] transition cursor-pointer"
          >
            Login
          </button>
        </div>
      </div>
  )
}
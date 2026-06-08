//6/8: Fix this to pure UI files and move into features/auth/pages
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import CompleteProfileModal from '../components/CompleteProfileModal.jsx'
import { useLogin } from '../hooks/useLogin'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    values,
    loading,
    error,
    pendingGoogle,
    handleChange,
    handleLogin,
    handleGoogleLogin,
    setPendingGoogle,
  } = useLogin()

  const fromPath = location.state?.from?.pathname || '/manage'

  return (
      <div className="min-h-[calc(100vh-4rem)] flex">

        {pendingGoogle && (
            <CompleteProfileModal
                email={pendingGoogle.email}
                fullName={pendingGoogle.fullName}
                onComplete={() => {
                  navigate('/catalog')
                  setPendingGoogle(null)
                }}
            />
        )}

        {/* LEFT */}
        <div className="w-[40%] bg-[var(--color-blue-500)] flex flex-col items-center justify-center p-12 text-white">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-4">Register</h2>
          <p className="mb-8 text-center text-sm">
            Don't have an account? Register one!
          </p>
          <button
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 text-xs font-bold uppercase border border-white hover:bg-white hover:text-[var(--color-blue-600)] transition cursor-pointer"
          >
            Register an account
          </button>
        </div>

        {/* RIGHT */}
        <div className="w-[60%] flex flex-col items-center justify-center px-16 py-12">
          <div className="w-full max-w-md">

            <h1 className="text-2xl font-bold uppercase tracking-widest mb-8 text-[var(--color-green-800)]">
              Login
            </h1>

            {error && (
                <div className="mb-6 p-3 text-sm border border-[var(--color-red-400)] text-[var(--color-red-700)] bg-[var(--color-red-200)] rounded">
                  {error}
                </div>
            )}

            <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const result = await handleLogin(fromPath)
                  if (result?.success) navigate(result.redirect, { replace: true })
                }}
            >
              <div className="mb-5">
                <label className="block text-sm mb-1.5 text-[var(--color-green-800)]">
                  Username or email address *
                </label>
                <input
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-[var(--color-white-subtle)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-green-500)] disabled:opacity-50"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm mb-1.5 text-[var(--color-green-800)]">
                  Password *
                </label>
                <input
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-[var(--color-white-subtle)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-green-500)] disabled:opacity-50"
                />
              </div>

              <div className="mb-6 flex items-center gap-2">
                <input type="checkbox" id="remember" className="cursor-pointer" />
                <label htmlFor="remember" className="text-sm text-[var(--color-green-800)] cursor-pointer">
                  Remember me
                </label>
              </div>

              <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 text-xs font-bold uppercase bg-[var(--color-green-700)] text-white hover:bg-[var(--color-green-600)] disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-[var(--color-white-subtle)]" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-[var(--color-white-subtle)]" />
            </div>

            <GoogleLogin
                onSuccess={async (res) => {
                  const result = await handleGoogleLogin(res.credential)
                  if (result?.success) navigate(result.redirect, { replace: true })
                }}
                onError={() => {}}
            />

            <div className="mt-4">
              <a href="#" className="text-sm text-[var(--color-green-700)] hover:underline">
                Lost your password?
              </a>
            </div>
          </div>
        </div>
      </div>
  )
}
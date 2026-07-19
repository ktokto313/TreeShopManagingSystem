import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import CompleteProfileModal from '../components/CompleteProfileModal.jsx'
import { useLogin } from '../hooks/useLogin'
import loginImg from "../assets/images/loginImg.jpg"
import { Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  const {
    values,
    loading,
    error,
    pendingGoogle,
    blockedSeconds,
    handleChange,
    handleLogin,
    handleGoogleLogin,
    setPendingGoogle,
  } = useLogin()

  const isDisabled = loading || blockedSeconds > 0

  return (
      <div className="flex flex-col-reverse md:flex-row min-h-screen bg-green-200/50">

        {pendingGoogle && (
            <CompleteProfileModal
                email={pendingGoogle.email}
                fullName={pendingGoogle.fullName}
                onComplete={() => {
                  navigate('/')
                  setPendingGoogle(null)
                }}
            />
        )}

        {/* LEFT */}
        <div className="bg-blue-500 text-white relative flex-1 flex justify-center items-center flex-col">
          <div className={"absolute inset-0"}>
            <img src={loginImg} className={"object-cover w-full h-full"}></img>
          </div>
          <div className={"bg-blue-300/90 relative z-10 p-10"}>
            <h2 className="text-2xl font-bold uppercase mb-4">Register</h2>
            <p className="mb-8 text-left text-pretty w-[80%] text-lg font-semibold">
              Don't have an account? Register one!
            </p>
            <button
                onClick={() => navigate('/register')}
                className="px-6 py-2.5 text-xs font-bold uppercase border border-white hover:bg-white hover:text-blue-600 transition cursor-pointer"
            >
              Register an account
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-center justify-center px-16 md:px-12 lg:px-0 py-12 md:flex-1">
          <div className="w-full max-w-md">

            <h1 className="text-2xl font-bold uppercase tracking-widest mb-8 text-green-800">
              Login
            </h1>

            {error && (
                <div className="mb-6 p-3 text-sm border border-red-400 text-red-700 bg-red-200 rounded">
                  {error}
                </div>
            )}

            <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const result = await handleLogin(location.state?.from?.pathname)
                  if (result?.success) navigate(result.redirect, { replace: true })
                }}
            >
              <div className="mb-5">
                <label className="block text-sm mb-1.5 text-green-800">
                  Username or email address *
                </label>
                <input
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className="w-full border-[0.01rem] border-green-600 focus:border-[0.12rem] px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 disabled:opacity-50"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm mb-1.5 text-green-800">
                  Password *
                </label>
                <div className="relative">
                  <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      disabled={isDisabled}
                      className="w-full border-[0.01rem] border-green-600 focus:border-[0.12rem] px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-500 disabled:opacity-50"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      tabIndex={-1}
                  >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between text-nowrap gap-2">
                <div className='flex gap-2'>
                  <input type="checkbox" id="remember" className="cursor-pointer" />
                  <label htmlFor="remember" className="text-sm text-green-800 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <Link
                    to="/reset-password"
                    className="text-sm text-green-700 hover:underline"
                >
                  Lost your password?
                </Link>
              </div>

              <button
                  type="submit"
                  disabled={isDisabled}
                  className="px-8 py-3 text-xs w-full font-bold uppercase bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition cursor-pointer"
              >
                {blockedSeconds > 0
                    ? `Try again in ${blockedSeconds}s`
                    : loading
                        ? 'Logging in...'
                        : 'Log in'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white-subtle" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-white-subtle" />
            </div>

            <GoogleLogin
                onSuccess={async (res) => {
                  const result = await handleGoogleLogin(res.credential)
                  if (result?.success) navigate(result.redirect, { replace: true })
                }}
                onError={() => {}}
            />
          </div>
        </div>
      </div>
  )
}
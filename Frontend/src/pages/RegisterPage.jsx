import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [values, setValues] = useState({ fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
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

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm text-gray-700 mb-1.5">
                  Full name *
                </label>
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
                <label className="block text-sm text-gray-700 mb-1.5">
                  Email address *
                </label>
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
                <label className="block text-sm text-gray-700 mb-1.5">
                  Password *
                </label>
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
                {loading ? 'Registering...' : 'Register an account'}
              </button>
            </form>
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
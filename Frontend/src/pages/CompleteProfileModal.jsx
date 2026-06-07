import { useState } from 'react'

export default function CompleteProfileModal({ email, fullName, onComplete }) {
  const [name, setName] = useState(fullName || '')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const vnPhoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/

  async function handleSubmit() {
    if (!name.trim()) { setError('Full name is required'); return }
    if (!vnPhoneRegex.test(phone)) { setError('Invalid Vietnamese phone number (e.g. 0912345678)'); return }
    setLoading(true)
    try {
      await fetch('/api/auth/google/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, fullName: name, phoneNumber: phone }),
      })
      const userData = { email, fullName: name, role: 'CUSTOMER' }
      window.localStorage.setItem('treeshop-auth-user', JSON.stringify(userData))
      onComplete()
    } catch {
      setError('Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md flex flex-col gap-4 shadow-xl">
          <h2 className="text-xl font-bold tracking-wide uppercase" style={{ color: '#2c3e2d', fontFamily: 'Georgia, serif' }}>
            Complete Your Profile
          </h2>
          <p className="text-gray-500 text-sm">Just a couple more details to finish setting up your account.</p>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Full name *</label>
            <input
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Phone number *</label>
            <input
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 0912345678"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
              onClick={handleSubmit}
              disabled={loading}
              className="py-3 text-xs font-bold tracking-widest uppercase text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#2c5f2e' }}
          >
            {loading ? 'Saving...' : 'Finish'}
          </button>
        </div>
      </div>
  )
}
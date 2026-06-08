import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'

export default function CompleteProfileModal({ email, fullName, onComplete }) {
  const [name, setName] = useState(fullName || '')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginWithGoogle } = useAuth()

  const vnPhoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/

  async function handleSubmit() {
    if (!name.trim()) { setError('Full name is required'); return }
    if (!vnPhoneRegex.test(phone)) { setError('Invalid Vietnamese phone number (e.g. 0912345678)'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/google/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, fullName: name, phoneNumber: phone }),
      })

      if (!res.ok) {
        setError('Something went wrong, please try again')
        return
      }

      loginWithGoogle({ email, fullName: name, role: 'CUSTOMER' })
      onComplete()
    } catch {
      setError('Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[var(--color-bg-base)] rounded-2xl p-8 w-full max-w-md flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-wide uppercase text-[var(--color-green-800)]">
            Complete Your Profile
          </h2>
          <p className="text-sm text-[var(--color-green-900)]/60">
            Just a couple more details to finish setting up your account.
          </p>

          <div>
            <label className="block text-sm text-[var(--color-green-800)] mb-1.5">Full name *</label>
            <input
                className="w-full border border-[var(--color-white-subtle)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-green-500)] transition-colors"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-green-800)] mb-1.5">Phone number *</label>
            <input
                className="w-full border border-[var(--color-white-subtle)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-green-500)] transition-colors"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 0912345678"
            />
          </div>

          {error && (
              <p className="text-sm text-[var(--color-red-600)]">{error}</p>
          )}

          <button
              onClick={handleSubmit}
              disabled={loading}
              className="py-3 text-xs font-bold tracking-widest uppercase bg-[var(--color-green-700)] text-white hover:bg-[var(--color-green-600)] disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? 'Saving...' : 'Finish'}
          </button>
        </div>
      </div>
  )
}
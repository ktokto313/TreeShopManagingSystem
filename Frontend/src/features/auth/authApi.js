const BASE = '/api/auth'

export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (res.status === 403) {
    throw new Error('This account was created using Google Sign-In.')
  }

  if (res.status === 401) {
    throw new Error('Invalid email or password')
  }

  if (!res.ok) {
    throw new Error('Login failed')
  }

  return res.json()
}

export async function register(fullName, email, password) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  })

  if (res.status === 400) {
    const message = await res.text()
    throw new Error(message) // "Email already exists"
  }

  if (!res.ok) {
    throw new Error('Registration failed')
  }
  // 201 Created, no body — just returns
}
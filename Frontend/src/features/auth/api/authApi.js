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

  if (res.status === 409) {
    throw new Error('Email already registered')
  }

  if (!res.ok) {
    throw new Error('Registration failed')
  }

  return true
}

export async function sendOtp(email) {
  const res = await fetch(`${BASE}/register/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (res.status === 409) {
    throw new Error('Email already registered')
  }

  if (!res.ok) {
    throw new Error('Failed to send OTP')
  }

  return true
}

export async function verifyOtp(email, otp) {
  const res = await fetch(`${BASE}/register/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })

  if (!res.ok) {
    throw new Error('Invalid or expired OTP')
  }

  return true
}

export async function logout() {
  const res = await fetch(`${BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to logout')
  }

  return true
}

export async function completeGoogleProfile(email, fullName, phoneNumber) {
  const res = await fetch(`${BASE}/google/complete-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, fullName, phoneNumber }),
  })

  if (!res.ok) {
    throw new Error('Failed to complete profile')
  }

  return true
}

export async function sendResetOtp(email) {
  const res = await fetch(`${BASE}/forgot-password/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (res.status === 404) {
    throw new Error('Email not found')
  }

  if (res.status === 403) {
    throw new Error('This account uses Google login')
  }

  if (!res.ok) {
    throw new Error('Failed to send OTP')
  }

  return true
}

export async function verifyResetOtp(email, otp) {
  const res = await fetch(`${BASE}/forgot-password/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })

  if (!res.ok) {
    throw new Error('Invalid or expired OTP')
  }

  return true
}

export async function resetPassword(email, newPassword) {
  const res = await fetch(`${BASE}/forgot-password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  })

  if (!res.ok) {
    throw new Error('Reset password failed')
  }

  return true
}
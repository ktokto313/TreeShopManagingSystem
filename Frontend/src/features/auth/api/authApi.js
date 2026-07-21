const BASE = '/api/auth'

export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (res.status === 403) {
    throw new Error('Tài khoản được tạo bởi Google SSO.')
  }

  if (res.status === 401) {
    throw new Error('Sai email hoặc mật khẩu.')
  }

  if (!res.ok) {
    throw new Error('Đăng nhập thất bại.')
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
    throw new Error('Email đã được đăng ký bởi một tài khoản khác.')
  }

  if (!res.ok) {
    throw new Error('Đăng ký thất bại.')
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
    throw new Error('Email đã được đăng ký bởi một tài khoản khác')
  }

  if (!res.ok) {
    throw new Error('Gửi OTP thất bại.')
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
    throw new Error('OTP không hợp lệ hoặc đã hết hạn.')
  }

  return true
}

export async function logout() {
  const res = await fetch(`${BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Đăng xuất thất bại.')
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
    throw new Error('Không hoàn thành dữ liệu cá nhân.')
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
    throw new Error('Email không tồn tại trong dữ liệu.')
  }

  if (res.status === 403) {
    throw new Error('Tài khoản này sử dụng Google SSO')
  }

  if (!res.ok) {
    throw new Error('Gửi OTP thất bại')
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
    throw new Error('OTP không hợp lệ hoặc đã hết hạn.')
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
    throw new Error('Đặt lại mật khẩu thất bại.')
  }

  return true
}
export async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const text = await response.text().catch(() => '')
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.message) ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export function fetchCart() {
  return requestJson('/api/cart')
}

export function addCartItem(productId, quantity = 1) {
  return requestJson('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  })
}

export function updateCartItem(productId, quantity) {
  return requestJson(`/api/cart/items/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })
}

export function removeCartItem(productId) {
  return requestJson(`/api/cart/items/${productId}`, {
    method: 'DELETE',
  })
}

export function clearCart() {
  return requestJson('/api/cart', {
    method: 'DELETE',
  })
}

export function submitCheckout(payload) {
  return requestJson('/api/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchShippingFee(payload) {
  return requestJson('/api/checkout/shipping-fee', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

import { requestJson } from '../../utils/api'

const PRODUCT_API_BASE = '/api/products'

export function getProducts(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return requestJson(query ? `${PRODUCT_API_BASE}?${query}` : PRODUCT_API_BASE)
}

export function createProduct(payload) {
  return requestJson(PRODUCT_API_BASE, {
    method: 'POST',
    body: payload,
  })
}

export function updateProduct(id, payload) {
  return requestJson(`${PRODUCT_API_BASE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deactivateProduct(id) {
  return requestJson(`${PRODUCT_API_BASE}/${id}`, {
    method: 'DELETE',
  })
}

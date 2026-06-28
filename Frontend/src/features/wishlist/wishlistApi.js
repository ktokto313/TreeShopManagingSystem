import { requestJson } from '../../utils/api'

const WISHLIST_API_BASE = '/api/wishlist'

export function getWishlistProducts() {
  return requestJson(WISHLIST_API_BASE)
}

export function addWishlistProduct(productId) {
  return requestJson(`${WISHLIST_API_BASE}/${productId}`, {
    method: 'POST',
  })
}

export function removeWishlistProduct(productId) {
  return requestJson(`${WISHLIST_API_BASE}/${productId}`, {
    method: 'DELETE',
  })
}

export function checkWishlistProduct(productId) {
  return requestJson(`${WISHLIST_API_BASE}/check/${productId}`)
}

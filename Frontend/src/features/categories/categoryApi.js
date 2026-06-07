// Created by minhlthe200133
import { requestJson } from '../../utils/api'

const CATEGORY_API_BASE = '/api/categories'

export function getCategories() {
  return requestJson(CATEGORY_API_BASE)
}

export function createCategory(payload) {
  return requestJson(CATEGORY_API_BASE, {
    method: 'POST',
    body: payload,
  })
}

export function updateCategory(id, payload) {
  return requestJson(`${CATEGORY_API_BASE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteCategory(id) {
  return requestJson(`${CATEGORY_API_BASE}/${id}`, {
    method: 'DELETE',
  })
}

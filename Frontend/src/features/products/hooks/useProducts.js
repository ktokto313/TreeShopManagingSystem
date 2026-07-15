/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-03
 * Last Modified: 2026-06-07
 */
// Created by minhlthe200133
import { useCallback, useState } from 'react'
import { getProducts } from '../productApi'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadProducts = useCallback(async (filters = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      setProducts(await getProducts(filters))
    } catch (nextError) {
      setError(nextError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    products,
    isLoading,
    error,
    loadProducts,
  }
}

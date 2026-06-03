import { useCallback, useState } from 'react'
import { getCategories } from '../categoryApi'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setCategories(await getCategories())
    } catch (nextError) {
      setError(nextError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    categories,
    isLoading,
    error,
    loadCategories,
  }
}

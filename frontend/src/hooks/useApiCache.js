import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for API caching with automatic cache invalidation
 */
export function useApiCache(key, fetchFn, options = {}) {
  const { ttl = 300000, enabled = true } = options // 5 minutes default TTL
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cacheRef = useRef({})
  const fetchRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const cacheKey = typeof key === 'function' ? key() : key
    
    // Check cache
    const cached = cacheRef.current[cacheKey]
    if (cached && Date.now() - cached.timestamp < ttl) {
      setData(cached.data)
      setLoading(false)
      return
    }

    // Cancel previous request if still pending
    if (fetchRef.current) {
      fetchRef.current.cancel?.()
    }

    // Fetch new data
    setLoading(true)
    setError(null)
    
    const controller = new AbortController()
    fetchRef.current = { cancel: () => controller.abort() }

    fetchFn(controller.signal)
      .then((result) => {
        // Cache the result
        cacheRef.current[cacheKey] = {
          data: result,
          timestamp: Date.now(),
        }
        setData(result)
        setError(null)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err)
        }
      })
      .finally(() => {
        setLoading(false)
        fetchRef.current = null
      })

    return () => {
      controller.abort()
    }
  }, [key, fetchFn, ttl, enabled])

  const invalidate = () => {
    const cacheKey = typeof key === 'function' ? key() : key
    delete cacheRef.current[cacheKey]
  }

  return { data, loading, error, invalidate }
}


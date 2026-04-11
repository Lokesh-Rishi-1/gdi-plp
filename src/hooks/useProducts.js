import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchProducts } from '../utils/fetchClient'

const PAGE_SIZE_OPTIONS = [8, 16, 24]
const DEFAULT_PAGE_SIZE = 16

const useProducts = () => {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fromCache, setFromCache] = useState(false)

  // Tracks the latest request inside the hook
  const requestIdRef = useRef(0)
  const skip = (page - 1) * pageSize
  // Derived values. Calculated from state, not stored separately.
  const totalPages = Math.ceil(total / pageSize)

  const loadProducts = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    try {
      const result = await fetchProducts(pageSize, skip)
      // A newer request has fired. Don't touch state
      if (requestId !== requestIdRef.current) return
      setProducts(result.products)
      setTotal(result.total)
      setFromCache(result.fromCache)
    } catch (err) {
      // Silently ignore stale requests.
      if (requestId !== requestIdRef.current) return
      // Stale request from fetchClient. Already handled above,
      // but kept as safety net
      if (err.message === 'STALE_REQUEST') return
      setError('Failed to load products. Please try again.')
    } finally {
        // Only the latest request should turn off loading
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [pageSize, skip])

  // Refetch whenever page or pageSize changes
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const goToNextPage = () => {
    if (page < totalPages) setPage(p => p + 1)
  }

  const goToPrevPage = () => {
    if (page > 1) setPage(p => p - 1)
  }

  const changePageSize = (newSize) => {
    setPageSize(newSize)
    setPage(1) // reset to page 1 when page size changes
  }

  return {
    products,
    page,
    totalPages,
    pageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    loading,
    error,
    fromCache,
    goToNextPage,
    goToPrevPage,
    changePageSize
  }
}

export default useProducts
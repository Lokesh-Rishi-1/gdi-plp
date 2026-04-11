import { useState, useEffect, useCallback } from 'react'
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

  // Derived values. Calculated from state, not stored separately.
  const skip = (page - 1) * pageSize
  const totalPages = Math.ceil(total / pageSize)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchProducts(pageSize, skip)
      setProducts(result.products)
      setTotal(result.total)
      setFromCache(result.fromCache)
    } catch (err) {
      // Silently ignore stale requests.
      if (err.message === 'STALE_REQUEST') return
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
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
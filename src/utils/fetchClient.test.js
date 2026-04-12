import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fetchProducts } from './fetchClient'
import cache from './cache'

// Helper to create a fake successful fetch response
const mockFetch = (data) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data
  })
}

// Helper to create a fake failed fetch response
const mockFetchError = (status) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status
  })
}

describe('fetchProducts', () => {
  beforeEach(() => {
    // Clear cache and reset fetch mock before each test
    cache.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches from API when cache is empty', async () => {
    const apiResponse = {
      products: [{ id: 1, title: 'Jeans', description: 'Nice', price: 80, thumbnail: 'img.jpg' }],
      total: 1
    }
    mockFetch(apiResponse)

    const result = await fetchProducts(16, 0)

    expect(fetch).toHaveBeenCalledOnce()
    expect(result.products).toHaveLength(1)
    expect(result.fromCache).toBe(false)
  })

  it('returns cached data without hitting the network', async () => {
    const apiResponse = {
      products: [{ id: 1, title: 'Jeans', description: 'Nice', price: 80, thumbnail: 'img.jpg' }],
      total: 1
    }
    mockFetch(apiResponse)

    // First call — hits network
    await fetchProducts(16, 0)
    expect(fetch).toHaveBeenCalledOnce()

    // Second call — should use cache
    const result = await fetchProducts(16, 0)
    expect(fetch).toHaveBeenCalledOnce() // still only one network call
    expect(result.fromCache).toBe(true)
  })

  it('throws on bad HTTP status', async () => {
    mockFetchError(500)

    await expect(fetchProducts(16, 0)).rejects.toThrow('Failed to fetch products: 500')
  })

  it('does not cache failed responses', async () => {
    mockFetchError(404)

    try {
      await fetchProducts(16, 0)
    } catch {
      // expected
    }

    expect(cache.has(16, 0)).toBe(false)
  })

  it('maps API response to internal product model', async () => {
    const apiResponse = {
      products: [{
        id: 1,
        title: 'Jeans',
        description: 'Nice jeans',
        price: 80,
        thumbnail: 'img.jpg',
        brand: 'GDI',         // extra field not in our model
        rating: 4.5           // extra field not in our model
      }],
      total: 1
    }
    mockFetch(apiResponse)

    const result = await fetchProducts(16, 0)
    const product = result.products[0]

    // Only our model fields should be present
    expect(product).toEqual({
      id: 1,
      title: 'Jeans',
      description: 'Nice jeans',
      price: 80,
      thumbnail: 'img.jpg'
    })

    // Extra API fields should be stripped
    expect(product.brand).toBeUndefined()
    expect(product.rating).toBeUndefined()
  })

  it('ignores stale request when newer request fires', async () => {
		let resolveFirst

		// First fetch. Slow, will be stale
		const slowFetch = new Promise(resolve => {
			resolveFirst = () => resolve({
				ok: true,
				json: async () => ({
					products: [{ id: 1, title: 'Stale', description: 'x', price: 10, thumbnail: 'img.jpg' }],
					total: 1
				})
			})
		})

		// Second fetch. Fast, current
		const fastResponse = {
			ok: true,
			json: async () => ({
				products: [{ id: 2, title: 'Current', description: 'x', price: 20, thumbnail: 'img.jpg' }],
				total: 1
			})
		}

		let callCount = 0
		global.fetch = vi.fn().mockImplementation(() => {
			callCount++
			if (callCount === 1) return slowFetch
			return Promise.resolve(fastResponse)
		})

		// Fire both. Second fires before first resolves
		const firstRequest = fetchProducts(16, 0)
		const secondRequest = fetchProducts(16, 16)

		// Resolve the slow first fetch — now stale
		resolveFirst()

		// First should be discarded
		await expect(firstRequest).rejects.toThrow('STALE_REQUEST')

		// Second should succeed with current data
		const result = await secondRequest
		expect(result.products[0].title).toBe('Current')
		expect(result.fromCache).toBe(false)
  })
})
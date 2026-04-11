import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Cache } from './cache'

describe('Cache', () => {
  let cache

  // Fresh cache instance before each test
  // prevents state leaking between tests
  beforeEach(() => {
    cache = new Cache()
  })

  it('returns null when nothing is cached', () => {
    const result = cache.get(16, 0)
    expect(result).toBeNull()
  })

  it('returns cached data after set', () => {
    const data = { products: [{ id: 1, title: 'Jeans' }], total: 1 }

    cache.set(16, 0, data)
    const result = cache.get(16, 0)

    expect(result).toEqual(data)
  })

  it('returns null after TTL expires', async () => {
    // Short TTL so we don't wait 30 seconds in a test
    const shortCache = new Cache(50)
    const data = { products: [], total: 0 }

    shortCache.set(16, 0, data)
    expect(shortCache.get(16, 0)).toEqual(data) // still valid

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 60))

    expect(shortCache.get(16, 0)).toBeNull() // expired
  })

  it('different limit/skip combinations are cached separately', () => {
    const page1 = { products: [{ id: 1 }], total: 32 }
    const page2 = { products: [{ id: 17 }], total: 32 }

    cache.set(16, 0, page1)
    cache.set(16, 16, page2)

    expect(cache.get(16, 0)).toEqual(page1)
    expect(cache.get(16, 16)).toEqual(page2)
  })

  it('has() returns true for valid cache and false for expired', async () => {
    const shortCache = new Cache(50)
    const data = { products: [], total: 0 }

    expect(shortCache.has(16, 0)).toBe(false) // nothing cached

    shortCache.set(16, 0, data)
    expect(shortCache.has(16, 0)).toBe(true) // cached and valid

    await new Promise(resolve => setTimeout(resolve, 60))
    expect(shortCache.has(16, 0)).toBe(false) // expired
  })

  it('clear() removes all cached entries', () => {
    const data = { products: [], total: 0 }

    cache.set(16, 0, data)
    cache.set(16, 16, data)
    cache.clear()

    expect(cache.get(16, 0)).toBeNull()
    expect(cache.get(16, 16)).toBeNull()
  })
})
const CACHE_TTL = 30 * 1000 // 30 seconds

class Cache {
  constructor(ttl = CACHE_TTL) {
    this.store = new Map()
    this.ttl = ttl
  }

  // Build a unique key from the exact params sent to the API
  // e.g. limit=16, skip=0 => 'products_16_0'
  #key(limit, skip) {
    return `products_${limit}_${skip}`
  }

  // Check if the entry has outlived its TTL
  #isExpired(entry) {
    return Date.now() - entry.timestamp >= this.ttl
  }

  // Returns cached data if it exists and hasn't expired
  // Cleans up the entry if it has expired
  get(limit, skip) {
    const key = this.#key(limit, skip)
    const entry = this.store.get(key)

    if (!entry) return null

    if (this.#isExpired(entry)) {
      this.store.delete(key)
      return null
    }

    return entry.data
  }

  // Only call this after a successful API response
  // Stores data with current timestamp for TTL tracking
  set(limit, skip, data) {
    const key = this.#key(limit, skip)
    this.store.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Used to show the cache indicator in the UI header
  has(limit, skip) {
    const key = this.#key(limit, skip)
    const entry = this.store.get(key)
    return !!entry && !this.#isExpired(entry)
  }

  // Full reset
  clear() {
    this.store.clear()
  }
}

export default new Cache()
import cache from './cache'

// Tracks the latest request. Any response with an older token gets discarded to prevent stale data rendering
let currentRequestToken = 0


// Maps raw API product to our internal model
// Keeps API shape separate from what our UI depends on. If DummyJSON changes their response, we only update here
const mapProduct = (raw) => ({
  id: raw.id,
  title: raw.title,
  description: raw.description,
  price: raw.price,
  thumbnail: raw.thumbnail
})

// Fetch function with cache check and race condition handling
// Returns: { products, total, fromCache }
// Throws:  Error if request fails or is superseded by a newer request
export const fetchProducts = async (limit, skip) => {
  // Each call gets a new token. Only the latest token's response is considered valid
  const token = ++currentRequestToken

  // Check cache before hitting the network
  const cached = cache.get(limit, skip)
  if (cached) {
    return { ...cached, fromCache: true }
  }

  const url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`

  const response = await fetch(url)

  // Check if a newer request has fired while we were waiting.
  // If so, silently abort the old requests and prevent them from updating the UI with stale data
  if (token !== currentRequestToken) {
    throw new Error('STALE_REQUEST')
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`)
  }

  const json = await response.json()

  // Check token again after parsing JSON, 
  // as it can be a time-consuming step and we might have received a newer request in the meantime
  if (token !== currentRequestToken) {
    throw new Error('STALE_REQUEST')
  }

  const data = {
    products: json.products.map(mapProduct),
    total: json.total
  }

  // Only cache successful, current responses
  cache.set(limit, skip, data)

  return { ...data, fromCache: false }
}
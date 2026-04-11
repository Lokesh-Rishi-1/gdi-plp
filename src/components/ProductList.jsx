import ProductCard from './ProductCard'

// Renders the product grid
// Also owns loading and error states — keeps App.jsx clean
const ProductList = ({ products, loading, error }) => {
  if (loading) {
    return <p style={styles.message}>Loading products...</p>
  }

  if (error) {
    return <p style={{ ...styles.message, color: '#c0392b' }}>{error}</p>
  }

  if (!products.length) {
    return <p style={styles.message}>No products found.</p>
  }

  return (
    <div style={styles.grid}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    // Responsive grid — fills available space, min 240px per card
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px'
  },
  message: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#666',
    fontSize: '14px'
  }
}

export default ProductList
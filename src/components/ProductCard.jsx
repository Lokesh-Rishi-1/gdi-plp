// Single product tile
// Receives a product object and renders it — nothing else
const ProductCard = ({ product }) => {
  return (
    <div style={styles.card}>
      <img
        src={product.thumbnail}
        alt={product.title}
        loading="lazy"
        style={styles.image}
      />
      <div style={styles.body}>
        <h3 style={styles.title}>{product.title}</h3>
        <p style={styles.description}>{product.description}</p>
        <p style={styles.price}>${product.price}</p>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  image: {
    width: '100%',
    aspectRatio: '4/3',
    objectFit: 'cover'
  },
  body: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  title: {
    fontSize: '14px',
    fontWeight: '500',
    margin: 0
  },
  description: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
    // Clamp description to 2 lines — keeps cards same height
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  price: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111',
    margin: 0,
    marginTop: 'auto' // pushes price to bottom of card
  }
}

export default ProductCard
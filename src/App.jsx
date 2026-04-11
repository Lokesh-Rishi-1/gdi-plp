import useProducts from './hooks/useProducts'
import ProductList from './components/ProductList'
import Pagination from './components/Pagination'

const App = () => {
  const {
    products,
    page,
    totalPages,
    pageSize,
    pageSizeOptions,
    loading,
    error,
    fromCache,
    goToNextPage,
    goToPrevPage,
    changePageSize
  } = useProducts()

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.heading}>Products</h1>
        {/* Cache indicator — only shows when data came from cache */}
        {fromCache && (
          <span style={styles.cacheBadge}>
            Cached
          </span>
        )}
      </header>

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        loading={loading}
        onNext={goToNextPage}
        onPrev={goToPrevPage}
        onPageSizeChange={changePageSize}
      />

      <ProductList
        products={products}
        loading={loading}
        error={error}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        loading={loading}
        onNext={goToNextPage}
        onPrev={goToPrevPage}
        onPageSizeChange={changePageSize}
      />
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  heading: {
    fontSize: '24px',
    fontWeight: '500'
  },
  cacheBadge: {
    fontSize: '11px',
    fontWeight: '500',
    padding: '3px 10px',
    borderRadius: '20px',
    background: '#e8f5e9',
    color: '#2e7d32',
    letterSpacing: '0.03em'
  }
}

export default App
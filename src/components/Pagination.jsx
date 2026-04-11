// Pagination controls — next/prev buttons, page indicator,
// and page size selector
const Pagination = ({
  page,
  totalPages,
  pageSize,
  pageSizeOptions,
  loading,
  onNext,
  onPrev,
  onPageSizeChange
}) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.left}>
        <label style={styles.label}>Products per page</label>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          style={styles.select}
          disabled={loading}
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div style={styles.right}>
        <button
          onClick={onPrev}
          disabled={page <= 1 || loading}
          style={styles.button}
        >
          Previous
        </button>

        <span style={styles.pageInfo}>
          Page {page} of {totalPages || '...'}
        </span>

        <button
          onClick={onNext}
          disabled={page >= totalPages || loading}
          style={styles.button}
        >
          Next
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    flexWrap: 'wrap',
    gap: '12px'
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  label: {
    fontSize: '13px',
    color: '#666'
  },
  select: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #e5e5e5',
    fontSize: '13px',
    cursor: 'pointer',
    background: '#fff'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #e5e5e5',
    background: '#fff',
    fontSize: '13px',
    cursor: 'pointer'
  },
  pageInfo: {
    fontSize: '13px',
    color: '#444'
  }
}

export default Pagination
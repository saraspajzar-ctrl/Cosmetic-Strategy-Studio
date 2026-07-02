import React from 'react'

export default function SavedProductsBar({ products, onLoad, onDelete }) {
  if (!products.length) return null

  return (
    <div className="saved-bar">
      <div className="saved-bar-header">
        <span className="saved-bar-label">Saved configurations</span>
        <span className="saved-bar-count">{products.length}</span>
      </div>
      <div className="saved-bar-list">
        {products.map(p => {
          const meta = [p.form.Category, p.form.Brand].filter(Boolean).join(' · ')
          return (
            <button
              key={p.id}
              className="saved-product-card"
              onClick={() => onLoad(p.form)}
              title={`Load "${p.name}"`}
            >
              <div className="saved-product-name">{p.name}</div>
              <div className="saved-product-meta">{meta || 'No details'}</div>
              <button
                className="saved-product-delete"
                onClick={e => { e.stopPropagation(); onDelete(p.id) }}
                aria-label={`Delete ${p.name}`}
              >
                ×
              </button>
            </button>
          )
        })}
      </div>
    </div>
  )
}

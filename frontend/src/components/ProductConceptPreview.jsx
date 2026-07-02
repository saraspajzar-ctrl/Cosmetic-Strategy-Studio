import React from 'react'
import { CategorySVG } from '../categoryImages.jsx'

const FIELD_PAIRS = [
  ['Main_Ingredient',   'Ingredient'],
  ['Skin_Type',         'Skin type'],
  ['Packaging_Type',    'Packaging'],
  ['Cruelty_Free',      'Cruelty-free'],
  ['Country_of_Origin', 'Origin'],
]

export default function ProductConceptPreview({ form }) {
  const hasAny = form.Category || form.Brand
  if (!hasAny) return null

  return (
    <div className="card product-concept-card">
      <div className="section-label" style={{ marginBottom: '0.875rem' }}>
        Product Concept Preview
      </div>

      <div className="product-concept-layout">
        {/* Category illustration */}
        <div className="product-concept-image">
          <CategorySVG category={form.Category || ''} size={80} />
        </div>

        {/* Product info */}
        <div className="product-concept-info">
          <div className="product-concept-name">
            {form.Brand && <span>{form.Brand}</span>}
            {form.Brand && form.Category && (
              <span style={{ opacity: 0.4, margin: '0 0.3rem' }}>·</span>
            )}
            {form.Category && <span>{form.Category}</span>}
            {!form.Brand && !form.Category && (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Fill in the form to see a preview
              </span>
            )}
          </div>

          <div className="product-badges">
            {form.Category && (
              <span className="category-badge">{form.Category}</span>
            )}
            {form.Cruelty_Free === 'True' && (
              <span className="cruelty-free-badge">Cruelty-Free</span>
            )}
          </div>

          <div className="product-concept-fields">
            {FIELD_PAIRS.map(([key, label]) => {
              let value = form[key]
              if (!value) return null
              if (key === 'Cruelty_Free') value = value === 'True' ? 'Yes' : 'No'
              return (
                <div className="concept-field" key={key}>
                  <span className="concept-field-label">{label}</span>
                  <span className="concept-field-value">{value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}

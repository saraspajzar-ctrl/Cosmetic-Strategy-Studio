import React, { useState } from 'react'
import { api } from '../api.js'
import ProductForm from './ProductForm.jsx'
import ProductConceptPreview from './ProductConceptPreview.jsx'
import SavedProductsBar from './SavedProductsBar.jsx'
import { useSavedProducts } from '../hooks/useSavedProducts.js'

const DEFAULT_FORM = {
  Brand: '', Category: '', Usage_Frequency: '', Number_of_Reviews: '',
  Product_Size: '', Skin_Type: '', Gender_Target: '', Packaging_Type: '',
  Main_Ingredient: '', Cruelty_Free: '', Country_of_Origin: '',
}

const TIER_CONFIG = {
  high:   { color: '#15803D', badge: 'Strong potential',   note: 'Above the recommended launch-confidence threshold.' },
  medium: { color: '#D97706', badge: 'Moderate potential', note: 'Within the moderate confidence range.' },
  low:    { color: '#C2415D', badge: 'Low potential',      note: 'Below the recommended launch-confidence range.' },
}

const INTERPRETATION = {
  high:   'This configuration has strong predicted rating potential compared with patterns in the dataset.',
  medium: 'This configuration has moderate rating potential. It may need stronger positioning, ingredient differentiation, or pricing support.',
  low:    'This configuration has low predicted high-rating potential. It may still be commercially viable, but the concept should be benchmarked against stronger product patterns before launch.',
}

const NEXT_STEPS = {
  high: [
    'Consider this concept as a strong launch candidate.',
    'Compare the predicted price against the category average using the Price Predictor.',
    'Validate with real customer or market research before committing to launch.',
  ],
  medium: [
    'Benchmark against category leaders in the dataset.',
    'Consider improving differentiation through ingredient or packaging choices.',
    'Check whether cruelty-free positioning or a different ingredient improves the concept.',
  ],
  low: [
    'Compare with similar high-rated products in the dataset.',
    'Test alternative ingredients or packaging configurations.',
    'Review whether this category and brand combination performs well in the data.',
    'Avoid overpricing unless the value proposition is clearly differentiated.',
  ],
}

function getTier(prob) {
  if (prob >= 0.65) return 'high'
  if (prob >= 0.40) return 'medium'
  return 'low'
}

function buildConceptRows(form) {
  return [
    form.Category          && { label: 'Category',          value: form.Category },
    form.Brand             && { label: 'Brand',              value: form.Brand },
    form.Main_Ingredient   && { label: 'Main ingredient',    value: form.Main_Ingredient },
    form.Skin_Type         && { label: 'Skin type',          value: form.Skin_Type },
    form.Packaging_Type    && { label: 'Packaging',          value: form.Packaging_Type },
    form.Cruelty_Free      && { label: 'Cruelty-free',       value: form.Cruelty_Free === 'True' ? 'Yes' : 'No' },
    form.Country_of_Origin && { label: 'Country of origin',  value: form.Country_of_Origin },
    form.Number_of_Reviews && { label: 'Expected reviews',   value: form.Number_of_Reviews },
  ].filter(Boolean)
}

export default function ProductSuccessTab() {
  const [form, setForm]           = useState(DEFAULT_FORM)
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [saveName, setSaveName]   = useState('')
  const { products, save, remove } = useSavedProducts()

  function handleSave() {
    save(saveName, form)
    setSaving(false)
    setSaveName('')
  }
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await api.predictRating({
        ...form,
        Number_of_Reviews: Number(form.Number_of_Reviews) || 0,
      })
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const prob  = result?.high_rating_probability ?? 0
  const pct   = Math.round(prob * 100)
  const tier  = getTier(prob)
  const tc    = TIER_CONFIG[tier]
  const rows  = result ? buildConceptRows(form) : []
  const steps = NEXT_STEPS[tier]

  return (
    <div>
      <div className="tab-header">
        <h2>Product Success Predictor</h2>
        <p>
          Configure a planned product and receive a probability estimate of whether it will
          be highly rated by consumers. Rating is the target variable and is not included
          as an input to avoid data leakage.
        </p>
      </div>

      <SavedProductsBar
        products={products}
        onLoad={savedForm => setForm(savedForm)}
        onDelete={remove}
      />

      <div className="card">
        <ProductForm
          values={form}
          onChange={(field, val) => setForm(p => ({ ...p, [field]: val }))}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Predict Rating Potential"
        />
        <div className="save-config-row">
          {!saving ? (
            <button className="save-config-btn" onClick={() => { setSaving(true); setSaveName('') }}>
              + Save this configuration
            </button>
          ) : (
            <>
              <input
                className="save-config-input"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="Name this product…"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setSaving(false) }}
              />
              <button className="save-config-confirm" onClick={handleSave}>Save</button>
              <button className="save-config-cancel" onClick={() => setSaving(false)}>Cancel</button>
            </>
          )}
        </div>
        {error && <div className="error-box" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      <ProductConceptPreview form={form} />

      {result && (
        <div style={{ marginTop: '1.5rem' }}>

          {/* 3-card result grid */}
          <div className="success-result-grid">

            {/* Card 1: Rating Potential */}
            <div className="card">
              <div className="section-label">Rating Potential</div>

              <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', margin: '0.75rem 0 0.5rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 800, color: tc.color, lineHeight: 1 }}>
                  {pct}%
                </span>
                <span style={{
                  padding: '0.2rem 0.55rem', borderRadius: '3px',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em',
                  background: tc.color + '1A', color: tc.color,
                }}>
                  {tc.badge}
                </span>
              </div>

              <div style={{
                margin: '0.625rem 0',
                background: 'var(--border)', borderRadius: '99px', height: '7px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: '99px',
                  width: `${pct}%`, background: tc.color,
                  transition: 'width 0.6s ease',
                }} />
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {tc.note}
              </div>
            </div>

            {/* Card 2: Prediction Explanation */}
            <div className="card">
              <div className="section-label">Prediction Explanation</div>
              <div style={{
                fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.07em', color: 'var(--text-muted)',
                margin: '0.75rem 0 0.5rem',
              }}>
                Selected concept
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {rows.map(({ label, value }) => (
                  <li key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    gap: '0.5rem', padding: '0.35rem 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '0.83rem', lineHeight: 1.4,
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>{label}</span>
                    <span style={{ color: 'var(--text)', fontWeight: 700, textAlign: 'right' }}>{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3: Recommended Next Steps */}
            <div className="card">
              <div className="section-label">Recommended Next Steps</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0 0', display: 'grid', gap: '0.875rem' }}>
                {steps.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.625rem', fontSize: '0.85rem', lineHeight: 1.55 }}>
                    <span style={{ flexShrink: 0, fontWeight: 800, color: tc.color }}>→</span>
                    <span style={{ color: 'var(--text)' }}>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Business Interpretation panel */}
          <div style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderLeft: `4px solid ${tc.color}`,
            borderRadius: `0 var(--radius) var(--radius) 0`,
          }}>
            <div className="section-label" style={{ marginBottom: '0.5rem' }}>
              Business Interpretation
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.7, color: 'var(--text)' }}>
              {INTERPRETATION[tier]}
            </p>
          </div>

          <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Prediction results are based on patterns in the dataset. They should be used as a directional
            benchmark, not as a guaranteed market outcome.
          </p>
        </div>
      )}
    </div>
  )
}

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

function SegmentBadge({ segment }) {
  const map = {
    Budget:      { background: '#D1FAE5', color: '#065F46' },
    'Mid-range': { background: '#FEF3C7', color: '#92400E' },
    Premium:     { background: '#FCF0F2', color: '#B76E79' },
  }
  const s = map[segment] ?? { background: 'var(--primary-light)', color: 'var(--primary)' }
  return (
    <span style={{
      display: 'inline-block', padding: '0.2rem 0.65rem',
      borderRadius: '3px', fontSize: '0.78rem', fontWeight: 700, ...s,
    }}>
      {segment}
    </span>
  )
}

function positioningLabel(predicted, catAvg) {
  if (!catAvg) return null
  const r = predicted / catAvg
  if (r > 1.15) return 'Premium positioning — above the category average'
  if (r < 0.85) return 'Budget positioning — below the category average'
  return 'Mid-range — in line with the category average'
}

function buildExplanationRows(form) {
  return [
    form.Category        && { label: `Category: ${form.Category}`,        note: `prices are benchmarked against similar ${form.Category} products` },
    form.Brand           && { label: `Brand: ${form.Brand}`,               note: 'brand positioning is factored into the estimate' },
    form.Country_of_Origin && { label: `Country of origin: ${form.Country_of_Origin}`, note: "included in the model's price estimate" },
    form.Cruelty_Free    && { label: `Cruelty-free: ${form.Cruelty_Free === 'True' ? 'Yes' : 'No'}`, note: 'included as a product positioning signal' },
    form.Number_of_Reviews && { label: `Expected reviews: ${form.Number_of_Reviews}`, note: 'used as a market-attention signal' },
    form.Main_Ingredient && { label: `Main ingredient: ${form.Main_Ingredient}`, note: 'included in the formulation profile' },
    form.Product_Size    && { label: `Product size: ${form.Product_Size}`,  note: 'factored into the price estimate' },
    form.Packaging_Type  && { label: `Packaging: ${form.Packaging_Type}`,   note: 'included as a product format signal' },
  ].filter(Boolean)
}

export default function PricePredictorTab() {
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
      const data = await api.predictPrice({
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

  const catAvg = result?.category_average_price
  const diff   = catAvg != null && result ? result.predicted_price_usd - catAvg : null
  const pos    = result ? positioningLabel(result.predicted_price_usd, catAvg) : null
  const rows   = result ? buildExplanationRows(form) : []

  return (
    <div>
      <div className="tab-header">
        <h2>Price Predictor</h2>
        <p>
          Configure a planned product and receive an estimated retail price.
          Price is the regression target and is not included as an input.
          Results are compared against the category average for context.
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
          submitLabel="Predict Price"
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

          {/* Stat cards */}
          <div className="result-cards">
            <div className="result-card highlight">
              <div className="label">Predicted Price</div>
              <div className="value color-primary">
                ${result.predicted_price_usd.toFixed(2)}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <SegmentBadge segment={result.price_segment} />
              </div>
            </div>

            {catAvg != null && (
              <div className="result-card">
                <div className="label">Category Benchmark</div>
                <div className="value">${catAvg.toFixed(2)}</div>
                <div style={{
                  marginTop: '0.5rem', fontWeight: 700, fontSize: '0.88rem',
                  color: diff > 0 ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                  {diff > 0 ? '+' : ''}{diff?.toFixed(2)} vs. avg
                </div>
              </div>
            )}
          </div>

          {/* Price Explanation card */}
          <div className="card" style={{ marginTop: '1.25rem' }}>
            <h3 style={{
              fontSize: '0.95rem', fontWeight: 800, color: 'var(--secondary)',
              marginBottom: '1rem',
            }}>
              Price Explanation
            </h3>

            {/* Positioning banner */}
            {pos && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 0.875rem',
                background: 'var(--primary-light)', borderRadius: '6px',
                marginBottom: '1.25rem',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>
                  {pos}
                </span>
                {catAvg && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    ({form.Category} average: ${catAvg.toFixed(2)})
                  </span>
                )}
              </div>
            )}

            {/* Inputs list */}
            <div style={{
              fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem',
            }}>
              Main inputs used
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem' }}>
              {rows.map(({ label, note }) => (
                <li key={label} style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.2rem 0.5rem',
                  padding: '0.45rem 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '0.85rem', lineHeight: 1.5,
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>
                    {label}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    — {note}.
                  </span>
                </li>
              ))}
            </ul>

            {/* Interpretation */}
            {result.interpretation && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--bg)',
                borderLeft: '3px solid var(--accent)',
                borderRadius: '0 6px 6px 0',
                fontSize: '0.87rem', fontWeight: 500, lineHeight: 1.65,
                color: 'var(--text)',
              }}>
                {result.interpretation}
              </div>
            )}
          </div>

          <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Note: Price predictions are based on dataset patterns. The regression model has
            limited accuracy on this synthetic dataset (R² near 0). Use as a rough benchmark,
            not a market forecast.
          </p>
        </div>
      )}
    </div>
  )
}

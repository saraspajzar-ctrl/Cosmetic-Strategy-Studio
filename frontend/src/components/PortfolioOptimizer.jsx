import React, { useState, useEffect } from 'react'
import { api } from '../api.js'

const STRATEGY_HINT = {
  maximize_rating:  'Select the highest Bayesian-adjusted rating and review confidence per category.',
  maximize_value:   'Select products with the best adjusted rating relative to their price.',
  premium:          'Prefer higher-priced, well-rated products — premium market positioning.',
  budget_friendly:  'Prefer lower-priced products with strong adjusted ratings — accessible positioning.',
}

export default function PortfolioOptimizer() {
  const [options, setOptions]       = useState(null)
  const [form, setForm]             = useState({
    budget: '', strategy: 'maximize_rating', categories: [],
    skin_type: '', gender_target: '', cruelty_free_only: false,
    main_ingredient: '', country_of_origin: '',
  })
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openAlts, setOpenAlts]     = useState(new Set())

  useEffect(() => {
    api.portfolioOptions().then(setOptions).catch(() => {})
  }, [])

  function toggleCategory(cat) {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  function toggleAlts(cat) {
    setOpenAlts(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.budget || form.categories.length === 0) {
      setError('Enter a budget and select at least one category.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        budget: parseFloat(form.budget),
        categories: form.categories,
        strategy: form.strategy,
        cruelty_free_only: form.cruelty_free_only,
      }
      if (form.skin_type)         payload.skin_type = form.skin_type
      if (form.gender_target)     payload.gender_target = form.gender_target
      if (form.main_ingredient)   payload.main_ingredient = form.main_ingredient
      if (form.country_of_origin) payload.country_of_origin = form.country_of_origin

      const data = await api.portfolioOptimize(payload)
      setResult(data)
      setOpenAlts(new Set())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="section">
      <div className="section-title">Portfolio Optimizer</div>

      <div className="card">
        <h2>Product Portfolio Optimizer</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
          Plan or benchmark a product portfolio across target categories. Enter a total budget or
          target retail value, select the categories to cover, and choose a market-positioning
          strategy. The optimizer scores benchmark products from the dataset per category and
          allocates them within the budget constraint.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Budget + Strategy */}
          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="field">
              <label className="label">Total Portfolio Budget (USD)</label>
              <input
                type="number" className="input" placeholder="e.g. 800"
                min="1" step="1" value={form.budget} required
                onChange={e => setField('budget', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Positioning Strategy</label>
              <select
                className="input" value={form.strategy}
                onChange={e => setField('strategy', e.target.value)}
              >
                {(options?.strategies ?? [
                  { value: 'maximize_rating',  label: 'Maximize Rating Potential' },
                  { value: 'maximize_value',   label: 'Maximize Value-for-Price' },
                  { value: 'premium',          label: 'Build Premium Portfolio' },
                  { value: 'budget_friendly',  label: 'Build Budget-Friendly Portfolio' },
                ]).map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontStyle: 'italic' }}>
            {STRATEGY_HINT[form.strategy]}
          </p>

          {/* Category chips */}
          <div className="field" style={{ marginBottom: '1.25rem' }}>
            <label className="label">
              Categories to Cover
              <span style={{ fontWeight: 400, marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                ({form.categories.length} selected)
              </span>
            </label>
            <div className="cat-chips">
              {(options?.categories ?? []).map(cat => (
                <button
                  key={cat} type="button"
                  className={`cat-chip${form.categories.includes(cat) ? ' active' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            {form.categories.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--accent)', margin: '0.3rem 0 0' }}>
                Select at least one category to continue.
              </p>
            )}
          </div>

          {/* Optional filters */}
          <button
            type="button" className="alt-toggle"
            style={{ marginBottom: filtersOpen ? '0.75rem' : '1.25rem' }}
            onClick={() => setFiltersOpen(p => !p)}
          >
            {filtersOpen ? '▲ Hide optional filters' : '▼ Optional filters — skin type, gender, ingredient, origin'}
          </button>

          {filtersOpen && (
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="field">
                <label className="label">Skin Type</label>
                <select className="input" value={form.skin_type} onChange={e => setField('skin_type', e.target.value)}>
                  <option value="">Any</option>
                  {(options?.skin_types ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Gender Target</label>
                <select className="input" value={form.gender_target} onChange={e => setField('gender_target', e.target.value)}>
                  <option value="">Any</option>
                  {(options?.gender_targets ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Main Ingredient</label>
                <select className="input" value={form.main_ingredient} onChange={e => setField('main_ingredient', e.target.value)}>
                  <option value="">Any</option>
                  {(options?.main_ingredients ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Country of Origin</label>
                <select className="input" value={form.country_of_origin} onChange={e => setField('country_of_origin', e.target.value)}>
                  <option value="">Any</option>
                  {(options?.countries ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                <input
                  type="checkbox" id="cf_only"
                  checked={form.cruelty_free_only}
                  onChange={e => setField('cruelty_free_only', e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                />
                <label htmlFor="cf_only" style={{ cursor: 'pointer', fontSize: '0.875rem', userSelect: 'none' }}>
                  Cruelty-free products only
                </label>
              </div>
            </div>
          )}

          {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner" style={{ marginRight: '0.5rem' }} />Optimizing&hellip;</>
              : 'Optimize Portfolio'}
          </button>
        </form>
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2>Portfolio Allocation — {result.strategy_label}</h2>

          {/* Summary */}
          <div className="portfolio-summary">
            <div className="port-stat">
              <div className="num">${fmt(result.total_value)}</div>
              <div className="lbl">Total Value</div>
            </div>
            <div className="port-stat">
              <div className="num" style={{ color: result.remaining_budget >= 0 ? 'var(--secondary)' : 'var(--accent)' }}>
                {result.remaining_budget >= 0 ? '+' : '-'}${fmt(Math.abs(result.remaining_budget))}
              </div>
              <div className="lbl">Remaining Budget</div>
            </div>
            <div className="port-stat">
              <div className="num">
                {result.portfolio_score.toFixed(2)}
                <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/5.0</span>
              </div>
              <div className="lbl">Avg Adj. Rating</div>
            </div>
            <div className="port-stat">
              <div className="num">{result.allocations.length}</div>
              <div className="lbl">Categories</div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="port-interpretation">{result.interpretation}</div>

          {/* Warnings */}
          {result.warnings.map((w, i) => (
            <div key={i} className="portfolio-warning">{w}</div>
          ))}

          {/* Allocations table */}
          <div className="section-title" style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            Recommended Allocations
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="port-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Adj. Rating</th>
                  <th>Reviews</th>
                  <th>Cruelty-Free</th>
                  <th>Origin</th>
                </tr>
              </thead>
              <tbody>
                {result.allocations.map(alloc => (
                  <tr key={alloc.category}>
                    <td><strong>{alloc.category}</strong></td>
                    <td style={{ maxWidth: 180, wordBreak: 'break-word' }}>{alloc.selected.product_name}</td>
                    <td>{alloc.selected.brand}</td>
                    <td><strong>${alloc.selected.price_usd.toFixed(2)}</strong></td>
                    <td>{alloc.selected.rating.toFixed(1)}</td>
                    <td><span className="score-badge">{alloc.selected.adjusted_rating.toFixed(2)}</span></td>
                    <td>{alloc.selected.number_of_reviews.toLocaleString()}</td>
                    <td style={{ color: alloc.selected.cruelty_free ? 'var(--secondary)' : 'var(--text-muted)' }}>
                      {alloc.selected.cruelty_free ? 'Yes' : 'No'}
                    </td>
                    <td>{alloc.selected.country_of_origin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alternatives */}
          <div className="section-title" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Alternative Options per Category
          </div>
          {result.allocations.map(alloc =>
            alloc.alternatives.length > 0 ? (
              <div key={alloc.category} className="alt-section">
                <button type="button" className="alt-toggle" onClick={() => toggleAlts(alloc.category)}>
                  {openAlts.has(alloc.category) ? '▲' : '▼'} {alloc.category} — {alloc.alternatives.length} alternative{alloc.alternatives.length > 1 ? 's' : ''}
                </button>
                {openAlts.has(alloc.category) && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="alt-table">
                      <thead>
                        <tr>
                          <th>Product</th><th>Brand</th><th>Price</th>
                          <th>Rating</th><th>Adj. Rating</th><th>Cruelty-Free</th><th>Origin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alloc.alternatives.map((alt, i) => (
                          <tr key={i}>
                            <td style={{ maxWidth: 160, wordBreak: 'break-word' }}>{alt.product_name}</td>
                            <td>{alt.brand}</td>
                            <td>${alt.price_usd.toFixed(2)}</td>
                            <td>{alt.rating.toFixed(1)}</td>
                            <td><span className="score-badge">{alt.adjusted_rating.toFixed(2)}</span></td>
                            <td>{alt.cruelty_free ? 'Yes' : 'No'}</td>
                            <td>{alt.country_of_origin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null
          )}

          {/* B2B framing note */}
          <div className="portfolio-note">
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '0.3rem' }}>
              About this feature
            </strong>
            The Portfolio Optimizer is a decision-support tool, not a predictive ML model.
            It applies Bayesian-adjusted ratings and strategy-specific scoring to benchmark
            products from the dataset, helping product managers compare category combinations
            and pricing positions. Selections represent dataset benchmarks that match the
            chosen strategy and constraints — not purchase recommendations or demand forecasts.
            The adjusted rating formula (weighted average of individual rating and global mean,
            scaled by review volume) reduces noise from low-review products and surfaces
            commercially credible options.
          </div>
        </div>
      )}
    </div>
  )
}

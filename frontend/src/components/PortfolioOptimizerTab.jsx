import React, { useState, useEffect } from 'react'
import { api } from '../api.js'
import CategoryImage from './CategoryImage.jsx'

const STRATEGY_HINT = {
  maximize_rating:  'Select the highest Bayesian-adjusted rating and review confidence per category.',
  maximize_value:   'Select products with the best adjusted rating relative to their price.',
  premium:          'Prefer higher-priced, well-rated products — premium market positioning.',
  budget_friendly:  'Prefer lower-priced products with strong adjusted ratings — accessible positioning.',
}

const DEFAULT_STRATEGIES = [
  { value: 'maximize_rating',  label: 'Maximize Rating Potential' },
  { value: 'maximize_value',   label: 'Maximize Value-for-Price' },
  { value: 'premium',          label: 'Build Premium Portfolio' },
  { value: 'budget_friendly',  label: 'Build Budget-Friendly Portfolio' },
]

// ── Alternative label helpers ────────────────────────────────────────────────

function getAltLabel(alt, selected) {
  const cheaper    = alt.price_usd < selected.price_usd - 1
  const pricier    = alt.price_usd > selected.price_usd + 1
  const higherRate = alt.rating > selected.rating + 0.05
  if (cheaper && higherRate)  return 'Better value'
  if (cheaper)                return 'Cheaper option'
  if (higherRate && !pricier) return 'Higher-rated option'
  if (pricier && higherRate)  return 'Premium option'
  return 'Alternative option'
}

const ALT_LABEL_ORDER = {
  'Cheaper option': 0, 'Better value': 1,
  'Higher-rated option': 2, 'Premium option': 3, 'Alternative option': 4,
}

function getAltChipCls(label) {
  return {
    'Cheaper option':      'alt-chip-cheaper',
    'Better value':        'alt-chip-value',
    'Higher-rated option': 'alt-chip-higher',
    'Premium option':      'alt-chip-premium',
    'Alternative option':  'alt-chip-alt',
  }[label] ?? 'alt-chip-alt'
}

function sortAlternatives(alts, selected) {
  return [...alts].sort((a, b) => {
    const la = ALT_LABEL_ORDER[getAltLabel(a, selected)] ?? 4
    const lb = ALT_LABEL_ORDER[getAltLabel(b, selected)] ?? 4
    return la - lb
  })
}

// ── Portfolio totals calculator ──────────────────────────────────────────────

function calculatePortfolioTotals(portfolio, budget) {
  if (!portfolio.length) return { totalPrice: 0, remainingBudget: budget, isOverBudget: false, budgetUsedPercent: 0 }
  const totalPrice = portfolio.reduce((sum, e) => sum + e.selected.price_usd, 0)
  const remainingBudget = budget - totalPrice
  return {
    totalPrice,
    remainingBudget,
    isOverBudget: totalPrice > budget,
    budgetUsedPercent: budget > 0 ? (totalPrice / budget * 100) : 0,
  }
}

// ── Strategy badges ──────────────────────────────────────────────────────────

function getStrategyBadges(product, strategy) {
  const badges = []
  if (product.cruelty_free) badges.push({ label: 'Cruelty-Free', cls: 'strategy-badge-crueltyfree' })
  if (strategy === 'maximize_value' || strategy === 'budget_friendly') {
    badges.push(product.price_usd < 50
      ? { label: 'Budget-friendly', cls: 'strategy-badge-budget' }
      : { label: 'Best value',      cls: 'strategy-badge-bestvalue' })
  }
  if (strategy === 'premium')          badges.push({ label: 'Premium benchmark', cls: 'strategy-badge-premium' })
  if (strategy === 'maximize_rating')  badges.push({ label: 'Strong rating',     cls: 'strategy-badge-rating' })
  return badges
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PortfolioOptimizerTab() {
  const [options, setOptions]         = useState(null)
  const [form, setForm]               = useState({
    budget: '', strategy: 'maximize_rating', categories: [],
    skin_type: '', gender_target: '', cruelty_free_only: false,
    main_ingredient: '', country_of_origin: '',
  })
  const [result, setResult]           = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode]       = useState('cards')
  const [selectedPortfolio, setSelectedPortfolio] = useState([])

  useEffect(() => { api.portfolioOptions().then(setOptions).catch(() => {}) }, [])

  function toggleCategory(cat) {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.budget || form.categories.length === 0) {
      setError('Enter a budget and select at least one category.')
      return
    }
    setLoading(true); setError(null); setResult(null)
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
      setSelectedPortfolio(
        data.allocations.map(a => ({
          category:            a.category,
          selected:            { ...a.selected },
          alternatives:        sortAlternatives(a.alternatives, a.selected),
          originalSelected:    { ...a.selected },
          originalAlternatives: [...a.alternatives],
          whySelected:         a.why_selected,
        }))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function selectAlternative(category, alt) {
    setSelectedPortfolio(prev => prev.map(e => {
      if (e.category !== category) return e
      const oldSelected = e.selected
      const newAlts = sortAlternatives(
        [oldSelected, ...e.alternatives.filter(a => a.product_name !== alt.product_name)].slice(0, 3),
        alt
      )
      return { ...e, selected: { ...alt }, alternatives: newAlts }
    }))
  }

  function resetPortfolio() {
    setSelectedPortfolio(prev => prev.map(e => ({
      ...e,
      selected:     { ...e.originalSelected },
      alternatives: sortAlternatives(e.originalAlternatives, e.originalSelected),
    })))
  }

  const budget      = parseFloat(form.budget) || 0
  const totals      = result ? calculatePortfolioTotals(selectedPortfolio, budget) : null
  const isCustomized = selectedPortfolio.some(e => e.selected.product_name !== e.originalSelected.product_name)

  const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div>
      <div className="tab-header">
        <h2>Portfolio Optimizer</h2>
        <p>
          Plan or benchmark a product portfolio across target categories. This is a B2B
          decision-support tool for brand strategists and product managers — not a consumer
          shopping feature. Select categories, a total budget, and a positioning strategy.
          The optimizer recommends benchmark products from the dataset for each category.
          You can then swap individual products with alternatives to adjust the portfolio cost without re-running the optimizer.
        </p>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="field">
              <label className="label">Total Portfolio Budget (USD)</label>
              <input
                type="number" className="input" placeholder="e.g. 800"
                min="1" step="1" value={form.budget} required
                onChange={e => set('budget', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Positioning Strategy</label>
              <select className="input" value={form.strategy} onChange={e => set('strategy', e.target.value)}>
                {(options?.strategies ?? DEFAULT_STRATEGIES).map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontStyle: 'italic' }}>
            {STRATEGY_HINT[form.strategy]}
          </p>

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

          <div className="optional-filters">
            <button
              type="button" className="alt-toggle"
              style={{ marginBottom: filtersOpen ? '0.75rem' : 0 }}
              onClick={() => setFiltersOpen(p => !p)}
            >
              {filtersOpen ? '▲ Hide optional filters' : '▼ Optional filters — skin type, gender, ingredient, origin'}
            </button>

            {filtersOpen && (
              <div className="form-grid" style={{ marginTop: '0.75rem' }}>
                <div className="field">
                  <label className="label">Skin Type</label>
                  <select className="input" value={form.skin_type} onChange={e => set('skin_type', e.target.value)}>
                    <option value="">Any</option>
                    {(options?.skin_types ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Gender Target</label>
                  <select className="input" value={form.gender_target} onChange={e => set('gender_target', e.target.value)}>
                    <option value="">Any</option>
                    {(options?.gender_targets ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Main Ingredient</label>
                  <select className="input" value={form.main_ingredient} onChange={e => set('main_ingredient', e.target.value)}>
                    <option value="">Any</option>
                    {(options?.main_ingredients ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Country of Origin</label>
                  <select className="input" value={form.country_of_origin} onChange={e => set('country_of_origin', e.target.value)}>
                    <option value="">Any</option>
                    {(options?.countries ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                  <input
                    type="checkbox" id="cf_only_tab"
                    checked={form.cruelty_free_only}
                    onChange={e => set('cruelty_free_only', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                  />
                  <label htmlFor="cf_only_tab" style={{ cursor: 'pointer', fontSize: '0.875rem', userSelect: 'none' }}>
                    Cruelty-free products only
                  </label>
                </div>
              </div>
            )}
          </div>

          {error && <div className="error-box" style={{ marginTop: '1.25rem' }}>{error}</div>}

          <div className="portfolio-actions">
            <button
              type="submit"
              className="btn btn-primary optimize-button"
              disabled={loading || !form.budget || form.categories.length === 0}
            >
              {loading
                ? <><span className="spinner" style={{ marginRight: '0.5rem' }} />Optimizing&hellip;</>
                : 'Optimize Portfolio'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {result && totals && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="portfolio-sticky-bar">
            <h2>Portfolio Allocation — {result.strategy_label}</h2>

            {/* Live budget summary */}
            <div className={`portfolio-summary${totals.isOverBudget ? ' portfolio-summary--over' : ''}`}>
            {[
              {
                num:   `$${fmt(budget)}`,
                lbl:   'Budget',
                color: 'var(--secondary)',
              },
              {
                num:   `$${totals.totalPrice.toFixed(0)}`,
                lbl:   'Portfolio Cost',
                color: totals.isOverBudget ? 'var(--accent)' : 'var(--primary)',
              },
              {
                num:   `${totals.isOverBudget ? '−' : '+'}$${fmt(Math.abs(totals.remainingBudget))}`,
                lbl:   totals.isOverBudget ? 'Over Budget' : 'Remaining',
                color: totals.isOverBudget ? 'var(--accent)' : 'var(--success)',
              },
              {
                num:   <>{result.portfolio_score.toFixed(2)}<span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/5.0</span></>,
                lbl:   'Avg Adj. Rating',
              },
              { num: selectedPortfolio.length, lbl: 'Categories' },
            ].map(({ num, lbl, color }) => (
              <div key={lbl} className="port-stat">
                <div className="num" style={color ? { color } : {}}>{num}</div>
                <div className="lbl">{lbl}</div>
              </div>
            ))}
            </div>
          </div>{/* /portfolio-sticky-bar */}

          {/* Over-budget warning */}
          {totals.isOverBudget && (
            <div className="portfolio-warning">
              This custom selection is <strong>over budget by ${Math.abs(totals.remainingBudget).toFixed(2)}</strong>.
              Choose a cheaper alternative in one of the cards below, or increase the budget.
            </div>
          )}

          <div className="port-interpretation">{result.interpretation}</div>

          {result.warnings.map((w, i) => (
            <div key={i} className="portfolio-warning">{w}</div>
          ))}

          {/* Section header + controls */}
          <div className="portfolio-section-bar">
            <div className="section-title" style={{ margin: 0 }}>Recommended Portfolio</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {isCustomized && (
                <button className="port-reset-btn" onClick={resetPortfolio}>
                  ↺ Reset to recommended
                </button>
              )}
              <div className="view-toggle-bar" style={{ margin: 0 }}>
                <button
                  type="button"
                  className={`view-toggle-btn${viewMode === 'cards' ? ' active' : ''}`}
                  onClick={() => setViewMode('cards')}
                >
                  Cards
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn${viewMode === 'table' ? ' active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Cards view */}
          {viewMode === 'cards' && (
            <div className="portfolio-card-grid" style={{ alignItems: 'start' }}>
              {selectedPortfolio.map(entry => {
                const badges     = getStrategyBadges(entry.selected, form.strategy)
                const modified   = entry.selected.product_name !== entry.originalSelected.product_name

                return (
                  <div
                    key={entry.category}
                    className={`portfolio-alloc-card${modified ? ' portfolio-alloc-card--modified' : ''}`}
                  >
                    {/* Header */}
                    <div className="portfolio-alloc-header">
                      <div className="portfolio-alloc-image">
                        <CategoryImage category={entry.category} size={44} />
                      </div>
                      <div className="portfolio-alloc-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <div className="portfolio-alloc-category">{entry.category}</div>
                          <span className="port-selected-badge">
                            {modified ? 'Swapped' : 'Selected'}
                          </span>
                        </div>
                        <div className="portfolio-alloc-product">{entry.selected.product_name}</div>
                        <div className="portfolio-alloc-brand">{entry.selected.brand}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="portfolio-alloc-stats">
                      <div className="portfolio-alloc-stat">
                        <span className="val">${entry.selected.price_usd.toFixed(0)}</span>
                        <span className="lbl">Price</span>
                      </div>
                      <div className="portfolio-alloc-stat">
                        <span className="val">{entry.selected.rating.toFixed(1)}</span>
                        <span className="lbl">Rating</span>
                      </div>
                      <div className="portfolio-alloc-stat">
                        <span className="val">{entry.selected.adjusted_rating.toFixed(2)}</span>
                        <span className="lbl">Adj. Rating</span>
                      </div>
                      <div className="portfolio-alloc-stat">
                        <span className="val">{entry.selected.portfolio_score.toFixed(2)}</span>
                        <span className="lbl">Value Score</span>
                      </div>
                    </div>

                    {/* Why selected */}
                    {entry.whySelected && !modified && (
                      <p className="portfolio-alloc-why">{entry.whySelected}</p>
                    )}

                    {/* Strategy badges */}
                    {badges.length > 0 && (
                      <div className="portfolio-alloc-badges">
                        {badges.map(b => (
                          <span key={b.label} className={`strategy-badge ${b.cls}`}>{b.label}</span>
                        ))}
                      </div>
                    )}

                    {/* Alternatives */}
                    {entry.alternatives.length > 0 && (
                      <div className="portfolio-alts-section">
                        <div className="portfolio-alts-title">Alternative options</div>
                        <div className="portfolio-alts-hint">
                          Click to swap and update portfolio cost.
                        </div>
                        {entry.alternatives.map((alt, i) => {
                          const label    = getAltLabel(alt, entry.selected)
                          const chipCls  = getAltChipCls(label)
                          const priceDiff = alt.price_usd - entry.selected.price_usd
                          return (
                            <button
                              key={alt.product_name + i}
                              className="portfolio-alt-row"
                              onClick={() => selectAlternative(entry.category, alt)}
                              title={`Select ${alt.product_name}`}
                            >
                              <div className="portfolio-alt-info">
                                <div className="portfolio-alt-name">{alt.product_name}</div>
                                <div className="portfolio-alt-brand">{alt.brand}</div>
                              </div>
                              <div className="portfolio-alt-stats">
                                <span style={{
                                  fontWeight: 800,
                                  color: priceDiff > 0 ? '#C2415D' : priceDiff < 0 ? '#15803D' : 'var(--text)',
                                }}>
                                  ${alt.price_usd.toFixed(0)}
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                  ★ {alt.rating.toFixed(1)}
                                </span>
                              </div>
                              <span className={`alt-label-chip ${chipCls}`}>{label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Table view — reflects current selectedPortfolio */}
          {viewMode === 'table' && (
            <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
              <table className="port-table">
                <thead>
                  <tr>
                    <th>Category</th><th>Product</th><th>Brand</th>
                    <th>Price</th><th>Rating</th><th>Adj. Rating</th>
                    <th>Value Score</th><th>Reviews</th><th>Origin</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPortfolio.map(e => (
                    <tr key={e.category}>
                      <td><strong>{e.category}</strong></td>
                      <td style={{ maxWidth: 180, wordBreak: 'break-word' }}>
                        {e.selected.product_name}
                        {e.selected.product_name !== e.originalSelected.product_name && (
                          <span style={{ marginLeft: '0.4rem', fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700 }}>
                            (swapped)
                          </span>
                        )}
                      </td>
                      <td>{e.selected.brand}</td>
                      <td><strong>${e.selected.price_usd.toFixed(2)}</strong></td>
                      <td>{e.selected.rating.toFixed(1)}</td>
                      <td><span className="score-badge">{e.selected.adjusted_rating.toFixed(2)}</span></td>
                      <td>{e.selected.portfolio_score.toFixed(2)}</td>
                      <td>{e.selected.number_of_reviews.toLocaleString()}</td>
                      <td>{e.selected.country_of_origin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="portfolio-note">
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '0.3rem' }}>About this feature</strong>
            The Portfolio Optimizer recommends an initial portfolio based on the selected strategy, but you can manually
            swap any product with one of its alternatives. The app recalculates the total cost and remaining budget
            instantly, making the tool more interactive and realistic for decision support.
            This is not a new ML model — it is an interactive optimization and recommendation feature built on top
            of the dataset, using Bayesian-adjusted ratings and strategy-specific scoring.
          </div>
        </div>
      )}
    </div>
  )
}

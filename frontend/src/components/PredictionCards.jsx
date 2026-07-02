import React from 'react'

function ProbBar({ prob }) {
  const pct   = Math.round(prob * 100)
  const color = prob >= 0.65 ? '#2d9d5e' : prob >= 0.45 ? '#e9a818' : '#c0556a'
  return (
    <div className="prob-bar-wrap">
      <div className="prob-bar-bg">
        <div className="prob-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{pct}%</div>
    </div>
  )
}

function SegmentBadge({ segment }) {
  const cls = {
    'Budget':    'badge badge-budget',
    'Mid-range': 'badge badge-midrange',
    'Premium':   'badge badge-premium',
  }[segment] ?? 'badge'
  return <span className={cls}>{segment}</span>
}

export default function PredictionCards({ result }) {
  if (!result) return null
  const { rating, price } = result
  const ratingColor = rating.high_rating_probability >= 0.65
    ? 'var(--success)' : rating.high_rating_probability >= 0.45
    ? '#e9a818' : 'var(--primary)'

  return (
    <div>
      <div className="result-cards">
        {/* Rating card */}
        <div className={`result-card${rating.high_rating_prediction === 1 ? ' highlight' : ''}`}>
          <div className="label">High-Rating Probability</div>
          <div className="value" style={{ color: ratingColor }}>
            {Math.round(rating.high_rating_probability * 100)}%
          </div>
          <ProbBar prob={rating.high_rating_probability} />
          <div className="sub">
            {rating.high_rating_prediction === 1 ? 'Likely High-Rated' : 'Uncertain / Low'}
          </div>
        </div>

        {/* Price card */}
        <div className="result-card">
          <div className="label">Predicted Price</div>
          <div className="value color-primary">${price.predicted_price_usd.toFixed(2)}</div>
          <div className="sub"><SegmentBadge segment={price.price_segment} /></div>
          {price.category_average_price && (
            <div className="sub" style={{ marginTop: 5 }}>
              Category avg: ${price.category_average_price.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Interpretation row — stacks on mobile, side-by-side on desktop */}
      <div className="interp-grid">
        <div className="interp-box">
          <strong>Rating: </strong>{rating.interpretation}
        </div>
        <div className="interp-box">
          <strong>Price: </strong>{price.interpretation}
        </div>
      </div>
    </div>
  )
}

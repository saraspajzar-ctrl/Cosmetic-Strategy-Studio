import React from 'react'

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round">
    <path d="M10 2L12.06 7.17L17.61 7.53L13.33 11.08L14.7 16.47L10 13.5L5.3 16.47L6.67 11.08L2.39 7.53L7.94 7.17Z"/>
  </svg>
)
const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round">
    <path d="M3 5H11L16.5 10L11 15H3Z"/>
    <circle cx="7" cy="10" r="1.3" fill="currentColor" stroke="none"/>
  </svg>
)
const IconBars = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M3.5 16V10M9.5 16V5M15.5 16V2"/>
  </svg>
)
const IconGrid = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round">
    <rect x="2" y="2" width="7" height="7" rx="1.5"/>
    <rect x="11" y="2" width="7" height="7" rx="1.5"/>
    <rect x="2" y="11" width="7" height="7" rx="1.5"/>
    <rect x="11" y="11" width="7" height="7" rx="1.5"/>
  </svg>
)
const IconTrend = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 14.5L7 8.5L12 11.5L18 4"/>
    <path d="M15 4H18V7"/>
  </svg>
)
const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.5h10M9 4l3.5 3.5L9 11"/>
  </svg>
)

const FEATURES = [
  {
    id: 'success',
    title: 'Product Success Predictor',
    desc: 'Configure a planned product and get a probability estimate of whether it will be highly rated by consumers.',
    accent: '#B76E79',
    tag: 'Prediction',
    icon: <IconStar />,
  },
  {
    id: 'price',
    title: 'Price Predictor',
    desc: 'Estimate the expected retail price for a product configuration and see how it compares to the category average.',
    accent: '#7E6EA8',
    tag: 'Prediction',
    icon: <IconTag />,
  },
  {
    id: 'insights',
    title: 'Commercial Insights',
    desc: 'Explore category pricing patterns, rating distributions, feature drivers, and country-level benchmarks.',
    accent: '#4E8C78',
    tag: 'Analytics',
    icon: <IconBars />,
  },
  {
    id: 'portfolio',
    title: 'Portfolio Optimizer',
    desc: 'Select categories, a budget, and a positioning strategy to generate a benchmark product portfolio.',
    accent: '#C2823A',
    tag: 'Strategy',
    icon: <IconGrid />,
  },
  {
    id: 'performance',
    title: 'Model Performance',
    desc: 'Review classification and regression leaderboards, cross-validation scores, and honest dataset limitations.',
    accent: '#4A80B4',
    tag: 'ML Metrics',
    icon: <IconTrend />,
  },
]

function HeroIllustration() {
  return (
    <svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', maxWidth: 280, height: 'auto' }}>
      <ellipse cx="80" cy="110" rx="64" ry="72" fill="rgba(255,255,255,0.06)" />
      <ellipse cx="190" cy="90" rx="52" ry="64" fill="rgba(255,255,255,0.05)" />
      <rect x="44" y="56" width="38" height="86" rx="16" fill="#D4A4B0" />
      <rect x="55" y="34" width="16" height="28" rx="6" fill="#C98FA3" />
      <ellipse cx="63" cy="32" rx="10" ry="8" fill="#B76E79" />
      <rect x="47" y="70" width="6" height="24" rx="3" fill="rgba(255,255,255,0.25)" />
      <ellipse cx="130" cy="90" rx="32" ry="11" fill="#E8D0C0" />
      <path d="M98 90 L98 122 Q98 138 130 138 Q162 138 162 122 L162 90" fill="#D4B89A" />
      <ellipse cx="130" cy="90" rx="32" ry="11" fill="#C4A882" opacity="0.7" />
      <rect x="106" y="104" width="22" height="14" rx="5" fill="rgba(255,255,255,0.3)" />
      <rect x="192" y="112" width="24" height="36" rx="3" fill="#C98FA3" />
      <rect x="192" y="106" width="24" height="8" rx="1" fill="#B0849A" />
      <path d="M192 106 L192 80 Q192 62 204 60 Q216 62 216 80 L216 106 Z" fill="#C2415D" />
      <path d="M195 104 L195 80 Q195 66 202 63" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="48" r="3" fill="rgba(255,255,255,0.5)" />
      <circle cx="220" cy="52" r="2" fill="rgba(255,255,255,0.4)" />
      <circle cx="170" cy="152" r="2.5" fill="rgba(255,255,255,0.35)" />
      <circle cx="92" cy="148" r="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="240" cy="124" r="3.5" fill="rgba(255,255,255,0.2)" />
      <path d="M22 100 L28 108 L22 116 L16 108 Z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
      <path d="M243 76 L248 82 L243 88 L238 82 Z" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" />
    </svg>
  )
}


export default function WelcomeTab({ summary, onNavigate }) {
  const nCategories = summary
    ? (summary.n_categories ?? Object.keys(summary.category_averages ?? {}).length)
    : null

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="hero-section">
        <div className="hero-content">
          <h2 className="hero-heading">
            Plan smarter cosmetics products<br />with data-driven insights.
          </h2>
          <p className="hero-subtext">
            Cosmetic Strategy Studio helps product managers benchmark concepts,
            estimate rating potential, predict price positioning, and explore commercial
            opportunities — using machine-learning models trained on{' '}
            {summary
              ? <strong style={{ color: '#FFFFFF' }}>{summary.n_rows?.toLocaleString()} products</strong>
              : '15,000 products'
            }{' '}
            across{' '}
            {nCategories
              ? <strong style={{ color: '#FFFFFF' }}>{nCategories} categories</strong>
              : '24 categories'
            }.
          </p>

          {summary && (
            <div className="hero-stats">
              {[
                { val: summary.n_rows?.toLocaleString(), lbl: 'Products' },
                { val: nCategories, lbl: 'Categories' },
                { val: summary.n_brands, lbl: 'Brands' },
                { val: `$${summary.numeric_stats?.Price_USD?.mean}`, lbl: 'Avg Price' },
                { val: summary.numeric_stats?.Rating?.mean, lbl: 'Avg Rating' },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="hero-stat-item">
                  <div className="hero-stat-num">{val}</div>
                  <div className="hero-stat-lbl">{lbl}</div>
                </div>
              ))}
            </div>
          )}

          <div className="hero-cta-group">
            <a className="hero-btn hero-btn-primary" href="#discover">
              Explore tools
            </a>
          </div>
        </div>

        <div className="hero-image-card">
          <HeroIllustration />
        </div>
      </div>

      {/* ── Feature cards ─────────────────────────────────────────── */}
      <p id="discover" style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.875rem',
        scrollMarginTop: '1.5rem',
      }}>
        Where you can discover
      </p>
      <div className="welcome-grid">
        {FEATURES.map(f => (
          <button
            key={f.id}
            className="welcome-card"
            onClick={() => onNavigate(f.id)}
            style={{ '--accent': f.accent }}
          >
            <div
              className="welcome-card-icon"
              style={{ color: f.accent, background: f.accent + '18', border: `1px solid ${f.accent}30` }}
            >
              {f.icon}
            </div>
            <strong className="welcome-card-title">{f.title}</strong>
            <p className="welcome-card-desc">{f.desc}</p>
            <div className="welcome-card-footer">
              <span
                className="welcome-card-tag"
                style={{ color: f.accent, background: f.accent + '12', borderColor: f.accent + '35' }}
              >
                {f.tag}
              </span>
              <span className="welcome-card-arrow" style={{ color: f.accent }}>
                <ArrowRight />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

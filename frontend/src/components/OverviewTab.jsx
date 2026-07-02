import React from 'react'

const RESEARCH_QUESTIONS = [
  {
    num: '01',
    title: 'Predict high consumer ratings',
    desc: 'Can we predict whether a planned product configuration will achieve a high consumer rating? Test a configuration in the Product Success Predictor tab.',
  },
  {
    num: '02',
    title: 'Predict retail price',
    desc: 'Can we predict the expected market price for a given product configuration? Estimate price positioning in the Price Predictor tab.',
  },
  {
    num: '03',
    title: 'Plan a competitive portfolio',
    desc: 'Which category combinations and price positions look commercially attractive? Benchmark a portfolio in the Portfolio Optimizer tab.',
  },
]

const TAB_GUIDE = [
  {
    tab: 'Product Success Predictor',
    desc: 'Input a product configuration and receive a probability estimate of whether it will be highly rated, with top predictive features.',
  },
  {
    tab: 'Price Predictor',
    desc: 'Input a product configuration and receive an estimated retail price compared against the category average.',
  },
  {
    tab: 'Commercial Insights',
    desc: 'Explore dataset-level charts on category pricing, rating distributions, country comparisons, and model feature drivers.',
  },
  {
    tab: 'Portfolio Optimizer',
    desc: 'Select product categories and a positioning strategy to generate a benchmark portfolio within a target total budget.',
  },
  {
    tab: 'Model Performance',
    desc: 'Review classification and regression leaderboard results, cross-validation scores, and honest dataset limitations.',
  },
]

export default function OverviewTab({ summary, apiStatus }) {
  const statusOk = apiStatus?.status === 'ok'
  const nCategories = summary
    ? (summary.n_categories ?? Object.keys(summary.category_averages ?? {}).length)
    : null

  return (
    <div>
      <div className="status-bar">
        <span className={statusOk ? 'status-ok' : 'status-err'} />
        {apiStatus
          ? statusOk ? 'Backend connected — models loaded' : `Backend: ${apiStatus.status}`
          : 'Connecting to backend…'}
      </div>

      <div className="tab-header">
        <h2>Beauty Product Intelligence App</h2>
        <p>
          A decision-support analytics platform for cosmetics brands and product managers.
          Built on a dataset of 15,000 cosmetics products, this tool applies machine-learning
          models to support product configuration, price positioning, and portfolio planning.
          It is intended to inform strategy, not replace expert judgment.
        </p>
      </div>

      {/* Research questions */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>Research Questions</h3>
        <div className="questions-grid">
          {RESEARCH_QUESTIONS.map(q => (
            <div key={q.num} className="question-card">
              <div className="q-number">{q.num}</div>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--secondary)', fontSize: '0.88rem' }}>
                  {q.title}
                </strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {q.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset stats */}
      {summary && (
        <>
          <div style={{ fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Dataset Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { num: summary.n_rows?.toLocaleString(), lbl: 'Products' },
              { num: nCategories, lbl: 'Categories' },
              { num: summary.n_brands ?? '—', lbl: 'Brands' },
              { num: summary.numeric_stats?.Rating?.mean, lbl: 'Avg Rating' },
              { num: `$${summary.numeric_stats?.Price_USD?.mean}`, lbl: 'Avg Price' },
            ].map(({ num, lbl }) => (
              <div key={lbl} className="stat-box">
                <div className="num">{num}</div>
                <div className="lbl">{lbl}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tab guide */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>How to Use This App</h3>
        <div style={{ display: 'grid', gap: '0.875rem' }}>
          {TAB_GUIDE.map(t => (
            <div key={t.tab} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0, width: '7px', height: '7px',
                borderRadius: '50%', background: 'var(--primary)', marginTop: '0.45rem',
              }} />
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{t.tab}</strong>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                  &mdash; {t.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

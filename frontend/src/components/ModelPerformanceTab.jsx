import React from 'react'
import LeaderboardTable from './LeaderboardTable.jsx'
import { cleanFeatureName } from '../featureLabels.js'

const LIMITATIONS = [
  {
    title: 'Synthetic dataset',
    body: 'The training data shows characteristics of a synthetically generated dataset: all pairwise numeric correlations are below 0.01, rating averages are near-identical across all 24 categories, and model performance across all algorithms is near the random baseline. The ML pipeline architecture is correct and leakage-safe, but the data contains no learnable signal.',
  },
  {
    title: 'Classification near random baseline',
    body: 'The best classifier achieves a ROC-AUC near 0.50–0.53, which is essentially random. This confirms that the target variable (High_Rating) cannot be predicted from the available product attributes in this dataset.',
  },
  {
    title: 'Regression near random baseline',
    body: 'The best regression model achieves R² near 0 and MAE/RMSE close to the DummyRegressor. This confirms that product price cannot be reliably predicted from the available features in this dataset.',
  },
  {
    title: 'Correlation is not causation',
    body: 'Even on real data, feature importance scores and prediction probabilities reflect statistical association, not causation. A high-rating probability for a given configuration does not mean that configuration causes a high rating.',
  },
  {
    title: 'Model should support, not replace, expert judgment',
    body: 'All model outputs are decision-support signals to be weighed alongside domain expertise, market research, and business constraints. They should not be used as the sole basis for product or investment decisions.',
  },
]

function FeatureBar({ feature, importance, maxVal }) {
  const pct = maxVal > 0 ? (importance / maxVal) * 100 : 0
  return (
    <div className="fi-row">
      <span className="fi-name" title={feature}>{cleanFeatureName(feature)}</span>
      <div className="fi-bar-bg">
        <div className="fi-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="fi-val">{importance.toFixed(4)}</span>
    </div>
  )
}

function DriverSection({ title, features }) {
  if (!features?.length) return null
  const top = features.slice(0, 10)
  const maxVal = top[0]?.importance ?? 1
  return (
    <div>
      <div style={{
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem',
      }}>
        {title}
      </div>
      {top.map(f => (
        <FeatureBar key={f.feature} feature={f.feature} importance={f.importance} maxVal={maxVal} />
      ))}
    </div>
  )
}

function GlobalDrivers({ metadata }) {
  const clfFeatures = metadata?.classifier?.feature_importances
  const regFeatures = metadata?.regressor?.feature_importances
  if (!clfFeatures?.length && !regFeatures?.length) return null

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '0.4rem', fontSize: '0.95rem', fontWeight: 700 }}>
        Overall Model Drivers
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        These are the features each model generally weights most when making predictions — not
        the exact drivers of any individual result.
      </p>
      <div className="grid-2" style={{ gap: '1.5rem' }}>
        <DriverSection title="Key Drivers of Price Prediction" features={regFeatures} />
        <DriverSection title="Key Drivers of Rating Potential" features={clfFeatures} />
      </div>
      <p style={{
        marginTop: '1rem', fontSize: '0.74rem',
        color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5,
      }}>
        Note: These are overall model-level importance rankings, not explanations for one individual prediction.
      </p>
    </div>
  )
}

export default function ModelPerformanceTab({ leaderboard, metadata }) {
  return (
    <div>
      <div className="tab-header">
        <h2>Model Performance</h2>
        <p>
          Transparent evaluation of the classification and regression models.
          All models are compared against a random baseline (DummyClassifier / DummyRegressor)
          using held-out test data and 5-fold cross-validation.
        </p>
      </div>

      <GlobalDrivers metadata={metadata} />

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>Model Leaderboard</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.5 }}>
          * marks the selected model based on cross-validation performance.
          The test metrics show final out-of-sample performance and may differ from the CV ranking.
          Overfit gap = train score minus test score (lower is better).
        </p>
        <LeaderboardTable leaderboard={leaderboard} />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>Honest Limitations</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {LIMITATIONS.map((lim, i) => (
            <div key={i} style={{
              borderLeft: '3px solid var(--accent)',
              paddingLeft: '1rem',
              paddingTop: '0.2rem',
              paddingBottom: '0.2rem',
            }}>
              <strong style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--secondary)', fontSize: '0.88rem' }}>
                {lim.title}
              </strong>
              <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {lim.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '1.5rem', padding: '0.875rem 1rem',
          background: 'var(--bg)', borderRadius: '6px',
          borderTop: '2px solid var(--border)',
          fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.65,
        }}>
          <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '0.3rem' }}>
            About the Portfolio Optimizer feature
          </strong>
          The Portfolio Optimizer is a decision-support tool, not a predictive ML model. It applies
          Bayesian-adjusted ratings and strategy-specific scoring rules to benchmark products from the
          dataset, helping product managers compare category combinations and pricing positions. It adds
          practical business value independent of model predictive accuracy — the value comes from the
          structured decision framework and dataset coverage, not from the ML predictions.
        </div>
      </div>
    </div>
  )
}

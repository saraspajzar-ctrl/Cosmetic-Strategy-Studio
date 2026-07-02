import React, { useState } from 'react'

function ClassificationTable({ rows }) {
  if (!rows?.length) return <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No data loaded yet.</p>
  const best = rows.reduce((a, b) => ((b.cv_roc_mean || 0) > (a.cv_roc_mean || 0) ? b : a), rows[0])
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>ROC-AUC</th>
            <th>F1</th>
            <th>Accuracy</th>
            <th>CV ROC (±std)</th>
            <th>Overfit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.model} className={r.model === best.model ? 'best-row' : ''}>
              <td>{r.model}{r.model === best.model ? ' *' : ''}</td>
              <td>{r.test_roc_auc?.toFixed(4) ?? '—'}</td>
              <td>{r.test_f1?.toFixed(4) ?? '—'}</td>
              <td>{r.test_accuracy?.toFixed(4) ?? '—'}</td>
              <td>{r.cv_roc_mean != null ? `${r.cv_roc_mean.toFixed(3)} ±${r.cv_roc_std?.toFixed(3)}` : '—'}</td>
              <td style={{ color: Math.abs(r.overfit_gap || 0) > 0.05 ? 'var(--primary)' : 'var(--success)' }}>
                {r.overfit_gap?.toFixed(4) ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RegressionTable({ rows }) {
  if (!rows?.length) return <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No data loaded yet.</p>
  const mainRows = rows.filter(r => !r.variant || r.variant === 'no_rating')
  const best = mainRows.reduce((a, b) => ((b.cv_r2_mean || 0) > (a.cv_r2_mean || 0) ? b : a), mainRows[0])
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Variant</th>
            <th>R²</th>
            <th>MAE</th>
            <th>RMSE</th>
            <th>CV R² (±std)</th>
            <th>Overfit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={`${r.model}-${r.variant}-${i}`}
              className={r.model === best.model && r.variant === 'no_rating' ? 'best-row' : ''}
            >
              <td>{r.model}{r.model === best.model && r.variant === 'no_rating' ? ' *' : ''}</td>
              <td><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.variant || 'no_rating'}</span></td>
              <td>{r.test_r2?.toFixed(4) ?? '—'}</td>
              <td>{r.test_mae?.toFixed(2) ?? '—'}</td>
              <td>{r.test_rmse?.toFixed(2) ?? '—'}</td>
              <td>{r.cv_r2_mean != null ? `${r.cv_r2_mean.toFixed(3)} ±${r.cv_r2_std?.toFixed(3)}` : '—'}</td>
              <td style={{ color: Math.abs(r.overfit_gap || 0) > 0.05 ? 'var(--primary)' : 'var(--success)' }}>
                {r.overfit_gap?.toFixed(4) ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function LeaderboardTable({ leaderboard }) {
  const [tab, setTab] = useState('classification')
  if (!leaderboard) return null

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['classification', 'regression'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn-tab${tab === t ? ' active' : ''}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'classification'
        ? <ClassificationTable rows={leaderboard.classification} />
        : <RegressionTable     rows={leaderboard.regression} />
      }
    </div>
  )
}

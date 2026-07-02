import React from 'react'

export default function ChartCard({ title, subtitle, children, takeaway, insight, note, style }) {
  return (
    <div className="card chart-card" style={style}>
      {title && (
        <h3 style={{ marginBottom: subtitle ? '0.3rem' : '0.75rem', fontSize: '0.93rem', fontWeight: 700 }}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {subtitle}
        </p>
      )}
      <div className="chart-body">{children}</div>
      {takeaway && (
        <div style={{
          margin: '0.875rem 0 0',
          padding: '0.6rem 0.875rem',
          background: 'var(--primary-light)',
          borderRadius: '6px',
        }}>
          <span style={{
            display: 'block',
            fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '0.2rem',
          }}>
            Key takeaway
          </span>
          <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
            {takeaway}
          </span>
        </div>
      )}
      {insight && (
        <p style={{
          margin: '0.625rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)',
          lineHeight: 1.55,
          borderTop: takeaway ? 'none' : '1px solid var(--border)',
          paddingTop: takeaway ? '0' : '0.5rem',
        }}>
          {insight}
        </p>
      )}
      {note && (
        <p style={{
          margin: '0.5rem 0 0', fontSize: '0.74rem',
          color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5,
        }}>
          {note}
        </p>
      )}
    </div>
  )
}

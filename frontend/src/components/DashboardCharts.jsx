import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#89023E', '#36453B', '#CC7178', '#917C78', '#5A3E36', '#C4A882']

function FeatureImportanceChart({ importances, title }) {
  if (!importances?.length) return null
  const max = Math.max(...importances.map(f => f.importance))
  return (
    <div>
      <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>{title}</h3>
      {importances.slice(0, 10).map(f => (
        <div className="fi-row" key={f.feature}>
          <div className="fi-name" title={f.feature}>{f.feature}</div>
          <div className="fi-bar-bg">
            <div className="fi-bar-fill" style={{ width: `${(f.importance / max) * 100}%` }} />
          </div>
          <div className="fi-val">{f.importance.toFixed(4)}</div>
        </div>
      ))}
    </div>
  )
}

function PriceSegmentPie({ dist }) {
  if (!dist) return null
  const data = Object.entries(dist).map(([name, value]) => ({ name, value }))
  return (
    <div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Price Segment Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%" cy="50%"
            outerRadius={70}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function CategoryPriceChart({ catAvg }) {
  if (!catAvg) return null
  const data = Object.entries(catAvg)
    .map(([cat, vals]) => ({ cat: cat.length > 10 ? cat.slice(0, 10) + '…' : cat, price: vals.Price_USD }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 10)
  return (
    <div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Avg Price by Category (Top 10)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 45, left: 5 }}>
          <XAxis dataKey="cat" angle={-35} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
          <YAxis tick={{ fontSize: 10 }} unit="$" width={40} />
          <Tooltip formatter={v => `$${v.toFixed(2)}`} />
          <Bar dataKey="price" fill="#89023E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DashboardCharts({ summary, metadata }) {
  if (!summary && !metadata) return null

  const clfImportances = metadata?.classifier?.feature_importances
  const regImportances = metadata?.regressor?.feature_importances

  return (
    <div>
      {/* Pie + bar — uses CSS chart-grid-2 (1-col mobile, 2-col desktop) */}
      <div className="chart-grid-2">
        {summary?.price_segment_distribution && (
          <div className="card">
            <PriceSegmentPie dist={summary.price_segment_distribution} />
          </div>
        )}
        {summary?.category_averages && (
          <div className="card">
            <CategoryPriceChart catAvg={summary.category_averages} />
          </div>
        )}
      </div>

      {/* Feature importance — uses CSS insight-grid (1-col mobile, 2-col desktop) */}
      {(clfImportances?.length > 0 || regImportances?.length > 0) && (
        <div className="insight-grid">
          {clfImportances?.length > 0 && (
            <div className="card">
              <FeatureImportanceChart importances={clfImportances} title="Rating Model — Top Features" />
            </div>
          )}
          {regImportances?.length > 0 && (
            <div className="card">
              <FeatureImportanceChart importances={regImportances} title="Price Model — Top Features" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

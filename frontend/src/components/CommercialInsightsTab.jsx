import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, LabelList,
} from 'recharts'
import ChartCard from './ChartCard.jsx'
import { cleanFeatureName } from '../featureLabels.js'

const COLORS = ['#B76E79', '#2F2430', '#6F5D66', '#C2415D', '#D97706', '#15803D', '#7C3AED', '#0891B2']

const FEATURE_NOTE = 'Note: These are overall model-level importance rankings, not explanations for one individual prediction.'

function FeatureImportanceBars({ importances }) {
  if (!importances?.length) return null
  const max = Math.max(...importances.map(f => f.importance))
  return (
    <div>
      {importances.slice(0, 8).map(f => {
        const label = cleanFeatureName(f.feature)
        return (
          <div className="fi-row" key={f.feature}>
            <div className="fi-name" title={label}>{label}</div>
            <div className="fi-bar-bg">
              <div className="fi-bar-fill" style={{ width: `${(f.importance / max) * 100}%` }} />
            </div>
            <div className="fi-val">{f.importance.toFixed(4)}</div>
          </div>
        )
      })}
    </div>
  )
}

const CATEGORY_NOTE = 'Category differences are relatively small in this dataset, so these charts should be read as directional benchmarks rather than strong market conclusions.'

function CrueltyFreeComparison({ data }) {
  if (!data?.length) return null

  const cf  = data.find(d => d.label === 'Cruelty-Free')
  const ncf = data.find(d => d.label === 'Not Cruelty-Free')
  if (!cf || !ncf) return null

  const diff    = cf.rating - ncf.rating
  const absDiff = Math.abs(diff)
  const diffStr = (diff >= 0 ? '+' : '') + diff.toFixed(2)
  const meaning = absDiff < 0.05
    ? 'No meaningful difference'
    : diff > 0 ? 'Cruelty-free rates slightly higher' : 'Not cruelty-free rates slightly higher'

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '0.5rem 0 0.875rem' }}>
        {[ncf, cf].map(d => (
          <div key={d.label} style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1.1rem 0.875rem',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem',
            }}>
              {d.label}
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--secondary)', lineHeight: 1.1 }}>
              {d.rating.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              out of 5
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem 0.625rem',
        padding: '0.55rem 0.875rem',
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: '6px', fontSize: '0.84rem',
      }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Difference:</span>
        <span style={{ fontWeight: 700, color: absDiff < 0.05 ? 'var(--text-muted)' : 'var(--primary)' }}>
          {diffStr}
        </span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span style={{ color: 'var(--text)', fontStyle: 'italic', fontWeight: 500 }}>{meaning}</span>
      </div>
    </div>
  )
}

function CategoryRankedChart({ data, dataKey, color, valueFormatter, tickFormatter, xDomain }) {
  const [showAll, setShowAll] = useState(false)
  const MAX = 12
  const displayed = showAll ? data : data.slice(0, MAX)
  const hasMore = data.length > MAX
  const chartHeight = displayed.length * 34 + 10

  return (
    <div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={displayed}
          margin={{ top: 4, right: 68, bottom: 4, left: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            domain={xDomain || [0, 'dataMax']}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickFormatter={tickFormatter}
          />
          <YAxis
            type="category"
            dataKey="cat"
            tick={{ fontSize: 11, fill: 'var(--text)' }}
            width={130}
          />
          <Tooltip
            formatter={(v, name, props) => [valueFormatter(v), props.payload?.cat]}
            contentStyle={{ fontSize: '0.82rem', border: '1px solid var(--border)', borderRadius: '6px' }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} maxBarSize={22}>
            <LabelList
              dataKey={dataKey}
              position="right"
              formatter={valueFormatter}
              style={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600, fontFamily: 'inherit' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {hasMore && (
        <button
          onClick={() => setShowAll(s => !s)}
          style={{
            background: 'none', border: 'none', color: 'var(--primary)',
            fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
            padding: '0.25rem 0', marginTop: '0.25rem',
            textDecoration: 'underline', fontFamily: 'inherit',
          }}
        >
          {showAll ? 'Show top 12 only' : `Show all ${data.length} categories →`}
        </button>
      )}
    </div>
  )
}

export default function CommercialInsightsTab({ summary, metadata }) {
  if (!summary && !metadata) {
    return (
      <div>
        <div className="tab-header"><h2>Commercial Insights</h2></div>
        <div className="card"><p style={{ color: 'var(--text-muted)' }}>Loading dataset insights…</p></div>
      </div>
    )
  }

  // Rating distribution (1–5 stars)
  const ratingDist = summary?.rating_distribution
    ? Object.entries(summary.rating_distribution)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map(([k, v]) => ({ star: `${k} Star`, count: v }))
    : []

  // Price segment pie
  const priceDist = summary?.price_segment_distribution
    ? Object.entries(summary.price_segment_distribution).map(([name, value]) => ({ name, value }))
    : []

  // Category averages — full names, no truncation (handled by the chart component)
  const catPriceData = summary?.category_averages
    ? Object.entries(summary.category_averages)
        .map(([cat, v]) => ({ cat, price: v.Price_USD }))
        .sort((a, b) => b.price - a.price)
    : []

  const catRatingData = summary?.category_averages
    ? Object.entries(summary.category_averages)
        .map(([cat, v]) => ({ cat, rating: v.Rating }))
        .sort((a, b) => b.rating - a.rating)
    : []

  // Country avg price
  const countryData = summary?.country_avg_price
    ? Object.entries(summary.country_avg_price)
        .map(([country, price]) => ({ country, price }))
        .sort((a, b) => b.price - a.price)
    : []

  // Rename to 'cat' so CategoryRankedChart can handle it generically
  const countryChartData = countryData.map(({ country, price }) => ({ cat: country, price }))

  // Cruelty-free avg rating
  const cfData = summary?.cruelty_free_avg_rating
    ? Object.entries(summary.cruelty_free_avg_rating)
        .map(([cf, rating]) => ({
          label: cf === 'True' ? 'Cruelty-Free' : 'Not Cruelty-Free',
          rating: parseFloat(rating.toFixed(3)),
        }))
    : []

  const clfImportances = metadata?.classifier?.feature_importances
  const regImportances = metadata?.regressor?.feature_importances

  return (
    <div>
      <div className="tab-header">
        <h2>Commercial Insights</h2>
        <p>
          Dataset-level patterns to inform product strategy and category positioning.
          Charts reflect the full 15,000-product dataset. Written insights note where
          the synthetic origin of the data affects interpretation.
        </p>
      </div>

      {/* Row 1: Rating distribution + Price segments */}
      <div className="insight-grid">
        {ratingDist.length > 0 && (
          <ChartCard
            title="Rating Distribution"
            insight="Ratings are approximately uniformly distributed across 1–5 stars (mean 3.0/5.0). In real-world datasets, consumer ratings typically skew toward 4–5 stars. The flat distribution here is consistent with synthetic data generation."
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingDist} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
                <XAxis dataKey="star" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => v.toLocaleString()} />
                <Bar dataKey="count" fill="#B76E79" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {priceDist.length > 0 && (
          <ChartCard
            title="Price Segment Distribution"
            insight="Products are broadly spread across Budget (<$50), Mid-range ($50–$100), and Premium (>$100) tiers. Each segment represents a distinct positioning strategy for brand managers."
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={priceDist} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={70}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {priceDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Row 2: Avg price by category — horizontal ranked */}
      {catPriceData.length > 0 && (
        <ChartCard
          title="Average Price by Category"
          subtitle="Shows which categories are positioned at higher or lower average price points in the dataset."
          insight="In real markets, categories like Serum and Eye Cream tend to command premiums due to ingredient complexity and brand positioning. Use this chart as a directional benchmark for category-level pricing strategy."
          note={CATEGORY_NOTE}
          style={{ marginTop: '1rem' }}
        >
          <CategoryRankedChart
            data={catPriceData}
            dataKey="price"
            color="#6F5D66"
            valueFormatter={v => `$${v.toFixed(2)}`}
            tickFormatter={v => `$${Math.round(v)}`}
          />
        </ChartCard>
      )}

      {/* Row 3: Avg rating by category — horizontal ranked */}
      {catRatingData.length > 0 && (
        <ChartCard
          title="Average Rating by Category"
          subtitle="Shows which categories have stronger average consumer ratings in the dataset."
          insight="Average ratings are near-identical across all categories (all near 3.0 / 5.0). In real data you would expect meaningful variation by category. The flat pattern here reflects the synthetic dataset. For a more nuanced view, use the Portfolio Optimizer's Bayesian-adjusted rating metric."
          note={CATEGORY_NOTE}
          style={{ marginTop: '1rem' }}
        >
          <CategoryRankedChart
            data={catRatingData}
            dataKey="rating"
            color="#B76E79"
            valueFormatter={v => `${v.toFixed(2)} / 5`}
            tickFormatter={v => v.toFixed(1)}
            xDomain={[0, 5]}
          />
        </ChartCard>
      )}

      {/* Row 4: Country price + Cruelty-free — side by side, natural heights */}
      <div className="insight-grid" style={{ marginTop: '1rem', alignItems: 'start' }}>
        {countryChartData.length > 0 && (
          <ChartCard
            title="Price Benchmark by Country of Origin"
            subtitle="Shows average product price by origin country."
            takeaway="Average price differences are small across origin countries in this dataset."
            insight="In real markets, country of origin may still influence premium perception and brand positioning."
          >
            <CategoryRankedChart
              data={countryChartData}
              dataKey="price"
              color="#6F5D66"
              valueFormatter={v => `$${v.toFixed(2)}`}
              tickFormatter={v => `$${Math.round(v)}`}
            />
          </ChartCard>
        )}

        {cfData.length > 0 && (
          <ChartCard
            title="Rating by Cruelty-Free Status"
            subtitle="Compares average rating between cruelty-free and non-cruelty-free products."
            takeaway="Cruelty-free status does not meaningfully change average rating in this dataset."
            insight="In real markets, cruelty-free positioning may still strengthen brand perception even if the rating difference is not visible here."
          >
            <CrueltyFreeComparison data={cfData} />
          </ChartCard>
        )}
      </div>

      {/* Row 5: Feature importances */}
      {(clfImportances?.length > 0 || regImportances?.length > 0) && (
        <div className="insight-grid" style={{ marginTop: '1rem' }}>
          {clfImportances?.length > 0 && (
            <ChartCard
              title="Key Drivers of Rating Potential"
              insight="The rating model does not identify one overwhelmingly dominant feature. This suggests that rating potential in this dataset depends on a combination of product attributes rather than a single strong driver."
              note={FEATURE_NOTE}
            >
              <FeatureImportanceBars importances={clfImportances} />
            </ChartCard>
          )}
          {regImportances?.length > 0 && (
            <ChartCard
              title="Key Drivers of Price Prediction"
              insight="The price model suggests that brand and category-related attributes are among the most influential inputs, although the dataset provides only limited predictive strength. These drivers should be interpreted as directional signals rather than exact pricing rules."
              note={FEATURE_NOTE}
            >
              <FeatureImportanceBars importances={regImportances} />
            </ChartCard>
          )}
        </div>
      )}
    </div>
  )
}

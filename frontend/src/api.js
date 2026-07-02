const BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://cosmetic-strategy-studio.onrender.com' : '/api')

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${path}`, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

async function fetchStatic(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  // Health — backend only
  health: () => request('GET', '/health'),

  // Static data — served from /public/data/, never hits Render
  summary:     () => fetchStatic('/data/data_summary.json'),
  leaderboard: () => fetchStatic('/data/leaderboard.json'),
  metadata:    () => fetchStatic('/data/metadata.json'),

  // Dynamic predictions — backend only
  predictRating:     (product) => request('POST', '/predict/rating', product),
  predictPrice:      (product) => request('POST', '/predict/price', product),
  predictBoth:       (product) => request('POST', '/predict/both', product),
  portfolioOptions:  ()        => request('GET',  '/recommend/options'),
  portfolioOptimize: (req)     => request('POST', '/recommend/portfolio', req),
}

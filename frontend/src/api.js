const BASE_URL = import.meta.env.VITE_API_URL || '/api'

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

export const api = {
  health:      ()       => request('GET',  '/health'),
  summary:     ()       => request('GET',  '/data/summary'),
  leaderboard: ()       => request('GET',  '/models/leaderboard'),
  metadata:    ()       => request('GET',  '/metadata'),
  predictRating:     (product) => request('POST', '/predict/rating', product),
  predictPrice:      (product) => request('POST', '/predict/price', product),
  predictBoth:       (product) => request('POST', '/predict/both', product),
  portfolioOptions:  ()        => request('GET',  '/recommend/options'),
  portfolioOptimize: (req)     => request('POST', '/recommend/portfolio', req),
}

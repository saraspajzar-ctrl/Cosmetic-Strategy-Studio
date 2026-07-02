import React, { useState, useEffect } from 'react'
import { api } from './api.js'
import Tabs from './components/Tabs.jsx'
import WelcomeTab from './components/WelcomeTab.jsx'
import ProductSuccessTab from './components/ProductSuccessTab.jsx'
import PricePredictorTab from './components/PricePredictorTab.jsx'
import CommercialInsightsTab from './components/CommercialInsightsTab.jsx'
import PortfolioOptimizerTab from './components/PortfolioOptimizerTab.jsx'
import ModelPerformanceTab from './components/ModelPerformanceTab.jsx'

const TABS = [
  { id: 'welcome',     label: 'Welcome' },
  { id: 'success',     label: 'Product Success Predictor' },
  { id: 'price',       label: 'Price Predictor' },
  { id: 'insights',    label: 'Commercial Insights' },
  { id: 'portfolio',   label: 'Portfolio Optimizer' },
  { id: 'performance', label: 'Model Performance' },
]

export default function App() {
  const [activeTab, setActiveTab]     = useState('welcome')
  const [summary, setSummary]         = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)
  const [metadata, setMetadata]       = useState(null)
  const [apiStatus, setApiStatus]     = useState(null)
  const [staticError, setStaticError] = useState(false)

  useEffect(() => {
    const loader = document.getElementById('site-loader')
    if (loader) {
      loader.classList.add('sl-exit')
      setTimeout(() => loader.remove(), 460)
    }
  }, [])

  function loadStaticData() {
    setStaticError(false)
    Promise.all([
      api.summary().then(setSummary),
      api.leaderboard().then(setLeaderboard),
      api.metadata().then(setMetadata),
    ]).catch(() => setStaticError(true))
    api.health().then(setApiStatus).catch(() => setApiStatus({ status: 'unreachable' }))
  }

  useEffect(() => { loadStaticData() }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <svg className="header-logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 4 L36 20 L20 36 L4 20 Z" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M20 11 L29 20 L20 29 L11 20 Z" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round"/>
            <circle cx="20" cy="20" r="2.5" fill="#FFFFFF"/>
          </svg>
          <div>
            <h1>Cosmetic Strategy Studio</h1>
            <p>Decision-support analytics for cosmetics brands and product managers.</p>
          </div>
        </div>
      </header>

      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="tab-content">
        {activeTab === 'welcome'     && <WelcomeTab summary={summary} onNavigate={setActiveTab} />}
        {activeTab === 'success'     && <ProductSuccessTab />}
        {activeTab === 'price'       && <PricePredictorTab />}
        {activeTab === 'insights'    && <CommercialInsightsTab summary={summary} metadata={metadata} error={staticError} onRetry={loadStaticData} />}
        {activeTab === 'portfolio'   && <PortfolioOptimizerTab />}
        {activeTab === 'performance' && <ModelPerformanceTab leaderboard={leaderboard} metadata={metadata} error={staticError} onRetry={loadStaticData} />}
      </main>

    </div>
  )
}

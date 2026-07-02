import React from 'react'

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tabs-nav-wrap">
      <nav className="tabs-nav" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

import React from 'react'

export default function RecommendationBox({ recommendation }) {
  if (!recommendation) return null
  return (
    <div className="rec-box section">
      <h3>Strategic Recommendation</h3>
      <p>{recommendation}</p>
    </div>
  )
}

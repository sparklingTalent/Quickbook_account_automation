import React from 'react'
import './SummaryCards.css'

function SummaryCards({ trends, employees }) {
  if (!trends || trends.length === 0) {
    return null
  }

  // Calculate summary statistics
  // Get the latest month (last item in trends array, as trends are sorted oldest first)
  const latest = trends[trends.length - 1] || {}
  const totalBudget = latest['Total Budget'] || 0
  const totalActual = latest['Total Actual'] || 0
  const totalVariance = latest['Total Variance'] || 0
  const variancePercent = latest['Variance %'] || 0

  // Calculate average variance over period
  const avgVariance =
    trends.reduce((sum, item) => sum + (item['Total Variance'] || 0), 0) /
    trends.length

  const avgVariancePercent =
    trends.reduce((sum, item) => sum + (item['Variance %'] || 0), 0) /
    trends.length

  const getVarianceColor = (variance) => {
    if (variance > 0) return '#ef4444'
    if (variance < 0) return '#10b981'
    return '#6b7280'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="card-icon">👥</div>
        <div className="card-content">
          <div className="card-label">Total Employees</div>
          <div className="card-value">{employees.length || 0}</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">💰</div>
        <div className="card-content">
          <div className="card-label">Total Budget</div>
          <div className="card-value">{formatCurrency(totalBudget)}</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">📊</div>
        <div className="card-content">
          <div className="card-label">Total Actual</div>
          <div className="card-value">{formatCurrency(totalActual)}</div>
        </div>
      </div>

      <div className="summary-card variance-card">
        <div className="card-icon">📈</div>
        <div className="card-content">
          <div className="card-label">Total Variance</div>
          <div
            className="card-value"
            style={{ color: getVarianceColor(totalVariance) }}
          >
            {formatCurrency(totalVariance)}
          </div>
          <div
            className="card-subvalue"
            style={{ color: getVarianceColor(totalVariance) }}
          >
            {variancePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">📉</div>
        <div className="card-content">
          <div className="card-label">Avg Variance ({trends.length} months)</div>
          <div
            className="card-value"
            style={{ color: getVarianceColor(avgVariance) }}
          >
            {formatCurrency(avgVariance)}
          </div>
          <div
            className="card-subvalue"
            style={{ color: getVarianceColor(avgVariance) }}
          >
            {avgVariancePercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryCards


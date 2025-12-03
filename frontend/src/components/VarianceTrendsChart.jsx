import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './VarianceTrendsChart.css'

function VarianceTrendsChart({ data }) {
  // Memoize chart data processing
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }
    return data.map((item) => ({
      month: item.Month,
      budget: item['Total Budget'],
      actual: item['Total Actual'],
      variance: item['Total Variance'],
      variancePercent: item['Variance %'],
    }))
  }, [data])

  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-empty">
        <p>No data available</p>
      </div>
    )
  }

  // Calculate colors based on variance
  const getVarianceColor = (variance) => {
    if (variance > 0) return '#ef4444' // Red for over budget
    if (variance < 0) return '#10b981' // Green for under budget
    return '#6b7280' // Gray for on budget
  }

  return (
    <div className="variance-trends-chart" data-chart="variance-trends">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="month"
            stroke="#666"
            tick={{ fill: '#666' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#666"
            tick={{ fill: '#666' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'variancePercent') {
                return [`${value.toFixed(2)}%`, 'Variance %']
              }
              return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="budget"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Budget"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="variance"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            name="Variance"
          />
        </LineChart>
      </ResponsiveContainer>

      <ChartSummary chartData={chartData} />
    </div>
  )
}

// Memoized summary component
const ChartSummary = React.memo(({ chartData }) => {
  const avgVariance = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.variance, 0) / chartData.length
  }, [chartData])

  const avgVariancePercent = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.variancePercent, 0) / chartData.length
  }, [chartData])

  const getVarianceColor = (variance) => {
    if (variance > 0) return '#ef4444'
    if (variance < 0) return '#10b981'
    return '#6b7280'
  }

  return (
    <div className="chart-summary">
      <div className="summary-item">
        <span className="summary-label">Average Variance:</span>
        <span
          className="summary-value"
          style={{ color: getVarianceColor(avgVariance) }}
        >
          {avgVariance.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}
        </span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Average Variance %:</span>
        <span
          className="summary-value"
          style={{ color: getVarianceColor(avgVariance) }}
        >
          {avgVariancePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  )
})

export default VarianceTrendsChart


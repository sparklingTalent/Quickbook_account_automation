import React from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './MonthlyComparison.css'

function MonthlyComparison({ trends }) {
  if (!trends || trends.length === 0) {
    return (
      <div className="chart-empty">
        <p>No trend data available</p>
      </div>
    )
  }

  // Format data for chart
  const chartData = trends.map((item) => ({
    month: item.Month,
    budget: item['Total Budget'],
    actual: item['Total Actual'],
    variance: item['Total Variance'],
    variancePercent: item['Variance %'],
  }))

  return (
    <div className="monthly-comparison" data-chart="monthly-comparison">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="month"
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            stroke="#666"
            tick={{ fill: '#666' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#666"
            tick={{ fill: '#666' }}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'variancePercent') {
                return [`${value.toFixed(2)}%`, 'Variance %']
              }
              return [
                `$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                name,
              ]
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="budget"
            fill="#3b82f6"
            name="Budget"
            opacity={0.7}
          />
          <Bar
            yAxisId="left"
            dataKey="actual"
            fill="#8b5cf6"
            name="Actual"
            opacity={0.7}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="variancePercent"
            stroke="#ef4444"
            strokeWidth={2}
            name="Variance %"
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MonthlyComparison


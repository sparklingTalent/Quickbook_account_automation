import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './DepartmentBreakdown.css'

function DepartmentBreakdown({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No department data available</p>
      </div>
    )
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    department: item.Department || 'N/A',
    budget: item.Budget,
    actual: item.Actual,
    variance: item.Variance,
    variancePercent: item['Variance %'],
  }))

  return (
    <div className="department-breakdown" data-chart="department-breakdown">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="department"
            stroke="#666"
            tick={{ fill: '#666' }}
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
          <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
          <Bar dataKey="actual" fill="#8b5cf6" name="Actual" />
        </BarChart>
      </ResponsiveContainer>

      <div className="department-table">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Budget</th>
              <th>Actual</th>
              <th>Variance</th>
              <th>Variance %</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item, index) => (
              <tr key={index}>
                <td className="dept-name">{item.department}</td>
                <td>${item.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${item.actual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td
                  className={
                    item.variance > 0
                      ? 'variance-over'
                      : item.variance < 0
                      ? 'variance-under'
                      : 'variance-on'
                  }
                >
                  ${item.variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td
                  className={
                    item.variancePercent > 0
                      ? 'variance-over'
                      : item.variancePercent < 0
                      ? 'variance-under'
                      : 'variance-on'
                  }
                >
                  {item.variancePercent.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DepartmentBreakdown


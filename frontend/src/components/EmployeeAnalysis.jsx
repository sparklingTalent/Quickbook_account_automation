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
import './EmployeeAnalysis.css'

function EmployeeAnalysis({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No employee data available</p>
      </div>
    )
  }

  // Filter out department totals
  const employeeData = data.filter(
    (item) => item['Employee ID'] && !item['Employee Name'].includes('DEPARTMENT TOTAL')
  )

  // Sort by variance (highest first)
  const sortedData = [...employeeData].sort((a, b) => b.Variance - a.Variance)

  // Format for chart
  const chartData = sortedData.map((item) => ({
    name: item['Employee Name'],
    department: item.Department,
    budget: item.Budget,
    actual: item.Actual,
    variance: item.Variance,
    variancePercent: item['Variance %'],
  }))

  return (
    <div className="employee-analysis">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={120}
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
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
          <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
          <Bar dataKey="actual" fill="#8b5cf6" name="Actual" />
        </BarChart>
      </ResponsiveContainer>

      <div className="employee-table">
        <h3>Employee Variance Details</h3>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Budget</th>
              <th>Actual</th>
              <th>Variance</th>
              <th>Variance %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={index}>
                <td className="emp-name">{item['Employee Name']}</td>
                <td>{item.Department}</td>
                <td>${item.Budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${item.Actual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td
                  className={
                    item.Variance > 0
                      ? 'variance-over'
                      : item.Variance < 0
                      ? 'variance-under'
                      : 'variance-on'
                  }
                >
                  ${item.Variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td
                  className={
                    item['Variance %'] > 0
                      ? 'variance-over'
                      : item['Variance %'] < 0
                      ? 'variance-under'
                      : 'variance-on'
                  }
                >
                  {item['Variance %'].toFixed(2)}%
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      item.Variance > 0
                        ? 'status-over'
                        : item.Variance < 0
                        ? 'status-under'
                        : 'status-on'
                    }`}
                  >
                    {item.Variance > 0
                      ? 'Over Budget'
                      : item.Variance < 0
                      ? 'Under Budget'
                      : 'On Budget'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EmployeeAnalysis


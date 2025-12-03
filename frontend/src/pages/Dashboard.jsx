import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { apiService } from '../services/api'
import VarianceTrendsChart from '../components/VarianceTrendsChart'
import DepartmentBreakdown from '../components/DepartmentBreakdown'
import EmployeeAnalysis from '../components/EmployeeAnalysis'
import MonthlyComparison from '../components/MonthlyComparison'
import SummaryCards from '../components/SummaryCards'
import PDFExportButton from '../components/PDFExportButton'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import './Dashboard.css'

function Dashboard() {
  const [trends, setTrends] = useState([])
  const [departmentData, setDepartmentData] = useState([])
  const [employeeData, setEmployeeData] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [months, setMonths] = useState(12)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    loadData()
  }, [months, selectedYear, selectedMonth])

  // Optimized: Use batch endpoint for faster loading
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use batch endpoint to get all data in one request
      const batchData = await apiService.getDashboardData(months, selectedYear, selectedMonth)

      setTrends(batchData.trends || [])
      setDepartmentData(batchData.department || [])
      setEmployeeData(batchData.report || [])
      setEmployees(batchData.employees || [])
    } catch (err) {
      console.error('Error loading data:', err)
      // Fallback to individual requests if batch fails
      try {
        const [trendsData, deptData, reportData, employeesData] = await Promise.all([
          apiService.getVarianceTrends(effectiveMonths, selectedYear, selectedMonth),
          apiService.getVarianceByDepartment(selectedYear, selectedMonth),
          apiService.generateVarianceReport(selectedYear, selectedMonth, 'json'),
          apiService.getEmployees(),
        ])

        setTrends(trendsData)
        setDepartmentData(deptData)
        setEmployeeData(reportData)
        setEmployees(employeesData)
      } catch (fallbackErr) {
        setError(fallbackErr.message || 'Failed to load data. Make sure the API server is running.')
      }
    } finally {
      setLoading(false)
    }
  }, [months, selectedYear, selectedMonth])

  const handleRefresh = useCallback(() => {
    loadData()
  }, [loadData])

  // Memoize expensive computations
  const memoizedTrends = useMemo(() => trends, [trends])
  const memoizedDepartmentData = useMemo(() => departmentData, [departmentData])
  const memoizedEmployeeData = useMemo(() => employeeData, [employeeData])

  if (loading) {
    return (
      <div className="dashboard-container">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <ErrorMessage message={error} onRetry={handleRefresh} />
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📊 QuickBooks Accounting Dashboard</h1>
          <p>Salary Variance Analysis & Historical Trends</p>
        </div>
        <div className="header-actions">
          <PDFExportButton
            trends={memoizedTrends}
            departmentData={memoizedDepartmentData}
            employeeData={memoizedEmployeeData}
            employees={employees}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            months={months}
          />
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄 Refresh
          </button>
        </div>
      </header>

      <div className="dashboard-controls">
        <div className="control-group">
          <label htmlFor="months">Historical Period:</label>
          <select
            id="months"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          >
            <option value={1}>Last 1 Month</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
            <option value={18}>Last 18 Months</option>
            <option value={24}>Last 24 Months</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="year">Year:</label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2022, 2023, 2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="month">Month:</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2024, month - 1).toLocaleString('default', {
                  month: 'long',
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard-content">
        <SummaryCards trends={memoizedTrends} employees={employees} />

        <div className="charts-section">
          <div className="chart-card full-width">
            <h2>Historical Variance Trends ({months} Months)</h2>
            <VarianceTrendsChart data={memoizedTrends} />
          </div>

          <div className="chart-card full-width">
            <h2>Monthly Budget vs Actual Comparison</h2>
            <MonthlyComparison trends={memoizedTrends} />
          </div>

          <div className="chart-card">
            <h2>Department Breakdown ({selectedYear}-{String(selectedMonth).padStart(2, '0')})</h2>
            <DepartmentBreakdown data={memoizedDepartmentData} />
          </div>

          <div className="chart-card full-width">
            <h2>Employee Analysis ({selectedYear}-{String(selectedMonth).padStart(2, '0')})</h2>
            <EmployeeAnalysis data={memoizedEmployeeData} />
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>QuickBooks Accounting Automation • Powered by FastAPI & React</p>
      </footer>
    </div>
  )
}

export default Dashboard


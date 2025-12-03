import React, { useRef, useState } from 'react'
import { generatePDFWithCharts } from '../utils/pdfGenerator'
import { apiService } from '../services/api'
import './PDFExportButton.css'

function PDFExportButton({
  trends,
  departmentData,
  employeeData,
  employees,
  selectedYear,
  selectedMonth,
  months,
  viewMode = 'historical',
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const chartRefs = useRef({})

  // Calculate summary data
  const summaryData = React.useMemo(() => {
    if (!trends || trends.length === 0) return null

    const latest = trends[trends.length - 1] || {}
    const employeeRows = employeeData?.filter(
      (item) => item['Employee ID'] && !item['Employee Name'].includes('DEPARTMENT TOTAL')
    ) || []

    return {
      totalEmployees: employees?.length || employeeRows.length || 0,
      totalBudget: latest['Total Budget'] || 0,
      totalActual: latest['Total Actual'] || 0,
      totalVariance: latest['Total Variance'] || 0,
      totalVariancePercent: latest['Variance %'] || 0,
      avgVariance:
        trends.reduce((sum, item) => sum + (item['Total Variance'] || 0), 0) / trends.length,
      avgVariancePercent:
        trends.reduce((sum, item) => sum + (item['Variance %'] || 0), 0) / trends.length,
    }
  }, [trends, employeeData, employees])

  const handleDownloadExcel = async () => {
    setIsGenerating(true)
    try {
      await apiService.downloadVarianceReportExcel(selectedYear, selectedMonth, viewMode, months)
    } catch (error) {
      console.error('Error downloading Excel:', error)
      alert(`Error downloading Excel file: ${error.message || 'Please try again.'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDFWithCharts = async () => {
    setIsGenerating(true)
    try {
      // Get ALL chart elements from DOM in the correct order (no scrolling, faster)
      const chartElements = []
      
      // Helper to find chart elements (no scrolling for speed)
      const findChart = (selector) => {
        return document.querySelector(selector)
      }
      
      // Find charts based on view mode
      if (viewMode === 'historical') {
        // Historical view: Summary Cards, Trends, Monthly Comparison, Department, Employee
        const summaryCards = findChart('.summary-cards')
        const trendsChart = findChart('.variance-trends-chart')
        const monthlyChart = findChart('.monthly-comparison')
        const deptChart = findChart('.department-breakdown')
        const employeeChart = findChart('.employee-analysis')
        
        if (summaryCards) {
          chartElements.push({ element: summaryCards, title: 'Summary Cards' })
        }
        if (trendsChart) {
          chartElements.push({ element: trendsChart, title: 'Historical Variance Trends' })
        }
        if (monthlyChart) {
          chartElements.push({ element: monthlyChart, title: 'Monthly Budget vs Actual Comparison' })
        }
        if (deptChart) {
          chartElements.push({ element: deptChart, title: 'Department Breakdown' })
        }
        if (employeeChart) {
          chartElements.push({ element: employeeChart, title: 'Employee Analysis' })
        }
      } else {
        // Single month view: Department, Employee, Monthly Summary (NO Summary Cards, NO Trends)
        const deptChart = findChart('.department-breakdown')
        const employeeChart = findChart('.employee-analysis')
        const monthlySummary = findChart('.single-month-summary')
        
        if (deptChart) {
          chartElements.push({ element: deptChart, title: 'Department Breakdown' })
        }
        if (employeeChart) {
          chartElements.push({ element: employeeChart, title: 'Employee Analysis' })
        }
        if (monthlySummary) {
          // Find the parent chart-card to capture the whole section
          const summaryCard = monthlySummary.closest('.chart-card')
          if (summaryCard) {
            chartElements.push({ element: summaryCard, title: 'Monthly Summary' })
          }
        }
      }

      console.log(`Found ${chartElements.length} chart elements to capture:`, 
        chartElements.map(c => c.title))

      if (chartElements.length === 0) {
        alert('No charts found to capture.')
        return
      }

      // Generate PDF with charts
      const pdf = await generatePDFWithCharts({
        chartElements,
        trends,
        departmentData,
        employeeData,
        summaryData,
        selectedYear,
        selectedMonth,
        months,
      })

      // Generate filename
      const filename = `Variance_Report_With_Charts_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.pdf`

      // Save PDF
      pdf.save(filename)
    } catch (error) {
      console.error('Error generating PDF with charts:', error)
      alert(`Error generating PDF with charts: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="pdf-export-container">
      <button
        className="pdf-export-btn pdf-export-btn-excel"
        onClick={handleDownloadExcel}
        disabled={isGenerating || !trends || trends.length === 0}
        title="Download Excel Report"
      >
        {isGenerating ? '⏳ Generating...' : '📊 Download Excel'}
      </button>
      <button
        className="pdf-export-btn pdf-export-btn-secondary"
        onClick={handleDownloadPDFWithCharts}
        disabled={isGenerating || !trends || trends.length === 0}
        title="Download PDF with Charts"
      >
        {isGenerating ? '⏳ Generating...' : '📊 PDF with Charts'}
      </button>
    </div>
  )
}

export default PDFExportButton


import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/health')
    return response.data
  },

  // Get employees
  async getEmployees() {
    const response = await api.get('/employees')
    return response.data.employees || []
  },

  // Get variance trends
  async getVarianceTrends(months = 12, endYear = null, endMonth = null) {
    let url = `/reports/variance/trends?months=${months}`
    if (endYear) {
      url += `&end_year=${endYear}`
    }
    if (endMonth) {
      url += `&end_month=${endMonth}`
    }
    const response = await api.get(url)
    return response.data || []
  },

  // Get variance by department
  async getVarianceByDepartment(year, month) {
    const response = await api.get(
      `/reports/variance/by-department?year=${year}&month=${month}`
    )
    return response.data || []
  },

  // Generate variance report
  async generateVarianceReport(year, month, format = 'json') {
    const response = await api.post('/reports/variance', {
      year,
      month,
      format,
    })
    return response.data
  },

  // Download variance report as Excel file
  async downloadVarianceReportExcel(year, month, viewMode = 'historical', months = 12) {
    const response = await api.post(
      '/reports/variance',
      {
        year,
        month,
        format: 'excel',
        view_mode: viewMode,
        months: months,
      },
      {
        responseType: 'blob', // Important for file downloads
      }
    )
    
    // Create blob URL and trigger download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `variance_report_${year}_${String(month).padStart(2, '0')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return true
  },

  // Batch endpoint - get all dashboard data in one request
  async getDashboardData(months, year, month) {
    const response = await api.get(`/batch/dashboard?months=${months}&year=${year}&month=${month}`)
    return response.data
  },
}

export default api


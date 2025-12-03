import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generate PDF report with all charts and data
 */
export async function generatePDFReport({
  trends,
  departmentData,
  employeeData,
  summaryData,
  selectedYear,
  selectedMonth,
  months,
}) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  let yPosition = margin

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Title
  pdf.setFontSize(20)
  pdf.setFont(undefined, 'bold')
  pdf.text('QuickBooks Accounting - Variance Report', pageWidth / 2, yPosition, {
    align: 'center',
  })
  yPosition += 10

  pdf.setFontSize(12)
  pdf.setFont(undefined, 'normal')
  const reportDate = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
  pdf.text(`Report Period: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' })
  
  // Only show historical period if there are multiple months of data
  if (trends && trends.length > 1 && months > 1) {
    pdf.text(
      `Historical Period: Last ${months} Months`,
      pageWidth / 2,
      yPosition + 6,
      { align: 'center' }
    )
    yPosition += 15
  } else {
    // Single month view - no historical period
    yPosition += 10
  }

  // Summary Section
  pdf.setFontSize(16)
  pdf.setFont(undefined, 'bold')
  pdf.text('Executive Summary', margin, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  pdf.setFont(undefined, 'normal')
  if (summaryData) {
    pdf.text(`Total Employees: ${summaryData.totalEmployees || 0}`, margin, yPosition)
    yPosition += 6
    pdf.text(
      `Total Budget: $${(summaryData.totalBudget || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      margin,
      yPosition
    )
    yPosition += 6
    pdf.text(
      `Total Actual: $${(summaryData.totalActual || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      margin,
      yPosition
    )
    yPosition += 6
    pdf.text(
      `Total Variance: $${(summaryData.totalVariance || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} (${((summaryData.totalVariancePercent || 0).toFixed(2))}%)`,
      margin,
      yPosition
    )
    yPosition += 6
    if (summaryData.avgVariance !== undefined) {
      pdf.text(
        `Average Variance (${months} months): $${summaryData.avgVariance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} (${summaryData.avgVariancePercent.toFixed(2)}%)`,
        margin,
        yPosition
      )
      yPosition += 6
    }
    yPosition += 5
  }

  checkNewPage(60)

  // Employee Data Table
  if (employeeData && employeeData.length > 0) {
    pdf.setFontSize(16)
    pdf.setFont(undefined, 'bold')
    pdf.text('Employee Variance Analysis', margin, yPosition)
    yPosition += 8

    // Filter out department totals
    const employees = employeeData.filter(
      (item) => item['Employee ID'] && !item['Employee Name'].includes('DEPARTMENT TOTAL')
    )

    if (employees.length > 0) {
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'bold')

      // Table headers
      const colWidths = [20, 45, 28, 28, 28, 28, 18]
      const headers = ['ID', 'Employee Name', 'Dept', 'Budget', 'Actual', 'Variance', 'Var %']
      let xPos = margin

      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPosition)
        xPos += colWidths[i]
      })
      yPosition += 6

      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(8)

      employees.forEach((emp) => {
        checkNewPage(10)
        xPos = margin
        const variance = emp['Variance'] || 0
        const varianceColor = variance > 0 ? [255, 0, 0] : variance < 0 ? [0, 128, 0] : [128, 128, 128]

        const row = [
          (emp['Employee ID'] || '').substring(0, 8),
          (emp['Employee Name'] || '').substring(0, 20),
          (emp['Department'] || 'N/A').substring(0, 12),
          `$${(emp['Budget'] || 0).toFixed(2)}`,
          `$${(emp['Actual'] || 0).toFixed(2)}`,
          `$${variance.toFixed(2)}`,
          `${(emp['Variance %'] || 0).toFixed(2)}%`,
        ]

        row.forEach((cell, i) => {
          if (i >= 3 && i <= 5) {
            // Color code variance columns
            pdf.setTextColor(...varianceColor)
          } else {
            pdf.setTextColor(0, 0, 0)
          }
          pdf.text(cell, xPos, yPosition)
          xPos += colWidths[i]
        })
        pdf.setTextColor(0, 0, 0) // Reset to black
        yPosition += 6
      })
      yPosition += 5
    }
  }

  checkNewPage(50)

  // Department Breakdown Table
  if (departmentData && departmentData.length > 0) {
    pdf.setFontSize(16)
    pdf.setFont(undefined, 'bold')
    pdf.text('Department Breakdown', margin, yPosition)
    yPosition += 8

    pdf.setFontSize(9)
    pdf.setFont(undefined, 'bold')
    const deptColWidths = [40, 35, 35, 35, 30]
    const deptHeaders = ['Department', 'Budget', 'Actual', 'Variance', 'Var %']
    let xPos = margin

    deptHeaders.forEach((header, i) => {
      pdf.text(header, xPos, yPosition)
      xPos += deptColWidths[i]
    })
    yPosition += 6

    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(8)

    departmentData.forEach((dept) => {
      checkNewPage(10)
      xPos = margin
      const variance = dept['Variance'] || 0
      const varianceColor = variance > 0 ? [255, 0, 0] : variance < 0 ? [0, 128, 0] : [128, 128, 128]

      const row = [
        (dept['Department'] || 'N/A').substring(0, 20),
        `$${(dept['Budget'] || 0).toFixed(2)}`,
        `$${(dept['Actual'] || 0).toFixed(2)}`,
        `$${variance.toFixed(2)}`,
        `${(dept['Variance %'] || 0).toFixed(2)}%`,
      ]

      row.forEach((cell, i) => {
        if (i >= 2 && i <= 3) {
          pdf.setTextColor(...varianceColor)
        } else {
          pdf.setTextColor(0, 0, 0)
        }
        pdf.text(cell, xPos, yPosition)
        xPos += deptColWidths[i]
      })
      pdf.setTextColor(0, 0, 0)
      yPosition += 6
    })
    yPosition += 10
  }

  checkNewPage(80)

  // Historical Trends Table
  if (trends && trends.length > 0) {
    pdf.setFontSize(16)
    pdf.setFont(undefined, 'bold')
    pdf.text(`Historical Variance Trends (${months} Months)`, margin, yPosition)
    yPosition += 8

    pdf.setFontSize(9)
    pdf.setFont(undefined, 'bold')
    const trendColWidths = [30, 38, 38, 38, 30]
    const trendHeaders = ['Month', 'Budget', 'Actual', 'Variance', 'Var %']
    let xPos = margin

    trendHeaders.forEach((header, i) => {
      pdf.text(header, xPos, yPosition)
      xPos += trendColWidths[i]
    })
    yPosition += 6

    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(8)

    trends.forEach((trend) => {
      checkNewPage(10)
      xPos = margin
      const variance = trend['Total Variance'] || 0
      const varianceColor = variance > 0 ? [255, 0, 0] : variance < 0 ? [0, 128, 0] : [128, 128, 128]

      const row = [
        trend['Month'] || '',
        `$${(trend['Total Budget'] || 0).toFixed(2)}`,
        `$${(trend['Total Actual'] || 0).toFixed(2)}`,
        `$${variance.toFixed(2)}`,
        `${(trend['Variance %'] || 0).toFixed(2)}%`,
      ]

      row.forEach((cell, i) => {
        if (i >= 2 && i <= 3) {
          pdf.setTextColor(...varianceColor)
        } else {
          pdf.setTextColor(0, 0, 0)
        }
        pdf.text(cell, xPos, yPosition)
        xPos += trendColWidths[i]
      })
      pdf.setTextColor(0, 0, 0)
      yPosition += 6
    })
  }

  // Add footer to all pages
  const totalPages = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    pdf.text(
      `Generated: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
    pdf.setTextColor(0, 0, 0)
  }

  return pdf
}

/**
 * Generate PDF with charts (requires DOM elements)
 */
export async function generatePDFWithCharts({
  chartElements,
  trends,
  departmentData,
  employeeData,
  summaryData,
  selectedYear,
  selectedMonth,
  months,
}) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10  // Reduced from 15 for more space
  let yPosition = margin

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Title - more compact
  pdf.setFontSize(18)  // Slightly smaller
  pdf.setFont(undefined, 'bold')
  pdf.text('QuickBooks Accounting - Variance Report', pageWidth / 2, yPosition, {
    align: 'center',
  })
  yPosition += 8  // Reduced from 10

  pdf.setFontSize(11)  // Slightly smaller
  pdf.setFont(undefined, 'normal')
  const reportDate = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
  pdf.text(`Report Period: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' })
  
  // Only show historical period if there are multiple months of data
  if (trends && trends.length > 1 && months > 1) {
    pdf.text(
      `Historical Period: Last ${months} Months`,
      pageWidth / 2,
      yPosition + 5,
      { align: 'center' }
    )
    yPosition += 12
  } else {
    // Single month view - no historical period
    yPosition += 8
  }

  // Add charts as images
  if (chartElements && chartElements.length > 0) {
    for (const chartItem of chartElements) {
      const chartElement = chartItem.element || chartItem
      const chartTitle = chartItem.title || 'Chart'
      
      if (!chartElement) continue

      try {
        // Ensure element is visible and rendered
        if (!chartElement || !chartElement.offsetParent) {
          throw new Error(`Chart element "${chartTitle}" is not visible`)
        }

        // Minimal wait for charts to be ready (reduced from 500ms + 300ms)
        await new Promise(resolve => setTimeout(resolve, 100))

        console.log(`Capturing chart: ${chartTitle}`, {
          width: chartElement.offsetWidth,
          height: chartElement.offsetHeight,
          scrollWidth: chartElement.scrollWidth,
          scrollHeight: chartElement.scrollHeight,
        })

        // Try to find parent chart-card for better capture
        let elementToCapture = chartElement
        const parentCard = chartElement.closest('.chart-card')
        
        // For chart containers, try to capture the whole card
        if (parentCard && (chartElement.classList.contains('variance-trends-chart') || 
            chartElement.classList.contains('monthly-comparison') ||
            chartElement.classList.contains('department-breakdown') ||
            chartElement.classList.contains('employee-analysis'))) {
          elementToCapture = parentCard
        }

        console.log(`Capturing element for "${chartTitle}":`, {
          element: elementToCapture.className,
          width: elementToCapture.offsetWidth,
          height: elementToCapture.offsetHeight,
          hasSVG: elementToCapture.querySelectorAll('svg').length,
          hasCanvas: elementToCapture.querySelectorAll('canvas').length,
        })

        // Minimal wait for rendering (reduced for speed)
        await new Promise(resolve => setTimeout(resolve, 100))

        const canvas = await html2canvas(elementToCapture, {
          scale: 1.5, // Reduced from 2 for smaller file size
          useCORS: true,
          logging: false, // Set to true for debugging
          backgroundColor: '#ffffff',
          allowTaint: true, // Allow tainted canvas for better SVG support
          removeContainer: false,
          imageTimeout: 20000,
          foreignObjectRendering: false, // Disable for better SVG support
          onclone: (clonedDoc, element) => {
            // Ensure all images and SVGs are loaded in cloned document
            const svgs = element.querySelectorAll('svg')
            svgs.forEach(svg => {
              svg.style.visibility = 'visible'
              svg.style.opacity = '1'
              svg.style.display = 'block'
              // Force SVG dimensions
              if (!svg.getAttribute('width') || svg.getAttribute('width') === '0') {
                svg.setAttribute('width', elementToCapture.offsetWidth || 800)
              }
              if (!svg.getAttribute('height') || svg.getAttribute('height') === '0') {
                svg.setAttribute('height', elementToCapture.offsetHeight || 400)
              }
              // Force viewBox if missing
              if (!svg.getAttribute('viewBox')) {
                const width = svg.getAttribute('width') || 800
                const height = svg.getAttribute('height') || 400
                svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
              }
            })
            
            // Ensure canvas elements are visible
            const canvases = element.querySelectorAll('canvas')
            canvases.forEach(canvas => {
              canvas.style.visibility = 'visible'
              canvas.style.opacity = '1'
              canvas.style.display = 'block'
            })
            
            // Force visibility on the element itself and all children
            element.style.visibility = 'visible'
            element.style.opacity = '1'
            element.style.display = 'block'
            
            // Make sure all child elements are visible
            const allChildren = element.querySelectorAll('*')
            allChildren.forEach(child => {
              if (child.style) {
                child.style.visibility = 'visible'
                child.style.opacity = '1'
              }
            })
          },
        })

        if (!canvas) {
          throw new Error(`Chart "${chartTitle}" - canvas is null`)
        }

        if (canvas.width === 0 || canvas.height === 0) {
          console.warn(`Chart "${chartTitle}" has zero dimensions: ${canvas.width}x${canvas.height}`)
          throw new Error(`Chart "${chartTitle}" rendered with zero dimensions`)
        }

        const imgData = canvas.toDataURL('image/png', 1.0)
        
        if (!imgData || imgData === 'data:,') {
          console.warn(`Chart "${chartTitle}" - invalid image data:`, imgData?.substring(0, 50))
          throw new Error(`Chart "${chartTitle}" failed to generate image data`)
        }

        // Verify image data is valid (should start with data:image)
        if (!imgData.startsWith('data:image')) {
          console.warn(`Chart "${chartTitle}" - image data doesn't start with data:image`)
          throw new Error(`Chart "${chartTitle}" generated invalid image data format`)
        }

        // Use smaller chart size (reduce by 20%)
        const chartMargin = 15  // Increased margins for smaller charts
        const maxChartWidth = (pageWidth - 2 * chartMargin) * 0.8  // 80% of available width
        const imgWidth = Math.min(maxChartWidth, (canvas.width / canvas.height) * maxChartWidth)
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        console.log(`Chart "${chartTitle}" captured: ${canvas.width}x${canvas.height}, PDF size: ${imgWidth.toFixed(1)}x${imgHeight.toFixed(1)}mm`)

        // Calculate total space needed (title + chart + spacing)
        const titleHeight = 5  // Title height
        const spacingAfter = 5  // Spacing after chart
        const totalHeight = titleHeight + imgHeight + spacingAfter

        // Check if we need a new page BEFORE adding title and chart
        if (yPosition + totalHeight > pageHeight - 15) {
          pdf.addPage()
          yPosition = margin
        }

        // Add chart title right before the chart (no gap)
        pdf.setFontSize(14)
        pdf.setFont(undefined, 'bold')
        pdf.text(chartTitle, chartMargin, yPosition)
        yPosition += titleHeight  // Minimal gap

        // Add chart immediately after title
        pdf.addImage(imgData, 'PNG', chartMargin, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + spacingAfter
        console.log(`✅ Successfully added chart "${chartTitle}" to PDF`)
      } catch (error) {
        console.error(`❌ Error capturing chart "${chartTitle}":`, error)
        
        // Try fallback: capture the entire chart-card parent
        try {
          const fallbackElement = chartElement.closest('.chart-card') || chartElement.parentElement
          if (fallbackElement && fallbackElement !== chartElement) {
            console.log(`🔄 Trying fallback capture for "${chartTitle}" using parent element`)
            await new Promise(resolve => setTimeout(resolve, 100))
            
            const fallbackCanvas = await html2canvas(fallbackElement, {
              scale: 1.5, // Reduced from 2
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              allowTaint: true,
              imageTimeout: 15000,
            })
            
            if (fallbackCanvas && fallbackCanvas.width > 0 && fallbackCanvas.height > 0) {
              const fallbackImgData = fallbackCanvas.toDataURL('image/png', 1.0)
              if (fallbackImgData && fallbackImgData.startsWith('data:image')) {
                const fallbackChartMargin = 15
                const fallbackMaxWidth = (pageWidth - 2 * fallbackChartMargin) * 0.8  // 80% of available width
                const fallbackImgWidth = Math.min(fallbackMaxWidth, (fallbackCanvas.width / fallbackCanvas.height) * fallbackMaxWidth)
                const fallbackImgHeight = (fallbackCanvas.height * fallbackImgWidth) / fallbackCanvas.width
                
                // Calculate total space needed
                const fallbackTitleHeight = 5
                const fallbackSpacingAfter = 5
                const fallbackTotalHeight = fallbackTitleHeight + fallbackImgHeight + fallbackSpacingAfter
                
                // Check if we need a new page BEFORE adding
                if (yPosition + fallbackTotalHeight > pageHeight - 15) {
                  pdf.addPage()
                  yPosition = margin
                }
                
                // Add title and chart together
                pdf.setFontSize(14)
                pdf.setFont(undefined, 'bold')
                pdf.text(chartTitle, fallbackChartMargin, yPosition)
                yPosition += fallbackTitleHeight
                
                pdf.addImage(fallbackImgData, 'PNG', fallbackChartMargin, yPosition, fallbackImgWidth, fallbackImgHeight)
                yPosition += fallbackImgHeight + fallbackSpacingAfter
                console.log(`✅ Fallback capture successful for "${chartTitle}"`)
                continue // Skip to next chart
              }
            }
          }
        } catch (fallbackError) {
          console.error(`❌ Fallback capture also failed for "${chartTitle}":`, fallbackError)
        }
        
        // Add a note that chart couldn't be captured
        if (yPosition > pageHeight - 20) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.setFontSize(10)
        pdf.setFont(undefined, 'italic')
        pdf.setTextColor(128, 128, 128)
        pdf.text(`[Chart "${chartTitle}" could not be captured: ${error.message}]`, margin, yPosition)
        pdf.setTextColor(0, 0, 0)
        yPosition += 6
      }
    }
  }

  // Add data tables after charts
  yPosition += 10
  if (yPosition > pageHeight - 100) {
    pdf.addPage()
    yPosition = margin
  }

  // Executive Summary Section
  pdf.setFontSize(16)
  pdf.setFont(undefined, 'bold')
  pdf.text('Executive Summary', margin, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  pdf.setFont(undefined, 'normal')
  if (summaryData) {
    pdf.text(`Total Employees: ${summaryData.totalEmployees || 0}`, margin, yPosition)
    yPosition += 6
    pdf.text(
      `Total Budget: $${(summaryData.totalBudget || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      margin,
      yPosition
    )
    yPosition += 6
    pdf.text(
      `Total Actual: $${(summaryData.totalActual || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      margin,
      yPosition
    )
    yPosition += 6
    pdf.text(
      `Total Variance: $${(summaryData.totalVariance || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} (${(summaryData.totalVariancePercent || 0).toFixed(2)}%)`,
      margin,
      yPosition
    )
    yPosition += 6
    if (summaryData.avgVariance !== undefined) {
      pdf.text(
        `Average Variance (${months} months): $${summaryData.avgVariance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} (${summaryData.avgVariancePercent.toFixed(2)}%)`,
        margin,
        yPosition
      )
      yPosition += 6
    }
    yPosition += 10
  }

  checkNewPage(60)

  // Department Breakdown Table
  if (departmentData && departmentData.length > 0) {
    pdf.setFontSize(16)
    pdf.setFont(undefined, 'bold')
    pdf.text('Department Breakdown', margin, yPosition)
    yPosition += 8

    pdf.setFontSize(9)
    pdf.setFont(undefined, 'bold')
    const deptColWidths = [40, 35, 35, 35, 30]
    const deptHeaders = ['Department', 'Budget', 'Actual', 'Variance', 'Var %']
    let xPos = margin

    deptHeaders.forEach((header, i) => {
      pdf.text(header, xPos, yPosition)
      xPos += deptColWidths[i]
    })
    yPosition += 6

    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(8)

    departmentData.forEach((dept) => {
      checkNewPage(10)
      xPos = margin
      const variance = dept['Variance'] || 0
      const varianceColor = variance > 0 ? [255, 0, 0] : variance < 0 ? [0, 128, 0] : [128, 128, 128]

      const row = [
        (dept['Department'] || 'N/A').substring(0, 20),
        `$${(dept['Budget'] || 0).toFixed(2)}`,
        `$${(dept['Actual'] || 0).toFixed(2)}`,
        `$${variance.toFixed(2)}`,
        `${(dept['Variance %'] || 0).toFixed(2)}%`,
      ]

      row.forEach((cell, i) => {
        if (i >= 2 && i <= 3) {
          pdf.setTextColor(...varianceColor)
        } else {
          pdf.setTextColor(0, 0, 0)
        }
        pdf.text(cell, xPos, yPosition)
        xPos += deptColWidths[i]
      })
      pdf.setTextColor(0, 0, 0)
      yPosition += 6
    })
    yPosition += 10
  }

  checkNewPage(60)

  // Employee Data Table (Full)
  if (employeeData && employeeData.length > 0) {
    pdf.setFontSize(16)
    pdf.setFont(undefined, 'bold')
    pdf.text('Employee Variance Analysis', margin, yPosition)
    yPosition += 8

    // Filter out department totals
    const employees = employeeData.filter(
      (item) => item['Employee ID'] && !item['Employee Name'].includes('DEPARTMENT TOTAL')
    )

    if (employees.length > 0) {
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'bold')

      // Table headers
      const colWidths = [20, 45, 28, 28, 28, 28, 18]
      const headers = ['ID', 'Employee Name', 'Dept', 'Budget', 'Actual', 'Variance', 'Var %']
      let xPos = margin

      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPosition)
        xPos += colWidths[i]
      })
      yPosition += 6

      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(8)

      employees.forEach((emp) => {
        checkNewPage(10)
        xPos = margin
        const variance = emp['Variance'] || 0
        const varianceColor = variance > 0 ? [255, 0, 0] : variance < 0 ? [0, 128, 0] : [128, 128, 128]

        const row = [
          (emp['Employee ID'] || '').substring(0, 8),
          (emp['Employee Name'] || '').substring(0, 20),
          (emp['Department'] || 'N/A').substring(0, 12),
          `$${(emp['Budget'] || 0).toFixed(2)}`,
          `$${(emp['Actual'] || 0).toFixed(2)}`,
          `$${variance.toFixed(2)}`,
          `${(emp['Variance %'] || 0).toFixed(2)}%`,
        ]

        row.forEach((cell, i) => {
          if (i >= 3 && i <= 5) {
            pdf.setTextColor(...varianceColor)
          } else {
            pdf.setTextColor(0, 0, 0)
          }
          pdf.text(cell, xPos, yPosition)
          xPos += colWidths[i]
        })
        pdf.setTextColor(0, 0, 0)
        yPosition += 6
      })
      yPosition += 5
    }
  }

  checkNewPage(60)

  // Historical Trends Table
  if (trends && trends.length > 0) {
    pdf.setFontSize(16)
    pdf.setFont(undefined, 'bold')
    pdf.text(`Historical Variance Trends (${months} Months)`, margin, yPosition)
    yPosition += 8

    pdf.setFontSize(9)
    pdf.setFont(undefined, 'bold')
    const trendColWidths = [30, 38, 38, 38, 30]
    const trendHeaders = ['Month', 'Budget', 'Actual', 'Variance', 'Var %']
    let xPos = margin

    trendHeaders.forEach((header, i) => {
      pdf.text(header, xPos, yPosition)
      xPos += trendColWidths[i]
    })
    yPosition += 6

    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(8)

    trends.forEach((trend) => {
      checkNewPage(10)
      xPos = margin
      const variance = trend['Total Variance'] || 0
      const varianceColor = variance > 0 ? [255, 0, 0] : variance < 0 ? [0, 128, 0] : [128, 128, 128]

      const row = [
        trend['Month'] || '',
        `$${(trend['Total Budget'] || 0).toFixed(2)}`,
        `$${(trend['Total Actual'] || 0).toFixed(2)}`,
        `$${variance.toFixed(2)}`,
        `${(trend['Variance %'] || 0).toFixed(2)}%`,
      ]

      row.forEach((cell, i) => {
        if (i >= 2 && i <= 3) {
          pdf.setTextColor(...varianceColor)
        } else {
          pdf.setTextColor(0, 0, 0)
        }
        pdf.text(cell, xPos, yPosition)
        xPos += trendColWidths[i]
      })
      pdf.setTextColor(0, 0, 0)
      yPosition += 6
    })
  }

  // Add footer
  const totalPages = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    pdf.text(
      `Generated: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
    pdf.setTextColor(0, 0, 0)
  }

  return pdf
}

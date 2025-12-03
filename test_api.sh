#!/bin/bash
# QuickBooks Accounting Automation - API Test Script

BASE_URL="http://localhost:8000/api/v1"

echo "========================================="
echo "QuickBooks Accounting API Test"
echo "========================================="
echo ""

# Check if server is running
echo "1. Testing Health Check..."
curl -s "$BASE_URL/health" | python3 -m json.tool
echo ""
echo ""

# Get employees
echo "2. Getting Employees..."
curl -s "$BASE_URL/employees" | python3 -m json.tool
echo ""
echo ""

# Generate variance report (JSON)
echo "3. Generating Variance Report (JSON) for January 2024..."
curl -s -X POST "$BASE_URL/reports/variance" \
  -H "Content-Type: application/json" \
  -d '{"year": 2024, "month": 1, "format": "json"}' | python3 -m json.tool
echo ""
echo ""

# Get variance trends
echo "4. Getting Variance Trends (last 6 months)..."
curl -s "$BASE_URL/reports/variance/trends?months=6" | python3 -m json.tool
echo ""
echo ""

# Get variance by department
echo "5. Getting Variance by Department (January 2024)..."
curl -s "$BASE_URL/reports/variance/by-department?year=2024&month=1" | python3 -m json.tool
echo ""
echo ""

echo "========================================="
echo "Test Complete!"
echo "========================================="
echo ""
echo "To generate Excel/CSV reports, use:"
echo "  curl -X POST \"$BASE_URL/reports/variance\" \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"year\": 2024, \"month\": 1, \"format\": \"excel\"}' \\"
echo "    --output variance_report.xlsx"
echo ""


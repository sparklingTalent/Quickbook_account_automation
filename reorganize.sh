#!/bin/bash
# Script to reorganize project into backend/ and frontend/ structure

set -e

echo "🚀 Reorganizing project structure..."

# Create backend directory if it doesn't exist
mkdir -p backend

# Move backend files to backend/
echo "Moving backend files..."

# Move Python application files
mv app backend/ 2>/dev/null || echo "app/ already moved or doesn't exist"
mv main.py backend/ 2>/dev/null || echo "main.py already moved or doesn't exist"
mv config.py backend/ 2>/dev/null || echo "config.py already moved or doesn't exist"
mv requirements.txt backend/ 2>/dev/null || echo "requirements.txt already moved or doesn't exist"

# Move data directory
if [ -d "data" ]; then
    mv data backend/ 2>/dev/null || echo "data/ already moved"
fi

# Move Python scripts (keep in backend)
mv generate_year_budgets.py backend/ 2>/dev/null || echo "generate_year_budgets.py already moved"
mv sync_sheets.py backend/ 2>/dev/null || echo "sync_sheets.py already moved"

# Move test files to backend
mkdir -p backend/tests
mv test_*.py backend/tests/ 2>/dev/null || echo "Test files already moved or don't exist"
mv tests backend/ 2>/dev/null || echo "tests/ already moved or doesn't exist"

# Create .env.example in backend if it doesn't exist
if [ ! -f "backend/.env.example" ] && [ -f ".env.example" ]; then
    cp .env.example backend/.env.example
fi

echo "✅ Project reorganization complete!"
echo ""
echo "New structure:"
echo "  backend/  - Python FastAPI application"
echo "  frontend/ - React dashboard"
echo ""
echo "Next steps:"
echo "  1. Review backend/ folder structure"
echo "  2. Update any hardcoded paths if needed"
echo "  3. Test locally: cd backend && python main.py"
echo "  4. See docs/DEPLOYMENT.md for cloud deployment"


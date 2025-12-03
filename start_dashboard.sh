#!/bin/bash
# Start both backend and frontend

echo "Starting QuickBooks Accounting Dashboard..."
echo ""

# Check if backend is running
if ! curl -s http://localhost:8000/api/v1/health > /dev/null; then
    echo "Starting backend server..."
    cd "$(dirname "$0")"
    source venv/bin/activate
    python main.py &
    BACKEND_PID=$!
    echo "Backend started (PID: $BACKEND_PID)"
    sleep 3
else
    echo "Backend already running"
fi

# Start frontend
echo "Starting frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo ""
echo "✅ Dashboard starting..."
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

npm run dev


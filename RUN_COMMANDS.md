# How to Run Commands

## Important: Use Virtual Environment Python

All Python scripts must use the virtual environment's Python, not the system Python.

## ✅ Correct Ways to Run

### Option 1: Use venv Python directly (Easiest)

```bash
# Test Google Sheets
./venv/bin/python3 test_google_sheets.py

# Test basic functionality
./venv/bin/python3 test_simple.py

# Start server
./venv/bin/python3 main.py
```

### Option 2: Use helper scripts (Recommended)

```bash
# Test Google Sheets
./test_google_sheets_quick.sh

# Start server
./run.sh

# Test API (after starting server)
./test_api.sh
```

### Option 3: Activate venv first

```bash
# Activate virtual environment
source venv/bin/activate

# Now you can use 'python' (not python3)
python test_google_sheets.py
python test_simple.py
python main.py

# Deactivate when done
deactivate
```

## ❌ Don't Do This

```bash
# This will fail - uses system Python without dependencies
python3 test_google_sheets.py
```

## Quick Reference

| Task | Command |
|------|---------|
| Test Google Sheets | `./venv/bin/python3 test_google_sheets.py` |
| Test Basic Features | `./venv/bin/python3 test_simple.py` |
| Start API Server | `./run.sh` or `./venv/bin/python3 main.py` |
| Test API Endpoints | `./test_api.sh` (after starting server) |

## Why This Happens

- System Python (`python3`) doesn't have the project dependencies installed
- Virtual environment (`venv`) has all dependencies installed
- Always use `./venv/bin/python3` or activate venv first


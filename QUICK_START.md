# Quick Start Guide

## Running Commands

On macOS, you have two options:

### Option 1: Use `python3` directly (Recommended)

```bash
# Test Google Sheets integration
python3 test_google_sheets.py

# Test basic functionality
python3 test_simple.py

# Start the server
source venv/bin/activate
python3 main.py
```

### Option 2: Activate virtual environment first

```bash
# Activate virtual environment (this makes 'python' available)
source venv/bin/activate

# Now you can use 'python' instead of 'python3'
python test_google_sheets.py
python test_simple.py
python main.py
```

## Quick Commands Reference

```bash
# Test Google Sheets (use python3)
python3 test_google_sheets.py

# Test basic functionality (use python3)
python3 test_simple.py

# Start API server
source venv/bin/activate && python3 main.py

# Or use the run script (activates venv automatically)
./run.sh
```

## Common Issues

### "command not found: python"
- **Solution:** Use `python3` instead, or activate venv first with `source venv/bin/activate`

### "No module named 'app'"
- **Solution:** Make sure you're in the project directory and venv is activated

### "Permission denied" when running scripts
- **Solution:** Make scripts executable: `chmod +x script_name.sh`


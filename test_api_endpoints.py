#!/usr/bin/env python3
"""Test API endpoints to verify they work."""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(method, endpoint, data=None, params=None):
    """Test an API endpoint."""
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", params=params)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data)
        else:
            print(f"Unknown method: {method}")
            return False
        
        if response.status_code == 200:
            print(f"✅ {method} {endpoint}: OK")
            return True
        else:
            print(f"❌ {method} {endpoint}: {response.status_code}")
            print(f"   Error: {response.text[:200]}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ {method} {endpoint}: Server not running")
        return False
    except Exception as e:
        print(f"❌ {method} {endpoint}: {e}")
        return False

def main():
    print("=" * 60)
    print("Testing API Endpoints")
    print("=" * 60)
    print()
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code != 200:
            print("❌ Server is running but health check failed")
            return
    except:
        print("❌ Server is not running. Please start it with: ./run.sh")
        return
    
    print("✅ Server is running")
    print()
    
    # Test endpoints
    now = datetime.now()
    
    results = []
    
    # Health check
    results.append(test_endpoint("GET", "/health"))
    
    # Get employees
    results.append(test_endpoint("GET", "/employees"))
    
    # Get variance trends
    results.append(test_endpoint("GET", "/reports/variance/trends", params={"months": 12}))
    
    # Generate variance report
    results.append(test_endpoint("POST", "/reports/variance", data={
        "year": now.year,
        "month": now.month,
        "format": "json"
    }))
    
    # Get variance by department
    results.append(test_endpoint("GET", "/reports/variance/by-department", params={
        "year": now.year,
        "month": now.month
    }))
    
    print()
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)

if __name__ == "__main__":
    main()


#!/usr/bin/env python3
"""Generate budgets for all employees for the entire year."""

import json
from pathlib import Path

# Employee data
employees = [
    {"id": "emp_001", "name": "John Smith", "dept": "Engineering", "base": 12000.0},
    {"id": "emp_002", "name": "Sarah Johnson", "dept": "Engineering", "base": 10000.0},
    {"id": "emp_003", "name": "Michael Chen", "dept": "Architecture", "base": 13000.0},
    {"id": "emp_004", "name": "Emily Rodriguez", "dept": "Architecture", "base": 11000.0},
    {"id": "emp_005", "name": "David Kim", "dept": "Engineering", "base": 9500.0},
    {"id": "emp_006", "name": "Lisa Anderson", "dept": "Architecture", "base": 10500.0},
]

import sys
from datetime import datetime

# Generate for multiple years: 2022, 2023, 2024, current year, and next year
current_year = datetime.now().year
years = [2022, 2023, 2024, current_year, current_year + 1]
budgets = {}

# Generate budgets for all 12 months for each year
for year in years:
    for month in range(1, 13):
        month_str = f"{month:02d}"
        for emp in employees:
            key = f"{emp['id']}_{year}_{month_str}"
            budgets[key] = {
                "employee_id": emp["id"],
                "employee_name": emp["name"],
                "department": emp["dept"],
                "month": month_str,
                "year": year,
                "amount": emp["base"]
            }

# Save to file
budget_file = Path("data/budgets.json")
budget_file.parent.mkdir(parents=True, exist_ok=True)

with open(budget_file, "w") as f:
    json.dump(budgets, f, indent=2)

total_entries = len(budgets)
print(f"✅ Generated budgets for {len(employees)} employees × 12 months × {len(years)} years = {total_entries} budget entries")
print(f"   Years: {', '.join(map(str, years))}")
print(f"   Saved to: {budget_file.absolute()}")


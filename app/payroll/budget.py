"""Budget management for salary tracking."""
import json
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime


class BudgetManager:
    """Manages budget data for salary tracking."""
    
    def __init__(self, budget_file: str = "data/budgets.json"):
        """Initialize budget manager."""
        self.budget_file = Path(budget_file)
        self.budget_file.parent.mkdir(parents=True, exist_ok=True)
        self._load_budgets()
    
    def _load_budgets(self):
        """Load budgets from JSON file (cached in memory)."""
        if self.budget_file.exists():
            # Only reload if file was modified
            import os
            mtime = os.path.getmtime(self.budget_file)
            if not hasattr(self, '_last_mtime') or mtime > self._last_mtime:
                with open(self.budget_file, "r") as f:
                    self.budgets = json.load(f)
                self._last_mtime = mtime
        else:
            self.budgets = {}
            self._save_budgets()
    
    def _save_budgets(self):
        """Save budgets to JSON file."""
        with open(self.budget_file, "w") as f:
            json.dump(self.budgets, f, indent=2)
    
    def get_budget(self, employee_id: str, month: str, year: int) -> float:
        """
        Get budget for an employee for a specific month.
        
        Args:
            employee_id: Employee ID
            month: Month as string (e.g., "01", "02")
            year: Year as integer
            
        Returns:
            Budget amount (0 if not found)
        """
        key = f"{employee_id}_{year}_{month}"
        return self.budgets.get(key, {}).get("amount", 0.0)
    
    def get_department_budget(self, department: str, month: str, year: int) -> float:
        """Get total budget for a department for a specific month."""
        total = 0.0
        for key, budget_data in self.budgets.items():
            if budget_data.get("department") == department:
                budget_year = budget_data.get("year")
                budget_month = budget_data.get("month")
                if budget_year == year and budget_month == month:
                    total += budget_data.get("amount", 0.0)
        return total
    
    def set_budget(self, employee_id: str, employee_name: str, department: Optional[str],
                   month: str, year: int, amount: float):
        """Set budget for an employee."""
        key = f"{employee_id}_{year}_{month}"
        self.budgets[key] = {
            "employee_id": employee_id,
            "employee_name": employee_name,
            "department": department,
            "month": month,
            "year": year,
            "amount": amount
        }
        self._save_budgets()
    
    def get_all_budgets(self, month: str, year: int) -> Dict:
        """Get all budgets for a specific month."""
        return {
            key: data for key, data in self.budgets.items()
            if data.get("year") == year and data.get("month") == month
        }


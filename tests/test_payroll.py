"""Tests for payroll service."""
import pytest
from datetime import datetime
from app.payroll.budget import BudgetManager
from app.payroll.service import PayrollService


def test_budget_manager():
    """Test budget manager functionality."""
    manager = BudgetManager("data/test_budgets.json")
    
    # Set budget
    manager.set_budget("emp1", "John Doe", "Engineering", "01", 2024, 10000.0)
    
    # Get budget
    budget = manager.get_budget("emp1", "01", 2024)
    assert budget == 10000.0
    
    # Clean up
    import os
    if os.path.exists("data/test_budgets.json"):
        os.remove("data/test_budgets.json")


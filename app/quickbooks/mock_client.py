"""Mock QuickBooks client for development and testing without QuickBooks account."""
from typing import List
from datetime import datetime, timedelta
import random
import hashlib
from app.quickbooks.models import Employee, PayrollItem


class MockQuickBooksClient:
    """Mock client that returns sample data for development/testing."""
    
    def __init__(self, access_token: str = "mock_token", company_id: str = "mock_company"):
        """
        Initialize mock QuickBooks client.
        
        Args:
            access_token: Not used in mock, but kept for interface compatibility
            company_id: Not used in mock, but kept for interface compatibility
        """
        self.access_token = access_token
        self.company_id = company_id
        self._initialize_mock_data()
    
    def _initialize_mock_data(self):
        """Initialize mock employee and payroll data."""
        # Sample employees for Architecture and Engineering firm
        self.mock_employees = [
            Employee(
                id="emp_001",
                display_name="John Smith",
                given_name="John",
                family_name="Smith",
                department="Engineering",
                active=True
            ),
            Employee(
                id="emp_002",
                display_name="Sarah Johnson",
                given_name="Sarah",
                family_name="Johnson",
                department="Engineering",
                active=True
            ),
            Employee(
                id="emp_003",
                display_name="Michael Chen",
                given_name="Michael",
                family_name="Chen",
                department="Architecture",
                active=True
            ),
            Employee(
                id="emp_004",
                display_name="Emily Rodriguez",
                given_name="Emily",
                family_name="Rodriguez",
                department="Architecture",
                active=True
            ),
            Employee(
                id="emp_005",
                display_name="David Kim",
                given_name="David",
                family_name="Kim",
                department="Engineering",
                active=True
            ),
            Employee(
                id="emp_006",
                display_name="Lisa Anderson",
                given_name="Lisa",
                family_name="Anderson",
                department="Architecture",
                active=True
            ),
        ]
        
        # Base salary rates (monthly) for each employee
        self.base_salaries = {
            "emp_001": 12000.0,  # Senior Engineer
            "emp_002": 10000.0,  # Engineer
            "emp_003": 13000.0,  # Senior Architect
            "emp_004": 11000.0,  # Architect
            "emp_005": 9500.0,   # Junior Engineer
            "emp_006": 10500.0,  # Architect
        }
    
    def get_employees(self) -> List[Employee]:
        """Retrieve mock employees."""
        return self.mock_employees.copy()
    
    def _get_deterministic_variance(self, employee_id: str, year: int, month: int) -> float:
        """
        Get deterministic variance factor based on employee, year, and month.
        Uses hash-based approach for consistent results.
        """
        # Create a seed from employee, year, month for deterministic randomness
        seed_string = f"{employee_id}_{year}_{month}"
        seed = int(hashlib.md5(seed_string.encode()).hexdigest(), 16) % 10000
        random.seed(seed)
        
        month_num = month
        base_salary = self.base_salaries.get(employee_id, 10000.0)
        
        # Seasonal patterns
        if month_num in [11, 12]:  # Q4 - bonus season
            variance_factor = random.uniform(1.05, 1.15)
        elif month_num in [6, 7, 8]:  # Summer - more overtime
            variance_factor = random.uniform(1.02, 1.12)
        elif month_num in [1, 2]:  # Q1 - lower activity
            variance_factor = random.uniform(0.95, 1.05)
        else:  # Normal months
            variance_factor = random.uniform(0.97, 1.08)
        
        # Employee-specific patterns
        if employee_id == "emp_001":  # Senior - more consistent
            variance_factor = random.uniform(0.98, 1.05)
        elif employee_id == "emp_005":  # Junior - more variance
            variance_factor = random.uniform(0.95, 1.12)
        
        return variance_factor
    
    def get_payroll_data(self, start_date: datetime, end_date: datetime) -> List[PayrollItem]:
        """
        Generate mock payroll data for the date range.
        Optimized to generate one entry per employee per month.
        """
        payroll_items = []
        
        # Group by month for more realistic monthly payroll
        current = start_date.replace(day=1)  # Start of month
        
        while current <= end_date:
            for employee in self.mock_employees:
                base_salary = self.base_salaries.get(employee.id, 10000.0)
                
                # Get deterministic variance factor
                variance_factor = self._get_deterministic_variance(
                    employee.id, current.year, current.month
                )
                
                # Calculate monthly amount
                monthly_amount = base_salary * variance_factor
                
                # Create a payroll item for the month
                payroll_date = current.replace(day=15)
                if payroll_date > end_date:
                    payroll_date = end_date
                
                payroll_item = PayrollItem(
                    id=f"payroll_{employee.id}_{current.strftime('%Y%m')}",
                    name=f"Monthly Payroll - {employee.display_name}",
                    type="Salary",
                    amount=round(monthly_amount, 2),
                    employee_id=employee.id,
                    employee_name=employee.display_name,
                    department=employee.department,
                    date=payroll_date
                )
                payroll_items.append(payroll_item)
            
            # Move to next month
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1, day=1)
            else:
                current = current.replace(month=current.month + 1, day=1)
            
            # Break if we've gone past end_date
            if current > end_date:
                break
        
        return payroll_items
    
    def get_journal_entries(self, start_date: datetime, end_date: datetime) -> List[dict]:
        """Get mock journal entries."""
        return []


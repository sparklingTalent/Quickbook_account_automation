"""Payroll service for processing and comparing data."""
from datetime import datetime, timedelta
from typing import List, Dict, Union, Optional
from app.quickbooks.client import QuickBooksClient
from app.quickbooks.mock_client import MockQuickBooksClient
from app.quickbooks.models import PayrollItem
from app.payroll.budget import BudgetManager
from app.services.cache import cached, get_cache
import pandas as pd


class PayrollService:
    """Service for processing payroll data and generating variance reports."""
    
    def __init__(self, qb_client: Union[QuickBooksClient, MockQuickBooksClient]):
        """Initialize payroll service."""
        self.qb_client = qb_client
        self.budget_manager = BudgetManager()
        self._payroll_cache = {}  # Simple cache for monthly payroll data
    
    def get_monthly_payroll(self, year: int, month: int) -> Dict:
        """
        Get payroll data for a specific month (cached).
        
        Args:
            year: Year (e.g., 2024)
            month: Month (1-12)
            
        Returns:
            Dictionary with payroll data aggregated by employee
        """
        # Check cache first
        cache_key = f"payroll_{year}_{month:02d}"
        if cache_key in self._payroll_cache:
            return self._payroll_cache[cache_key]
        
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1) - timedelta(days=1)
        
        payroll_items = self.qb_client.get_payroll_data(start_date, end_date)
        
        # Aggregate by employee
        employee_totals = {}
        for item in payroll_items:
            emp_id = item.employee_id
            if emp_id not in employee_totals:
                employee_totals[emp_id] = {
                    "employee_id": emp_id,
                    "employee_name": item.employee_name,
                    "department": item.department,
                    "total_amount": 0.0,
                    "items": []
                }
            
            employee_totals[emp_id]["total_amount"] += item.amount
            employee_totals[emp_id]["items"].append(item)
        
        # Cache the result
        self._payroll_cache[cache_key] = employee_totals
        return employee_totals
    
    def generate_variance_report(self, year: int, month: int) -> pd.DataFrame:
        """
        Generate salary variance report comparing actual vs budget.
        
        Args:
            year: Year
            month: Month (1-12)
            
        Returns:
            DataFrame with variance report
        """
        month_str = f"{month:02d}"
        payroll_data = self.get_monthly_payroll(year, month)
        
        report_rows = []
        
        for emp_id, emp_data in payroll_data.items():
            actual = emp_data["total_amount"]
            budget = self.budget_manager.get_budget(emp_id, month_str, year)
            variance = actual - budget
            variance_percent = (variance / budget * 100) if budget > 0 else 0
            
            report_rows.append({
                "Employee ID": emp_id,
                "Employee Name": emp_data["employee_name"],
                "Department": emp_data.get("department", "N/A"),
                "Budget": round(budget, 2),
                "Actual": round(actual, 2),
                "Variance": round(variance, 2),
                "Variance %": round(variance_percent, 2)
            })
        
        # Add department totals
        # First, calculate actuals from payroll data
        departments = {}
        for row in report_rows:
            dept = row["Department"]
            if dept not in departments:
                departments[dept] = {
                    "Budget": 0.0,
                    "Actual": 0.0,
                    "Variance": 0.0
                }
            departments[dept]["Actual"] += row["Actual"]
        
        # Then, get ALL budgets for each department (including employees without payroll)
        for dept in departments.keys():
            dept_budget = self.budget_manager.get_department_budget(dept, month_str, year)
            departments[dept]["Budget"] = dept_budget
            departments[dept]["Variance"] = departments[dept]["Actual"] - dept_budget
        
        # Add department summary rows
        for dept, totals in departments.items():
            dept_variance_pct = (totals["Variance"] / totals["Budget"] * 100) if totals["Budget"] > 0 else 0
            report_rows.append({
                "Employee ID": "",
                "Employee Name": f"DEPARTMENT TOTAL: {dept}",
                "Department": dept,
                "Budget": round(totals["Budget"], 2),
                "Actual": round(totals["Actual"], 2),
                "Variance": round(totals["Variance"], 2),
                "Variance %": round(dept_variance_pct, 2)
            })
        
        df = pd.DataFrame(report_rows)
        return df
    
    def get_historical_variance_trends(self, months: int = 12, end_year: Optional[int] = None, end_month: Optional[int] = None) -> pd.DataFrame:
        """
        Get historical variance trends for the past N months (optimized).
        
        Args:
            months: Number of months to look back
            end_year: End year for trends (defaults to current year)
            end_month: End month for trends (defaults to current month)
            
        Returns:
            DataFrame with historical trends
        """
        # Use provided end date or current date
        if end_year is None or end_month is None:
            today = datetime.now()
            end_year = end_year or today.year
            end_month = end_month or today.month
        
        # Check cache
        cache_key = f"trends_{months}_{end_year}_{end_month:02d}"
        cache = get_cache()
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            return cached_result
        
        trend_rows = []
        
        # Optimize: Generate all months in one pass
        months_to_process = []
        for i in range(months):
            target_month = end_month - i
            target_year = end_year
            
            # Handle year rollover
            while target_month <= 0:
                target_month += 12
                target_year -= 1
            
            months_to_process.append((target_year, target_month))
        
        # Process months (reuse cached payroll data)
        for target_year, target_month in months_to_process:
            try:
                # Use cached monthly payroll
                payroll_data = self.get_monthly_payroll(target_year, target_month)
                month_str = f"{target_month:02d}"
                
                # Get ALL budgets for this month (not just employees with payroll)
                all_budgets = self.budget_manager.get_all_budgets(month_str, target_year)
                total_budget = sum(budget_data.get("amount", 0.0) for budget_data in all_budgets.values())
                
                # Calculate actual from payroll data
                total_actual = 0.0
                for emp_id, emp_data in payroll_data.items():
                    total_actual += emp_data["total_amount"]
                
                total_variance = total_actual - total_budget
                
                trend_rows.append({
                    "Month": f"{target_year}-{target_month:02d}",
                    "Total Budget": round(total_budget, 2),
                    "Total Actual": round(total_actual, 2),
                    "Total Variance": round(total_variance, 2),
                    "Variance %": round((total_variance / total_budget * 100) if total_budget > 0 else 0, 2)
                })
            except Exception as e:
                # Log error but don't fail silently - this helps debug budget issues
                import logging
                logging.error(f"Error processing month {target_year}-{target_month:02d}: {e}")
                # If data generation fails for a month, skip it
                continue
        
        # Sort by month (oldest first)
        if trend_rows:
            trend_df = pd.DataFrame(trend_rows)
            trend_df = trend_df.sort_values("Month")
            # Cache the result
            cache.set(cache_key, trend_df, ttl=300)  # 5 minutes
            return trend_df
        
        return pd.DataFrame(trend_rows)


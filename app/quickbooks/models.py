"""Data models for QuickBooks entities."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Employee(BaseModel):
    """Employee model from QuickBooks."""
    id: str
    display_name: str
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    department: Optional[str] = None
    active: bool = True


class PayrollItem(BaseModel):
    """Payroll item model."""
    id: str
    name: str
    type: str  # Salary, Hourly, etc.
    amount: float
    employee_id: str
    employee_name: str
    department: Optional[str] = None
    date: datetime


class TimeActivity(BaseModel):
    """Time activity for hourly employees."""
    id: str
    employee_id: str
    employee_name: str
    hours: float
    rate: float
    amount: float
    date: datetime
    department: Optional[str] = None


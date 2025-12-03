"""QuickBooks Online API client."""
import requests
from typing import Optional, Dict, List
from datetime import datetime, timedelta
import json
from config import settings
from app.quickbooks.models import Employee, PayrollItem, TimeActivity


class QuickBooksClient:
    """Client for interacting with QuickBooks Online API."""
    
    BASE_URL_SANDBOX = "https://sandbox-quickbooks.api.intuit.com"
    BASE_URL_PRODUCTION = "https://quickbooks.api.intuit.com"
    
    def __init__(self, access_token: str, company_id: str):
        """
        Initialize QuickBooks client.
        
        Args:
            access_token: OAuth 2.0 access token
            company_id: QuickBooks company ID
        """
        self.access_token = access_token
        self.company_id = company_id
        self.base_url = (
            self.BASE_URL_SANDBOX 
            if settings.qb_environment == "sandbox" 
            else self.BASE_URL_PRODUCTION
        )
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        """Make API request to QuickBooks."""
        url = f"{self.base_url}/v3/company/{self.company_id}/{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=self.headers)
            elif method == "POST":
                response = requests.post(url, headers=self.headers, json=data)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"QuickBooks API error: {str(e)}")
    
    def get_employees(self) -> List[Employee]:
        """Retrieve all employees from QuickBooks."""
        response = self._make_request("GET", "query?query=SELECT * FROM Employee MAXRESULTS 1000")
        
        employees = []
        if "QueryResponse" in response and "Employee" in response["QueryResponse"]:
            for emp_data in response["QueryResponse"]["Employee"]:
                employee = Employee(
                    id=emp_data.get("Id"),
                    display_name=emp_data.get("DisplayName", ""),
                    given_name=emp_data.get("GivenName"),
                    family_name=emp_data.get("FamilyName"),
                    department=emp_data.get("Department"),
                    active=emp_data.get("Active", True)
                )
                employees.append(employee)
        
        return employees
    
    def get_payroll_data(self, start_date: datetime, end_date: datetime) -> List[PayrollItem]:
        """
        Retrieve payroll data for a date range.
        
        Note: This is a simplified implementation. Actual payroll data
        may require QuickBooks Payroll subscription or integration with
        external payroll providers (Gusto, ADP, etc.).
        """
        payroll_items = []
        
        # Get employees first
        employees = self.get_employees()
        
        # Query TimeActivity for hourly employees
        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")
        
        query = (
            f"SELECT * FROM TimeActivity "
            f"WHERE TxnDate >= '{start_str}' AND TxnDate <= '{end_str}' "
            f"MAXRESULTS 1000"
        )
        
        try:
            response = self._make_request("GET", f"query?query={query}")
            
            if "QueryResponse" in response and "TimeActivity" in response["QueryResponse"]:
                for activity_data in response["QueryResponse"]["TimeActivity"]:
                    # Find employee info
                    emp_ref = activity_data.get("EmployeeRef", {})
                    emp_id = emp_ref.get("value")
                    emp_name = next(
                        (e.display_name for e in employees if e.id == emp_id),
                        emp_ref.get("name", "Unknown")
                    )
                    
                    hours = float(activity_data.get("Hours", 0) or 0)
                    rate = float(activity_data.get("BillableRate", 0) or 0)
                    
                    payroll_item = PayrollItem(
                        id=activity_data.get("Id"),
                        name=activity_data.get("Name", ""),
                        type="Hourly",
                        amount=hours * rate,
                        employee_id=emp_id,
                        employee_name=emp_name,
                        department=activity_data.get("Department"),
                        date=datetime.fromisoformat(activity_data.get("TxnDate", "").replace("Z", "+00:00"))
                    )
                    payroll_items.append(payroll_item)
        except Exception as e:
            print(f"Warning: Could not retrieve TimeActivity data: {e}")
        
        # For salary employees, you would need to query Payroll or Journal entries
        # This is a placeholder - actual implementation depends on QB Payroll subscription
        # or external payroll provider integration
        
        return payroll_items
    
    def get_journal_entries(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Get journal entries for payroll expenses."""
        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")
        
        query = (
            f"SELECT * FROM JournalEntry "
            f"WHERE TxnDate >= '{start_str}' AND TxnDate <= '{end_str}' "
            f"MAXRESULTS 1000"
        )
        
        try:
            response = self._make_request("GET", f"query?query={query}")
            if "QueryResponse" in response and "JournalEntry" in response["QueryResponse"]:
                return response["QueryResponse"]["JournalEntry"]
        except Exception as e:
            print(f"Warning: Could not retrieve JournalEntry data: {e}")
        
        return []


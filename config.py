"""Configuration management for the application."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # QuickBooks API (optional - use mock if not provided)
    qb_client_id: Optional[str] = None
    qb_client_secret: Optional[str] = None
    qb_redirect_uri: str = "http://localhost:8000/auth/callback"
    qb_environment: str = "sandbox"  # sandbox or production
    use_mock_data: bool = True  # Set to False when you have real QuickBooks credentials
    
    # Google Sheets
    google_sheets_credentials_path: Optional[str] = None
    google_sheets_spreadsheet_id: Optional[str] = None
    
    # Application
    app_secret_key: str = "dev-secret-key-change-in-production"
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


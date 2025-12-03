"""Automatic Google Sheets sync on API calls."""
from datetime import datetime
from app.services.sheets_sync import SheetsSyncService
import logging

logger = logging.getLogger(__name__)

# Global sync service instance
_sync_service = None

def get_sync_service():
    """Get or create sync service instance."""
    global _sync_service
    if _sync_service is None:
        _sync_service = SheetsSyncService()
    return _sync_service

def auto_sync_latest_report(year: int, month: int, force: bool = False):
    """
    Automatically sync to Google Sheets if this is the current month.
    
    Args:
        year: Report year
        month: Report month
        force: Force sync even if not current month (default: False)
    """
    try:
        now = datetime.now()
        # Auto-sync if this is the current month or if forced
        if force or (year == now.year and month == now.month):
            sync_service = get_sync_service()
            if sync_service.exporter.sheets_service:
                success = sync_service.sync_latest_report()
                if success:
                    logger.info(f"Auto-synced latest report for {year}-{month:02d}")
                else:
                    logger.warning(f"Auto-sync attempted but failed for {year}-{month:02d}")
            else:
                logger.debug("Google Sheets not configured, skipping auto-sync")
    except Exception as e:
        logger.warning(f"Auto-sync failed: {e}")

def auto_sync_on_data_access():
    """
    Automatically sync latest data when any data is accessed.
    This ensures Google Sheets stays up-to-date.
    """
    try:
        sync_service = get_sync_service()
        if sync_service.exporter.sheets_service:
            # Sync latest report in background (non-blocking)
            sync_service.sync_latest_report()
            logger.debug("Auto-synced on data access")
    except Exception as e:
        logger.debug(f"Auto-sync on access failed (non-critical): {e}")


#!/usr/bin/env python3
"""Test auto-sync functionality."""

from datetime import datetime
from app.api.auto_sync import auto_sync_latest_report, auto_sync_on_data_access
from app.services.sheets_sync import SheetsSyncService

def main():
    print("=" * 60)
    print("Testing Auto-Sync Functionality")
    print("=" * 60)
    print()
    
    # Test 1: Check sync service
    print("1. Checking sync service...")
    sync_service = SheetsSyncService()
    if sync_service.exporter.sheets_service:
        print("   ✅ Google Sheets service initialized")
    else:
        print("   ❌ Google Sheets not configured")
        return
    print()
    
    # Test 2: Auto-sync current month
    print("2. Testing auto-sync for current month...")
    now = datetime.now()
    auto_sync_latest_report(now.year, now.month)
    print(f"   ✅ Auto-sync triggered for {now.year}-{now.month:02d}")
    print()
    
    # Test 3: Auto-sync on data access
    print("3. Testing auto-sync on data access...")
    auto_sync_on_data_access()
    print("   ✅ Auto-sync on data access triggered")
    print()
    
    # Test 4: Manual sync to verify
    print("4. Verifying sync with manual sync...")
    success = sync_service.sync_latest_report()
    if success:
        print("   ✅ Manual sync successful - Google Sheets updated!")
        print()
        print(f"   View your spreadsheet at:")
        print(f"   https://docs.google.com/spreadsheets/d/1mPLCZX8NuhvtP6O4wdp8OgfTP6GJFVr16oT8ik12dBk")
    else:
        print("   ❌ Manual sync failed")
    print()
    
    print("=" * 60)
    print("Auto-sync test complete!")
    print("=" * 60)
    print()
    print("The 'LatestReport' sheet should now be updated with current data.")
    print("Auto-sync will trigger when:")
    print("  - Generating reports for current month")
    print("  - Accessing variance trends")
    print("  - Exporting to Google Sheets")

if __name__ == "__main__":
    main()


#!/usr/bin/env python3
"""Script to manually sync data to Google Sheets."""

import sys
from app.services.sheets_sync import SheetsSyncService

def main():
    """Sync data to Google Sheets."""
    sync_type = sys.argv[1] if len(sys.argv) > 1 else "latest"
    months = int(sys.argv[2]) if len(sys.argv) > 2 else 12
    
    print("=" * 60)
    print("Google Sheets Sync")
    print("=" * 60)
    print()
    
    sync_service = SheetsSyncService()
    
    if not sync_service.exporter.sheets_service:
        print("❌ Google Sheets not initialized!")
        print("   Check your credentials and .env configuration.")
        return
    
    print(f"Syncing type: {sync_type}")
    print()
    
    try:
        if sync_type == "latest":
            print("Syncing latest report...")
            success = sync_service.sync_latest_report()
            if success:
                print("✅ Latest report synced successfully!")
            else:
                print("❌ Failed to sync latest report")
        
        elif sync_type == "current":
            print("Syncing current month...")
            success = sync_service.sync_current_month()
            if success:
                print("✅ Current month synced successfully!")
            else:
                print("❌ Failed to sync current month")
        
        elif sync_type == "historical":
            print(f"Syncing {months} months of historical trends...")
            success = sync_service.sync_historical_trends(months)
            if success:
                print(f"✅ Historical trends synced successfully!")
            else:
                print("❌ Failed to sync historical trends")
        
        elif sync_type == "all":
            print("Syncing all data...")
            results = sync_service.sync_all()
            print()
            print("Results:")
            print(f"  Latest Report: {'✅' if results['latest'] else '❌'}")
            print(f"  Current Month: {'✅' if results['current_month'] else '❌'}")
            print(f"  Historical Trends: {'✅' if results['historical'] else '❌'}")
        
        print()
        print("=" * 60)
        print("Sync complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()


"""Variance report generation utilities."""
import pandas as pd
from typing import Optional


def format_variance_report(df: pd.DataFrame) -> pd.DataFrame:
    """Format variance report for better readability."""
    df_formatted = df.copy()
    
    # Add conditional formatting indicators
    df_formatted["Status"] = df_formatted["Variance"].apply(
        lambda x: "Over Budget" if x > 0 else "Under Budget" if x < 0 else "On Budget"
    )
    
    return df_formatted


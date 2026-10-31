"""
Helper utilities for SMARTCALC.
Provides formatting, rounding, and display helpers.
"""
from datetime import datetime


def format_number(value: float, precision: int = 4, use_grouping: bool = True) -> str:
    """
    Formats a float to a clean string with desired decimal precision.
    Trims trailing zeros after decimal point unless requested.
    """
    if value is None:
        return ""
    
    # Check if whole number
    if abs(value - round(value)) < 1e-12:
        val_int = int(round(value))
        if use_grouping:
            return f"{val_int:,}"
        return str(val_int)
    
    # Format to precision
    formatted = f"{value:.{precision}f}"
    # Strip unnecessary trailing zeroes if precision is flexible
    if "." in formatted:
        formatted = formatted.rstrip("0").rstrip(".")
    
    # Add grouping if needed
    if use_grouping:
        parts = formatted.split(".")
        try:
            parts[0] = f"{int(parts[0]):,}"
            return ".".join(parts)
        except ValueError:
            return formatted
            
    return formatted


def get_timestamp() -> str:
    """Returns current timestamp string in ISO or display format."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

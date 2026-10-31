"""
Validators for SMARTCALC inputs.
Ensures safe parsing of numbers, expressions, and configuration values.
"""
import re
from typing import Tuple, Optional


def validate_number(value_str: str) -> Tuple[bool, Optional[float], Optional[str]]:
    """
    Validates if a string can be safely converted to a float.
    Returns (is_valid, float_val, error_message).
    """
    if not value_str or not value_str.strip():
        return False, None, "Please enter a value"
    
    clean_str = value_str.strip().replace(",", "")
    try:
        val = float(clean_str)
        return True, val, None
    except ValueError:
        return False, None, f"'{value_str}' is not a valid number"


def validate_expression(expr: str) -> Tuple[bool, Optional[str]]:
    """
    Checks that an expression contains only allowed mathematical characters.
    Allowed: digits, +, -, *, /, %, ^, ., (, ), spaces.
    """
    if not expr or not expr.strip():
        return False, "Expression is empty"
    
    # Check for invalid characters
    valid_pattern = re.compile(r"^[0-9+\-*/%^.() \t]+$")
    if not valid_pattern.match(expr):
        return False, "Expression contains invalid characters"
    
    # Check balanced parentheses
    count = 0
    for char in expr:
        if char == "(":
            count += 1
        elif char == ")":
            count -= 1
            if count < 0:
                return False, "Unbalanced parentheses: extra ')'"
    if count != 0:
        return False, "Unbalanced parentheses: missing ')'"
    
    return True, None

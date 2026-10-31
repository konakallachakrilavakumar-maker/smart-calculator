"""
Core calculation engine for SMARTCALC.
Evaluates expressions safely using Python's ast module (no unsafe eval).
Handles operator precedence, division by zero, edge cases, and scientific operations.
"""
import ast
import math
from typing import Union, Tuple, Optional
from utils.validators import validate_expression


class SafeCalculator:
    """
    Safe mathematical evaluator implementing operator precedence,
    standard arithmetic, powers, roots, percentages, and scientific functions.
    """

    ALLOWED_OPERATORS = {
        ast.Add: lambda a, b: a + b,
        ast.Sub: lambda a, b: a - b,
        ast.Mult: lambda a, b: a * b,
        ast.Div: lambda a, b: SafeCalculator._safe_div(a, b),
        ast.Mod: lambda a, b: SafeCalculator._safe_mod(a, b),
        ast.Pow: lambda a, b: SafeCalculator._safe_pow(a, b),
        ast.USub: lambda a: -a,
        ast.UAdd: lambda a: +a,
    }

    @staticmethod
    def _safe_div(a: float, b: float) -> float:
        if abs(b) < 1e-15:
            raise ZeroDivisionError("Cannot divide by zero")
        return a / b

    @staticmethod
    def _safe_mod(a: float, b: float) -> float:
        if abs(b) < 1e-15:
            raise ZeroDivisionError("Cannot calculate modulo by zero")
        return a % b

    @staticmethod
    def _safe_pow(a: float, b: float) -> float:
        try:
            res = a ** b
            if isinstance(res, complex):
                raise ValueError("Complex numbers are not supported")
            if math.isinf(res) or math.isnan(res):
                raise OverflowError("Result is too large")
            return res
        except OverflowError:
            raise OverflowError("Number overflow in power operation")

    @classmethod
    def _eval_ast_node(cls, node) -> float:
        if isinstance(node, ast.Expression):
            return cls._eval_ast_node(node.body)

        elif isinstance(node, ast.Constant):  # Python 3.8+
            if isinstance(node.value, (int, float)):
                return float(node.value)
            raise ValueError(f"Unsupported constant type: {type(node.value)}")

        elif isinstance(node, ast.Num):  # Legacy fallback
            return float(node.n)

        elif isinstance(node, ast.BinOp):
            op_type = type(node.op)
            if op_type not in cls.ALLOWED_OPERATORS:
                raise ValueError(f"Operator {op_type.__name__} is not allowed")
            left = cls._eval_ast_node(node.left)
            right = cls._eval_ast_node(node.right)
            return cls.ALLOWED_OPERATORS[op_type](left, right)

        elif isinstance(node, ast.UnaryOp):
            op_type = type(node.op)
            if op_type not in cls.ALLOWED_OPERATORS:
                raise ValueError(f"Unary operator {op_type.__name__} is not allowed")
            operand = cls._eval_ast_node(node.operand)
            return cls.ALLOWED_OPERATORS[op_type](operand)

        else:
            raise ValueError(f"Disallowed expression element: {type(node).__name__}")

    @classmethod
    def evaluate(cls, expression: str) -> Tuple[bool, Optional[float], Optional[str]]:
        """
        Parses and evaluates an expression safely.
        Replaces standard user symbols like '^' with '**', '×' with '*', '÷' with '/'.
        Returns (success, result_float, error_message).
        """
        if not expression or not expression.strip():
            return False, None, "Expression is empty"

        # Sanitize symbols
        expr = expression.replace("×", "*").replace("÷", "/").replace("^", "**")
        
        # Check basic syntax
        valid, err = validate_expression(expr.replace("**", "^"))
        if not valid:
            return False, None, err

        try:
            parsed = ast.parse(expr, mode="eval")
            result = cls._eval_ast_node(parsed)
            
            if math.isinf(result) or math.isnan(result):
                return False, None, "Calculation resulted in infinity or undefined"
                
            return True, float(result), None
        except ZeroDivisionError as e:
            return False, None, str(e)
        except OverflowError as e:
            return False, None, str(e)
        except SyntaxError:
            return False, None, "Malformed mathematical expression"
        except Exception as e:
            return False, None, f"Error: {str(e)}"

    @staticmethod
    def square(value: float) -> Tuple[bool, Optional[float], Optional[str]]:
        """Calculates value squared (x^2)."""
        try:
            res = value ** 2
            if math.isinf(res):
                return False, None, "Result overflowed"
            return True, res, None
        except OverflowError:
            return False, None, "Result overflowed"

    @staticmethod
    def square_root(value: float) -> Tuple[bool, Optional[float], Optional[str]]:
        """Calculates square root (sqrt(x))."""
        if value < 0:
            return False, None, "Cannot calculate square root of a negative number"
        return True, math.sqrt(value), None

    @staticmethod
    def percentage(value: float, base: Optional[float] = None) -> Tuple[bool, Optional[float], Optional[str]]:
        """
        Calculates percentage.
        If base is provided: (base * value) / 100
        If base is None: value / 100
        """
        if base is not None:
            return True, (base * value) / 100.0, None
        return True, value / 100.0, None

    @staticmethod
    def reciprocal(value: float) -> Tuple[bool, Optional[float], Optional[str]]:
        """Calculates 1/x."""
        if abs(value) < 1e-15:
            return False, None, "Cannot divide by zero"
        return True, 1.0 / value, None

    @staticmethod
    def negate(value: float) -> Tuple[bool, Optional[float], Optional[str]]:
        """Inverts sign of a number."""
        return True, -value, None

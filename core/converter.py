"""
Unit conversion engine for SMARTCALC.
Supports Length, Weight, Temperature, Speed, Time, Area, and Volume.
Uses base-unit normalizations and dedicated formulas for temperature.
"""
from typing import Dict, List, Tuple, Optional


class UnitConverter:
    """
    Comprehensive conversion system with high-precision factors.
    """

    # Conversion factors to standard base units:
    # Length base: Meter (m)
    LENGTH_FACTORS: Dict[str, float] = {
        "Kilometers": 1000.0,
        "Meters": 1.0,
        "Centimeters": 0.01,
        "Millimeters": 0.001,
        "Miles": 1609.344,
        "Yards": 0.9144,
        "Feet": 0.3048,
        "Inches": 0.0254,
    }

    # Weight base: Kilogram (kg)
    WEIGHT_FACTORS: Dict[str, float] = {
        "Kilograms": 1.0,
        "Grams": 0.001,
        "Milligrams": 0.000001,
        "Pounds": 0.45359237,
        "Ounces": 0.028349523125,
    }

    # Speed base: Meters per second (m/s)
    SPEED_FACTORS: Dict[str, float] = {
        "Kilometers/hour": 1000.0 / 3600.0,
        "Miles/hour": 1609.344 / 3600.0,
        "Meters/second": 1.0,
        "Knots": 1852.0 / 3600.0,
    }

    # Time base: Second (s)
    TIME_FACTORS: Dict[str, float] = {
        "Seconds": 1.0,
        "Minutes": 60.0,
        "Hours": 3600.0,
        "Days": 86400.0,
        "Weeks": 604800.0,
    }

    # Area base: Square meter (m²)
    AREA_FACTORS: Dict[str, float] = {
        "Square meters": 1.0,
        "Square kilometers": 1000000.0,
        "Square feet": 0.09290304,
        "Acres": 4046.8564224,
        "Hectares": 10000.0,
    }

    # Volume base: Liter (L)
    VOLUME_FACTORS: Dict[str, float] = {
        "Liters": 1.0,
        "Milliliters": 0.001,
        "Cubic meters": 1000.0,
        "Gallons": 3.785411784,
        "Cups": 0.2365882365,
    }

    CATEGORIES = {
        "Length": LENGTH_FACTORS,
        "Weight": WEIGHT_FACTORS,
        "Temperature": ["Celsius", "Fahrenheit", "Kelvin"],
        "Speed": SPEED_FACTORS,
        "Time": TIME_FACTORS,
        "Area": AREA_FACTORS,
        "Volume": VOLUME_FACTORS,
    }

    @classmethod
    def get_categories(cls) -> List[str]:
        """Returns all supported category names."""
        return list(cls.CATEGORIES.keys())

    @classmethod
    def get_units(cls, category: str) -> List[str]:
        """Returns the list of units for a category."""
        units_def = cls.CATEGORIES.get(category)
        if isinstance(units_def, dict):
            return list(units_def.keys())
        elif isinstance(units_def, list):
            return units_def
        return []

    @classmethod
    def convert_temperature(cls, value: float, from_unit: str, to_unit: str) -> float:
        """
        Converts temperature between Celsius, Fahrenheit, and Kelvin.
        """
        if from_unit == to_unit:
            return value

        # Convert from source to Celsius first
        if from_unit == "Celsius":
            celsius = value
        elif from_unit == "Fahrenheit":
            celsius = (value - 32.0) * (5.0 / 9.0)
        elif from_unit == "Kelvin":
            celsius = value - 273.15
        else:
            raise ValueError(f"Unknown temperature unit: {from_unit}")

        # Convert from Celsius to target
        if to_unit == "Celsius":
            return celsius
        elif to_unit == "Fahrenheit":
            return (celsius * (9.0 / 5.0)) + 32.0
        elif to_unit == "Kelvin":
            return celsius + 273.15
        else:
            raise ValueError(f"Unknown temperature unit: {to_unit}")

    @classmethod
    def convert(cls, category: str, value: float, from_unit: str, to_unit: str) -> Tuple[bool, Optional[float], Optional[str]]:
        """
        Performs conversion between units in any category.
        Returns (success, converted_value, formula_description).
        """
        if category not in cls.CATEGORIES:
            return False, None, f"Unknown category '{category}'"

        if from_unit == to_unit:
            return True, value, f"1 {from_unit} = 1 {to_unit}"

        # Handle temperature specifically
        if category == "Temperature":
            try:
                res = cls.convert_temperature(value, from_unit, to_unit)
                # Absolute zero check
                if to_unit == "Kelvin" and res < 0:
                    return False, None, "Temperature cannot be below Absolute Zero (0 K)"
                if from_unit == "Kelvin" and value < 0:
                    return False, None, "Kelvin cannot be negative"
                    
                formula_map = {
                    ("Celsius", "Fahrenheit"): f"({value} °C × 9/5) + 32 = {res:.4f} °F",
                    ("Fahrenheit", "Celsius"): f"({value} °F - 32) × 5/9 = {res:.4f} °C",
                    ("Celsius", "Kelvin"): f"{value} °C + 273.15 = {res:.4f} K",
                    ("Kelvin", "Celsius"): f"{value} K - 273.15 = {res:.4f} °C",
                    ("Fahrenheit", "Kelvin"): f"({value} °F - 32) × 5/9 + 273.15 = {res:.4f} K",
                    ("Kelvin", "Fahrenheit"): f"({value} K - 273.15) × 9/5 + 32 = {res:.4f} °F",
                }
                desc = formula_map.get((from_unit, to_unit), f"{value} {from_unit} = {res:.4f} {to_unit}")
                return True, res, desc
            except Exception as e:
                return False, None, str(e)

        # Standard linear factor conversion
        factors: Dict[str, float] = cls.CATEGORIES[category]  # type: ignore
        if from_unit not in factors or to_unit not in factors:
            return False, None, f"Invalid units for {category}"

        # Convert to base, then to target
        from_factor = factors[from_unit]
        to_factor = factors[to_unit]
        base_value = value * from_factor
        converted = base_value / to_factor
        
        ratio = from_factor / to_factor
        desc = f"1 {from_unit} = {ratio:.6g} {to_unit}"
        return True, converted, desc

"""
Unit tests for SMARTCALC core engines, validators, and persistence.
Run with: python3 -m unittest tests/test_smartcalc.py
"""
import unittest
import os
import shutil
import tempfile

from core.calculator import SafeCalculator
from core.converter import UnitConverter
from core.history_manager import HistoryManager
from utils.validators import validate_number, validate_expression
from utils.helpers import format_number


class TestCalculatorEngine(unittest.TestCase):
    def test_basic_arithmetic(self):
        s, res, _ = SafeCalculator.evaluate("10 + 25")
        self.assertTrue(s)
        self.assertEqual(res, 35.0)

        s, res, _ = SafeCalculator.evaluate("100 - 45.5")
        self.assertTrue(s)
        self.assertEqual(res, 54.5)

        s, res, _ = SafeCalculator.evaluate("8 * 12")
        self.assertTrue(s)
        self.assertEqual(res, 96.0)

        s, res, _ = SafeCalculator.evaluate("144 / 12")
        self.assertTrue(s)
        self.assertEqual(res, 12.0)

    def test_precedence_and_grouping(self):
        s, res, _ = SafeCalculator.evaluate("2 + 3 * 4")
        self.assertTrue(s)
        self.assertEqual(res, 14.0)

        s, res, _ = SafeCalculator.evaluate("(2 + 3) * 4")
        self.assertTrue(s)
        self.assertEqual(res, 20.0)

    def test_power_and_modulo(self):
        s, res, _ = SafeCalculator.evaluate("2 ^ 8")
        self.assertTrue(s)
        self.assertEqual(res, 256.0)

        s, res, _ = SafeCalculator.evaluate("17 % 5")
        self.assertTrue(s)
        self.assertEqual(res, 2.0)

    def test_division_by_zero(self):
        s, res, err = SafeCalculator.evaluate("42 / 0")
        self.assertFalse(s)
        self.assertIn("zero", err.lower())

        s, res, err = SafeCalculator.evaluate("42 % 0")
        self.assertFalse(s)
        self.assertIn("zero", err.lower())

    def test_unary_operations(self):
        s, res, _ = SafeCalculator.square(15)
        self.assertTrue(s)
        self.assertEqual(res, 225.0)

        s, res, _ = SafeCalculator.square_root(144)
        self.assertTrue(s)
        self.assertEqual(res, 12.0)

        s, res, err = SafeCalculator.square_root(-9)
        self.assertFalse(s)
        self.assertIn("negative", err.lower())

        s, res, _ = SafeCalculator.reciprocal(4)
        self.assertTrue(s)
        self.assertEqual(res, 0.25)

        s, res, err = SafeCalculator.reciprocal(0)
        self.assertFalse(s)

        s, res, _ = SafeCalculator.negate(42)
        self.assertTrue(s)
        self.assertEqual(res, -42.0)

    def test_percentage(self):
        s, res, _ = SafeCalculator.percentage(50, 200)
        self.assertTrue(s)
        self.assertEqual(res, 100.0)

        s, res, _ = SafeCalculator.percentage(25)
        self.assertTrue(s)
        self.assertEqual(res, 0.25)


class TestUnitConverter(unittest.TestCase):
    def test_length_conversion(self):
        s, res, _ = UnitConverter.convert("Length", 1, "Kilometers", "Meters")
        self.assertTrue(s)
        self.assertEqual(res, 1000.0)

        s, res, _ = UnitConverter.convert("Length", 1, "Miles", "Kilometers")
        self.assertTrue(s)
        self.assertAlmostEqual(res, 1.609344, places=4)

    def test_weight_conversion(self):
        s, res, _ = UnitConverter.convert("Weight", 1, "Kilograms", "Grams")
        self.assertTrue(s)
        self.assertEqual(res, 1000.0)

        s, res, _ = UnitConverter.convert("Weight", 1, "Pounds", "Ounces")
        self.assertTrue(s)
        self.assertAlmostEqual(res, 16.0, places=2)

    def test_temperature_conversion(self):
        # 0 C = 32 F
        s, res, _ = UnitConverter.convert("Temperature", 0, "Celsius", "Fahrenheit")
        self.assertTrue(s)
        self.assertEqual(res, 32.0)

        # 100 C = 212 F
        s, res, _ = UnitConverter.convert("Temperature", 100, "Celsius", "Fahrenheit")
        self.assertTrue(s)
        self.assertEqual(res, 212.0)

        # 0 C = 273.15 K
        s, res, _ = UnitConverter.convert("Temperature", 0, "Celsius", "Kelvin")
        self.assertTrue(s)
        self.assertEqual(res, 273.15)

        # Negative Kelvin check
        s, res, err = UnitConverter.convert("Temperature", -10, "Kelvin", "Celsius")
        self.assertFalse(s)
        self.assertIn("Kelvin cannot be negative", err)

    def test_speed_conversion(self):
        s, res, _ = UnitConverter.convert("Speed", 36, "Kilometers/hour", "Meters/second")
        self.assertTrue(s)
        self.assertAlmostEqual(res, 10.0, places=4)

    def test_time_conversion(self):
        s, res, _ = UnitConverter.convert("Time", 2, "Hours", "Minutes")
        self.assertTrue(s)
        self.assertEqual(res, 120.0)

        s, res, _ = UnitConverter.convert("Time", 1, "Weeks", "Days")
        self.assertTrue(s)
        self.assertEqual(res, 7.0)

    def test_area_conversion(self):
        s, res, _ = UnitConverter.convert("Area", 1, "Square kilometers", "Hectares")
        self.assertTrue(s)
        self.assertEqual(res, 100.0)

    def test_volume_conversion(self):
        s, res, _ = UnitConverter.convert("Volume", 1, "Cubic meters", "Liters")
        self.assertTrue(s)
        self.assertEqual(res, 1000.0)


class TestPersistence(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.hm = HistoryManager(data_dir=self.temp_dir)

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_history_crud(self):
        entry1 = self.hm.add_calculation("25 + 75", "100")
        entry2 = self.hm.add_conversion("Length", "10", "Meters", "1000", "Centimeters", "1 m = 100 cm")

        history = self.hm.load_history()
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0]["id"], entry2["id"])

        # Delete one
        self.hm.delete_item(entry1["id"])
        self.assertEqual(len(self.hm.load_history()), 1)

        # Clear all
        self.hm.clear_history()
        self.assertEqual(len(self.hm.load_history()), 0)

    def test_settings_save_and_load(self):
        settings = self.hm.load_settings()
        self.assertEqual(settings.get("theme"), "dark")

        settings["theme"] = "light"
        settings["decimal_precision"] = 6
        self.hm.save_settings(settings)

        reloaded = self.hm.load_settings()
        self.assertEqual(reloaded["theme"], "light")
        self.assertEqual(reloaded["decimal_precision"], 6)


class TestFormattingAndValidators(unittest.TestCase):
    def test_format_number(self):
        self.assertEqual(format_number(1234567.89, precision=2), "1,234,567.89")
        self.assertEqual(format_number(100.0, precision=4), "100")
        self.assertEqual(format_number(0.0004567, precision=4), "0.0005")

    def test_validators(self):
        v, num, _ = validate_number("1,250.75")
        self.assertTrue(v)
        self.assertEqual(num, 1250.75)

        v, num, err = validate_number("abc")
        self.assertFalse(v)
        self.assertIsNotNone(err)

        v, err = validate_expression("2 + (3 * 4)")
        self.assertTrue(v)
        self.assertIsNone(err)

        v, err = validate_expression("2 + (3 * 4")
        self.assertFalse(v)
        self.assertIn("Unbalanced", err)


if __name__ == "__main__":
    unittest.main()

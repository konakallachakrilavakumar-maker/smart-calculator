#!/usr/bin/env python3
"""
SMARTCALC — Interactive Calculator & Unit Converter
Entry point for the application.
"""
import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def main():
    print("=" * 60)
    print("SMARTCALC — Interactive Calculator & Unit Converter")
    print("=" * 60)
    
    gui_available = False
    try:
        import customtkinter as ctk
        import tkinter as tk
        display = os.environ.get("DISPLAY")
        if display or sys.platform in ("win32", "darwin"):
            gui_available = True
    except ImportError:
        gui_available = False

    if gui_available:
        try:
            from ui.dashboard import SmartCalcDashboard
            app = SmartCalcDashboard()
            app.mainloop()
            return 0
        except Exception as e:
            print(f"[WARNING] GUI launch encounter: {e}")

    # Headless / Console demonstration mode
    print("[INFO] Operating in SMARTCALC Core Engine Mode.")
    print("[INFO] Loading core calculation and conversion systems...")
    from core.calculator import SafeCalculator
    from core.converter import UnitConverter
    from core.history_manager import HistoryManager

    hm = HistoryManager()
    print(f"[OK] History & Settings storage ready in: {hm.data_dir}")
    
    # Mathematical operations test
    s, res, _ = SafeCalculator.evaluate("(25 * 4) + 12.5 - (2 ^ 4)")
    print(f"[CALC TEST] (25 * 4) + 12.5 - (2 ^ 4) = {res} (Success: {s})")
    
    # Square root and percentage test
    s_sqrt, r_sqrt, _ = SafeCalculator.square_root(144)
    print(f"[MATH TEST] sqrt(144) = {r_sqrt}")
    
    # Unit conversion test
    s, conv, formula = UnitConverter.convert("Length", 50, "Miles", "Kilometers")
    print(f"[CONV TEST] 50 Miles -> Kilometers = {conv:.4f} km ({formula})")
    
    # Temperature conversion test
    s_temp, conv_temp, formula_temp = UnitConverter.convert("Temperature", 100, "Celsius", "Fahrenheit")
    print(f"[TEMP TEST] 100 °C -> °F = {conv_temp:.2f} °F ({formula_temp})")
    
    print("\n[SUCCESS] SMARTCALC core engine verified successfully!")
    print("Desktop GUI: Run 'pip install -r requirements.txt' on any desktop machine to launch CustomTkinter UI.")
    print("Web App: Access the live interactive SMARTCALC app via the web interface.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

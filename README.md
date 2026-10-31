# SMARTCALC — Interactive Calculator & Unit Converter

SMARTCALC is a modern, professional desktop utility and dual-platform productivity application. Designed with glassmorphism aesthetics, deep charcoal backgrounds, electric-violet and cyber-blue accents, smooth micro-interactions, and robust mathematical foundations.

---

## Key Features

### 1. Standard & Scientific Calculator
- **Core Arithmetic**: Addition (`+`), Subtraction (`-`), Multiplication (`×`), Division (`÷`).
- **Advanced Operations**: Modulo (`%`), Power ($x^y$, $x^2$), Square root ($\sqrt{x}$), Reciprocal ($1/x$).
- **Sign & Percentage Handling**: Instant toggle ($\pm$) and context-aware percentage calculations.
- **Operator Precedence**: Multi-tier algebraic evaluation without using insecure `eval()`.
- **Fault-Tolerant Math**: Zero-division protection, negative square root prevention, and overflow bounds.
- **Live Memory Register**: Memory Clear (`MC`), Memory Recall (`MR`), Memory Add (`M+`).
- **Keyboard Shortcuts**: Full numpad and keyboard bindings (digits, Enter, Backspace, Escape).

### 2. Comprehensive Unit Converter
Covers **7 primary measurement categories** with real-time conversion and formula explanations:
- **Length**: Kilometers, Meters, Centimeters, Millimeters, Miles, Yards, Feet, Inches
- **Weight**: Kilograms, Grams, Milligrams, Pounds, Ounces
- **Temperature**: Celsius, Fahrenheit, Kelvin (including absolute zero constraints)
- **Speed**: Kilometers/hour, Miles/hour, Meters/second, Knots
- **Time**: Seconds, Minutes, Hours, Days, Weeks
- **Area**: Square meters, Square kilometers, Square feet, Acres, Hectares
- **Volume**: Liters, Milliliters, Cubic meters, Gallons, Cups

Additional converter features:
- **One-click Swap ($\rightleftarrows$)**: Instantly switch source and target units.
- **Conversion Formula Card**: Transparent mathematical explanation and unit ratios.
- **Instant Result Copying**: Fast clipboard export with visual confirmation.

### 3. Persistent History Manager
- Stores all previous calculations and conversions with accurate timestamps.
- One-click **Reuse**: Transfer historical results straight into the active calculator or converter.
- Individual deletion and **Clear All** modal confirmation.
- Saved directly to structured JSON (`data/history.json`).

### 4. Customizable Preferences & Themes
- Dual theme support: Dark glassmorphism and Light mode.
- Multiple accent themes: Electric Violet, Cyber Blue, Emerald Green, Sunset Amber, Rose Quartz.
- Adjustable decimal precision: 0 to 8 decimal places.
- Number grouping toggles (e.g. `1,250,000`).
- User settings saved to `data/settings.json`.

---

## Technology Stack

- **Core Language**: Python 3.10+
- **Desktop GUI**: CustomTkinter & Tkinter
- **Math Engine**: Python `math` and `ast` (Abstract Syntax Tree safe evaluation)
- **Data Persistence**: JSON-based storage for history and user preferences
- **Web Applet**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion

---

## Project Structure

```
SMARTCALC/
│
├── main.py                     # Primary desktop entry point & CLI verification
├── requirements.txt            # Python dependencies (customtkinter, pillow)
├── README.md                   # Complete documentation
│
├── core/                       # Pure logic and business layer
│   ├── __init__.py
│   ├── calculator.py          # Safe AST calculator engine
│   ├── converter.py           # 7-category unit converter engine
│   └── history_manager.py     # JSON history and settings persistence
│
├── ui/                         # CustomTkinter GUI views
│   ├── __init__.py
│   ├── dashboard.py           # Main window with sidebar navigation
│   ├── calculator_view.py     # Calculator interface with keypad
│   ├── converter_view.py      # Unit converter interface
│   ├── history_view.py        # Scrollable history ledger
│   └── settings_view.py       # Preferences and configuration
│
├── utils/                      # Helper utilities
│   ├── __init__.py
│   ├── validators.py          # Input & expression sanitizers
│   └── helpers.py             # Number formatters & timestamps
│
├── data/                       # Persistent JSON storage
│   ├── history.json           # Historical calculation records
│   └── settings.json          # User settings and theme preferences
│
└── tests/
    └── test_smartcalc.py      # Automated test suite (17 comprehensive tests)
```

---

## Installation & Running

### Requirements
- Python 3.10 or higher
- `pip` package manager

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Desktop Application
```bash
python main.py
```

### 3. Run Test Suite
```bash
python3 -m unittest tests/test_smartcalc.py
```

---

## Future Enhancements
- Graphing mode for 2D algebraic functions ($f(x)$).
- Currency conversion with live exchange rate API sync.
- Programmer mode with HEX, BIN, and OCT bitwise operations.

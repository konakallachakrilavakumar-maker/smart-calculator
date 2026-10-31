"""
Calculator view for SMARTCALC.
Modern desktop CustomTkinter view with expression display, live evaluation,
memory buttons, full scientific & arithmetic keypad, and keyboard support.
"""
import tkinter as tk
from tkinter import messagebox
try:
    import customtkinter as ctk
    BaseFrame = ctk.CTkFrame
except ImportError:
    import tkinter as ctk
    BaseFrame = tk.Frame

from core.calculator import SafeCalculator
from utils.helpers import format_number


class CalculatorView(BaseFrame):
    """Interactive calculator interface with dark-glass styling."""

    def __init__(self, master, history_manager, settings_manager, on_history_updated=None, **kwargs):
        super().__init__(master, **kwargs)
        self.history_manager = history_manager
        self.settings_manager = settings_manager
        self.on_history_updated = on_history_updated

        self.current_expression = ""
        self.last_result = None
        self.memory_val = 0.0

        self._setup_ui()

    def _setup_ui(self):
        # Configure layout grid
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)

        # 1. Header & Mode
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", padx=24, pady=(20, 10))
        
        title_lbl = ctk.CTkLabel(
            header_frame,
            text="Standard & Scientific Calculator",
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold"),
            text_color="#F8FAFC"
        )
        title_lbl.pack(side="left")

        # 2. Display Glass Panel
        display_panel = ctk.CTkFrame(
            self,
            fg_color="#18181B",
            corner_radius=14,
            border_width=1,
            border_color="#27272A"
        )
        display_panel.grid(row=1, column=0, sticky="ew", padx=24, pady=10)

        # Expression label (top)
        self.expr_label = ctk.CTkLabel(
            display_panel,
            text="",
            font=ctk.CTkFont(family="Consolas", size=14),
            text_color="#A1A1AA",
            anchor="e"
        )
        self.expr_label.pack(fill="x", padx=20, pady=(16, 4))

        # Main Result / Active input label
        self.result_label = ctk.CTkLabel(
            display_panel,
            text="0",
            font=ctk.CTkFont(family="Consolas", size=36, weight="bold"),
            text_color="#FFFFFF",
            anchor="e"
        )
        self.result_label.pack(fill="x", padx=20, pady=(0, 8))

        # Status / error message strip
        self.status_label = ctk.CTkLabel(
            display_panel,
            text="",
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color="#F43F5E",
            anchor="e"
        )
        self.status_label.pack(fill="x", padx=20, pady=(0, 12))

        # 3. Keypad Grid Container
        keypad = ctk.CTkFrame(self, fg_color="transparent")
        keypad.grid(row=2, column=0, sticky="nsew", padx=24, pady=(10, 20))

        for col in range(5):
            keypad.grid_columnconfigure(col, weight=1)
        for row in range(6):
            keypad.grid_rowconfigure(row, weight=1)

        # Button Layout definition
        # [Text, Row, Col, Command, Type: 'num' | 'op' | 'action' | 'special']
        buttons = [
            # Row 0: Memory & Powers
            ("MC", 0, 0, self._mem_clear, "action"),
            ("MR", 0, 1, self._mem_recall, "action"),
            ("M+", 0, 2, self._mem_add, "action"),
            ("x²", 0, 3, self._op_square, "op"),
            ("√x", 0, 4, self._op_sqrt, "op"),

            # Row 1: Scientific & Clears
            ("C", 1, 0, self._clear_all, "special"),
            ("CE", 1, 1, self._clear_entry, "special"),
            ("⌫", 1, 2, self._backspace, "special"),
            ("%", 1, 3, lambda: self._append_op("%"), "op"),
            ("÷", 1, 4, lambda: self._append_op("÷"), "op"),

            # Row 2
            ("7", 2, 0, lambda: self._append_num("7"), "num"),
            ("8", 2, 1, lambda: self._append_num("8"), "num"),
            ("9", 2, 2, lambda: self._append_num("9"), "num"),
            ("^", 2, 3, lambda: self._append_op("^"), "op"),
            ("×", 2, 4, lambda: self._append_op("×"), "op"),

            # Row 3
            ("4", 3, 0, lambda: self._append_num("4"), "num"),
            ("5", 3, 1, lambda: self._append_num("5"), "num"),
            ("6", 3, 2, lambda: self._append_num("6"), "num"),
            ("1/x", 3, 3, self._op_reciprocal, "op"),
            ("-", 3, 4, lambda: self._append_op("-"), "op"),

            # Row 4
            ("1", 4, 0, lambda: self._append_num("1"), "num"),
            ("2", 4, 1, lambda: self._append_num("2"), "num"),
            ("3", 4, 2, lambda: self._append_num("3"), "num"),
            ("(", 4, 3, lambda: self._append_op("("), "op"),
            ("+", 4, 4, lambda: self._append_op("+"), "op"),

            # Row 5
            ("±", 5, 0, self._toggle_sign, "num"),
            ("0", 5, 1, lambda: self._append_num("0"), "num"),
            (".", 5, 2, lambda: self._append_num("."), "num"),
            (")", 5, 3, lambda: self._append_op(")"), "op"),
            ("=", 5, 4, self._calculate, "accent"),
        ]

        accent = self.settings_manager.load_settings().get("accent_color", "#7C3AED")

        for (text, r, c, cmd, btype) in buttons:
            if btype == "num":
                fg = "#27272A"
                hover = "#3F3F46"
                txt_c = "#FFFFFF"
            elif btype == "op":
                fg = "#1F2438"
                hover = "#2D3450"
                txt_c = "#93C5FD"
            elif btype == "special":
                fg = "#2A1820"
                hover = "#3D202D"
                txt_c = "#FB7185"
            elif btype == "accent":
                fg = accent
                hover = "#6D28D9"
                txt_c = "#FFFFFF"
            else:  # action
                fg = "#18181B"
                hover = "#27272A"
                txt_c = "#A1A1AA"

            btn = ctk.CTkButton(
                keypad,
                text=text,
                command=cmd,
                font=ctk.CTkFont(family="Segoe UI", size=16, weight="bold" if btype in ("accent", "num") else "normal"),
                fg_color=fg,
                hover_color=hover,
                text_color=txt_c,
                corner_radius=10,
                height=48
            )
            btn.grid(row=r, column=c, padx=4, pady=4, sticky="nsew")

    def _append_num(self, char: str):
        self.status_label.configure(text="")
        if self.current_expression == "0" and char != ".":
            self.current_expression = char
        else:
            self.current_expression += char
        self.result_label.configure(text=self.current_expression or "0")

    def _append_op(self, op: str):
        self.status_label.configure(text="")
        if not self.current_expression:
            if self.last_result is not None:
                self.current_expression = str(self.last_result) + f" {op} "
            elif op == "-":
                self.current_expression = "-"
            else:
                return
        else:
            self.current_expression += f" {op} "
        self.result_label.configure(text=self.current_expression)

    def _clear_all(self):
        self.current_expression = ""
        self.last_result = None
        self.expr_label.configure(text="")
        self.result_label.configure(text="0")
        self.status_label.configure(text="")

    def _clear_entry(self):
        self.current_expression = ""
        self.result_label.configure(text="0")
        self.status_label.configure(text="")

    def _backspace(self):
        if self.current_expression:
            self.current_expression = self.current_expression.rstrip()
            if self.current_expression:
                self.current_expression = self.current_expression[:-1].rstrip()
            self.result_label.configure(text=self.current_expression or "0")

    def _calculate(self):
        if not self.current_expression.strip():
            return

        settings = self.settings_manager.load_settings()
        prec = settings.get("decimal_precision", 4)
        grouping = settings.get("use_grouping", True)

        success, val, err = SafeCalculator.evaluate(self.current_expression)
        if success and val is not None:
            formatted = format_number(val, precision=prec, use_grouping=grouping)
            self.expr_label.configure(text=f"{self.current_expression} =")
            self.result_label.configure(text=formatted)
            self.status_label.configure(text="")
            
            # Record in history
            self.history_manager.add_calculation(self.current_expression, formatted)
            if self.on_history_updated:
                self.on_history_updated()

            self.last_result = val
            self.current_expression = str(val)
        else:
            self.status_label.configure(text=err or "Calculation error")

    def _op_square(self):
        try:
            val = float(self.current_expression or self.last_result or 0)
            success, res, err = SafeCalculator.square(val)
            if success and res is not None:
                self._update_unary_result(f"({val})²", res)
            else:
                self.status_label.configure(text=err or "Error")
        except ValueError:
            self.status_label.configure(text="Invalid number for squaring")

    def _op_sqrt(self):
        try:
            val = float(self.current_expression or self.last_result or 0)
            success, res, err = SafeCalculator.square_root(val)
            if success and res is not None:
                self._update_unary_result(f"√({val})", res)
            else:
                self.status_label.configure(text=err or "Error")
        except ValueError:
            self.status_label.configure(text="Invalid number for square root")

    def _op_reciprocal(self):
        try:
            val = float(self.current_expression or self.last_result or 0)
            success, res, err = SafeCalculator.reciprocal(val)
            if success and res is not None:
                self._update_unary_result(f"1/({val})", res)
            else:
                self.status_label.configure(text=err or "Error")
        except ValueError:
            self.status_label.configure(text="Invalid number for reciprocal")

    def _toggle_sign(self):
        try:
            if not self.current_expression:
                return
            if self.current_expression.startswith("-"):
                self.current_expression = self.current_expression[1:]
            else:
                self.current_expression = "-" + self.current_expression
            self.result_label.configure(text=self.current_expression)
        except Exception:
            pass

    def _update_unary_result(self, expr_txt: str, result_val: float):
        settings = self.settings_manager.load_settings()
        prec = settings.get("decimal_precision", 4)
        grouping = settings.get("use_grouping", True)
        formatted = format_number(result_val, precision=prec, use_grouping=grouping)

        self.expr_label.configure(text=f"{expr_txt} =")
        self.result_label.configure(text=formatted)
        self.status_label.configure(text="")
        self.history_manager.add_calculation(expr_txt, formatted)
        if self.on_history_updated:
            self.on_history_updated()
        self.last_result = result_val
        self.current_expression = str(result_val)

    def _mem_clear(self):
        self.memory_val = 0.0
        self.status_label.configure(text="Memory Cleared")

    def _mem_recall(self):
        self.current_expression = str(self.memory_val)
        self.result_label.configure(text=self.current_expression)
        self.status_label.configure(text=f"MR: {self.memory_val}")

    def _mem_add(self):
        try:
            val = float(self.current_expression or self.last_result or 0)
            self.memory_val += val
            self.status_label.configure(text=f"M+ Added (Total: {self.memory_val})")
        except ValueError:
            pass

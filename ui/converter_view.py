"""
Unit converter view for SMARTCALC.
Provides 7 conversion categories: Length, Weight, Temperature, Speed, Time, Area, Volume.
Instant conversions, swap affordances, clear functionality, and formula explanation.
"""
import tkinter as tk
try:
    import customtkinter as ctk
    BaseFrame = ctk.CTkFrame
except ImportError:
    import tkinter as ctk
    BaseFrame = tk.Frame

from core.converter import UnitConverter
from utils.validators import validate_number
from utils.helpers import format_number


class ConverterView(BaseFrame):
    """Modern CustomTkinter unit converter module."""

    def __init__(self, master, history_manager, settings_manager, on_history_updated=None, **kwargs):
        super().__init__(master, **kwargs)
        self.history_manager = history_manager
        self.settings_manager = settings_manager
        self.on_history_updated = on_history_updated

        self.categories = UnitConverter.get_categories()
        self.current_category = self.categories[0]

        self._setup_ui()

    def _setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)

        # 1. Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, sticky="ew", padx=24, pady=(20, 10))

        title = ctk.CTkLabel(
            header,
            text="Universal Unit Converter",
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold"),
            text_color="#F8FAFC"
        )
        title.pack(side="left")

        # Category segmented bar
        self.category_seg = ctk.CTkSegmentedButton(
            self,
            values=self.categories,
            command=self._on_category_changed,
            selected_color="#7C3AED",
            selected_hover_color="#6D28D9",
            unselected_color="#27272A",
            unselected_hover_color="#3F3F46",
            text_color="#FFFFFF",
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold")
        )
        self.category_seg.set(self.current_category)
        self.category_seg.grid(row=1, column=0, sticky="ew", padx=24, pady=10)

        # 2. Main Converter Box
        box = ctk.CTkFrame(
            self,
            fg_color="#18181B",
            corner_radius=14,
            border_width=1,
            border_color="#27272A"
        )
        box.grid(row=2, column=0, sticky="nsew", padx=24, pady=10)
        box.grid_columnconfigure(0, weight=1)
        box.grid_columnconfigure(1, weight=0)
        box.grid_columnconfigure(2, weight=1)

        # From Column
        from_col = ctk.CTkFrame(box, fg_color="transparent")
        from_col.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")

        ctk.CTkLabel(from_col, text="From", font=ctk.CTkFont(size=14, weight="bold"), text_color="#A1A1AA").pack(anchor="w", pady=(0, 6))
        
        self.from_unit_var = ctk.StringVar()
        self.from_unit_menu = ctk.CTkOptionMenu(
            from_col,
            variable=self.from_unit_var,
            command=lambda _: self._perform_conversion(),
            fg_color="#27272A",
            button_color="#3F3F46",
            text_color="#FFFFFF"
        )
        self.from_unit_menu.pack(fill="x", pady=(0, 14))

        self.input_entry = ctk.CTkEntry(
            from_col,
            placeholder_text="Enter value...",
            font=ctk.CTkFont(family="Consolas", size=24, weight="bold"),
            fg_color="#09090B",
            border_color="#3F3F46",
            text_color="#FFFFFF",
            height=54
        )
        self.input_entry.pack(fill="x")
        self.input_entry.bind("<KeyRelease>", lambda _: self._perform_conversion())

        # Middle Swap Button
        mid_col = ctk.CTkFrame(box, fg_color="transparent")
        mid_col.grid(row=0, column=1, padx=6, pady=20, sticky="ns")

        self.swap_btn = ctk.CTkButton(
            mid_col,
            text="⇄",
            width=46,
            height=46,
            command=self._swap_units,
            fg_color="#27272A",
            hover_color="#7C3AED",
            font=ctk.CTkFont(size=18, weight="bold")
        )
        self.swap_btn.pack(expand=True)

        # To Column
        to_col = ctk.CTkFrame(box, fg_color="transparent")
        to_col.grid(row=0, column=2, padx=20, pady=20, sticky="nsew")

        ctk.CTkLabel(to_col, text="To", font=ctk.CTkFont(size=14, weight="bold"), text_color="#A1A1AA").pack(anchor="w", pady=(0, 6))

        self.to_unit_var = ctk.StringVar()
        self.to_unit_menu = ctk.CTkOptionMenu(
            to_col,
            variable=self.to_unit_var,
            command=lambda _: self._perform_conversion(),
            fg_color="#27272A",
            button_color="#3F3F46",
            text_color="#FFFFFF"
        )
        self.to_unit_menu.pack(fill="x", pady=(0, 14))

        # Result display
        self.result_display = ctk.CTkLabel(
            to_col,
            text="0",
            font=ctk.CTkFont(family="Consolas", size=24, weight="bold"),
            fg_color="#09090B",
            text_color="#60A5FA",
            height=54,
            corner_radius=8,
            anchor="w",
            padx=14
        )
        self.result_display.pack(fill="x")

        # 3. Formula and controls footer
        footer = ctk.CTkFrame(self, fg_color="transparent")
        footer.grid(row=3, column=0, sticky="ew", padx=24, pady=(5, 20))

        self.formula_label = ctk.CTkLabel(
            footer,
            text="Formula: 1 m = 1 m",
            font=ctk.CTkFont(size=13),
            text_color="#A1A1AA"
        )
        self.formula_label.pack(side="left")

        self.clear_btn = ctk.CTkButton(
            footer,
            text="Clear",
            width=80,
            command=self._clear_input,
            fg_color="#27272A",
            hover_color="#3F3F46",
            text_color="#F43F5E"
        )
        self.clear_btn.pack(side="right", padx=(8, 0))

        # Populate initial units
        self._update_unit_dropdowns()

    def _on_category_changed(self, category: str):
        self.current_category = category
        self._update_unit_dropdowns()
        self._perform_conversion()

    def _update_unit_dropdowns(self):
        units = UnitConverter.get_units(self.current_category)
        if not units:
            return

        self.from_unit_menu.configure(values=units)
        self.to_unit_menu.configure(values=units)

        self.from_unit_var.set(units[0])
        self.to_unit_var.set(units[1] if len(units) > 1 else units[0])

    def _swap_units(self):
        f = self.from_unit_var.get()
        t = self.to_unit_var.get()
        self.from_unit_var.set(t)
        self.to_unit_var.set(f)
        self._perform_conversion()

    def _clear_input(self):
        self.input_entry.delete(0, "end")
        self.result_display.configure(text="0")
        self.formula_label.configure(text="")

    def _perform_conversion(self):
        raw_val = self.input_entry.get()
        if not raw_val or not raw_val.strip():
            self.result_display.configure(text="0")
            return

        valid, num, err = validate_number(raw_val)
        if not valid or num is None:
            self.result_display.configure(text="Invalid input")
            self.formula_label.configure(text=err or "Invalid numeric value")
            return

        from_u = self.from_unit_var.get()
        to_u = self.to_unit_var.get()

        success, converted, formula = UnitConverter.convert(self.current_category, num, from_u, to_u)
        if success and converted is not None:
            settings = self.settings_manager.load_settings()
            prec = settings.get("decimal_precision", 4)
            grouping = settings.get("use_grouping", True)
            formatted = format_number(converted, precision=prec, use_grouping=grouping)
            
            self.result_display.configure(text=f"{formatted} {to_u}")
            self.formula_label.configure(text=f"Formula / Ratio: {formula}")

            # Record in history
            self.history_manager.add_conversion(
                category=self.current_category,
                input_val=str(num),
                from_unit=from_u,
                result_val=formatted,
                to_unit=to_u,
                formula=formula or ""
            )
            if self.on_history_updated:
                self.on_history_updated()
        else:
            self.result_display.configure(text="Error")
            self.formula_label.configure(text=formula or "Conversion error")

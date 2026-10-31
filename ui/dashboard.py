"""
Dashboard window for SMARTCALC.
Provides the primary desktop application frame with sidebar navigation,
module switching, and keyboard bindings.
"""
import tkinter as tk
try:
    import customtkinter as ctk
    BaseWindow = ctk.CTk
except ImportError:
    import tkinter as ctk
    BaseWindow = tk.Tk

from ui.calculator_view import CalculatorView
from ui.converter_view import ConverterView
from ui.history_view import HistoryView
from ui.settings_view import SettingsView
from core.history_manager import HistoryManager


class SmartCalcDashboard(BaseWindow):
    """Primary application window with sidebar and multi-view switcher."""

    def __init__(self):
        super().__init__()

        self.title("SMARTCALC — Interactive Calculator & Unit Converter")
        self.geometry("1080x720")
        self.minsize(860, 600)

        # Set appearance
        try:
            ctk.set_appearance_mode("dark")
            ctk.set_default_color_theme("blue")
        except Exception:
            pass

        # Persistence
        self.history_manager = HistoryManager()
        self.settings = self.history_manager.load_settings()

        # Layout configuration
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self._setup_sidebar()
        self._setup_content_area()
        self._bind_keyboard_shortcuts()

        # Start on Calculator view
        self._switch_view("calculator")

    def _setup_sidebar(self):
        self.sidebar = ctk.CTkFrame(
            self,
            width=240,
            corner_radius=0,
            fg_color="#0F0F12",
            border_width=1,
            border_color="#1E1E24"
        )
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_rowconfigure(6, weight=1)

        # Logo and Title
        brand_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        brand_frame.pack(fill="x", padx=20, pady=(24, 20))

        logo_lbl = ctk.CTkLabel(
            brand_frame,
            text="SMARTCALC",
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold"),
            text_color="#A855F7"
        )
        logo_lbl.pack(anchor="w")

        sub_lbl = ctk.CTkLabel(
            brand_frame,
            text="PRO UTILITY SUITE",
            font=ctk.CTkFont(family="Segoe UI", size=10, weight="bold"),
            text_color="#71717A"
        )
        sub_lbl.pack(anchor="w")

        # Nav Buttons
        self.nav_buttons = {}
        nav_items = [
            ("calculator", "Calculator", "🖩"),
            ("converter", "Unit Converter", "🔄"),
            ("history", "History", "🕒"),
            ("settings", "Settings", "⚙"),
        ]

        for key, label, icon in nav_items:
            btn = ctk.CTkButton(
                self.sidebar,
                text=f"{icon}  {label}",
                font=ctk.CTkFont(size=14, weight="bold"),
                anchor="w",
                fg_color="transparent",
                hover_color="#1E1E24",
                text_color="#A1A1AA",
                height=42,
                corner_radius=8,
                command=lambda k=key: self._switch_view(k)
            )
            btn.pack(fill="x", padx=14, pady=4)
            self.nav_buttons[key] = btn

        # System information footer in sidebar
        footer = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        footer.pack(side="bottom", fill="x", padx=16, pady=20)

        ctk.CTkLabel(
            footer,
            text="SMARTCALC v1.0",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#52525B"
        ).pack(anchor="w")
        ctk.CTkLabel(
            footer,
            text="Python & CustomTkinter",
            font=ctk.CTkFont(size=10),
            text_color="#3F3F46"
        ).pack(anchor="w")

    def _setup_content_area(self):
        self.main_container = ctk.CTkFrame(self, fg_color="#09090B", corner_radius=0)
        self.main_container.grid(row=0, column=1, sticky="nsew")
        self.main_container.grid_columnconfigure(0, weight=1)
        self.main_container.grid_rowconfigure(0, weight=1)

        # Initialize views
        self.views = {
            "calculator": CalculatorView(
                self.main_container,
                history_manager=self.history_manager,
                settings_manager=self.history_manager,
                on_history_updated=self._on_history_updated,
                fg_color="transparent"
            ),
            "converter": ConverterView(
                self.main_container,
                history_manager=self.history_manager,
                settings_manager=self.history_manager,
                on_history_updated=self._on_history_updated,
                fg_color="transparent"
            ),
            "history": HistoryView(
                self.main_container,
                history_manager=self.history_manager,
                on_reuse=self._on_reuse_history,
                fg_color="transparent"
            ),
            "settings": SettingsView(
                self.main_container,
                settings_manager=self.history_manager,
                history_manager=self.history_manager,
                on_settings_changed=self._on_settings_changed,
                fg_color="transparent"
            ),
        }

    def _switch_view(self, key: str):
        for k, v in self.views.items():
            v.grid_forget()

        # Update button highlights
        accent = self.settings.get("accent_color", "#7C3AED")
        for k, btn in self.nav_buttons.items():
            if k == key:
                btn.configure(fg_color=accent, text_color="#FFFFFF")
            else:
                btn.configure(fg_color="transparent", text_color="#A1A1AA")

        # Mount selected view
        target_view = self.views.get(key)
        if target_view:
            target_view.grid(row=0, column=0, sticky="nsew")

        if key == "history":
            self.views["history"].refresh_list()

    def _on_history_updated(self):
        if "history" in self.views:
            self.views["history"].refresh_list()

    def _on_reuse_history(self, val_str: str):
        # Clean comma separators
        cleaned = val_str.replace(",", "").split(" ")[0]
        self._switch_view("calculator")
        calc: CalculatorView = self.views["calculator"]  # type: ignore
        calc.current_expression = cleaned
        calc.result_label.configure(text=cleaned)

    def _on_settings_changed(self, new_settings):
        self.settings = new_settings
        accent = new_settings.get("accent_color", "#7C3AED")
        # Update active nav button
        for k, btn in self.nav_buttons.items():
            if btn.cget("fg_color") != "transparent":
                btn.configure(fg_color=accent)

    def _bind_keyboard_shortcuts(self):
        # Bind standard calculator keys
        calc = self.views["calculator"]
        self.bind("<Return>", lambda e: calc._calculate())
        self.bind("<KP_Enter>", lambda e: calc._calculate())
        self.bind("<BackSpace>", lambda e: calc._backspace())
        self.bind("<Escape>", lambda e: calc._clear_all())

        # Digits and operators
        for char in "0123456789.":
            self.bind(char, lambda e, c=char: calc._append_num(c))
        for op in "+-*/":
            self.bind(op, lambda e, o=op: calc._append_op("×" if o == "*" else "÷" if o == "/" else o))

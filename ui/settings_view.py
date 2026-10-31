"""
Settings view for SMARTCALC.
Allows configuring Theme (Dark/Light), Accent Color, Decimal Precision,
Number Grouping, and Application Information.
"""
import tkinter as tk
from tkinter import messagebox
try:
    import customtkinter as ctk
    BaseFrame = ctk.CTkFrame
    ScrollFrame = ctk.CTkScrollableFrame
except ImportError:
    import tkinter as ctk
    BaseFrame = tk.Frame
    ScrollFrame = tk.Frame


class SettingsView(BaseFrame):
    """User preferences configuration panel."""

    ACCENT_OPTIONS = {
        "Electric Violet": "#7C3AED",
        "Cyber Blue": "#2563EB",
        "Emerald Green": "#059669",
        "Sunset Amber": "#D97706",
        "Rose Pink": "#E11D48",
    }

    def __init__(self, master, settings_manager, history_manager, on_settings_changed=None, **kwargs):
        super().__init__(master, **kwargs)
        self.settings_manager = settings_manager
        self.history_manager = history_manager
        self.on_settings_changed = on_settings_changed

        self.current_settings = self.settings_manager.load_settings()
        self._setup_ui()

    def _setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, sticky="ew", padx=24, pady=(20, 10))

        title = ctk.CTkLabel(
            header,
            text="Preferences & Settings",
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold"),
            text_color="#F8FAFC"
        )
        title.pack(side="left")

        container = ScrollFrame(
            self,
            fg_color="#18181B",
            corner_radius=14,
            border_width=1,
            border_color="#27272A"
        )
        container.grid(row=1, column=0, sticky="nsew", padx=24, pady=10)
        container.grid_columnconfigure(0, weight=1)

        # 1. Appearance / Theme
        self._create_setting_row(
            container,
            title="Appearance Mode",
            desc="Toggle between dark glass and light high-contrast themes",
            widget_builder=self._build_theme_toggle
        )

        # 2. Accent Color
        self._create_setting_row(
            container,
            title="Accent Color",
            desc="Select the primary brand highlight color for buttons and tabs",
            widget_builder=self._build_accent_selector
        )

        # 3. Decimal Precision
        self._create_setting_row(
            container,
            title="Decimal Precision",
            desc="Number of decimal places shown in results (0 to 8)",
            widget_builder=self._build_precision_selector
        )

        # 4. Number Grouping
        self._create_setting_row(
            container,
            title="Thousands Separator",
            desc="Format large numbers with commas (e.g., 1,000,000)",
            widget_builder=self._build_grouping_switch
        )

        # 5. Clear Data
        self._create_setting_row(
            container,
            title="Data Management",
            desc="Wipe stored calculation and conversion history",
            widget_builder=self._build_clear_data_btn
        )

        # 6. About Box
        about_box = ctk.CTkFrame(container, fg_color="#27272A", corner_radius=10)
        about_box.pack(fill="x", padx=16, pady=(20, 16))

        ctk.CTkLabel(
            about_box,
            text="SMARTCALC — Professional Desktop Utility",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color="#FFFFFF"
        ).pack(anchor="w", padx=16, pady=(14, 4))

        ctk.CTkLabel(
            about_box,
            text="Version 1.0.0 • Python 3.10+ & CustomTkinter\nEngineered with safe AST mathematical evaluation and multi-category unit conversion.",
            font=ctk.CTkFont(size=12),
            text_color="#A1A1AA",
            justify="left"
        ).pack(anchor="w", padx=16, pady=(0, 14))

    def _create_setting_row(self, parent, title: str, desc: str, widget_builder):
        row_frame = ctk.CTkFrame(parent, fg_color="transparent")
        row_frame.pack(fill="x", padx=16, pady=12)
        row_frame.grid_columnconfigure(0, weight=1)
        row_frame.grid_columnconfigure(1, weight=0)

        left = ctk.CTkFrame(row_frame, fg_color="transparent")
        left.grid(row=0, column=0, sticky="w")

        ctk.CTkLabel(left, text=title, font=ctk.CTkFont(size=14, weight="bold"), text_color="#F8FAFC").pack(anchor="w")
        ctk.CTkLabel(left, text=desc, font=ctk.CTkFont(size=12), text_color="#71717A").pack(anchor="w")

        right = ctk.CTkFrame(row_frame, fg_color="transparent")
        right.grid(row=0, column=1, sticky="e")
        widget_builder(right)

    def _build_theme_toggle(self, parent):
        mode = self.current_settings.get("theme", "dark").capitalize()
        seg = ctk.CTkSegmentedButton(
            parent,
            values=["Dark", "Light"],
            command=self._on_theme_changed,
            selected_color="#7C3AED",
            font=ctk.CTkFont(size=12, weight="bold")
        )
        seg.set(mode)
        seg.pack()

    def _build_accent_selector(self, parent):
        current_hex = self.current_settings.get("accent_color", "#7C3AED")
        current_name = "Electric Violet"
        for name, val in self.ACCENT_OPTIONS.items():
            if val.lower() == current_hex.lower():
                current_name = name
                break

        menu = ctk.CTkOptionMenu(
            parent,
            values=list(self.ACCENT_OPTIONS.keys()),
            command=self._on_accent_changed,
            fg_color="#27272A",
            button_color="#3F3F46"
        )
        menu.set(current_name)
        menu.pack()

    def _build_precision_selector(self, parent):
        prec = str(self.current_settings.get("decimal_precision", 4))
        menu = ctk.CTkOptionMenu(
            parent,
            values=["0", "2", "4", "6", "8"],
            command=self._on_precision_changed,
            width=80,
            fg_color="#27272A",
            button_color="#3F3F46"
        )
        menu.set(prec)
        menu.pack()

    def _build_grouping_switch(self, parent):
        var = ctk.BooleanVar(value=self.current_settings.get("use_grouping", True))
        switch = ctk.CTkSwitch(
            parent,
            text="",
            variable=var,
            command=lambda: self._on_grouping_changed(var.get()),
            progress_color="#7C3AED"
        )
        switch.pack()

    def _build_clear_data_btn(self, parent):
        btn = ctk.CTkButton(
            parent,
            text="Clear History",
            command=self._clear_all_data,
            fg_color="#3F1D2C",
            hover_color="#5E1E38",
            text_color="#FDA4AF",
            width=110,
            font=ctk.CTkFont(size=12, weight="bold")
        )
        btn.pack()

    def _on_theme_changed(self, mode: str):
        self.current_settings["theme"] = mode.lower()
        self.settings_manager.save_settings(self.current_settings)
        try:
            ctk.set_appearance_mode(mode.lower())
        except Exception:
            pass
        if self.on_settings_changed:
            self.on_settings_changed(self.current_settings)

    def _on_accent_changed(self, name: str):
        hex_val = self.ACCENT_OPTIONS.get(name, "#7C3AED")
        self.current_settings["accent_color"] = hex_val
        self.settings_manager.save_settings(self.current_settings)
        if self.on_settings_changed:
            self.on_settings_changed(self.current_settings)

    def _on_precision_changed(self, val_str: str):
        self.current_settings["decimal_precision"] = int(val_str)
        self.settings_manager.save_settings(self.current_settings)
        if self.on_settings_changed:
            self.on_settings_changed(self.current_settings)

    def _on_grouping_changed(self, enabled: bool):
        self.current_settings["use_grouping"] = enabled
        self.settings_manager.save_settings(self.current_settings)
        if self.on_settings_changed:
            self.on_settings_changed(self.current_settings)

    def _clear_all_data(self):
        answer = messagebox.askyesno(
            "Clear Data",
            "This will permanently delete all calculation and conversion logs. Continue?"
        )
        if answer:
            self.history_manager.clear_history()
            messagebox.showinfo("Success", "All history logs have been cleared.")

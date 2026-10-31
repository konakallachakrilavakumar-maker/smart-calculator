"""
History view for SMARTCALC.
Displays past calculations and conversions with timestamps, delete actions,
and reuse callbacks.
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


class HistoryView(BaseFrame):
    """Modern scrollable history view with delete and clear functionality."""

    def __init__(self, master, history_manager, on_reuse=None, **kwargs):
        super().__init__(master, **kwargs)
        self.history_manager = history_manager
        self.on_reuse = on_reuse

        self._setup_ui()

    def _setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Header with Clear All button
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, sticky="ew", padx=24, pady=(20, 10))

        title = ctk.CTkLabel(
            header,
            text="Calculation & Conversion History",
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold"),
            text_color="#F8FAFC"
        )
        title.pack(side="left")

        clear_btn = ctk.CTkButton(
            header,
            text="Clear All History",
            command=self._clear_all_confirm,
            fg_color="#3F1D2C",
            hover_color="#5E1E38",
            text_color="#FDA4AF",
            font=ctk.CTkFont(size=12, weight="bold")
        )
        clear_btn.pack(side="right")

        # Scrollable container
        self.scroll_list = ScrollFrame(
            self,
            fg_color="#18181B",
            corner_radius=14,
            border_width=1,
            border_color="#27272A"
        )
        self.scroll_list.grid(row=1, column=0, sticky="nsew", padx=24, pady=10)
        self.scroll_list.grid_columnconfigure(0, weight=1)

        self.refresh_list()

    def refresh_list(self):
        # Clear existing children
        for widget in self.scroll_list.winfo_children():
            widget.destroy()

        items = self.history_manager.load_history()

        if not items:
            empty_lbl = ctk.CTkLabel(
                self.scroll_list,
                text="No calculation history yet. Calculations and conversions will appear here.",
                text_color="#71717A",
                font=ctk.CTkFont(size=14)
            )
            empty_lbl.pack(pady=40)
            return

        for idx, item in enumerate(items):
            item_card = ctk.CTkFrame(
                self.scroll_list,
                fg_color="#27272A",
                corner_radius=10,
                border_width=1,
                border_color="#3F3F46"
            )
            item_card.pack(fill="x", padx=12, pady=6)
            item_card.grid_columnconfigure(1, weight=1)

            # Type indicator icon/label
            type_text = "CALC" if item.get("type") == "calculation" else "CONV"
            type_color = "#C084FC" if item.get("type") == "calculation" else "#60A5FA"
            
            badge = ctk.CTkLabel(
                item_card,
                text=type_text,
                font=ctk.CTkFont(size=11, weight="bold"),
                text_color=type_color,
                width=45
            )
            badge.grid(row=0, column=0, rowspan=2, padx=(12, 6), pady=10)

            # Details: Expression & Result
            expr = item.get("expression", "")
            res = item.get("result", "")
            tstamp = item.get("timestamp", "")

            expr_lbl = ctk.CTkLabel(
                item_card,
                text=expr,
                font=ctk.CTkFont(size=13),
                text_color="#A1A1AA",
                anchor="w"
            )
            expr_lbl.grid(row=0, column=1, sticky="w", pady=(8, 0))

            res_lbl = ctk.CTkLabel(
                item_card,
                text=f"= {res}",
                font=ctk.CTkFont(size=16, weight="bold"),
                text_color="#F8FAFC",
                anchor="w"
            )
            res_lbl.grid(row=1, column=1, sticky="w", pady=(0, 8))

            # Timestamp
            time_lbl = ctk.CTkLabel(
                item_card,
                text=tstamp,
                font=ctk.CTkFont(size=11),
                text_color="#71717A"
            )
            time_lbl.grid(row=0, column=2, padx=10, pady=(8, 0), sticky="e")

            # Actions: Reuse and Delete
            actions_frame = ctk.CTkFrame(item_card, fg_color="transparent")
            actions_frame.grid(row=1, column=2, padx=10, pady=(0, 8), sticky="e")

            reuse_btn = ctk.CTkButton(
                actions_frame,
                text="Reuse",
                width=55,
                height=26,
                command=lambda r=res: self._reuse_result(r),
                fg_color="#3B82F6",
                hover_color="#2563EB",
                font=ctk.CTkFont(size=11, weight="bold")
            )
            reuse_btn.pack(side="left", padx=4)

            item_id = item.get("id")
            del_btn = ctk.CTkButton(
                actions_frame,
                text="✕",
                width=28,
                height=26,
                command=lambda i=item_id: self._delete_item(i),
                fg_color="#DC2626",
                hover_color="#B91C1C",
                font=ctk.CTkFont(size=12, weight="bold")
            )
            del_btn.pack(side="left")

    def _reuse_result(self, result_val: str):
        if self.on_reuse:
            self.on_reuse(result_val)

    def _delete_item(self, item_id: str):
        self.history_manager.delete_item(item_id)
        self.refresh_list()

    def _clear_all_confirm(self):
        answer = messagebox.askyesno(
            "Clear History",
            "Are you sure you want to delete all calculation and conversion history?"
        )
        if answer:
            self.history_manager.clear_history()
            self.refresh_list()

"""
History and Settings persistence manager for SMARTCALC.
Handles saving and loading calculations, conversions, and user preferences from JSON files.
"""
import os
import json
import uuid
from typing import List, Dict, Any, Optional
from utils.helpers import get_timestamp


class HistoryManager:
    """Manages history records and settings persistence in JSON files."""

    DEFAULT_SETTINGS = {
        "theme": "dark",
        "accent_color": "#7C3AED",  # Electric violet
        "decimal_precision": 4,
        "use_grouping": True,
        "sound_enabled": True,
    }

    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            # Default to data/ directory relative to project root
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.data_dir = os.path.join(base_dir, "data")
        else:
            self.data_dir = data_dir

        os.makedirs(self.data_dir, exist_ok=True)
        self.history_file = os.path.join(self.data_dir, "history.json")
        self.settings_file = os.path.join(self.data_dir, "settings.json")
        
        # Initialize files if missing
        self._ensure_files()

    def _ensure_files(self):
        if not os.path.exists(self.history_file):
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump([], f, indent=2)

        if not os.path.exists(self.settings_file):
            with open(self.settings_file, "w", encoding="utf-8") as f:
                json.dump(self.DEFAULT_SETTINGS, f, indent=2)

    def load_history(self) -> List[Dict[str, Any]]:
        """Loads all history items from JSON."""
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception:
            pass
        return []

    def save_history(self, history: List[Dict[str, Any]]) -> bool:
        """Saves history items to JSON."""
        try:
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(history, f, indent=2)
            return True
        except Exception:
            return False

    def add_calculation(self, expression: str, result: str) -> Dict[str, Any]:
        """Appends a new calculation entry to history."""
        entry = {
            "id": str(uuid.uuid4())[:8],
            "type": "calculation",
            "expression": expression,
            "result": result,
            "timestamp": get_timestamp(),
        }
        history = self.load_history()
        history.insert(0, entry)  # Prepend newest
        self.save_history(history[:100])  # Keep last 100
        return entry

    def add_conversion(self, category: str, input_val: str, from_unit: str, result_val: str, to_unit: str, formula: str) -> Dict[str, Any]:
        """Appends a new conversion entry to history."""
        entry = {
            "id": str(uuid.uuid4())[:8],
            "type": "conversion",
            "category": category,
            "expression": f"{input_val} {from_unit} → {to_unit}",
            "result": f"{result_val} {to_unit}",
            "formula": formula,
            "timestamp": get_timestamp(),
        }
        history = self.load_history()
        history.insert(0, entry)
        self.save_history(history[:100])
        return entry

    def delete_item(self, item_id: str) -> bool:
        """Deletes an item by id."""
        history = self.load_history()
        filtered = [item for item in history if item.get("id") != item_id]
        if len(filtered) != len(history):
            self.save_history(filtered)
            return True
        return False

    def clear_history(self) -> bool:
        """Clears all history."""
        return self.save_history([])

    def load_settings(self) -> Dict[str, Any]:
        """Loads settings from JSON."""
        try:
            if os.path.exists(self.settings_file):
                with open(self.settings_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # merge with default
                    merged = dict(self.DEFAULT_SETTINGS)
                    merged.update(data)
                    return merged
        except Exception:
            pass
        return dict(self.DEFAULT_SETTINGS)

    def save_settings(self, settings: Dict[str, Any]) -> bool:
        """Saves settings to JSON."""
        try:
            with open(self.settings_file, "w", encoding="utf-8") as f:
                json.dump(settings, f, indent=2)
            return True
        except Exception:
            return False

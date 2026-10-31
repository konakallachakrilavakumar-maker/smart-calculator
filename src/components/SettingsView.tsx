import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Hash,
  Palette,
  RotateCcw,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AccentColor, AppSettings } from '../types';
import { ACCENT_THEMES } from '../utils/theme';
import { playKeyClick } from '../utils/audio';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearAllHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearAllHistory,
}) => {
  const [clearedNotice, setClearedNotice] = useState(false);

  const accents: { id: AccentColor; name: string; hex: string }[] = [
    { id: 'violet', name: 'Electric Violet', hex: '#7C3AED' },
    { id: 'blue', name: 'Cyber Blue', hex: '#2563EB' },
    { id: 'emerald', name: 'Emerald Green', hex: '#059669' },
    { id: 'amber', name: 'Sunset Amber', hex: '#D97706' },
    { id: 'rose', name: 'Rose Quartz', hex: '#E11D48' },
  ];

  const handleClearData = () => {
    onClearAllHistory();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Preferences &amp; Configuration
        </h2>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          <span>Appearance</span>
          <span aria-hidden="true">·</span>
          <span>Numeric Precision</span>
          <span aria-hidden="true">·</span>
          <span>Persistent JSON Configuration</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Appearance Mode */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/80 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sun className="w-4 h-4 text-zinc-500" />
              <span>Theme Mode</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Toggle between deep dark glassmorphism and clean light studio mode
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60">
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                settings.theme === 'light'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
          </div>
        </div>

        {/* Accent Color */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-zinc-500" />
              <span>Accent Highlight Color</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Select primary highlight color for buttons, tabs, and focus states
            </div>
          </div>

          <div className="flex items-center gap-2">
            {accents.map((acc) => {
              const isSelected = settings.accentColor === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => {
                    if (settings.soundEnabled) playKeyClick('op');
                    onUpdateSettings({ accentColor: acc.id });
                  }}
                  title={acc.name}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    isSelected ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-zinc-100' : 'opacity-80'
                  }`}
                  style={{ backgroundColor: acc.hex }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Decimal Precision */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/80 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Hash className="w-4 h-4 text-zinc-500" />
              <span>Decimal Precision</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Maximum decimal places displayed for fractional results (0 to 8)
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60 font-mono">
            {[0, 2, 4, 6, 8].map((digits) => {
              const isSelected = settings.decimalPrecision === digits;
              return (
                <button
                  key={digits}
                  onClick={() => onUpdateSettings({ decimalPrecision: digits })}
                  className={`w-8 h-7 text-xs font-bold rounded-md transition-colors ${
                    isSelected
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {digits}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thousands Grouping */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/80 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Thousands Separator
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Format large figures with comma separators (e.g. 1,000,000)
            </div>
          </div>

          <button
            onClick={() => onUpdateSettings({ useGrouping: !settings.useGrouping })}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.useGrouping ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                settings.useGrouping ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Audio Feedback */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/80 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-zinc-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-400" />
              )}
              <span>Tactile Acoustic Feedback</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Play subtle mechanical click audio on keypad presses
            </div>
          </div>

          <button
            onClick={() => {
              if (!settings.soundEnabled) playKeyClick('enter');
              onUpdateSettings({ soundEnabled: !settings.soundEnabled });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.soundEnabled ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Data Reset */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/80 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 text-rose-600 dark:text-rose-400">
              Clear Storage &amp; Logs
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Erase all stored calculations and unit conversion logs from JSON / local storage
            </div>
          </div>

          <button
            onClick={handleClearData}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 transition-colors"
          >
            {clearedNotice ? 'Cleared!' : 'Clear Logs'}
          </button>
        </div>

        {/* System & Architecture Info */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#0f1015] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Architecture &amp; Safety</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            SMARTCALC features a dual-core implementation: a Python 3.10+ CustomTkinter desktop utility and a React 19 web engine. Evaluates mathematical expressions using an Abstract Syntax Tree (AST) safe parser with zero reliance on unsafe <code className="font-mono text-zinc-700 dark:text-zinc-300">eval()</code>.
          </p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span>SMARTCALC v1.0.0</span>
            <span aria-hidden="true">·</span>
            <span>CustomTkinter 5.2+</span>
            <span aria-hidden="true">·</span>
            <span>All Tests Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

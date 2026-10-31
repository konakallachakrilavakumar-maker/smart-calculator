/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  HistoryItem,
  AppSettings,
} from './types';
import { Sidebar } from './components/Sidebar';
import { CalculatorView } from './components/CalculatorView';
import { ConverterView } from './components/ConverterView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { CodeInspectorView } from './components/CodeInspectorView';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ACCENT_THEMES } from './utils/theme';

const STORAGE_KEYS = {
  HISTORY: 'smartcalc_history_records',
  SETTINGS: 'smartcalc_user_preferences',
};

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'c1a01',
    type: 'calculation',
    expression: '125 * 8 + 45',
    result: '1,045',
    timestamp: '2026-10-31 10:15:20',
  },
  {
    id: 'c1a02',
    type: 'conversion',
    category: 'Length',
    expression: '50 Miles → Kilometers',
    result: '80.4672 Kilometers',
    formula: '1 Miles = 1.60934 Kilometers',
    timestamp: '2026-10-31 10:30:45',
  },
  {
    id: 'c1a03',
    type: 'calculation',
    expression: '√(144) + 2^4',
    result: '28',
    timestamp: '2026-10-31 11:02:10',
  },
];

const INITIAL_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'violet',
  decimalPrecision: 4,
  useGrouping: true,
  soundEnabled: true,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('calculator');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_HISTORY;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_SETTINGS;
  });

  const [reuseValue, setReuseValue] = useState<string | null>(null);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // Sync settings to localStorage and HTML root class
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }

    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  // Global keyboard shortcut for shortcuts modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleAddHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
    };

    setHistory((prev) => [newItem, ...prev.slice(0, 99)]);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
  };

  const handleReuse = (val: string, tab: NavigationTab) => {
    setReuseValue(val);
    setActiveTab(tab);
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const accent = ACCENT_THEMES[settings.accentColor];

  return (
    <div className="w-full h-screen flex flex-col bg-zinc-100 dark:bg-[#07070a] text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors selection:bg-violet-500/30">
      {/* Desktop Window Title Bar */}
      <header className="h-10 px-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#0c0d12]/80 backdrop-blur-md flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-3">
          {/* Windows/Desktop Style window badges */}
          <div className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="h-3.5 w-px bg-zinc-300 dark:bg-zinc-800" />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-tight">
            SMARTCALC — Desktop Utility Suite
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 hidden sm:block">
            {activeTab.toUpperCase()} ACTIVE
          </div>
          <div className="h-3.5 w-px bg-zinc-300 dark:bg-zinc-800 hidden sm:block" />
          <button
            onClick={() => handleUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Toggle theme"
          >
            {settings.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          settings={settings}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
          historyCount={history.length}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 min-w-0 bg-zinc-50/50 dark:bg-[#09090b]/50 overflow-hidden relative">
          {activeTab === 'calculator' && (
            <CalculatorView
              settings={settings}
              onAddHistory={handleAddHistory}
              reuseValue={reuseValue}
              onClearReuse={() => setReuseValue(null)}
            />
          )}

          {activeTab === 'converter' && (
            <ConverterView
              settings={settings}
              onAddHistory={handleAddHistory}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onDelete={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
              onReuse={handleReuse}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearAllHistory={handleClearAllHistory}
            />
          )}

          {activeTab === 'inspector' && (
            <CodeInspectorView />
          )}
        </main>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
}

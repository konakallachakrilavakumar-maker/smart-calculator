import React from 'react';
import {
  Calculator,
  ArrowLeftRight,
  History,
  Settings,
  Code2,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import { NavigationTab, AppSettings } from '../types';
import { ACCENT_THEMES } from '../utils/theme';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  settings: AppSettings;
  onOpenShortcuts: () => void;
  historyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  settings,
  onOpenShortcuts,
  historyCount,
}) => {
  const accent = ACCENT_THEMES[settings.accentColor];

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'converter', label: 'Unit Converter', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" />, badge: historyCount },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'inspector', label: 'Python Source & Architecture', icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-zinc-200 dark:border-zinc-800/90 bg-white/95 dark:bg-[#0c0d12]/95 backdrop-blur-xl transition-colors select-none">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${accent.primary}`}>
              SC
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                SMARTCALC
              </h1>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
                Desktop Utility Suite
              </p>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? `${accent.primary} shadow-sm`
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
        <button
          onClick={onOpenShortcuts}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">
            ?
          </kbd>
        </button>

        <div className="px-3 pt-1 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
          <span>Python 3.10+ / React 19</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

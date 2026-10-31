import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { AppSettings, HistoryItem, UnitCategory } from '../types';
import { CONVERSION_CATEGORIES, convertUnits } from '../core/converterEngine';
import { formatValue } from '../core/mathEngine';
import { playKeyClick } from '../utils/audio';
import { ACCENT_THEMES } from '../utils/theme';

interface ConverterViewProps {
  settings: AppSettings;
  onAddHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export const ConverterView: React.FC<ConverterViewProps> = ({
  settings,
  onAddHistory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>('Length');
  const [fromUnit, setFromUnit] = useState<string>('Meters');
  const [toUnit, setToUnit] = useState<string>('Feet');
  const [inputValue, setInputValue] = useState<string>('1');
  const [copied, setCopied] = useState<boolean>(false);

  const accent = ACCENT_THEMES[settings.accentColor];
  const catData = CONVERSION_CATEGORIES[selectedCategory];

  // Update units when category changes
  useEffect(() => {
    const units = CONVERSION_CATEGORIES[selectedCategory].units;
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  }, [selectedCategory]);

  // Compute conversion reactively
  const conversionResult = useMemo(() => {
    const num = parseFloat(inputValue.replace(/,/g, ''));
    if (isNaN(num)) {
      return { success: false, error: 'Enter a valid number' };
    }
    return convertUnits(selectedCategory, num, fromUnit, toUnit);
  }, [selectedCategory, inputValue, fromUnit, toUnit]);

  // Formatted display result
  const formattedResult = useMemo(() => {
    if (conversionResult.success && conversionResult.result !== undefined) {
      return formatValue(conversionResult.result, settings.decimalPrecision, settings.useGrouping);
    }
    return '0';
  }, [conversionResult, settings.decimalPrecision, settings.useGrouping]);

  // Save to history on valid result changes
  useEffect(() => {
    if (conversionResult.success && conversionResult.result !== undefined && inputValue.trim()) {
      const num = parseFloat(inputValue.replace(/,/g, ''));
      if (!isNaN(num)) {
        // Debounce history addition slightly
        const timer = setTimeout(() => {
          onAddHistory({
            type: 'conversion',
            category: selectedCategory,
            expression: `${inputValue} ${fromUnit} → ${toUnit}`,
            result: `${formattedResult} ${toUnit}`,
            formula: conversionResult.formula,
          });
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [conversionResult, selectedCategory, fromUnit, toUnit, inputValue, formattedResult, onAddHistory]);

  const handleSwap = () => {
    if (settings.soundEnabled) playKeyClick('op');
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleClear = () => {
    if (settings.soundEnabled) playKeyClick('clear');
    setInputValue('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${formattedResult} ${toUnit}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryList: UnitCategory[] = [
    'Length',
    'Weight',
    'Temperature',
    'Speed',
    'Time',
    'Area',
    'Volume',
  ];

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Universal Unit Converter
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span>7 Standard Categories</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Exact Conversion</span>
            <span aria-hidden="true">·</span>
            <span>Formula Explanations</span>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Category Segmented Tabs */}
      <div className="p-1 mb-6 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 flex flex-wrap gap-1">
        {categoryList.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                if (settings.soundEnabled) playKeyClick('op');
                setSelectedCategory(cat);
              }}
              className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center ${
                isActive
                  ? `${accent.primary} shadow-sm`
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Conversion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center mb-6">
        {/* FROM CARD */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/90 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              From
            </label>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
              {catData.symbols[fromUnit] || ''}
            </span>
          </div>

          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full mb-3 px-3 py-2 text-sm font-semibold rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20"
          >
            {catData.units.map((u) => (
              <option key={u} value={u} className="bg-white dark:bg-zinc-900">
                {u} ({catData.symbols[u] || ''})
              </option>
            ))}
          </select>

          <input
            type="number"
            step="any"
            value={inputValue}
            placeholder="0"
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full text-2xl font-mono font-bold px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-violet-500"
          />
        </div>

        {/* SWAP BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            title="Swap source and target units"
            className="w-11 h-11 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-transform active:scale-90"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* TO CARD */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/90 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              To
            </label>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
              {catData.symbols[toUnit] || ''}
            </span>
          </div>

          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full mb-3 px-3 py-2 text-sm font-semibold rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20"
          >
            {catData.units.map((u) => (
              <option key={u} value={u} className="bg-white dark:bg-zinc-900">
                {u} ({catData.symbols[u] || ''})
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 min-h-[50px]">
            <span className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {conversionResult.error ? (
                <span className="text-sm font-normal text-rose-500 dark:text-rose-400">
                  {conversionResult.error}
                </span>
              ) : (
                formattedResult
              )}
            </span>
            {conversionResult.success && (
              <button
                onClick={handleCopy}
                title="Copy result"
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formula & Explanation Card */}
      {conversionResult.formula && (
        <div className="p-4 mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 flex items-start gap-3">
          <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Conversion Formula &amp; Ratio
            </div>
            <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
              {conversionResult.formula}
            </div>
          </div>
        </div>
      )}

      {/* Quick Reference Conversion Table */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
          Quick Unit Reference ({selectedCategory})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {catData.units.map((u) => {
            const sym = catData.symbols[u];
            return (
              <div
                key={u}
                onClick={() => setToUnit(u)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  toUnit === u
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30'
                }`}
              >
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {u}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  Symbol: {sym}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

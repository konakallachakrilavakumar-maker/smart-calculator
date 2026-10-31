import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Copy,
  Check,
  Delete,
  RotateCcw,
  Equal,
} from 'lucide-react';
import { AppSettings, HistoryItem } from '../types';
import { evaluateExpression, formatValue } from '../core/mathEngine';
import { playKeyClick } from '../utils/audio';
import { ACCENT_THEMES } from '../utils/theme';

interface CalculatorViewProps {
  settings: AppSettings;
  onAddHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  reuseValue: string | null;
  onClearReuse: () => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  settings,
  onAddHistory,
  reuseValue,
  onClearReuse,
}) => {
  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [livePreview, setLivePreview] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const accent = ACCENT_THEMES[settings.accentColor];

  // Handle external reuse value
  useEffect(() => {
    if (reuseValue !== null) {
      setExpression(reuseValue);
      setDisplayValue(reuseValue);
      setErrorMessage(null);
      onClearReuse();
    }
  }, [reuseValue, onClearReuse]);

  // Live expression preview
  useEffect(() => {
    if (!expression || expression.trim().length === 0) {
      setLivePreview(null);
      return;
    }
    // Only preview if it has operators
    if (/[+\-*\/%^]/.test(expression)) {
      const evalRes = evaluateExpression(expression);
      if (evalRes.success && evalRes.result !== undefined) {
        setLivePreview(formatValue(evalRes.result, settings.decimalPrecision, settings.useGrouping));
      } else {
        setLivePreview(null);
      }
    } else {
      setLivePreview(null);
    }
  }, [expression, settings.decimalPrecision, settings.useGrouping]);

  const clickSound = useCallback((type: 'num' | 'op' | 'enter' | 'clear' = 'num') => {
    if (settings.soundEnabled) {
      playKeyClick(type);
    }
  }, [settings.soundEnabled]);

  const handleDigit = useCallback((char: string) => {
    clickSound('num');
    setErrorMessage(null);

    setExpression((prev) => {
      if (prev === '0' && char !== '.') {
        return char;
      }
      return prev + char;
    });

    setDisplayValue((prev) => {
      if (prev === '0' && char !== '.') {
        return char;
      }
      return prev + char;
    });
  }, [clickSound]);

  const handleOperator = useCallback((op: string) => {
    clickSound('op');
    setErrorMessage(null);

    setExpression((prev) => {
      if (!prev) {
        if (lastResult !== null) {
          return `${lastResult} ${op} `;
        }
        if (op === '-') return '-';
        return '';
      }
      return `${prev} ${op} `;
    });
    setDisplayValue((prev) => `${prev} ${op} `);
  }, [clickSound, lastResult]);

  const handleCalculate = useCallback(() => {
    clickSound('enter');
    if (!expression || !expression.trim()) return;

    const evalRes = evaluateExpression(expression);
    if (evalRes.success && evalRes.result !== undefined) {
      const formatted = formatValue(evalRes.result, settings.decimalPrecision, settings.useGrouping);
      
      onAddHistory({
        type: 'calculation',
        expression: expression.trim(),
        result: formatted,
      });

      setLastResult(evalRes.result);
      setDisplayValue(formatted);
      setExpression(evalRes.result.toString());
      setErrorMessage(null);
    } else {
      setErrorMessage(evalRes.error || 'Syntax error');
    }
  }, [clickSound, expression, onAddHistory, settings.decimalPrecision, settings.useGrouping]);

  const handleClearAll = useCallback(() => {
    clickSound('clear');
    setExpression('');
    setDisplayValue('0');
    setLastResult(null);
    setErrorMessage(null);
    setLivePreview(null);
  }, [clickSound]);

  const handleClearEntry = useCallback(() => {
    clickSound('clear');
    setExpression('');
    setDisplayValue('0');
    setErrorMessage(null);
    setLivePreview(null);
  }, [clickSound]);

  const handleBackspace = useCallback(() => {
    clickSound('clear');
    setErrorMessage(null);
    setExpression((prev) => {
      const trimmed = prev.trimEnd();
      if (!trimmed) return '';
      const next = trimmed.slice(0, -1).trimEnd();
      setDisplayValue(next || '0');
      return next;
    });
  }, [clickSound]);

  const handleSquare = useCallback(() => {
    clickSound('op');
    const target = expression || (lastResult !== null ? lastResult.toString() : '0');
    const evalRes = evaluateExpression(target);
    if (evalRes.success && evalRes.result !== undefined) {
      const sq = Math.pow(evalRes.result, 2);
      const formatted = formatValue(sq, settings.decimalPrecision, settings.useGrouping);
      onAddHistory({
        type: 'calculation',
        expression: `(${evalRes.result})²`,
        result: formatted,
      });
      setLastResult(sq);
      setDisplayValue(formatted);
      setExpression(sq.toString());
      setErrorMessage(null);
    }
  }, [clickSound, expression, lastResult, onAddHistory, settings.decimalPrecision, settings.useGrouping]);

  const handleSqrt = useCallback(() => {
    clickSound('op');
    const target = expression || (lastResult !== null ? lastResult.toString() : '0');
    const evalRes = evaluateExpression(target);
    if (evalRes.success && evalRes.result !== undefined) {
      if (evalRes.result < 0) {
        setErrorMessage('Cannot calculate square root of a negative number');
        return;
      }
      const root = Math.sqrt(evalRes.result);
      const formatted = formatValue(root, settings.decimalPrecision, settings.useGrouping);
      onAddHistory({
        type: 'calculation',
        expression: `√(${evalRes.result})`,
        result: formatted,
      });
      setLastResult(root);
      setDisplayValue(formatted);
      setExpression(root.toString());
      setErrorMessage(null);
    }
  }, [clickSound, expression, lastResult, onAddHistory, settings.decimalPrecision, settings.useGrouping]);

  const handleReciprocal = useCallback(() => {
    clickSound('op');
    const target = expression || (lastResult !== null ? lastResult.toString() : '0');
    const evalRes = evaluateExpression(target);
    if (evalRes.success && evalRes.result !== undefined) {
      if (Math.abs(evalRes.result) < 1e-15) {
        setErrorMessage('Cannot divide by zero');
        return;
      }
      const rec = 1 / evalRes.result;
      const formatted = formatValue(rec, settings.decimalPrecision, settings.useGrouping);
      onAddHistory({
        type: 'calculation',
        expression: `1/(${evalRes.result})`,
        result: formatted,
      });
      setLastResult(rec);
      setDisplayValue(formatted);
      setExpression(rec.toString());
      setErrorMessage(null);
    }
  }, [clickSound, expression, lastResult, onAddHistory, settings.decimalPrecision, settings.useGrouping]);

  const handleToggleSign = useCallback(() => {
    clickSound('num');
    setExpression((prev) => {
      if (!prev || prev === '0') return '-';
      if (prev.startsWith('-')) return prev.slice(1);
      return `-${prev}`;
    });
    setDisplayValue((prev) => {
      if (!prev || prev === '0') return '-';
      if (prev.startsWith('-')) return prev.slice(1);
      return `-${prev}`;
    });
  }, [clickSound]);

  const handleCopy = useCallback(() => {
    const textToCopy = displayValue.replace(/,/g, '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayValue]);

  // Memory functions
  const handleMemoryClear = () => {
    clickSound('clear');
    setMemoryValue(0);
  };
  const handleMemoryRecall = () => {
    clickSound('num');
    const str = memoryValue.toString();
    setExpression(str);
    setDisplayValue(str);
  };
  const handleMemoryAdd = () => {
    clickSound('op');
    const evalRes = evaluateExpression(expression || displayValue);
    if (evalRes.success && evalRes.result !== undefined) {
      setMemoryValue((prev) => prev + evalRes.result!);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDigit('.');
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '%') {
        handleOperator('%');
      } else if (e.key === '^') {
        handleOperator('^');
      } else if (e.key === '(' || e.key === ')') {
        handleOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleOperator, handleCalculate, handleBackspace, handleClearAll]);

  return (
    <div ref={containerRef} className="h-full flex flex-col p-6 max-w-4xl mx-auto">
      {/* Header zone */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Standard & Scientific Calculator
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span>Precision Math Engine</span>
            <span aria-hidden="true">·</span>
            <span>AST Algebraic Parser</span>
            <span aria-hidden="true">·</span>
            <span>Full Keyboard Bound</span>
          </div>
        </div>

        {/* Memory status indicator */}
        <div className="flex items-center gap-2">
          {memoryValue !== 0 && (
            <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              M = {memoryValue}
            </span>
          )}
          <button
            onClick={handleCopy}
            title="Copy current display value"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Main Glass Screen */}
      <div className="relative mb-5 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-[#12131a]/90 backdrop-blur-xl shadow-inner flex flex-col justify-end min-h-[140px] transition-colors">
        {/* Expression trace line */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 dark:text-zinc-500 h-6 overflow-x-auto">
          <span className="truncate pr-2">{expression || ' '}</span>
          {livePreview && (
            <span className="text-zinc-400 dark:text-zinc-500 shrink-0">
              preview: <strong className="text-zinc-600 dark:text-zinc-300 font-semibold">{livePreview}</strong>
            </span>
          )}
        </div>

        {/* Big display value */}
        <div className="text-right font-mono font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-50 tracking-tight select-all truncate mt-1">
          {displayValue}
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="text-xs font-medium text-rose-500 dark:text-rose-400 text-right mt-1 animate-pulse">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-5 gap-2.5 flex-1">
        {/* Row 0: Memory & Powers */}
        <button
          onClick={handleMemoryClear}
          className="py-3 px-2 rounded-xl text-xs font-semibold font-mono bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          MC
        </button>
        <button
          onClick={handleMemoryRecall}
          className="py-3 px-2 rounded-xl text-xs font-semibold font-mono bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          MR
        </button>
        <button
          onClick={handleMemoryAdd}
          className="py-3 px-2 rounded-xl text-xs font-semibold font-mono bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          M+
        </button>
        <button
          onClick={handleSquare}
          className="py-3 px-2 rounded-xl text-sm font-semibold font-mono bg-zinc-100/80 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          x²
        </button>
        <button
          onClick={handleSqrt}
          className="py-3 px-2 rounded-xl text-sm font-semibold font-mono bg-zinc-100/80 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          √x
        </button>

        {/* Row 1: Clears & Div */}
        <button
          onClick={handleClearAll}
          className="py-3 px-2 rounded-xl text-sm font-bold bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/40 transition-all active:scale-[0.98]"
        >
          C
        </button>
        <button
          onClick={handleClearEntry}
          className="py-3 px-2 rounded-xl text-sm font-bold bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/80 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 transition-all active:scale-[0.98]"
        >
          CE
        </button>
        <button
          onClick={handleBackspace}
          className="py-3 px-2 rounded-xl text-sm font-semibold flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleOperator('%')}
          className="py-3 px-2 rounded-xl text-base font-semibold font-mono bg-zinc-100/80 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/70 text-blue-600 dark:text-blue-400 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="py-3 px-2 rounded-xl text-lg font-bold font-mono bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 transition-all active:scale-[0.98]"
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, ^, × */}
        <button
          onClick={() => handleDigit('7')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('^')}
          className="py-3 px-2 rounded-xl text-base font-semibold font-mono bg-zinc-100/80 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/70 text-blue-600 dark:text-blue-400 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          xʸ
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="py-3 px-2 rounded-xl text-lg font-bold font-mono bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 transition-all active:scale-[0.98]"
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, 1/x, - */}
        <button
          onClick={() => handleDigit('4')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          6
        </button>
        <button
          onClick={handleReciprocal}
          className="py-3 px-2 rounded-xl text-sm font-semibold font-mono bg-zinc-100/80 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          1/x
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="py-3 px-2 rounded-xl text-xl font-bold font-mono bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 transition-all active:scale-[0.98]"
        >
          −
        </button>

        {/* Row 4: 1, 2, 3, (, + */}
        <button
          onClick={() => handleDigit('1')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('(')}
          className="py-3 px-2 rounded-xl text-base font-semibold font-mono bg-zinc-100/80 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          (
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="py-3 px-2 rounded-xl text-xl font-bold font-mono bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 transition-all active:scale-[0.98]"
        >
          +
        </button>

        {/* Row 5: ±, 0, ., ), = */}
        <button
          onClick={handleToggleSign}
          className="py-3 px-2 rounded-xl text-base font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          ±
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="py-3 px-2 rounded-xl text-lg font-semibold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          className="py-3 px-2 rounded-xl text-xl font-bold font-mono bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs active:scale-[0.98]"
        >
          .
        </button>
        <button
          onClick={() => handleOperator(')')}
          className="py-3 px-2 rounded-xl text-base font-semibold font-mono bg-zinc-100/80 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/40 transition-all active:scale-[0.98]"
        >
          )
        </button>
        <button
          onClick={handleCalculate}
          className={`py-3 px-2 rounded-xl text-xl font-bold font-mono shadow-md transition-all active:scale-[0.98] ${accent.primary}`}
        >
          =
        </button>
      </div>
    </div>
  );
};

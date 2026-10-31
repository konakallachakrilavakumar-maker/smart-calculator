import React, { useState } from 'react';
import {
  Trash2,
  CornerUpLeft,
  Download,
  Clock,
  Calculator,
  ArrowLeftRight,
} from 'lucide-react';
import { HistoryItem, NavigationTab } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onReuse: (value: string, tab: NavigationTab) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onDelete,
  onClearAll,
  onReuse,
}) => {
  const [filter, setFilter] = useState<'all' | 'calculation' | 'conversion'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredItems = history.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smartcalc_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ['ID', 'Type', 'Category', 'Expression', 'Result', 'Formula', 'Timestamp'];
    const rows = history.map((item) => [
      item.id,
      item.type,
      item.category || '',
      `"${item.expression.replace(/"/g, '""')}"`,
      `"${item.result.replace(/"/g, '""')}"`,
      `"${(item.formula || '').replace(/"/g, '""')}"`,
      item.timestamp,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `smartcalc_history_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Calculation &amp; Conversion History
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span>{history.length} Saved Records</span>
            <span aria-hidden="true">·</span>
            <span>Persistent JSON Storage</span>
            <span aria-hidden="true">·</span>
            <span>One-Click Result Reuse</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={exportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                title="Export as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 mb-4 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg w-fit border border-zinc-200/60 dark:border-zinc-700/40">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          All ({history.length})
        </button>
        <button
          onClick={() => setFilter('calculation')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'calculation'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Calculations ({history.filter((h) => h.type === 'calculation').length})
        </button>
        <button
          onClick={() => setFilter('conversion')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'conversion'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Conversions ({history.filter((h) => h.type === 'conversion').length})
        </button>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="mb-4 p-4 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-800 dark:text-rose-300">
              Clear complete history?
            </div>
            <div className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-0.5">
              This will remove all {history.length} stored calculation and conversion logs.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClearAll();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            >
              Confirm Clear
            </button>
          </div>
        </div>
      )}

      {/* History Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <Clock className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No history entries found
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
              Calculations made in the calculator and units transformed in the converter will be automatically recorded here.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12131a]/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === 'calculation'
                      ? 'bg-violet-500/10 text-violet-500 dark:text-violet-400'
                      : 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
                  }`}
                >
                  {item.type === 'calculation' ? (
                    <Calculator className="w-4 h-4" />
                  ) : (
                    <ArrowLeftRight className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {item.type === 'calculation' ? 'Calculation' : item.category || 'Conversion'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{item.timestamp}</span>
                  </div>

                  <div className="text-sm font-mono text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                    {item.expression}
                  </div>

                  <div className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    = {item.result}
                  </div>

                  {item.formula && (
                    <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {item.formula}
                    </div>
                  )}
                </div>
              </div>

              {/* Row Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() =>
                    onReuse(
                      item.result.replace(/,/g, '').split(' ')[0],
                      item.type === 'calculation' ? 'calculator' : 'converter'
                    )
                  }
                  title="Reuse this result"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                  <span>Reuse</span>
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  title="Delete record"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

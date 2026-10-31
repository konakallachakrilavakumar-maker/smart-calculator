import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 - 9', desc: 'Enter numbers' },
    { key: '.', desc: 'Decimal point' },
    { key: '+  -  *  /', desc: 'Arithmetic operations' },
    { key: '^', desc: 'Power operation (xʸ)' },
    { key: '%', desc: 'Modulo operator' },
    { key: '(  )', desc: 'Grouping parentheses' },
    { key: 'Enter or =', desc: 'Evaluate expression' },
    { key: 'Backspace', desc: 'Delete previous character' },
    { key: 'Escape', desc: 'Clear active expression' },
    { key: '?', desc: 'Open shortcuts dialog' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12131a] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-base text-zinc-900 dark:text-zinc-100">
            <Keyboard className="w-5 h-5 text-violet-500" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-xs"
            >
              <span className="text-zinc-600 dark:text-zinc-400">{sc.desc}</span>
              <kbd className="px-2 py-1 font-mono font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

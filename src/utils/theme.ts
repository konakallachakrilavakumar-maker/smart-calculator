import { AccentColor } from '../types';

export interface AccentTheme {
  name: string;
  primary: string;
  hover: string;
  lightBg: string;
  badge: string;
  border: string;
  glow: string;
}

export const ACCENT_THEMES: Record<AccentColor, AccentTheme> = {
  violet: {
    name: 'Electric Violet',
    primary: 'bg-violet-600 hover:bg-violet-700 text-white',
    hover: 'hover:bg-violet-600/10 hover:text-violet-400',
    lightBg: 'bg-violet-500/15 text-violet-400',
    badge: 'text-violet-400',
    border: 'border-violet-500/40 focus:border-violet-500',
    glow: 'rgba(124, 58, 237, 0.2)',
  },
  blue: {
    name: 'Cyber Blue',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    hover: 'hover:bg-blue-600/10 hover:text-blue-400',
    lightBg: 'bg-blue-500/15 text-blue-400',
    badge: 'text-blue-400',
    border: 'border-blue-500/40 focus:border-blue-500',
    glow: 'rgba(37, 99, 235, 0.2)',
  },
  emerald: {
    name: 'Emerald Green',
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    hover: 'hover:bg-emerald-600/10 hover:text-emerald-400',
    lightBg: 'bg-emerald-500/15 text-emerald-400',
    badge: 'text-emerald-400',
    border: 'border-emerald-500/40 focus:border-emerald-500',
    glow: 'rgba(5, 150, 105, 0.2)',
  },
  amber: {
    name: 'Sunset Amber',
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    hover: 'hover:bg-amber-600/10 hover:text-amber-400',
    lightBg: 'bg-amber-500/15 text-amber-400',
    badge: 'text-amber-400',
    border: 'border-amber-500/40 focus:border-amber-500',
    glow: 'rgba(217, 119, 6, 0.2)',
  },
  rose: {
    name: 'Rose Quartz',
    primary: 'bg-rose-600 hover:bg-rose-700 text-white',
    hover: 'hover:bg-rose-600/10 hover:text-rose-400',
    lightBg: 'bg-rose-500/15 text-rose-400',
    badge: 'text-rose-400',
    border: 'border-rose-500/40 focus:border-rose-500',
    glow: 'rgba(225, 29, 72, 0.2)',
  },
};

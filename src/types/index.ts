export type NavigationTab = 'calculator' | 'converter' | 'history' | 'settings' | 'inspector';

export type UnitCategory = 'Length' | 'Weight' | 'Temperature' | 'Speed' | 'Time' | 'Area' | 'Volume';

export interface HistoryItem {
  id: string;
  type: 'calculation' | 'conversion';
  category?: UnitCategory;
  expression: string;
  result: string;
  formula?: string;
  timestamp: string;
}

export type AccentColor = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';

export interface AppSettings {
  theme: 'dark' | 'light';
  accentColor: AccentColor;
  decimalPrecision: number;
  useGrouping: boolean;
  soundEnabled: boolean;
}

export interface UnitDefinition {
  name: string;
  factor?: number; // relative to base
  symbol?: string;
}

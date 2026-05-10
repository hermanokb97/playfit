import { createContext, useContext } from 'react';

export type SettingsContextValue = {
  fontScale: number;
  setFontScale: (v: number) => void;
  pointerScale: number;
  setPointerScale: (v: number) => void;
};

export const STORAGE_FONT = 'playfit-font-scale';
export const STORAGE_POINTER = 'playfit-pointer-scale';
export const FONT_MIN = 0.85;
export const FONT_MAX = 1.5;
export const POINTER_MIN = 0.6;
export const POINTER_MAX = 2;

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function readStored(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

export const settingsBounds = {
  font: { min: FONT_MIN, max: FONT_MAX },
  pointer: { min: POINTER_MIN, max: POINTER_MAX },
};

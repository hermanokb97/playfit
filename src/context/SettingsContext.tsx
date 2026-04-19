import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_FONT = 'playfit-font-scale';
const STORAGE_POINTER = 'playfit-pointer-scale';

function readStored(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export type SettingsContextValue = {
  fontScale: number;
  setFontScale: (v: number) => void;
  pointerScale: number;
  setPointerScale: (v: number) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const FONT_MIN = 0.85;
const FONT_MAX = 1.5;
const POINTER_MIN = 0.6;
const POINTER_MAX = 2;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScaleState] = useState(() =>
    clamp(readStored(STORAGE_FONT, 1), FONT_MIN, FONT_MAX)
  );
  const [pointerScale, setPointerScaleState] = useState(() =>
    clamp(readStored(STORAGE_POINTER, 1), POINTER_MIN, POINTER_MAX)
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--font-scale',
      String(fontScale)
    );
    try {
      localStorage.setItem(STORAGE_FONT, String(fontScale));
    } catch {
      /* ignore */
    }
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--pointer-scale',
      String(pointerScale)
    );
    try {
      localStorage.setItem(STORAGE_POINTER, String(pointerScale));
    } catch {
      /* ignore */
    }
  }, [pointerScale]);

  const setFontScale = useCallback((v: number) => {
    setFontScaleState(clamp(v, FONT_MIN, FONT_MAX));
  }, []);

  const setPointerScale = useCallback((v: number) => {
    setPointerScaleState(clamp(v, POINTER_MIN, POINTER_MAX));
  }, []);

  const value = useMemo(
    () => ({ fontScale, setFontScale, pointerScale, setPointerScale }),
    [fontScale, setFontScale, pointerScale, setPointerScale]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
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

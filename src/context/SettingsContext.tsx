import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  FONT_MAX,
  FONT_MIN,
  POINTER_MAX,
  POINTER_MIN,
  STORAGE_FONT,
  STORAGE_POINTER,
  SettingsContext,
  clamp,
  readStored,
} from './settings';

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

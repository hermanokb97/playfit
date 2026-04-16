import { useCallback, useRef } from 'react';

export function useAudio() {
  const cache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const playFile = useCallback((path: string) => {
    try {
      let audio = cache.current.get(path);
      if (!audio) {
        audio = new Audio(path);
        cache.current.set(path, audio);
      }
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {
      // audio playback not available
    }
  }, []);

  return { playFile };
}

import { useCallback, useRef } from 'react';
import { addPlayRecord, type PlayRecord } from '../utils/playRecords';

type RecordResult = Pick<
  PlayRecord,
  'score' | 'success' | 'total' | 'difficulty' | 'details'
>;

export function usePlayRecorder(gameId: string, gameTitle: string) {
  const startedAtRef = useRef(new Date().toISOString());
  const recordedRef = useRef(false);

  const resetSession = useCallback(() => {
    startedAtRef.current = new Date().toISOString();
    recordedRef.current = false;
  }, []);

  const recordPlay = useCallback(
    (result: RecordResult) => {
      if (recordedRef.current) return null;

      const endedAt = new Date().toISOString();
      recordedRef.current = true;

      return addPlayRecord({
        ...result,
        gameId,
        gameTitle,
        startedAt: startedAtRef.current,
        endedAt,
        durationMs: Math.max(
          0,
          new Date(endedAt).getTime() -
            new Date(startedAtRef.current).getTime()
        ),
      });
    },
    [gameId, gameTitle]
  );

  return { recordPlay, resetSession };
}

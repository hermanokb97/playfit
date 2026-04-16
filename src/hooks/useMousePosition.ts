import { useState, useEffect, useRef, type RefObject } from 'react';

interface MousePos {
  x: number;
  y: number;
}

export function useMousePosition(
  elementRef?: RefObject<HTMLElement | null>
): MousePos {
  const [pos, setPos] = useState<MousePos>({ x: 0, y: 0 });
  const posRef = useRef(pos);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      let x: number, y: number;
      if (elementRef?.current) {
        const rect = elementRef.current.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      if (posRef.current.x !== x || posRef.current.y !== y) {
        const next = { x, y };
        posRef.current = next;
        setPos(next);
      }
    };

    const target = elementRef?.current ?? window;
    target.addEventListener('mousemove', handler as EventListener);
    return () =>
      target.removeEventListener('mousemove', handler as EventListener);
  }, [elementRef]);

  return pos;
}

import type { PointerEvent as ReactPointerEvent } from 'react';

export interface CanvasPoint {
  x: number;
  y: number;
}

export function getPointerPosition(
  e: ReactPointerEvent<HTMLElement>
): CanvasPoint {
  const rect = e.currentTarget.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

export function capturePointer(e: ReactPointerEvent<HTMLElement>) {
  const target = e.currentTarget;
  if (target.hasPointerCapture?.(e.pointerId)) return;
  target.setPointerCapture?.(e.pointerId);
}

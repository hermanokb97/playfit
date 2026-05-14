import { useCallback, useRef, useEffect } from 'react';
import GameLayout from '../../components/GameLayout';
import { useSettings } from '../../context/settings';
import { usePlayRecorder } from '../../hooks/usePlayRecorder';
import { getRainbowColor } from '../../utils/animations';
import { capturePointer, getPointerPosition } from '../../utils/pointer';
import './MouseTrail.css';

interface TrailPoint {
  x: number;
  y: number;
  color: string;
}

export default function MouseTrail() {
  const { pointerScale } = useSettings();
  const { recordPlay } = usePlayRecorder('mouse-trail', '마우스 흔적 그림');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const colorIdxRef = useRef(0);
  const prevRef = useRef<{ x: number; y: number } | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      if (drawCanvasRef.current) {
        drawCanvasRef.current.width = rect.width * dpr;
        drawCanvasRef.current.height = rect.height * dpr;
        const dCtx = drawCanvasRef.current.getContext('2d');
        if (dCtx) dCtx.scale(dpr, dpr);
      }
    };

    if (!drawCanvasRef.current) {
      drawCanvasRef.current = document.createElement('canvas');
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const drawToPoint = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (prevRef.current) {
        const dx = x - prevRef.current.x;
        const dy = y - prevRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
          colorIdxRef.current += 0.05;
          const color = getRainbowColor(Math.floor(colorIdxRef.current));

          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 12 * pointerScale;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.moveTo(prevRef.current.x, prevRef.current.y);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(x, y, 18 * pointerScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          trailRef.current.push({ x, y, color });
        }
      }

      prevRef.current = { x, y };
    },
    [pointerScale]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      capturePointer(e);
      const point = getPointerPosition(e);
      prevRef.current = point;
      drawToPoint(point.x, point.y);
    },
    [drawToPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const point = getPointerPosition(e);
      drawToPoint(point.x, point.y);
    },
    [drawToPoint]
  );

  const handlePointerEnd = useCallback(() => {
    prevRef.current = null;
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    trailRef.current = [];
    prevRef.current = null;
    colorIdxRef.current = 0;
  }, []);

  const handleBeforeBack = useCallback(() => {
    if (trailRef.current.length === 0) return;
    recordPlay({
      score: trailRef.current.length,
      success: false,
      details: { strokes: trailRef.current.length },
    });
  }, [recordPlay]);

  return (
    <GameLayout
      title="🖌️ 마우스 흔적 그림"
      color="#ff9800"
      onBeforeBack={handleBeforeBack}
    >
      <div className="mouse-trail">
        <canvas
          ref={canvasRef}
          className="trail-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
        />
        <div className="trail-toolbar">
          <button className="trail-clear-btn" onClick={handleClear}>
            🗑️ 지우기
          </button>
          <span className="trail-hint">손가락이나 마우스로 그림을 그려보세요!</span>
        </div>
      </div>
    </GameLayout>
  );
}

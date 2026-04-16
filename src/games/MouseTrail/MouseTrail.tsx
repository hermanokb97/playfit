import { useCallback, useRef, useEffect } from 'react';
import GameLayout from '../../components/GameLayout';
import { getRainbowColor } from '../../utils/animations';
import './MouseTrail.css';

interface TrailPoint {
  x: number;
  y: number;
  color: string;
}

export default function MouseTrail() {
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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (prevRef.current) {
        const dx = x - prevRef.current.x;
        const dy = y - prevRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
          colorIdxRef.current += 0.05;
          const color = getRainbowColor(Math.floor(colorIdxRef.current));

          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 12;
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
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          trailRef.current.push({ x, y, color });
        }
      }

      prevRef.current = { x, y };
    },
    []
  );

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

  return (
    <GameLayout title="🖌️ 마우스 흔적 그림" color="#ff9800">
      <div className="mouse-trail">
        <canvas
          ref={canvasRef}
          className="trail-canvas"
          onMouseMove={handleMouseMove}
        />
        <div className="trail-toolbar">
          <button className="trail-clear-btn" onClick={handleClear}>
            🗑️ 지우기
          </button>
          <span className="trail-hint">마우스를 움직여 그림을 그려보세요!</span>
        </div>
      </div>
    </GameLayout>
  );
}

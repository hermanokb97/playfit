import { useCallback, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import SuccessOverlay from '../../components/SuccessOverlay';
import { useSettings } from '../../context/SettingsContext';
import { useCanvas } from '../../hooks/useCanvas';
import { playDing, playSuccess } from '../../utils/soundGenerator';
import { distance } from '../../utils/animations';
import './LineTracing.css';

interface PathPoint {
  x: number;
  y: number;
}

function generatePath(w: number, h: number): PathPoint[] {
  const points: PathPoint[] = [];
  const steps = 80;
  const cx = w / 2;
  const cy = h / 2;
  const rx = Math.min(w, h) * 0.35;
  const ry = rx * 0.5;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    points.push({
      x: cx + Math.cos(t) * rx,
      y: cy + Math.sin(t) * ry + Math.sin(t * 2) * 40,
    });
  }
  return points;
}

const BASE_TOLERANCE = 35;

export default function LineTracing() {
  const { pointerScale, fontScale } = useSettings();
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [level, setLevel] = useState(0);

  const mouseRef = useRef({ x: 0, y: 0 });
  const pathRef = useRef<PathPoint[]>([]);
  const visitedRef = useRef<Set<number>>(new Set());
  const initRef = useRef(false);
  const prevOnPath = useRef(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const handleSuccessDone = useCallback(() => {
    setShowSuccess(false);
    setLevel((l) => l + 1);
    initRef.current = false;
    visitedRef.current.clear();
    setProgress(0);
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const canvas = ctx.canvas;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!initRef.current || pathRef.current.length === 0) {
        pathRef.current = generatePath(w, h);
        visitedRef.current.clear();
        initRef.current = true;
      }

      ctx.fillStyle = '#fffef5';
      ctx.fillRect(0, 0, w, h);

      const path = pathRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const tolerance = BASE_TOLERANCE * pointerScale;

      ctx.save();
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = tolerance * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 6;
      ctx.setLineDash([8, 12]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      let isOnPath = false;
      let closestIdx = 0;
      let closestDist = Infinity;

      for (let i = 0; i < path.length; i++) {
        const d = distance(mx, my, path[i].x, path[i].y);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
        if (d < tolerance) {
          isOnPath = true;
        }
      }

      if (isOnPath) {
        const range = 3;
        for (let j = closestIdx - range; j <= closestIdx + range; j++) {
          const idx = ((j % path.length) + path.length) % path.length;
          visitedRef.current.add(idx);
        }

        if (!prevOnPath.current) {
          playDing();
        }
      }
      prevOnPath.current = isOnPath;

      const visited = visitedRef.current;
      if (visited.size > 1) {
        ctx.save();
        ctx.strokeStyle = '#66bb6a';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < path.length; i++) {
          if (visited.has(i)) {
            if (!started) {
              ctx.moveTo(path[i].x, path[i].y);
              started = true;
            } else {
              ctx.lineTo(path[i].x, path[i].y);
            }
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      const prog = Math.min(1, visited.size / path.length);
      setProgress(prog);

      if (prog >= 0.85 && !showSuccess) {
        playSuccess();
        setShowSuccess(true);
      }

      ctx.save();
      ctx.font = `${28 * fontScale}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏁', path[0].x, path[0].y - 30);
      ctx.restore();

      ctx.save();
      const cursorColor = isOnPath ? '#66bb6a' : '#ff8c42';
      ctx.fillStyle = cursorColor;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(mx, my, 12 * pointerScale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = cursorColor;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(mx, my, 5 * pointerScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    [showSuccess, pointerScale, fontScale]
  );

  const canvasRef = useCanvas(draw, [level, pointerScale, fontScale]);

  return (
    <GameLayout title="✏️ 선 따라가기" color="#009688">
      <div className="line-tracing">
        <canvas
          ref={canvasRef}
          className="line-canvas"
          onMouseMove={handleMouseMove}
        />
        <div className="line-progress">
          <div className="line-progress-bar">
            <div
              className="line-progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="line-progress-text">
            {Math.round(progress * 100)}%
          </span>
        </div>
        {showSuccess && (
          <SuccessOverlay
            message="선을 잘 따라갔어요! ✏️"
            onDone={handleSuccessDone}
          />
        )}
      </div>
    </GameLayout>
  );
}

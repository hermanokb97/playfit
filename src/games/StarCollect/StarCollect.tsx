import { useCallback, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import SuccessOverlay from '../../components/SuccessOverlay';
import { useCanvas } from '../../hooks/useCanvas';
import { playStarCollect } from '../../utils/soundGenerator';
import { distance, randomBetween } from '../../utils/animations';
import './StarCollect.css';

interface Star {
  x: number;
  y: number;
  size: number;
  collected: boolean;
  sparkle: number;
  fadeOut: number;
}

function createStars(w: number, h: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: randomBetween(60, w - 60),
      y: randomBetween(60, h - 60),
      size: randomBetween(20, 35),
      collected: false,
      sparkle: randomBetween(0, Math.PI * 2),
      fadeOut: 1,
    });
  }
  return stars;
}

const TOTAL_STARS = 15;

export default function StarCollect() {
  const [collected, setCollected] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [round, setRound] = useState(0);
  const mouseRef = useRef({ x: -200, y: -200 });
  const starsRef = useRef<Star[]>([]);
  const initRef = useRef(false);

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
    setRound((r) => r + 1);
    initRef.current = false;
    setCollected(0);
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      const canvas = ctx.canvas;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!initRef.current) {
        starsRef.current = createStars(w, h, TOTAL_STARS);
        initRef.current = true;
      }

      ctx.fillStyle = '#1a1a3e';
      ctx.fillRect(0, 0, w, h);

      const bgStarCount = 50;
      for (let i = 0; i < bgStarCount; i++) {
        const sx = (i * 137.5) % w;
        const sy = (i * 97.3) % h;
        const twinkle = Math.sin(frame * 0.03 + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.4})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      starsRef.current.forEach((star) => {
        if (star.collected) {
          star.fadeOut *= 0.9;
          if (star.fadeOut < 0.01) return;
        }

        if (
          !star.collected &&
          distance(mx, my, star.x, star.y) < star.size + 20
        ) {
          star.collected = true;
          playStarCollect();
          setCollected((c) => {
            const next = c + 1;
            if (next >= TOTAL_STARS) {
              setShowSuccess(true);
            }
            return next;
          });
        }

        star.sparkle += 0.05;

        ctx.save();
        ctx.translate(star.x, star.y);

        if (star.collected) {
          ctx.globalAlpha = star.fadeOut;
          ctx.scale(1 + (1 - star.fadeOut) * 2, 1 + (1 - star.fadeOut) * 2);
        } else {
          const pulse = 1 + Math.sin(star.sparkle) * 0.1;
          ctx.scale(pulse, pulse);
        }

        drawStar(ctx, 0, 0, star.size, star.collected);
        ctx.restore();
      });

      ctx.save();
      const glowSize = 30 + Math.sin(frame * 0.1) * 5;
      const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, glowSize);
      gradient.addColorStop(0, 'rgba(255, 255, 150, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mx, my, glowSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    []
  );

  const canvasRef = useCanvas(draw, [round]);

  return (
    <GameLayout title="🌟 별 모으기" color="#ffc107">
      <div className="star-collect">
        <canvas
          ref={canvasRef}
          className="star-canvas"
          onMouseMove={handleMouseMove}
        />
        <div className="star-counter">
          ⭐ {collected} / {TOTAL_STARS}
        </div>
        <p className="star-hint">마우스를 별 위로 움직여 보세요! (클릭 안 해도 돼요)</p>
        {showSuccess && (
          <SuccessOverlay
            message="별을 다 모았어요! ⭐"
            onDone={handleSuccessDone}
          />
        )}
      </div>
    </GameLayout>
  );
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  collected: boolean
) {
  const spikes = 5;
  const outer = size;
  const inner = size * 0.45;

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    const sx = x + Math.cos(angle) * r;
    const sy = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();

  if (collected) {
    ctx.fillStyle = '#fff9c4';
  } else {
    ctx.fillStyle = '#ffd54f';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = 15;
  }
  ctx.fill();
  ctx.shadowBlur = 0;
}

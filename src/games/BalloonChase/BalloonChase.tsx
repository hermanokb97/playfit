import { useCallback, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import { useCanvas } from '../../hooks/useCanvas';
import { playPop } from '../../utils/soundGenerator';
import {
  distance,
  randomBetween,
  hslToString,
  createParticles,
  updateParticles,
  drawParticles,
  type Particle,
} from '../../utils/animations';
import './BalloonChase.css';

interface Balloon {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  popping: boolean;
  popScale: number;
}

function createBalloon(w: number, h: number): Balloon {
  return {
    x: randomBetween(80, w - 80),
    y: randomBetween(80, h - 80),
    vx: randomBetween(-0.8, 0.8),
    vy: randomBetween(-0.6, -0.2),
    radius: randomBetween(35, 55),
    hue: randomBetween(0, 360),
    popping: false,
    popScale: 1,
  };
}

export default function BalloonChase() {
  const [score, setScore] = useState(0);
  const mouseRef = useRef({ x: -100, y: -100 });
  const balloonsRef = useRef<Balloon[]>([]);
  const particlesRef = useRef<Particle[]>([]);
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

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      const canvas = ctx.canvas;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!initRef.current) {
        for (let i = 0; i < 5; i++) {
          balloonsRef.current.push(createBalloon(w, h));
        }
        initRef.current = true;
      }

      ctx.fillStyle = '#eef7ff';
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      balloonsRef.current.forEach((b) => {
        if (b.popping) {
          b.popScale *= 0.85;
          return;
        }

        b.x += b.vx + Math.sin(frame * 0.02 + b.hue) * 0.3;
        b.y += b.vy;

        if (b.x < b.radius || b.x > w - b.radius) b.vx *= -1;
        if (b.y < b.radius) b.vy = Math.abs(b.vy);
        if (b.y > h - b.radius) b.vy = -Math.abs(b.vy) - 0.3;

        const dist = distance(mx, my, b.x, b.y);
        const proximity = Math.max(0, 1 - dist / 150);

        if (dist < b.radius + 15) {
          b.popping = true;
          playPop();
          particlesRef.current.push(
            ...createParticles(b.x, b.y, 12, hslToString(b.hue, 70, 60))
          );
          setScore((s) => s + 1);
          return;
        }

        const drawRadius = b.radius * (1 + proximity * 0.3);
        const saturation = 70 + proximity * 20;
        const lightness = 60 - proximity * 10;

        ctx.save();
        ctx.translate(b.x, b.y);

        ctx.fillStyle = hslToString(b.hue, saturation, lightness);
        ctx.beginPath();
        ctx.ellipse(0, 0, drawRadius, drawRadius * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hslToString(b.hue, saturation, lightness + 20, 0.4);
        ctx.beginPath();
        ctx.ellipse(
          -drawRadius * 0.3,
          -drawRadius * 0.3,
          drawRadius * 0.2,
          drawRadius * 0.35,
          -0.5,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = hslToString(b.hue, 40, 50, 0.6);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, drawRadius * 1.2);
        ctx.quadraticCurveTo(5, drawRadius * 1.6, -3, drawRadius * 2);
        ctx.stroke();

        ctx.restore();
      });

      balloonsRef.current = balloonsRef.current.filter(
        (b) => !b.popping || b.popScale > 0.05
      );

      while (balloonsRef.current.filter((b) => !b.popping).length < 4) {
        balloonsRef.current.push(createBalloon(w, h));
      }

      particlesRef.current = updateParticles(particlesRef.current);
      drawParticles(ctx, particlesRef.current);

      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    []
  );

  const canvasRef = useCanvas(draw);

  return (
    <GameLayout title="🎈 풍선 따라가기" color="#00bcd4">
      <div className="balloon-chase">
        <canvas
          ref={canvasRef}
          className="balloon-canvas"
          onMouseMove={handleMouseMove}
        />
        <div className="balloon-score">🎈 {score}개 터뜨림!</div>
      </div>
    </GameLayout>
  );
}

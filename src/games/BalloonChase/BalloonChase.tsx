import { useCallback, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import { useSettings } from '../../context/settings';
import { useCanvas } from '../../hooks/useCanvas';
import { usePlayRecorder } from '../../hooks/usePlayRecorder';
import { playPop } from '../../utils/soundGenerator';
import { capturePointer, getPointerPosition } from '../../utils/pointer';
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

interface Difficulty {
  label: string;
  minScore: number;
  activeBalloons: number;
  speedScale: number;
  minRadius: number;
  maxRadius: number;
}

const DIFFICULTIES: Difficulty[] = [
  {
    label: '쉬움',
    minScore: 0,
    activeBalloons: 4,
    speedScale: 1,
    minRadius: 42,
    maxRadius: 58,
  },
  {
    label: '보통',
    minScore: 5,
    activeBalloons: 5,
    speedScale: 1.35,
    minRadius: 34,
    maxRadius: 50,
  },
  {
    label: '어려움',
    minScore: 12,
    activeBalloons: 6,
    speedScale: 1.75,
    minRadius: 28,
    maxRadius: 44,
  },
];

function getDifficulty(score: number): Difficulty {
  return DIFFICULTIES.reduce((current, next) =>
    score >= next.minScore ? next : current
  );
}

function randomWithin(min: number, max: number): number {
  return max <= min ? min : randomBetween(min, max);
}

function createBalloon(w: number, h: number, difficulty: Difficulty): Balloon {
  const padding = Math.min(80, Math.max(45, Math.min(w, h) * 0.12));
  const speedX =
    randomBetween(0.35, 0.8) *
    difficulty.speedScale *
    (Math.random() > 0.5 ? 1 : -1);
  const speedY = -randomBetween(0.2, 0.6) * difficulty.speedScale;

  return {
    x: randomWithin(padding, w - padding),
    y: randomWithin(padding, h - padding),
    vx: speedX,
    vy: speedY,
    radius: randomBetween(difficulty.minRadius, difficulty.maxRadius),
    hue: randomBetween(0, 360),
    popping: false,
    popScale: 1,
  };
}

export default function BalloonChase() {
  const { pointerScale } = useSettings();
  const { recordPlay } = usePlayRecorder('balloon-chase', '풍선 따라가기');
  const [score, setScore] = useState(0);
  const mouseRef = useRef({ x: -100, y: -100 });
  const balloonsRef = useRef<Balloon[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const initRef = useRef(false);
  const difficulty = getDifficulty(score);

  const updatePointer = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    mouseRef.current = getPointerPosition(e);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      capturePointer(e);
      updatePointer(e);
    },
    [updatePointer]
  );

  const handleBeforeBack = useCallback(() => {
    if (score <= 0) return;
    recordPlay({
      score,
      success: false,
      difficulty: difficulty.label,
      details: { activeBalloons: difficulty.activeBalloons },
    });
  }, [difficulty, recordPlay, score]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      const canvas = ctx.canvas;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!initRef.current) {
        for (let i = 0; i < difficulty.activeBalloons; i++) {
          balloonsRef.current.push(createBalloon(w, h, difficulty));
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

        b.x +=
          b.vx + Math.sin(frame * 0.02 + b.hue) * 0.25 * difficulty.speedScale;
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

      while (
        balloonsRef.current.filter((b) => !b.popping).length <
        difficulty.activeBalloons
      ) {
        balloonsRef.current.push(createBalloon(w, h, difficulty));
      }

      particlesRef.current = updateParticles(particlesRef.current);
      drawParticles(ctx, particlesRef.current);

      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.arc(mx, my, 6 * pointerScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    [difficulty, pointerScale]
  );

  const canvasRef = useCanvas(draw, [difficulty, pointerScale]);

  return (
    <GameLayout
      title="🎈 풍선 따라가기"
      color="#00bcd4"
      onBeforeBack={handleBeforeBack}
    >
      <div className="balloon-chase">
        <canvas
          ref={canvasRef}
          className="balloon-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={updatePointer}
        />
        <div className="balloon-score">🎈 {score}개 터뜨림!</div>
        <div className="balloon-difficulty">{difficulty.label}</div>
      </div>
    </GameLayout>
  );
}

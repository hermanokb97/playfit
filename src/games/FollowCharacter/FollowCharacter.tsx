import { useCallback, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import { useCanvas } from '../../hooks/useCanvas';
import { playStarCollect } from '../../utils/soundGenerator';
import { lerp, distance, randomBetween } from '../../utils/animations';
import './FollowCharacter.css';

interface Food {
  x: number;
  y: number;
  emoji: string;
  collected: boolean;
  scale: number;
}

const FOOD_EMOJIS = ['🍎', '🍌', '🍇', '🍓', '🥕', '🍪', '🍩'];

export default function FollowCharacter() {
  const [score, setScore] = useState(0);
  const mouseRef = useRef({ x: 300, y: 300 });
  const charRef = useRef({ x: 300, y: 300 });
  const foodsRef = useRef<Food[]>([]);
  const frameCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnFood = useCallback((w: number, h: number) => {
    foodsRef.current.push({
      x: randomBetween(60, w - 60),
      y: randomBetween(60, h - 60),
      emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
      collected: false,
      scale: 1,
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const canvas = ctx.canvas;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      frameCountRef.current++;

      ctx.fillStyle = '#f0f7ff';
      ctx.fillRect(0, 0, w, h);

      charRef.current.x = lerp(charRef.current.x, mouseRef.current.x, 0.04);
      charRef.current.y = lerp(charRef.current.y, mouseRef.current.y, 0.04);

      if (frameCountRef.current % 120 === 0 && foodsRef.current.length < 6) {
        spawnFood(w, h);
      }
      if (foodsRef.current.length === 0) {
        spawnFood(w, h);
      }

      foodsRef.current.forEach((food) => {
        if (!food.collected) {
          const dist = distance(charRef.current.x, charRef.current.y, food.x, food.y);
          if (dist < 45) {
            food.collected = true;
            food.scale = 1.5;
            playStarCollect();
            setScore((s) => s + 1);
          }
        }
        if (food.collected) {
          food.scale *= 0.9;
        }
      });

      foodsRef.current = foodsRef.current.filter(
        (f) => !f.collected || f.scale > 0.1
      );

      foodsRef.current.forEach((food) => {
        ctx.save();
        ctx.translate(food.x, food.y);
        ctx.scale(food.scale, food.scale);
        if (!food.collected) {
          const bob = Math.sin(frameCountRef.current * 0.05 + food.x) * 3;
          ctx.translate(0, bob);
        }
        ctx.globalAlpha = food.collected ? food.scale : 1;
        ctx.font = '36px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.emoji, 0, 0);
        ctx.restore();
      });

      const cx = charRef.current.x;
      const cy = charRef.current.y;

      ctx.save();
      ctx.translate(cx, cy);
      const bob = Math.sin(frameCountRef.current * 0.08) * 4;
      ctx.translate(0, bob);

      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐣', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#ff8c42';
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    [spawnFood]
  );

  const canvasRef = useCanvas(draw);

  return (
    <GameLayout title="🐣 캐릭터 따라오기" color="#3f51b5">
      <div className="follow-char" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="follow-char-canvas"
          onMouseMove={handleMouseMove}
        />
        <div className="follow-char-score">
          🍎 {score}개
        </div>
        <p className="follow-char-hint">마우스를 움직여 보세요! 캐릭터가 따라와요</p>
      </div>
    </GameLayout>
  );
}

import { useCallback, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import { useCanvas } from '../../hooks/useCanvas';
import { playDing, playPop, playBubble } from '../../utils/soundGenerator';
import {
  createParticles,
  updateParticles,
  drawParticles,
  randomBetween,
  hslToString,
  type Particle,
} from '../../utils/animations';
import './SensoryTouch.css';

const SOUNDS = [playDing, playPop, playBubble];
const FACES = ['😊', '😄', '🥳', '😆', '🤩', '😍', '🫶', '👏'];

export default function SensoryTouch() {
  const [bgHue, setBgHue] = useState(40);
  const [face, setFace] = useState('😊');
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<{ x: number; y: number; r: number; alpha: number; color: string }[]>([]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newHue = randomBetween(0, 360);
      setBgHue(newHue);
      setFace(FACES[Math.floor(Math.random() * FACES.length)]);

      particlesRef.current.push(...createParticles(x, y, 15));
      ripplesRef.current.push({
        x,
        y,
        r: 0,
        alpha: 0.5,
        color: hslToString(newHue, 70, 65),
      });

      SOUNDS[Math.floor(Math.random() * SOUNDS.length)]();
    },
    []
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const canvas = ctx.canvas;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.fillStyle = hslToString(bgHue, 60, 92);
      ctx.fillRect(0, 0, w, h);

      ripplesRef.current = ripplesRef.current
        .map((r) => ({
          ...r,
          r: r.r + 4,
          alpha: r.alpha - 0.008,
        }))
        .filter((r) => r.alpha > 0);

      ripplesRef.current.forEach((r) => {
        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      particlesRef.current = updateParticles(particlesRef.current);
      drawParticles(ctx, particlesRef.current);
    },
    [bgHue]
  );

  const canvasRef = useCanvas(draw, [bgHue]);

  return (
    <GameLayout title="🎨 감각 놀이" color="#ef5350">
      <div className="sensory-container">
        <canvas
          ref={canvasRef}
          className="sensory-canvas"
          onClick={handleClick}
        />
        <div className="sensory-face" key={face}>
          {face}
        </div>
        <p className="sensory-hint">화면 아무 곳이나 눌러보세요!</p>
      </div>
    </GameLayout>
  );
}

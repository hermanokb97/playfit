import { useCallback, useEffect, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import SuccessOverlay from '../../components/SuccessOverlay';
import { useSettings } from '../../context/SettingsContext';
import { playClick, playDing } from '../../utils/soundGenerator';
import './NameWriting.css';

type Stage = 'setup' | 'writing';

const DEFAULT_NAME = '민준';

export default function NameWriting() {
  const { pointerScale } = useSettings();
  const [stage, setStage] = useState<Stage>('setup');
  const [nameInput, setNameInput] = useState(DEFAULT_NAME);
  const [targetName, setTargetName] = useState(DEFAULT_NAME);
  const [showSuccess, setShowSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPointRef = useRef<{ x: number; y: number } | null>(null);
  const drawingRef = useRef(false);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    prevPointRef.current = null;
    drawingRef.current = false;
    playClick();
  }, []);

  const startWriting = useCallback(() => {
    const nextName = nameInput.trim();
    if (!nextName) return;

    setTargetName(nextName);
    setStage('writing');
    setShowSuccess(false);
    window.setTimeout(resizeCanvas, 0);
    playDing();
  }, [nameInput, resizeCanvas]);

  const changeName = useCallback(() => {
    setStage('setup');
    clearCanvas();
  }, [clearCanvas]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawToPoint = useCallback(
    (point: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const prev = prevPointRef.current ?? point;
      const width = 12 * pointerScale;

      ctx.save();
      ctx.strokeStyle = '#5d48e8';
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(93, 72, 232, 0.18)';
      ctx.shadowBlur = 8 * pointerScale;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = 'rgba(255, 140, 66, 0.22)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 14 * pointerScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      prevPointRef.current = point;
    },
    [pointerScale]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      const point = getPoint(e);
      prevPointRef.current = point;
      drawToPoint(point);
    },
    [drawToPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      drawToPoint(getPoint(e));
    },
    [drawToPoint]
  );

  const stopDrawing = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    drawingRef.current = false;
    prevPointRef.current = null;
  }, []);

  const finishWriting = useCallback(() => {
    setShowSuccess(true);
  }, []);

  return (
    <GameLayout title="✍️ 이름 쓰기" color="#5d48e8">
      <div className="name-writing">
        {stage === 'setup' ? (
          <section className="name-setup" aria-labelledby="name-setup-title">
            <h2 id="name-setup-title" className="name-setup-title">
              선생님이 이름을 넣어주세요
            </h2>
            <div className="name-input-row">
              <label className="name-input-label" htmlFor="student-name">
                이름
              </label>
              <input
                id="student-name"
                className="name-input"
                value={nameInput}
                maxLength={12}
                autoFocus
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') startWriting();
                }}
              />
              <button
                type="button"
                className="name-start-btn"
                onClick={startWriting}
                disabled={!nameInput.trim()}
              >
                쓰기 시작
              </button>
            </div>
            <p className="name-setup-note">
              입력한 이름이 큰 글자로 나오면 학생이 마우스로 따라 쓸 수 있어요.
            </p>
          </section>
        ) : (
          <section className="name-writing-stage" aria-label={`${targetName} 이름 쓰기`}>
            <div className="name-guide-card">
              <div className="name-guide-text" aria-hidden="true">
                {targetName}
              </div>
              <canvas
                ref={canvasRef}
                className="name-writing-canvas"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
              />
            </div>

            <div className="name-toolbar">
              <button type="button" className="name-tool-btn secondary" onClick={changeName}>
                이름 바꾸기
              </button>
              <button type="button" className="name-tool-btn danger" onClick={clearCanvas}>
                지우기
              </button>
              <button type="button" className="name-tool-btn primary" onClick={finishWriting}>
                다 썼어요
              </button>
            </div>
            <p className="name-writing-hint">
              흐린 이름을 보고 마우스를 누른 채 천천히 따라 써보세요.
            </p>
          </section>
        )}

        {showSuccess && (
          <SuccessOverlay
            message={`${targetName} 이름을 멋지게 썼어요!`}
            onDone={() => setShowSuccess(false)}
          />
        )}
      </div>
    </GameLayout>
  );
}

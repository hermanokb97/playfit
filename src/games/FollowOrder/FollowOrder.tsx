import { useState, useCallback } from 'react';
import GameLayout from '../../components/GameLayout';
import SuccessOverlay from '../../components/SuccessOverlay';
import { playDing, playWrong, playSuccess } from '../../utils/soundGenerator';
import './FollowOrder.css';

const LEVELS = [
  [1, 2, 3],
  [1, 2, 3, 4],
  [1, 2, 3, 4, 5],
];

export default function FollowOrder() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [nextExpected, setNextExpected] = useState(0);
  const [pressed, setPressed] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const [characterPos, setCharacterPos] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const numbers = LEVELS[levelIdx];
  const totalSteps = numbers.length;

  const reset = useCallback(() => {
    setNextExpected(0);
    setPressed([]);
    setCharacterPos(0);
  }, []);

  const handleClick = useCallback(
    (num: number) => {
      if (showSuccess) return;

      if (num === numbers[nextExpected]) {
        playDing();
        const newPressed = [...pressed, num];
        setPressed(newPressed);
        const newStep = nextExpected + 1;
        setNextExpected(newStep);
        setCharacterPos((newStep / totalSteps) * 100);

        if (newStep === totalSteps) {
          playSuccess();
          setShowSuccess(true);
        }
      } else {
        playWrong();
        setShake(true);
        setTimeout(() => {
          setShake(false);
          reset();
        }, 500);
      }
    },
    [nextExpected, numbers, pressed, totalSteps, showSuccess, reset]
  );

  const handleSuccessDone = useCallback(() => {
    setShowSuccess(false);
    const next = levelIdx + 1;
    if (next < LEVELS.length) {
      setLevelIdx(next);
    } else {
      setLevelIdx(0);
    }
    reset();
  }, [levelIdx, reset]);

  return (
    <GameLayout title="🚶 순서 따라하기" color="#e91e63">
      <div className={`follow-order ${shake ? 'shake' : ''}`}>
        <div className="order-track">
          <div className="order-track-bg" />
          <div
            className="order-character"
            style={{ left: `${characterPos}%` }}
          >
            🚶
          </div>
          <div className="order-goal">🏠</div>
        </div>

        <div className="order-buttons">
          {numbers.map((num) => (
            <button
              key={num}
              className={`order-btn ${pressed.includes(num) ? 'done' : ''}`}
              onClick={() => handleClick(num)}
              disabled={pressed.includes(num)}
            >
              {num}
            </button>
          ))}
        </div>

        <p className="order-hint">
          숫자를 순서대로 눌러주세요! ({levelIdx + 1}단계)
        </p>

        {showSuccess && (
          <SuccessOverlay
            message="순서를 잘 맞췄어요! 🎉"
            onDone={handleSuccessDone}
          />
        )}
      </div>
    </GameLayout>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import SuccessOverlay from '../../components/SuccessOverlay';
import { usePlayRecorder } from '../../hooks/usePlayRecorder';
import { playDing, playWrong } from '../../utils/soundGenerator';
import './RedGreen.css';

type Phase = 'red' | 'green';
type Feedback = { type: 'correct' | 'wrong'; message: string };
type WrongKind = 'miss' | 'falsePress';
type Difficulty = {
  label: string;
  description: string;
  mode: 'alternate' | 'random';
};

const TARGET_SCORE = 10;
const LEVEL_TWO_SCORE = 5;
const RED_DURATION = 1700;
const GREEN_DURATION = 1500;

function getDifficulty(score: number): Difficulty {
  if (score < LEVEL_TWO_SCORE) {
    return {
      label: '1단계',
      description: '번갈아 나와요',
      mode: 'alternate',
    };
  }

  return {
    label: '2단계',
    description: '변칙적으로 나와요',
    mode: 'random',
  };
}

function pickVariablePhase(previous: Phase): Phase {
  if (Math.random() < 0.35) return previous;
  return Math.random() > 0.45 ? 'green' : 'red';
}

function pickNextPhase(previous: Phase, difficulty: Difficulty): Phase {
  if (difficulty.mode === 'alternate') {
    return previous === 'red' ? 'green' : 'red';
  }

  return pickVariablePhase(previous);
}

export default function RedGreen() {
  const { recordPlay, resetSession } = usePlayRecorder(
    'red-green',
    '빨강 초록 누르기'
  );
  const [phase, setPhase] = useState<Phase>('red');
  const [turn, setTurn] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falsePresses, setFalsePresses] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [locked, setLocked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const difficulty = getDifficulty(score);

  const scoreRef = useRef(0);
  const missesRef = useRef(0);
  const falsePressesRef = useRef(0);
  const lockedRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current == null) return;
    window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
  }, []);

  const startNextTurn = useCallback(() => {
    clearAdvanceTimer();
    advanceTimerRef.current = window.setTimeout(() => {
      if (scoreRef.current >= TARGET_SCORE) return;
      lockedRef.current = false;
      setLocked(false);
      setFeedback(null);
      setPhase((current) =>
        pickNextPhase(current, getDifficulty(scoreRef.current))
      );
      setTurn((current) => current + 1);
    }, 850);
  }, [clearAdvanceTimer]);

  const recordSuccess = useCallback(
    (nextScore: number) => {
      recordPlay({
        score: nextScore,
        total: TARGET_SCORE,
        success: true,
        difficulty: getDifficulty(nextScore).label,
        details: {
          misses: missesRef.current,
          falsePresses: falsePressesRef.current,
        },
      });
    },
    [recordPlay]
  );

  const markCorrect = useCallback(
    (message: string) => {
      if (lockedRef.current || showSuccess) return;
      lockedRef.current = true;
      setLocked(true);
      setFeedback({ type: 'correct', message });
      playDing();

      setScore((current) => {
        const next = current + 1;
        scoreRef.current = next;
        if (next >= TARGET_SCORE) {
          recordSuccess(next);
          setShowSuccess(true);
        } else {
          startNextTurn();
        }
        return next;
      });
    },
    [recordSuccess, showSuccess, startNextTurn]
  );

  const markWrong = useCallback(
    (message: string, kind: WrongKind) => {
      if (lockedRef.current || showSuccess) return;
      lockedRef.current = true;
      setLocked(true);
      setFeedback({ type: 'wrong', message });
      playWrong();

      if (kind === 'miss') {
        missesRef.current += 1;
        setMisses(missesRef.current);
      } else {
        falsePressesRef.current += 1;
        setFalsePresses(falsePressesRef.current);
      }

      startNextTurn();
    },
    [showSuccess, startNextTurn]
  );

  useEffect(() => {
    if (showSuccess || locked) return;

    const timer = window.setTimeout(() => {
      if (phase === 'red') {
        markCorrect('잘 기다렸어요!');
      } else {
        markWrong('초록색일 때 눌러요!', 'miss');
      }
    }, phase === 'red' ? RED_DURATION : GREEN_DURATION);

    return () => window.clearTimeout(timer);
  }, [locked, markCorrect, markWrong, phase, showSuccess, turn]);

  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  const handlePress = useCallback(() => {
    if (phase === 'green') {
      markCorrect('맞았어요!');
    } else {
      markWrong('빨간색은 기다려요!', 'falsePress');
    }
  }, [markCorrect, markWrong, phase]);

  const handleSuccessDone = useCallback(() => {
    clearAdvanceTimer();
    scoreRef.current = 0;
    missesRef.current = 0;
    falsePressesRef.current = 0;
    lockedRef.current = false;
    setShowSuccess(false);
    setScore(0);
    setMisses(0);
    setFalsePresses(0);
    setFeedback(null);
    setLocked(false);
    setPhase('red');
    setTurn((current) => current + 1);
    resetSession();
  }, [clearAdvanceTimer, resetSession]);

  const handleBeforeBack = useCallback(() => {
    if (score <= 0 && misses <= 0 && falsePresses <= 0) return;
    recordPlay({
      score,
      total: TARGET_SCORE,
      success: false,
      details: { misses, falsePresses },
      difficulty: difficulty.label,
    });
  }, [difficulty.label, falsePresses, misses, recordPlay, score]);

  return (
    <GameLayout
      title="🔴🟢 빨강 초록 누르기"
      color="#2e7d32"
      onBeforeBack={handleBeforeBack}
    >
      <div className={`red-green red-green-${phase}`}>
        <div className="red-green-stats">
          <span>정답 {score} / {TARGET_SCORE}</span>
          <span>{difficulty.label}</span>
          <span>놓침 {misses}</span>
          <span>빨강 누름 {falsePresses}</span>
        </div>

        <div className="red-green-level" aria-live="polite">
          {difficulty.description}
        </div>

        <button
          type="button"
          className="red-green-button"
          onClick={handlePress}
          disabled={locked || showSuccess}
          aria-label={phase === 'green' ? '초록색 누르기' : '빨간색 기다리기'}
        >
          <span className="red-green-light" />
          <span className="red-green-command">
            {phase === 'green' ? '눌러요' : '기다려요'}
          </span>
        </button>

        <div className="red-green-feedback" aria-live="polite">
          {feedback?.message}
        </div>

        {showSuccess && (
          <SuccessOverlay
            message="색깔 신호를 잘 맞췄어요! 🎉"
            onDone={handleSuccessDone}
          />
        )}
      </div>
    </GameLayout>
  );
}

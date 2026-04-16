import { useState, useCallback } from 'react';
import GameLayout from '../../components/GameLayout';
import SuccessOverlay from '../../components/SuccessOverlay';
import { playDing, playWrong } from '../../utils/soundGenerator';
import './EmotionPicker.css';

interface Question {
  face: string;
  situation: string;
  answer: string;
  options: { emoji: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    face: '😊',
    situation: '선물을 받았을 때',
    answer: '기뻐요',
    options: [
      { emoji: '😊', label: '기뻐요' },
      { emoji: '😢', label: '슬퍼요' },
      { emoji: '😠', label: '화나요' },
    ],
  },
  {
    face: '😢',
    situation: '친구가 이사를 갔을 때',
    answer: '슬퍼요',
    options: [
      { emoji: '😊', label: '기뻐요' },
      { emoji: '😢', label: '슬퍼요' },
      { emoji: '😮', label: '놀라요' },
    ],
  },
  {
    face: '😠',
    situation: '장난감을 빼앗겼을 때',
    answer: '화나요',
    options: [
      { emoji: '😠', label: '화나요' },
      { emoji: '😊', label: '기뻐요' },
      { emoji: '😴', label: '졸려요' },
    ],
  },
  {
    face: '😮',
    situation: '깜짝 파티가 열렸을 때',
    answer: '놀라요',
    options: [
      { emoji: '😢', label: '슬퍼요' },
      { emoji: '😮', label: '놀라요' },
      { emoji: '😠', label: '화나요' },
    ],
  },
  {
    face: '😴',
    situation: '밤 늦게까지 놀았을 때',
    answer: '졸려요',
    options: [
      { emoji: '😴', label: '졸려요' },
      { emoji: '😊', label: '기뻐요' },
      { emoji: '😮', label: '놀라요' },
    ],
  },
  {
    face: '😰',
    situation: '높은 곳에 올라갔을 때',
    answer: '무서워요',
    options: [
      { emoji: '😊', label: '기뻐요' },
      { emoji: '😰', label: '무서워요' },
      { emoji: '😴', label: '졸려요' },
    ],
  },
];

export default function EmotionPicker() {
  const [qIdx, setQIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const question = QUESTIONS[qIdx];

  const handlePick = useCallback(
    (label: string) => {
      if (feedback) return;

      if (label === question.answer) {
        playDing();
        setFeedback('correct');
        setScore((s) => s + 1);
        setTimeout(() => {
          setFeedback(null);
          if (qIdx + 1 < QUESTIONS.length) {
            setQIdx(qIdx + 1);
          } else {
            setShowSuccess(true);
          }
        }, 1200);
      } else {
        playWrong();
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 800);
      }
    },
    [feedback, question.answer, qIdx]
  );

  const handleSuccessDone = useCallback(() => {
    setShowSuccess(false);
    setQIdx(0);
    setScore(0);
  }, []);

  return (
    <GameLayout title="😊 감정 선택하기" color="#9c27b0">
      <div className="emotion-picker">
        <div className="emotion-score">
          {Array.from({ length: QUESTIONS.length }).map((_, i) => (
            <span key={i} className={`emotion-dot ${i < score ? 'filled' : ''}`} />
          ))}
        </div>

        <div className={`emotion-question ${feedback === 'correct' ? 'correct-flash' : ''}`}>
          <span className="emotion-face">{question.face}</span>
          <p className="emotion-situation">{question.situation}</p>
          <p className="emotion-ask">어떤 기분일까요?</p>
        </div>

        <div className="emotion-options">
          {question.options.map((opt) => (
            <button
              key={opt.label}
              className={`emotion-btn ${
                feedback === 'correct' && opt.label === question.answer
                  ? 'correct'
                  : feedback === 'wrong' && opt.label !== question.answer
                    ? ''
                    : ''
              }`}
              onClick={() => handlePick(opt.label)}
            >
              <span className="emotion-btn-emoji">{opt.emoji}</span>
              <span className="emotion-btn-label">{opt.label}</span>
            </button>
          ))}
        </div>

        {feedback === 'correct' && (
          <div className="emotion-feedback correct">맞았어요! 👏</div>
        )}
        {feedback === 'wrong' && (
          <div className="emotion-feedback wrong">다시 해볼까요? 🤔</div>
        )}

        {showSuccess && (
          <SuccessOverlay
            message="감정을 잘 알아냈어요! 🌟"
            onDone={handleSuccessDone}
          />
        )}
      </div>
    </GameLayout>
  );
}

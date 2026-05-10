import { useCallback, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import SuccessOverlay from '../../components/SuccessOverlay';
import { usePlayRecorder } from '../../hooks/usePlayRecorder';
import { playDing, playWrong } from '../../utils/soundGenerator';
import './EmotionPicker.css';

interface EmojiQuestion {
  target: string;
  options: string[];
}

const QUESTIONS: EmojiQuestion[] = [
  { target: '😊', options: ['😊', '😢', '😮', '😴'] },
  { target: '🎈', options: ['⭐', '🎈', '🌸', '🍎'] },
  { target: '🐣', options: ['🐰', '🐣', '🐻', '🐸'] },
  { target: '🍓', options: ['🍌', '🍓', '🍪', '🍇'] },
  { target: '⭐', options: ['✨', '🌙', '⭐', '☀️'] },
  { target: '👏', options: ['🫶', '👏', '👍', '🙌'] },
  { target: '🚗', options: ['🚲', '🚗', '✈️', '🚂'] },
  { target: '🌈', options: ['☁️', '🌈', '🔥', '💧'] },
];

export default function EmotionPicker() {
  const { recordPlay, resetSession } = usePlayRecorder(
    'emoji-match',
    '같은 이모티콘 고르기'
  );
  const [qIdx, setQIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const question = QUESTIONS[qIdx];

  const handlePick = useCallback(
    (emoji: string) => {
      if (feedback) return;

      if (emoji === question.target) {
        playDing();
        setFeedback('correct');
        setScore((current) => {
          const next = current + 1;
          if (qIdx + 1 >= QUESTIONS.length) {
            recordPlay({
              score: next,
              total: QUESTIONS.length,
              success: true,
            });
          }
          return next;
        });

        setTimeout(() => {
          setFeedback(null);
          if (qIdx + 1 < QUESTIONS.length) {
            setQIdx(qIdx + 1);
          } else {
            setShowSuccess(true);
          }
        }, 900);
      } else {
        playWrong();
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 800);
      }
    },
    [feedback, qIdx, question.target, recordPlay]
  );

  const handleSuccessDone = useCallback(() => {
    setShowSuccess(false);
    setQIdx(0);
    setScore(0);
    resetSession();
  }, [resetSession]);

  const handleBeforeBack = useCallback(() => {
    if (score <= 0) return;
    recordPlay({
      score,
      total: QUESTIONS.length,
      success: false,
    });
  }, [recordPlay, score]);

  return (
    <GameLayout
      title="😃 같은 이모티콘 고르기"
      color="#9c27b0"
      onBeforeBack={handleBeforeBack}
    >
      <div className="emoji-match">
        <div className="emoji-score">
          {Array.from({ length: QUESTIONS.length }).map((_, i) => (
            <span key={i} className={`emoji-dot ${i < score ? 'filled' : ''}`} />
          ))}
        </div>

        <section
          className={`emoji-target ${
            feedback === 'correct' ? 'correct-flash' : ''
          }`}
          aria-label="제시된 이모티콘"
        >
          <p className="emoji-target-label">같은 이모티콘을 골라요</p>
          <div className="emoji-target-symbol">{question.target}</div>
        </section>

        <div className="emoji-options">
          {question.options.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`emoji-option ${
                feedback === 'correct' && emoji === question.target
                  ? 'correct'
                  : ''
              }`}
              onClick={() => handlePick(emoji)}
              aria-label={`${emoji} 선택`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {feedback === 'correct' && (
          <div className="emoji-feedback correct">맞았어요! 👏</div>
        )}
        {feedback === 'wrong' && (
          <div className="emoji-feedback wrong">다시 골라볼까요? 🤔</div>
        )}

        {showSuccess && (
          <SuccessOverlay
            message="같은 이모티콘을 잘 찾았어요! 🌟"
            onDone={handleSuccessDone}
          />
        )}
      </div>
    </GameLayout>
  );
}

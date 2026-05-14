import { useNavigate } from 'react-router-dom';
import GameCard from './components/GameCard';
import AccessibilitySettings from './components/AccessibilitySettings';
import { playClick } from './utils/soundGenerator';
import './Home.css';

const GAMES = [
  { emoji: '🎨', title: '감각 놀이', path: '/sensory-touch', color: 'var(--color-card-1)' },
  { emoji: '🚶', title: '순서 따라하기', path: '/follow-order', color: 'var(--color-card-2)' },
  { emoji: '😃', title: '같은 이모티콘 고르기', path: '/emotion-picker', color: 'var(--color-card-3)' },
  { emoji: '🐣', title: '캐릭터 따라오기', path: '/follow-character', color: 'var(--color-card-4)' },
  { emoji: '🎈', title: '풍선 따라가기', path: '/balloon-chase', color: 'var(--color-card-5)' },
  { emoji: '✏️', title: '선 따라가기', path: '/line-tracing', color: 'var(--color-card-6)' },
  { emoji: '🌟', title: '별 모으기', path: '/star-collect', color: 'var(--color-card-7)' },
  { emoji: '🖌️', title: '마우스 흔적 그림', path: '/mouse-trail', color: 'var(--color-card-8)' },
  { emoji: '🔴🟢', title: '빨강 초록 누르기', path: '/red-green', color: '#c8e6c9' },
  { emoji: '✍️', title: '이름 쓰기', path: '/name-writing', color: 'var(--color-card-6)' },
];

export default function Home() {
  const navigate = useNavigate();

  const openRecords = () => {
    playClick();
    navigate('/records');
  };

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">🎮 Playfit</h1>
        <p className="home-subtitle">함께 놀아요!</p>
      </header>
      <div className="home-controls">
        <AccessibilitySettings className="home-settings" idPrefix="home" />
        <button type="button" className="home-records-btn" onClick={openRecords}>
          기록 보기
        </button>
      </div>
      <div className="home-grid">
        {GAMES.map((game, i) => (
          <GameCard
            key={game.path}
            emoji={game.emoji}
            title={game.title}
            path={game.path}
            color={game.color}
            delay={i * 80}
          />
        ))}
      </div>
    </div>
  );
}

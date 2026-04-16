import { useNavigate } from 'react-router-dom';
import { playClick } from '../utils/soundGenerator';
import './GameCard.css';

interface GameCardProps {
  emoji: string;
  title: string;
  path: string;
  color: string;
  delay?: number;
}

export default function GameCard({ emoji, title, path, color, delay = 0 }: GameCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    playClick();
    navigate(path);
  };

  return (
    <button
      className="game-card"
      onClick={handleClick}
      style={{
        background: color,
        animationDelay: `${delay}ms`,
      }}
    >
      <span className="game-card-emoji">{emoji}</span>
      <span className="game-card-title">{title}</span>
    </button>
  );
}

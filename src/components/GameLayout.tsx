import { useNavigate } from 'react-router-dom';
import { playClick } from '../utils/soundGenerator';
import './GameLayout.css';

interface GameLayoutProps {
  title: string;
  color: string;
  children: React.ReactNode;
}

export default function GameLayout({ title, color, children }: GameLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    playClick();
    navigate('/');
  };

  return (
    <div className="game-layout" style={{ '--accent': color } as React.CSSProperties}>
      <header className="game-header">
        <button className="back-btn" onClick={handleBack}>
          ← 돌아가기
        </button>
        <h1 className="game-title">{title}</h1>
      </header>
      <main className="game-content">
        {children}
      </main>
    </div>
  );
}

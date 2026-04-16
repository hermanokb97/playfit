import { useEffect, useState } from 'react';
import { playSuccess } from '../utils/soundGenerator';
import './SuccessOverlay.css';

interface SuccessOverlayProps {
  message?: string;
  onDone?: () => void;
}

export default function SuccessOverlay({
  message = '잘했어요! 🎉',
  onDone,
}: SuccessOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    playSuccess();
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="success-overlay">
      <div className="success-content">
        <div className="success-stars">⭐🌟⭐</div>
        <h2 className="success-message">{message}</h2>
        <div className="success-confetti">🎊✨🎊</div>
      </div>
    </div>
  );
}

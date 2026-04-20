import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccessibilitySettings from './AccessibilitySettings';
import { useSettings, settingsBounds } from '../context/SettingsContext';
import { playClick } from '../utils/soundGenerator';
import './GameLayout.css';

interface GameLayoutProps {
  title: string;
  color: string;
  children: React.ReactNode;
}

export default function GameLayout({ title, color, children }: GameLayoutProps) {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { pointerScale, setPointerScale } = useSettings();
  const pointerControlId = 'game-pointer-scale';

  const handleBack = () => {
    playClick();
    navigate('/');
  };

  const openSettings = () => {
    playClick();
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    playClick();
    setSettingsOpen(false);
  };

  return (
    <div className="game-layout" style={{ '--accent': color } as React.CSSProperties}>
      <header className="game-header">
        <button className="back-btn" onClick={handleBack}>
          ← 돌아가기
        </button>
        <h1 className="game-title">{title}</h1>
        <div
          className="game-pointer-control"
          role="group"
          aria-label="마우스 크기 조절"
        >
          <label className="game-pointer-label" htmlFor={pointerControlId}>
            마우스 크기
          </label>
          <input
            id={pointerControlId}
            type="range"
            min={settingsBounds.pointer.min}
            max={settingsBounds.pointer.max}
            step={0.05}
            value={pointerScale}
            aria-valuetext={`${Math.round(pointerScale * 100)}%`}
            onChange={(e) => setPointerScale(parseFloat(e.target.value))}
          />
          <span className="game-pointer-value" aria-live="polite">
            {Math.round(pointerScale * 100)}%
          </span>
        </div>
      </header>
      <main className="game-content">
        {children}
      </main>
      <button
        type="button"
        className="game-settings-fab"
        onClick={openSettings}
        aria-label="글자와 마우스 크기 설정"
      >
        ⚙️
      </button>
      {settingsOpen && (
        <div
          className="game-settings-backdrop"
          role="presentation"
          onClick={closeSettings}
        >
          <div
            className="game-settings-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-settings-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="game-settings-heading" className="game-settings-heading">
              화면 설정
            </h2>
            <AccessibilitySettings idPrefix="ingame" />
            <button type="button" className="game-settings-close" onClick={closeSettings}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

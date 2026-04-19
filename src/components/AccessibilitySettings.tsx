import { useSettings, settingsBounds } from '../context/SettingsContext';
import './AccessibilitySettings.css';

type Props = {
  className?: string;
  idPrefix?: string;
};

export default function AccessibilitySettings({
  className = '',
  idPrefix = 'settings',
}: Props) {
  const { fontScale, setFontScale, pointerScale, setPointerScale } =
    useSettings();

  const fontId = `${idPrefix}-font`;
  const pointerId = `${idPrefix}-pointer`;

  return (
    <div className={`accessibility-settings ${className}`.trim()} role="group" aria-label="화면 설정">
      <div className="accessibility-row">
        <label className="accessibility-label" htmlFor={fontId}>
          글자 크기
        </label>
        <input
          id={fontId}
          type="range"
          min={settingsBounds.font.min}
          max={settingsBounds.font.max}
          step={0.05}
          value={fontScale}
          onChange={(e) => setFontScale(parseFloat(e.target.value))}
        />
        <span className="accessibility-value" aria-live="polite">
          {Math.round(fontScale * 100)}%
        </span>
      </div>
      <div className="accessibility-row">
        <label className="accessibility-label" htmlFor={pointerId}>
          마우스 표시 크기
        </label>
        <input
          id={pointerId}
          type="range"
          min={settingsBounds.pointer.min}
          max={settingsBounds.pointer.max}
          step={0.05}
          value={pointerScale}
          onChange={(e) => setPointerScale(parseFloat(e.target.value))}
        />
        <span className="accessibility-value" aria-live="polite">
          {Math.round(pointerScale * 100)}%
        </span>
      </div>
    </div>
  );
}

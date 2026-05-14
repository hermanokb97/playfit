import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearPlayRecords,
  exportPlayRecordsCsv,
  getPlayRecords,
  type PlayRecord,
} from './utils/playRecords';
import { playClick } from './utils/soundGenerator';
import './Records.css';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes}분 ${rest}초` : `${rest}초`;
}

function recordScore(record: PlayRecord): string {
  if (record.total == null) return `${record.score}`;
  return `${record.score} / ${record.total}`;
}

export default function Records() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(() => getPlayRecords());

  const summary = useMemo(() => {
    const successCount = records.filter((record) => record.success).length;
    const bestScore = records.reduce(
      (best, record) => Math.max(best, record.score),
      0
    );
    return {
      total: records.length,
      successCount,
      bestScore,
    };
  }, [records]);

  const handleBack = () => {
    playClick();
    navigate('/');
  };

  const handleExport = () => {
    playClick();
    exportPlayRecordsCsv(records);
  };

  const handleClear = () => {
    playClick();
    if (!window.confirm('모든 기록을 삭제할까요?')) return;
    clearPlayRecords();
    setRecords([]);
  };

  return (
    <div className="records-page">
      <header className="records-header">
        <button type="button" className="records-back" onClick={handleBack}>
          ← 돌아가기
        </button>
        <div>
          <h1 className="records-title">기록 보기</h1>
          <p className="records-subtitle">최근 플레이 기록을 확인해요</p>
        </div>
      </header>

      <section className="records-summary" aria-label="기록 요약">
        <div className="records-summary-card">
          <span>전체 기록</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="records-summary-card">
          <span>성공</span>
          <strong>{summary.successCount}</strong>
        </div>
        <div className="records-summary-card">
          <span>최고 점수</span>
          <strong>{summary.bestScore}</strong>
        </div>
      </section>

      <div className="records-actions">
        <button
          type="button"
          className="records-export"
          onClick={handleExport}
          disabled={records.length === 0}
        >
          CSV 내보내기
        </button>
        <button
          type="button"
          className="records-clear"
          onClick={handleClear}
          disabled={records.length === 0}
        >
          전체 삭제
        </button>
      </div>

      {records.length === 0 ? (
        <div className="records-empty">아직 기록이 없어요</div>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <article key={record.id} className="records-item">
              <div className="records-item-main">
                <strong>{record.gameTitle}</strong>
                <span>{formatDate(record.endedAt)}</span>
              </div>
              <div className="records-item-meta">
                <span>{record.success ? '성공' : '진행 기록'}</span>
                <span>점수 {recordScore(record)}</span>
                <span>{formatDuration(record.durationMs)}</span>
                {record.difficulty && <span>{record.difficulty}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Home() {
  const navigate = useNavigate();
  const { selectedSeasonings, selectedTools, selectedAppliances } = useYumpick();

  return (
    <div className="home-container page-transition">
      {/* Brand Header */}
      <div className="brand-logo-area">
        <div className="app-logo">
          <svg viewBox="0 0 100 100" width="80" height="80">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8B62D" />
                <stop offset="100%" stopColor="#D87E12" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#logoGrad)" />
            {/* Cloche/Chef Cover Hat */}
            <path d="M30,55 C30,35 70,35 70,55 Z" fill="#FFF" />
            <rect x="26" y="56" width="48" height="6" rx="3" fill="#FFF" />
            <circle cx="50" cy="33" r="5" fill="#FFF" />
            {/* Fork/Spoon Detail */}
            <path d="M42,67 L42,75 M58,67 L58,75" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M42,75 C42,80 58,80 58,75" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <h1 className="brand-name">Yumpick</h1>
        <p className="brand-subtitle">냉장고 사진 한 장으로 만나는 맞춤 레시피</p>
      </div>

      {/* Main Feature Cards */}
      <div className="action-section">
        <button 
          className="btn btn-primary btn-large ripple"
          onClick={() => navigate('/camera')}
        >
          <div className="btn-icon-wrapper">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div className="btn-text-content">
            <span className="btn-title">냉장고 재료 촬영하기</span>
            <span className="btn-desc">사진 촬영 & AI 재료 자동 인식</span>
          </div>
        </button>

        <button 
          className="btn btn-secondary ripple"
          onClick={() => navigate('/user-info')}
        >
          <div className="btn-icon-wrapper-small">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <span>내 요리 환경 설정하기</span>
        </button>
      </div>

      {/* Info Status Board */}
      <div className="status-board">
        <h3 className="status-title">나의 주방 상태</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">보유 양념</span>
            <span className="status-value">{selectedSeasonings.length}종</span>
          </div>
          <div className="status-item">
            <span className="status-label">조리 도구</span>
            <span className="status-value">{selectedTools.length}개</span>
          </div>
          <div className="status-item">
            <span className="status-label">보유 가전</span>
            <span className="status-value">{selectedAppliances.length}개</span>
          </div>
        </div>
        <p className="status-hint">설정된 양념과 도구에 맞는 레시피가 추천됩니다.</p>
      </div>

      {/* Quick Visual Decoration */}
      <div className="deco-banner">
        <span className="deco-emoji">🥬</span>
        <span className="deco-emoji">🍅</span>
        <span className="deco-emoji">🍳</span>
        <span className="deco-emoji">🥩</span>
        <span className="deco-emoji">🍜</span>
      </div>
    </div>
  );
}

export default Home;

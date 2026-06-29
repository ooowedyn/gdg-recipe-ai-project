import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { YumpickProvider } from './YumpickContext';

// Import Pages
import Home from './pages/Home';
import UserInfo from './pages/UserInfo';
import Camera from './pages/Camera';
import Gallery from './pages/Gallery';
import Detection from './pages/Detection';
import Filter from './pages/Filter';
import Recommendation from './pages/Recommendation';
import Recipe from './pages/Recipe';

function App() {
  return (
    <YumpickProvider>
      <Router>
        <div className="yumpick-app-shell">
          
          {/* Left Panel: Desktop Showcase Panel (Visible on Desktop) */}
          <div className="desktop-info-panel">
            <div className="info-badge">PROJECT PREVIEW</div>
            <h1 className="panel-title">Yumpick</h1>
            <p className="panel-subtitle">푸드 레시피 추천 서비스 프론트엔드</p>
            
            <div className="spec-card">
              <h3 className="spec-title">🎨 디자인 시스템</h3>
              <ul className="spec-list">
                <li><strong>메인 테마:</strong> 마일드 옐로우 & 오가닉 브라운</li>
                <li><strong>핵심 가치:</strong> 신선함, 간편함, 따뜻함</li>
                <li><strong>인터페이스:</strong> 모던 모바일 앱 뷰 (390px x 844px 최적화)</li>
              </ul>
            </div>

            <div className="spec-card">
              <h3 className="spec-title">🔄 화면 이동 플로우 (8단계)</h3>
              <ol className="flow-steps">
                <li><strong>Home:</strong> 홈 화면 (촬영 또는 환경설정 이동)</li>
                <li><strong>UserInfo:</strong> 보유 양념, 조리기구 개인 환경 설정</li>
                <li><strong>Camera:</strong> 카메라 냉장고 촬영 스캔 시뮬레이터</li>
                <li><strong>Gallery:</strong> 기기 앨범 사진 선택 및 로드</li>
                <li><strong>Detection:</strong> AI 식재료 분석 및 개별 태그 수정</li>
                <li><strong>Filter:</strong> 난이도/조리시간/설거지양 상세 필터</li>
                <li><strong>Recommendation:</strong> 매칭률 기준 레시피 3선 추천</li>
                <li><strong>Recipe:</strong> 요리 단계별 체크형 요리 카드</li>
              </ol>
            </div>

            <div className="panel-footer">
              <p>© 2026 Yumpick Dev Prototype.</p>
              <p>Vite + React + vanilla CSS</p>
            </div>
          </div>

          {/* Right/Center Panel: Simulated Mobile Shell Frame */}
          <div className="mobile-shell-wrapper">
            <div className="smartphone-frame">
              {/* Notch / Dynamic Island */}
              <div className="smartphone-notch"></div>
              
              {/* Status Bar */}
              <div className="smartphone-status-bar">
                <span className="status-time">09:41</span>
                <div className="status-icons">
                  {/* Signal Icon */}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <rect x="2" y="16" width="3" height="5" rx="0.5" />
                    <rect x="7" y="12" width="3" height="9" rx="0.5" />
                    <rect x="12" y="8" width="3" height="13" rx="0.5" />
                    <rect x="17" y="3" width="3" height="18" rx="0.5" />
                  </svg>
                  {/* Wifi Icon */}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 21a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-6.36-6.36a9 9 0 0 1 12.72 0m-9.9-9.9a14 14 0 0 1 19.8 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  {/* Battery Icon */}
                  <div className="battery-icon">
                    <div className="battery-level"></div>
                  </div>
                </div>
              </div>

              {/* Mobile Viewport Screen */}
              <div className="smartphone-screen">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/user-info" element={<UserInfo />} />
                  <Route path="/camera" element={<Camera />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/detection" element={<Detection />} />
                  <Route path="/filter" element={<Filter />} />
                  <Route path="/recommendation" element={<Recommendation />} />
                  <Route path="/recipe" element={<Recipe />} />
                </Routes>
              </div>

              {/* Bottom Home Indicator */}
              <div className="smartphone-home-bar"></div>
            </div>
          </div>

        </div>
      </Router>
    </YumpickProvider>
  );
}

export default App;

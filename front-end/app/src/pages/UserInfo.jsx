import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

// List of all options to choose from
const AVAILABLE_SEASONINGS = [
  '간장', '고추장', '된장', '소금', '설탕', 
  '식초', '올리고당', '참기름', '다진마늘', 
  '후추', '고춧가루', '굴소스', '마요네즈', '케첩'
];

const AVAILABLE_TOOLS = [
  '칼', '도마', '뒤집개', '국자', 
  '거품기', '집게', '가위', '믹싱볼', '체망'
];

const AVAILABLE_APPLIANCES = [
  '가스레인지/인덕션', '에어프라이어', 
  '전자레인지', '오븐', '밥솥', '믹서기', '토스터'
];

function UserInfo() {
  const navigate = useNavigate();
  const {
    selectedSeasonings,
    setSelectedSeasonings,
    selectedTools,
    setSelectedTools,
    selectedAppliances,
    setSelectedAppliances
  } = useYumpick();

  // Helper toggle functions
  const toggleSeasoning = (item) => {
    if (selectedSeasonings.includes(item)) {
      setSelectedSeasonings(selectedSeasonings.filter(s => s !== item));
    } else {
      setSelectedSeasonings([...selectedSeasonings, item]);
    }
  };

  const toggleTool = (item) => {
    if (selectedTools.includes(item)) {
      setSelectedTools(selectedTools.filter(t => t !== item));
    } else {
      setSelectedTools([...selectedTools, item]);
    }
  };

  const toggleAppliance = (item) => {
    if (selectedAppliances.includes(item)) {
      setSelectedAppliances(selectedAppliances.filter(a => a !== item));
    } else {
      setSelectedAppliances([...selectedAppliances, item]);
    }
  };

  return (
    <div className="userinfo-container page-transition">
      {/* Header bar */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="page-title">내 요리 환경 설정</h2>
        <div style={{ width: 24 }}></div> {/* spacer */}
      </div>

      <div className="scrollable-content">
        <p className="section-intro">
          현재 집에 가지고 계신 양념, 조리 도구, 주방 가전을 선택해 주세요. 이를 반영한 맞춤 레시피만 골라 드릴게요!
        </p>

        {/* Seasonings Section */}
        <div className="option-section-card">
          <div className="section-card-header">
            <span className="section-card-emoji">🧂</span>
            <h3 className="section-card-title">기본 양념 및 소스</h3>
          </div>
          <div className="pills-grid">
            {AVAILABLE_SEASONINGS.map((seasoning) => {
              const isSelected = selectedSeasonings.includes(seasoning);
              return (
                <button
                  key={seasoning}
                  className={`pill-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSeasoning(seasoning)}
                >
                  {seasoning}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cooking Tools Section */}
        <div className="option-section-card">
          <div className="section-card-header">
            <span className="section-card-emoji">🍳</span>
            <h3 className="section-card-title">보유 조리 도구</h3>
          </div>
          <div className="pills-grid">
            {AVAILABLE_TOOLS.map((tool) => {
              const isSelected = selectedTools.includes(tool);
              return (
                <button
                  key={tool}
                  className={`pill-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleTool(tool)}
                >
                  {tool}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appliances Section */}
        <div className="option-section-card">
          <div className="section-card-header">
            <span className="section-card-emoji">🔌</span>
            <h3 className="section-card-title">주방 가전</h3>
          </div>
          <div className="pills-grid">
            {AVAILABLE_APPLIANCES.map((appliance) => {
              const isSelected = selectedAppliances.includes(appliance);
              return (
                <button
                  key={appliance}
                  className={`pill-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleAppliance(appliance)}
                >
                  {appliance}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="bottom-sticky-area">
        <button className="btn btn-primary btn-full ripple" onClick={() => navigate('/')}>
          설정 완료 및 홈으로
        </button>
      </div>
    </div>
  );
}

export default UserInfo;

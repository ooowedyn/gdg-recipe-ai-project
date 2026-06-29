import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Filter() {
  const navigate = useNavigate();
  const { filters, setFilters } = useYumpick();

  // Helper to update specific filter keys
  const updateFilter = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="filter-container page-transition">
      {/* Top Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/detection')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="page-title">필터 세부 설정</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="scrollable-content">
        <p className="section-intro">
          재료 외에도 오늘의 요리 취향을 더 상세히 알려주세요. 딱 맞는 음식을 추천해 드립니다.
        </p>

        {/* 1. Difficulty Level Selector */}
        <div className="filter-card">
          <label className="filter-label">🍳 난이도</label>
          <div className="segmented-control">
            {['쉬움', '보통', '어려움'].map((level) => (
              <button
                key={level}
                type="button"
                className={`segment-btn ${filters.difficulty === level ? 'active' : ''}`}
                onClick={() => updateFilter('difficulty', level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Cooking Time Limit */}
        <div className="filter-card">
          <div className="filter-card-header-row">
            <label className="filter-label">⏱️ 최대 조리 시간</label>
            <span className="slider-value-preview">{filters.time}분 이내</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              min="15"
              max="90"
              step="15"
              value={filters.time}
              onChange={(e) => updateFilter('time', parseInt(e.target.value))}
              className="custom-range-slider"
            />
            <div className="range-ticks">
              <span>15분</span>
              <span>30분</span>
              <span>45분</span>
              <span>60분</span>
              <span>90분</span>
            </div>
          </div>
        </div>

        {/* 3. Cutting Frequency (칼질 빈도) */}
        <div className="filter-card">
          <label className="filter-label">🔪 칼질 빈도</label>
          <div className="segmented-control">
            {['낮음', '보통', '높음'].map((level) => (
              <button
                key={level}
                type="button"
                className={`segment-btn ${filters.cutting === level ? 'active' : ''}`}
                onClick={() => updateFilter('cutting', level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Washing up load (설거지 양) */}
        <div className="filter-card">
          <label className="filter-label">🥣 설거지 양</label>
          <div className="segmented-control">
            {['적음', '보통', '많음'].map((level) => (
              <button
                key={level}
                type="button"
                className={`segment-btn ${filters.washing === level ? 'active' : ''}`}
                onClick={() => updateFilter('washing', level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Spiciness Level (맵기 조절) */}
        <div className="filter-card">
          <label className="filter-label">🌶️ 맵기 정도</label>
          <div className="segmented-control">
            {['안 매움', '조금 매움', '매움'].map((level) => (
              <button
                key={level}
                type="button"
                className={`segment-btn ${filters.spiciness === level ? 'active' : ''}`}
                onClick={() => updateFilter('spiciness', level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="bottom-sticky-area">
        <button 
          className="btn btn-primary btn-full ripple" 
          onClick={() => navigate('/recommendation')}
        >
          필터 확정 및 메뉴 보기
        </button>
      </div>
    </div>
  );
}

export default Filter;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Filter() {
  const navigate = useNavigate();
  const { filters, setFilters } = useYumpick();

  const filterConfigs = [
    { label: '난이도', opts: ['쉬움', '보통', '어려움'] },
    { label: '조리시간', opts: ['15분 이내', '30분', '1시간+'] },
    { label: '칼질 빈도', opts: ['적게', '보통', '많이'] },
    { label: '설거지 양', opts: ['적게', '보통', '많이'] },
    { label: '맵기', opts: ['순함', '보통', '매움'] },
  ];

  // Helper to ensure we have fallback defaults for these Korean keys
  const getFilterValue = (label) => {
    if (filters[label]) return filters[label];
    
    // Fallback defaults mapping
    const defaults = {
      '난이도': '쉬움',
      '조리시간': '30분',
      '칼질 빈도': '적게',
      '설거지 양': '보통',
      '맵기': '보통',
    };
    return defaults[label];
  };

  const handleSelectFilter = (label, val) => {
    setFilters({
      ...filters,
      [label]: val
    });
  };

  const getSegStyle = (isSelected) => {
    return isSelected
      ? {
          flex: 1,
          textAlign: 'center',
          background: '#F4B740',
          color: '#3A2A1E',
          font: "600 13.5px 'Pretendard'",
          padding: '10px 0',
          borderRadius: '10px',
          cursor: 'pointer'
        }
      : {
          flex: 1,
          textAlign: 'center',
          color: '#9A8678',
          font: "500 13.5px 'Pretendard'",
          padding: '10px 0',
          cursor: 'pointer'
        };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 22px 12px', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/detection')} 
          style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '12px', 
            background: '#FFFFFF', 
            border: '1px solid #ECE0CD', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer' 
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A2A1E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
        <span style={{ font: "700 18px 'Pretendard'", color: '#3A2A1E' }}>조건 선택</span>
      </div>

      <div className="scrl" style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ font: "500 13.5px 'Pretendard'", color: '#9A8678', margin: 0, lineHeight: 1.55 }}>원하는 조건을 골라주세요</p>
        
        {filterConfigs.map(sec => {
          const currentVal = getFilterValue(sec.label);
          return (
            <div key={sec.label}>
              <h3 style={{ font: "700 14.5px 'Pretendard'", color: '#3A2A1E', margin: '0 0 10px' }}>{sec.label}</h3>
              <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #ECE0CD', borderRadius: '14px', padding: '4px', gap: '4px' }}>
                {sec.opts.map(opt => {
                  const isSelected = currentVal === opt;
                  return (
                    <span 
                      key={opt}
                      onClick={() => handleSelectFilter(sec.label, opt)} 
                      style={getSegStyle(isSelected)}
                    >
                      {opt}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{ height: '6px', flexShrink: 0 }}></div>
      </div>

      <div style={{ padding: '14px 24px 22px', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/recommendation')} 
          style={{ 
            width: '100%', 
            background: '#F4B740', 
            color: '#3A2A1E', 
            font: "700 16px 'Pretendard'", 
            padding: '16px', 
            borderRadius: '18px', 
            border: 'none', 
            cursor: 'pointer', 
            boxShadow: '0 6px 16px rgba(244,183,64,0.4)' 
          }}
        >
          메뉴 추천받기
        </button>
      </div>
    </div>
  );
}

export default Filter;

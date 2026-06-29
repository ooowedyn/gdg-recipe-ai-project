import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

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

  const seasoningsList = ['소금', '간장', '고추장', '된장', '설탕', '식초', '고춧가루', '참기름', '다진마늘', '후추'];
  const toolsList = ['칼', '도마', '프라이팬', '냄비', '뒤집개', '국자', '집게'];
  const appliancesList = ['가스레인지', '인덕션', '전자레인지', '에어프라이어', '오븐', '전기밥솥'];

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const getChipStyle = (isSelected) => {
    return isSelected
      ? {
          background: '#F4B740',
          color: '#3A2A1E',
          border: '1px solid #F4B740',
          font: "600 13.5px 'Pretendard'",
          padding: '8px 14px',
          borderRadius: '999px',
          cursor: 'pointer'
        }
      : {
          background: '#FFFFFF',
          color: '#6B5746',
          border: '1px solid #ECE0CD',
          font: "500 13.5px 'Pretendard'",
          padding: '8px 14px',
          borderRadius: '999px',
          cursor: 'pointer'
        };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 22px 12px', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/')} 
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
        <span style={{ font: "700 18px 'Pretendard'", color: '#3A2A1E' }}>내 주방 정보</span>
      </div>
      
      <div className="scrl" style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 0', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <p style={{ font: "500 13.5px 'Pretendard'", color: '#9A8678', margin: 0, lineHeight: 1.55 }}>
          가지고 있는 재료와 도구를 알려주시면<br />더 정확하게 추천해드려요
        </p>
        
        <div>
          <h3 style={{ font: "700 15px 'Pretendard'", color: '#3A2A1E', margin: '0 0 12px' }}>양념 종류</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {seasoningsList.map(item => {
              const isSelected = selectedSeasonings.includes(item);
              return (
                <span 
                  key={item} 
                  onClick={() => toggleItem(selectedSeasonings, setSelectedSeasonings, item)} 
                  style={getChipStyle(isSelected)}
                >
                  {item}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <h3 style={{ font: "700 15px 'Pretendard'", color: '#3A2A1E', margin: '0 0 12px' }}>조리 도구</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {toolsList.map(item => {
              const isSelected = selectedTools.includes(item);
              return (
                <span 
                  key={item} 
                  onClick={() => toggleItem(selectedTools, setSelectedTools, item)} 
                  style={getChipStyle(isSelected)}
                >
                  {item}
                </span>
              );
            })}
          </div>
        </div>

        <div style={{ paddingBottom: '8px' }}>
          <h3 style={{ font: "700 15px 'Pretendard'", color: '#3A2A1E', margin: '0 0 12px' }}>조리 기구</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {appliancesList.map(item => {
              const isSelected = selectedAppliances.includes(item);
              return (
                <span 
                  key={item} 
                  onClick={() => toggleItem(selectedAppliances, setSelectedAppliances, item)} 
                  style={getChipStyle(isSelected)}
                >
                  {item}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 24px 22px', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            width: '100%', 
            background: '#5A3E2B', 
            color: '#FFF3DC', 
            font: "700 16px 'Pretendard'", 
            padding: '16px', 
            borderRadius: '18px', 
            border: 'none', 
            cursor: 'pointer', 
            boxShadow: '0 6px 16px rgba(90,62,43,0.3)' 
          }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

export default UserInfo;

import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 26px 30px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
        <button 
          onClick={() => navigate('/user-info')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '7px', 
            background: '#FFFFFF', 
            border: '1px solid #ECE0CD', 
            borderRadius: '999px', 
            padding: '8px 14px', 
            font: "600 13px 'Pretendard'", 
            color: '#6B5746', 
            cursor: 'pointer' 
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B5746" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          내 정보
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: '98px', height: '98px', borderRadius: '30px', background: '#F4B740', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 28px rgba(244,183,64,0.45)' }}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11h18a9 9 0 0 1-18 0z"></path>
            <path d="M5 11a7 7 0 0 1 14 0"></path>
            <path d="M9 5.5c0-1 1-1.2 1-2.5M13 5.5c0-1 1-1.2 1-2.5"></path>
          </svg>
        </div>
        <h1 style={{ fontFamily: "'Jua', sans-serif", fontSize: '44px', color: '#5A3E2B', margin: '24px 0 0', letterSpacing: '1px' }}>Yumpick</h1>
        <p style={{ font: "500 15px 'Pretendard'", color: '#9A8678', margin: '12px 0 0', lineHeight: 1.55 }}>냉장고 속 재료를 찍으면<br />딱 맞는 메뉴를 추천해드려요</p>
      </div>
      <button 
        onClick={() => navigate('/camera')} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '10px', 
          background: '#F4B740', 
          color: '#3A2A1E', 
          font: "700 17px 'Pretendard'", 
          padding: '18px', 
          borderRadius: '20px', 
          boxShadow: '0 8px 20px rgba(244,183,64,0.45)', 
          border: 'none', 
          width: '100%', 
          cursor: 'pointer' 
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A2A1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        재료 촬영하기
      </button>
      <p style={{ textAlign: 'center', font: "500 12.5px 'Pretendard'", color: '#B7A595', margin: '14px 0 0' }}>사진 한 장이면 충분해요</p>
    </div>
  );
}

export default Home;

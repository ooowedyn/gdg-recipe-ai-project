import React from 'react';
import { useNavigate } from 'react-router-dom';

function Camera() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#241C17' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContainer: 'space-between', justifyContent: 'space-between', padding: '8px 22px 0', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.12)', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer' 
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
        <span style={{ font: "600 14px 'Pretendard'", color: '#FFFFFF' }}>재료 촬영</span>
        <span style={{ width: '38px' }}></span>
      </div>

      <div style={{ flex: 1, margin: '18px', borderRadius: '26px', background: '#2E2620', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', left: '18px', top: '18px', width: '30px', height: '30px', borderLeft: '3px solid rgba(244,183,64,0.9)', borderTop: '3px solid rgba(244,183,64,0.9)', borderRadius: '8px 0 0 0' }}></div>
        <div style={{ position: 'absolute', right: '18px', top: '18px', width: '30px', height: '30px', borderRight: '3px solid rgba(244,183,64,0.9)', borderTop: '3px solid rgba(244,183,64,0.9)', borderRadius: '0 8px 0 0' }}></div>
        <div style={{ position: 'absolute', left: '18px', bottom: '18px', width: '30px', height: '30px', borderLeft: '3px solid rgba(244,183,64,0.9)', borderBottom: '3px solid rgba(244,183,64,0.9)', borderRadius: '0 0 0 8px' }}></div>
        <div style={{ position: 'absolute', right: '18px', bottom: '18px', width: '30px', height: '30px', borderRight: '3px solid rgba(244,183,64,0.9)', borderBottom: '3px solid rgba(244,183,64,0.9)', borderRadius: '0 0 8px 0' }}></div>
        <p style={{ color: 'rgba(255,255,255,0.72)', font: "500 14px 'Pretendard'", textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
          재료가 잘 보이도록<br />가까이서 찍어주세요
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 36px 32px', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/gallery')} 
          style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '12px', 
            background: '#3A322B', 
            border: '2px solid rgba(255,255,255,0.3)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'rgba(255,255,255,0.6)', 
            font: "600 11px 'Pretendard'", 
            cursor: 'pointer' 
          }}
        >
          앨범
        </button>
        <button 
          onClick={() => navigate('/detection')} 
          style={{ 
            width: '74px', 
            height: '74px', 
            borderRadius: '50%', 
            background: '#FFFFFF', 
            border: '4px solid rgba(255,255,255,0.35)', 
            boxShadow: '0 0 0 2px #241C17 inset', 
            cursor: 'pointer' 
          }}
        ></button>
        <button 
          style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.12)', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer' 
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Camera;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Detection() {
  const navigate = useNavigate();
  const { currentImage, detectedIngredients, setDetectedIngredients } = useYumpick();
  
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleRemove = (item) => {
    setDetectedIngredients(detectedIngredients.filter(x => x !== item));
  };

  const handleAdd = () => {
    if (inputValue.trim()) {
      if (!detectedIngredients.includes(inputValue.trim())) {
        setDetectedIngredients([...detectedIngredients, inputValue.trim()]);
      }
      setInputValue('');
      setShowInput(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/camera')} 
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
          <span style={{ font: "700 18px 'Pretendard'", color: '#3A2A1E' }}>재료 확인</span>
        </div>
        <button 
          onClick={() => navigate('/camera')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            background: '#FFFFFF', 
            border: '1px solid #ECE0CD', 
            borderRadius: '999px', 
            padding: '7px 12px', 
            font: "600 12.5px 'Pretendard'", 
            color: '#6B5746', 
            cursor: 'pointer' 
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B5746" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          재인식
        </button>
      </div>

      <div className="scrl" style={{ flex: 1, overflowY: 'auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ 
          width: '100%', 
          height: '196px', 
          background: '#F3EADB', 
          border: '1.5px dashed #D8C7AC', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#B7A595', 
          font: "500 13px 'Pretendard'", 
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          {currentImage ? (
            <img src={currentImage} alt="Captured fridge" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '촬영한 사진'
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ font: "700 15px 'Pretendard'", color: '#3A2A1E' }}>
              인식된 재료 <span style={{ color: '#E89A2E' }}>{detectedIngredients.length}</span>
            </span>
            <span style={{ font: "500 12.5px 'Pretendard'", color: '#B7A595' }}>탭하여 삭제 · 추가 가능</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {detectedIngredients.map(item => (
              <span 
                key={item}
                onClick={() => handleRemove(item)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: '#FEEFC7', 
                  color: '#7A5230', 
                  font: "600 13.5px 'Pretendard'", 
                  padding: '8px 12px', 
                  borderRadius: '999px', 
                  cursor: 'pointer' 
                }}
              >
                {item}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A98342" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </span>
            ))}
            
            {showInput ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="재료 입력"
                  autoFocus
                  style={{
                    border: '1.5px solid #F4B740',
                    borderRadius: '999px',
                    padding: '8px 12px',
                    font: "600 13.5px 'Pretendard'",
                    color: '#7A5230',
                    background: '#FFFFFF',
                    width: '90px',
                    outline: 'none'
                  }}
                />
                <button 
                  onClick={handleAdd}
                  style={{
                    border: 'none',
                    background: '#F4B740',
                    color: '#3A2A1E',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    font: 'bold 16px sans-serif'
                  }}
                >
                  ✓
                </button>
              </div>
            ) : (
              <span 
                onClick={() => setShowInput(true)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  background: 'transparent', 
                  color: '#9A8678', 
                  border: '1.5px dashed #CBB89F', 
                  font: "600 13.5px 'Pretendard'", 
                  padding: '8px 12px', 
                  borderRadius: '999px', 
                  cursor: 'pointer' 
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8678" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                재료 추가
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 24px 22px', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/filter')} 
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
          재료 확정하기
        </button>
      </div>
    </div>
  );
}

export default Detection;

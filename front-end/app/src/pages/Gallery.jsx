import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Gallery() {
  const navigate = useNavigate();
  const { presets, handlePhotoSelect } = useYumpick();
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const handleSelectImage = (preset, idx) => {
    setSelectedPresetIndex(idx);
  };

  const handleConfirmSelection = () => {
    // Select the currently chosen preset image and navigate
    const selectedPreset = presets[selectedPresetIndex] || presets[0];
    if (selectedPreset) {
      handlePhotoSelect(selectedPreset.url, selectedPreset.ingredients);
    } else {
      // fallback
      handlePhotoSelect('', ['양파', '당근', '감자', '대파', '달걀', '돼지고기']);
    }
    navigate('/detection');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 22px 12px', flexShrink: 0 }}>
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
        <span style={{ font: "700 18px 'Pretendard'", color: '#3A2A1E' }}>앨범에서 선택</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 26px 14px', flexShrink: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', font: "700 15px 'Pretendard'", color: '#3A2A1E' }}>
          최근 항목
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A3E2B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </span>
        <span style={{ font: "600 13px 'Pretendard'", color: '#B7A595' }}>{presets.length}장</span>
      </div>

      <div className="scrl" style={{ flex: 1, overflowY: 'auto', padding: '0 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '7px' }}>
          {presets.map((preset, index) => {
            const isSelected = selectedPresetIndex === index;
            return (
              <div 
                key={preset.id} 
                onClick={() => handleSelectImage(preset, index)} 
                style={{ position: 'relative', cursor: 'pointer', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden' }}
              >
                {preset.url ? (
                  <img 
                    src={preset.url} 
                    alt={preset.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#F3EADB', border: '1.5px dashed #D8C7AC' }}></div>
                )}
                {isSelected && (
                  <>
                    <div style={{ position: 'absolute', inset: 0, border: '3px solid #F4B740', borderRadius: '12px', pointerEvents: 'none' }}></div>
                    <div style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: '#F4B740', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3A2A1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 24px 22px', flexShrink: 0 }}>
        <button 
          onClick={handleConfirmSelection} 
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
          이 사진 선택
        </button>
      </div>
    </div>
  );
}

export default Gallery;

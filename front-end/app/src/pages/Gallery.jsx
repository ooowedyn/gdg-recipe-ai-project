import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Gallery() {
  const navigate = useNavigate();
  const { presets, handlePhotoSelect, setCurrentImage, setDetectedIngredients } = useYumpick();
  const fileInputRef = useRef(null);

  const onSelectPreset = (preset) => {
    handlePhotoSelect(preset.url, preset.ingredients);
    navigate('/detection');
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentImage(event.target.result);
        // Set some dummy detected ingredients for the uploaded photo
        setDetectedIngredients(['삼겹살', '김치', '두부', '파', '마늘']);
        navigate('/detection');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="gallery-container page-transition">
      {/* Top Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/camera')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="page-title">내 앨범에서 선택</h2>
        <div style={{ width: 24 }}></div> {/* spacer */}
      </div>

      <div className="scrollable-content">
        <p className="section-intro">
          냉장고 재료가 잘 보이는 사진을 골라주세요. 분석을 통해 추천 요리를 매칭합니다.
        </p>

        {/* Upload Custom File Trigger */}
        <div className="upload-box-wrapper">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleCustomUpload} 
            accept="image/*" 
            style={{ display: 'none' }}
          />
          <button 
            className="upload-custom-btn ripple" 
            onClick={() => fileInputRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: 8 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="upload-title">새 사진 가져오기</span>
            <span className="upload-desc">모바일 앨범 또는 파일 탐색기 열기</span>
          </button>
        </div>

        <div className="gallery-divider">
          <span>또는 추천 사진 템플릿 선택</span>
        </div>

        {/* Preset Photo Grid */}
        <div className="presets-grid">
          {presets.map((preset) => (
            <div 
              key={preset.id} 
              className="preset-item-card ripple"
              onClick={() => onSelectPreset(preset)}
            >
              <div className="preset-img-wrapper">
                <img src={preset.url} alt={preset.title} className="preset-img" />
                <div className="preset-overlay">
                  <span className="preset-ingredients-count">재료 {preset.ingredients.length}개</span>
                </div>
              </div>
              <div className="preset-info">
                <h4 className="preset-title">{preset.title}</h4>
                <p className="preset-tags">{preset.ingredients.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Gallery;

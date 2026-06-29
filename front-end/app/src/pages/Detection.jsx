import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Detection() {
  const navigate = useNavigate();
  const { currentImage, detectedIngredients, setDetectedIngredients } = useYumpick();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');

  // Delete ingredient
  const handleRemove = (name) => {
    setDetectedIngredients(detectedIngredients.filter(item => item !== name));
  };

  // Add new ingredient
  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (newIngredient.trim() && !detectedIngredients.includes(newIngredient.trim())) {
      setDetectedIngredients([...detectedIngredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  return (
    <div className="detection-container page-transition">
      {/* Top Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/camera')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="page-title">재료 분석 결과</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="scrollable-content">
        {/* Photo Display Card */}
        <div className="detection-image-card">
          {currentImage ? (
            <img src={currentImage} alt="Captured scan" className="detection-img" />
          ) : (
            <div className="no-image-placeholder">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>등록된 사진이 없습니다</span>
            </div>
          )}
          <div className="scanning-badge">
            <span className="badge-pulse"></span>
            <span>AI 인식 완료</span>
          </div>
        </div>

        {/* Ingredients List */}
        <div className="ingredients-section-card">
          <div className="ingredients-card-header">
            <h3 className="section-card-title">인식된 재료 ({detectedIngredients.length})</h3>
            <button 
              className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? '수정 완료' : '재료 수정'}
            </button>
          </div>

          {/* Quick instructions */}
          <p className="ingredients-guide-text">
            {isEditing ? '재료를 추가하거나 불필요한 재료를 제외할 수 있습니다.' : '잘못 인식된 재료는 X 버튼을 눌러 지울 수 있습니다.'}
          </p>

          {/* Add custom ingredient form */}
          {isEditing && (
            <form onSubmit={handleAddIngredient} className="add-ingredient-form">
              <input
                type="text"
                placeholder="직접 재료 입력 (예: 감자)"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                className="add-input"
              />
              <button type="submit" className="add-submit-btn">
                추가
              </button>
            </form>
          )}

          {/* Tag Cloud */}
          <div className="ingredients-tags-cloud">
            {detectedIngredients.length > 0 ? (
              detectedIngredients.map((ingredient) => (
                <div key={ingredient} className="ingredient-tag animate-tag">
                  <span className="tag-name">{ingredient}</span>
                  <button 
                    type="button" 
                    className="tag-delete-btn"
                    onClick={() => handleRemove(ingredient)}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-tags-fallback">
                검출된 재료가 없습니다. 아래 수정 단추로 입력해주세요.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="bottom-sticky-area double-btn-layout">
        <button 
          className="btn btn-secondary ripple" 
          onClick={() => navigate('/camera')}
        >
          재인식
        </button>
        <button 
          className="btn btn-primary ripple" 
          onClick={() => navigate('/filter')}
          disabled={detectedIngredients.length === 0}
        >
          재료 확정
        </button>
      </div>
    </div>
  );
}

export default Detection;

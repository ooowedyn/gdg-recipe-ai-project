import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Recipe() {
  const navigate = useNavigate();
  const { recipes, selectedRecipeId, detectedIngredients } = useYumpick();

  // Find selected recipe, default to first if none matches (safeguard)
  const recipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];

  // Steps interactive completion state
  const [completedSteps, setCompletedSteps] = useState([]);

  const toggleStep = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(s => s !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  return (
    <div className="recipe-container page-transition">
      {/* Top Header */}
      <div className="recipe-header">
        <button className="btn-icon-round bg-dark-glass" onClick={() => navigate('/recommendation')}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="recipe-title-text">상세 레시피</span>
        <button className="btn-icon-round bg-dark-glass" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
      </div>

      <div className="scrollable-content zero-top-padding">
        {/* Large Hero Banner */}
        <div className="recipe-hero-banner">
          <img src={recipe.image} alt={recipe.name} className="hero-banner-img" />
          <div className="hero-banner-overlay"></div>
          <div className="hero-banner-info">
            <h1 className="hero-recipe-name">{recipe.name}</h1>
            <p className="hero-recipe-desc">{recipe.description}</p>
          </div>
        </div>

        {/* Cooking Info Summary */}
        <div className="recipe-stats-strip">
          <div className="stat-pill">
            <span className="stat-emoji">⏱️</span>
            <div className="stat-details">
              <span className="stat-lbl">조리시간</span>
              <span className="stat-val">{recipe.time}분</span>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-emoji">🍳</span>
            <div className="stat-details">
              <span className="stat-lbl">난이도</span>
              <span className="stat-val">{recipe.difficulty}</span>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-emoji">🌶️</span>
            <div className="stat-details">
              <span className="stat-lbl">맵기</span>
              <span className="stat-val">{recipe.spiciness}</span>
            </div>
          </div>
        </div>

        {/* Ingredients List Box */}
        <div className="recipe-card-box">
          <h3 className="box-title">준비물 확인</h3>
          <p className="box-sub-hint">초록색 체크(✔)는 냉장고에 보유 중인 재료입니다.</p>
          <div className="recipe-ingredients-check-list">
            {recipe.ingredients.map((ing) => {
              const hasIngredient = detectedIngredients.includes(ing);
              return (
                <div key={ing} className={`ing-check-item ${hasIngredient ? 'owned' : 'missing'}`}>
                  <span className="check-bullet">{hasIngredient ? '✔' : '＋'}</span>
                  <span className="ing-name">{ing}</span>
                  <span className="ing-status-label">{hasIngredient ? '보유' : '필요'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step by Step Cooking Guide */}
        <div className="recipe-card-box">
          <div className="box-header-row">
            <h3 className="box-title">조리 순서</h3>
            <span className="step-progress-percent">
              {Math.round((completedSteps.length / recipe.steps.length) * 100)}% 완료
            </span>
          </div>

          <div className="recipe-steps-list">
            {recipe.steps.map((step, idx) => {
              const isCompleted = completedSteps.includes(idx);
              return (
                <div 
                  key={idx} 
                  className={`recipe-step-item ${isCompleted ? 'completed' : ''}`}
                  onClick={() => toggleStep(idx)}
                >
                  <div className="step-number-col">
                    <span className="step-number-badge">{idx + 1}</span>
                  </div>
                  <div className="step-body-col">
                    <p className="step-instruction">{step}</p>
                  </div>
                  <div className="step-checkbox-col">
                    <div className="custom-step-checkbox">
                      {isCompleted && (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="bottom-sticky-area double-btn-layout">
        <button 
          className="btn btn-secondary ripple" 
          onClick={() => navigate('/recommendation')}
        >
          뒤로가기
        </button>
        <button 
          className="btn btn-primary ripple" 
          onClick={() => navigate('/')}
        >
          첫화면으로
        </button>
      </div>
    </div>
  );
}

export default Recipe;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Recommendation() {
  const navigate = useNavigate();
  const { 
    detectedIngredients, 
    recommendedRecipes, 
    shuffleRecommendations, 
    setSelectedRecipeId 
  } = useYumpick();

  const [isLoading, setIsLoading] = useState(false);

  // Take the first 3 items from the recommended recipes list
  const topRecommendations = recommendedRecipes.slice(0, 3);

  const handleReRecommend = () => {
    setIsLoading(true);
    setTimeout(() => {
      shuffleRecommendations();
      setIsLoading(false);
    }, 800); // short delay for beautiful loading feel
  };

  const handleRecipeClick = (recipeId) => {
    setSelectedRecipeId(recipeId);
    navigate('/recipe');
  };

  // Helper to calculate ingredient matching rate
  const getMatchDetails = (recipeIngredients) => {
    const owned = recipeIngredients.filter(ing => detectedIngredients.includes(ing));
    const missing = recipeIngredients.filter(ing => !detectedIngredients.includes(ing));
    const percentage = Math.round((owned.length / recipeIngredients.length) * 100);
    return { owned, missing, percentage };
  };

  return (
    <div className="recommendation-container page-transition">
      {/* Top Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/filter')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="page-title">추천 메뉴</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="scrollable-content">
        <div className="recommendation-intro">
          <p className="intro-title">오늘 냉장고 속 재료 맞춤 음식 3가지</p>
          <p className="intro-desc">내 취향 필터와 가용 도구를 조합한 최고의 요리법입니다.</p>
        </div>

        {isLoading ? (
          <div className="recommender-loader">
            <div className="spinner"></div>
            <p>냉장고 재료 매칭을 다시 계산하는 중...</p>
          </div>
        ) : (
          <div className="recommendations-list">
            {topRecommendations.map((recipe) => {
              const { owned, missing, percentage } = getMatchDetails(recipe.ingredients);
              return (
                <div 
                  key={recipe.id}
                  className="recipe-match-card ripple"
                  onClick={() => handleRecipeClick(recipe.id)}
                >
                  <div className="recipe-card-img-wrapper">
                    <img src={recipe.image} alt={recipe.name} className="recipe-card-img" />
                    <div className="match-score-badge">
                      <span>{percentage}% 매치</span>
                    </div>
                  </div>
                  
                  <div className="recipe-card-info">
                    <h3 className="recipe-card-name">{recipe.name}</h3>
                    
                    <div className="recipe-badges-row">
                      <span className="badge-tag label-time">⏱️ {recipe.time}분</span>
                      <span className="badge-tag label-difficulty">🍳 {recipe.difficulty}</span>
                      <span className="badge-tag label-spiciness">🌶️ {recipe.spiciness}</span>
                    </div>

                    {/* Ingredients summary */}
                    <div className="recipe-ingredients-summary">
                      <p className="summary-section-label">필요 식재료</p>
                      <div className="summary-tags-row">
                        {owned.map(ing => (
                          <span key={ing} className="tag-micro tag-owned">✔ {ing}</span>
                        ))}
                        {missing.map(ing => (
                          <span key={ing} className="tag-micro tag-missing">+ {ing}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card-arrow-indicator">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="bottom-sticky-area">
        <button 
          className="btn btn-secondary btn-full ripple" 
          onClick={handleReRecommend}
          disabled={isLoading}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          레시피 다른 구성 추천
        </button>
      </div>
    </div>
  );
}

export default Recommendation;

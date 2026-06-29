import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Recommendation() {
  const navigate = useNavigate();
  const { setSelectedRecipeId, shuffleRecommendations } = useYumpick();

  const handlePickRecipe = (recipeId) => {
    setSelectedRecipeId(recipeId);
    navigate('/recipe');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 6px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/filter')} 
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
          <span style={{ font: "700 18px 'Pretendard'", color: '#3A2A1E' }}>추천 메뉴</span>
        </div>
        <button 
          onClick={shuffleRecommendations}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            background: '#5A3E2B', 
            border: 'none', 
            borderRadius: '999px', 
            padding: '8px 13px', 
            font: "600 12.5px 'Pretendard'", 
            color: '#FFF3DC', 
            cursor: 'pointer' 
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF3DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          재추천
        </button>
      </div>

      <div className="scrl" style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ font: "500 13.5px 'Pretendard'", color: '#9A8678', margin: 0 }}>가진 재료로 만들 수 있는 메뉴 3가지예요</p>
        
        {/* Kimchi Fried Rice */}
        <div 
          onClick={() => handlePickRecipe('kimchi')} 
          style={{ display: 'flex', gap: '14px', background: '#FFFFFF', border: '1px solid #F0E6D6', borderRadius: '20px', padding: '12px', boxShadow: '0 4px 14px rgba(90,62,43,0.06)', cursor: 'pointer' }}
        >
          <div style={{ width: '96px', height: '96px', flexShrink: 0, background: '#F3EADB', border: '1.5px dashed #D8C7AC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B7A595', font: "500 11px 'Pretendard'" }}>
            음식
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', minWidth: 0 }}>
            <span style={{ font: "700 16.5px 'Pretendard'", color: '#3A2A1E' }}>김치볶음밥</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', font: "600 12px 'Pretendard'", color: '#9A8678' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B7A595" strokeWidth="2">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 7v5l3 2"></path>
                </svg>
                15분
              </span>
              <span>·</span>
              <span>쉬움</span>
            </div>
            <p style={{ font: "500 12px 'Pretendard'", color: '#B7A595', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              김치, 밥, 달걀, 대파, 참기름
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBB89F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ alignSelf: 'center', flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </div>

        {/* Pork Doenjang Stew */}
        <div 
          onClick={() => handlePickRecipe('doenjang')} 
          style={{ display: 'flex', gap: '14px', background: '#FFFFFF', border: '1px solid #F0E6D6', borderRadius: '20px', padding: '12px', boxShadow: '0 4px 14px rgba(90,62,43,0.06)', cursor: 'pointer' }}
        >
          <div style={{ width: '96px', height: '96px', flexShrink: 0, background: '#F3EADB', border: '1.5px dashed #D8C7AC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B7A595', font: "500 11px 'Pretendard'" }}>
            음식
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', minWidth: 0 }}>
            <span style={{ font: "700 16.5px 'Pretendard'", color: '#3A2A1E' }}>돼지고기 된장찌개</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', font: "600 12px 'Pretendard'", color: '#9A8678' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B7A595" strokeWidth="2">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 7v5l3 2"></path>
                </svg>
                25분
              </span>
              <span>·</span>
              <span>보통</span>
            </div>
            <p style={{ font: "500 12px 'Pretendard'", color: '#B7A595', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              돼지고기, 감자, 양파, 된장, 대파
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBB89F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ alignSelf: 'center', flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </div>

        {/* Gamja-chae Bokkeum */}
        <div 
          onClick={() => handlePickRecipe('gamja')} 
          style={{ display: 'flex', gap: '14px', background: '#FFFFFF', border: '1px solid #F0E6D6', borderRadius: '20px', padding: '12px', boxShadow: '0 4px 14px rgba(90,62,43,0.06)', cursor: 'pointer' }}
        >
          <div style={{ width: '96px', height: '96px', flexShrink: 0, background: '#F3EADB', border: '1.5px dashed #D8C7AC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B7A595', font: "500 11px 'Pretendard'" }}>
            음식
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', minWidth: 0 }}>
            <span style={{ font: "700 16.5px 'Pretendard'", color: '#3A2A1E' }}>감자채볶음</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', font: "600 12px 'Pretendard'", color: '#9A8678' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B7A595" strokeWidth="2">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 7v5l3 2"></path>
                </svg>
                10분
              </span>
              <span>·</span>
              <span>쉬움</span>
            </div>
            <p style={{ font: "500 12px 'Pretendard'", color: '#B7A595', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              감자, 당근, 양파, 소금
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBB89F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ alignSelf: 'center', flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Recommendation;

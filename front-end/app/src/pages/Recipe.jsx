import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Recipe() {
  const navigate = useNavigate();
  const { selectedRecipeId, recommendedRecipes, visualizeRecipe } = useYumpick();

  // 추천 목록에서 선택한 카드를 찾는다.
  const card =
    recommendedRecipes.find((r) => r.id === selectedRecipeId) ||
    recommendedRecipes[0] ||
    null;

  // 백엔드 단계 시각화(설명 + /media 이미지) 결과
  const [visual, setVisual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!card) return;
    let alive = true;
    setLoading(true);
    setError(false);
    setVisual(null);
    visualizeRecipe(card)
      .then((data) => { if (alive) setVisual(data); })
      .catch((err) => { console.warn('visualize 실패 → 원본 단계 표시', err); if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card ? card.id : null]);

  const name = visual?.title || card?.name || '';
  const ingredients = visual?.ingredients?.length ? visual.ingredients : (card?.ingredients || []);
  // 시각화 성공 시 상세 단계, 실패 시 카드의 원본 텍스트 단계로 폴백
  const steps = visual?.steps?.length
    ? visual.steps
    : (card?.steps || []).map((desc, i) => ({ step: i + 1, title: `${i + 1}단계`, description: desc, image: null }));

  const chip = { background: '#FEEFC7', color: '#7A5230', font: "600 12px 'Pretendard'", padding: '6px 11px', borderRadius: '999px' };
  const placeholder = { background: '#F3EADB', border: '1.5px dashed #D8C7AC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B7A595', font: "500 12px 'Pretendard'" };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 10px', flexShrink: 0 }}>
        <button
          onClick={() => navigate('/recommendation')}
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
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid #ECE0CD',
            borderRadius: '999px',
            padding: '8px 13px',
            font: "600 12.5px 'Pretendard'",
            color: '#6B5746',
            cursor: 'pointer'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B5746" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <path d="M9 22V12h6v10"></path>
          </svg>
          첫화면으로
        </button>
      </div>

      <div className="scrl" style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '100%', height: '180px', borderRadius: '22px', flexShrink: 0, overflow: 'hidden', ...placeholder }}>
          {visual?.mainImage ? (
            <img src={visual.mainImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            loading ? '완성 사진 그리는 중…' : '완성 음식 사진'
          )}
        </div>

        <div>
          <h2 style={{ fontFamily: "'Jua', sans-serif", fontSize: '26px', color: '#5A3E2B', margin: '0 0 10px' }}>{name}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {card?.time ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', ...chip }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A98342" strokeWidth="2">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 7v5l3 2"></path>
                </svg>
                {card.time}분
              </span>
            ) : null}
            {card?.difficulty ? <span style={chip}>{card.difficulty}</span> : null}
          </div>
        </div>

        <div>
          <h3 style={{ font: "700 15px 'Pretendard'", color: '#3A2A1E', margin: '0 0 6px' }}>재료</h3>
          {ingredients.map((ing, i) => (
            <div
              key={i}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F2E9DA', font: "500 13.5px 'Pretendard'", color: '#3A2A1E' }}
            >
              <span>{ing}</span>
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ font: "700 15px 'Pretendard'", color: '#3A2A1E', margin: '0 0 14px' }}>조리 순서</h3>
          {loading && (
            <p style={{ font: "500 13px 'Pretendard'", color: '#B7A595', margin: '0 0 14px', lineHeight: 1.6 }}>
              조리 과정을 그리는 중이에요… 이미지 생성은 수십 초 걸릴 수 있어요.
            </p>
          )}
          {error && (
            <p style={{ font: "500 12.5px 'Pretendard'", color: '#C08A4A', margin: '0 0 14px' }}>
              이미지 생성에 실패해 조리 설명만 표시합니다.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {steps.map((step) => (
              <div key={step.step} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', flexShrink: 0, borderRadius: '50%', background: '#F4B740', color: '#3A2A1E', font: "700 12.5px 'Pretendard'", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step.step}
                  </div>
                  <span style={{ font: "700 14px 'Pretendard'", color: '#3A2A1E' }}>{step.title}</span>
                </div>
                <div style={{ width: '100%', height: '150px', borderRadius: '16px', overflow: 'hidden', ...placeholder }}>
                  {step.image ? (
                    <img src={step.image} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    loading ? '단계 사진 그리는 중…' : `${step.step}단계 사진`
                  )}
                </div>
                <p style={{ font: "500 13.5px 'Pretendard'", color: '#4A382C', lineHeight: 1.6, margin: 0 }}>{step.description}</p>
                {step.tip ? (
                  <p style={{ font: "500 12.5px 'Pretendard'", color: '#7A5230', background: '#FEF6E6', borderRadius: '10px', padding: '8px 10px', margin: 0, lineHeight: 1.5 }}>💡 {step.tip}</p>
                ) : null}
                {step.caution ? (
                  <p style={{ font: "500 12.5px 'Pretendard'", color: '#B4552E', background: '#FBEBE4', borderRadius: '10px', padding: '8px 10px', margin: 0, lineHeight: 1.5 }}>⚠️ {step.caution}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recipe;

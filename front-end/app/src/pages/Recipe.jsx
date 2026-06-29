import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Recipe() {
  const navigate = useNavigate();
  const { selectedRecipeId } = useYumpick();

  const MOCK_RECIPE_DATA = {
    kimchi: { 
      name: '김치볶음밥', 
      time: '15분', 
      diff: '쉬움', 
      serv: '1인분',
      ings: [['묵은지', '1컵'], ['밥', '1공기'], ['달걀', '1개'], ['대파 · 참기름', '약간']],
      steps: [
        ['파기름 내기', '팬에 참기름을 두르고 송송 썬 대파를 약불에 볶아 향이 올라오는 파기름을 냅니다.'],
        ['김치 볶기', '잘게 썬 묵은지를 넣고 중불에서 가장자리가 노릇해질 때까지 볶아주세요.'],
        ['밥 넣고 마무리', '밥을 넣어 고루 섞고, 달걀프라이를 올린 뒤 참기름을 살짝 둘러 완성합니다.']
      ] 
    },
    doenjang: { 
      name: '돼지고기 된장찌개', 
      time: '25분', 
      diff: '보통', 
      serv: '2인분',
      ings: [['돼지고기', '150g'], ['감자', '1개'], ['양파', '1/2개'], ['된장', '2큰술'], ['대파', '약간']],
      steps: [
        ['육수 끓이기', '냄비에 물을 붓고 된장을 풀어 끓입니다.'],
        ['재료 넣기', '돼지고기와 감자, 양파를 넣고 푹 끓여주세요.'],
        ['마무리', '대파를 넣고 한소끔 더 끓여 완성합니다.']
      ] 
    },
    gamja: { 
      name: '감자채볶음', 
      time: '10분', 
      diff: '쉬움', 
      serv: '1인분',
      ings: [['감자', '1개'], ['당근', '1/3개'], ['양파', '1/4개'], ['소금', '약간']],
      steps: [
        ['채 썰기', '감자와 당근, 양파를 가늘게 채 썹니다.'],
        ['볶기', '기름 두른 팬에 감자를 먼저 볶다가 채소를 넣습니다.'],
        ['간하기', '소금으로 간하고 아삭하게 볶아 완성합니다.']
      ] 
    },
  };

  const recipeKey = selectedRecipeId || 'kimchi';
  const rawRecipe = MOCK_RECIPE_DATA[recipeKey] || MOCK_RECIPE_DATA.kimchi;

  const recipe = {
    name: rawRecipe.name,
    time: rawRecipe.time,
    diff: rawRecipe.diff,
    serv: rawRecipe.serv,
    ings: rawRecipe.ings.map(x => ({ name: x[0], amt: x[1] })),
    steps: rawRecipe.steps.map((x, i) => ({
      no: i + 1,
      title: x[0],
      desc: x[1],
      photo: `${i + 1}단계 사진`
    }))
  };

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
        <div style={{ 
          width: '100%', 
          height: '180px', 
          background: '#F3EADB', 
          border: '1.5px dashed #D8C7AC', 
          borderRadius: '22px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#B7A595', 
          font: "500 13px 'Pretendard'", 
          flexShrink: 0 
        }}>
          완성 음식 사진
        </div>

        <div>
          <h2 style={{ fontFamily: "'Jua', sans-serif", fontSize: '26px', color: '#5A3E2B', margin: '0 0 10px' }}>{recipe.name}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#FEEFC7', color: '#7A5230', font: "600 12px 'Pretendard'", padding: '6px 11px', borderRadius: '999px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A98342" strokeWidth="2">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 7v5l3 2"></path>
              </svg>
              {recipe.time}
            </span>
            <span style={{ background: '#FEEFC7', color: '#7A5230', font: "600 12px 'Pretendard'", padding: '6px 11px', borderRadius: '999px' }}>{recipe.diff}</span>
            <span style={{ background: '#FEEFC7', color: '#7A5230', font: "600 12px 'Pretendard'", padding: '6px 11px', borderRadius: '999px' }}>{recipe.serv}</span>
          </div>
        </div>

        <div>
          <h3 style={{ font: "700 15px 'Pretendard'", color: '#3A2A1E', margin: '0 0 6px' }}>재료</h3>
          {recipe.ings.map((ing, i) => (
            <div 
              key={i} 
              style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F2E9DA', font: "500 13.5px 'Pretendard'", color: '#3A2A1E' }}
            >
              <span>{ing.name}</span>
              <span style={{ color: '#9A8678' }}>{ing.amt}</span>
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ font: "700 15px 'Pretendard'", color: '#3A2A1E', margin: '0 0 14px' }}>조리 순서</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {recipe.steps.map(step => (
              <div key={step.no} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', flexShrink: 0, borderRadius: '50%', background: '#F4B740', color: '#3A2A1E', font: "700 12.5px 'Pretendard'", display: 'flex', alignItems: 'center', justifyContainer: 'center', justifyContent: 'center' }}>
                    {step.no}
                  </div>
                  <span style={{ font: "700 14px 'Pretendard'", color: '#3A2A1E' }}>{step.title}</span>
                </div>
                <div style={{ width: '100%', height: '150px', background: '#F3EADB', border: '1.5px dashed #D8C7AC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B7A595', font: "500 12px 'Pretendard'" }}>
                  {step.photo}
                </div>
                <p style={{ font: "500 13.5px 'Pretendard'", color: '#4A382C', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recipe;

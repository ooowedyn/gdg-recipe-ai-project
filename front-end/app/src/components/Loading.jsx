import { useState, useEffect } from 'react';

// 스피너 + '현재 무슨 작업을 하는지' 문구를 계속 바꿔가며 보여주는 로딩 화면.
// messages: 순서대로 돌아가며 표시할 진행 문구 배열.
function Loading({ title = '잠시만요', messages = ['처리 중이에요…'], sub }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % messages.length);
    }, 2600);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '22px',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      <div className="yp-spinner" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px' }}>
        <span style={{ font: "700 20px 'Pretendard'", color: '#3A2A1E' }}>{title}</span>
        <span
          key={idx}
          className="yp-loading-msg"
          style={{ font: "600 15.5px 'Pretendard'", color: '#7A5230', lineHeight: 1.5 }}
        >
          {messages[idx]}
        </span>
        {sub ? (
          <span style={{ font: "500 12.5px 'Pretendard'", color: '#B7A595', lineHeight: 1.5, marginTop: '2px' }}>
            {sub}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default Loading;

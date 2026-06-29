import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYumpick } from '../YumpickContext';

function Camera() {
  const navigate = useNavigate();
  const { setCurrentImage, setDetectedIngredients } = useYumpick();
  
  const videoRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Start real camera stream
  useEffect(() => {
    let activeStream = null;
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' }, 
      audio: false 
    })
      .then((s) => {
        setHasCamera(true);
        setStream(s);
        activeStream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.log("Real camera not available, showing smart mockup view.", err);
        setHasCamera(false);
        setErrorMsg(err.message);
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle shutter action
  const capturePhoto = () => {
    if (hasCamera && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCurrentImage(dataUrl);
        // Set mock ingredients for real captured photo
        setDetectedIngredients(['당근', '양파', '달걀', '참기름', '마늘']);
        navigate('/detection');
      } catch (err) {
        useFallbackCapture();
      }
    } else {
      useFallbackCapture();
    }
  };

  const useFallbackCapture = () => {
    // Fallback: use a beautiful mock food basket photo from presets
    const fallbackImage = 'https://images.unsplash.com/photo-1566385278603-60576db70855?w=800&auto=format&fit=crop&q=60';
    setCurrentImage(fallbackImage);
    setDetectedIngredients(['닭고기', '당근', '감자', '양파', '대파']);
    navigate('/detection');
  };

  return (
    <div className="camera-container beige-theme page-transition" style={{ backgroundColor: '#FAF6ED', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Top Header (Beige/Brown Theme) */}
      <div className="camera-header-beige" style={{ backgroundColor: '#FFF', borderBottom: '1px solid #EFECE6' }}>
        <button className="btn-back-brown" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="camera-title-text-brown">재료 촬영 스캐너</span>
        <div style={{ width: 36 }}></div> {/* spacer */}
      </div>

      {/* Camera Viewport Area */}
      <div className="camera-viewport-container" style={{ flex: 1, padding: '12px 16px 210px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="camera-viewport-box">
          {hasCamera ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="video-feed"
            />
          ) : (
            <div className="camera-mockup-view">
              <div className="scanner-line"></div>
              <div className="mockup-bg-overlay"></div>
              <img 
                className="mockup-fridge-img" 
                src="https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=60" 
                alt="fridge food scanner"
              />
              
              {/* Viewfinder brackets */}
              <div className="bracket br-tl"></div>
              <div className="bracket br-tr"></div>
              <div className="bracket br-bl"></div>
              <div className="bracket br-br"></div>

              {/* Target trackers on screen (visual scanning feedback) */}
              <div className="tracker-box" style={{ top: '22%', left: '32%', width: '90px', height: '90px' }}>
                <span className="tracker-label">당근 88%</span>
              </div>
              <div className="tracker-box" style={{ top: '56%', left: '48%', width: '80px', height: '80px' }}>
                <span className="tracker-label">양파 92%</span>
              </div>
              <div className="tracker-box" style={{ top: '38%', left: '10%', width: '100px', height: '80px' }}>
                <span className="tracker-label">계란 95%</span>
              </div>
            </div>
          )}

          <div className="helper-bubble-beige">
            <span>💡 냉장고 안의 재료들을 넓게 비춰주세요</span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Panel Area (Chips + Control Bar) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90,
      }}>
        {/* Real-time Recognition Result (하단 바 바로 위쪽 가로 칩 배치) */}
        <div style={{
          background: 'linear-gradient(to top, #FAF6ED 70%, rgba(250, 246, 237, 0))',
          padding: '16px 16px 12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F8B62D' }}></span>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#513629', letterSpacing: '-0.2px' }}>실시간 재료 스캔 결과</span>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }} className="hide-scrollbar">
            <div className="status-chip yellow-chip animate-tag" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '750', border: '1px solid rgba(248, 182, 45, 0.25)', backgroundColor: '#FFF8E7', color: '#513629' }}>
              <span className="chip-emoji">🥕</span>
              <span className="chip-name" style={{ color: '#2F1E16' }}>당근</span>
              <span className="chip-percentage" style={{ fontSize: '9.5px', fontWeight: '800', backgroundColor: '#F8B62D', color: '#513629', padding: '1.5px 5px', borderRadius: '4px', marginLeft: '2px' }}>88%</span>
            </div>
            <div className="status-chip yellow-chip animate-tag" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '750', border: '1px solid rgba(248, 182, 45, 0.25)', backgroundColor: '#FFF8E7', color: '#513629' }}>
              <span className="chip-emoji">🧅</span>
              <span className="chip-name" style={{ color: '#2F1E16' }}>양파</span>
              <span className="chip-percentage" style={{ fontSize: '9.5px', fontWeight: '800', backgroundColor: '#F8B62D', color: '#513629', padding: '1.5px 5px', borderRadius: '4px', marginLeft: '2px' }}>92%</span>
            </div>
            <div className="status-chip yellow-chip animate-tag" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '750', border: '1px solid rgba(248, 182, 45, 0.25)', backgroundColor: '#FFF8E7', color: '#513629' }}>
              <span className="chip-emoji">🥚</span>
              <span className="chip-name" style={{ color: '#2F1E16' }}>계란</span>
              <span className="chip-percentage" style={{ fontSize: '9.5px', fontWeight: '800', backgroundColor: '#F8B62D', color: '#513629', padding: '1.5px 5px', borderRadius: '4px', marginLeft: '2px' }}>95%</span>
            </div>
            <div className="status-chip gray-chip animate-tag" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #EFECE6', backgroundColor: '#FAF6ED', color: '#7C675C', opacity: 0.75 }}>
              <span className="chip-emoji">🥬</span>
              <span className="chip-name" style={{ color: '#2F1E16' }}>대파</span>
              <span className="chip-percentage" style={{ fontSize: '9.5px', fontWeight: '600', backgroundColor: '#EFECE6', color: '#7C675C', padding: '1.5px 5px', borderRadius: '4px', marginLeft: '2px', fontStyle: 'normal' }}>감지 중</span>
            </div>
          </div>
        </div>

        {/* White Sticky Control Bar (맨 밑 고정 하단 바) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '16px 20px 24px 20px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #EFECE6',
          boxShadow: '0 -4px 16px rgba(81, 54, 41, 0.05)',
        }}>
          {/* Left: Album Select Button */}
          <div style={{ width: '33%', display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              onClick={() => navigate('/gallery')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                gap: '4px',
                padding: '4px 8px'
              }}
              className="ripple"
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FAF6ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                border: '1px solid #EFECE6',
                color: '#513629'
              }}>
                🖼️
              </div>
              <span style={{ fontSize: '11px', fontWeight: '750', color: '#7C675C' }}>앨범 선택</span>
            </button>
          </div>

          {/* Center: Main Orange Shutter Button */}
          <div style={{ width: '34%', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={capturePhoto}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#FF7D29', // 동그란 주황색 버튼
                border: '4px solid #FFF',
                boxShadow: '0 0 0 3px #FF7D29, 0 4px 12px rgba(255, 125, 41, 0.35)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'transform 0.15s ease'
              }}
              className="ripple"
              title="촬영하기"
            />
          </div>

          {/* Right: Camera Switch/Spacer Button (for symmetry) */}
          <div style={{ width: '33%', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => alert("전면/후면 카메라 전환 시뮬레이션")}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                gap: '4px',
                padding: '4px 8px'
              }}
              className="ripple"
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FAF6ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                border: '1px solid #EFECE6',
                color: '#513629'
              }}>
                🔄
              </div>
              <span style={{ fontSize: '11px', fontWeight: '750', color: '#7C675C' }}>카메라 전환</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Camera;

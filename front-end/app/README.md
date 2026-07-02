# Yumpick 프론트엔드 (React + Vite)

냉장고 재료 사진으로 메뉴를 추천받는 앱의 화면(React). 백엔드(FastAPI)를 호출해 결과를 보여준다.

---

## 1. 진입점

```
index.html                 # <div id="root"> + /src/main.jsx 로드
└─ src/main.jsx            # React 앱을 #root 에 마운트 (실질적 코드 진입점)
   └─ src/App.jsx          # BrowserRouter + 화면 라우트 정의
      └─ src/YumpickContext.jsx   # 전역 상태 + 백엔드 API 배선 (핵심 허브)
         └─ src/api.js     # FastAPI 호출 클라이언트 (detect/recommend/visualize/main-image)
```

라우트:

| 경로 | 화면 | 역할 |
|---|---|---|
| `/` | Home | 시작 |
| `/user-info` | UserInfo | 보유 양념/도구/가전 |
| `/camera` | Camera | "촬영" = 로컬 파일 선택 |
| `/gallery` | Gallery | 앨범(프리셋) 선택 |
| `/detection` | Detection | 인식된 재료 확인·수정 |
| `/filter` | Filter | 난이도/시간/맵기 등 조건 |
| `/recommendation` | Recommendation | 추천 메뉴 목록 |
| `/recipe` | Recipe | 단계별 레시피 + 사진 |

---

## 2. 실행

```bash
cd /mnt/d/gdg/front-end/app
npm install          # 최초 1회
npm run dev          # 개발 서버 → http://localhost:5173
```

> **Node.js 20.19+ 또는 22.12+ 필요** (Vite 8). `node -v` 로 확인.

빌드(배포/앱용):
```bash
npm run build        # dist/ 생성 (백엔드가 이 dist 를 화면으로 서빙)
```

---

## 3. 백엔드 연결 방법

| 상황 | 어떻게 연결되나 | 설정 |
|---|---|---|
| **개발(브라우저)** | Vite 프록시가 `/api`·`/media` 를 `:8000` 으로 넘김 | 설정 불필요 |
| **빌드(같은 서버)** | 백엔드가 dist 를 서빙 → same-origin | 설정 불필요 |
| **앱(Capacitor)** | 화면이 앱 내부에서 열려 상대경로 불가 → 절대주소 필요 | `.env` 의 `VITE_API_BASE` |

`.env` 예시 (앱 빌드 시):
```
# front-end/app/.env
VITE_API_BASE=https://내-서버-터널주소   # 반드시 https:// 포함
```
> `.env` 는 git 에 안 올라간다(무시됨). 팀원에게는 주소만 알려주면 된다. `.env.example` 참고.
> API 키는 여기에 넣지 않는다 — 키는 백엔드에만 있다.

---

## 4. 화면 흐름 & 로직

- **Camera**: "촬영" 버튼 = 숨겨진 파일 입력이 열려 **로컬 사진 선택**(모바일은 카메라). 선택 파일을 Context에 저장 후 `/detection`.
- **Gallery**: 프리셋 URL을 `File`로 변환해 인식에 사용(실패 시 프리셋 재료 fallback).
- **Detection**: 진입 시 `detectFromFile` 로 백엔드에 자동 재료 인식(스피너 표시), 칩 추가/삭제 가능.
- **Filter**: 조건 저장. "메뉴 추천받기" 를 눌러야 추천을 요청한다.
- **Recommendation**: 추천 요청/렌더. 처음엔 **로딩 화면(스피너+진행 문구)**, 오면 카드 표시. 카드 대표 사진은 `main-image` 로 채워지고, 3개 메뉴의 단계 사진을 백그라운드로 미리 생성한다. "재추천" 버튼으로만 다시 요청(뒤로 왔을 땐 이전 결과 유지).
- **Recipe**: 선택 메뉴를 `visualize` 로 그려 단계 설명·팁·주의·사진 표시. 같은 메뉴는 캐시로 즉시.

핵심 상태/함수는 [src/YumpickContext.jsx](src/YumpickContext.jsx) 에 모여 있다:
`detectFromFile`, `fetchRecommendations`, `getVisualization`(캐시), `fetchMainImagesFor`, `prewarmVisuals`.

---

## 5. 문제 해결

- **화면은 뜨는데 재료/추천/사진이 안 나옴** → 백엔드가 안 켜졌거나(`http://localhost:8000/health` 확인), 앱이면 `VITE_API_BASE` 주소가 틀림/서버 꺼짐. 백엔드가 `429 insufficient_quota` 면 OpenAI 크레딧 충전 필요(크레딧 없이 화면만 볼 땐 백엔드를 `USE_MOCK=true` 로).
- **`npm run dev` 에서 Node 버전 에러** → Node 20.19+/22.12+ 로 올린다.
- **추천/사진이 느림** → 정상(웹검색·이미지 생성). 로딩 문구가 그동안 표시된다.

---

## 6. 앱(Capacitor)으로 만들기

`npm run build` 후 Capacitor로 Android 앱으로 포장한다(별도 팀 가이드 참고).
앱은 상대경로를 못 쓰므로 **빌드 전에 `.env` 의 `VITE_API_BASE` 를 서버 절대주소로** 설정해야 한다.

# 사진 기반 식재료 인식 및 한식 레시피 추천 앱 (Yumpick)

식재료 사진을 찍으면 AI가 재료를 인식하고, 그 재료로 만들 수 있는 메뉴를 **인터넷에서 검색해** 추천하고, 조리 과정을 **단계별 사진**으로 보여준다.

```
[사진]  →  재료 인식  →  재료 리스트  →  메뉴 추천(웹검색)  →  단계별 조리 사진
```

---

## 🚀 빠른 실행 (터미널 2개)

```bash
# 터미널 1 — 백엔드 (http://localhost:8000)
cd /mnt/d/gdg/backend
pip install -r requirements.txt          # 최초 1회
python3 -m uvicorn app.main:app --reload

# 터미널 2 — 프론트 (http://localhost:5173)
cd /mnt/d/gdg/front-end/app
npm install                              # 최초 1회
npm run dev
```

브라우저는 **http://localhost:5173** 로 접속한다.

> - 백엔드: **Python** + FastAPI. `.env`(루트)에 `OPENAI_API_KEY` 필요.
> - 프론트: **Node.js 20.19+ / 22.12+** 필요.

### 💡 크레딧 없이 화면만 보기 (mock 모드)
OpenAI 크레딧이 없거나 화면/흐름만 확인할 땐 백엔드를 mock 으로 켠다(비용 0원).
```bash
cd /mnt/d/gdg/backend && USE_MOCK=true python3 -m uvicorn app.main:app --reload
```

### 백엔드 하나로 화면까지 보기
프론트를 빌드해두면(`cd front-end/app && npm run build`) 백엔드 하나가 화면+API를 같이 서빙한다.
그러면 프론트를 따로 안 켜도 **http://localhost:8000** 에서 앱을 볼 수 있다.
- `http://localhost:8000/` → 앱 화면
- `http://localhost:8000/docs` → API 문서(직접 호출 테스트)
- `http://localhost:8000/health` → 상태 확인

---

## 🧭 진입점 (Entry Points)

**프론트엔드**
```
front-end/app/index.html → src/main.jsx → src/App.jsx(라우터)
                         → src/YumpickContext.jsx(상태+API 배선) → src/api.js(호출)
```

**백엔드**
```
uvicorn app.main:app → backend/app/main.py  (여기가 서버 진입점)
```

---

## 🏗️ 아키텍처 & 로직

세 에이전트를 FastAPI 백엔드가 순서대로 호출한다.

| 단계 | 담당 | 하는 일 |
|---|---|---|
| ① 재료 인식 | `ingredient-agent` | 사진(vision)에서 재료 목록 추출 |
| ② 메뉴 추천 | `recipe-agent` | **웹검색**으로 실제 레시피(유행 메뉴 포함) 3개 추천 + 단계(제목/설명/팁/주의) |
| ③ 시각화 | `visual-agent` | 대표 사진 + 단계 사진 **생성만** (텍스트 재가공 안 함) |

- **추천은 웹검색 기반**이라, 예를 들어 식빵+크림치즈+블루베리잼 → "전남친 토스트" 같은 실제 인터넷 메뉴를 찾아낸다.
- **사진은 캐시**된다. 같은/비슷한 메뉴(요리 유형이 같고 재료가 비슷)는 재생성하지 않고 불러온다.
- **API 키는 백엔드에만** 있고, 앱/프론트는 서버를 대신 호출한다(키 노출 방지).

자세한 내용은 각 하위 README:
- 백엔드: [backend/README.md](backend/README.md) — 실행/엔드포인트/로직/문제해결
- 프론트: [front-end/app/README.md](front-end/app/README.md) — 진입점/화면흐름/앱빌드

---

## 📁 폴더 구조

```
gdg/
├─ backend/          # FastAPI 서버 (3개 에이전트를 잇고 프론트에 API 제공)
├─ front-end/app/    # React + Vite 앱 화면
├─ ingredient-agent/ # 사진 → 재료 인식
├─ recipe-agent/     # 재료 → 메뉴 추천 (웹검색)
├─ visual-agent/     # 메뉴 → 단계별 사진 생성 (recipe_cards/ 에 저장)
├─ docs/             # 흐름/화면/데이터 형식 문서
├─ shared/           # 공통 입력 예시, 프롬프트 규칙
└─ .env              # API 키 (git 에 올리지 않음)
```

---

## 🔧 문제 해결 (자주 나는 것)

**① `address already in use` (포트가 이미 사용 중)**
이전 서버가 안 꺼진 것. 종료하거나 다른 포트로 켠다.
```bash
kill -9 $(lsof -t -i:8000)                         # 8000 정리
python3 -m uvicorn app.main:app --reload --port 8010   # 또는 다른 포트로
```

**② 화면은 뜨는데 재료/추천/사진이 안 나오고, 서버 로그에 `429 insufficient_quota`**
→ **OpenAI 크레딧 소진**이다(코드 문제 아님).
- 충전: https://platform.openai.com/settings/organization/billing
- 급하면 위 **mock 모드**로 화면/흐름만 확인.

**③ 프론트 `npm run dev` 에서 Node 버전 에러**
→ Node.js 20.19+ 또는 22.12+ 로 올린다. (`node -v` 확인)

**④ 추천/사진이 느림**
→ 정상. 웹검색·이미지 생성 때문(로딩 문구가 표시됨). 같은 메뉴 재요청은 캐시로 즉시.

---

## 📱 앱으로 만들기 / 배포 (Cloudflare 터널)

앱은 `localhost` 를 못 쓰므로, 내 컴퓨터 서버를 **공개 https 주소**로 노출해야 한다.
**Cloudflare 터널**을 쓴다. (ngrok 무료는 경고 페이지 때문에 `<img>` 이미지가 깨져서 쓰지 않는다.)

```bash
# 1) 서버를 외부 접속 가능하게 켜기
cd /mnt/d/gdg/backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2) 다른 터미널에서 터널 켜기 → https 주소가 뜬다
cloudflared tunnel --url http://localhost:8000
#   예: https://rugs-sensor-butterfly-acting.trycloudflare.com

# 3) 그 주소를 프론트 .env 에 넣고 빌드
cd /mnt/d/gdg/front-end/app
echo "VITE_API_BASE=https://방금-받은-주소" > .env   # 반드시 https:// 포함
npm run build
```

- 이후 Capacitor 로 Android 앱 포장 (상세 절차는 팀 가이드(노션) 참고).
- ⚠️ quick 터널 주소는 **터널을 재시작하면 바뀐다.** 바뀌면 위 3번(`.env` 수정 + `npm run build`)을 다시 하고, 앱이면 `npx cap sync android` 도 다시 한다.
- 서버·터널은 앱을 쓰는 동안 **계속 켜둬야** 한다(서버가 내 PC 라서).

---

## ⚠️ 주의사항

- 실제 API 키는 GitHub 에 올리지 않는다. `.env` 에 저장하고 `.env.example` 만 공유한다.
- 앱을 테스트하는 동안 **서버 컴퓨터와 터널이 켜져 있어야** 앱이 작동한다(서버가 내 PC 라서).

# Yumpick 백엔드 (FastAPI)

냉장고 재료 사진 → **재료 인식 → 메뉴 추천(웹검색) → 단계별 조리 사진**을 만들어 주는 API 서버.
프론트엔드(`front-end/app`)와 3개 에이전트(`ingredient-agent` / `recipe-agent` / `visual-agent`)를 잇는다.

---

## 1. 진입점 & 실행

**진입점: `app/main.py` 의 `app` 객체** → `uvicorn app.main:app` 로 실행한다.

```bash
cd /mnt/d/gdg/backend
pip install -r requirements.txt          # 최초 1회
python3 -m uvicorn app.main:app --reload  # 개발용 (http://localhost:8000)
```

- 다른 포트로 띄우려면: `--port 8010`
- 폰/외부에서 접속(터널·앱)하려면: `--host 0.0.0.0 --port 8000`

### 백엔드로 "화면까지" 보기 (진입 확인)
프론트 빌드(`front-end/app/dist`)가 있으면 **이 서버 하나로 화면+API를 같이** 서빙한다.

| 주소 | 내용 |
|---|---|
| `http://localhost:8000/` | 앱 화면 (dist 서빙) |
| `http://localhost:8000/docs` | API 문서(Swagger) — 여기서 직접 호출 테스트 가능 |
| `http://localhost:8000/health` | 상태 확인 → `{"status":"ok","mock":false}` |

> `dist` 가 없으면 화면은 안 뜬다. `cd front-end/app && npm run build` 로 만들거나, 개발 땐 프론트를 따로 `npm run dev`(5173)로 띄운다.

---

## 2. 💡 크레딧 없이 화면/흐름만 보기 (mock 모드)

`OPENAI_API_KEY` 가 없거나 크레딧이 떨어졌으면, **mock 모드**로 켜면 실제 AI 호출 없이 샘플 데이터로 전체 흐름을 볼 수 있다.

```bash
cd /mnt/d/gdg/backend
USE_MOCK=true python3 -m uvicorn app.main:app --reload
```

- `/health` 가 `{"mock":true}` 로 뜨면 mock 모드.
- 각 에이전트의 `sample-output.json` 을 돌려주므로 **비용 0원**으로 화면·연결을 점검할 수 있다.

---

## 3. 폴더 구조

```
backend/app/
├─ main.py            # FastAPI 앱: CORS, 라우터 등록, /media 정적 서빙, (dist 있으면) 화면 서빙
├─ config.py          # 루트 .env 로딩, 경로/모델/USE_MOCK/CORS 설정
├─ schemas.py         # Pydantic 요청/응답 모델 (= 프론트-백 계약서)
├─ services.py        # 비즈니스 로직: 에이전트 호출 + 카드 변환 + 캐시 (mock/real 분기)
├─ agents_loader.py   # 기존 3개 agent.py 를 한 프로세스에서 격리 로드
└─ routers/
   ├─ ingredients.py  # POST /api/ingredients/detect
   ├─ recipes.py      # POST /api/recipes/recommend
   └─ visuals.py      # POST /api/recipes/visualize, /api/recipes/main-image
```

---

## 4. 엔드포인트

| 메서드 | 경로 | 화면 | 입력 → 출력 |
|---|---|---|---|
| POST | `/api/ingredients/detect` | Camera/Gallery → Detection | 이미지(multipart) → `{ingredients:[...]}` |
| POST | `/api/recipes/recommend` | Filter → Recommendation | `{ingredients, filters}` → `{recipes:[카드...]}` |
| POST | `/api/recipes/main-image` | Recommendation(카드 썸네일) | `{name, ingredients}` → `{image:"/media/..."}` |
| POST | `/api/recipes/visualize` | Recipe | `{name, ingredients, steps, difficulty}` → `{title, mainImage, steps[]}` |
| GET | `/media/{메뉴}/{파일}.jpg` | - | 생성된 조리 사진(정적) |
| GET | `/health` | - | `{"status":"ok","mock":bool}` |

---

## 5. 핵심 로직

### 파이프라인
```
[사진]  → ingredient-agent(gpt-5.4 vision) → [재료 목록]
[재료]  → recipe-agent(웹검색 + gpt-5.5)   → [실제 메뉴 3개 + 단계(제목/설명/팁/주의)]
[선택]  → visual-agent(gpt-image-1-mini)   → [대표 사진 + 단계 사진]  → /media 로 서빙
```

- **recipe-agent (웹검색 추천)**: `web_search` 도구로 인터넷의 실제 레시피(유행 메뉴 포함, 예: "전남친 토스트")를 검색해 추천한다. 각 단계에 제목·설명·**팁·주의**를 함께 작성한다.
- **visual-agent (그림 전용)**: 레시피 텍스트를 재가공하지 않고 **이미지만** 생성한다. 이미지 프롬프트는 기계적으로 조립(추가 LLM 호출 없음). `jpeg/low/1024` 로 빠르게 뽑고, 이미지 API 분당 한도(429)에는 재시도로 대응.
- **캐시/재사용 (`services._find_similar_cached`)**: 같은/비슷한 메뉴를 이미 만들었으면 재생성하지 않고 불러온다. **"요리 유형(토스트/볶음/조림…)이 같고 + 재료 유사도(Jaccard)가 충분히 높을 때만"** 재사용해, 이름만 같고 재료가 다른 엉뚱한 사진이 붙는 걸 막는다.
- **대표 사진 먼저 (`main-image`)**: 추천 카드 썸네일용으로 대표 사진 한 장만 빠르게 생성/조회한다.
- **폴백**: 이미지 생성이 끝내 실패해도 500 대신 텍스트 단계라도 돌려준다.

---

## 6. 환경설정 (.env)

`.env` 는 **저장소 루트(`/mnt/d/gdg/.env`)** 에 둔다. `config.py` 가 여기서 읽는다.

| 키 | 용도 |
|---|---|
| `OPENAI_API_KEY` | 3개 에이전트 공통 (없으면 자동 mock) |
| `OPENAI_MODEL` | recipe-agent 모델 (기본 `gpt-5.5`) |
| `USE_MOCK` | `true` 면 크레딧 없이 샘플로 동작 |
| `CORS_ORIGINS` | 허용 오리진(기본에 Vite·Capacitor 앱 오리진 포함) |

> 🔐 **API 키는 서버(.env)에만** 둔다. 앱/프론트에는 절대 넣지 않는다. 프론트가 부를 서버 주소만 `front-end/app/.env` 의 `VITE_API_BASE` 로 설정한다.

---

## 7. 문제 해결 (자주 나는 것)

**① `[Errno 98] address already in use` / 포트가 이미 사용 중**
이전 서버가 안 꺼진 것. 8000을 쓰는 프로세스를 종료하거나 다른 포트로 켠다.
```bash
kill -9 $(lsof -t -i:8000)      # 8000 점유 프로세스 종료
# 또는 그냥 다른 포트로:
python3 -m uvicorn app.main:app --reload --port 8010
```

**② `429 insufficient_quota` (AI 호출이 500으로 실패)**
OpenAI **크레딧 소진**이다. 코드 문제가 아니다.
→ https://platform.openai.com/settings/organization/billing 에서 크레딧 충전.
→ 급하면 위 2번 **mock 모드**로 화면만 확인.

**③ 화면(`/`)이 안 뜸**
`front-end/app/dist` 가 없어서다. `cd front-end/app && npm run build` 하거나 프론트를 `npm run dev` 로 따로 띄운다.

**④ 사진 생성이 느림**
정상. 이미지 API 분당 한도 때문에 재시도 대기가 생길 수 있다(한도 상향 시 빨라짐). 캐시 덕에 같은 메뉴 재요청은 즉시.

---

## 8. 배포 / 앱 (Cloudflare 터널)

내 컴퓨터를 서버로 쓸 땐 `--host 0.0.0.0` 로 켠 뒤 **Cloudflare 터널**로 공개 https 주소를 만들어 앱이 그 주소를 호출한다.

```bash
# 서버 (외부 접속 허용)
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
# 다른 터미널: 터널 → https 주소가 뜬다
cloudflared tunnel --url http://localhost:8000
```

> ⚠️ **ngrok 무료는 쓰지 않는다.** 경고 페이지 때문에 `<img>` 로 불러오는 조리 사진이 깨진다.
> Cloudflare 터널은 경고 페이지가 없어 이미지가 정상 로드된다.

- 프론트를 Android 앱으로 포장하는 절차(Capacitor)는 별도 가이드 참고.
- 앱은 상대경로를 못 쓰므로 `front-end/app/.env` 의 `VITE_API_BASE` 에 위 터널 주소를 넣고 빌드해야 한다. (터널 주소가 바뀌면 다시 빌드)

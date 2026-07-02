# Yumpick — 실행 & 구현 가이드 (Frontend + Backend)

냉장고 속 재료 사진 한 장으로 **재료 인식 → 메뉴 추천 → 단계별 조리 사진**까지 만들어 주는 앱.
프론트엔드(`front-end/app`, React + Vite)와 백엔드(`backend`, FastAPI)가 3개의 OpenAI 에이전트
(`ingredient-agent` / `recipe-agent` / `visual-agent`)를 호출해 동작한다.

```
[사진]  ──►  ingredient-agent  ──►  [재료 목록]
[재료+필터] ─►  recipe-agent     ──►  [추천 메뉴 3개]
[선택 메뉴] ─►  visual-agent     ──►  [단계 설명 + 조리 사진(/media)]
```

---

## 1. 빠른 실행 (터미널 2개)

```bash
# 터미널 1 (백엔드)  → http://localhost:8000
cd /mnt/d/gdg/backend && python3 -m uvicorn app.main:app --reload

# 터미널 2 (프론트)  → http://localhost:5173
cd /mnt/d/gdg/front-end/app && npm run dev
```

브라우저는 **`http://localhost:5173`** 로 접속한다.
프론트의 `fetch('/api/...')` 는 Vite 프록시가 `:8000` 으로 넘겨주므로 CORS 신경 쓸 필요가 없다.

> **사전 준비**
> - 프론트: **Node.js 20.19+ 또는 22.12+** 필요(Vite 8 요구). 최초 1회 `npm install`.
> - 백엔드: `pip install -r requirements.txt`. 루트 `.env`에 `OPENAI_API_KEY`가 있으면 **실제 모드**, 없으면 자동 **mock 모드**.

---

## 2. 진입점 (Entry Points)

### 프론트엔드
```
index.html              # <div id="root"> + /src/main.jsx 로드
└─ src/main.jsx         # React 앱을 #root 에 마운트 (실질적 코드 진입점)
   └─ src/App.jsx       # BrowserRouter + 8개 화면 라우트 정의
      └─ src/YumpickContext.jsx   # 전역 상태 + 백엔드 API 배선 (핵심 허브)
         └─ src/api.js  # FastAPI 호출 클라이언트 (detect/recommend/visualize)
```

라우트 구성 (`App.jsx`):

| 경로 | 화면 | 역할 |
|---|---|---|
| `/` | Home | 시작 |
| `/user-info` | UserInfo | 보유 양념/도구/가전 설정 |
| `/camera` | Camera | 촬영(=로컬 파일 열람) |
| `/gallery` | Gallery | 앨범(프리셋) 선택 |
| `/detection` | Detection | 인식된 재료 확인·수정 |
| `/filter` | Filter | 난이도/시간/매움 등 필터 |
| `/recommendation` | Recommendation | 추천 메뉴 목록 |
| `/recipe` | Recipe | 선택 메뉴의 단계별 레시피+사진 |

### 백엔드
```
uvicorn app.main:app        # 진입점
└─ app/main.py              # FastAPI 인스턴스, CORS, 라우터 등록, /media 정적 서빙, (배포 시) SPA 서빙
```

- API 문서(Swagger): `http://localhost:8000/docs`
- 헬스체크: `http://localhost:8000/health` → `{"status":"ok","mock":false}` (`mock` 값으로 현재 모드 확인)

---

## 3. 화면 흐름과 구현 로직 (단계별)

전체 순서: **Home → (UserInfo) → Camera/Gallery → Detection → Filter → Recommendation → Recipe**

### ① Camera — "촬영" 버튼 = 로컬 파일 열람
- 중앙의 흰색 셔터 버튼을 누르면 실제 카메라 촬영이 아니라 **숨겨진 `<input type="file">`가 열려 로컬 파일을 선택**한다.
  (`accept="image/*" capture="environment"` — 모바일에선 카메라, 데스크톱에선 파일 탐색기가 뜬다.)
- 선택한 파일을 Context의 `imageFile`(실제 File 객체)과 `currentImage`(미리보기 URL)에 저장하고, 이전 인식 결과를 비운 뒤 `/detection`으로 이동한다.
- 좌측 "앨범" 버튼은 `/gallery`로 간다.

### ② Gallery — 프리셋 선택
- 프리셋은 원격 이미지 URL이라, 그대로는 백엔드 multipart 전송이 안 된다. 그래서 "이 사진 선택" 시 **URL을 `fetch`→`Blob`→`File`로 변환**해 `imageFile`에 넣는다.
- 동시에 프리셋에 정의된 재료를 **fallback**으로 미리 채워두어(`handlePhotoSelect`), 인식이 실패해도 화면이 비지 않는다.

### ③ Detection — 자동 재료 인식
- 진입 시 `imageFile`이 있으면 자동으로 **`POST /api/ingredients/detect`** (multipart: `image`, `description`)를 호출한다.
- 인식 중에는 "재료 인식 중…" 로딩 표시. 성공하면 재료 칩이 백엔드 결과로 채워지고, 실패하면 기존/프리셋 재료를 유지한다.
- 사용자는 칩을 탭해 삭제하거나 직접 추가할 수 있다. 여기서 확정된 재료가 다음 단계 입력이 된다.

### ④ Filter — 조건 설정
- 난이도/조리시간/칼질/설거지/매움 정도를 고른다. 값은 Context `filters`에 저장된다.
- ⚠️ **현재 필터는 추천 프롬프트에 아직 반영되지 않는다**(아래 "알려진 한계" 참고). 카드 표시용 보조값으로만 쓰인다.

### ⑤ Recommendation — 메뉴 추천
- 진입 시 **`POST /api/recipes/recommend`** (`{ingredients, filters}`)를 호출해 메뉴 카드를 받아 렌더한다.
- 상단 "재추천" 버튼은 같은 API를 다시 호출한다.
- ⚠️ **API 응답 전/실패 시에는 검증용 mock 메뉴(토마토 달걀 볶음 등)가 먼저 보인다.** Context의 초기 상태가 mock 목록으로 세팅돼 있기 때문이며, 추천이 도착하면 실제 메뉴로 교체된다.

### ⑥ Recipe — 단계별 레시피 + 사진
- 선택한 카드로 **`POST /api/recipes/visualize`** 를 호출해 단계 설명과 조리 사진을 받는다.
- 대표 사진과 각 단계 사진은 `/media/{메뉴}/*.png` URL로 오고, `<img>`로 렌더한다.
- ⚠️ **이미지 생성이 오래 걸린다**(수십 초~수 분). 그동안 "그리는 중…" 표시가 나오고, 완료되면 사진이 채워진다. 끝내 실패하면 **텍스트 조리 설명만** 표시된다(아래 참고).

---

## 4. 백엔드 아키텍처

```
backend/app/
├─ main.py            # FastAPI 앱: CORS, 라우터 등록, /media 정적 서빙, (dist 있으면) SPA 서빙
├─ config.py          # 루트 .env 로딩, 경로/모델/USE_MOCK/CORS 설정
├─ schemas.py         # Pydantic 요청/응답 모델 = 프론트-백 계약서
├─ services.py        # 비즈니스 로직: 에이전트 호출 + 프론트 카드 형식 변환 (mock/real 분기)
├─ agents_loader.py   # 기존 3개 agent.py 를 한 프로세스에서 격리 로드
└─ routers/
   ├─ ingredients.py  # POST /api/ingredients/detect
   ├─ recipes.py      # POST /api/recipes/recommend
   └─ visuals.py      # POST /api/recipes/visualize
```

### 핵심 동작
- **mock / real 분기** (`config.py`): 루트 `.env`의 `OPENAI_API_KEY`가 없으면 `USE_MOCK=true`가 되어 각 에이전트의 `sample-output.json`을 반환한다. 키가 있으면 실제 에이전트를 호출한다. `USE_MOCK=false/true`로 강제 지정도 가능.
- **agents_loader**: 세 에이전트가 모두 최상위 이름 `prompt`/`utils`를 import 해서 충돌한다. 로드 직전에 해당 캐시를 비우고 각 에이전트 폴더를 `sys.path` 앞에 두어 격리한다. (모듈은 최초 1회만 로드 후 캐시)
- **services 변환 규칙**:
  - `detect_ingredients` → `run_ingredient_agent`(gpt-5.4 비전) → 재료 문자열 배열
  - `recommend_recipes` → `build_prompt`+`request_recipe`(recipe-agent, Responses API) → `_to_card`로 프론트 카드 변환(`estimatedTime`→분 파싱, `usedIngredients+seasonings` 합침, `image`는 아직 없음)
  - `visualize` → `run_visual_agent`(gpt-5.4 텍스트 + **gpt-image-2** 이미지) → `_with_media_urls`로 파일명을 `/media/{메뉴}/*.png` URL로 치환
- **이미지 rate-limit 대응** (중요): 이미지 API는 분당 생성 한도(예: 5장)가 낮다. 메뉴 하나에 대표 1장 + 단계 N장을 만들다 보니 429가 쉽게 난다. 이를 위해:
  - `visual-agent/agent.py`의 `generate_image`에 **429 재시도/백오프**(15초씩 증가) 추가
  - `services.visualize`에서 **동시성을 낮추고**(`max_workers=2`), 끝내 실패하면 500 대신 **카드의 원본 단계 텍스트로 폴백**(사진 없이 설명만)

---

## 5. 엔드포인트

| 메서드 | 경로 | 화면 | 입력 → 출력 |
|---|---|---|---|
| POST | `/api/ingredients/detect` | Camera/Gallery → Detection | 이미지(multipart `image`,`description`) → `{ingredients:[...]}` |
| POST | `/api/recipes/recommend` | Filter → Recommendation | `{ingredients, filters}` → `{recipes:[카드...]}` |
| POST | `/api/recipes/visualize` | Recipe | `{name, ingredients, steps, difficulty}` → `{title, mainImage, steps[]}` |
| GET | `/media/{메뉴}/{파일}.png` | - | 생성된 조리 사진 (정적) |
| GET | `/health` | - | `{"status":"ok","mock":bool}` |

응답 카드/스텝 형식은 `schemas.py`(`RecipeCard`, `VisualizeResponse`)가 계약서다.
프론트 `api.js`의 `adaptCard`가 카드에 없는 필드(매움/칼질 등)를 필터값으로 채우고, 이미지가 없으면 기본 이미지로 대체한다.

---

## 6. 환경설정 (.env)

`.env`는 **저장소 루트(`/mnt/d/gdg/.env`)** 에 둔다. `config.py`가 여기서 읽으므로 backend 폴더에 별도 `.env`는 불필요.

| 키 | 용도 |
|---|---|
| `OPENAI_API_KEY` | 3개 에이전트 공통 (없으면 자동 mock) |
| `OPENAI_MODEL` | recipe-agent 모델 (기본 `gpt-5.5`) |
| `USE_MOCK` | `true/false`로 모드 강제 |
| `CORS_ORIGINS` | 허용 오리진 (기본 `http://localhost:5173,http://localhost:3000`) |
| `GEMINI_API_KEY`, `FOOD_API_KEY` | (예약) |

---

## 7. 알려진 한계 / TODO

현재는 데모/해커톤 단계라 다음 제약이 있다.

- **카메라 = 로컬 파일 선택**: 실시간 카메라 프리뷰/촬영이 아니라 파일 열람 창으로 대체돼 있다. (모바일에선 카메라가 뜨지만 앱 내 프리뷰 UI는 목업)
- **초기 화면에 무관한 메뉴가 먼저 보임**: 추천 API 응답 전(또는 실패 시) 검증용 mock 메뉴가 잠깐 표시된다. 실제 추천이 오면 교체된다.
- **DB 없음 → 이력/저장 불가**: 상태가 브라우저 메모리(React Context)에만 있다. **이전에 만든 메뉴를 불러올 수 없고**, 새로고침하면 재료·추천·레시피가 모두 초기화된다. (추후 DB + 사용자별 히스토리 필요)
- **사진 생성이 느림**: 이미지 API 분당 한도 때문에 단계가 많은 메뉴는 재시도 대기로 수 분까지 걸릴 수 있다. 한도를 상향하면 크게 빨라진다. 배포 시에는 **동기 응답 대신 작업 등록 + 상태 폴링**(예: `GET /api/jobs/{id}`)으로 분리 권장.
- **필터 미반영**: 난이도/시간/매움 필터가 아직 recipe-agent 프롬프트에 전달되지 않는다. (`services._recipe_raw`에서 `build_prompt`에 조건 추가 필요)
- **생성 이미지 저장 위치**: `visual-agent/recipe_cards/`에 로컬 저장 후 `/media`로 서빙. 다중 인스턴스 배포 시 공용 스토리지(S3 등)로 이전 필요.

---

## 8. 배포 메모 (단일 서버, B안)

프론트를 빌드하면 FastAPI 하나가 화면까지 서빙한다(진입점 1개).

```bash
cd front-end/app && npm install && npm run build   # → front-end/app/dist 생성
cd ../../backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- `dist`가 있으면 `main.py`가 감지해 `/`에서 화면을, `/api`·`/media`에서 API를 함께 서빙한다.
- `dist`가 없으면(개발 중) 이 블록은 자동으로 건너뛴다 → 위 "빠른 실행"의 2-터미널 방식 사용.
- 프로덕션은 `gunicorn + uvicorn worker` 권장.
```

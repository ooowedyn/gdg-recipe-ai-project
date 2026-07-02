// 백엔드(FastAPI) 호출 클라이언트.
// 개발(A안)에서는 Vite 프록시 덕분에 상대경로 '/api' 로 바로 호출된다.
// 배포(B안)에서는 같은 서버(same-origin)라 역시 상대경로로 동작한다.
// 앱(Capacitor)에서는 화면이 서버가 아니라 앱 내부에서 열리므로,
// .env 의 VITE_API_BASE 에 서버 절대주소를 넣어야 API/이미지가 붙는다.

const BASE = import.meta.env.VITE_API_BASE ?? '';

// 백엔드가 주는 '/media/...' 같은 상대 이미지 경로에 BASE 를 붙여 절대 URL 로 만든다.
// (BASE 가 비어 있으면 그대로 상대경로 -> 웹/개발에서 동작, 앱에서는 절대주소로 동작)
function absMedia(url) {
  if (!url) return url;
  if (/^https?:\/\//.test(url)) return url; // 이미 절대 URL 이면 그대로
  return `${BASE}${url}`;
}

// ngrok 무료 터널의 브라우저 경고 페이지를 건너뛰기 위한 헤더.
// (ngrok 이 아닌 환경에서는 그냥 무시되므로 항상 넣어도 무해)
const COMMON_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...COMMON_HEADERS },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// 1) 사진 -> 재료 목록
export async function detectIngredients(file, description = '') {
  const form = new FormData();
  if (file) form.append('image', file);
  form.append('description', description);

  const res = await fetch(`${BASE}/api/ingredients/detect`, {
    method: 'POST',
    headers: { ...COMMON_HEADERS },
    body: form,
  });
  if (!res.ok) throw new Error(`detect -> ${res.status}`);
  const data = await res.json();
  return data.ingredients || [];
}

// 2) 재료 + 필터 -> 추천 카드 (프론트 카드 형식으로 보정)
export async function recommendRecipes(ingredients, filters) {
  const data = await postJson('/api/recipes/recommend', { ingredients, filters });
  return (data.recipes || []).map((c) => adaptCard(c, filters));
}

// 3) 선택 카드 -> 단계 설명 + 절차 이미지 (이미지 경로를 절대 URL 로 보정)
export async function visualizeRecipe(card) {
  const data = await postJson('/api/recipes/visualize', {
    name: card.name,
    ingredients: card.ingredients,
    steps: card.steps,
    difficulty: card.difficulty,
  });
  return {
    ...data,
    mainImage: absMedia(data.mainImage),
    steps: (data.steps || []).map((s) => ({ ...s, image: absMedia(s.image) })),
  };
}

// 3-1) 추천 카드용 대표 사진 한 장만 요청 (카드 썸네일, 절대 URL 로 보정)
export async function fetchMainImage(card) {
  const data = await postJson('/api/recipes/main-image', {
    name: card.name,
    ingredients: card.ingredients,
  });
  return absMedia(data.image) || null;
}

// 백엔드 RecipeCard -> 프론트가 기대하는 카드 형식.
// 백엔드에 없는 필드(맵기 등)는 필터값이나 기본값으로 채운다.
// image 는 처음엔 null 로 두고, 대표 사진(main-image)이 오면 채운다.
function adaptCard(c, filters) {
  return {
    id: c.id,
    name: c.name,
    time: c.time ?? filters?.time ?? 30,
    difficulty: c.difficulty ?? filters?.difficulty ?? '보통',
    spiciness: filters?.spiciness ?? '안 매움',
    cutting: filters?.cutting ?? '보통',
    washing: filters?.washing ?? '보통',
    image: c.image || null,
    ingredients: c.ingredients || [],
    description: c.description || '',
    steps: c.steps || [],
  };
}

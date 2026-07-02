// 백엔드(FastAPI) 호출 클라이언트.
// 개발(A안)에서는 Vite 프록시 덕분에 상대경로 '/api' 로 바로 호출된다.
// 배포(B안)에서는 같은 서버(same-origin)라 역시 상대경로로 동작한다.
// 필요하면 .env 의 VITE_API_BASE 로 베이스 URL 을 덮어쓸 수 있다.

const BASE = import.meta.env.VITE_API_BASE ?? '';

// 추천 카드에 이미지가 없을 때 쓰는 기본 음식 이미지(깨진 이미지 방지)
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60';

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

// 3) 선택 카드 -> 단계 설명 + 절차 이미지 (이미지 경로는 /media/... URL)
export async function visualizeRecipe(card) {
  return postJson('/api/recipes/visualize', {
    name: card.name,
    ingredients: card.ingredients,
    steps: card.steps,
    difficulty: card.difficulty,
  });
}

// 백엔드 RecipeCard -> 프론트가 기대하는 카드 형식.
// 백엔드에 없는 필드(이미지/맵기 등)는 필터값이나 기본값으로 채운다.
function adaptCard(c, filters) {
  return {
    id: c.id,
    name: c.name,
    time: c.time ?? filters?.time ?? 30,
    difficulty: c.difficulty ?? filters?.difficulty ?? '보통',
    spiciness: filters?.spiciness ?? '안 매움',
    cutting: filters?.cutting ?? '보통',
    washing: filters?.washing ?? '보통',
    image: c.image || FALLBACK_IMG,
    ingredients: c.ingredients || [],
    description: c.description || '',
    steps: c.steps || [],
  };
}

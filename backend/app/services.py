"""비즈니스 로직: 에이전트 호출 + 프론트 형식 변환.

라우터(HTTP)와 에이전트(구현) 사이의 유일한 다리.
- mock 모드: 각 에이전트의 sample-output.json 을 반환.
- 실제 모드: agents_loader 로 run 함수를 호출.
변환 규칙(에이전트 출력 -> 프론트 카드)은 모두 여기에 모은다.
"""

import re
import json

from .config import settings
from . import agents_loader


def _load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _safe_folder(name):
    """visual-agent 의 safe_file_name 과 동일하게 폴더명을 만든다."""
    return re.sub(r'[\\/:*?"<>| ]+', "_", str(name).strip())


def _parse_minutes(text):
    """'준비 시간 10분 + 조리 시간 12분' -> 22 처럼 분 단위 숫자를 합산한다."""
    nums = [int(n) for n in re.findall(r"(\d+)\s*분", str(text))]
    return sum(nums) if nums else None


# 유사도 계산에서 제외할 기본 양념(거의 모든 메뉴에 들어가 변별력이 없음)
_BASIC_SEASONINGS = {
    "소금", "설탕", "간장", "식용유", "참기름", "고춧가루", "고추장", "된장",
    "다진마늘", "마늘", "후추", "물", "식초", "맛술", "올리브유", "깨", "통깨", "대파", "파",
}


def _core_tokens(ingredients):
    """재료 문자열에서 수량/단위/괄호를 떼고 핵심 재료명 토큰 집합을 만든다.

    예: "크림치즈 2큰술(30g)" -> "크림치즈", "식빵 2장(약 60g)" -> "식빵".
    기본 양념은 변별력이 없어 제외한다.
    """
    tokens = set()
    for ing in ingredients or []:
        head = str(ing).strip().split()
        if not head:
            continue
        name = re.sub(r"[0-9(].*$", "", head[0]).strip()  # 숫자/괄호 이후 제거
        if len(name) >= 2 and name not in _BASIC_SEASONINGS:
            tokens.add(name)
    return tokens


def _ingredient_similarity(a, b):
    """두 재료 목록의 Jaccard 유사도(0~1)."""
    ta, tb = _core_tokens(a), _core_tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


# 요리 '유형' 키워드(긴 것부터). 유형이 같아야 유사 재료 재사용을 허용한다.
_DISH_TYPES = [
    "볶음밥", "비빔밥", "계란말이", "달걀말이", "볶음", "조림", "김치찌개", "된장찌개",
    "찌개", "된장국", "미역국", "콩나물국", "국밥", "국", "덮밥", "볶음국수", "국수",
    "찜닭", "찜", "닭볶음탕", "탕", "전", "부침개", "파전", "파스타", "리조또", "뇨끼",
    "그라탱", "구이", "무침", "샐러드", "스튜", "카레", "커리", "토스트", "샌드위치",
    "버거", "죽", "오믈렛", "스크램블", "말이", "쌈", "롤", "스프", "수프", "밥",
]


def _dish_type(name):
    """메뉴명에서 요리 유형 키워드를 뽑는다(없으면 None)."""
    n = str(name).replace(" ", "")
    for t in _DISH_TYPES:
        if t in n:
            return t
    return None


def _find_similar_cached(name, ingredients, threshold=0.6):
    """이미 만들어 둔 recipe.json 중 '같은 유형 + 비슷한 재료'인 것을 찾는다(task 8).

    - 요리 유형(토스트/볶음/조림 등)이 같고 재료가 충분히 비슷할 때만 재사용한다.
    - 이름이 같아도 재료가 다르면 재사용하지 않는다(엉뚱한 사진 방지).
    - 유형이 다르면(볶음↔조림 등) 재사용하지 않고 새로 생성한다.
    """
    media = settings.MEDIA_DIR
    if not media.exists():
        return None
    want_type = _dish_type(name)
    if want_type is None:
        return None  # 유형을 알 수 없으면 안전하게 새로 생성
    best, best_score = None, 0.0
    for folder in media.iterdir():
        rj = folder / "recipe.json"
        if not rj.is_file():
            continue
        try:
            data = _load_json(rj)
        except Exception:  # noqa: BLE001
            continue
        if _dish_type(data.get("title", "")) != want_type:
            continue  # 요리 유형이 다르면 건너뛴다
        score = _ingredient_similarity(ingredients, data.get("ingredients", []))
        if score >= threshold and score > best_score:
            best, best_score = data, score
    return best


# ---------- 1) 재료 인식 ----------
def detect_ingredients(image_path=None, description=""):
    if settings.USE_MOCK:
        return _load_json(settings.INGREDIENT_DIR / "sample-output.json").get(
            "ingredients", []
        )

    mod = agents_loader.ingredient()
    out = mod.run_ingredient_agent(
        {"imageFileName": image_path, "description": description}
    )
    return out.get("ingredients", [])


# ---------- 2) 메뉴 추천 ----------
def recommend_recipes(ingredients, filters=None):
    raw = _recipe_raw(ingredients, filters)
    return [_to_card(r, i) for i, r in enumerate(raw.get("recipes", []))]


def _recipe_raw(ingredients, filters):
    if settings.USE_MOCK:
        return _load_json(settings.RECIPE_DIR / "sample-output.json")

    mod = agents_loader.recipe()
    # .env(루트)는 config import 시점에 이미 os.environ 으로 로드됨.
    prompt = mod.build_prompt(ingredients)
    # NOTE: filters(난이도/시간/매움 등)는 아직 recipe-agent 프롬프트에 미반영.
    #       반영하려면 build_prompt 에 조건을 추가하면 된다.
    return mod.request_recipe(prompt, settings.RECIPE_MODEL)


def _norm_steps(raw_steps):
    """steps 를 {step,title,description,tip,caution} 로 정규화한다.

    recipe-agent 는 객체({stepNo,title,description,tip,caution})를 주지만,
    옛 형식(문자열)도 안전하게 변환한다.
    """
    steps = []
    for i, s in enumerate(raw_steps or []):
        if isinstance(s, dict):
            steps.append({
                "step": s.get("stepNo") or s.get("step") or (i + 1),
                "title": s.get("title") or f"{i + 1}단계",
                "description": s.get("description") or "",
                "tip": s.get("tip") or "",
                "caution": s.get("caution") or "",
            })
        else:
            steps.append({
                "step": i + 1,
                "title": f"{i + 1}단계",
                "description": str(s),
                "tip": "",
                "caution": "",
            })
    return steps


def _to_card(recipe, idx):
    """recipe-agent 메뉴 객체 -> 프론트 RecipeCard 형식."""
    name = recipe.get("name", "")
    return {
        "id": f"recipe-{idx + 1}",
        "name": name,
        "time": _parse_minutes(recipe.get("estimatedTime", "")),
        "difficulty": recipe.get("difficulty"),
        "ingredients": (recipe.get("usedIngredients") or [])
        + (recipe.get("seasonings") or []),
        "description": recipe.get("reason"),
        # 단계 제목/설명/팁/주의를 그대로 담는다(visual-agent 는 이미지만 생성).
        "steps": _norm_steps(recipe.get("steps")),
        "image": None,  # 대표 이미지는 main-image / visualize 단계에서 생성
    }


# ---------- 3) 단계 시각화 ----------
def _menu_from_card(card):
    """프론트 카드 -> visual-agent 입력(dict)."""
    return {
        "name": card["name"],
        "ingredients": card.get("ingredients", []),
        "steps": card.get("steps", []),
        "difficulty": card.get("difficulty"),
    }


def visualize(card):
    """선택한 카드의 단계별 사진을 만든다.

    재료가 충분히 비슷한 메뉴를 이미 만들었으면 재생성하지 않고 불러온다(task 7/8).
    이름이 같아도 재료가 다르면 재사용하지 않고 새로 생성(낡은 사진 덮어쓰기).
    실패하면 500 대신 텍스트 단계라도 돌려준다.
    """
    if settings.USE_MOCK:
        return _with_media_urls(_load_json(settings.VISUAL_DIR / "sample-output.json"))

    cached = _find_similar_cached(card.get("name", ""), card.get("ingredients", []))
    if cached:
        return _with_media_urls(cached)

    try:
        # 캐시 미스 → 새로 생성. force 로 같은 이름의 낡은 이미지를 덮어쓴다.
        out = agents_loader.visual().run_visual_agent(
            _menu_from_card(card), max_workers=2, force=True
        )
    except Exception as exc:  # noqa: BLE001
        print(f"visualize 실패 → 텍스트 단계로 폴백: {exc}")
        return _text_only_fallback(card)

    return _with_media_urls(out)


def main_image(card):
    """추천 카드용 대표 사진 한 장만 생성/조회한다(task 2)."""
    name = card.get("name", "")
    ingredients = card.get("ingredients", [])
    folder = _safe_folder(name)

    if settings.USE_MOCK:
        return {"image": None}

    # 재료가 비슷한 기존 결과가 있으면 그 대표 사진을 그대로 쓴다(task 8).
    cached = _find_similar_cached(name, ingredients)
    if cached and cached.get("mainImage"):
        cfolder = _safe_folder(cached.get("title", name))
        return {"image": f"/media/{cfolder}/{cached['mainImage']}"}

    try:
        # 미스 → 이 레시피용 대표 사진을 새로 생성(낡은 사진 덮어쓰기).
        out = agents_loader.visual().run_visual_agent(
            _menu_from_card(card), max_workers=1, main_only=True, force=True
        )
    except Exception as exc:  # noqa: BLE001
        print(f"main-image 실패: {exc}")
        return {"image": None}

    main = out.get("mainImage")
    return {"image": f"/media/{folder}/{main}" if main else None}


def _text_only_fallback(card):
    """이미지 생성 실패 시 카드의 단계 텍스트만으로 응답을 구성한다."""
    steps = _norm_steps(card.get("steps"))
    for s in steps:
        s["image"] = None
    return {
        "title": card.get("name", ""),
        "ingredients": card.get("ingredients", []),
        "mainImage": None,
        "steps": steps,
    }


def _with_media_urls(out):
    """visual-agent 가 돌려준 파일명(main_food.png 등)을 /media URL 로 바꾼다."""
    out = dict(out)
    folder = _safe_folder(out.get("title", ""))

    def to_url(file_name):
        return f"/media/{folder}/{file_name}" if file_name else None

    out["mainImage"] = to_url(out.get("mainImage"))
    out["steps"] = [
        {**step, "image": to_url(step.get("image"))}
        for step in out.get("steps", [])
    ]
    return out

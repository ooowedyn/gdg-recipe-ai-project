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
        "steps": recipe.get("steps") or [],
        "image": None,  # 절차 이미지는 visualize 단계에서 생성
    }


# ---------- 3) 단계 시각화 ----------
def visualize(card):
    """프론트가 선택한 카드를 visual-agent 입력으로 변환해 실행한다."""
    menu = {
        "name": card["name"],
        "usedIngredients": card.get("ingredients", []),
        "seasonings": [],
        "steps": card.get("steps", []),
        "difficulty": card.get("difficulty"),
    }

    if settings.USE_MOCK:
        out = _load_json(settings.VISUAL_DIR / "sample-output.json")
    else:
        try:
            # 이미지 API 분당 한도가 낮아 동시 요청을 줄인다(에이전트 쪽 재시도와 병행).
            out = agents_loader.visual().run_visual_agent(menu, max_workers=2)
        except Exception as exc:  # noqa: BLE001
            # 이미지 생성이 끝내 실패해도 500 대신 텍스트 단계라도 돌려준다.
            print(f"visualize 실패 → 텍스트 단계로 폴백: {exc}")
            return _text_only_fallback(card)

    return _with_media_urls(out)


def _text_only_fallback(card):
    """이미지 생성 실패 시 카드의 원본 단계 텍스트만으로 응답을 구성한다."""
    return {
        "title": card.get("name", ""),
        "ingredients": card.get("ingredients", []),
        "mainImage": None,
        "steps": [
            {
                "step": i + 1,
                "title": f"{i + 1}단계",
                "description": step,
                "tip": "",
                "caution": "",
                "image": None,
            }
            for i, step in enumerate(card.get("steps", []))
        ],
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

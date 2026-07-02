"""visual-agent 보조 함수 (레시피 파싱 / 파일 저장)"""

import os
import re
import base64


def safe_file_name(name):
    """파일명으로 쓸 수 없는 문자를 _ 로 치환한다."""
    return re.sub(r'[\\/:*?"<>| ]+', "_", str(name).strip())


def ensure_recipe_dir(menu_name, output_dir="recipe_cards"):
    """recipe_cards/<메뉴명> 디렉터리를 만들고 경로를 반환한다."""
    recipe_dir = os.path.join(output_dir, safe_file_name(menu_name))
    os.makedirs(recipe_dir, exist_ok=True)
    return recipe_dir


def save_b64_image(b64_data, file_path):
    """base64 이미지 문자열을 파일로 저장하고 경로를 반환한다."""
    with open(file_path, "wb") as f:
        f.write(base64.b64decode(b64_data))
    return file_path


def parse_ingredients(recipe):
    """recipe-agent 출력의 usedIngredients 와 seasonings 를 합쳐 재료 리스트를 만든다.

    예: ["돼지고기 100g", "양파 1/2개(100g)", "간장 1큰술(15ml)", ...]
    """
    ingredients = []
    for key in ("usedIngredients", "seasonings"):
        for item in recipe.get(key, []) or []:
            text = re.sub(r"\s+", " ", str(item)).strip()
            if text:
                ingredients.append(text)
    return ingredients


def parse_steps(recipe):
    """recipe-agent 출력의 steps(문자열 리스트)를 조리 단계 리스트로 변환한다.

    각 원소는 "1단계: ...", "마지막 단계: ..." 형태의 문자열이며,
    순서대로 stepNo 를 1부터 매긴다.

    반환 예:
        [{"stepNo": 1, "originalText": "1단계: 돼지고기를 ...", "imageUrl": None}]
    """
    steps = []
    for i, raw in enumerate(recipe.get("steps", []) or [], start=1):
        text = re.sub(r"\s+", " ", str(raw)).strip()
        if text:
            steps.append({
                "stepNo": i,
                "originalText": text,
                "imageUrl": None,
            })
    return steps

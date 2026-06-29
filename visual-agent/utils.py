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
    """레시피 raw 데이터의 RCP_PARTS_DTLS 에서 재료 리스트를 추출한다."""
    text = recipe.get("RCP_PARTS_DTLS", "")
    ingredients = [
        re.sub(r"\s+", " ", x).strip()
        for x in re.split(r",|\n", text)
        if x.strip()
    ]
    return ingredients


def parse_steps(recipe):
    """레시피 raw 데이터의 MANUAL01~20 에서 조리 단계 리스트를 추출한다.

    반환 예:
        [{"stepNo": 1, "originalText": "감자를 ...", "imageUrl": "http://..."}]
    """
    steps = []
    for i in range(1, 21):
        num = str(i).zfill(2)
        manual = recipe.get(f"MANUAL{num}", "").strip()
        image = recipe.get(f"MANUAL_IMG{num}", "").strip()

        if manual:
            steps.append({
                "stepNo": i,
                "originalText": re.sub(r"\s+", " ", manual),
                "imageUrl": image if image else None,
            })
    return steps

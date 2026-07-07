"""visual-agent — '그림만' 만든다.

recipe-agent 가 작성한 메뉴(dict)를 입력받아 대표 사진 1장과 단계별 사진 N장을
생성하고, recipe_cards/{메뉴명}/ 폴더에 사진과 recipe.json 으로 저장한 뒤 결과 dict 를 반환한다.

- 레시피 텍스트(단계 제목/설명/팁/주의)는 recipe-agent 가 이미 작성했으므로
  여기서는 재가공하지 않고 그대로 통과시킨다.
- 이미지 생성용 프롬프트는 prompt.py 에서 기계적으로 조립한다(추가 텍스트 LLM 호출 없음).
- 이미지 생성: gpt-image-1-mini

입력 형식(recipe-agent 출력의 recipes 배열 원소 하나 또는 서비스가 정규화한 dict):
    {
      "name": "...",
      "ingredients": ["달걀 2개", ...],           # 없으면 usedIngredients+seasonings 로 대체
      "steps": [
        {"stepNo": 1, "title": "재료 손질", "description": "...", "tip": "...", "caution": "..."},
        ...
      ]
    }
"""

import os
import json
import time
from concurrent.futures import ThreadPoolExecutor

from openai import OpenAI, RateLimitError
from dotenv import load_dotenv

from prompt import build_main_image_prompt, build_step_image_prompt
from utils import ensure_recipe_dir, save_b64_image, parse_ingredients

# 실행 위치와 상관없이 visual-agent 폴더를 기준으로 파일을 읽고 쓴다.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

load_dotenv()
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

IMAGE_MODEL = "gpt-image-1-mini"


def generate_image(prompt, file_path, size="1024x1024", quality="low", max_retries=10):
    """gpt-image-1-mini 로 사진을 생성해 file_path 에 저장하고 경로를 반환한다.

    이미지 API 는 분당 생성 한도(rate limit)가 낮아 여러 장을 동시에 요청하면
    429 가 날 수 있다. 429 를 만나면 잠시 대기했다가 재시도한다.
    """
    for attempt in range(max_retries):
        try:
            response = client.images.generate(
                model=IMAGE_MODEL,
                prompt=prompt,
                size=size,
                quality=quality,
                output_format="jpeg",
                n=1,
            )
            return save_b64_image(response.data[0].b64_json, file_path)
        except RateLimitError:
            if attempt == max_retries - 1:
                raise
            wait = 15 * (attempt + 1)  # 한도가 분 단위로 리셋되므로 점진적으로 대기
            print(f"이미지 rate limit → {wait}초 대기 후 재시도 ({attempt + 1}/{max_retries})")
            time.sleep(wait)


def _normalize_steps(recipe):
    """recipe-agent/서비스가 준 steps 를 {step,title,description,tip,caution} 로 정규화한다.

    step 은 객체({stepNo/step,title,...}) 또는 옛 형식의 문자열일 수 있다.
    """
    normalized = []
    for i, s in enumerate(recipe.get("steps", []) or []):
        if isinstance(s, dict):
            normalized.append({
                "step": s.get("stepNo") or s.get("step") or (i + 1),
                "title": s.get("title") or f"{i + 1}단계",
                "description": s.get("description") or "",
                "tip": s.get("tip") or "",
                "caution": s.get("caution") or "",
            })
        else:  # 문자열 단계(구형)
            normalized.append({
                "step": i + 1,
                "title": f"{i + 1}단계",
                "description": str(s),
                "tip": "",
                "caution": "",
            })
    return normalized


def run_visual_agent(recipe, output_dir=None, max_workers=2, main_only=False, force=False):
    """레시피 dict 로 대표 사진(+단계 사진)을 만들고 결과 dict 를 반환한다.

    main_only=True 면 대표 사진 한 장만 만든다(추천 카드 썸네일용, task 2).
    force=False 면 이미 존재하는 이미지는 재생성하지 않는다(사전 생성/캐시 재사용, task 7).
    force=True 면 재료가 다른 낡은 이미지를 덮어쓰기 위해 무조건 새로 생성한다(task 8).
    """
    if output_dir is None:
        output_dir = os.path.join(BASE_DIR, "recipe_cards")

    menu_name = recipe.get("name", "recipe")
    ingredients = recipe.get("ingredients") or parse_ingredients(recipe)
    steps = _normalize_steps(recipe)
    recipe_dir = ensure_recipe_dir(menu_name, output_dir)

    # 생성할 이미지 작업 목록: (키, 파일명, 프롬프트)
    jobs = [("main", "main_food.jpg", build_main_image_prompt(menu_name, ingredients))]
    if not main_only:
        for s in steps:
            jobs.append((
                s["step"],
                f"step_{str(s['step']).zfill(2)}.jpg",
                build_step_image_prompt(menu_name, s["title"], s["description"]),
            ))

    def run_job(job):
        key, file_name, prompt = job
        target = os.path.join(recipe_dir, file_name)
        # 이미 있으면 재생성하지 않는다(사전 생성/캐시 재사용). force 면 덮어쓴다.
        if not force and os.path.exists(target) and os.path.getsize(target) > 0:
            print(f"{key} 사진 재사용")
            return key, file_name
        generate_image(prompt, target)
        print(f"{key} 사진 생성 완료 !")
        return key, file_name

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        image_files = dict(executor.map(run_job, jobs))

    output_steps = [
        {
            "step": s["step"],
            "title": s["title"],
            "description": s["description"],
            "tip": s["tip"],
            "caution": s["caution"],
            "image": image_files.get(s["step"]),
        }
        for s in steps
    ]

    result = {
        "title": menu_name,
        "ingredients": ingredients,
        "mainImage": image_files["main"],
        "steps": output_steps,
    }

    # main_only 사전 생성 단계에서는 recipe.json 을 덮어써 단계 정보를 잃지 않도록 저장하지 않는다.
    if not main_only:
        json_path = os.path.join(recipe_dir, "recipe.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"결과 저장 완료 → {json_path}")

    return result


if __name__ == "__main__":
    with open(os.path.join(BASE_DIR, "sample-input.json"), encoding="utf-8") as f:
        data = json.load(f)

    # recipe-agent 출력 전체({"recipes": [...]})를 넣으면 첫 번째 메뉴를 사용한다.
    if isinstance(data, dict) and "recipes" in data:
        recipe_input = data["recipes"][0]
    else:
        recipe_input = data

    output = run_visual_agent(recipe_input)
    print(json.dumps(output, ensure_ascii=False, indent=2))

"""visual-agent

선택된 레시피(식약처 raw 형식 dict)를 입력받아
초보자용 단계 설명(제목/설명/팁/주의)과 단계별·대표 음식 사진을 생성하고
결과를 recipe_cards/{메뉴명}/ 폴더에 사진과 recipe.json 으로 저장하는 에이전트.

- 텍스트(단계 설명 + 이미지 프롬프트): gpt-5.4
- 이미지 생성: gpt-image-2

지금은 다른 에이전트가 줄 전체 레시피 대신 sample-input.json 의 예시 레시피를
입력으로 사용한다. 입력 형식만 동일하면 그대로 교체해서 쓸 수 있다.
"""

import os
import json
from concurrent.futures import ThreadPoolExecutor

from openai import OpenAI
from dotenv import load_dotenv

from prompt import STEP_SYSTEM_PROMPT, STEP_SCHEMA, build_step_prompt
from utils import (
    ensure_recipe_dir,
    save_b64_image,
    parse_ingredients,
    parse_steps,
)

# 실행 위치와 상관없이 visual-agent 폴더를 기준으로 파일을 읽고 쓴다.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

load_dotenv()
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

TEXT_MODEL = "gpt-5.4"
IMAGE_MODEL = "gpt-image-2"


def request_json(system_prompt, prompt, schema, reasoning_effort="low"):
    """gpt-5.4 에 프롬프트를 보내고 JSON Schema 형식 응답을 dict 로 받는다."""
    response = client.responses.create(
        model=TEXT_MODEL,
        instructions=system_prompt,
        input=prompt,
        reasoning={"effort": reasoning_effort},
        text={
            "format": {
                "type": "json_schema",
                "name": "response_schema",
                "strict": True,
                "schema": schema,
            }
        },
    )
    return json.loads(response.output_text)


def generate_image(prompt, file_path, size="1024x1024", quality="medium"):
    """gpt-image-2 로 사진을 생성해 file_path 에 저장하고 경로를 반환한다."""
    response = client.images.generate(
        model=IMAGE_MODEL,
        prompt=prompt,
        size=size,
        quality=quality,
        output_format="png",
        n=1,
    )
    return save_b64_image(response.data[0].b64_json, file_path)


def generate_recipe_content(recipe, ingredients, steps):
    """조리 단계를 초보자용 단계 설명으로 다듬고, 대표/단계별 이미지 프롬프트를 생성한다.

    반환:
        dict: {"mainImagePrompt": str, "steps": [{stepNo, title, description,
               tip, caution, imagePrompt}, ...]}
    """
    prompt = build_step_prompt(
        menu_name=recipe.get("RCP_NM", ""),
        ingredients=ingredients,
        steps=steps,
        way=recipe.get("RCP_WAY2", ""),
        category=recipe.get("RCP_PAT2", ""),
    )
    result = request_json(STEP_SYSTEM_PROMPT, prompt, STEP_SCHEMA)
    print(f"단계 설명 {len(result['steps'])}개 + 이미지 프롬프트 생성 완료 !")
    return result


def run_visual_agent(recipe, output_dir=None, max_workers=8):
    """레시피 raw dict 를 입력받아 단계 설명 + 사진(대표 1장, 단계별 N장)을 만들고
    recipe_cards/{메뉴명}/ 에 사진과 recipe.json 을 저장한 뒤 결과 dict 를 반환한다.

    이미지 생성(대표 1장 + 단계별 N장)은 ThreadPoolExecutor 로 동시에 요청해
    전체 대기시간을 줄인다.
    """
    if output_dir is None:
        output_dir = os.path.join(BASE_DIR, "recipe_cards")

    menu_name = recipe.get("RCP_NM", "recipe")
    ingredients = parse_ingredients(recipe)
    steps = parse_steps(recipe)
    print(f"재료 {len(ingredients)}개 / 조리 단계 {len(steps)}개 추출 완료 !")

    content = generate_recipe_content(recipe, ingredients, steps)
    recipe_dir = ensure_recipe_dir(menu_name, output_dir)

    sorted_steps = sorted(content["steps"], key=lambda s: s.get("stepNo", 0))

    # 생성할 이미지 작업 목록: (키, 파일명, 프롬프트)
    jobs = [("main", "main_food.png", content["mainImagePrompt"])]
    for step in sorted_steps:
        step_no = step["stepNo"]
        jobs.append((step_no, f"step_{str(step_no).zfill(2)}.png", step["imagePrompt"]))

    def run_job(job):
        key, file_name, prompt = job
        generate_image(prompt, os.path.join(recipe_dir, file_name))
        print(f"{key} 사진 생성 완료 !")
        return key, file_name

    # 모든 이미지를 동시에 생성
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        image_files = dict(executor.map(run_job, jobs))

    main_image = image_files["main"]
    output_steps = []
    for step in sorted_steps:
        step_no = step["stepNo"]
        output_steps.append({
            "step": step_no,
            "title": step["title"],
            "description": step["description"],
            "tip": step["tip"],
            "caution": step["caution"],
            "image": image_files[step_no],
        })

    result = {
        "title": menu_name,
        "ingredients": ingredients,
        "mainImage": main_image,
        "steps": output_steps,
    }

    # 같은 폴더에 recipe.json 으로 저장
    json_path = os.path.join(recipe_dir, "recipe.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"결과 저장 완료 → {json_path}")

    return result


if __name__ == "__main__":
    with open(os.path.join(BASE_DIR, "sample-input.json"), encoding="utf-8") as f:
        recipe_input = json.load(f)

    output = run_visual_agent(recipe_input)
    print(json.dumps(output, ensure_ascii=False, indent=2))

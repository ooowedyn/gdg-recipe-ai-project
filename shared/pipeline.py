"""에이전트 파이프라인

재료 에이전트 → 레시피 에이전트 → 비주얼 에이전트 순으로 순차 실행한다.

각 에이전트 구현이 아직 확정되지 않았기 때문에, 지금은 각 에이전트 폴더의
sample-input.json / sample-output.json 만 사용하는 mock 모드로 동작한다.
즉 "이전 단계의 출력을 다음 단계의 입력으로 넘긴다"는 데이터 흐름만 실제로 잇고,
각 단계의 결과물은 해당 에이전트의 sample-output.json 으로 대신한다.

실제 구현이 준비되면 각 stage 함수에 real_runner(=에이전트 run 함수)만 넘기면
그 단계부터 진짜로 동작한다. (맨 아래 __main__ 의 주석 예시 참고)
"""

import os
import sys
import json
import importlib.util

# 경로 기준: shared/ 의 부모 = 저장소 루트
BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # .../shared
ROOT_DIR = os.path.dirname(BASE_DIR)                     # 저장소 루트

INGREDIENT_DIR = os.path.join(ROOT_DIR, "ingredient-agent")
RECIPE_DIR = os.path.join(ROOT_DIR, "recipe-agent")
VISUAL_DIR = os.path.join(ROOT_DIR, "visual-agent")


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def run_stage(name, agent_dir, input_data, real_runner=None):
    """한 에이전트 단계를 실행한다.

    real_runner 가 있으면 실제 run 함수를 호출하고,
    없으면(기본값) 해당 에이전트의 sample-output.json 을 결과로 사용한다.
    """
    if real_runner is not None:
        return real_runner(input_data)
    return load_json(os.path.join(agent_dir, "sample-output.json"))


def run_pipeline(selected_index=0, ingredient_runner=None,
                 recipe_runner=None, visual_runner=None):
    """재료 → 레시피 → 비주얼 순으로 파이프라인을 실행하고 최종 결과를 반환한다."""

    # 1) 재료 에이전트: 식재료 사진 → 재료 목록
    ingredient_input = load_json(os.path.join(INGREDIENT_DIR, "sample-input.json"))
    print("[1/3] 재료 에이전트")
    print("  입력:", ingredient_input)
    ingredient_output = run_stage(
        "ingredient", INGREDIENT_DIR, ingredient_input, ingredient_runner
    )
    print("  출력:", ingredient_output)

    # 2) 레시피 에이전트: 재료 목록 → 추천 메뉴 목록
    #    재료 에이전트의 출력을 그대로 레시피 에이전트의 입력으로 넘긴다.
    recipe_input = ingredient_output
    print("\n[2/3] 레시피 에이전트")
    print("  입력:", recipe_input)
    recipe_output = run_stage(
        "recipe", RECIPE_DIR, recipe_input, recipe_runner
    )
    recipes = recipe_output.get("recipes", [])
    print(f"  출력: 추천 메뉴 {len(recipes)}개 -> {[r.get('name') for r in recipes]}")

    # 3) 메뉴 선택: 앱에서는 사용자가 고른 메뉴 하나. 지금은 selected_index 로 선택.
    if recipes and 0 <= selected_index < len(recipes):
        selected = recipes[selected_index]
    else:
        selected = recipes[0] if recipes else {}
    print(f"\n선택된 메뉴: {selected.get('name')}")

    # 4) 비주얼 에이전트: 선택된 메뉴 → 단계 설명 + 절차 사진
    #    visual-agent 는 recipe-agent 출력의 메뉴 객체(name/steps/usedIngredients ...)를
    #    그대로 입력으로 받으므로 selected 를 변환 없이 넘긴다.
    #    mock 모드에서는 visual-agent 의 sample-output.json 을 결과로 쓴다.
    visual_input = selected
    print("\n[3/3] 비주얼 에이전트")
    print("  입력 메뉴:", visual_input.get("name"))
    visual_output = run_stage(
        "visual", VISUAL_DIR, visual_input, visual_runner
    )
    print(f"  출력: '{visual_output.get('title')}' "
          f"단계 {len(visual_output.get('steps', []))}개")

    # 최종 결과 저장
    save_json(os.path.join(BASE_DIR, "pipeline-output.json"), visual_output)
    return visual_output


def _load_agent_module(agent_dir):
    """agent.py 를 그 폴더의 prompt.py / utils.py 와 함께 격리해서 로드한다.

    세 에이전트가 모두 최상위 이름 prompt / utils 를 import 하기 때문에,
    한 프로세스에서 여러 개를 그냥 로드하면 sys.modules 캐시가 서로 충돌한다.
    그래서 로드 직전에 그 캐시를 비우고 agent_dir 를 sys.path 맨 앞에 둬서
    각 에이전트가 자기 폴더의 prompt / utils 를 import 하도록 만든다.
    (import 시점에 이름이 바인딩되므로, 로드가 끝나면 캐시를 비워도 안전하다.)
    """
    for name in ("prompt", "utils"):
        sys.modules.pop(name, None)

    sys.path.insert(0, agent_dir)
    try:
        unique = "agent_" + os.path.basename(agent_dir).replace("-", "_")
        spec = importlib.util.spec_from_file_location(
            unique, os.path.join(agent_dir, "agent.py"))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    finally:
        sys.path.remove(agent_dir)


def build_real_runners():
    """세 에이전트의 실제 run 함수를 로드해 (재료, 레시피, 비주얼) 러너로 반환한다.

    OPENAI_API_KEY 가 필요하며, 각 에이전트 폴더의 .env 를 사용한다.
    ingredient / visual 의 agent.py 는 import 시점에 OpenAI 클라이언트를
    초기화하므로, 키가 없으면 여기서 에러가 난다.
    """
    ingredient_mod = _load_agent_module(INGREDIENT_DIR)
    recipe_mod = _load_agent_module(RECIPE_DIR)
    visual_mod = _load_agent_module(VISUAL_DIR)

    def ingredient_runner(input_data):
        data = dict(input_data)
        # 이미지 상대 경로를 ingredient-agent 폴더 기준 절대 경로로 바꾼다.
        image = data.get("imageFileName")
        if image and not os.path.isabs(image):
            data["imageFileName"] = os.path.join(INGREDIENT_DIR, image)
        return ingredient_mod.run_ingredient_agent(data)

    def recipe_runner(input_data):
        # recipe-agent 는 단일 run 함수 대신 build_prompt + request_recipe 로 구성돼 있다.
        if hasattr(recipe_mod, "run_recipe_agent"):
            return recipe_mod.run_recipe_agent(input_data)
        recipe_mod.load_dotenv(os.path.join(RECIPE_DIR, ".env"))
        prompt = recipe_mod.build_prompt(input_data["ingredients"])
        return recipe_mod.request_recipe(prompt, recipe_mod.DEFAULT_MODEL)

    def visual_runner(selected):
        # selected 는 recipe-agent 출력의 메뉴 객체이며 그대로 입력으로 받는다.
        return visual_mod.run_visual_agent(selected)

    return ingredient_runner, recipe_runner, visual_runner


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="에이전트 파이프라인 실행")
    parser.add_argument(
        "--real", action="store_true",
        help="sample 파일 대신 실제 에이전트 run 함수로 실행 (OPENAI_API_KEY 필요)")
    parser.add_argument(
        "--select", type=int, default=0,
        help="추천 메뉴 중 비주얼 단계로 넘길 메뉴 index (기본 0)")
    args = parser.parse_args()

    if args.real:
        # 실제 에이전트로 전 구간 실행.
        ingredient_runner, recipe_runner, visual_runner = build_real_runners()
        result = run_pipeline(
            selected_index=args.select,
            ingredient_runner=ingredient_runner,
            recipe_runner=recipe_runner,
            visual_runner=visual_runner,
        )
    else:
        # 기본: 전 구간 mock (sample 파일 기반). API 키 없이도 흐름 확인 가능.
        result = run_pipeline(selected_index=args.select)

    print("\n=== 최종 결과 ===")
    print(json.dumps(result, ensure_ascii=False, indent=2))

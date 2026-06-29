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
import json

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
    print(f"  출력: 추천 메뉴 {len(recipes)}개 -> {[r.get('title') for r in recipes]}")

    # 3) 메뉴 선택: 앱에서는 사용자가 고른 메뉴 하나. 지금은 selected_index 로 선택.
    selected = recipes[selected_index] if recipes else {}
    print(f"\n선택된 메뉴: {selected.get('title')}")

    # 4) 비주얼 에이전트: 선택된 메뉴 → 단계 설명 + 절차 사진
    #    NOTE: 현재 visual-agent 는 식약처 raw 형식을 입력으로 받는다.
    #          recipe(메뉴 제목) → raw(레시피 전문) 연결 방식이 확정되면
    #          selected 를 raw 로 변환해 넘기면 된다. mock 모드에서는
    #          visual-agent 의 sample-output.json 을 그대로 결과로 쓴다.
    visual_input = selected
    print("\n[3/3] 비주얼 에이전트")
    print("  입력 메뉴:", visual_input.get("title"))
    visual_output = run_stage(
        "visual", VISUAL_DIR, visual_input, visual_runner
    )
    print(f"  출력: '{visual_output.get('title')}' "
          f"단계 {len(visual_output.get('steps', []))}개")

    # 최종 결과 저장
    save_json(os.path.join(BASE_DIR, "pipeline-output.json"), visual_output)
    return visual_output


if __name__ == "__main__":
    # 기본: 전 구간 mock (sample 파일 기반). API 키 없이도 흐름 확인 가능.
    result = run_pipeline()

    # 실제 에이전트로 바꾸려면 해당 단계의 run 함수를 import 해서 넘기면 된다.
    # (각 에이전트 폴더의 agent.py 모듈명이 같으므로 importlib 로 개별 로드한다)
    #
    #   import importlib.util
    #   def load_run(agent_dir, func):
    #       import sys
    #       sys.path.insert(0, agent_dir)
    #       spec = importlib.util.spec_from_file_location(
    #           "agent_" + os.path.basename(agent_dir).replace("-", "_"),
    #           os.path.join(agent_dir, "agent.py"))
    #       mod = importlib.util.module_from_spec(spec)
    #       spec.loader.exec_module(mod)
    #       return getattr(mod, func)
    #
    #   result = run_pipeline(
    #       ingredient_runner=load_run(INGREDIENT_DIR, "run_ingredient_agent"),
    #       visual_runner=load_run(VISUAL_DIR, "run_visual_agent"),
    #   )

    print("\n=== 최종 결과 ===")
    print(json.dumps(result, ensure_ascii=False, indent=2))

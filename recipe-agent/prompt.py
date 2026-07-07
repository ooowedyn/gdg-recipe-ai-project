import json


INSTRUCTIONS = (
    "너는 요리 초보자를 위한 레시피 추천 선생님이다. "
    "반드시 web_search 도구로 인터넷을 검색해, 실제로 존재하고 검색되는 "
    "메뉴(가정식, 요리 블로그, SNS에서 유행한 레시피 포함)만 추천한다. "
    "재료명을 억지로 이어붙인 창작 메뉴명은 금지한다. "
    "검색으로 확인한 실제 레시피의 조리법을 근거로 단계를 작성하고, "
    "반드시 주어진 JSON 스키마 형식으로만 응답한다."
)


# build_prompt 응답이 따라야 하는 JSON Schema (Responses API strict 모드용)
# steps 는 시각화(visual-agent)가 그대로 쓰도록 제목/설명/팁/주의를 담은 객체 배열이다.
RECIPE_SCHEMA = {
    "type": "object",
    "properties": {
        "recipes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "difficulty": {"type": "string"},
                    "estimatedTime": {"type": "string"},
                    "servings": {"type": "string"},
                    "usedIngredients": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "seasonings": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "reason": {"type": "string"},
                    "sourceUrl": {"type": "string"},
                    "steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "stepNo": {"type": "integer"},
                                "title": {"type": "string"},
                                "description": {"type": "string"},
                                "tip": {"type": "string"},
                                "caution": {"type": "string"},
                            },
                            "required": [
                                "stepNo",
                                "title",
                                "description",
                                "tip",
                                "caution",
                            ],
                            "additionalProperties": False,
                        },
                    },
                },
                "required": [
                    "name",
                    "difficulty",
                    "estimatedTime",
                    "servings",
                    "usedIngredients",
                    "seasonings",
                    "reason",
                    "sourceUrl",
                    "steps",
                ],
                "additionalProperties": False,
            },
        },
    },
    "required": ["recipes"],
    "additionalProperties": False,
}


def build_prompt(ingredients):
    input_json = json.dumps({"ingredients": ingredients}, ensure_ascii=False, indent=2)

    return f"""
너는 요리 초보자를 위한 레시피 추천 선생님이다.

입력 재료:
{input_json}

[가장 중요한 규칙 — 웹 검색]
- 반드시 web_search 도구로 인터넷을 검색해서, 입력 재료로 만들 수 있는
  '실제로 존재하는' 메뉴를 찾아 추천한다.
- 한식 가정식뿐 아니라, 요리 블로그·유튜브·SNS에서 유행한 레시피도 적극 포함한다.
  예: 식빵 + 크림치즈 + 블루베리잼 -> "전남친 토스트" 처럼 인터넷에서 검색되는 실제 메뉴.
- 재료명을 억지로 이어붙인 창작 메뉴명은 절대 만들지 않는다.
  예: "감자양파계란볶음", "식빵크림치즈잼" 같은 이름 금지.
- 각 메뉴는 실제 검색으로 확인한 조리법을 근거로 작성하고, 참고한 출처 URL을 sourceUrl 에 적는다.

목표:
- 입력 재료로 만들 수 있는, 서로 다른 실제 메뉴 3개를 추천한다.

추천 기준:
1. 입력 재료를 최대한 활용하고, 추가 식재료는 최소화한다.
2. 기본 양념(소금, 설탕, 간장, 식용유, 참기름, 고춧가루, 고추장, 된장, 다진마늘)은 있다고 가정한다.
3. 성인 1인분 기준으로 작성한다.
4. 초보자가 따라 할 수 있게 양, 시간, 불 세기, 손질 크기를 구체적으로 쓴다.

steps(조리 단계) 작성 규칙 — 각 단계는 객체로 작성한다:
- stepNo: 1부터 시작하는 순서 번호.
- title: 10자 이내의 짧은 행동 제목. 예) "재료 손질", "달걀 볶기".
- description: 초보자가 실제로 따라 할 수 있는 구체적 설명(양/시간/불 세기/확인 기준 포함).
- tip: 해당 단계에 도움이 되는 조리 팁. 없으면 빈 문자열.
- caution: 칼·뜨거운 기름·끓는 물 등 주의사항. 없으면 빈 문자열.
- 메뉴마다 최소 4단계 이상 작성한다.

정량 규칙:
- 모든 재료와 양념에는 정량을 적는다.
- 액체/가루 양념은 큰술/작은술과 ml를 함께 적는다. (큰술=15ml, 작은술=5ml)
- "적당히", "조금", "약간"만 단독으로 쓰지 않는다.

반드시 JSON 스키마에 맞는 JSON만 출력한다. 설명, 코드블록, 주석은 출력하지 않는다.
"""

"""visual-agent 프롬프트 및 응답 스키마 모음"""

# 단계별 설명 + 단계/대표 이미지 프롬프트를 한 번에 생성하기 위한 시스템 프롬프트
STEP_SYSTEM_PROMPT = (
    "너는 요리 초보자를 위한 한식 레시피 설명을 만드는 도우미야. "
    "원본 레시피 단계를 따라 하기 쉬운 단계 설명(제목/설명/팁/주의)으로 다듬고, "
    "각 단계와 완성 음식에 어울리는 이미지 생성용 영어 프롬프트도 함께 작성해줘. "
    "반드시 주어진 JSON 스키마 형식으로만 응답해."
)

# STEP_SYSTEM_PROMPT 응답이 따라야 하는 JSON Schema
STEP_SCHEMA = {
    "type": "object",
    "properties": {
        "mainImagePrompt": {"type": "string"},
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
                    "imagePrompt": {"type": "string"},
                },
                "required": [
                    "stepNo",
                    "title",
                    "description",
                    "tip",
                    "caution",
                    "imagePrompt",
                ],
                "additionalProperties": False,
            },
        },
    },
    "required": ["mainImagePrompt", "steps"],
    "additionalProperties": False,
}


def build_step_prompt(menu_name, ingredients, steps, way="", category=""):
    """단계 설명 + 단계/대표 이미지 프롬프트 생성을 위한 사용자 프롬프트를 만든다."""
    return f"""
메뉴명: {menu_name}
요리 종류: {category}
조리 방법: {way}
전체 재료: {ingredients}
조리 단계 목록: {steps}

위 조리 단계 전체를 요리 초보자용 단계 설명으로 다듬고,
각 단계에 어울리는 이미지 생성용 영어 프롬프트도 함께 만들어줘.

[단계 설명 작성 조건]
- 원본 stepNo 순서를 그대로 유지해줘.
- title은 10자 이내의 짧은 행동 제목으로 작성해줘.
- description은 초보자가 실제로 따라 할 수 있게 쉽게 풀어서 작성해줘.
- tip은 해당 단계에 도움이 되는 조리 팁을 작성해줘.
- caution은 주의사항을 작성하고, 없으면 빈 문자열로 작성해줘.

[이미지 프롬프트(imagePrompt) 작성 조건] - 모든 단계 필수
- 해당 단계의 핵심 조리 장면을 보여주는 영어 프롬프트로 작성해줘.
- 2D flat illustration 스타일, 한식 레시피 앱에 어울리는 깔끔하고 따뜻한 분위기.
- 음식과 조리 동작이 화면 중앙에 잘 보이게, 배경은 단순하고 밝게.
- 사람 얼굴, 글자, 로고, UI 요소는 절대 넣지 마.

[대표 이미지 프롬프트(mainImagePrompt) 작성 조건]
- 완성된 음식 한 그릇/한 접시를 중심으로 한 영어 프롬프트로 작성해줘.
- 위 단계 이미지와 동일한 2D flat illustration 스타일과 분위기를 유지해줘.
- 먹음직스럽고 부드러운 색감, 음식이 화면 중앙에 잘 보이게 구성해줘.
"""

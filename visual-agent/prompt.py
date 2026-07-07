"""visual-agent 프롬프트 모음.

visual-agent 는 '그림만' 만든다. 레시피 텍스트(제목/설명/팁/주의)는 recipe-agent 가
이미 작성했으므로 재가공하지 않고, 여기서는 이미지 생성용 영어 프롬프트만
기계적으로(추가 LLM 호출 없이) 조립한다.
"""

# 모든 이미지에 공통으로 적용할 스타일 지시.
_STYLE = (
    "2D flat vector illustration, clean and warm Korean home-cooking recipe app style, "
    "soft appetizing colors, subject centered, simple bright background, "
    "no text, no letters, no logos, no human faces, no UI elements"
)


def build_main_image_prompt(menu_name, ingredients=None):
    """완성된 음식 대표 이미지용 영어 프롬프트."""
    ing = ""
    if ingredients:
        ing = " made with " + ", ".join(str(i) for i in ingredients[:6])
    return (
        f"A finished, plated Korean dish '{menu_name}'{ing}, "
        f"appetizing single serving on a plate or bowl. {_STYLE}."
    )


def build_step_image_prompt(menu_name, title, description=""):
    """조리 단계 이미지용 영어 프롬프트 (단계 제목/설명 기반)."""
    detail = f": {description}" if description else ""
    return (
        f"Cooking step for '{menu_name}' — {title}{detail}. "
        f"Show the key cooking action and food clearly in the center. {_STYLE}."
    )

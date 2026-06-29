import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


API_URL = "https://api.openai.com/v1/responses"
DEFAULT_MODEL = "gpt-5.5"


def load_dotenv(path):
    env_path = Path(path)
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def load_ingredients(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    ingredients = data.get("ingredients")
    if not isinstance(ingredients, list) or not all(
        isinstance(item, str) for item in ingredients
    ):
        raise ValueError('입력 JSON은 "ingredients": ["재료"] 형식이어야 합니다')
    if not ingredients:
        raise ValueError('"ingredients"에는 재료를 한 개 이상 입력해야 합니다')
    return ingredients


def build_prompt(ingredients):
    input_json = json.dumps({"ingredients": ingredients}, ensure_ascii=False, indent=2)
    return f"""너는 요리를 처음 해보는 사람을 위한 친절한 한식 레시피 선생님이야.

역할:
- 사용자가 가진 재료로 만들 수 있는 한식 메뉴를 추천한다.
- 요리 용어를 모르는 초보자도 그대로 따라 할 수 있게 쉽고 구체적으로 설명한다.
- 모든 레시피는 성인 1인분을 기준으로 작성한다.
- 입력받은 재료를 최대한 활용하고, 추가로 필요한 재료는 최소화한다.
- 소금, 설탕, 간장, 식용유, 참기름, 고춧가루, 고추장 같은 기본 양념은 있다고 가정한다.

사용자가 가진 재료:
{input_json}

반드시 지킬 조건:
- 서로 다른 한식 메뉴를 정확히 3개 추천한다.
- 모든 재료와 양념에 정확한 양을 적는다. 고형 재료는 g, 개, 장, 대처럼 알아보기 쉬운 단위를 함께 쓰고, 액체와 가루 양념은 큰술·작은술과 ml를 함께 쓴다.
- 큰술은 15ml, 작은술은 5ml 기준이다. "적당히", "약간", "조금", "취향껏"처럼 양이 불분명한 표현만 단독으로 쓰지 않는다.
- 소금처럼 개인차가 있는 재료도 시작할 양을 숫자로 제시하고, 맛을 본 뒤 추가할 수 있는 최대량을 알려준다.
- "사용 재료" 항목에는 입력받은 주재료와 추가 식재료를 모두 적고, 각 항목마다 반드시 정량을 표시한다.
- "사용 재료" 항목의 형식은 "재료명 수량(무게)"처럼 쓴다. 예: "감자 1개(150g), 양파 1/2개(100g), 달걀 2개(100g)".
- 무게를 정확히 알기 어려운 재료도 초보자가 준비할 수 있도록 개수·조각·줌 같은 생활 단위와 g 환산을 함께 적는다.
- "기본 양념" 항목에도 각 양념의 정량을 빠짐없이 표시한다.
- 조리 과정에서 재료를 넣을 때마다 해당 재료의 양을 다시 적는다.
- 재료 손질은 크기와 모양을 수치로 설명한다. 예: "양파 1/2개(100g)를 0.5cm 두께로 썬다."
- 불 세기는 약불·중약불·중불·강불 중 하나로 명시하고, 가열 시간은 분 또는 초 단위로 적는다.
- "익을 때까지"라고만 하지 말고 색, 질감, 소리 등 초보자가 눈으로 확인할 수 있는 완성 기준을 함께 설명한다.
- 조리 과정은 메뉴마다 6단계 이상 작성하며, 한 단계에는 한두 가지 행동만 담는다.
- 뜨거운 기름, 칼, 끓는 물 등 주의할 지점은 해당 단계에 바로 알려준다.
- 입력 재료에 없는 추가 식재료가 많이 필요한 메뉴는 추천하지 않는다.
- 코드 블록이나 JSON이 아닌 읽기 쉬운 한국어 번호 목록으로 답한다.

출력 형식:
1. 메뉴 이름
난이도: 쉬움/보통/어려움
예상 시간: 준비 시간 00분 + 조리 시간 00분
분량: 1인분
사용 재료: 재료명 수량(무게), 재료명 수량(무게)
기본 양념: 양념명 숟가락 계량(ml 또는 g), 양념명 숟가락 계량(ml 또는 g)
계량 안내: 저울이 없을 때 참고할 수 있는 개수·숟가락 환산
추천 이유: 초보자에게 적합한 이유를 쉬운 말로 설명
조리 과정:
1단계: 손질할 재료의 양, 자르는 크기와 방법을 구체적으로 설명
2단계 이후: 불 세기, 넣는 양, 조리 시간, 다음 단계로 넘어갈 눈에 보이는 기준을 설명
마지막 단계: 불을 끄는 시점과 완성 상태를 설명
초보자 주의점: 가장 실수하기 쉬운 부분과 해결 방법

위 형식을 메뉴 3개에 동일하게 적용해.
"""


def extract_output_text(response_data):
    if isinstance(response_data.get("output_text"), str):
        return response_data["output_text"]

    chunks = []
    for item in response_data.get("output", []):
        for content in item.get("content", []):
            text = content.get("text")
            if isinstance(text, str):
                chunks.append(text)
    return "\n".join(chunks)


def request_recipe(prompt, model):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            ".env 파일에 OPENAI_API_KEY를 넣거나 터미널에서 "
            '$env:OPENAI_API_KEY="API 키"를 먼저 설정하세요.'
        )

    body = {
        "model": model,
        "instructions": (
            "사용자가 가진 재료로 초보자도 따라 할 수 있는 정량적인 "
            "한식 레시피를 추천하세요."
        ),
        "input": prompt,
        "reasoning": {"effort": "low"},
    }

    request = urllib.request.Request(
        API_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI API error {exc.code}: {details}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"OpenAI API에 연결할 수 없습니다: {exc.reason}") from exc

    output_text = extract_output_text(response_data)
    if not output_text:
        raise RuntimeError("API 응답에서 결과 텍스트를 찾지 못했습니다.")
    return output_text


def main():
    parser = argparse.ArgumentParser(description="GPT API로 한식 레시피를 추천합니다.")
    parser.add_argument("input", help="재료가 담긴 JSON 파일 경로")
    parser.add_argument("--model", default=os.environ.get("OPENAI_MODEL", DEFAULT_MODEL))
    args = parser.parse_args()

    load_dotenv(Path(__file__).with_name(".env"))

    try:
        ingredients = load_ingredients(args.input)
        prompt = build_prompt(ingredients)
        result = request_recipe(prompt, args.model)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

    print(result)


if __name__ == "__main__":
    main()

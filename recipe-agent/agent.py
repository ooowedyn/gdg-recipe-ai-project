import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from prompt import INSTRUCTIONS, RECIPE_SCHEMA, build_prompt


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
        "instructions": INSTRUCTIONS,
        "input": prompt,
        "reasoning": {"effort": "low"},
        "text": {
            "format": {
                "type": "json_schema",
                "name": "recipe_response",
                "strict": True,
                "schema": RECIPE_SCHEMA,
            }
        },
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

    try:
        return json.loads(output_text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"API 응답을 JSON으로 해석하지 못했습니다: {exc}") from exc


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

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from utils import load_image_as_base64
from prompt import SYSTEM_PROMPT

load_dotenv()
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def run_ingredient_agent(input_data: dict) -> dict:
    image_path = input_data["imageFileName"]
    description = input_data.get("description", "")

    image_b64 = load_image_as_base64(image_path)

    response = client.chat.completions.create(
        model="gpt-5.4",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_b64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": description
                    }
                ]
            }
        ],
        max_completion_tokens=300,
    )

    raw = response.choices[0].message.content.strip()
    clean = raw.replace("```json", "").replace("```", "").strip()
    result = json.loads(clean)
    return result

if __name__ == "__main__":
    with open("sample-input.json", encoding="utf-8") as f:
        input_data = json.load(f)

    output = run_ingredient_agent(input_data)
    print(json.dumps(output, ensure_ascii=False, indent=2))
"""서버 설정.

환경변수(.env)에서 키/모델/경로 등을 읽는다.
OPENAI_API_KEY 가 없으면 자동으로 mock 모드(샘플 데이터)로 동작하므로,
프론트엔드 개발자는 키 없이도 서버를 띄워 흐름을 확인할 수 있다.
"""

import os
from pathlib import Path

# backend/app/config.py -> parents[2] = 저장소 루트
ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"

# .env 는 저장소 루트(/mnt/d/gdg/.env)에 있다. (OPENAI_API_KEY, GEMINI_API_KEY, FOOD_API_KEY)
# 여기서 먼저 로드해두면, 이후 에이전트 모듈이 OpenAI 클라이언트를 초기화할 때
# os.environ 에 키가 이미 들어가 있으므로 실행 위치(cwd)와 무관하게 동작한다.
ENV_FILE = ROOT_DIR / ".env"

# .env 로딩 (python-dotenv 가 없으면 조용히 건너뜀)
try:
    from dotenv import load_dotenv
    load_dotenv(ENV_FILE)
except ImportError:
    pass


def _as_bool(value):
    return str(value).lower() in ("1", "true", "yes", "on")


class Settings:
    # 각 에이전트 폴더
    INGREDIENT_DIR = ROOT_DIR / "ingredient-agent"
    RECIPE_DIR = ROOT_DIR / "recipe-agent"
    VISUAL_DIR = ROOT_DIR / "visual-agent"

    # 생성된 절차 이미지(visual-agent recipe_cards)를 /media 로 정적 서빙
    MEDIA_DIR = VISUAL_DIR / "recipe_cards"

    # 배포(B안): 프론트 빌드 결과물. 존재하면 FastAPI 가 화면까지 서빙한다.
    FRONTEND_DIST = ROOT_DIR / "front-end" / "app" / "dist"

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    RECIPE_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

    # 키가 없으면 mock 자동 활성화. USE_MOCK 으로 강제 지정도 가능.
    USE_MOCK = _as_bool(os.getenv("USE_MOCK", "")) or not OPENAI_API_KEY

    # CORS 허용 오리진.
    # - Vite 개발: http://localhost:5173
    # - Capacitor 앱(WebView)의 화면 오리진: capacitor://localhost, http(s)://localhost
    #   (앱은 서버 절대주소로 요청하지만, 브라우저/웹뷰가 검사하는 Origin 은 앱 화면 오리진이다)
    CORS_ORIGINS = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,"
            "capacitor://localhost,ionic://localhost,"
            "http://localhost,https://localhost",
        ).split(",")
        if o.strip()
    ]


settings = Settings()

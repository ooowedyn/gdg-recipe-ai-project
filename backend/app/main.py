"""Yumpick API 엔트리포인트.

구동: uvicorn app.main:app --reload   (backend/ 디렉터리에서)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .config import settings
from .routers import ingredients, recipes, visuals

app = FastAPI(title="Yumpick API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingredients.router)
app.include_router(recipes.router)
app.include_router(visuals.router)

# 생성된 절차 이미지를 정적 서빙 (/media/{메뉴}/step_01.png ...)
settings.MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(settings.MEDIA_DIR)), name="media")


@app.get("/health")
def health():
    return {"status": "ok", "mock": settings.USE_MOCK}


# 배포(B안): 프론트 빌드(dist)가 있으면 화면까지 같은 서버에서 서빙한다.
# (개발 A안에서는 dist 가 없으므로 이 블록은 건너뛰고 Vite 가 화면을 담당)
# API/문서/미디어 경로는 위에서 먼저 등록되어 매칭되고, 그 외 경로만 여기로 온다.
if settings.FRONTEND_DIST.exists():
    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        candidate = settings.FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        # SPA 라우팅: 알 수 없는 경로는 index.html 로 폴백
        return FileResponse(settings.FRONTEND_DIST / "index.html")

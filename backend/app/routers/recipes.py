"""POST /api/recipes/recommend — 재료 + 필터 -> 추천 메뉴 3개."""

from fastapi import APIRouter

from ..schemas import RecommendRequest, RecommendResponse
from .. import services

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    filters = req.filters.model_dump() if req.filters else None
    cards = services.recommend_recipes(req.ingredients, filters)
    return {"recipes": cards}

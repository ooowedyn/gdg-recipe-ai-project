"""프론트엔드와 주고받는 요청/응답 모델 (Pydantic).

이 파일이 사실상 프론트-백 사이의 계약서 역할을 한다.
프론트의 mock 데이터(YumpickContext) 모양과 맞춘다.
"""

from typing import Optional
from pydantic import BaseModel


# ---- ingredient: 사진 -> 재료 ----
class DetectResponse(BaseModel):
    ingredients: list[str]


# ---- recipe: 재료 + 필터 -> 추천 메뉴 ----
class Filters(BaseModel):
    difficulty: Optional[str] = None
    time: Optional[int] = None
    cutting: Optional[str] = None
    washing: Optional[str] = None
    spiciness: Optional[str] = None


class RecommendRequest(BaseModel):
    ingredients: list[str]
    filters: Optional[Filters] = None


# 단계: recipe-agent 가 작성한 제목/설명/팁/주의 (visual-agent 는 이미지만 추가)
class RecipeStep(BaseModel):
    step: int
    title: str = ""
    description: str = ""
    tip: str = ""
    caution: str = ""


class RecipeCard(BaseModel):
    id: str
    name: str
    time: Optional[int] = None
    difficulty: Optional[str] = None
    ingredients: list[str] = []
    description: Optional[str] = None
    steps: list[RecipeStep] = []
    image: Optional[str] = None


class RecommendResponse(BaseModel):
    recipes: list[RecipeCard]


# ---- visual: 선택 메뉴 -> 단계 설명 + 이미지 ----
# 프론트가 선택한 카드를 그대로 보낸다(여분 필드는 무시).
class VisualizeRequest(BaseModel):
    name: str
    ingredients: list[str] = []
    steps: list[RecipeStep] = []
    difficulty: Optional[str] = None


# ---- 추천 카드 대표 사진만 생성 ----
class MainImageRequest(BaseModel):
    name: str
    ingredients: list[str] = []


class MainImageResponse(BaseModel):
    image: Optional[str] = None


class VisualStep(BaseModel):
    step: int
    title: str
    description: str
    tip: str = ""
    caution: str = ""
    image: Optional[str] = None


class VisualizeResponse(BaseModel):
    title: str
    ingredients: list[str] = []
    mainImage: Optional[str] = None
    steps: list[VisualStep] = []

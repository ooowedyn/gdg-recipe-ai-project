"""POST /api/recipes/visualize — 선택 메뉴 -> 단계 설명 + 절차 이미지.

NOTE: 실제 모드에서 이미지 생성은 수십 초가 걸릴 수 있다.
배포 시에는 작업 등록 + 상태 폴링(예: GET /api/jobs/{id})으로 분리하는 것을 권장.
"""

from fastapi import APIRouter

from ..schemas import VisualizeRequest, VisualizeResponse
from .. import services

router = APIRouter(prefix="/api/recipes", tags=["visuals"])


@router.post("/visualize", response_model=VisualizeResponse)
def visualize(req: VisualizeRequest):
    return services.visualize(req.model_dump())

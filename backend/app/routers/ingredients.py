"""POST /api/ingredients/detect — 식재료 사진 -> 재료 목록."""

import os
import shutil
import tempfile

from fastapi import APIRouter, File, Form, UploadFile

from ..schemas import DetectResponse
from .. import services

router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])


@router.post("/detect", response_model=DetectResponse)
async def detect(
    image: UploadFile = File(None),
    description: str = Form(""),
):
    image_path = None
    if image is not None:
        suffix = os.path.splitext(image.filename or "")[1] or ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(image.file, tmp)
            image_path = tmp.name

    try:
        ingredients = services.detect_ingredients(image_path, description)
    finally:
        if image_path and os.path.exists(image_path):
            os.unlink(image_path)

    return {"ingredients": ingredients}

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
import structlog

from app.auth import verify_service_token
from app.services.llm_service import structured_call

log = structlog.get_logger()
router = APIRouter()


class FoodPredictRequest(BaseModel):
    name: str


class MacroPrediction(BaseModel):
    calories_per_100g: float
    protein_g: float
    carb_g: float
    fat_g: float
    fiber_g: float | None = None
    sodium_mg: float | None = None


@router.post("/predict")
async def predict_macros(
    body: FoodPredictRequest,
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
):
    log.info("foods.predict", name=body.name, user_id=x_user_id)

    prompt = (
        f"You are a nutrition database. Estimate macronutrients per 100g for: {body.name}. "
        "Be realistic based on common nutritional databases. "
        "Return a JSON object with keys: calories_per_100g, protein_g, carb_g, fat_g, fiber_g (nullable), sodium_mg (nullable)."
    )

    try:
        result = await structured_call(prompt, MacroPrediction)
    except Exception as e:
        log.error("foods.predict_failed", name=body.name, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Macro prediction failed: {str(e)}",
        )

    return result.model_dump()

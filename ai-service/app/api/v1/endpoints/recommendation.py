from fastapi import APIRouter
from app.models.schemas import RecommendationRequest, RecommendationResponse

router = APIRouter()

@router.post("/recommend-spaces", response_model=RecommendationResponse, summary="Gợi ý không gian và thiết bị")
async def recommend_spaces(payload: RecommendationRequest):
    return {
        "user_id": payload.user_id,
        "recommended_items": [],
        "recommendation_score": 0.0
    }
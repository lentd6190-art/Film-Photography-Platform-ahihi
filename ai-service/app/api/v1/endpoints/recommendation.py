from fastapi import APIRouter, HTTPException
from app.models.schemas import RecommendationRequest, RecommendationResponse, RecommendedItem
from app.services.scorer import calculate_item_score
from app.services.backend_client import BackendClient

router = APIRouter()
backend_client = BackendClient()

@router.post("/", response_model=RecommendationResponse, summary="Gợi ý không gian, thiết bị và gói dịch vụ cá nhân hóa")
async def get_personalized_recommendations(payload: RecommendationRequest):
    if not payload.user_id:
        raise HTTPException(status_code=400, detail="Thiếu thông tin user_id")

    # Lấy lịch sử người dùng và danh sách vật phẩm ứng viên từ backend microservice
    history = await backend_client.get_user_history(payload.user_id)
    candidates = await backend_client.get_candidate_items(payload.category)

    if not candidates:
        return RecommendationResponse(
            user_id=payload.user_id,
            recommendations=[],
            is_fallback=True
        )

    # Đánh giá kịch bản Cold-start
    is_cold_start = not payload.preferences and not history

    scored_items = []
    for item in candidates:
        # Lọc theo danh mục nếu được chỉ định
        if payload.category and item.get("category", "").upper() != payload.category.upper():
            continue
            
        score, reasons = calculate_item_score(item, payload.preferences, history)
        scored_items.append(
            RecommendedItem(
                id=str(item["id"]),
                name=item["name"],
                category=item["category"],
                score=score,
                reasons=reasons
            )
        )

    # Sắp xếp danh sách gợi ý theo điểm số giảm dần
    scored_items.sort(key=lambda x: x.score, reverse=True)

    return RecommendationResponse(
        user_id=payload.user_id,
        recommendations=scored_items[:payload.limit],
        is_fallback=is_cold_start
    )
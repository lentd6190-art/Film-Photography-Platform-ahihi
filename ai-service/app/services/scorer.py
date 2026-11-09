from typing import Dict, Any, Tuple, List, Optional
from app.models.schemas import UserPreferences

def calculate_item_score(
    item: Dict[str, Any], 
    preferences: Optional[UserPreferences], 
    history: List[Dict[str, Any]]
) -> Tuple[float, List[str]]:
    score = 0.0
    reasons = []

    # 1. Base Rating Score (Max 0.2)
    rating = item.get("rating", 0.0)
    score += (rating / 5.0) * 0.2

    # Trường hợp Cold Start (Không preferences & không history)
    if not preferences and not history:
        return round(score, 2), ["Gợi ý phổ biến & được đánh giá cao"]

    # 2. Style Match (Max 0.3)
    if preferences and preferences.photography_styles:
        item_styles = item.get("styles", [])
        matched_styles = set(preferences.photography_styles).intersection(set(item_styles))
        if matched_styles:
            score += 0.3
            reasons.append(f"Trùng phong cách: {', '.join(matched_styles)}")

    # 3. Budget Match (Max 0.25)
    if preferences and preferences.max_budget is not None:
        price = item.get("price", 0.0)
        if price <= preferences.max_budget:
            score += 0.25
            reasons.append("Phù hợp ngân sách")
        elif price <= preferences.max_budget * 1.2:
            score += 0.1
            reasons.append("Vượt nhẹ ngân sách dự kiến")

    # 4. Location Match (Max 0.15)
    if preferences and preferences.location:
        if item.get("location", "").lower() == preferences.location.lower():
            score += 0.15
            reasons.append("Cùng vị trí địa lý")

    # 5. History Match (Max 0.1)
    if history:
        past_item_ids = [h.get("resource_id") for h in history]
        if item.get("id") in past_item_ids:
            score += 0.1
            reasons.append("Đã từng sử dụng trước đây")

    return round(min(score, 1.0), 2), reasons
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


    # ==========================================
# 2. Resource Allocation Scorer
# ==========================================

def calculate_allocation_score(
    space: Dict[str, Any], 
    req_capacity: int, 
    req_equipments: List[str], 
    available_equipments: List[Dict[str, Any]]
) -> Tuple[float, List[str], str]:
    # Lọc theo sức chứa
    space_capacity = space.get("capacity", 0)
    capacity_diff = space_capacity - req_capacity
    if capacity_diff < 0:
        return -1.0, [], "Không đủ sức chứa"

    # Điểm hiệu suất: Ưu tiên phòng vừa vặn, không quá dư thừa chỗ
    space_score = 100.0 - (capacity_diff * 5.0)
    space_score = max(space_score, 10.0)

    # Lọc & kiểm tra thiết bị tương thích
    allocated_equip_ids = []
    matched_count = 0
    
    for req_eq in req_equipments:
        for eq in available_equipments:
            if (eq.get("is_available", True) and 
                eq.get("type") == req_eq and 
                space["id"] in eq.get("compatible_space_ids", [])):
                allocated_equip_ids.append(eq["id"])
                matched_count += 1
                break

    if req_equipments and matched_count < len(req_equipments):
        return -1.0, [], "Không đủ thiết bị tương thích cho phòng này"

    total_score = space_score + (matched_count * 15.0)
    reason = f"Phòng {space['name']} sức chứa {space_capacity} người. Đạt {matched_count}/{len(req_equipments)} thiết bị yêu cầu."
    
    return round(total_score, 2), allocated_equip_ids, reason


def optimize_allocations(request_data: Dict[str, Any], spaces: List[Dict[str, Any]], equipments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    feasible_options = []
    req_cap = request_data["capacity_required"]
    req_eq = request_data.get("equipment_required", [])

    for space in spaces:
        if not space.get("is_available", True):
            continue
            
        score, equip_ids, reason = calculate_allocation_score(space, req_cap, req_eq, equipments)
        if score >= 0:
            feasible_options.append({
                "space_id": space["id"],
                "space_name": space["name"],
                "allocated_equipment": equip_ids,
                "score": score,
                "reason": reason
            })

    # Xếp hạng phương án tốt nhất lên đầu
    feasible_options.sort(key=lambda x: x["score"], reverse=True)
    return feasible_options
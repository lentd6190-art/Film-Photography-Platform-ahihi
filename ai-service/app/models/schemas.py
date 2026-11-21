from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# ==========================================
# 1. Restoration Schemas
# ==========================================

class FilmRestoreRequest(BaseModel):
    image_url: str = Field(..., description="URL ảnh scan phim")
    remove_dust: bool = Field(True, description="Tùy chọn xóa bụi")
    remove_scratches: bool = Field(True, description="Tùy chọn xóa xước")


class FilmRestoreResponse(BaseModel):
    restored_image_url: str
    status: str = Field("success", description="Trạng thái xử lý")


# ==========================================
# 2. RAG & Chat Assistant Schemas
# ==========================================

class ChatAssistantRequest(BaseModel):
    session_id: str = Field(..., description="ID phiên hội thoại")
    message: str = Field(..., description="Câu hỏi của người dùng")


class ChatAssistantResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = Field(default=[], description="Nguồn trích dẫn từ Knowledge Base")
    recommendations: Optional[List[Dict[str, Any]]] = Field(default=[], description="Danh sách gợi ý thiết bị/dịch vụ")
    is_sufficient_knowledge: bool = Field(default=True, description="Cờ đánh giá dữ liệu trong RAG")


# ==========================================
# 3. Recommendation Service Schemas (FPP-50)
# ==========================================

class UserPreferences(BaseModel):
    photography_styles: Optional[List[str]] = Field(default=None, description="Danh sách phong cách yêu thích")
    max_budget: Optional[float] = Field(default=None, description="Ngân sách tối đa")
    location: Optional[str] = Field(default=None, description="Tỉnh/Thành phố yêu cầu")


class RecommendationRequest(BaseModel):
    user_id: str = Field(..., description="ID của photographer")
    category: Optional[str] = Field(default=None, description="Loại gợi ý: SPACE, EQUIPMENT, SERVICE_PACKAGE")
    limit: int = Field(default=5, description="Số lượng kết quả tối đa")
    preferences: Optional[UserPreferences] = Field(default=None, description="Sở thích của người dùng")


class RecommendedItem(BaseModel):
    id: str
    name: str
    category: str
    score: float
    reasons: List[str]


# Alias để tương thích với assistant.py
RecommendationItem = RecommendedItem


class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[RecommendedItem]
    is_fallback: bool
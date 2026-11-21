from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class FilmRestoreRequest(BaseModel):
    image_url: str = Field(..., description="URL ảnh scan phim")
    remove_dust: bool = Field(True, description="Tùy chọn xóa bụi")
    remove_scratches: bool = Field(True, description="Tùy chọn xóa xước")

class FilmRestoreResponse(BaseModel):
    task_id: str
    status: str
    restored_image_url: Optional[str] = None
    message: str

class RecommendationRequest(BaseModel):
    user_id: str
    preferences: List[str]
    budget_range: Optional[str] = None

class RecommendationResponse(BaseModel):
    user_id: str
    recommended_items: List[dict]
    recommendation_score: float

class ChatAssistantRequest(BaseModel):
    session_id: str = Field(..., description="ID phiên hội thoại")
    message: str = Field(..., description="Câu hỏi của người dùng")

class RecommendationItem(BaseModel):
    id: str
    type: str = Field(..., description="Loại gợi ý: space, equipment, service_package")
    name: str
    description: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class ChatAssistantResponse(BaseModel):
    session_id: str
    reply: str
    sources: Optional[List[str]] = Field(default=[], description="Nguồn trích dẫn từ Knowledge Base")
    recommendations: Optional[List[RecommendationItem]] = Field(default=[], description="Danh sách gợi ý thiết bị/dịch vụ")
    is_sufficient_knowledge: bool = Field(default=True, description="Cờ đánh giá dữ liệu trong RAG có đủ hay không")
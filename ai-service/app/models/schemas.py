from pydantic import BaseModel, Field
from typing import Optional, List

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
    session_id: str
    message: str

class ChatAssistantResponse(BaseModel):
    session_id: str
    reply: str
    sources: Optional[List[str]] = []
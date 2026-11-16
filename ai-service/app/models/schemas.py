from datetime import datetime, date
from enum import Enum
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


    # ==========================================
# 4. Resource Allocation Optimization Schemas
# ==========================================

class AllocationRequest(BaseModel):
    request_id: str = Field(..., description="ID của yêu cầu đặt lịch")
    start_time: str = Field(..., description="Thời gian bắt đầu (ISO string)")
    end_time: str = Field(..., description="Thời gian kết thúc (ISO string)")
    capacity_required: int = Field(..., gt=0, description="Sức chứa tối thiểu yêu cầu")
    equipment_required: Optional[List[str]] = Field(default=[], description="Danh sách loại thiết bị yêu cầu")

class AllocationOption(BaseModel):
    space_id: str
    space_name: str
    allocated_equipment: List[str]
    score: float
    reason: str

class AllocationOptimizationResponse(BaseModel):
    request_id: str
    recommended_allocation: Optional[AllocationOption] = None
    alternative_options: List[AllocationOption] = []


    # ==========================================
# 5. Booking Demand Forecasting Schemas (FPP-52)
# ==========================================

class ForecastResourceCategory(str, Enum):
    CREATIVE_SPACE = "CREATIVE_SPACE"
    EQUIPMENT = "EQUIPMENT"
    SERVICE_PACKAGE = "SERVICE_PACKAGE"

class ForecastGranularity(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class ForecastRequest(BaseModel):
    resource_category: ForecastResourceCategory
    resource_id: Optional[str] = Field(None, description="ID cụ thể của không gian/thiết bị/gói (để trống nếu dự báo cả category)")
    location: Optional[str] = Field(None, description="Khu vực/chi nhánh nếu có")
    granularity: ForecastGranularity = ForecastGranularity.DAILY
    horizon: int = Field(7, ge=1, le=90, description="Số kỳ tương lai cần dự báo (1 - 90)")

class HistoricalBookingItem(BaseModel):
    booking_id: str
    booking_date: date
    booking_time: Optional[str] = None
    resource_category: ForecastResourceCategory
    resource_id: str
    location: Optional[str] = None
    status: str
    duration_hours: float = 1.0

class ForecastDataPoint(BaseModel):
    period: str
    value: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    is_predicted: bool

class ForecastEvaluation(BaseModel):
    baseline_method: str = "SeasonalNaive"
    model_used: str
    mae: Optional[float] = None
    mape: Optional[float] = None
    baseline_mae: Optional[float] = None

class ForecastResponse(BaseModel):
    resource_category: ForecastResourceCategory
    resource_id: Optional[str]
    granularity: ForecastGranularity
    forecast_horizon: int
    reliability: str
    warnings: List[str] = []
    trend_direction: str
    historical_series: List[ForecastDataPoint]
    predictions: List[ForecastDataPoint]
    evaluation: ForecastEvaluation
    metadata: Dict[str, Any]
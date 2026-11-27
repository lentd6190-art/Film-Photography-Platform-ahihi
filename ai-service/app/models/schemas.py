from pydantic import model_validator
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


# ==========================================
# 6. Dynamic Pricing Recommendation Schemas (FPP-53)
# ==========================================

class HistoricalPricingPoint(BaseModel):
    period: str = Field(..., description="Kỳ thời gian (VD: 2026-W45 hoặc 2026-11-20)")
    price: float = Field(..., gt=0, description="Giá áp dụng trong kỳ lịch sử")
    demand_count: int = Field(..., ge=0, description="Số lượt booking ghi nhận")

class PricingRecommendationRequest(BaseModel):
    resource_category: ForecastResourceCategory = Field(..., description="CREATIVE_SPACE, EQUIPMENT, SERVICE_PACKAGE")
    resource_id: str = Field(..., description="ID của không gian, thiết bị hoặc gói dịch vụ")
    resource_name: Optional[str] = Field(None, description="Tên hiển thị của tài nguyên")
    resource_subtype: Optional[str] = Field(None, description="Loại chi tiết (VD: Daylight Studio, Cinema Camera...)")
    time_period: str = Field(..., description="Khoảng thời gian cần gợi ý giá (VD: 2026-12-20_weekend)")
    current_price: float = Field(..., gt=0, description="Giá hiện tại của provider")
    
    # Ràng buộc an toàn giá (có thể truyền theo cấu hình từng resource)
    min_price: float = Field(..., gt=0, description="Giá sàn tối thiểu cho phép")
    max_price: float = Field(..., gt=0, description="Giá trần tối đa cho phép")
    
    # Dữ liệu vận hành & dự báo (tùy chọn - nếu None service sẽ gọi API backend & forecaster)
    resource_utilization: Optional[float] = Field(None, ge=0.0, le=1.0, description="Tỷ lệ lấp đầy (0.0 - 1.0)")
    current_demand: Optional[int] = Field(None, ge=0, description="Nhu cầu đặt lịch hiện tại")
    forecasted_demand: Optional[float] = Field(None, ge=0.0, description="Nhu cầu dự báo từ module FPP-52")
    historical_data: Optional[List[HistoricalPricingPoint]] = Field(
        default=None, description="Dữ liệu giá và nhu cầu lịch sử"
    )

    @model_validator(mode="after")
    def check_min_max_bounds(self):
        if self.min_price > self.max_price:
            raise ValueError("min_price không được lớn hơn max_price")
        if self.current_price < 0:
            raise ValueError("current_price không được âm")
        return self

class PricingIndicators(BaseModel):
    utilization_rate: float
    historical_avg_demand: float
    historical_avg_price: float
    effective_demand: float
    demand_ratio: float
    demand_level: str = Field(..., description="HIGH | NORMAL | LOW | INSUFFICIENT_DATA")
    forecast_used: bool

class PricingRecommendationResponse(BaseModel):
    resource_id: str
    resource_name: Optional[str] = None
    resource_category: ForecastResourceCategory
    time_period: str
    current_price: float
    recommended_price: float
    recommended_adjustment_amount: float
    recommended_adjustment_pct: float
    indicators: PricingIndicators
    recommendation_reason: str
    auto_applied: bool = Field(default=False, description="Luôn False: chỉ gợi ý, không tự sửa giá provider")
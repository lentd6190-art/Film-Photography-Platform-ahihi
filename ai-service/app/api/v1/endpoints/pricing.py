from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PricingRecommendationRequest,
    PricingRecommendationResponse,
    ForecastRequest,
)
from app.services.pricing_engine import DynamicPricingEngine
from app.services.backend_client import BackendClient
from app.services.forecaster import build_demand_forecast

router = APIRouter()
pricing_engine = DynamicPricingEngine()
backend_client = BackendClient()

@router.post("/recommend", response_model=PricingRecommendationResponse)
async def recommend_pricing(payload: PricingRecommendationRequest):
    # 1. Lấy dữ liệu qua Backend API nếu caller không truyền sẵn (không chạm chéo DB)
    if payload.historical_data is None or payload.resource_utilization is None:
        try:
            metrics = await backend_client.get_pricing_metrics(
                resource_id=payload.resource_id,
                category=payload.resource_category.value,
                period=payload.time_period,
            )
            if payload.historical_data is None:
                payload.historical_data = metrics.get("historical_data", [])
            if payload.resource_utilization is None:
                payload.resource_utilization = metrics.get("utilization", 0.0)
            if payload.current_demand is None:
                payload.current_demand = metrics.get("current_demand")
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to retrieve booking/utilization data from backend API: {str(e)}",
            )

    # 2. Tận dụng module Demand Forecasting (FPP-52) nếu chưa có forecasted_demand
    if payload.forecasted_demand is None:
        try:
            forecast_req = ForecastRequest(
                resource_category=payload.resource_category,
                resource_id=payload.resource_id,
                horizon=7,
            )
            # Gọi trực tiếp hàm build_demand_forecast của forecaster.py
            raw_history = metrics.get("raw_bookings", []) if "metrics" in locals() else []
            forecast_res = build_demand_forecast(forecast_req, raw_history)
            if forecast_res and forecast_res.predictions:
                payload.forecasted_demand = sum(p.value for p in forecast_res.predictions) / len(forecast_res.predictions)
        except Exception:
            payload.forecasted_demand = None

    return pricing_engine.generate_recommendation(payload)
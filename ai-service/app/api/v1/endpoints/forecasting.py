from fastapi import APIRouter
from app.models.schemas import ForecastRequest, ForecastResponse
from app.services.backend_client import BackendClient
from app.services.forecaster import build_demand_forecast

router = APIRouter()
backend_client = BackendClient()

@router.post("/demand", response_model=ForecastResponse, summary="Dự báo nhu cầu đặt chỗ")
async def forecast_booking_demand(request: ForecastRequest):
    raw_records, last_refresh = await backend_client.get_historical_bookings(
        category=request.resource_category.value,
        resource_id=request.resource_id,
        location=request.location
    )
    return build_demand_forecast(request, raw_records, last_refresh)
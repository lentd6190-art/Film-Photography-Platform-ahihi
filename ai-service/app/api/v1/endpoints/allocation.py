from fastapi import APIRouter, HTTPException, status
from app.models.schemas import AllocationRequest, AllocationOptimizationResponse, AllocationOption
from app.services.backend_client import BackendClient
from app.services.scorer import optimize_allocations

router = APIRouter()
backend_client = BackendClient()

@router.post("/optimize-allocation", response_model=AllocationOptimizationResponse)
async def optimize_resource_allocation(request: AllocationRequest):
    try:
        spaces, equipments = await backend_client.get_available_resources(request.start_time, request.end_time)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Backend Service Connection Error: {str(e)}")

    options = optimize_allocations(request.model_dump(), spaces, equipments)

    if not options:
        return AllocationOptimizationResponse(
            request_id=request.request_id,
            recommended_allocation=None,
            alternative_options=[]
        )

    return AllocationOptimizationResponse(
        request_id=request.request_id,
        recommended_allocation=AllocationOption(**options[0]),
        alternative_options=[AllocationOption(**opt) for opt in options[1:]]
    )
from fastapi import APIRouter
from app.api.v1.endpoints import restoration, recommendation, assistant, rag, allocation, forecasting, pricing

api_router = APIRouter()

api_router.include_router(
    restoration.router,
    prefix="/restoration",
    tags=["Film Image Restoration & Enhancement"]
)
api_router.include_router(
    recommendation.router,
    prefix="/recommendation",
    tags=["Recommendation"]
)
api_router.include_router(
    assistant.router,
    prefix="/assistant",
    tags=["AI Assistant"]
)
api_router.include_router(
    rag.router,
    prefix="/rag",
    tags=["Knowledge Base & RAG"]
)
api_router.include_router(
    allocation.router,
    prefix="/allocation",
    tags=["Resource Allocation Optimization"]
)
api_router.include_router(
    forecasting.router,
    prefix="/forecasting",
    tags=["Demand Forecasting"]
)
api_router.include_router(
    pricing.router,
    prefix="/pricing",
    tags=["Dynamic Pricing"]
)
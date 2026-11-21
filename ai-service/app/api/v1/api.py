from fastapi import APIRouter
from app.api.v1.endpoints import restoration, recommendation, assistant, rag

api_router = APIRouter()
api_router.include_router(restoration.router, tags=["Film Restoration"])
api_router.include_router(recommendation.router, tags=["Recommendation"])
api_router.include_router(assistant.router, tags=["AI Assistant"])
api_router.include_router(rag.router, tags=["Knowledge Base & RAG"])
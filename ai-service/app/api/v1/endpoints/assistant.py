from fastapi import APIRouter
from app.models.schemas import ChatAssistantRequest, ChatAssistantResponse

router = APIRouter()

@router.post("/chat-assistant", response_model=ChatAssistantResponse, summary="Trợ lý AI tư vấn nhiếp ảnh")
async def chat_assistant(payload: ChatAssistantRequest):
    return {
        "session_id": payload.session_id,
        "reply": "Xin chào! Trợ lý AI đang sẵn sàng hỗ trợ bạn.",
        "sources": []
    }
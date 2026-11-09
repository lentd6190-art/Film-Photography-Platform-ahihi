from fastapi import APIRouter
from app.models.schemas import ChatAssistantRequest, ChatAssistantResponse, RecommendationItem
from app.core.config import settings
from typing import List, Dict
import httpx
from openai import AsyncOpenAI

router = APIRouter()

# Bộ nhớ tạm lưu lịch sử hội thoại trong RAM theo session_id
chat_history_store: Dict[str, List[dict]] = {}

# Khởi tạo client OpenAI từ config
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

SYSTEM_PROMPT = """
Bạn là Trợ lý AI Chuyên gia về Nhiếp ảnh Phim (Film Photography AI Assistant).
Nhiệm vụ của bạn là tư vấn về: máy ảnh phim, ống kính, loại phim, tráng rửa (darkroom), hóa chất, giấy ảnh, scan phim, in ấn và kỹ thuật chụp.

QUY TẮC QUAN TRỌNG:
1. Trả lời dựa trên thông tin được cung cấp trong TÀI LIỆU KNOWLEDGE BASE.
2. Nếu TÀI LIỆU KNOWLEDGE BASE không chứa đủ thông tin để trả lời câu hỏi, bạn PHẢI thông báo rõ: "Hiện tại cơ sở dữ liệu của hệ thống chưa có đủ thông tin chi tiết về nội dung này." Không tự ý bịa đặt thông tin kỹ thuật.
3. Nếu có THÔNG TIN ĐỀ XUẤT, hãy gợi ý tự nhiên cho người dùng.
"""

async def fetch_recommendations(query: str) -> List[RecommendationItem]:
    """Gọi API sang Resource/Booking Service để lấy gợi ý nếu câu hỏi có nhu cầu"""
    recommendations = []
    keywords = ["thuê", "studio", "không gian", "máy ảnh", "thiết bị", "phòng rửa", "gói"]
    
    if any(kw in query.lower() for kw in keywords):
        async with httpx.AsyncClient() as httpx_client:
            try:
                # Gọi Resource Service lấy không gian / thiết bị
                res = await httpx_client.get(f"{settings.RESOURCE_SERVICE_URL}/spaces", params={"search": query}, timeout=3.0)
                if res.status_code == 200:
                    for item in res.json()[:2]: # Lấy tối đa 2 gợi ý
                        recommendations.append(RecommendationItem(
                            id=str(item.get("id", "1")),
                            type="space",
                            name=item.get("name", "Studio Không gian"),
                            description=item.get("description", "")
                        ))
            except Exception:
                pass # Bỏ qua nếu service bên ngoài chưa bật
    return recommendations


@router.post("/chat-assistant", response_model=ChatAssistantResponse, summary="Trợ lý AI tư vấn nhiếp ảnh")
async def chat_assistant(payload: ChatAssistantRequest):
    session_id = payload.session_id
    user_message = payload.message

    # 1. Khởi tạo/Lấy lịch sử chat
    if session_id not in chat_history_store:
        chat_history_store[session_id] = []
    history = chat_history_store[session_id]

    # 2. Truy vấn RAG từ Task 27 (Ví dụ giả lập dữ liệu trích xuất từ ChromaDB)
    # Trong thực tế sẽ gọi hàm query từ rag.py
    retrieved_docs = [] # Giả định trả về danh sách các đoạn tài liệu tìm thấy
    
    is_sufficient = len(retrieved_docs) > 0
    docs_text = "\n".join([d.get("text", "") for d in retrieved_docs]) if is_sufficient else "Không tìm thấy dữ liệu liên quan trong Knowledge Base."
    sources = [d.get("source", "KnowledgeBase") for d in retrieved_docs if "source" in d]

    # 3. Lấy thông tin gợi ý Contextual Recommendations
    recommendations = await fetch_recommendations(user_message)
    reco_text = "\n".join([f"- {r.name}: {r.description}" for r in recommendations]) if recommendations else ""

    # 4. Sinh câu trả lời qua LLM (hoặc Fallback nếu không có API Key / Thiếu dữ liệu)
    reply_text = ""
    if client and settings.OPENAI_API_KEY:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in history[-4:]: # Giữ 4 lượt thoại gần nhất
            messages.append(msg)
        
        prompt_content = f"--- TÀI LIỆU KNOWLEDGE BASE ---\n{docs_text}\n\n"
        if reco_text:
            prompt_content += f"--- THÔNG TIN ĐỀ XUẤT NỀN TẢNG ---\n{reco_text}\n\n"
        prompt_content += f"Câu hỏi của người dùng: {user_message}"

        messages.append({"role": "user", "content": prompt_content})

        try:
            response = await client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=messages,
                temperature=0.2
            )
            reply_text = response.choices[0].message.content
        except Exception as e:
            reply_text = f"Xin lỗi, hiện tại hệ thống gặp sự cố kết nối AI: {str(e)}"
    else:
        # Fallback khi chưa điền OpenAI API Key thực tế
        if is_sufficient:
            reply_text = f"Dựa trên cơ sở dữ liệu: {docs_text}"
        else:
            reply_text = "Hiện tại cơ sở dữ liệu của hệ thống chưa có đủ thông tin chi tiết về nội dung này."

    # 5. Cập nhật lịch sử trò chuyện
    chat_history_store[session_id].append({"role": "user", "content": user_message})
    chat_history_store[session_id].append({"role": "assistant", "content": reply_text})

    return ChatAssistantResponse(
        session_id=session_id,
        reply=reply_text,
        sources=sources,
        recommendations=recommendations,
        is_sufficient_knowledge=is_sufficient
    )
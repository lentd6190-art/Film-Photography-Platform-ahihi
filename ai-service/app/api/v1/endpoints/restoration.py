from fastapi import APIRouter
from app.models.schemas import FilmRestoreRequest, FilmRestoreResponse

router = APIRouter()

@router.post("/restore-film", response_model=FilmRestoreResponse, summary="Phục hồi ảnh scan phim bị xước/bụi")
async def restore_film(payload: FilmRestoreRequest):
    return {
        "task_id": "mock-task-id-12345",
        "status": "received",
        "restored_image_url": None,
        "message": "Đã tiếp nhận yêu cầu phục hồi ảnh."
    }
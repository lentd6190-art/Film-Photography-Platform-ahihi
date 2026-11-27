import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from PIL import Image

from app.models.schemas import FilmRestoreResponse
from app.services.processing import apply_restoration, apply_enhancement

router = APIRouter()

STORAGE_ORIGINAL = "./processed/originals"
STORAGE_PROCESSED = "./processed/results"

os.makedirs(STORAGE_ORIGINAL, exist_ok=True)
os.makedirs(STORAGE_PROCESSED, exist_ok=True)

ALLOWED_EXTENSIONS = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


async def validate_image_file(file: UploadFile):
    if file.content_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Định dạng file không hợp lệ. Chỉ chấp nhận JPEG, PNG, WEBP."
        )
    
    content = await file.read()
    await file.seek(0)
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Kích thước file quá lớn (Vượt quá 10MB)."
        )

    try:
        img = Image.open(file.file)
        img.verify()
        await file.seek(0)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File ảnh bị hỏng hoặc không thể đọc."
        )


@router.post(
    "/restore",
    response_model=FilmRestoreResponse,
    summary="Phục hồi ảnh scan phim bị xước/bụi/nhiễu"
)
async def restore_film(
    file: UploadFile = File(...),
    operation: str = Form("all", description="denoise | scratch_reduction | damage_restore | all")
):
    await validate_image_file(file)

    task_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1]
    
    orig_path = os.path.join(STORAGE_ORIGINAL, f"{task_id}_orig.{ext}")
    proc_path = os.path.join(STORAGE_PROCESSED, f"{task_id}_restored.{ext}")

    with open(orig_path, "wb") as f:
        f.write(await file.read())

    try:
        apply_restoration(orig_path, proc_path, operation)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xử lý phục hồi ảnh: {str(e)}"
        )

    return FilmRestoreResponse(
        task_id=task_id,
        status="completed",
        restored_image_url=proc_path,
        message=f"Phục hồi ảnh thành công bằng thao tác '{operation}'."
    )


@router.post(
    "/enhance",
    response_model=FilmRestoreResponse,
    summary="Nâng cấp độ nét, độ tương phản và màu sắc ảnh phim"
)
async def enhance_film(
    file: UploadFile = File(...),
    sharpness: float = Form(1.2, description="Tăng độ nét (VD: 1.0 đến 2.0)"),
    contrast: float = Form(1.1, description="Tăng độ tương phản (VD: 1.0 đến 1.5)"),
    brightness: float = Form(1.0, description="Tăng độ sáng (VD: 0.8 đến 1.3)")
):
    await validate_image_file(file)

    task_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1]
    
    orig_path = os.path.join(STORAGE_ORIGINAL, f"{task_id}_orig.{ext}")
    proc_path = os.path.join(STORAGE_PROCESSED, f"{task_id}_enhanced.{ext}")

    with open(orig_path, "wb") as f:
        f.write(await file.read())

    try:
        apply_enhancement(orig_path, proc_path, sharpness, contrast, brightness)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi nâng cấp ảnh: {str(e)}"
        )

    return FilmRestoreResponse(
        task_id=task_id,
        status="completed",
        restored_image_url=proc_path,
        message="Nâng cấp chất lượng ảnh thành công."
    )
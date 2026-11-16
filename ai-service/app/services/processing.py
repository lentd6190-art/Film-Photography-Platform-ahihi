import cv2
import numpy as np
from PIL import Image, ImageEnhance
import os

def apply_restoration(image_path: str, output_path: str, operation: str) -> str:
    """Xử lý Phôi phục ảnh (Restoration)"""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Không thể đọc file ảnh.")

    if operation == "denoise":
        # Giảm nhiễu hạt phim (Noise Reduction)
        processed = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)
    elif operation == "scratch_reduction":
        # Giảm vết xước nhẹ bằng Median Blur
        processed = cv2.medianBlur(img, 3)
    elif operation == "all" or operation == "damage_restore":
        # Kết hợp giảm nhiễu và làm mịn
        denoised = cv2.fastNlMeansDenoisingColored(img, None, 8, 8, 7, 21)
        processed = cv2.medianBlur(denoised, 3)
    else:
        processed = img

    cv2.imwrite(output_path, processed)
    return output_path


def apply_enhancement(image_path: str, output_path: str, sharpness: float = 1.0, contrast: float = 1.0, brightness: float = 1.0) -> str:
    """Xử lý Nâng cấp ảnh (Enhancement)"""
    pil_img = Image.open(image_path).convert("RGB")

    # 1. Điều chỉnh độ sắc nét (Sharpness)
    if sharpness != 1.0:
        enhancer = ImageEnhance.Sharpness(pil_img)
        pil_img = enhancer.enhance(sharpness)

    # 2. Điều chỉnh độ tương phản (Contrast)
    if contrast != 1.0:
        enhancer = ImageEnhance.Contrast(pil_img)
        pil_img = enhancer.enhance(contrast)

    # 3. Điều chỉnh độ sáng (Brightness/Exposure)
    if brightness != 1.0:
        enhancer = ImageEnhance.Brightness(pil_img)
        pil_img = enhancer.enhance(brightness)

    pil_img.save(output_path)
    return output_path
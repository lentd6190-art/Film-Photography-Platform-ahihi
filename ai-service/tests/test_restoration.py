import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)

def create_dummy_image(format="JPEG", size=(100, 100), color="red"):
    file = io.BytesIO()
    image = Image.new("RGB", size, color=color)
    image.save(file, format=format)
    file.seek(0)
    return file

# 1. Test restore ảnh hợp lệ
def test_restore_valid_image():
    img_bytes = create_dummy_image("JPEG")
    response = client.post(
        "/ai/v1/restoration/restore",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        data={"operation": "denoise"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "restored_image_url" in data

# 2. Test enhance ảnh hợp lệ
def test_enhance_valid_image():
    img_bytes = create_dummy_image("PNG")
    response = client.post(
        "/ai/v1/restoration/enhance",
        files={"file": ("test.png", img_bytes, "image/png")},
        data={"sharpness": "1.5", "contrast": "1.2", "brightness": "1.0"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"

# 3. Test từ chối file sai định dạng
def test_invalid_file_format():
    response = client.post(
        "/ai/v1/restoration/restore",
        files={"file": ("test.txt", b"text content", "text/plain")}
    )
    assert response.status_code == 400

# 4. Test từ chối file ảnh hỏng
def test_corrupted_image():
    fake_corrupted_jpg = b"\xFF\xD8\xFF\xE0FakeHeaderButCorruptedBytes12345"
    response = client.post(
        "/ai/v1/restoration/restore",
        files={"file": ("corrupt.jpg", fake_corrupted_jpg, "image/jpeg")}
    )
    assert response.status_code == 400

# 5. Test bảo toàn ảnh gốc
def test_original_image_preservation():
    img_bytes = create_dummy_image("JPEG")
    response = client.post(
        "/ai/v1/restoration/restore",
        files={"file": ("preserve_test.jpg", img_bytes, "image/jpeg")},
        data={"operation": "all"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "restored" in data["restored_image_url"]
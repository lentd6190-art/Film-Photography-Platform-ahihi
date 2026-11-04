import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_recommendations_endpoint():
    payload = {
        "user_id": "test-user-123",
        "category": "SPACE",
        "limit": 5,
        "preferences": {
            "photography_styles": ["Vintage"],
            "max_budget": 600,
            "location": "Hanoi"
        }
    }
    # Thay /api/v1/ bằng /ai/v1/
    response = client.post("/ai/v1/recommendation/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "test-user-123"
    assert "recommendations" in data
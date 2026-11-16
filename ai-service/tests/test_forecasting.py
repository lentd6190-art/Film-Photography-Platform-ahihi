from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from app.main import app
from app.services.backend_client import BackendClient

client = TestClient(app)

def _generate_mock_bookings(days: int, category: str = "CREATIVE_SPACE"):
    base_date = datetime.now().date() - timedelta(days=days)
    records = []
    for i in range(days):
        d = (base_date + timedelta(days=i)).isoformat()
        for j in range((i % 3) + 1):
            records.append({
                "booking_id": f"bk-{i}-{j}",
                "booking_date": d,
                "resource_category": category,
                "resource_id": "space-1",
                "status": "COMPLETED",
                "duration_hours": 2.0
            })
    return records

@patch.object(BackendClient, "get_historical_bookings", new_callable=AsyncMock)
def test_forecast_sufficient_data(mock_fetch):
    mock_fetch.return_value = (_generate_mock_bookings(35), datetime.now(timezone.utc))
    res = client.post("/ai/v1/forecasting/demand", json={
        "resource_category": "CREATIVE_SPACE",
        "granularity": "daily",
        "horizon": 7
    })
    assert res.status_code == 200
    data = res.json()
    assert data["reliability"] == "HIGH"
    assert len(data["predictions"]) == 7
    assert data["evaluation"]["mae"] is not None

@patch.object(BackendClient, "get_historical_bookings", new_callable=AsyncMock)
def test_forecast_limited_data(mock_fetch):
    mock_fetch.return_value = (_generate_mock_bookings(5, "EQUIPMENT"), datetime.now(timezone.utc))
    res = client.post("/ai/v1/forecasting/demand", json={
        "resource_category": "EQUIPMENT",
        "granularity": "daily",
        "horizon": 5
    })
    assert res.status_code == 200
    data = res.json()
    assert data["reliability"] == "MEDIUM"
    assert any("LIMITED_HISTORICAL_DATA" in w for w in data["warnings"])

@patch.object(BackendClient, "get_historical_bookings", new_callable=AsyncMock)
def test_invalid_and_cancelled_records(mock_fetch):
    records = _generate_mock_bookings(15, "SERVICE_PACKAGE")
    records.append({**records[0], "status": "CANCELLED", "booking_id": "bk-cancel"})
    records.append(records[0])  # duplicate
    records.append({"booking_id": "bad-rec", "booking_date": "invalid-date"})

    mock_fetch.return_value = (records, datetime.now(timezone.utc))
    res = client.post("/ai/v1/forecasting/demand", json={
        "resource_category": "SERVICE_PACKAGE",
        "granularity": "weekly",
        "horizon": 4
    })
    assert res.status_code == 200
    stats = res.json()["metadata"]["preprocessing_stats"]
    assert stats["cancelled_filtered"] == 1
    assert stats["duplicates_removed"] == 1
    assert stats["dropped_invalid"] == 1

def test_invalid_request_params():
    res = client.post("/ai/v1/forecasting/demand", json={
        "resource_category": "INVALID_CAT",
        "horizon": -5
    })
    assert res.status_code == 422
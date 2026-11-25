from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)
URL = f"{settings.API_V1_STR}/pricing/recommend"

SAMPLE_HISTORY = [
    {"period": f"2026-W{i}", "price": 500000.0, "demand_count": 10} for i in range(1, 7)
]

def test_high_demand_period():
    res = client.post(URL, json={
        "resource_category": "CREATIVE_SPACE",
        "resource_id": "space-01",
        "resource_name": "Daylight Studio A",
        "time_period": "2026-12-25",
        "current_price": 500000.0,
        "min_price": 300000.0,
        "max_price": 900000.0,
        "resource_utilization": 0.65,
        "forecasted_demand": 16.0,
        "historical_data": SAMPLE_HISTORY,
    })
    assert res.status_code == 200
    data = res.json()
    assert data["recommended_price"] > 500000.0
    assert data["indicators"]["demand_level"] == "HIGH"
    assert data["auto_applied"] is False

def test_low_demand_period():
    res = client.post(URL, json={
        "resource_category": "EQUIPMENT",
        "resource_id": "eq-01",
        "time_period": "2026-11-10",
        "current_price": 500000.0,
        "min_price": 300000.0,
        "max_price": 900000.0,
        "resource_utilization": 0.50,
        "forecasted_demand": 5.0,
        "historical_data": SAMPLE_HISTORY,
    })
    assert res.status_code == 200
    assert res.json()["recommended_price"] < 500000.0

def test_high_resource_utilization():
    res = client.post(URL, json={
        "resource_category": "SERVICE_PACKAGE",
        "resource_id": "pkg-01",
        "time_period": "2026-12-01",
        "current_price": 500000.0,
        "min_price": 300000.0,
        "max_price": 900000.0,
        "resource_utilization": 0.90,
        "current_demand": 10,
        "historical_data": SAMPLE_HISTORY,
    })
    assert res.status_code == 200
    assert res.json()["recommended_price"] > 500000.0

def test_low_resource_utilization():
    res = client.post(URL, json={
        "resource_category": "CREATIVE_SPACE",
        "resource_id": "space-02",
        "time_period": "2026-11-12",
        "current_price": 500000.0,
        "min_price": 300000.0,
        "max_price": 900000.0,
        "resource_utilization": 0.20,
        "current_demand": 10,
        "historical_data": SAMPLE_HISTORY,
    })
    assert res.status_code == 200
    assert res.json()["recommended_price"] < 500000.0

def test_min_max_price_constraints():
    res = client.post(URL, json={
        "resource_category": "CREATIVE_SPACE",
        "resource_id": "space-01",
        "time_period": "2026-12-25",
        "current_price": 500000.0,
        "min_price": 450000.0,
        "max_price": 520000.0,
        "resource_utilization": 0.95,
        "forecasted_demand": 25.0,
        "historical_data": SAMPLE_HISTORY,
    })
    assert res.status_code == 200
    assert res.json()["recommended_price"] == 520000.0

def test_insufficient_historical_data():
    res = client.post(URL, json={
        "resource_category": "EQUIPMENT",
        "resource_id": "new-lens",
        "time_period": "2026-11-30",
        "current_price": 500000.0,
        "min_price": 300000.0,
        "max_price": 800000.0,
        "resource_utilization": 0.90,
        "current_demand": 15,
        "historical_data": SAMPLE_HISTORY[:2],
    })
    assert res.status_code == 200
    data = res.json()
    assert data["recommended_price"] == 500000.0
    assert data["indicators"]["demand_level"] == "INSUFFICIENT_DATA"

def test_invalid_payload():
    res = client.post(URL, json={
        "resource_category": "EQUIPMENT",
        "resource_id": "eq-01",
        "time_period": "2026-11-30",
        "current_price": -50000.0,
        "min_price": 500000.0,
        "max_price": 300000.0,
    })
    assert res.status_code == 422
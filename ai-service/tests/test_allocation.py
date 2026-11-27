import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

MOCK_SPACES = [
    {"id": "space-small", "name": "Studio Nhỏ", "capacity": 3, "is_available": True},
    {"id": "space-medium", "name": "Studio Vừa", "capacity": 6, "is_available": True},
    {"id": "space-large", "name": "Studio Lớn", "capacity": 15, "is_available": True},
    {"id": "space-busy", "name": "Studio Bận", "capacity": 10, "is_available": False},
]

MOCK_EQUIPMENT = [
    {"id": "eq-light-1", "type": "LIGHTING", "is_available": True, "compatible_space_ids": ["space-small", "space-medium", "space-large"]},
    {"id": "eq-cam-1", "type": "CAMERA", "is_available": True, "compatible_space_ids": ["space-medium", "space-large"]},
    {"id": "eq-busy", "type": "LIGHTING", "is_available": False, "compatible_space_ids": ["space-small"]},
]

@patch("app.services.backend_client.BackendClient.get_available_resources")
def test_single_feasible_allocation(mock_get_resources):
    mock_get_resources.return_value = ([MOCK_SPACES[0]], [MOCK_EQUIPMENT[0]])
    
    payload = {
        "request_id": "REQ-01",
        "start_time": "2026-11-20T09:00:00Z",
        "end_time": "2026-11-20T11:00:00Z",
        "capacity_required": 2,
        "equipment_required": ["LIGHTING"]
    }
    
    response = client.post("/ai/v1/allocation/optimize-allocation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_allocation"]["space_id"] == "space-small"

@patch("app.services.backend_client.BackendClient.get_available_resources")
def test_multiple_feasible_allocations_ranking(mock_get_resources):
    mock_get_resources.return_value = (MOCK_SPACES, MOCK_EQUIPMENT)
    
    payload = {
        "request_id": "REQ-02",
        "start_time": "2026-11-20T09:00:00Z",
        "end_time": "2026-11-20T11:00:00Z",
        "capacity_required": 5,
        "equipment_required": ["LIGHTING"]
    }
    
    response = client.post("/ai/v1/allocation/optimize-allocation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_allocation"]["space_id"] == "space-medium"

@patch("app.services.backend_client.BackendClient.get_available_resources")
def test_no_feasible_allocation(mock_get_resources):
    mock_get_resources.return_value = (MOCK_SPACES, MOCK_EQUIPMENT)
    
    payload = {
        "request_id": "REQ-03",
        "start_time": "2026-11-20T09:00:00Z",
        "end_time": "2026-11-20T11:00:00Z",
        "capacity_required": 50,
        "equipment_required": []
    }
    
    response = client.post("/ai/v1/allocation/optimize-allocation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_allocation"] is None

@patch("app.services.backend_client.BackendClient.get_available_resources")
def test_conflicting_resources(mock_get_resources):
    mock_get_resources.return_value = ([MOCK_SPACES[3]], MOCK_EQUIPMENT)
    
    payload = {
        "request_id": "REQ-04",
        "start_time": "2026-11-20T09:00:00Z",
        "end_time": "2026-11-20T11:00:00Z",
        "capacity_required": 5,
        "equipment_required": []
    }
    
    response = client.post("/ai/v1/allocation/optimize-allocation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_allocation"] is None

@patch("app.services.backend_client.BackendClient.get_available_resources")
def test_equipment_compatibility_constraints(mock_get_resources):
    mock_get_resources.return_value = ([MOCK_SPACES[0]], [MOCK_EQUIPMENT[1]])
    
    payload = {
        "request_id": "REQ-05",
        "start_time": "2026-11-20T09:00:00Z",
        "end_time": "2026-11-20T11:00:00Z",
        "capacity_required": 2,
        "equipment_required": ["CAMERA"]
    }
    
    response = client.post("/ai/v1/allocation/optimize-allocation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_allocation"] is None
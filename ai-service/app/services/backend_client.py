import httpx
from typing import List, Dict, Any

class BackendClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url

    async def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(f"{self.base_url}/api/v1/users/{user_id}/reservations")
                return res.json().get("data", []) if res.status_code == 200 else []
            except httpx.RequestError:
                return []

    async def get_candidate_items(self, category: str = None) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            try:
                params = {"category": category} if category else {}
                res = await client.get(f"{self.base_url}/api/v1/resources", params=params)
                return res.json().get("data", []) if res.status_code == 200 else []
            except httpx.RequestError:
                # Mock Data mẫu để test khi chưa chạy server Backend
                return [
                    {"id": "space-1", "name": "Vintage Studio A", "category": "SPACE", "price": 500.0, "styles": ["Vintage", "Portrait"], "rating": 4.8, "location": "Hanoi"},
                    {"id": "space-2", "name": "Modern Minimalist Studio", "category": "SPACE", "price": 1000.0, "styles": ["Fashion", "Modern"], "rating": 4.5, "location": "HCM"},
                    {"id": "equip-1", "name": "Canon AE-1 Film Camera", "category": "EQUIPMENT", "price": 150.0, "styles": ["Vintage", "Street"], "rating": 4.9, "location": "Hanoi"},
                    {"id": "pkg-1", "name": "Full Daylight Studio Package", "category": "SERVICE_PACKAGE", "price": 800.0, "styles": ["Portrait", "Fashion"], "rating": 4.7, "location": "Hanoi"}
                ]


    async def get_available_resources(self, start_time: str, end_time: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        async with httpx.AsyncClient() as client:
            try:
                # Gọi Backend API lấy danh sách phòng & thiết bị rảnh
                spaces_res = await client.get(f"{self.base_url}/api/v1/spaces/available", params={"start": start_time, "end": end_time})
                equip_res = await client.get(f"{self.base_url}/api/v1/equipment/available", params={"start": start_time, "end": end_time})
                
                spaces = spaces_res.json().get("data", []) if spaces_res.status_code == 200 else []
                equipments = equip_res.json().get("data", []) if equip_res.status_code == 200 else []
                return spaces, equipments
            except httpx.RequestError:
                # Mock Data dự phòng khi chưa chạy server Backend
                mock_spaces = [
                    {"id": "space-1", "name": "Studio Tròn", "capacity": 5, "is_available": True},
                    {"id": "space-2", "name": "Studio Vuông Grande", "capacity": 20, "is_available": True}
                ]
                mock_equipments = [
                    {"id": "eq-1", "type": "LIGHT", "is_available": True, "compatible_space_ids": ["space-1", "space-2"]}
                ]
                return mock_spaces, mock_equipments
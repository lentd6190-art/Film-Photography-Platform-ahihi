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
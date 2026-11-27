import httpx
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional, Tuple

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


    async def get_historical_bookings(
        self,
        category: str,
        resource_id: Optional[str] = None,
        location: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], datetime]:
        params = {"category": category}
        if resource_id:
            params["resourceId"] = resource_id
        if location:
            params["location"] = location

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(f"{self.base_url}/api/internal/analytics/bookings", params=params, timeout=15.0)
                if res.status_code == 200:
                    payload = res.json()
                    records = payload.get("data", []) if isinstance(payload, dict) else payload
                    refreshed_str = payload.get("last_synced_at") if isinstance(payload, dict) else None
                    last_refresh = (
                        datetime.fromisoformat(refreshed_str.replace("Z", "+00:00"))
                        if refreshed_str
                        else datetime.now(timezone.utc)
                    )
                    return records, last_refresh
                return [], datetime.now(timezone.utc)
            except httpx.RequestError:
                # Mock Data 30 ngày lịch sử dự phòng khi chưa chạy server Backend
                base_date = datetime.now().date() - timedelta(days=30)
                mock_records = []
                for i in range(30):
                    d = (base_date + timedelta(days=i)).isoformat()
                    count = (i % 4) + 2  # Tạo sóng nhu cầu theo chu kỳ tuần
                    for j in range(count):
                        mock_records.append({
                            "booking_id": f"bk-mock-{i}-{j}",
                            "booking_date": d,
                            "booking_time": "09:00",
                            "resource_category": category,
                            "resource_id": resource_id or "space-1",
                            "location": location or "HCM",
                            "status": "COMPLETED",
                            "duration_hours": 2.0
                        })
                return mock_records, datetime.now(timezone.utc)
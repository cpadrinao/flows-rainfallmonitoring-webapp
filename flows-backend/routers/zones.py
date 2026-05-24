"""
F.L.O.W.S. — Zones Router
GET /zones         — List all active zones
GET /zones/{id}    — Get a single zone
POST /zones        — Create a new zone (admin)
PATCH /zones/{id}  — Update a zone (admin)
DELETE /zones/{id} — Soft-delete a zone (admin)
"""

from fastapi import APIRouter, HTTPException
from services.supabase_client import get_client

router = APIRouter()


@router.get("/")
async def list_zones():
    """Return all active zones."""
    async with get_client() as client:
        res = await client.get("/zones", params={"is_active": "eq.true", "order": "created_at.asc"})
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json()


@router.get("/{zone_id}")
async def get_zone(zone_id: str):
    """Return a single zone by ID."""
    async with get_client() as client:
        res = await client.get("/zones", params={"id": f"eq.{zone_id}"})
        data = res.json()
        if not data:
            raise HTTPException(status_code=404, detail="Zone not found")
        return data[0]


@router.post("/", status_code=201)
async def create_zone(zone_data: dict):
    """Create a new zone in Supabase."""
    async with get_client() as client:
        payload = {
            "name": zone_data.get("name"),
            "latitude": float(zone_data.get("latitude")),
            "longitude": float(zone_data.get("longitude")),
            "description": zone_data.get("description", ""),
            "is_active": True,
            "alert_level": "Green",
        }
        res = await client.post("/zones", json=payload)
        if res.status_code not in (200, 201):
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json()


@router.patch("/{zone_id}")
async def update_zone(zone_id: str, zone_data: dict):
    """Update zone parameters in Supabase."""
    async with get_client() as client:
        payload = {}
        if "name" in zone_data:
            payload["name"] = zone_data["name"]
        if "latitude" in zone_data:
            payload["latitude"] = float(zone_data["latitude"])
        if "longitude" in zone_data:
            payload["longitude"] = float(zone_data["longitude"])
        if "description" in zone_data:
            payload["description"] = zone_data["description"]
        if "alert_level" in zone_data:
            payload["alert_level"] = zone_data["alert_level"]
        if "is_active" in zone_data:
            payload["is_active"] = bool(zone_data["is_active"])

        res = await client.patch(
            "/zones",
            params={"id": f"eq.{zone_id}"},
            json=payload,
        )
        if res.status_code not in (200, 201, 204):
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return {"status": "updated"}


@router.delete("/{zone_id}")
async def delete_zone(zone_id: str):
    """Permanently delete a zone and its associated weather logs from Supabase."""
    async with get_client() as client:
        # Step 1: Permanently delete associated weather logs first to prevent foreign key constraint violations
        await client.delete(
            "/weather_logs",
            params={"zone_id": f"eq.{zone_id}"},
        )

        # Step 2: Permanently delete the zone from the zones table
        res = await client.delete(
            "/zones",
            params={"id": f"eq.{zone_id}"},
        )
        if res.status_code not in (200, 201, 204):
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return {"status": "deleted"}

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

"""
F.L.O.W.S. — Alerts Router
GET /alerts/active  — All currently active alert events
GET /alerts/history — All alert events (history)
"""

from fastapi import APIRouter, HTTPException
from services.supabase_client import get_client

router = APIRouter()


@router.get("/active")
async def get_active_alerts():
    """Return all currently active alert events."""
    async with get_client() as client:
        res = await client.get(
            "/alert_events",
            params={
                "is_active": "eq.true",
                "order": "triggered_at.desc",
            },
        )
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json()


@router.get("/history")
async def get_alert_history(limit: int = 50):
    """Return alert event history, newest first."""
    async with get_client() as client:
        res = await client.get(
            "/alert_events",
            params={
                "order": "triggered_at.desc",
                "limit": limit,
            },
        )
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json()

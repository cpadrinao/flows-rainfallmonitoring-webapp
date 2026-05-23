"""
F.L.O.W.S. — Weather Router
GET /weather/summary        — All zones with latest weather (used by frontend)
GET /weather/logs           — Recent weather logs (paginated)
GET /weather/logs/{zone_id} — Logs for a specific zone
GET /weather/current        — Latest record per active zone
"""

from fastapi import APIRouter, HTTPException, Query
from services.supabase_client import get_client

router = APIRouter()


@router.get("/summary")
async def get_weather_summary():
    """
    Returns all active zones with their latest weather log and 24-hour
    precipitation trend. Single endpoint for the frontend dashboard.
    """
    async with get_client() as client:
        # Fetch all active zones
        zones_res = await client.get(
            "/zones",
            params={"is_active": "eq.true", "order": "created_at.asc"},
        )
        if zones_res.status_code != 200:
            raise HTTPException(status_code=zones_res.status_code, detail=zones_res.text)
        zones = zones_res.json()

        summary = []
        for zone in zones:
            # Fetch the 24 hourly logs from the most recent fetch cycle, sorted chronologically
            logs_res = await client.get(
                "/weather_logs",
                params={
                    "zone_id": f"eq.{zone['id']}",
                    "order": "fetched_at.desc,forecast_time.asc",
                    "limit": 24,
                },
            )
            logs = logs_res.json() if logs_res.status_code == 200 else []

            # Find the log corresponding to the current/active hour (closest to now)
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            latest = None
            if logs:
                try:
                    # Find the record whose forecast_time is closest to the current UTC time
                    latest = min(
                        logs,
                        key=lambda log: abs((datetime.fromisoformat(log["forecast_time"].replace("Z", "+00:00")) - now).total_seconds())
                    )
                except Exception as e:
                    print(f"[Weather Summary] Error finding closest forecast log: {e}")
                    latest = logs[-1]
            hourly_precip = [round(log.get("precipitation_mm") or 0, 2) for log in logs]

            summary.append({
                "zone": zone,
                "latest_log": latest,
                "hourly_precip": hourly_precip,
            })

        return summary



@router.get("/logs")
async def get_weather_logs(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
):
    """Return recent weather log entries, newest first."""
    async with get_client() as client:
        res = await client.get(
            "/weather_logs",
            params={
                "order": "fetched_at.desc",
                "limit": limit,
                "offset": offset,
            },
        )
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json()


@router.get("/logs/{zone_id}")
async def get_zone_weather_logs(zone_id: str, limit: int = Query(default=24, le=100)):
    """Return weather logs for a specific zone."""
    async with get_client() as client:
        res = await client.get(
            "/weather_logs",
            params={
                "zone_id": f"eq.{zone_id}",
                "order": "fetched_at.desc",
                "limit": limit,
            },
        )
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json()


@router.get("/current")
async def get_current_weather():
    """Return the most recent weather log entry per zone."""
    async with get_client() as client:
        # Get latest record ordered by fetched_at
        res = await client.get(
            "/weather_logs",
            params={
                "order": "fetched_at.desc",
                "limit": 10,
            },
        )
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return res.json()

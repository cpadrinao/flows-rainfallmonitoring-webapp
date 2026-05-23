"""
F.L.O.W.S. — APScheduler Cron Job (Step 8)
Runs the full data pipeline every hour (configurable via .env):
  1. Fetch all active zones from Supabase
  2. Call Open-Meteo API for each zone
  3. Bulk insert weather records into weather_logs
  4. Run alert engine to evaluate threshold levels
"""

import asyncio
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from config import settings
from services.supabase_client import get_client
from services.open_meteo import fetch_all_zones
from services.alert_engine import process_alerts_for_all_zones


async def fetch_active_zones() -> list[dict]:
    """Retrieve all active zones from Supabase."""
    async with get_client() as client:
        res = await client.get(
            "/zones",
            params={"is_active": "eq.true", "select": "id,name,latitude,longitude"},
        )
        if res.status_code != 200:
            print(f"[Scheduler] ERROR fetching zones: {res.text}")
            return []
        return res.json()


async def bulk_insert_weather_logs(records: list[dict]) -> None:
    """Bulk insert all weather records into weather_logs table."""
    if not records:
        print("[Scheduler] No records to insert.")
        return

    async with get_client() as client:
        res = await client.post("/weather_logs", json=records)
        if res.status_code in (200, 201):
            print(f"[Scheduler] [OK] Inserted {len(records)} weather log records.")
        else:
            print(f"[Scheduler] [FAIL] Insert failed ({res.status_code}): {res.text}")


async def run_pipeline() -> None:
    """
    Full data pipeline — runs every FETCH_INTERVAL_MINUTES.
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"\n{'='*60}")
    print(f"[Scheduler] Pipeline started at {now}")
    print(f"{'='*60}")

    # Step 1: Get all active zones
    zones = await fetch_active_zones()
    if not zones:
        print("[Scheduler] No active zones found. Skipping this cycle.")
        return
    print(f"[Scheduler] Found {len(zones)} active zone(s).")

    # Step 2: Fetch weather data from Open-Meteo
    weather_records = await fetch_all_zones(zones)
    if not weather_records:
        print("[Scheduler] No weather data returned. Skipping insert.")
        return

    # Step 3: Insert into Supabase weather_logs
    await bulk_insert_weather_logs(weather_records)

    # Step 4: Run alert engine
    print("[Scheduler] Running alert engine...")
    await process_alerts_for_all_zones(weather_records)

    print(f"[Scheduler] [OK] Pipeline complete. Next run in {settings.FETCH_INTERVAL_MINUTES} minute(s).\n")


def start_scheduler() -> AsyncIOScheduler:
    """
    Create and start the APScheduler instance.
    Returns the scheduler so it can be managed by the FastAPI lifespan.
    """
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_pipeline,
        trigger=IntervalTrigger(minutes=settings.FETCH_INTERVAL_MINUTES),
        id="weather_fetch_job",
        name="Hourly Weather Fetch + Alert Processing",
        replace_existing=True,
        max_instances=1,  # Prevent overlap if a run takes longer than expected
    )
    scheduler.start()
    print(f"[Scheduler] [OK] Started. Fetching every {settings.FETCH_INTERVAL_MINUTES} minute(s).")
    return scheduler

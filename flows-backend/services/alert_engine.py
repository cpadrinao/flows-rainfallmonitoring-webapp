"""
F.L.O.W.S. — Alert Engine (Step 7)
Determines alert levels from rainfall data based on PAGASA guidelines.
Updates zone alert_level in Supabase and inserts alert_events on level changes.

Thresholds (from backend_setup_guide.txt Part 6):
  GREEN  : 0.0  – 7.4  mm/hr — Normal monitoring
  YELLOW : 7.5  – 14.9 mm/hr — Monitor closely, prepare residents
  ORANGE : 15.0 – 29.9 mm/hr — Activate evacuation standby
  RED    : 30.0+       mm/hr — Immediate evacuation warning
"""

from services.supabase_client import get_client

# ─── Thresholds ───────────────────────────────────────────────────────────────
THRESHOLDS = {
    "Red":    30.0,
    "Orange": 15.0,
    "Yellow": 7.5,
    "Green":  0.0,
}

ADVISORY_MESSAGES = {
    "Green":  "Weather conditions are normal. No immediate action required. Continue regular monitoring.",
    "Yellow": "Moderate rainfall detected. Residents are advised to monitor updates closely and prepare early.",
    "Orange": "Heavy rainfall detected. Evacuation standby is now active. Barangay officials should be on alert.",
    "Red":    "CRITICAL: Extreme rainfall recorded. Immediate evacuation is strongly advised for residents in flood-prone areas.",
}


def determine_alert_level(precipitation_mm: float | None) -> str:
    """Return the alert level based on hourly precipitation in mm."""
    if precipitation_mm is None:
        return "Green"
    if precipitation_mm >= THRESHOLDS["Red"]:
        return "Red"
    if precipitation_mm >= THRESHOLDS["Orange"]:
        return "Orange"
    if precipitation_mm >= THRESHOLDS["Yellow"]:
        return "Yellow"
    return "Green"


async def get_current_zone_alert(zone_id: str) -> str:
    """Fetch the current alert_level for a zone from Supabase."""
    async with get_client() as client:
        res = await client.get("/zones", params={"id": f"eq.{zone_id}", "select": "alert_level"})
        data = res.json()
        if data:
            return data[0].get("alert_level", "GREEN")
    return "GREEN"


async def update_zone_alert_level(zone_id: str, new_level: str) -> None:
    """Update the alert_level field on the zone record."""
    async with get_client() as client:
        await client.patch(
            f"/zones?id=eq.{zone_id}",
            json={"alert_level": new_level},
        )


async def insert_alert_event(zone_id: str, alert_level: str, trigger_value: float) -> None:
    """Insert a new alert event into alert_events table."""
    async with get_client() as client:
        await client.post(
            "/alert_events",
            json={
                "zone_id": zone_id,
                "alert_level": alert_level,
                "trigger_value": trigger_value,
                "message": ADVISORY_MESSAGES[alert_level],
                "is_active": True,
            },
        )


async def resolve_previous_alerts(zone_id: str) -> None:
    """Mark all previous active alerts for this zone as resolved."""
    from datetime import datetime, timezone
    async with get_client() as client:
        await client.patch(
            f"/alert_events?zone_id=eq.{zone_id}&is_active=eq.true",
            json={
                "is_active": False,
                "resolved_at": datetime.now(timezone.utc).isoformat(),
            },
        )


async def process_alert_for_zone(zone_id: str, precipitation_mm: float | None) -> str:
    """
    Main alert processing function for a single zone.
    - Calculates the new alert level from precipitation.
    - If level changed: updates zone, resolves old events, inserts new event.
    - Returns the new alert level.
    """
    new_level = determine_alert_level(precipitation_mm)
    current_level = await get_current_zone_alert(zone_id)

    if new_level != current_level:
        print(f"[Alert Engine] Zone {zone_id}: {current_level} → {new_level} (rain: {precipitation_mm} mm)")

        # Resolve old alerts if stepping down
        if current_level != "GREEN":
            await resolve_previous_alerts(zone_id)

        # Insert new alert event (even for GREEN so history is complete)
        await insert_alert_event(zone_id, new_level, precipitation_mm or 0.0)

        # Update the zone's alert_level
        await update_zone_alert_level(zone_id, new_level)
    else:
        print(f"[Alert Engine] Zone {zone_id}: No change ({new_level}, rain: {precipitation_mm} mm)")

    return new_level


async def process_alerts_for_all_zones(weather_records: list[dict]) -> None:
    """
    Process alert logic for all weather records fetched in a single cycle.
    Uses the LATEST record per zone (highest precipitation in current fetch).
    """
    # Group by zone_id, find max precipitation per zone
    zone_max: dict[str, float | None] = {}
    for record in weather_records:
        zone_id = record["zone_id"]
        precip = record.get("precipitation_mm")
        if zone_id not in zone_max or (precip is not None and (zone_max[zone_id] is None or precip > zone_max[zone_id])):
            zone_max[zone_id] = precip

    for zone_id, max_precip in zone_max.items():
        await process_alert_for_zone(zone_id, max_precip)

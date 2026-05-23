"""
F.L.O.W.S. — Open-Meteo Fetch Service (Step 6)
Fetches hourly weather forecast data for each zone.
No API key needed — Open-Meteo is free.

Variables fetched (per backend_setup_guide.txt):
  MUST HAVE:    precipitation, precipitation_probability
  SHOULD HAVE:  temperature_2m, relative_humidity_2m, weather_code,
                cloud_cover, wind_speed_10m, wind_direction_10m
  NICE TO HAVE: visibility
"""

import httpx
from datetime import datetime, timezone

OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"

# All recommended hourly variables (in order from the guide)
HOURLY_VARIABLES = ",".join([
    # MUST HAVE
    "precipitation",
    "precipitation_probability",
    # SHOULD HAVE
    "temperature_2m",
    "relative_humidity_2m",
    "weather_code",
    "cloud_cover",
    "wind_speed_10m",
    "wind_direction_10m",
    # NICE TO HAVE
    "visibility",
])


async def fetch_weather_for_zone(zone_id: str, latitude: float, longitude: float) -> list[dict]:
    """
    Fetch today's hourly forecast from Open-Meteo for a single zone.
    Returns a list of weather_log records ready to insert into Supabase.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": HOURLY_VARIABLES,
        "timezone": "Asia/Manila",
        "forecast_days": 1,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(OPEN_METEO_BASE, params=params)
        response.raise_for_status()
        data = response.json()

    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    fetched_at = datetime.now(timezone.utc).isoformat()

    records = []
    for i, forecast_time in enumerate(times):
        record = {
            "zone_id": zone_id,
            "fetched_at": fetched_at,
            "forecast_time": forecast_time,
            # MUST HAVE
            "precipitation_mm": hourly.get("precipitation", [None] * len(times))[i],
            "precipitation_prob": hourly.get("precipitation_probability", [None] * len(times))[i],
            # SHOULD HAVE
            "temperature_c": hourly.get("temperature_2m", [None] * len(times))[i],
            "relative_humidity": hourly.get("relative_humidity_2m", [None] * len(times))[i],
            "weather_code": hourly.get("weather_code", [None] * len(times))[i],
            "cloud_cover_pct": hourly.get("cloud_cover", [None] * len(times))[i],
            "wind_speed_kmh": hourly.get("wind_speed_10m", [None] * len(times))[i],
            "wind_direction_deg": hourly.get("wind_direction_10m", [None] * len(times))[i],
            # NICE TO HAVE
            "visibility_m": hourly.get("visibility", [None] * len(times))[i],
            # Default validation status
            "validation_status": "PASSED",
            "validation_notes": None,
        }
        records.append(record)

    return records


async def fetch_all_zones(zones: list[dict]) -> list[dict]:
    """
    Fetch weather data for all active zones.
    zones: list of dicts with keys: id, name, latitude, longitude
    Returns all records combined (ready for bulk insert).
    """
    all_records = []
    for zone in zones:
        try:
            records = await fetch_weather_for_zone(
                zone_id=zone["id"],
                latitude=float(zone["latitude"]),
                longitude=float(zone["longitude"]),
            )
            all_records.extend(records)
            print(f"[Open-Meteo] OK Fetched {len(records)} records for: {zone.get('name', zone['id'])}")
        except httpx.HTTPStatusError as e:
            print(f"[Open-Meteo] ✗ HTTP error for zone {zone.get('name')}: {e.response.status_code}")
        except Exception as e:
            print(f"[Open-Meteo] ✗ Error for zone {zone.get('name')}: {e}")

    return all_records

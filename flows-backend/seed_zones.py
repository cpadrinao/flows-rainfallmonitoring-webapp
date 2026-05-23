"""
F.L.O.W.S. — Zone Seeder Script
Seeds the 5 Barangay Rizal monitoring zones into Supabase.

Run once AFTER creating the `zones` table in Supabase:
    python seed_zones.py

Zones are based on coordinates provided by the project team.
"""

import asyncio
import sys
import os

# Allow running from the flows-backend directory
sys.path.insert(0, os.path.dirname(__file__))

from services.supabase_client import get_client


ZONES = [
    {
        "name": "Zone 1 - Riverside",
        "latitude": 13.561273,
        "longitude": 123.142923,
        "description": "Zone 1 monitoring station near the riverside area of Barangay Rizal.",
        "is_active": True,
        "alert_level": "Green",
    },
    {
        "name": "Zone 2 - Upper Barangay",
        "latitude": 13.564380,
        "longitude": 123.145173,
        "description": "Zone 2 monitoring station at the upper area of Barangay Rizal.",
        "is_active": True,
        "alert_level": "Green",
    },
    {
        "name": "Zone 3 - Central Zone",
        "latitude": 13.563990,
        "longitude": 123.145736,
        "description": "Zone 3 central monitoring station in Barangay Rizal.",
        "is_active": True,
        "alert_level": "Green",
    },
    {
        "name": "Zone 4 - Hillside",
        "latitude": 13.563060,
        "longitude": 123.144900,
        "description": "Zone 4 monitoring station on the hillside area of Barangay Rizal.",
        "is_active": True,
        "alert_level": "Green",
    },
    {
        "name": "Zone 5 - Lowland",
        "latitude": 13.562074,
        "longitude": 123.145277,
        "description": "Zone 5 monitoring station in the lowland area of Barangay Rizal.",
        "is_active": True,
        "alert_level": "Green",
    },
]


async def seed_zones():
    print("=" * 60)
    print("F.L.O.W.S. — Zone Seeder")
    print("=" * 60)

    async with get_client() as client:
        for zone in ZONES:
            # Check if zone already exists by name
            check = await client.get("/zones", params={"name": f"eq.{zone['name']}"})
            existing = check.json()

            if existing:
                print(f"[SKIP]    {zone['name']} already exists.")
                continue

            # Insert new zone
            res = await client.post("/zones", json=zone)
            if res.status_code in (200, 201):
                created = res.json()
                zone_id = created[0]["id"] if isinstance(created, list) else created.get("id", "?")
                print(f"[CREATED] {zone['name']} — ID: {zone_id}")
            else:
                print(f"[ERROR]   {zone['name']} — {res.status_code}: {res.text}")

    print("\nZone seeding complete.")


if __name__ == "__main__":
    asyncio.run(seed_zones())

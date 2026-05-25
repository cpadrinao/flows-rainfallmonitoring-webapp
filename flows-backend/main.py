"""
F.L.O.W.S. — FastAPI Main Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from routers import zones, weather, alerts
from scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"[F.L.O.W.S.] Backend starting up...")
    print(f"[F.L.O.W.S.] Supabase URL: {settings.SUPABASE_URL}")
    print(f"[F.L.O.W.S.] Fetch interval: every {settings.FETCH_INTERVAL_MINUTES} min")
    
    # Start scheduler
    scheduler = start_scheduler()
    
    # Trigger an immediate weather data fetch on startup in the background
    import asyncio
    from scheduler import run_pipeline
    asyncio.create_task(run_pipeline())
    
    yield
    # Shutdown
    scheduler.shutdown()
    print("[F.L.O.W.S.] Backend shutting down...")


app = FastAPI(
    title="F.L.O.W.S. API",
    description="Flood Level Observation and Warning System — Barangay Rizal Rainfall Monitoring",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend (update origin when deploying)
cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(zones.router, prefix="/zones", tags=["Zones"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "system": "F.L.O.W.S.",
        "status": "online",
        "description": "Flood Level Observation and Warning System",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    import httpx
    import time
    
    open_meteo_ok = False
    latency_ms = None
    
    try:
        start_time = time.time()
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={"latitude": 13.56, "longitude": 123.14, "hourly": "precipitation", "forecast_days": 1}
            )
            if res.status_code == 200:
                open_meteo_ok = True
                latency_ms = int((time.time() - start_time) * 1000)
    except Exception as e:
        print(f"[Health] Open-Meteo health ping failed: {e}")
        
    return {
        "status": "ok",
        "open_meteo": {
            "status": "healthy" if open_meteo_ok else "unreachable",
            "latency_ms": latency_ms,
            "endpoint": "https://api.open-meteo.com/v1/forecast"
        }
    }


@app.post("/pipeline/trigger", tags=["Pipeline"])
async def trigger_pipeline():
    """
    Manually trigger the weather fetch pipeline (useful for first-run / testing).
    Runs asynchronously in the background.
    """
    import asyncio
    from scheduler import run_pipeline
    asyncio.create_task(run_pipeline())
    return {"status": "triggered", "message": "Pipeline is running in the background."}

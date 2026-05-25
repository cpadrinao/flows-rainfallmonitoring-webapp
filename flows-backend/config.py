"""
F.L.O.W.S. — App Configuration
Loads and validates all environment variables using Pydantic Settings.
Fails fast on startup if any required variable is missing.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str
    OPEN_METEO_LAT: float = 14.0860
    OPEN_METEO_LON: float = 121.1000
    TIMEZONE: str = "Asia/Manila"
    FETCH_INTERVAL_MINUTES: int = 60
    CORS_ORIGINS: str = (
        "http://localhost:3000,"
        "http://localhost:3001,"
        "http://localhost:3002,"
        "http://localhost:3003,"
        "http://localhost:3004,"
        "http://localhost:3005,"
        "http://127.0.0.1:3000,"
        "http://127.0.0.1:3001,"
        "http://127.0.0.1:3002,"
        "http://127.0.0.1:3003,"
        "http://127.0.0.1:3004,"
        "http://127.0.0.1:3005"
    )

    model_config = {"env_file": ".env"}


settings = Settings()

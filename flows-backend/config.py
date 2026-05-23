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

    model_config = {"env_file": ".env"}


settings = Settings()

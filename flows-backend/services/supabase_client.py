"""
F.L.O.W.S. — Supabase Client
Uses httpx directly against the Supabase REST API.
(supabase-py is incompatible with Python 3.14 on Windows due to pyiceberg build requirements)
"""

import httpx
from config import settings

# Base REST URL for all table operations
REST_BASE = f"{settings.SUPABASE_URL}/rest/v1"

# Headers for backend (service role = full access)
SERVICE_HEADERS = {
    "apikey": settings.SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# Headers for public reads (anon key = read-only)
ANON_HEADERS = {
    "apikey": settings.SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
}


def get_client(use_service_key: bool = True) -> httpx.AsyncClient:
    """
    Returns an async httpx client pre-configured with the correct Supabase headers.
    Use use_service_key=True for backend writes, False for public reads.
    """
    headers = SERVICE_HEADERS if use_service_key else ANON_HEADERS
    return httpx.AsyncClient(base_url=REST_BASE, headers=headers, timeout=15.0)

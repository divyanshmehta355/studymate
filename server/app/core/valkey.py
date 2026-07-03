import json
import logging
from valkey.asyncio import Valkey, from_url
from typing import Any, Optional
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Global valkey pool
valkey_client: Optional[Valkey] = None

async def init_valkey():
    """Initialize the global Valkey connection pool."""
    global valkey_client
    if settings.VALKEY_URL:
        try:
            # We use decode_responses=True to automatically get strings instead of bytes
            # We add ssl_cert_reqs="none" for Aiven's valkeys:// connections to prevent certificate validation errors
            valkey_client = from_url(settings.VALKEY_URL, decode_responses=True, ssl_cert_reqs="none")
            # Test connection
            await valkey_client.ping()
            logger.info("Successfully connected to Aiven Valkey")
        except Exception as e:
            logger.error(f"Failed to connect to Aiven Valkey: {e}")
            valkey_client = None

async def close_valkey():
    """Close the Valkey connection pool."""
    global valkey_client
    if valkey_client:
        await valkey_client.close()
        valkey_client = None

async def get_cache(key: str) -> Optional[Any]:
    """Retrieve a JSON-parsed value from Valkey if it exists."""
    if not valkey_client:
        return None
    
    try:
        data = await valkey_client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.warning(f"Failed to get cache for {key}: {e}")
    return None

async def set_cache(key: str, value: Any, expire_seconds: int = 86400):
    """Save a value to Valkey as JSON with an expiration time."""
    if not valkey_client:
        return
        
    try:
        await valkey_client.set(
            key,
            json.dumps(value),
            ex=expire_seconds
        )
    except Exception as e:
        logger.warning(f"Failed to set cache for {key}: {e}")

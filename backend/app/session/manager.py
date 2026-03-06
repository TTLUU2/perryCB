from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from app.config import get_settings
from app.session.models import SessionState

logger = logging.getLogger(__name__)

# In-memory fallback store
_memory_store: dict[str, str] = {}

_redis_client = None


def _get_redis():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    settings = get_settings()
    if not settings.redis_url:
        return None
    try:
        import redis
        _redis_client = redis.Redis.from_url(settings.redis_url, decode_responses=True)
        _redis_client.ping()
        logger.info("Connected to Redis at %s", settings.redis_url)
        return _redis_client
    except Exception:
        logger.warning("Redis unavailable — using in-memory session store")
        _redis_client = None
        return None


def _session_key(session_id: str) -> str:
    return f"pg:session:{session_id}"


async def create_session(session_id: str | None = None) -> SessionState:
    session = SessionState()
    if session_id:
        session.session_id = session_id
    await save_session(session)
    logger.info("Created session %s", session.session_id)
    return session


async def get_session(session_id: str) -> SessionState | None:
    settings = get_settings()
    key = _session_key(session_id)
    r = _get_redis()
    raw: str | None = None
    if r:
        raw = r.get(key)
    else:
        raw = _memory_store.get(key)
    if raw is None:
        return None
    session = SessionState.model_validate_json(raw)
    # Check TTL expiry for in-memory store
    if r is None:
        last = datetime.fromisoformat(session.last_active)
        elapsed = (datetime.now(timezone.utc) - last).total_seconds()
        if elapsed > settings.session_ttl:
            _memory_store.pop(key, None)
            return None
    return session


async def save_session(session: SessionState) -> None:
    settings = get_settings()
    key = _session_key(session.session_id)
    data = session.model_dump_json()
    r = _get_redis()
    if r:
        r.setex(key, settings.session_ttl, data)
    else:
        _memory_store[key] = data


async def delete_session(session_id: str) -> None:
    key = _session_key(session_id)
    r = _get_redis()
    if r:
        r.delete(key)
    else:
        _memory_store.pop(key, None)
    logger.info("Deleted session %s", session_id)

"""Structured analytics logging for Points Genie conversations."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from app.session.models import SessionState

logger = logging.getLogger("points_genie.analytics")


# ---------------------------------------------------------------------------
# Redis-backed persistent counters
# ---------------------------------------------------------------------------

def _get_redis():
    """Reuse the Redis client from session manager."""
    from app.session.manager import _get_redis as _mgr_get_redis
    return _mgr_get_redis()


def record_session() -> None:
    """Increment total session counter."""
    try:
        r = _get_redis()
        if r:
            r.incr("pg:stats:sessions")
    except Exception:
        logger.debug("record_session failed", exc_info=True)


def record_turn() -> None:
    """Increment total turn counter."""
    try:
        r = _get_redis()
        if r:
            r.incr("pg:stats:turns")
    except Exception:
        logger.debug("record_turn failed", exc_info=True)


def record_intent(intent: str) -> None:
    """Increment counter for a specific intent."""
    try:
        r = _get_redis()
        if r:
            r.hincrby("pg:stats:intents", intent, 1)
    except Exception:
        logger.debug("record_intent failed", exc_info=True)


def record_suggestion_click(label: str) -> None:
    """Increment counter for a suggestion chip click."""
    try:
        r = _get_redis()
        if r:
            r.hincrby("pg:stats:suggestions", label, 1)
    except Exception:
        logger.debug("record_suggestion_click failed", exc_info=True)


def record_cta_shown(cta_id: str) -> None:
    """Increment counter for a CTA shown to user."""
    try:
        r = _get_redis()
        if r:
            r.hincrby("pg:stats:cta_shown", cta_id, 1)
    except Exception:
        logger.debug("record_cta_shown failed", exc_info=True)


def record_cta_click(cta_id: str) -> None:
    """Increment counter for a CTA clicked by user."""
    try:
        r = _get_redis()
        if r:
            r.hincrby("pg:stats:cta_clicked", cta_id, 1)
    except Exception:
        logger.debug("record_cta_click failed", exc_info=True)


def record_flow_completion(intent: str) -> None:
    """Increment counter for a completed flow."""
    try:
        r = _get_redis()
        if r:
            r.hincrby("pg:stats:flow_completed", intent, 1)
    except Exception:
        logger.debug("record_flow_completion failed", exc_info=True)


def record_handover(from_to: str) -> None:
    """Increment counter for a flow handover (e.g. 'LEARNING→CARD_MATCH')."""
    try:
        r = _get_redis()
        if r:
            r.hincrby("pg:stats:handovers", from_to, 1)
    except Exception:
        logger.debug("record_handover failed", exc_info=True)


def record_first_question(message: str) -> None:
    """Push first user message to a capped list (most recent 200)."""
    try:
        r = _get_redis()
        if r:
            r.lpush("pg:stats:questions", message[:500])
            r.ltrim("pg:stats:questions", 0, 199)
    except Exception:
        logger.debug("record_first_question failed", exc_info=True)


def get_analytics_summary() -> dict[str, Any]:
    """Read all analytics keys from Redis and return a summary dict."""
    r = _get_redis()
    if not r:
        return {
            "total_sessions": 0,
            "total_turns": 0,
            "intents": {},
            "suggestions_clicked": {},
            "ctas_shown": {},
            "ctas_clicked": {},
            "flow_completions": {},
            "handovers": {},
            "recent_questions": [],
        }
    try:
        return {
            "total_sessions": int(r.get("pg:stats:sessions") or 0),
            "total_turns": int(r.get("pg:stats:turns") or 0),
            "intents": r.hgetall("pg:stats:intents") or {},
            "suggestions_clicked": r.hgetall("pg:stats:suggestions") or {},
            "ctas_shown": r.hgetall("pg:stats:cta_shown") or {},
            "ctas_clicked": r.hgetall("pg:stats:cta_clicked") or {},
            "flow_completions": r.hgetall("pg:stats:flow_completed") or {},
            "handovers": r.hgetall("pg:stats:handovers") or {},
            "recent_questions": r.lrange("pg:stats:questions", 0, 199) or [],
        }
    except Exception:
        logger.warning("get_analytics_summary failed", exc_info=True)
        return {
            "total_sessions": 0,
            "total_turns": 0,
            "intents": {},
            "suggestions_clicked": {},
            "ctas_shown": {},
            "ctas_clicked": {},
            "flow_completions": {},
            "handovers": {},
            "recent_questions": [],
        }


def log_conversation_end(session: SessionState) -> None:
    """Log a structured analytics event when a conversation ends or reaches a checkpoint."""
    event = {
        "event": "conversation_summary",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "session_id": session.session_id,
        "created_at": session.created_at,
        "detected_intent": session.intent.primary.value if session.intent.primary else None,
        "intent_confidence": session.intent.confidence,
        "slots_collected": [
            k for k, v in session.slots.model_dump().items()
            if v is not None and v != [] and k != "origin"
        ],
        "turns": session.turn_count,
        "ctas_shown": session.analytics.ctas_shown,
        "ctas_clicked": session.analytics.ctas_clicked,
        "cards_recommended": session.analytics.cards_recommended,
        "flow_completed": session.analytics.flow_completed,
        "handover_count": session.analytics.handover_count,
        "handover_history": session.analytics.handover_history,
        "page_url": session.page_context.page_url,
        "page_type": session.page_context.page_type,
        "device": session.page_context.device,
        "off_topic_count": session.off_topic_count,
    }

    logger.info(json.dumps(event))


def log_turn_event(
    session_id: str,
    turn_number: int,
    intent: str | None,
    tools_called: list[str],
    cta_shown: str | None,
) -> None:
    """Log a per-turn analytics event."""
    event = {
        "event": "turn",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "session_id": session_id,
        "turn_number": turn_number,
        "intent": intent,
        "tools_called": tools_called,
        "cta_shown": cta_shown,
    }

    logger.info(json.dumps(event))


def log_cta_click(session_id: str, cta_id: str) -> None:
    """Log a CTA click event."""
    event = {
        "event": "cta_click",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "session_id": session_id,
        "cta_id": cta_id,
    }

    logger.info(json.dumps(event))

"""Structured analytics logging for Points Genie conversations."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from app.session.models import SessionState

logger = logging.getLogger("points_genie.analytics")


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

from __future__ import annotations

import json
import logging
from typing import Any

from app.llm.client import create_message
from app.session.models import Intent, PageContext

logger = logging.getLogger(__name__)

INTENT_CLASSIFICATION_PROMPT = """Classify the user's primary intent from their message. Return ONLY a JSON object, no other text.

Intents:
- LEARNING: User wants to understand how points work, is a beginner, wants education
- CARD_MATCH: User wants a credit card recommendation, wants to earn points, has a trip goal
- SEAT_ALERTS: User wants to find or track reward seat availability
- ARTICLE_FOLLOWUP: User is asking about a concept or something they read
- OTHER: Doesn't fit the above

Rules:
- If the message mentions a specific trip destination AND earning points → CARD_MATCH
- If the message is only about finding/tracking seats (not earning) → SEAT_ALERTS
- If the message is a general "how does X work" question → check if X is about earning (LEARNING) or a specific concept (ARTICLE_FOLLOWUP)
- When in doubt between CARD_MATCH and LEARNING → choose CARD_MATCH
- If the message is off-topic (weather, cooking, sports, etc.) → OTHER

Return format:
{"intent": "CARD_MATCH", "confidence": 0.92, "reasoning": "brief reason"}"""

# Page type → intent confidence boost mapping
PAGE_BOOSTS: dict[str, Intent] = {
    "card_review": Intent.CARD_MATCH,
    "seat_alerts": Intent.SEAT_ALERTS,
    "guide": Intent.LEARNING,
    "article": Intent.ARTICLE_FOLLOWUP,
}

# Priority ranking (lower = higher priority)
INTENT_PRIORITY: dict[Intent, int] = {
    Intent.CARD_MATCH: 1,
    Intent.SEAT_ALERTS: 2,
    Intent.LEARNING: 3,
    Intent.ARTICLE_FOLLOWUP: 4,
    Intent.OTHER: 5,
}

CONFIDENCE_THRESHOLDS: dict[Intent, float] = {
    Intent.LEARNING: 0.70,
    Intent.CARD_MATCH: 0.70,
    Intent.SEAT_ALERTS: 0.70,
    Intent.ARTICLE_FOLLOWUP: 0.65,
    Intent.OTHER: 0.0,
}


async def classify_intent(
    user_message: str,
    page_context: PageContext,
) -> dict[str, Any]:
    """Classify user intent via LLM call. Returns intent, confidence, reasoning."""
    system = INTENT_CLASSIFICATION_PROMPT
    if page_context.page_url:
        system += f"\n\nUser is currently on: {page_context.page_url} (page type: {page_context.page_type})"

    messages = [{"role": "user", "content": user_message}]

    try:
        response = await create_message(
            system=system,
            messages=messages,
            max_tokens=256,
        )
        text = ""
        for block in response.content:
            if hasattr(block, "text"):
                text = block.text
                break

        # Parse JSON from response
        # Handle potential markdown code blocks
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text
            text = text.rsplit("```", 1)[0]
        text = text.strip()

        result = json.loads(text)
        intent_str = result.get("intent", "OTHER")
        confidence = float(result.get("confidence", 0.5))
        reasoning = result.get("reasoning", "")

    except Exception as e:
        logger.error("Intent classification failed: %s", e)
        return {"intent": Intent.OTHER, "confidence": 0.3, "reasoning": f"Classification error: {e}"}

    # Map to enum
    try:
        intent = Intent(intent_str)
    except ValueError:
        intent = Intent.OTHER
        confidence = 0.3

    # Apply page context boost
    boost_intent = PAGE_BOOSTS.get(page_context.page_type)
    if boost_intent and boost_intent == intent:
        confidence = min(1.0, confidence + 0.15)

    # Check threshold
    threshold = CONFIDENCE_THRESHOLDS.get(intent, 0.70)
    meets_threshold = confidence >= threshold

    return {
        "intent": intent,
        "confidence": confidence,
        "reasoning": reasoning,
        "meets_threshold": meets_threshold,
    }


def resolve_ambiguous_intents(
    intent_a: Intent,
    conf_a: float,
    intent_b: Intent,
    conf_b: float,
) -> tuple[Intent, float]:
    """When two intents have similar confidence, use priority ranking."""
    if abs(conf_a - conf_b) < 0.1:
        # Similar confidence — use priority
        if INTENT_PRIORITY.get(intent_a, 5) <= INTENT_PRIORITY.get(intent_b, 5):
            return intent_a, conf_a
        return intent_b, conf_b
    # Clear winner
    if conf_a >= conf_b:
        return intent_a, conf_a
    return intent_b, conf_b

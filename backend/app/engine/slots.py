from __future__ import annotations

import json
import logging
from typing import Any

from app.llm.client import create_message
from app.session.models import Intent, SlotData

logger = logging.getLogger(__name__)

SLOT_EXTRACTION_PROMPT = """Extract structured information from the user's message. Return ONLY a JSON object with the extracted slots. Only include slots that are explicitly or clearly implied in the message — do not guess.

Available slots:
- destination: city or country (string)
- origin: Australian city they're flying from (string)
- travellers: number of people (integer)
- airline_preference: "qantas", "velocity", "krisflyer", or "flexible" (string). Map "Virgin" → "velocity", "Singapore Airlines" → "krisflyer"
- current_points: number of points they have (integer)
- points_program: "qantas", "velocity", "krisflyer", "amex_mr", "cba_awards" (string)
- travel_timing: when they want to travel (string, e.g. "September 2026")
- trip_type: "oneway" or "return" (string)
- cabin_class: "economy", "premium_economy", "business", or "first" (string)
- card_preferences: array of constraints like "no_amex", "low_fee", "premium_perks", "lounge_access"
- date_range_start: earliest date (string)
- date_range_end: latest date (string)
- program_interest: for beginners — "qantas", "velocity", "krisflyer", "unsure"
- focus: "earning", "using", "both", "unsure"
- max_annual_fee: maximum fee they want to pay (number)

Rules:
- "just me" or "solo" → travellers: 1
- "two of us" or "couple" → travellers: 2
- "family of 4" → travellers: 4
- If they say "business class" → cabin_class: "business"
- If no trip_type mentioned but they mention a destination → assume "return"
- "I don't want Amex" → card_preferences: ["no_amex"]
- "under $200/year" → max_annual_fee: 200
- Don't extract slots that aren't mentioned or clearly implied

Return format example:
{"destination": "Tokyo", "cabin_class": "business", "airline_preference": "qantas"}"""


async def extract_slots(
    user_message: str,
    current_intent: Intent | None = None,
    current_slots: SlotData | None = None,
) -> dict[str, Any]:
    """Extract slots from user message via LLM."""
    system = SLOT_EXTRACTION_PROMPT
    if current_intent:
        system += f"\n\nCurrent intent: {current_intent.value}"
    if current_slots:
        existing = {k: v for k, v in current_slots.model_dump().items() if v is not None and v != [] and v != "Sydney"}
        if existing:
            system += f"\nAlready collected: {json.dumps(existing)}"

    messages = [{"role": "user", "content": user_message}]

    try:
        response = await create_message(
            system=system,
            messages=messages,
            max_tokens=512,
        )
        text = ""
        for block in response.content:
            if hasattr(block, "text"):
                text = block.text
                break

        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text
            text = text.rsplit("```", 1)[0]
        text = text.strip()

        return json.loads(text)
    except Exception as e:
        logger.error("Slot extraction failed: %s", e)
        return {}


def merge_slots(current: SlotData, extracted: dict[str, Any]) -> tuple[SlotData, list[str]]:
    """Merge extracted slots into current, returning list of contradictions."""
    contradictions: list[str] = []
    updated = current.model_copy()

    for key, new_value in extracted.items():
        if new_value is None:
            continue
        if not hasattr(updated, key):
            continue

        old_value = getattr(updated, key)

        # Detect contradiction
        if old_value is not None and old_value != new_value:
            # Skip default values
            if key == "origin" and old_value == "Sydney":
                pass
            elif key == "trip_type" and old_value is None:
                pass
            else:
                contradictions.append(f"{key}: {old_value} → {new_value}")

        setattr(updated, key, new_value)

    return updated, contradictions

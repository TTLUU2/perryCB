"""Card data freshness checker.

Checks that card data has been reviewed/updated within the last 24 hours.
Logs warnings for stale entries and provides a summary for the health endpoint.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_DATA_PATH = Path(__file__).resolve().parent / "cards.json"
STALE_THRESHOLD_HOURS = 24


def check_card_freshness() -> dict[str, Any]:
    """Check all cards for data freshness.

    Returns a summary dict with:
      - fresh: bool — True if ALL cards updated within threshold
      - total_cards: int
      - stale_cards: list of card IDs that are overdue
      - oldest_update: ISO string of the oldest last_updated date
      - hours_since_oldest: float
      - checked_at: ISO string
    """
    now = datetime.now(timezone.utc)

    try:
        with open(_DATA_PATH) as f:
            cards = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error("Cannot read cards.json for freshness check: %s", e)
        return {
            "fresh": False,
            "error": str(e),
            "total_cards": 0,
            "stale_cards": [],
            "checked_at": now.isoformat(),
        }

    stale_cards: list[str] = []
    oldest_dt: datetime | None = None

    for card in cards:
        if not card.get("is_active", False):
            continue

        last_updated_str = card.get("last_updated")
        if not last_updated_str:
            stale_cards.append(card["card_id"])
            continue

        try:
            # last_updated is date-only (YYYY-MM-DD) — treat as start of that day UTC
            last_dt = datetime.strptime(last_updated_str, "%Y-%m-%d").replace(
                tzinfo=timezone.utc
            )
        except ValueError:
            stale_cards.append(card["card_id"])
            continue

        if oldest_dt is None or last_dt < oldest_dt:
            oldest_dt = last_dt

        hours_since = (now - last_dt).total_seconds() / 3600
        if hours_since > STALE_THRESHOLD_HOURS:
            stale_cards.append(card["card_id"])

    hours_since_oldest = (
        (now - oldest_dt).total_seconds() / 3600 if oldest_dt else None
    )

    is_fresh = len(stale_cards) == 0

    result = {
        "fresh": is_fresh,
        "total_cards": len([c for c in cards if c.get("is_active")]),
        "stale_cards": stale_cards,
        "stale_count": len(stale_cards),
        "oldest_update": oldest_dt.isoformat() if oldest_dt else None,
        "hours_since_oldest": round(hours_since_oldest, 1) if hours_since_oldest else None,
        "threshold_hours": STALE_THRESHOLD_HOURS,
        "checked_at": now.isoformat(),
    }

    # Log appropriately
    if not is_fresh:
        logger.warning(
            "STALE CARD DATA: %d/%d cards not updated in %dh — %s",
            len(stale_cards),
            result["total_cards"],
            STALE_THRESHOLD_HOURS,
            ", ".join(stale_cards[:5]) + ("..." if len(stale_cards) > 5 else ""),
        )
    else:
        logger.info(
            "Card data freshness OK: %d cards, oldest update %.1fh ago",
            result["total_cards"],
            hours_since_oldest or 0,
        )

    return result


def get_stale_card_details() -> list[dict[str, Any]]:
    """Return detailed info for stale cards so an operator can act on them."""
    now = datetime.now(timezone.utc)

    try:
        with open(_DATA_PATH) as f:
            cards = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

    stale: list[dict[str, Any]] = []
    for card in cards:
        if not card.get("is_active", False):
            continue

        last_updated_str = card.get("last_updated", "")
        try:
            last_dt = datetime.strptime(last_updated_str, "%Y-%m-%d").replace(
                tzinfo=timezone.utc
            )
            hours_ago = (now - last_dt).total_seconds() / 3600
        except ValueError:
            hours_ago = float("inf")

        if hours_ago > STALE_THRESHOLD_HOURS:
            stale.append({
                "card_id": card["card_id"],
                "card_name": card["card_name"],
                "last_updated": last_updated_str,
                "hours_since_update": round(hours_ago, 1),
                "review_url": card.get("point_hacks_review_url", ""),
            })

    stale.sort(key=lambda c: c["hours_since_update"], reverse=True)
    return stale

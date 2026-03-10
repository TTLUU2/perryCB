from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.knowledge.cards import get_card_by_id

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "ctas.json"
_ctas: list[dict[str, Any]] | None = None


def _load_ctas() -> list[dict[str, Any]]:
    global _ctas
    if _ctas is None:
        with open(_DATA_PATH) as f:
            _ctas = json.load(f)
    return _ctas


def build_card_recommendation_ctas(
    cards: list[dict[str, Any]], max_cards: int = 3
) -> list[dict[str, Any]]:
    """Build enriched CTA objects from card_lookup results."""
    ctas: list[dict[str, Any]] = []
    for card in cards[:max_cards]:
        card_id = card.get("card_id", "")
        bonus = card.get("signup_bonus", {})
        key_perks = card.get("key_perks", [])
        ctas.append({
            "cta_id": f"card-apply-{card_id}",
            "cta_type": "card_application",
            "label": f"View {card.get('card_name', '')} Review & Apply",
            "url": card.get("application_url", ""),
            "review_url": card.get("point_hacks_review_url", ""),
            "card": {
                "card_id": card_id,
                "card_name": card.get("card_name", ""),
                "signup_bonus": {
                    "points": bonus.get("points", 0),
                    "program": bonus.get("program", ""),
                    "min_spend": bonus.get("min_spend", 0),
                    "min_spend_period_months": bonus.get("min_spend_period_months", 0),
                },
                "annual_fee": card.get("annual_fee", 0),
                "annual_fee_first_year": card.get("annual_fee_first_year"),
                "issuer": card.get("issuer", ""),
                "network": card.get("network", ""),
                "program": card.get("program", ""),
                "earn_rates": {
                    "general": card.get("earn_rates", {}).get("general", 0),
                },
                "key_perk": key_perks[0] if key_perks else None,
                "tags": card.get("tags", []),
            },
        })
    return ctas


def cta_lookup(
    cta_type: str,
    card_id: str | None = None,
    program: str | None = None,
    intent: str | None = None,
) -> dict[str, Any] | None:
    """Find the most relevant CTA for the context."""

    # Special case: card application — build CTA from card data
    if cta_type == "card_application" and card_id:
        card = get_card_by_id(card_id)
        if card:
            return {
                "cta_id": f"card-apply-{card_id}",
                "cta_type": "card_application",
                "label": f"View {card['card_name']} Review & Apply",
                "url": card["application_url"],
                "review_url": card["point_hacks_review_url"],
                "card": {
                    "card_id": card["card_id"],
                    "card_name": card["card_name"],
                    "signup_bonus": card.get("signup_bonus", {}),
                    "annual_fee": card["annual_fee"],
                    "annual_fee_first_year": card.get("annual_fee_first_year"),
                },
            }

    # Search CTA directory
    ctas = _load_ctas()
    matches: list[dict[str, Any]] = []

    for cta in ctas:
        if not cta.get("is_active", False):
            continue

        # Type filter
        if cta.get("cta_type") != cta_type:
            continue

        # Intent filter
        rules = cta.get("context_rules", {})
        intent_list = rules.get("intents")
        if intent and intent_list and intent not in intent_list:
            continue

        # Program filter
        program_list = rules.get("programs")
        if program and program_list and program not in program_list:
            continue

        matches.append(cta)

    if not matches:
        return None

    # Return highest priority
    matches.sort(key=lambda c: c.get("priority", 0), reverse=True)
    return matches[0]

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "cards.json"
_cards: list[dict[str, Any]] | None = None


def _load_cards() -> list[dict[str, Any]]:
    global _cards
    if _cards is None:
        with open(_DATA_PATH) as f:
            _cards = json.load(f)
    return _cards


def _parse_ratio(ratio_str: str) -> float:
    """Parse '2:1' → 2.0, '4:3' → 1.333. Returns 1.0 if unparseable."""
    try:
        parts = ratio_str.split(":")
        return float(parts[0]) / float(parts[1])
    except (ValueError, IndexError, ZeroDivisionError):
        return 1.0


def _effective_bonus(card: dict, target_program: str) -> float:
    """Compute effective bonus points in the target program."""
    bonus = card.get("signup_bonus", {}).get("points", 0)
    if not target_program or target_program == "any":
        return bonus
    if card.get("program") == target_program:
        return bonus  # Direct earner
    for tp in card.get("transfer_partners", []):
        if tp["program"] == target_program:
            return bonus / _parse_ratio(tp.get("ratio", "1:1"))
    return bonus  # Fallback for flexible/unmatched


def card_lookup(
    program: str,
    max_annual_fee: float | None = None,
    min_signup_bonus: int | None = None,
    exclude_networks: list[str] | None = None,
    tags: list[str] | None = None,
    exclude_tags: list[str] | None = None,
) -> list[dict[str, Any]]:
    """Filter and return matching cards, sorted by signup bonus descending."""
    cards = _load_cards()
    results: list[dict[str, Any]] = []

    for card in cards:
        if not card.get("is_active", False):
            continue

        # Program filter
        if program and program != "any":
            card_program = card.get("program", "")
            # "flexible" cards can match any program via transfer partners
            if card_program != program and card_program != "flexible":
                # Check if card transfers to the desired program
                has_transfer = any(
                    tp["program"] == program for tp in card.get("transfer_partners", [])
                )
                if card_program != "amex_mr" or not has_transfer:
                    if not has_transfer:
                        continue

        # Fee filter
        if max_annual_fee is not None:
            # Use first-year fee if available, otherwise annual fee
            effective_fee = card.get("annual_fee_first_year")
            if effective_fee is None:
                effective_fee = card.get("annual_fee", 0)
            # Also check ongoing fee
            if card.get("annual_fee", 0) > max_annual_fee and effective_fee > max_annual_fee:
                continue

        # Bonus filter
        if min_signup_bonus is not None:
            bonus = card.get("signup_bonus", {}).get("points", 0)
            if bonus < min_signup_bonus:
                continue

        # Network exclusion
        if exclude_networks:
            if card.get("network", "") in exclude_networks:
                continue

        # Tag filter (any match)
        if tags:
            card_tags = set(card.get("tags", []))
            if not card_tags.intersection(tags):
                continue

        # Tag exclusion filter
        if exclude_tags:
            card_tags = set(card.get("tags", []))
            if card_tags.intersection(exclude_tags):
                continue

        results.append(card)

    # Sort by effective bonus in target program descending
    results.sort(key=lambda c: _effective_bonus(c, program), reverse=True)
    return results[:5]


def get_card_by_id(card_id: str) -> dict[str, Any] | None:
    """Get a single card by ID."""
    cards = _load_cards()
    for card in cards:
        if card["card_id"] == card_id:
            return card
    return None


def relax_and_search(
    program: str,
    max_annual_fee: float | None = None,
    min_signup_bonus: int | None = None,
    exclude_networks: list[str] | None = None,
) -> list[dict[str, Any]]:
    """Progressive constraint relaxation when no exact matches found."""
    # Try original
    results = card_lookup(program, max_annual_fee, min_signup_bonus, exclude_networks)
    if results:
        return results

    # Relax fee
    results = card_lookup(program, None, min_signup_bonus, exclude_networks)
    if results:
        return results

    # Relax bonus
    results = card_lookup(program, max_annual_fee, None, exclude_networks)
    if results:
        return results

    # Relax network
    results = card_lookup(program, max_annual_fee, min_signup_bonus, None)
    if results:
        return results

    # Relax program to "any"
    results = card_lookup("any", max_annual_fee, min_signup_bonus, exclude_networks)
    if results:
        return results

    # Last resort: all cards
    return card_lookup("any")

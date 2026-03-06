from __future__ import annotations

from typing import Any

# Tool definitions in Claude tool-use format
TOOL_DEFINITIONS: list[dict[str, Any]] = [
    {
        "name": "card_lookup",
        "description": "Search for credit cards that match the user's criteria. Returns matching cards sorted by relevance to the user's goal.",
        "input_schema": {
            "type": "object",
            "properties": {
                "program": {
                    "type": "string",
                    "enum": ["qantas", "velocity", "krisflyer", "flexible", "any"],
                    "description": "The frequent flyer program the user prefers",
                },
                "max_annual_fee": {
                    "type": "number",
                    "description": "Maximum annual fee the user is willing to pay (AUD). Null for no limit.",
                },
                "min_signup_bonus": {
                    "type": "number",
                    "description": "Minimum sign-up bonus points desired",
                },
                "exclude_networks": {
                    "type": "array",
                    "items": {"type": "string", "enum": ["amex", "visa", "mastercard"]},
                    "description": "Card networks to exclude (e.g., user doesn't want Amex)",
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Desired card features: 'lounge_access', 'no_foreign_fees', 'low_fee', 'premium', 'supermarket_bonus'",
                },
            },
            "required": ["program"],
        },
    },
    {
        "name": "points_estimate",
        "description": "Estimate the points required for a specific route and cabin class. Returns point requirements across programs.",
        "input_schema": {
            "type": "object",
            "properties": {
                "origin": {
                    "type": "string",
                    "description": "Origin city name or airport code",
                },
                "destination": {
                    "type": "string",
                    "description": "Destination city name or airport code",
                },
                "cabin_class": {
                    "type": "string",
                    "enum": ["economy", "premium_economy", "business", "first"],
                    "description": "Desired cabin class",
                },
                "program": {
                    "type": "string",
                    "enum": ["qantas", "velocity", "krisflyer", "any"],
                    "description": "Specific program to check, or 'any' for all",
                },
                "trip_type": {
                    "type": "string",
                    "enum": ["oneway", "return"],
                    "description": "One-way or return trip. Return doubles the one-way estimate.",
                },
            },
            "required": ["origin", "destination", "cabin_class"],
        },
    },
    {
        "name": "cta_lookup",
        "description": "Get the most relevant call-to-action for the current context. Returns the CTA with the correct URL.",
        "input_schema": {
            "type": "object",
            "properties": {
                "cta_type": {
                    "type": "string",
                    "enum": ["card_application", "seat_alert_create", "email_capture", "guide_link"],
                    "description": "The type of CTA needed",
                },
                "card_id": {
                    "type": "string",
                    "description": "For card_application CTAs: the specific card ID",
                },
                "program": {
                    "type": "string",
                    "description": "For guide_link CTAs: filter by program",
                },
                "intent": {
                    "type": "string",
                    "description": "Current user intent for context-matching",
                },
            },
            "required": ["cta_type"],
        },
    },
    {
        "name": "knowledge_search",
        "description": "Search the Point Hacks knowledge base for information about points, programs, strategies, and concepts. Use this when the user asks a question you need verified information to answer.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The topic or question to search for",
                },
                "category": {
                    "type": "string",
                    "enum": ["learning", "programs", "seat-alerts", "redemptions", "cards"],
                    "description": "Optional category filter",
                },
                "program": {
                    "type": "string",
                    "enum": ["qantas", "velocity", "krisflyer"],
                    "description": "Optional program filter",
                },
            },
            "required": ["query"],
        },
    },
]

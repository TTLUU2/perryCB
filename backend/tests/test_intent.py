"""Tests for intent classification logic (unit tests — no LLM calls)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.engine.intent import (
    CONFIDENCE_THRESHOLDS,
    INTENT_PRIORITY,
    resolve_ambiguous_intents,
)
from app.session.models import Intent


class TestIntentPriority:
    def test_card_match_highest_priority(self):
        assert INTENT_PRIORITY[Intent.CARD_MATCH] < INTENT_PRIORITY[Intent.SEAT_ALERTS]
        assert INTENT_PRIORITY[Intent.CARD_MATCH] < INTENT_PRIORITY[Intent.LEARNING]

    def test_seat_alerts_second(self):
        assert INTENT_PRIORITY[Intent.SEAT_ALERTS] < INTENT_PRIORITY[Intent.LEARNING]

    def test_other_lowest(self):
        assert INTENT_PRIORITY[Intent.OTHER] == 5


class TestResolveAmbiguous:
    def test_same_confidence_uses_priority(self):
        # CARD_MATCH should win over LEARNING at same confidence
        intent, conf = resolve_ambiguous_intents(Intent.LEARNING, 0.75, Intent.CARD_MATCH, 0.75)
        assert intent == Intent.CARD_MATCH

    def test_clear_winner_by_confidence(self):
        intent, conf = resolve_ambiguous_intents(Intent.LEARNING, 0.95, Intent.CARD_MATCH, 0.60)
        assert intent == Intent.LEARNING
        assert conf == 0.95

    def test_similar_confidence_within_threshold(self):
        # Within 0.1 → use priority
        intent, conf = resolve_ambiguous_intents(Intent.LEARNING, 0.80, Intent.CARD_MATCH, 0.78)
        assert intent == Intent.CARD_MATCH


class TestConfidenceThresholds:
    def test_article_followup_lower_threshold(self):
        assert CONFIDENCE_THRESHOLDS[Intent.ARTICLE_FOLLOWUP] < CONFIDENCE_THRESHOLDS[Intent.CARD_MATCH]

    def test_other_no_threshold(self):
        assert CONFIDENCE_THRESHOLDS[Intent.OTHER] == 0.0

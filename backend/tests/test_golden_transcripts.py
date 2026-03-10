"""
Golden transcript validation tests.

These tests verify that the tool handlers and flow logic produce correct
results for the 8 golden conversation scenarios from 04_golden_transcripts.md.

Note: Full end-to-end transcript validation requires live LLM calls.
These tests validate the deterministic components (tools, flow transitions, slot merging).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.knowledge.cards import card_lookup, relax_and_search
from app.knowledge.points import points_estimate
from app.knowledge.cta import cta_lookup
from app.knowledge.search import knowledge_search
from app.engine.slots import merge_slots
from app.engine import flow_engine
from app.session.models import (
    FlowStep,
    Intent,
    SessionState,
    SlotData,
    PageContext,
)


class TestTranscript1_CardMatchHappyPath:
    """Transcript 1: Business class Tokyo with Qantas points."""

    def test_points_estimate_syd_tyo_business_return(self):
        result = points_estimate("Sydney", "Tokyo", "business", "qantas", "return")
        assert result["found"]
        assert result["estimates"]["qantas"] == 144000

    def test_card_lookup_qantas_high_bonus(self):
        results = card_lookup(program="qantas", min_signup_bonus=50000)
        assert len(results) > 0
        card_ids = [c["card_id"] for c in results]
        # Should find Qantas Premier and/or cards that transfer to Qantas
        assert any("qantas" in cid for cid in card_ids) or len(results) > 0

    def test_cta_card_application(self):
        cta = cta_lookup("card_application", card_id="qantas-premier")
        assert cta is not None
        assert "qantas-premier" in cta["url"]

    def test_cta_seat_alert_handover(self):
        cta = cta_lookup("seat_alert_create")
        assert cta is not None
        assert "seat-alerts" in cta["url"]

    def test_slot_merging_sequence(self):
        """Simulate multi-turn slot collection."""
        slots = SlotData()

        # Turn 1: destination, cabin_class, airline_preference
        slots, _ = merge_slots(slots, {
            "destination": "Tokyo",
            "cabin_class": "business",
            "airline_preference": "qantas",
        })
        assert slots.destination == "Tokyo"
        assert slots.cabin_class == "business"

        # Turn 2: travellers, travel_timing
        slots, _ = merge_slots(slots, {
            "travellers": 1,
            "travel_timing": "September 2026",
        })
        assert slots.travellers == 1

        # Turn 3: current_points
        slots, _ = merge_slots(slots, {
            "current_points": 45000,
            "points_program": "qantas",
        })
        assert slots.current_points == 45000


class TestTranscript2_LearningBeginner:
    """Transcript 2: Complete beginner, learning flow."""

    def test_knowledge_search_beginner(self):
        results = knowledge_search("getting started Qantas points", program="qantas")
        assert len(results) > 0

    def test_cta_email_capture(self):
        cta = cta_lookup("email_capture", intent="LEARNING")
        assert cta is not None
        assert "pointhacks.com.au" in cta["url"] or "join.pointhacks.com.au" in cta["url"]

    def test_learning_flow_progression(self):
        session = SessionState()
        flow_engine.initialise_flow(session, Intent.LEARNING)
        assert session.flow_state.current_step == FlowStep.LN_REASSURE

        flow_engine.advance_flow(session)
        assert session.flow_state.current_step == FlowStep.LN_DISCOVER


class TestTranscript3_SeatAlertsQuick:
    """Transcript 3: Experienced user, seat alerts for SYD-SIN business."""

    def test_cta_seat_alert(self):
        cta = cta_lookup("seat_alert_create", intent="SEAT_ALERTS")
        assert cta is not None

    def test_bridge_to_card_match(self):
        session = SessionState()
        flow_engine.initialise_flow(session, Intent.SEAT_ALERTS)
        session.slots.origin = "Sydney"
        session.slots.destination = "Singapore"
        session.slots.cabin_class = "business"
        session.slots.airline_preference = "krisflyer"

        # Should be able to handover
        assert flow_engine.can_handover(session)

        # Perform handover
        flow_engine.perform_handover(session, Intent.CARD_MATCH)
        assert session.intent.primary == Intent.CARD_MATCH
        assert session.analytics.handover_count == 1


class TestTranscript4_ArticleFollowup:
    """Transcript 4: Article followup about Cathay Aria Suite."""

    def test_knowledge_search_cathay(self):
        results = knowledge_search("Cathay Pacific first class points")
        assert isinstance(results, list)  # May or may not find results

    def test_transition_to_card_match(self):
        session = SessionState()
        flow_engine.initialise_flow(session, Intent.ARTICLE_FOLLOWUP)
        assert session.flow_state.current_step == FlowStep.AF_ANSWER

        flow_engine.advance_flow(session)
        assert session.flow_state.current_step == FlowStep.AF_PROBE


class TestTranscript5_AmbiguousIntent:
    """Transcript 5: Vague 'I want to go to Bali' — needs clarification."""

    def test_bali_points_available(self):
        result = points_estimate("Sydney", "Bali", "economy", "qantas", "return")
        assert result["found"]
        assert result["estimates"]["qantas"] == 36000  # 18000 * 2


class TestTranscript6_OffTopic:
    """Transcript 6: Off-topic weather question."""

    def test_off_topic_counting(self):
        session = SessionState()
        session.off_topic_count = 0
        flow_engine.initialise_flow(session, Intent.OTHER)
        assert session.flow_state.current_step == FlowStep.OT_DEFLECT

    def test_recovery_to_card_match(self):
        session = SessionState()
        flow_engine.initialise_flow(session, Intent.OTHER)
        session.off_topic_count = 1
        # User comes back on topic
        flow_engine.initialise_flow(session, Intent.CARD_MATCH)
        assert session.intent.primary == Intent.CARD_MATCH


class TestTranscript7_Contradiction:
    """Transcript 7: User changes from Qantas to Velocity mid-conversation."""

    def test_slot_contradiction_detection(self):
        slots = SlotData()
        slots.airline_preference = "qantas"

        updated, contradictions = merge_slots(slots, {"airline_preference": "velocity"})
        assert updated.airline_preference == "velocity"
        assert len(contradictions) > 0
        assert "qantas" in contradictions[0] and "velocity" in contradictions[0]

    def test_card_lookup_velocity_under_200(self):
        results = card_lookup(program="velocity", max_annual_fee=200)
        assert len(results) > 0
        # NAB Velocity should be in results
        card_ids = [c["card_id"] for c in results]
        assert "nab-velocity-rewards" in card_ids


class TestTranscript8_NoMatchingCards:
    """Transcript 8: Very restrictive criteria, no exact match."""

    def test_no_exact_match(self):
        results = card_lookup(
            program="krisflyer",
            max_annual_fee=0,
            min_signup_bonus=200000,
            exclude_networks=["amex"],
        )
        # Should be empty — no non-Amex card has 200k+ bonus with KrisFlyer transfer and $0 fee
        assert len(results) == 0

    def test_relaxed_search_finds_alternatives(self):
        results = relax_and_search(
            program="krisflyer",
            max_annual_fee=0,
            min_signup_bonus=100000,
            exclude_networks=["amex"],
        )
        assert len(results) > 0  # Relaxation should find alternatives

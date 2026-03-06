"""Tests for flow engine and state transitions."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.engine import flow_engine
from app.engine.flows import card_match, seat_alerts, learning, article_followup, other
from app.session.models import (
    FlowStep,
    Intent,
    SessionState,
    PageContext,
)


def _make_session(**kwargs) -> SessionState:
    return SessionState(**kwargs)


class TestFlowEngine:
    def test_greeting_homepage(self):
        session = _make_session()
        session.page_context = PageContext(page_type="homepage")
        greeting = flow_engine.get_greeting(session)
        assert "Perry" in greeting

    def test_greeting_card_review(self):
        session = _make_session()
        session.page_context = PageContext(page_type="card_review", page_title="Amex Explorer")
        greeting = flow_engine.get_greeting(session)
        assert "Amex Explorer" in greeting

    def test_greeting_seat_alerts(self):
        session = _make_session()
        session.page_context = PageContext(page_type="seat_alerts")
        greeting = flow_engine.get_greeting(session)
        assert "reward seats" in greeting.lower()

    def test_initialise_card_match(self):
        session = _make_session()
        flow_engine.initialise_flow(session, Intent.CARD_MATCH)
        assert session.intent.primary == Intent.CARD_MATCH
        assert session.flow_state.current_step == FlowStep.CM_CONFIRM_GOAL

    def test_initialise_learning(self):
        session = _make_session()
        flow_engine.initialise_flow(session, Intent.LEARNING)
        assert session.flow_state.current_step == FlowStep.LN_REASSURE

    def test_initialise_seat_alerts(self):
        session = _make_session()
        flow_engine.initialise_flow(session, Intent.SEAT_ALERTS)
        assert session.flow_state.current_step == FlowStep.SA_CONFIRM_ROUTE

    def test_handover_limit(self):
        session = _make_session()
        session.analytics.handover_count = 2
        assert not flow_engine.can_handover(session)

    def test_handover_allowed(self):
        session = _make_session()
        session.analytics.handover_count = 0
        assert flow_engine.can_handover(session)

    def test_perform_handover(self):
        session = _make_session()
        flow_engine.initialise_flow(session, Intent.LEARNING)
        session.slots.program_interest = "qantas"
        flow_engine.perform_handover(session, Intent.CARD_MATCH)
        assert session.intent.primary == Intent.CARD_MATCH
        assert session.flow_state.current_step == FlowStep.CM_CONFIRM_GOAL
        assert session.slots.airline_preference == "qantas"
        assert session.analytics.handover_count == 1

    def test_conversation_soft_limit(self):
        session = _make_session()
        session.turn_count = 15
        msg = flow_engine.check_conversation_limits(session)
        assert msg is not None
        assert "wrapping up" in msg.lower()

    def test_conversation_hard_limit(self):
        session = _make_session()
        session.turn_count = 25
        msg = flow_engine.check_conversation_limits(session)
        assert msg is not None
        assert "maximum" in msg.lower()


class TestCardMatchFlow:
    def test_initial_step(self):
        assert card_match.get_initial_step() == FlowStep.CM_CONFIRM_GOAL

    def test_advance_from_confirm(self):
        session = _make_session()
        next_step = card_match.determine_next_step(FlowStep.CM_CONFIRM_GOAL, session)
        assert next_step == FlowStep.CM_COLLECT_SLOTS

    def test_advance_with_all_slots(self):
        session = _make_session()
        session.slots.airline_preference = "qantas"
        session.slots.destination = "Tokyo"
        session.slots.cabin_class = "business"
        next_step = card_match.determine_next_step(FlowStep.CM_COLLECT_SLOTS, session)
        assert next_step == FlowStep.CM_ESTIMATE_POINTS

    def test_advance_with_minimum_slots(self):
        session = _make_session()
        session.slots.airline_preference = "qantas"
        next_step = card_match.determine_next_step(FlowStep.CM_COLLECT_SLOTS, session)
        assert next_step == FlowStep.CM_RECOMMEND_CARDS

    def test_terminal(self):
        assert card_match.is_terminal(FlowStep.CM_COMPLETE)
        assert not card_match.is_terminal(FlowStep.CM_COLLECT_SLOTS)


class TestSeatAlertsFlow:
    def test_initial_step(self):
        assert seat_alerts.get_initial_step() == FlowStep.SA_CONFIRM_ROUTE

    def test_advance_with_route(self):
        session = _make_session()
        session.slots.origin = "Sydney"
        session.slots.destination = "Singapore"
        next_step = seat_alerts.determine_next_step(FlowStep.SA_CONFIRM_ROUTE, session)
        assert next_step == FlowStep.SA_COLLECT_DETAILS

    def test_advance_with_route_and_dates(self):
        session = _make_session()
        session.slots.origin = "Sydney"
        session.slots.destination = "Singapore"
        session.slots.date_range_start = "2026-06"
        next_step = seat_alerts.determine_next_step(FlowStep.SA_CONFIRM_ROUTE, session)
        assert next_step == FlowStep.SA_EXPLAIN_AND_CTA

    def test_terminal(self):
        assert seat_alerts.is_terminal(FlowStep.SA_COMPLETE)


class TestLearningFlow:
    def test_initial_step(self):
        assert learning.get_initial_step() == FlowStep.LN_REASSURE

    def test_discover_to_educate(self):
        session = _make_session()
        session.slots.program_interest = "qantas"
        next_step = learning.determine_next_step(FlowStep.LN_DISCOVER, session)
        assert next_step == FlowStep.LN_EDUCATE

    def test_terminal(self):
        assert learning.is_terminal(FlowStep.LN_COMPLETE)


class TestOtherFlow:
    def test_deflect_then_complete(self):
        session = _make_session()
        session.off_topic_count = 3
        next_step = other.determine_next_step(FlowStep.OT_DEFLECT, session)
        assert next_step == FlowStep.OT_COMPLETE

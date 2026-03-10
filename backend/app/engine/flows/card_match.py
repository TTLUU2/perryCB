from __future__ import annotations

from typing import Any

from app.session.models import FlowStep, SessionState


def get_initial_step() -> FlowStep:
    return FlowStep.CM_CONFIRM_GOAL


def get_available_tools(step: FlowStep) -> list[str]:
    tool_map: dict[FlowStep, list[str]] = {
        FlowStep.CM_CONFIRM_GOAL: [],
        FlowStep.CM_COLLECT_SLOTS: [],
        FlowStep.CM_ESTIMATE_POINTS: ["points_estimate"],
        FlowStep.CM_RECOMMEND_CARDS: ["card_lookup", "points_estimate"],
        FlowStep.CM_PRESENT_CTA: ["cta_lookup"],
        FlowStep.CM_COMPLETE: [],
    }
    return tool_map.get(step, [])


def get_step_instructions(step: FlowStep, session: SessionState) -> str:
    """Return LLM instructions for the current step."""
    slots = session.slots

    if step == FlowStep.CM_CONFIRM_GOAL:
        return (
            "The user wants help choosing a credit card. "
            "Echo back their stated goal with enthusiasm. "
            "Then ask 1-2 natural follow-up questions to start collecting slots. "
            "Prioritise asking about: airline_preference (if unknown), destination, and travel timing."
        )

    if step == FlowStep.CM_COLLECT_SLOTS:
        missing = _get_missing_slots(session)
        return (
            f"Continue collecting information. Missing slots: {', '.join(missing)}. "
            "Ask 1-3 questions naturally grouped. Don't repeat questions already answered. "
            "Key slots needed: airline_preference, destination, cabin_class, current_points."
        )

    if step == FlowStep.CM_ESTIMATE_POINTS:
        return (
            f"The user wants to fly to {slots.destination or 'their destination'} "
            f"in {slots.cabin_class or 'economy'} class. "
            "Use the points_estimate tool to calculate how many points they need. "
            "Tell them the result and ask about their current points balance if unknown."
        )

    if step == FlowStep.CM_RECOMMEND_CARDS:
        return (
            "You have enough information to recommend cards. "
            "Use the card_lookup tool to find matching cards. "
            "Write a brief summary of the top 3 — mention each card name and why it fits. "
            "If they have a destination, include a Points Pathway calculation. "
            "DO NOT call cta_lookup — card tiles with apply links are shown automatically. "
            "Ask which card interests them."
        )

    if step == FlowStep.CM_PRESENT_CTA:
        return (
            "The user has shown interest in a card. "
            "Use cta_lookup with cta_type='card_application' to get the right link. "
            "Present the review link. Give one practical tip (e.g., minimum spend). "
            "Then offer to help with Seat Alerts if they have a trip planned."
        )

    if step == FlowStep.CM_COMPLETE:
        return "The card match flow is complete. Wrap up warmly."

    return ""


def determine_next_step(step: FlowStep, session: SessionState) -> FlowStep:
    """Determine the next step based on current state and collected slots."""
    slots = session.slots

    if step == FlowStep.CM_CONFIRM_GOAL:
        return FlowStep.CM_COLLECT_SLOTS

    if step == FlowStep.CM_COLLECT_SLOTS:
        # Check if we have minimum slots to proceed
        if slots.airline_preference:
            if slots.destination and slots.cabin_class:
                return FlowStep.CM_ESTIMATE_POINTS
            return FlowStep.CM_RECOMMEND_CARDS
        # Stay in collect if still missing key slots (max 3 iterations tracked externally)
        return FlowStep.CM_COLLECT_SLOTS

    if step == FlowStep.CM_ESTIMATE_POINTS:
        return FlowStep.CM_RECOMMEND_CARDS

    if step == FlowStep.CM_RECOMMEND_CARDS:
        return FlowStep.CM_PRESENT_CTA

    if step == FlowStep.CM_PRESENT_CTA:
        return FlowStep.CM_COMPLETE

    return FlowStep.CM_COMPLETE


def _get_missing_slots(session: SessionState) -> list[str]:
    """Return list of missing high-priority slots."""
    slots = session.slots
    missing = []
    if not slots.airline_preference:
        missing.append("airline_preference")
    if not slots.destination:
        missing.append("destination")
    if not slots.cabin_class:
        missing.append("cabin_class")
    if slots.current_points is None:
        missing.append("current_points")
    if not slots.travel_timing:
        missing.append("travel_timing")
    if slots.travellers is None:
        missing.append("travellers")
    return missing


def is_terminal(step: FlowStep) -> bool:
    return step == FlowStep.CM_COMPLETE


def should_handover_to_seats(session: SessionState) -> bool:
    """Check if we should offer seat alerts handover."""
    return (
        session.slots.destination is not None
        and session.slots.travel_timing is not None
        and session.flow_state.current_step == FlowStep.CM_PRESENT_CTA
    )

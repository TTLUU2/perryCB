from __future__ import annotations

from app.session.models import FlowStep, SessionState


def get_initial_step() -> FlowStep:
    return FlowStep.SA_CONFIRM_ROUTE


def get_available_tools(step: FlowStep) -> list[str]:
    tool_map: dict[FlowStep, list[str]] = {
        FlowStep.SA_CONFIRM_ROUTE: [],
        FlowStep.SA_COLLECT_DETAILS: [],
        FlowStep.SA_EXPLAIN_AND_CTA: ["cta_lookup"],
        FlowStep.SA_BRIDGE_CHECK: ["card_lookup"],
        FlowStep.SA_COMPLETE: [],
    }
    return tool_map.get(step, [])


def get_step_instructions(step: FlowStep, session: SessionState) -> str:
    slots = session.slots

    if step == FlowStep.SA_CONFIRM_ROUTE:
        parts = []
        if slots.origin and slots.destination:
            parts.append(
                f"Confirm the route: {slots.origin} to {slots.destination}. "
                "Ask for dates and cabin class if not provided."
            )
        else:
            parts.append(
                "The user wants to track reward seats. "
                "Ask for origin and destination if not yet known. Keep it quick — 1-2 questions max."
            )
        return " ".join(parts)

    if step == FlowStep.SA_COLLECT_DETAILS:
        missing = []
        if not slots.date_range_start:
            missing.append("date range")
        if not slots.cabin_class:
            missing.append("cabin class")
        return (
            f"Get the remaining details: {', '.join(missing) if missing else 'confirm details'}. "
            "This flow should be fast — 1 message to collect, then present the CTA."
        )

    if step == FlowStep.SA_EXPLAIN_AND_CTA:
        return (
            "Briefly explain how Seat Alerts work (1-2 sentences). "
            "Use cta_lookup with cta_type='seat_alert_create' to get the link. "
            "Present the CTA to create a Seat Alert. "
            "Mention the free vs premium option briefly. "
            "Then ask if they have enough points for the trip — this sets up a potential bridge to CARD_MATCH."
        )

    if step == FlowStep.SA_BRIDGE_CHECK:
        return (
            "The user may not have enough points. "
            "If they indicate they're short on points, suggest a card that could help. "
            "Use card_lookup if needed. Keep it brief."
        )

    if step == FlowStep.SA_COMPLETE:
        return "Seat alerts flow complete. Wish them well."

    return ""


def determine_next_step(step: FlowStep, session: SessionState) -> FlowStep:
    slots = session.slots

    if step == FlowStep.SA_CONFIRM_ROUTE:
        if slots.origin and slots.destination:
            if slots.date_range_start or slots.cabin_class:
                return FlowStep.SA_EXPLAIN_AND_CTA
            return FlowStep.SA_COLLECT_DETAILS
        return FlowStep.SA_CONFIRM_ROUTE

    if step == FlowStep.SA_COLLECT_DETAILS:
        return FlowStep.SA_EXPLAIN_AND_CTA

    if step == FlowStep.SA_EXPLAIN_AND_CTA:
        return FlowStep.SA_BRIDGE_CHECK

    if step == FlowStep.SA_BRIDGE_CHECK:
        return FlowStep.SA_COMPLETE

    return FlowStep.SA_COMPLETE


def is_terminal(step: FlowStep) -> bool:
    return step == FlowStep.SA_COMPLETE

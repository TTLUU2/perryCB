from __future__ import annotations

from app.session.models import FlowStep, SessionState


def get_initial_step() -> FlowStep:
    return FlowStep.LN_REASSURE


def get_available_tools(step: FlowStep) -> list[str]:
    tool_map: dict[FlowStep, list[str]] = {
        FlowStep.LN_REASSURE: [],
        FlowStep.LN_DISCOVER: [],
        FlowStep.LN_EDUCATE: ["knowledge_search"],
        FlowStep.LN_EMAIL_CTA: ["cta_lookup"],
        FlowStep.LN_BRIDGE: [],
        FlowStep.LN_COMPLETE: [],
    }
    return tool_map.get(step, [])


def get_step_instructions(step: FlowStep, session: SessionState) -> str:
    slots = session.slots

    if step == FlowStep.LN_REASSURE:
        return (
            "The user is new to points. Reassure them: points can seem complex but the basics are simple. "
            "Ask 1-2 questions: which frequent flyer program interests them (Qantas, Velocity, or not sure?), "
            "and whether they're more focused on earning points or using ones they have."
        )

    if step == FlowStep.LN_DISCOVER:
        return (
            "Continue discovering what the user needs. Ask about their program preference "
            "if not yet known, and their focus (earning vs using). Keep it to 1-2 questions."
        )

    if step == FlowStep.LN_EDUCATE:
        program = slots.program_interest or slots.airline_preference or "general"
        return (
            f"Provide tailored beginner content about {program}. "
            "Use the knowledge_search tool to find relevant information. "
            "Give 2-3 sentence explanations. Keep it simple and jargon-free. "
            "Do NOT include any URLs — links will be provided separately via CTAs."
        )

    if step == FlowStep.LN_EMAIL_CTA:
        return (
            "Offer the email sign-up: 'Want me to send you our free 5-Day Points Starter Kit?' "
            "Use cta_lookup with cta_type='email_capture' and intent='LEARNING'. "
            "Present the CTA naturally."
        )

    if step == FlowStep.LN_BRIDGE:
        return (
            "Gently probe for higher-value intent: 'By the way — are you thinking about a specific trip "
            "or interested in picking up a card to kickstart your points balance?' "
            "If they express interest, this will trigger a handover to CARD_MATCH or SEAT_ALERTS."
        )

    if step == FlowStep.LN_COMPLETE:
        return "Learning flow complete. Encourage them to come back anytime."

    return ""


def determine_next_step(step: FlowStep, session: SessionState) -> FlowStep:
    slots = session.slots

    if step == FlowStep.LN_REASSURE:
        return FlowStep.LN_DISCOVER

    if step == FlowStep.LN_DISCOVER:
        if slots.program_interest or slots.airline_preference:
            return FlowStep.LN_EDUCATE
        return FlowStep.LN_DISCOVER

    if step == FlowStep.LN_EDUCATE:
        return FlowStep.LN_EMAIL_CTA

    if step == FlowStep.LN_EMAIL_CTA:
        return FlowStep.LN_BRIDGE

    if step == FlowStep.LN_BRIDGE:
        return FlowStep.LN_COMPLETE

    return FlowStep.LN_COMPLETE


def is_terminal(step: FlowStep) -> bool:
    return step == FlowStep.LN_COMPLETE

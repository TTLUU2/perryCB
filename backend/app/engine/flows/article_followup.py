from __future__ import annotations

from app.session.models import FlowStep, SessionState


def get_initial_step() -> FlowStep:
    return FlowStep.AF_ANSWER


def get_available_tools(step: FlowStep) -> list[str]:
    tool_map: dict[FlowStep, list[str]] = {
        FlowStep.AF_ANSWER: ["knowledge_search", "cta_lookup"],
        FlowStep.AF_PROBE: [],
        FlowStep.AF_COMPLETE: [],
    }
    return tool_map.get(step, [])


def get_step_instructions(step: FlowStep, session: SessionState) -> str:
    page = session.page_context

    if step == FlowStep.AF_ANSWER:
        context = ""
        if page.page_title:
            context = f" They're reading about '{page.page_title}'."
        return (
            f"Provide a concise, expert-level answer (3-5 sentences).{context} "
            "Use knowledge_search to find verified information. "
            "Do NOT include any URLs — links will be provided separately via CTAs."
        )

    if step == FlowStep.AF_PROBE:
        return (
            "After answering, probe for actionable intent: "
            "'Are you researching this for a specific trip, or looking to pick up a card? "
            "Happy to help with either.' "
            "If the user expresses an actionable intent, this will trigger a handover."
        )

    if step == FlowStep.AF_COMPLETE:
        return "Article follow-up complete."

    return ""


def determine_next_step(step: FlowStep, session: SessionState) -> FlowStep:
    if step == FlowStep.AF_ANSWER:
        return FlowStep.AF_PROBE

    if step == FlowStep.AF_PROBE:
        return FlowStep.AF_COMPLETE

    return FlowStep.AF_COMPLETE


def is_terminal(step: FlowStep) -> bool:
    return step == FlowStep.AF_COMPLETE

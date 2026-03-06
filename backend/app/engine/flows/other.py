from __future__ import annotations

from app.session.models import FlowStep, SessionState

MAX_OFF_TOPIC_TURNS = 2


def get_initial_step() -> FlowStep:
    return FlowStep.OT_DEFLECT


def get_available_tools(step: FlowStep) -> list[str]:
    return []


def get_step_instructions(step: FlowStep, session: SessionState) -> str:
    if step == FlowStep.OT_DEFLECT:
        count = session.off_topic_count
        if count <= 1:
            return (
                "The user's message is off-topic. Respond politely: "
                "'I specialise in frequent flyer points, credit cards, and reward travel. "
                "Is there something in that space I can help you with?' "
                "Keep it warm and brief."
            )
        return (
            "The user has been off-topic multiple times. Be warm but firm: "
            "'I appreciate the chat, but I'm best placed to help with points and travel rewards. "
            "Feel free to ask me anything in that area!'"
        )

    if step == FlowStep.OT_COMPLETE:
        return "Conversation ended due to persistent off-topic messages."

    return ""


def determine_next_step(step: FlowStep, session: SessionState) -> FlowStep:
    if session.off_topic_count >= MAX_OFF_TOPIC_TURNS:
        return FlowStep.OT_COMPLETE
    return FlowStep.OT_DEFLECT


def is_terminal(step: FlowStep) -> bool:
    return step == FlowStep.OT_COMPLETE

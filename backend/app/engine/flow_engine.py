from __future__ import annotations

import logging
from typing import Any

from app.engine.flows import article_followup, card_match, learning, other, seat_alerts
from app.session.models import FlowStep, Intent, SessionState

logger = logging.getLogger(__name__)

MAX_HANDOVERS = 2
SOFT_TURN_LIMIT = 15
HARD_TURN_LIMIT = 25

# Map intents to flow modules
FLOW_MODULES = {
    Intent.CARD_MATCH: card_match,
    Intent.SEAT_ALERTS: seat_alerts,
    Intent.LEARNING: learning,
    Intent.ARTICLE_FOLLOWUP: article_followup,
    Intent.OTHER: other,
}

# Greeting templates by page type
GREETINGS = {
    "homepage": "Hey! I'm Perry, your points co-pilot. I can help you choose a credit card, find reward seats, or get started with points. What are you after?",
    "card_review": "I see you're checking out a credit card — want me to help you figure out if it's the right fit?",
    "seat_alerts": "Looking to track reward seats on a specific route? I can help you set that up.",
    "guide": "Welcome! Looks like you're getting started with points — I can help you make sense of it all. What's on your mind?",
    "article": "I see you're reading an article. Got any questions, or would you like help putting this into action?",
    "other": "Hey! I'm Perry from Point Hacks — I can help with credit cards, reward seats, and all things points. What can I do for you?",
}


def get_greeting(session: SessionState) -> str:
    """Generate contextual greeting based on page context."""
    page_type = session.page_context.page_type
    greeting = GREETINGS.get(page_type, GREETINGS["other"])

    # Personalise with page title if available
    title = session.page_context.page_title
    if page_type == "card_review" and title:
        greeting = f"I see you're looking at the {title} — want me to help you figure out if it's the right fit?"
    elif page_type == "article" and title:
        greeting = f"I see you're reading about {title}. Got any questions, or would you like help putting this into action?"

    return greeting


def initialise_flow(session: SessionState, intent: Intent) -> None:
    """Set up the flow state for a classified intent."""
    flow_module = FLOW_MODULES.get(intent)
    if not flow_module:
        return

    initial_step = flow_module.get_initial_step()
    session.intent.primary = intent
    session.flow_state.current_flow = intent.value
    session.flow_state.current_step = initial_step
    session.flow_state.steps_completed = []
    session.flow_state.awaiting_slots = []

    logger.info("Initialised flow %s at step %s", intent.value, initial_step.value)


def get_current_flow_module(session: SessionState):
    """Get the flow module for the current intent."""
    intent = session.intent.primary
    if not intent:
        return None
    return FLOW_MODULES.get(intent)


def get_step_instructions(session: SessionState) -> str:
    """Get LLM instructions for the current flow step."""
    module = get_current_flow_module(session)
    step = session.flow_state.current_step
    if not module or not step:
        return ""
    return module.get_step_instructions(step, session)


def get_available_tools(session: SessionState) -> list[str]:
    """Get tools available in the current step."""
    module = get_current_flow_module(session)
    step = session.flow_state.current_step
    if not module or not step:
        return []
    return module.get_available_tools(step)


def advance_flow(session: SessionState) -> None:
    """Advance through flow steps until stable (max 5 iterations).

    Allows multi-step fast-tracking when profile data pre-fills slots.
    E.g., CARD_MATCH with airline_preference pre-filled:
    CM_CONFIRM_GOAL → CM_COLLECT_SLOTS → CM_RECOMMEND_CARDS in one call.

    The loop only continues past tool-less steps (slot collection, confirmation).
    It stops when reaching a step with tools (LLM needs to execute them),
    a terminal step, or if the starting step had tools.
    """
    module = get_current_flow_module(session)
    step = session.flow_state.current_step
    if not module or not step:
        return

    # If the current step has tools, the LLM just did work here —
    # only advance one step (don't fast-track further).
    starting_step_has_tools = bool(module.get_available_tools(step))

    max_iterations = 5
    for _ in range(max_iterations):
        # Record completed step
        if step.value not in session.flow_state.steps_completed:
            session.flow_state.steps_completed.append(step.value)

        next_step = module.determine_next_step(step, session)
        if next_step == step:
            break  # Stable — no further advancement

        logger.info("Flow transition: %s → %s", step.value, next_step.value)
        session.flow_state.current_step = next_step
        step = next_step

        # Stop at steps requiring LLM work (tools or terminal),
        # or after one step if the starting step had tools
        if starting_step_has_tools or module.get_available_tools(step) or module.is_terminal(step):
            break


def is_flow_terminal(session: SessionState) -> bool:
    """Check if the current flow has reached a terminal state."""
    module = get_current_flow_module(session)
    step = session.flow_state.current_step
    if not module or not step:
        return False
    return module.is_terminal(step)


def can_handover(session: SessionState) -> bool:
    """Check if another handover is allowed."""
    return session.analytics.handover_count < MAX_HANDOVERS


def perform_handover(session: SessionState, new_intent: Intent) -> None:
    """Transition from current flow to a new flow, carrying over relevant slots."""
    old_intent = session.intent.primary
    if not can_handover(session):
        logger.warning("Handover limit reached (%d), cannot transition to %s", MAX_HANDOVERS, new_intent.value)
        return

    session.analytics.handover_count += 1
    session.analytics.handover_history.append(f"{old_intent.value if old_intent else 'NONE'}→{new_intent.value}")

    # Carry over relevant slots based on handover type
    if old_intent == Intent.LEARNING and new_intent == Intent.CARD_MATCH:
        # Map program_interest → airline_preference
        if session.slots.program_interest and not session.slots.airline_preference:
            session.slots.airline_preference = session.slots.program_interest

    # Keep existing slots — they carry over naturally

    initialise_flow(session, new_intent)
    logger.info("Handover: %s → %s", old_intent.value if old_intent else "NONE", new_intent.value)


def check_conversation_limits(session: SessionState) -> str | None:
    """Check if conversation has hit soft or hard limits. Returns wrap-up instruction or None."""
    turns = session.turn_count
    if turns >= HARD_TURN_LIMIT:
        return (
            "IMPORTANT: This conversation has reached the maximum length. "
            "Provide a brief summary of what was discussed and next steps. "
            "End with: 'For more personalised help, feel free to come back anytime!'"
        )
    if turns >= SOFT_TURN_LIMIT:
        return (
            "Note: This has been a long conversation. Start wrapping up naturally. "
            "Summarise what was covered and present clear next steps."
        )
    return None


def build_flow_context(session: SessionState) -> str:
    """Build the flow-specific context to inject into the LLM prompt."""
    parts: list[str] = []

    # Step instructions
    instructions = get_step_instructions(session)
    if instructions:
        parts.append(f"<flow_instructions>\n{instructions}\n</flow_instructions>")

    # Conversation limits
    limit_msg = check_conversation_limits(session)
    if limit_msg:
        parts.append(f"<conversation_limit>\n{limit_msg}\n</conversation_limit>")

    return "\n\n".join(parts)

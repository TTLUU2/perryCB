from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.analytics import log_conversation_end, log_turn_event
from app.engine import flow_engine
from app.engine.intent import classify_intent
from app.engine.suggestions import generate_suggestions
from app.engine.slots import extract_slots, merge_slots
from app.knowledge.cards import card_lookup, get_card_by_id, relax_and_search
from app.knowledge.cta import build_card_recommendation_ctas, cta_lookup
from app.knowledge.points import points_estimate
from app.knowledge.search import knowledge_search
from app.llm.client import create_message
from app.llm.system_prompt import build_system_prompt
from app.llm.tools import TOOL_DEFINITIONS
from app.session.manager import create_session, get_session, save_session
from app.session.models import (
    FlowStep,
    Intent,
    PageContext,
    SessionState,
    TurnMetadata,
)

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str
    page_context: dict[str, Any] | None = None
    user_profile: dict[str, Any] | None = None


TOOL_HANDLERS: dict[str, Any] = {
    "card_lookup": lambda args: card_lookup(**args),
    "points_estimate": lambda args: points_estimate(**args),
    "cta_lookup": lambda args: cta_lookup(**args),
    "knowledge_search": lambda args: knowledge_search(**args),
}


def _execute_tool(name: str, args: dict[str, Any]) -> Any:
    handler = TOOL_HANDLERS.get(name)
    if not handler:
        return {"error": f"Unknown tool: {name}"}
    try:
        return handler(args)
    except Exception as e:
        logger.error("Tool %s execution error: %s", name, e)
        return {"error": str(e)}


def _filter_tools(available_tool_names: list[str]) -> list[dict[str, Any]]:
    """Return only the tool definitions that are available in the current step."""
    if not available_tool_names:
        return TOOL_DEFINITIONS  # Allow all tools if none specified
    return [t for t in TOOL_DEFINITIONS if t["name"] in available_tool_names]


def _build_messages(session: SessionState) -> list[dict[str, Any]]:
    """Build the messages array from conversation history (last 10 turns)."""
    messages: list[dict[str, Any]] = []
    for turn in session.recent_history(10):
        messages.append({"role": turn.role, "content": turn.content})
    return messages


async def _process_chat(session: SessionState, user_message: str) -> Any:
    """Core chat processing pipeline. Returns an async generator of SSE events."""

    # 1. Update page context & record user turn
    session.add_turn("user", user_message)

    # 2. Intent classification (if not yet classified)
    turn_metadata = TurnMetadata()
    if session.intent.primary is None:
        intent_result = await classify_intent(user_message, session.page_context)
        intent = intent_result["intent"]
        confidence = intent_result["confidence"]
        meets_threshold = intent_result["meets_threshold"]

        if not meets_threshold and not session.clarification_asked:
            # Need clarification
            session.clarification_asked = True
            session.flow_state.current_step = FlowStep.CLARIFY
            clarification = (
                "Are you mainly looking to learn the basics, choose a card, or find reward seats? "
                "That'll help me point you in the right direction."
            )
            session.add_turn("assistant", clarification)
            await save_session(session)
            return clarification, None, turn_metadata

        # Lock in intent
        session.intent.primary = intent
        session.intent.confidence = confidence
        session.intent.classified_at_turn = session.turn_count
        turn_metadata.intent_detected = intent.value

        if intent == Intent.OTHER:
            session.off_topic_count += 1

        flow_engine.initialise_flow(session, intent)

    elif session.flow_state.current_step == FlowStep.CLARIFY:
        # Re-classify after clarification
        intent_result = await classify_intent(user_message, session.page_context)
        intent = intent_result["intent"]
        session.intent.primary = intent
        session.intent.confidence = intent_result["confidence"]
        session.intent.classified_at_turn = session.turn_count
        turn_metadata.intent_detected = intent.value
        flow_engine.initialise_flow(session, intent)

    elif session.intent.primary == Intent.OTHER:
        # Re-check if user has come back on topic
        intent_result = await classify_intent(user_message, session.page_context)
        if intent_result["intent"] != Intent.OTHER and intent_result["meets_threshold"]:
            new_intent = intent_result["intent"]
            session.off_topic_count = 0
            flow_engine.initialise_flow(session, new_intent)
            turn_metadata.intent_detected = new_intent.value
        else:
            session.off_topic_count += 1

    elif flow_engine.is_flow_terminal(session):
        # Current flow is complete — re-classify to allow handover
        intent_result = await classify_intent(user_message, session.page_context)
        new_intent = intent_result["intent"]
        if (
            intent_result["meets_threshold"]
            and new_intent != session.intent.primary
            and new_intent != Intent.OTHER
            and flow_engine.can_handover(session)
        ):
            flow_engine.perform_handover(session, new_intent)
            turn_metadata.intent_detected = new_intent.value

    # 3. Slot extraction
    extracted_slots = await extract_slots(
        user_message,
        session.intent.primary,
        session.slots,
    )
    if extracted_slots:
        session.slots, contradictions = merge_slots(session.slots, extracted_slots)
        turn_metadata.slots_extracted = extracted_slots

    # 4. Advance flow state
    flow_engine.advance_flow(session)

    # 5. Build LLM prompt
    system = build_system_prompt(session)
    flow_context = flow_engine.build_flow_context(session)
    if flow_context:
        system += "\n\n" + flow_context

    messages = _build_messages(session)
    tools = TOOL_DEFINITIONS  # Always provide all tools — LLM uses flow instructions to decide

    # 6. Call LLM (non-streaming for tool handling)
    response = await create_message(
        system=system,
        messages=messages,
        tools=tools,
        max_tokens=1024,
    )

    # 7. Process response — handle tool calls
    full_text = ""
    cta_events: list[dict[str, Any]] = []
    cta_card_ids: set[str] = set()
    max_tool_rounds = 3
    current_messages = messages.copy()

    for _round in range(max_tool_rounds):
        # Collect text and tool calls from response
        tool_calls = []
        assistant_content: list[dict[str, Any]] = []

        for block in response.content:
            if block.type == "text":
                full_text += block.text
                assistant_content.append({"type": "text", "text": block.text})
            elif block.type == "tool_use":
                tool_calls.append(block)
                assistant_content.append({
                    "type": "tool_use",
                    "id": block.id,
                    "name": block.name,
                    "input": block.input,
                })

        if not tool_calls:
            break

        # Execute tools and build tool results
        current_messages.append({"role": "assistant", "content": assistant_content})
        tool_results = []

        for tc in tool_calls:
            turn_metadata.tools_called.append(tc.name)

            # Inject business card filter based on user profile
            if tc.name == "card_lookup":
                profile = getattr(session, "user_profile", None) or {}
                card_type = profile.get("card_type", "personal")
                if card_type != "business_and_personal":
                    result = _execute_tool(tc.name, {**tc.input, "exclude_tags": ["business"]})
                else:
                    result = _execute_tool(tc.name, tc.input)
            else:
                result = _execute_tool(tc.name, tc.input)

            # Track CTAs (dedup against auto-generated card CTAs)
            if tc.name == "cta_lookup" and result:
                dup_card_id = result.get("card", {}).get("card_id", "") if isinstance(result, dict) else ""
                if dup_card_id and dup_card_id in cta_card_ids:
                    pass  # Skip duplicate card CTA
                else:
                    cta_events.append(result)
                    if isinstance(result, dict) and result.get("cta_id"):
                        session.analytics.ctas_shown.append(result["cta_id"])
                        turn_metadata.cta_shown = result["cta_id"]

            # Track card recommendations + auto-gen CTAs
            if tc.name == "card_lookup" and isinstance(result, list):
                for card in result:
                    if isinstance(card, dict) and card.get("card_id"):
                        session.analytics.cards_recommended.append(card["card_id"])
                if session.flow_state.current_step == FlowStep.CM_RECOMMEND_CARDS:
                    auto_ctas = build_card_recommendation_ctas(result)
                    for ac in auto_ctas:
                        card_id = ac.get("card", {}).get("card_id", "")
                        if card_id:
                            cta_card_ids.add(card_id)
                        cta_events.append(ac)
                        if ac.get("cta_id"):
                            session.analytics.ctas_shown.append(ac["cta_id"])

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tc.id,
                "content": json.dumps(result, default=str),
            })

        current_messages.append({"role": "user", "content": tool_results})

        # Continue the conversation with tool results
        response = await create_message(
            system=system,
            messages=current_messages,
            tools=tools,
            max_tokens=1024,
        )
        full_text = ""  # Reset — the new response contains the final text

    # Extract final text from last response
    final_text = ""
    for block in response.content:
        if block.type == "text":
            final_text += block.text
    if final_text:
        full_text = final_text

    # 8. Record assistant turn
    session.add_turn("assistant", full_text, turn_metadata)

    # 9. Check for flow completion
    if flow_engine.is_flow_terminal(session):
        session.analytics.flow_completed = True

    await save_session(session)

    # 10. Analytics logging
    log_turn_event(
        session_id=session.session_id,
        turn_number=session.turn_count,
        intent=session.intent.primary.value if session.intent.primary else None,
        tools_called=turn_metadata.tools_called,
        cta_shown=turn_metadata.cta_shown,
    )
    if flow_engine.is_flow_terminal(session):
        log_conversation_end(session)

    return full_text, cta_events, turn_metadata


@router.post("/chat")
async def chat(request: ChatRequest):
    """Main chat endpoint — returns SSE stream."""
    # Get or create session
    session: SessionState | None = None
    if request.session_id:
        session = await get_session(request.session_id)

    if session is None:
        session = await create_session(request.session_id)

    # Update page context
    if request.page_context:
        session.page_context = PageContext(**request.page_context)

    # Store user profile on session for system prompt injection
    if request.user_profile:
        session.user_profile = request.user_profile
        # Pre-fill slots from profile preferences
        profile = request.user_profile
        if profile.get("preferred_program") and profile["preferred_program"] != "not_sure":
            program_map = {"qantas": "Qantas", "velocity": "Velocity", "krisflyer": "KrisFlyer"}
            mapped = program_map.get(profile["preferred_program"])
            if mapped and not session.slots.airline_preference:
                session.slots.airline_preference = mapped
        if profile.get("home_city") and not session.slots.origin:
            session.slots.origin = profile["home_city"]
        if profile.get("travel_goal"):
            goal_map = {"business": "business", "economy": "economy", "flexible": "flexible"}
            mapped_cabin = goal_map.get(profile["travel_goal"])
            if mapped_cabin and not session.slots.cabin_class:
                session.slots.cabin_class = mapped_cabin

    # Generate greeting if first message
    is_first_turn = session.turn_count == 0 and len(session.conversation) == 0
    if is_first_turn:
        greeting = flow_engine.get_greeting(session)
        session.add_turn("assistant", greeting)
        await save_session(session)

    async def event_generator():
        try:
            # Send greeting first if this is a new session
            if is_first_turn:
                greeting = session.conversation[0].content
                greeting_suggestions = generate_suggestions(session)
                yield {
                    "event": "text_delta",
                    "data": json.dumps({"type": "text_delta", "content": greeting}),
                }
                yield {
                    "event": "done",
                    "data": json.dumps({
                        "type": "done",
                        "session_id": session.session_id,
                        "greeting": True,
                        "suggestions": greeting_suggestions,
                    }),
                }

            # Process the user's message
            result = await _process_chat(session, request.message)
            text, cta_events, metadata = result

            # Stream text
            if text:
                yield {
                    "event": "text_delta",
                    "data": json.dumps({"type": "text_delta", "content": text}),
                }

            # Send CTA events
            if cta_events:
                for cta in cta_events:
                    yield {
                        "event": "cta",
                        "data": json.dumps({"type": "cta", "content": cta}),
                    }

            # Generate contextual suggestions for next turn
            suggestions = generate_suggestions(session)

            # Done event with suggestions
            yield {
                "event": "done",
                "data": json.dumps({
                    "type": "done",
                    "session_id": session.session_id,
                    "suggestions": suggestions,
                }),
            }

        except Exception as e:
            logger.error("Chat error: %s", e, exc_info=True)
            yield {
                "event": "text_delta",
                "data": json.dumps({
                    "type": "text_delta",
                    "content": "I'm having a bit of trouble right now. You can browse our guides at https://www.pointhacks.com.au/guides/ or try again shortly.",
                }),
            }
            yield {
                "event": "done",
                "data": json.dumps({"type": "done", "session_id": session.session_id, "error": True}),
            }

    return EventSourceResponse(event_generator())

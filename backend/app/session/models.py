from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class Intent(str, Enum):
    LEARNING = "LEARNING"
    CARD_MATCH = "CARD_MATCH"
    SEAT_ALERTS = "SEAT_ALERTS"
    ARTICLE_FOLLOWUP = "ARTICLE_FOLLOWUP"
    OTHER = "OTHER"


class FlowStep(str, Enum):
    # CARD_MATCH
    CM_CONFIRM_GOAL = "CM_CONFIRM_GOAL"
    CM_COLLECT_SLOTS = "CM_COLLECT_SLOTS"
    CM_ESTIMATE_POINTS = "CM_ESTIMATE_POINTS"
    CM_RECOMMEND_CARDS = "CM_RECOMMEND_CARDS"
    CM_PRESENT_CTA = "CM_PRESENT_CTA"
    CM_COMPLETE = "CM_COMPLETE"
    # SEAT_ALERTS
    SA_CONFIRM_ROUTE = "SA_CONFIRM_ROUTE"
    SA_COLLECT_DETAILS = "SA_COLLECT_DETAILS"
    SA_EXPLAIN_AND_CTA = "SA_EXPLAIN_AND_CTA"
    SA_BRIDGE_CHECK = "SA_BRIDGE_CHECK"
    SA_COMPLETE = "SA_COMPLETE"
    # LEARNING
    LN_REASSURE = "LN_REASSURE"
    LN_DISCOVER = "LN_DISCOVER"
    LN_EDUCATE = "LN_EDUCATE"
    LN_EMAIL_CTA = "LN_EMAIL_CTA"
    LN_BRIDGE = "LN_BRIDGE"
    LN_COMPLETE = "LN_COMPLETE"
    # ARTICLE_FOLLOWUP
    AF_ANSWER = "AF_ANSWER"
    AF_PROBE = "AF_PROBE"
    AF_COMPLETE = "AF_COMPLETE"
    # OTHER
    OT_DEFLECT = "OT_DEFLECT"
    OT_COMPLETE = "OT_COMPLETE"
    # Clarify
    CLARIFY = "CLARIFY"


class PageContext(BaseModel):
    page_url: str = ""
    page_type: str = "other"  # homepage|card_review|article|seat_alerts|guide|other
    page_title: str = ""
    device: str = "desktop"  # mobile|desktop|tablet
    referrer: str | None = None
    is_returning_visitor: bool = False


class TurnMetadata(BaseModel):
    intent_detected: str | None = None
    slots_extracted: dict[str, Any] | None = None
    cta_shown: str | None = None
    tools_called: list[str] = Field(default_factory=list)


class ConversationTurn(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: TurnMetadata = Field(default_factory=TurnMetadata)


class SlotData(BaseModel):
    destination: str | None = None
    origin: str | None = "Sydney"
    travellers: int | None = None
    airline_preference: str | None = None
    current_points: int | None = None
    points_program: str | None = None
    travel_timing: str | None = None
    trip_type: str | None = None
    cabin_class: str | None = None
    card_preferences: list[str] = Field(default_factory=list)
    date_range_start: str | None = None
    date_range_end: str | None = None
    email: str | None = None
    # LEARNING-specific
    program_interest: str | None = None
    focus: str | None = None


class IntentState(BaseModel):
    primary: Intent | None = None
    confidence: float = 0.0
    classified_at_turn: int | None = None


class FlowState(BaseModel):
    current_flow: str | None = None
    current_step: FlowStep | None = None
    steps_completed: list[str] = Field(default_factory=list)
    awaiting_slots: list[str] = Field(default_factory=list)


class Analytics(BaseModel):
    ctas_shown: list[str] = Field(default_factory=list)
    ctas_clicked: list[str] = Field(default_factory=list)
    cards_recommended: list[str] = Field(default_factory=list)
    flow_completed: bool = False
    handover_count: int = 0
    handover_history: list[str] = Field(default_factory=list)


class SessionState(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    last_active: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    ttl_seconds: int = 1800

    intent: IntentState = Field(default_factory=IntentState)
    flow_state: FlowState = Field(default_factory=FlowState)
    slots: SlotData = Field(default_factory=SlotData)
    page_context: PageContext = Field(default_factory=PageContext)

    conversation: list[ConversationTurn] = Field(default_factory=list)
    turn_count: int = 0

    analytics: Analytics = Field(default_factory=Analytics)
    off_topic_count: int = 0
    clarification_asked: bool = False
    user_profile: dict[str, Any] | None = None

    def recent_history(self, n: int = 10) -> list[ConversationTurn]:
        return self.conversation[-n:]

    def add_turn(self, role: str, content: str, metadata: TurnMetadata | None = None) -> None:
        self.conversation.append(
            ConversationTurn(
                role=role,
                content=content,
                metadata=metadata or TurnMetadata(),
            )
        )
        if role == "user":
            self.turn_count += 1
        self.last_active = datetime.now(timezone.utc).isoformat()

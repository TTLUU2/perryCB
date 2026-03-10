"""
Generate contextual suggested topic buttons after each assistant message.

Rules:
- 2-4 suggestions per turn
- Always include at least 1 NBA (next best action) that drives conversion
- NBAs: card guide links, credit card index, card value calculator
- Topics should be contextual to current flow state and collected slots
- Fallback always includes credit card index
"""

from __future__ import annotations

from app.session.models import FlowStep, Intent, SessionState

# Conversion-driving NBAs (always try to include one)
CARD_NBAS = [
    {"label": "Find the best card for me", "action": "find_best_card", "type": "nba"},
    {"label": "Compare credit cards", "action": "compare_cards", "type": "nba", "url": "https://www.pointhacks.com.au/tools-calculators/credit-cards-master-table/"},
    {"label": "Card Value Calculator", "action": "card_calculator", "type": "nba", "url": "https://www.pointhacks.com.au/card-value-calculator-intro/"},
    {"label": "Browse all credit card offers", "action": "browse_cards", "type": "nba", "url": "https://www.pointhacks.com.au/credit-cards/"},
]

SEAT_ALERT_NBA = {"label": "Subscribe to reward seat alerts", "action": "seat_alerts", "type": "nba", "url": "https://seat-alerts.pointhacks.com.au/"}

PROGRAM_CARD_GUIDES = {
    "qantas": {"label": "Best Qantas cards", "action": "qantas_cards", "type": "nba", "url": "https://www.pointhacks.com.au/credit-cards/qantas-frequent-flyer-cards/"},
    "velocity": {"label": "Best Velocity cards", "action": "velocity_cards", "type": "nba", "url": "https://www.pointhacks.com.au/credit-cards/velocity-frequent-flyer-cards/"},
    "krisflyer": {"label": "Best KrisFlyer cards", "action": "krisflyer_cards", "type": "nba", "url": "https://www.pointhacks.com.au/credit-cards/singapore-airlines-krisflyer/"},
}

# Fallback suggestions when nothing contextual fits
FALLBACK_SUGGESTIONS = [
    {"label": "Help me choose a card", "action": "choose_card", "type": "query"},
    {"label": "Browse all credit cards", "action": "browse_cards", "type": "nba", "url": "https://www.pointhacks.com.au/credit-cards/"},
    {"label": "How do points work?", "action": "how_points_work", "type": "query"},
    SEAT_ALERT_NBA,
]


def _program_card_suggestion(program: str | None) -> dict | None:
    """Return a program-specific 'Show me top X cards' suggestion, or None."""
    if not program:
        return None
    label_map = {
        "qantas": "Show me top Qantas cards",
        "velocity": "Show me top Velocity cards",
        "krisflyer": "Show me top KrisFlyer cards",
    }
    label = label_map.get(program.lower())
    if label:
        return {"label": label, "action": "choose_card", "type": "query"}
    return None


def generate_suggestions(session: SessionState) -> list[dict]:
    """Generate 2-4 contextual suggested topics for the current conversation state."""
    suggestions: list[dict] = []
    intent = session.intent.primary
    step = session.flow_state.current_step
    slots = session.slots

    # --- Pre-intent (greeting / clarification) ---
    if intent is None or step == FlowStep.CLARIFY:
        # Use program-specific card suggestion if profile pre-filled airline_preference
        card_suggestion = _program_card_suggestion(slots.airline_preference)
        return [
            card_suggestion or {"label": "Help me choose a credit card", "action": "choose_card", "type": "query"},
            {"label": "I'm new to points", "action": "new_to_points", "type": "query"},
            SEAT_ALERT_NBA,
            {"label": "Browse all credit cards", "action": "browse_cards", "type": "nba", "url": "https://www.pointhacks.com.au/credit-cards/"},
        ]

    # --- CARD_MATCH flow ---
    if intent == Intent.CARD_MATCH:
        if step in (FlowStep.CM_CONFIRM_GOAL, FlowStep.CM_COLLECT_SLOTS):
            # Collecting info — suggest slot-filling answers + an NBA
            if not slots.airline_preference:
                suggestions.append({"label": "Qantas points", "action": "slot:airline_preference=qantas", "type": "query"})
                suggestions.append({"label": "Velocity points", "action": "slot:airline_preference=velocity", "type": "query"})
                suggestions.append({"label": "Not sure yet", "action": "slot:airline_preference=flexible", "type": "query"})
            elif not slots.cabin_class:
                suggestions.append({"label": "Business class", "action": "slot:cabin_class=business", "type": "query"})
                suggestions.append({"label": "Economy", "action": "slot:cabin_class=economy", "type": "query"})
                suggestions.append({"label": "I'm flexible", "action": "slot:cabin_class=economy", "type": "query"})
            elif slots.current_points is None:
                suggestions.append({"label": "I have no points yet", "action": "slot:current_points=0", "type": "query"})
                suggestions.append({"label": "I have some points", "action": "tell_points", "type": "query"})
            # Add program-specific NBA
            if slots.airline_preference and slots.airline_preference in PROGRAM_CARD_GUIDES:
                suggestions.append(PROGRAM_CARD_GUIDES[slots.airline_preference])
            else:
                suggestions.append(CARD_NBAS[0])  # "Find the best card for me"

        elif step in (FlowStep.CM_ESTIMATE_POINTS, FlowStep.CM_RECOMMEND_CARDS):
            suggestions.append({"label": "Tell me more about that card", "action": "more_details", "type": "query"})
            suggestions.append({"label": "Show me other options", "action": "other_options", "type": "query"})
            if slots.airline_preference and slots.airline_preference in PROGRAM_CARD_GUIDES:
                suggestions.append(PROGRAM_CARD_GUIDES[slots.airline_preference])
            suggestions.append(CARD_NBAS[1])  # Compare cards

        elif step in (FlowStep.CM_PRESENT_CTA, FlowStep.CM_COMPLETE):
            suggestions.append(SEAT_ALERT_NBA)
            suggestions.append({"label": "Compare more cards", "action": "compare_cards", "type": "nba", "url": "https://www.pointhacks.com.au/tools-calculators/credit-cards-master-table/"})
            suggestions.append({"label": "Card Value Calculator", "action": "card_calculator", "type": "nba", "url": "https://www.pointhacks.com.au/card-value-calculator-intro/"})

    # --- SEAT_ALERTS flow ---
    elif intent == Intent.SEAT_ALERTS:
        if step in (FlowStep.SA_CONFIRM_ROUTE, FlowStep.SA_COLLECT_DETAILS):
            suggestions.append({"label": "Business class", "action": "slot:cabin_class=business", "type": "query"})
            suggestions.append({"label": "Economy class", "action": "slot:cabin_class=economy", "type": "query"})
            suggestions.append(CARD_NBAS[0])  # Find best card

        elif step in (FlowStep.SA_EXPLAIN_AND_CTA, FlowStep.SA_BRIDGE_CHECK):
            suggestions.append({"label": "I need more points", "action": "need_more_points", "type": "query"})
            suggestions.append({"label": "I have enough points", "action": "enough_points", "type": "query"})
            suggestions.append(CARD_NBAS[3])  # Browse all cards

        elif step == FlowStep.SA_COMPLETE:
            suggestions.append({"label": "Help me earn more points", "action": "earn_points", "type": "query"})
            suggestions.append(CARD_NBAS[2])  # Card Value Calculator

    # --- LEARNING flow ---
    elif intent == Intent.LEARNING:
        if step in (FlowStep.LN_REASSURE, FlowStep.LN_DISCOVER):
            suggestions.append({"label": "Qantas Frequent Flyer", "action": "slot:program_interest=qantas", "type": "query"})
            suggestions.append({"label": "Velocity (Virgin)", "action": "slot:program_interest=velocity", "type": "query"})
            suggestions.append({"label": "Not sure yet", "action": "slot:program_interest=unsure", "type": "query"})
            suggestions.append({"label": "Start Earning Points guide", "action": "guide_earning", "type": "nba", "url": "https://www.pointhacks.com.au/guides/first-principles-earning-points/"})

        elif step == FlowStep.LN_EDUCATE:
            if slots.program_interest == "qantas" or slots.airline_preference == "qantas":
                suggestions.append(PROGRAM_CARD_GUIDES["qantas"])
            elif slots.program_interest == "velocity" or slots.airline_preference == "velocity":
                suggestions.append(PROGRAM_CARD_GUIDES["velocity"])
            suggestions.append({"label": "How do I earn points?", "action": "how_earn", "type": "query"})
            suggestions.append({"label": "What are points worth?", "action": "points_value", "type": "query"})
            suggestions.append(CARD_NBAS[2])  # Card Value Calculator

        elif step in (FlowStep.LN_EMAIL_CTA, FlowStep.LN_BRIDGE, FlowStep.LN_COMPLETE):
            # Use program-specific suggestion if program is known
            card_chip = _program_card_suggestion(slots.program_interest) or _program_card_suggestion(slots.airline_preference)
            suggestions.append(card_chip or {"label": "Help me choose a card", "action": "choose_card", "type": "query"})
            suggestions.append(SEAT_ALERT_NBA)
            suggestions.append(CARD_NBAS[3])  # Browse all cards

    # --- ARTICLE_FOLLOWUP flow ---
    elif intent == Intent.ARTICLE_FOLLOWUP:
        # Use program-specific suggestion if airline_preference is known
        card_chip = _program_card_suggestion(slots.airline_preference)
        suggestions.append(card_chip or {"label": "Help me choose a card", "action": "choose_card", "type": "query"})
        suggestions.append({"label": "Tell me more about this", "action": "more_info", "type": "query"})
        if slots.airline_preference and slots.airline_preference in PROGRAM_CARD_GUIDES:
            suggestions.append(PROGRAM_CARD_GUIDES[slots.airline_preference])
        else:
            suggestions.append(CARD_NBAS[3])  # Browse all cards

    # --- OTHER flow ---
    elif intent == Intent.OTHER:
        suggestions.append({"label": "Help me choose a credit card", "action": "choose_card", "type": "query"})
        suggestions.append({"label": "I'm new to points", "action": "new_to_points", "type": "query"})
        suggestions.append(CARD_NBAS[3])  # Browse all cards

    # Ensure we always have at least one NBA
    if suggestions and not any(s.get("type") == "nba" for s in suggestions):
        suggestions.append(CARD_NBAS[3])  # Fallback: Browse all credit cards

    # Fallback if empty
    if not suggestions:
        return FALLBACK_SUGGESTIONS[:4]

    return suggestions[:4]

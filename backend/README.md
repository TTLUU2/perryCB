# Points Genie — Backend

FastAPI backend powering the Points Genie chatbot. Handles conversation orchestration, intent classification, slot extraction, tool calling, and response generation via Claude Sonnet 4.5.

## Quick Start

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (see below)
cp .env.example .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude Sonnet 4.5 |
| `REDIS_URL` | No | Redis connection string (defaults to in-memory fallback) |
| `LOG_LEVEL` | No | Logging level (default: `INFO`) |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Main chat endpoint (SSE stream) |
| `GET` | `/api/session/:id` | Get session state (debug) |
| `POST` | `/api/session/:id/reset` | Clear session |
| `POST` | `/api/session/:id/cta-click` | Track CTA click event |
| `GET` | `/api/health` | Health check (includes card data freshness) |
| `GET` | `/api/admin/stale-cards` | List cards needing data refresh (>24h old) |

### POST /api/chat — Request Body

```json
{
  "session_id": "uuid | null",
  "message": "user message text",
  "page_context": {
    "page_url": "https://www.pointhacks.com.au/...",
    "page_type": "homepage | card_review | article | seat_alerts | guide | other",
    "device": "mobile | desktop | tablet"
  },
  "user_profile": {
    "name": "Alex",
    "preferred_program": "qantas | velocity | krisflyer | not_sure",
    "travel_goal": "business | economy | flexible",
    "max_annual_fee": "no_fee | under_200 | under_500 | any",
    "home_city": "Melbourne"
  }
}
```

### SSE Response Events

```
data: {"type": "text_delta", "content": "Here are "}
data: {"type": "text_delta", "content": "my top picks..."}
data: {"type": "cta", "content": {"cta_type": "card_application", ...}}
data: {"type": "done", "content": {"session_id": "...", "suggestions": [...]}}
```

## Project Structure

```
backend/
  app/
    main.py                    # FastAPI app, startup, middleware, CORS
    config.py                  # Settings (env vars, Pydantic Settings)
    analytics.py               # Event logging
    api/
      chat.py                  # POST /api/chat — main conversation endpoint
      session.py               # Session CRUD endpoints
    engine/
      intent.py                # Intent classification via LLM
      slots.py                 # Slot extraction from user messages
      flow_engine.py           # State machine orchestrator
      suggestions.py           # Next-best-action suggestion generation
      flows/                   # Individual flow implementations
    llm/
      client.py                # Anthropic SDK wrapper
      system_prompt.py         # System prompt builder with session context injection
      tools.py                 # Tool definitions for Claude function calling
    knowledge/
      cards.py                 # Card lookup and filtering
      cta.py                   # CTA directory lookup
      points.py                # Points requirement estimates
      search.py                # Knowledge base search
    session/
      manager.py               # Redis session manager (with in-memory fallback)
      models.py                # Pydantic models (SessionState, Slots, etc.)
    data/
      cards.json               # 24 credit cards (source of truth)
      ctas.json                # CTA directory
      points_requirements.json # Route-based points estimates
      freshness.py             # 24-hour card data freshness checker
      knowledge/               # Markdown knowledge files
  tests/
    test_intent.py             # Intent classification tests
    test_flows.py              # Flow state machine tests
    test_tools.py              # Tool calling tests
    test_golden_transcripts.py # End-to-end golden path tests
  requirements.txt
```

## Running Tests

```bash
python3 -m pytest tests/ -q         # All tests (76 tests)
python3 -m pytest tests/ -v         # Verbose output
python3 -m pytest tests/test_intent.py  # Just intent tests
```

All 76 tests should pass. Zero failures expected.

## Architecture

### State Machine + LLM Hybrid

- **Deterministic state routing** controls flow progression (LEARNING, CARD_MATCH, SEAT_ALERTS, ARTICLE_FOLLOWUP, OTHER)
- **LLM (Claude Sonnet 4.5)** handles NLU, slot extraction, response generation
- The LLM never decides state transitions — it only fills slots and generates within the current state

### 4 Tools (Claude Function Calling)

| Tool | Purpose |
|---|---|
| `card_lookup` | Search/filter credit cards by program, fee, bonus, tags |
| `points_estimate` | Estimate points needed for a route + cabin class |
| `cta_lookup` | Get the right CTA (card application, seat alert, guide, email) |
| `knowledge_search` | Search knowledge base for verified information |

### Session Management

- **Redis** for production (Upstash), in-memory dict for local dev
- **30-minute TTL** on inactivity
- Conversation history capped at last 10 turns sent to LLM

### User Profile Integration

When `user_profile` is included in the chat request:
1. Stored on the session object
2. Pre-fills slots: `preferred_program` → `airline_preference`, `home_city` → `origin`, `travel_goal` → `cabin_class`
3. Injected as `<user_profile>` XML block in the system prompt so Perry can use name/preferences naturally

### Card Data Freshness (24-Hour Rule)

- `check_card_freshness()` runs at startup — logs WARNING for stale cards
- `GET /api/health` returns `card_data.fresh` boolean and `stale_count`
- `GET /api/admin/stale-cards` returns detailed list with hours since last update
- Cards must have `last_updated` within 24 hours

## Card Data

24 cards in `app/data/cards.json`:

| Program | Count |
|---|---|
| Qantas | 11 |
| Velocity | 7 |
| Amex MR | 3 |
| Flexible | 2 |
| KrisFlyer | 1 |

Some cards include a `bonus_structure` field describing split bonuses (e.g., "70,000 on spend + 30,000 in year 2"). The system prompt instructs Perry to always present the full breakdown when this field exists.

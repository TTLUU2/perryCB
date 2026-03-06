# Points Genie

AI chatbot for [Point Hacks](https://www.pointhacks.com.au) — Australia's leading frequent flyer points resource. Helps users choose credit cards, find reward seats, and learn about points through personalised, multi-turn conversations.

## Architecture

- **Backend:** Python 3.13 FastAPI with Anthropic Claude Sonnet 4.5 for NLU/generation
- **Frontend:** React 19 + TypeScript 5 + Tailwind CSS 3 embeddable chat widget
- **Pattern:** State Machine + LLM Hybrid (deterministic flow control, LLM for natural language)
- **Sessions:** Redis (with in-memory fallback for local dev)
- **Build:** Vite 6 (frontend), Uvicorn (backend)

### 5 Intent Flows

| Intent | Priority | Description |
|---|---|---|
| CARD_MATCH | 1 | Credit card recommendation with slot-filling |
| SEAT_ALERTS | 2 | Reward seat tracking setup |
| LEARNING | 3 | Beginner education and onboarding |
| ARTICLE_FOLLOWUP | 4 | Article/topic Q&A |
| OTHER | 5 | Off-topic deflection |

### 4 Tools

- `card_lookup` — Filter credit cards by program, fee, bonus, network (24 cards)
- `points_estimate` — Calculate points needed for a route/cabin
- `cta_lookup` — Get contextual CTAs (card applications, seat alerts, guides)
- `knowledge_search` — Search markdown knowledge base

### Frontend Features

- **Perry mascot** — Pixar-style cartoon plane SVG (front-facing, white body, big eyes, open smile)
- **Tools & Resources drawer** — Collapsible 2-column grid with 6 Point Hacks tool links
- **User preferences** — Profile panel (name, preferred program, travel goal, max fee, home city) saved to localStorage, sent to backend for system prompt personalisation
- **Saved recommendations** — Bookmark assistant messages, view in dedicated panel, localStorage persistence
- **Animated background** — Drifting clouds and mini plane silhouettes behind messages
- **Multi-view ChatPanel** — Header icons toggle between chat, profile, and saved views

### Component Tree

```
ChatWidget
  ├─ [Closed] FAB button (Perry 44px + label)
  └─ [Open] ChatPanel (view: 'chat' | 'profile' | 'saved')
       ├─ Header: Perry 44px | title | [saved★ badge] [profile👤] [close✕]
       ├─ ToolsDrawer (chat view only, collapsible)
       └─ Views:
            ├─ Chat → MessageList (animated bg) → MessageBubble (Perry 28px, bookmark) → SuggestedTopics → InputBar
            ├─ Profile → UserProfile form
            └─ Saved → SavedItems list
```

### Key Files

```
frontend/src/
  components/
    ChatWidget.tsx        — Root: open/close, wires hooks to ChatPanel
    ChatPanel.tsx         — Layout: header, view state, Tools/Profile/Saved/Chat
    MessageList.tsx       — Scrollable message area with animated cloud/plane background
    MessageBubble.tsx     — Message rendering, markdown, CTAs, bookmark button
    PerryIcon.tsx         — SVG mascot (Pixar-style cartoon plane)
    ToolsDrawer.tsx       — Collapsible 2x3 grid of Point Hacks tool links
    UserProfile.tsx       — Preferences form (radio groups, select, text inputs)
    SavedItems.tsx        — Bookmarked messages panel
    InputBar.tsx          — Text input + send button
    SuggestedTopics.tsx   — Suggestion chips
    cta/                  — CardRecommendation, SeatAlertLink, EmailCapture
  hooks/
    useChat.ts            — Core chat state, SSE streaming, message management
    useUserProfile.ts     — localStorage profile CRUD (pg_user_profile)
    useSavedItems.ts      — localStorage bookmark CRUD (pg_saved_items)
    usePageContext.ts     — Page URL, type, device detection
  services/
    api.ts                — HTTP client, SSE parsing, CTA tracking
  types/
    index.ts              — TypeScript interfaces (ChatMessage, UserProfile, SavedItem, etc.)
  styles/
    widget.css            — All widget styles, animations (clouds, planes, toast, drawer)

backend/app/
  main.py                 — FastAPI app, CORS, lifespan freshness check
  config.py               — Settings (API keys, Redis, model config)
  api/
    chat.py               — POST /api/chat endpoint, accepts user_profile
    session.py            — Session CRUD + CTA tracking endpoints
  engine/
    intent.py             — LLM-based intent classification
    flow_engine.py        — State machine per intent
    slots.py              — Slot extraction and merging
    suggestions.py        — Next-turn suggestion generation
  llm/
    client.py             — Async Anthropic client with retries
    system_prompt.py      — Perry system prompt + session context + user profile injection
    tools.py              — Tool definitions for Claude function calling
  knowledge/
    cards.py              — Card lookup, filtering, relaxed search
    cta.py                — CTA directory lookup
    points.py             — Points requirement estimates
    search.py             — Markdown knowledge base search
  session/
    manager.py            — Redis/in-memory session storage
    models.py             — Pydantic models (SessionState, SlotData, etc. + user_profile)
  data/
    cards.json            — 24 credit cards (Qantas, Velocity, Amex MR, KrisFlyer, flexible)
    freshness.py          — 24-hour card data staleness checker
    ctas.json             — CTA directory
    points_requirements.json
    knowledge/            — Markdown files (learning, programs, seat-alerts, redemptions)
  analytics.py            — Turn/conversation event logging
```

## Setup

### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server (proxies /api to backend)
npm run dev
```

Open http://localhost:5173 — the chat widget appears in the bottom-right corner.

### Running Tests

```bash
cd backend
python3 -m pytest tests/ -v  # 76 tests, all passing
```

```bash
cd frontend
npx tsc --noEmit  # TypeScript type check, zero errors
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |
| `LLM_MODEL` | No | `claude-sonnet-4-5-20250929` | Claude model ID |
| `LLM_TIMEOUT` | No | `10` | LLM request timeout (seconds) |
| `LLM_MAX_RETRIES` | No | `3` | Max retry attempts |
| `SESSION_TTL` | No | `1800` | Session TTL in seconds (30 min) |
| `LOG_LEVEL` | No | `INFO` | Logging level |
| `PORT` | No | `8000` | Server port (set automatically by Render) |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Main chat endpoint (SSE streaming). Accepts `user_profile` in body. |
| `GET` | `/api/session/:id` | Get session state (debug) |
| `POST` | `/api/session/:id/reset` | Reset session |
| `POST` | `/api/session/:id/cta-click` | Track CTA click |
| `GET` | `/api/health` | Health check (includes card data freshness) |
| `GET` | `/api/admin/stale-cards` | List cards needing data refresh (>24h old) |

### SSE Event Types

```
text_delta  — Streamed response text
cta         — Call-to-action component data
done        — Stream complete (includes session_id, suggestions)
```

### Chat Request Body

```json
{
  "session_id": "uuid | null",
  "message": "user message text",
  "page_context": { "page_url": "...", "page_type": "...", "device": "..." },
  "user_profile": {
    "name": "Alex",
    "preferred_program": "qantas",
    "travel_goal": "business",
    "max_annual_fee": "under_500",
    "home_city": "Melbourne"
  }
}
```

## Card Data (24 Cards)

Sourced from Point Hacks reviews as of 2026-02-27. Covers:
- **Qantas** (11): Qantas Amex Ultimate, NAB Qantas Sig, Westpac Altitude Qantas Black/Plat, Citi Premier Qantas, Qantas Money Plat, ANZ FF Black, Westpac Altitude Black, Bankwest Qantas Plat, Qudos Bank Plat, NAB Qantas Business Sig
- **Velocity** (7): Amex Velocity Business, NAB Rewards Plat Velocity, Amex Velocity Platinum, Westpac Altitude Velocity Plat, NAB Velocity Rewards Sig, ANZ Rewards Black, Amex Velocity Escape Plus
- **Amex MR / Flexible** (5): Amex Platinum Business (350k), Amex Platinum (200k), Amex Explorer, CommBank Ultimate Awards, Citi Prestige
- **KrisFlyer** (1): HSBC Star Alliance

### Data Freshness

A 24-hour freshness rule enforces that card data is kept current:
- **Startup:** Logs `WARNING` if any cards have `last_updated` older than 24 hours
- **`/api/health`:** Returns `card_data.fresh` boolean and `stale_count`
- **`/api/admin/stale-cards`:** Returns full list of stale cards with hours since update and review URLs

## Deployment

### Production (Render + Upstash Redis)

The app runs as a single Render Web Service that serves both the API (`/api/*`) and the built frontend static files from one URL — no CORS complexity.

**Architecture:**

```
User's browser → Render (FastAPI) → Anthropic (Claude)
                    ↕
              Upstash Redis (sessions)
```

- **Render** hosts the app — builds the Docker container (frontend + backend) from GitHub, serves it at a public URL
- **Anthropic Claude** is the LLM brain — handles intent classification, slot filling, and response generation
- **Upstash Redis** stores chat sessions — maintains conversation context across messages (30 min TTL)

**How it works:**

A multi-stage `Dockerfile` at the project root builds the frontend (Node 20), then copies the output into the backend's `static/` directory. FastAPI serves API routes at `/api/*` and the frontend SPA for everything else.

**Setup:**

1. Push to GitHub (repo: `TTLUU2/perryCB`)
2. Create a free Redis database on [Upstash](https://upstash.com) — copy the `rediss://` URL
3. Create a Web Service on [Render](https://render.com) — connect the GitHub repo
4. Render auto-detects `render.yaml` and the Docker runtime
5. Set secret env vars in the Render dashboard:
   - `ANTHROPIC_API_KEY` — from [Anthropic Console](https://console.anthropic.com/settings/keys)
   - `REDIS_URL` — Upstash Redis URL (format: `rediss://default:xxx@xxx.upstash.io:6379`)
6. Deploy — app is live at `https://<service-name>.onrender.com`

**Config files:**

| File | Purpose |
|---|---|
| `Dockerfile` (root) | Multi-stage build: Node frontend → Python backend + static files |
| `render.yaml` | Render service config, env var declarations |
| `backend/Dockerfile` | Backend-only Docker build (for local use) |

### Local Development

Backend and frontend run separately with hot-reload:

```bash
# Terminal 1 — Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend (proxies /api to backend)
cd frontend
npm run dev
```

Open http://localhost:5173.

### Local Docker Build

Test the production Docker build locally:

```bash
docker build -t points-genie .
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your_key \
  -e REDIS_URL=redis://localhost:6379 \
  points-genie
```

Open http://localhost:8000.

### Frontend Widget (CDN)

```bash
cd frontend
npm run build:widget
```

Produces `dist/widget/points-genie-widget.iife.js` and `dist/widget/points-genie-widget.css`.

Embed on any page:

```html
<link rel="stylesheet" href="https://cdn.example.com/points-genie-widget.css">
<div id="root"></div>
<script src="https://cdn.example.com/points-genie-widget.iife.js"></script>
```

## localStorage Keys

| Key | Purpose |
|---|---|
| `pg_session_id` | Current chat session ID |
| `pg_user_profile` | User preferences (name, program, goal, fee, city) |
| `pg_saved_items` | Bookmarked assistant messages |

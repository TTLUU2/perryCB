# Points Genie — Frontend

Chat widget for Point Hacks, built with React 19 + TypeScript 5 + Tailwind CSS 3. Embeds as a bottom-right floating button that expands into a 390x580px chat panel.

## Quick Start

```bash
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build
```

**Environment:** Expects the backend running at `http://localhost:8000` (configured in `src/services/api.ts`).

## Component Tree

```
ChatWidget                         # Open/closed state, wires hooks
  [Closed] FAB button + Perry icon
  [Open] ChatPanel                 # view: 'chat' | 'profile' | 'saved'
    Header                         # Perry icon, title, saved/profile/close buttons
    ToolsDrawer                    # Collapsible 2-column grid (chat view only)
    Chat view:
      MessageList                  # Animated background + message bubbles
        BackgroundScene            # Clouds, planes, sparkles, contrails, landmarks
        MessageBubble              # Individual messages (markdown, CTAs, bookmark)
      SuggestedTopics              # Suggestion chips from backend
      InputBar                     # Auto-growing textarea + send button
    Profile view:
      UserProfile                  # Preferences form (auto-saves to localStorage)
    Saved view:
      SavedItems                   # Bookmarked messages list
```

## Key Files

| File | Purpose |
|---|---|
| `src/components/ChatWidget.tsx` | Root component, open/close, hooks orchestration |
| `src/components/ChatPanel.tsx` | Main panel with header, view routing |
| `src/components/MessageList.tsx` | Message rendering + animated background scene |
| `src/components/MessageBubble.tsx` | Individual message: markdown, CTAs, bookmark button |
| `src/components/PerryIcon.tsx` | Perry mascot SVG (front-facing cartoon plane) |
| `src/components/ToolsDrawer.tsx` | Collapsible tool links panel |
| `src/components/UserProfile.tsx` | Profile form (name, program, goal, fee, city) |
| `src/components/SavedItems.tsx` | Saved recommendations panel |
| `src/components/InputBar.tsx` | Text input with auto-grow and send |
| `src/components/SuggestedTopics.tsx` | Suggestion chips |
| `src/hooks/useChat.ts` | Chat state, SSE streaming, message management |
| `src/hooks/useUserProfile.ts` | localStorage read/write for user profile |
| `src/hooks/useSavedItems.ts` | localStorage CRUD for bookmarked messages |
| `src/hooks/usePageContext.ts` | Captures current page URL, type, device |
| `src/services/api.ts` | API client (POST /api/chat with SSE) |
| `src/types/index.ts` | TypeScript interfaces (ChatMessage, UserProfile, SavedItem, etc.) |
| `src/styles/widget.css` | All widget styles (bubbles, animations, layout) |
| `index.html` | Landing page (Point Hacks-style test page) |

## Visual Design

### Message Bubbles

- **User messages:** Solid blue (`#1A56DB`), white text, `font-weight: 600`
- **Assistant messages:** Frosted glass — `rgba(255,255,255,0.72)` with `backdrop-filter: blur(10px)`, dark text, subtle border

### Animated Background

The message area has a multi-layer animated sky scene (`BackgroundScene` in `MessageList.tsx`):

| Layer | Count | Animation |
|---|---|---|
| Clouds | 5 variants | Drift right (`pg-drift-cloud`), varying speeds 35-55s |
| Mini planes | 3 | Fly right (`pg-fly-plane`), 18-24s, low opacity |
| Sparkles | 6 | Twinkle in/out (`pg-twinkle`), 3-4.5s |
| Contrails | 2 | Drift right (`pg-drift-contrail`), 14-18s |
| Landmark skyline | 5 | Gentle bob (`pg-landmark-bob`), 9-13s |

**Tourism landmarks** (bottom of message area): Sydney Opera House, Eiffel Tower, Big Ben, Tokyo Tower, Statue of Liberty. Very low opacity (`rgba(26,86,219,0.07)`).

### Perry Mascot

Front-facing Pixar-style cartoon plane SVG. White/cream body, big expressive eyes, open smile, captain's visor, rosy cheeks, spread wings. Uses Point Hacks blue palette.

## localStorage Keys

| Key | Type | Purpose |
|---|---|---|
| `pg_session_id` | `string` | Current chat session ID |
| `pg_user_profile` | `UserProfile` | User preferences (name, program, goal, fee, city) |
| `pg_saved_items` | `SavedItem[]` | Bookmarked assistant messages |

## Build Modes

- `npm run dev` — Vite dev server with HMR
- `npm run build` — Standard production build (`tsc && vite build`)
- `npm run build:widget` — IIFE widget build for CDN embed (`vite.widget.config.ts`)

## Tools Drawer Links

| Label | URL |
|---|---|
| Card Finder | `https://www.pointhacks.com.au/card-finder/` |
| Compare All Cards | `https://www.pointhacks.com.au/credit-cards/` |
| Best Frequent Flyer Deals | `https://www.pointhacks.com.au/best-frequent-flyer-deals` |
| Seat Alerts | `https://seat-alerts.pointhacks.com.au/` |
| Beginner Guides | `https://www.pointhacks.com.au/ultimate-guides` |
| Tools & Calculators | `https://www.pointhacks.com.au/tools-calculators` |

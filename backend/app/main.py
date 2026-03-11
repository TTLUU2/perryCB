import logging
import sys
from pathlib import Path

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.api.chat import router as chat_router
from app.api.session import router as session_router
from app.analytics import get_analytics_summary
from app.data.freshness import check_card_freshness, get_stale_card_details

settings = get_settings()

# Configure structured JSON logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    stream=sys.stdout,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: check card data freshness
    freshness = check_card_freshness()
    if not freshness["fresh"]:
        logger.warning(
            "ACTION REQUIRED: %d card(s) have stale data (>%dh). "
            "Review and update cards.json.",
            freshness["stale_count"],
            freshness["threshold_hours"],
        )
    yield


app = FastAPI(title="Points Genie API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(session_router, prefix="/api")


@app.get("/api/health")
async def health():
    freshness = check_card_freshness()
    return {
        "status": "ok",
        "version": "0.1.0",
        "card_data": {
            "fresh": freshness["fresh"],
            "total_cards": freshness["total_cards"],
            "stale_count": freshness["stale_count"],
            "hours_since_oldest_update": freshness["hours_since_oldest"],
            "threshold_hours": freshness["threshold_hours"],
        },
    }


@app.get("/api/admin/stale-cards")
async def stale_cards():
    """Returns details of cards that need updating (data older than 24h)."""
    stale = get_stale_card_details()
    freshness = check_card_freshness()
    return {
        "fresh": freshness["fresh"],
        "stale_cards": stale,
        "total_cards": freshness["total_cards"],
        "action": "Update last_updated field in cards.json after reviewing each card's current offer on Point Hacks."
        if stale
        else "All cards are up to date.",
    }


@app.get("/api/admin/analytics")
async def analytics():
    """Returns aggregated analytics counters from Redis."""
    return get_analytics_summary()


@app.get("/admin")
async def admin_dashboard():
    """Serves the visual analytics dashboard."""
    template_path = Path(__file__).parent / "templates" / "admin.html"
    return FileResponse(str(template_path), media_type="text/html")


# Serve frontend static files (must be after all API routes)
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
